"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import {
  locations,
  categoryMeta,
  type Location,
  type LocationCategory,
} from "@/data/locations";
import { buildContentItems } from "@/data/content";
import { useScrollCard, lerp } from "@/lib/useScrollCard";

const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type PillKey = LocationCategory;

const pillKeys: PillKey[] = ["work", "art", "volunteer", "travel", "want-to-visit"];

// ── Clustering ──────────────────────────────────────────────────────

interface Pin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  category: string;
  dateRange: string | null;
  description: string | null;
  industries: string[] | null;
  /** Months from Jan 2013 for chronological sorting */
  sortKey: number;
}

interface Cluster {
  id: string;
  pins: Pin[];
  cx: number;
  cy: number;
  lat: number;
  lng: number;
}

function clusterPins(pins: Pin[], projection: (coords: [number, number]) => [number, number] | null, radius: number): Cluster[] {
  const projected = pins
    .map((pin) => {
      const coords = projection([pin.lng, pin.lat]);
      if (!coords) return null;
      return { pin, cx: coords[0], cy: coords[1] };
    })
    .filter(Boolean) as { pin: Pin; cx: number; cy: number }[];

  const used = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < projected.length; i++) {
    if (used.has(i)) continue;
    const group = [projected[i]];
    used.add(i);
    for (let j = i + 1; j < projected.length; j++) {
      if (used.has(j)) continue;
      const dx = projected[i].cx - projected[j].cx;
      const dy = projected[i].cy - projected[j].cy;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        group.push(projected[j]);
        used.add(j);
      }
    }
    const avgCx = group.reduce((s, g) => s + g.cx, 0) / group.length;
    const avgCy = group.reduce((s, g) => s + g.cy, 0) / group.length;
    clusters.push({
      id: group.map((g) => g.pin.id).join("|"),
      pins: group.map((g) => g.pin),
      cx: avgCx,
      cy: avgCy,
      lat: group[0].pin.lat,
      lng: group[0].pin.lng,
    });
  }
  return clusters;
}

// ── Component ───────────────────────────────────────────────────────

export default function MapSection() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const progress = useScrollCard(sentinelRef);

  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [activePill, setActivePill] = useState<PillKey | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<Pin | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Load world topology
  useEffect(() => {
    fetch(WORLD_TOPO_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const countries = feature(
          topo,
          topo.objects.countries as never
        ) as unknown as GeoJSON.FeatureCollection;
        setWorldData(countries);
      });
  }, []);

  const width = 960;
  const height = 500;

  const projection = useMemo(
    () => geoNaturalEarth1().scale(160).translate([width / 2, height / 2]),
    []
  );
  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  // Build chronologically sorted pins from content items
  const allPins = useMemo(() => {
    const items = buildContentItems();
    const pins: Pin[] = [];
    for (const item of items) {
      if (item.lat == null || item.lng == null) continue;
      if (item.source === "gallery") continue; // gallery moved to era sections
      pins.push({
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        label: item.label,
        category: item.category || "work",
        dateRange: item.dateRange,
        description: item.description,
        industries: item.industries,
        sortKey: parseSortKey(item.start || item.dateRange),
      });
    }
    // Deduplicate by city+category (content items can repeat locations)
    const seen = new Map<string, Pin>();
    for (const pin of pins) {
      const key = `${pin.lat.toFixed(2)},${pin.lng.toFixed(2)},${pin.category}`;
      if (!seen.has(key) || pin.sortKey < seen.get(key)!.sortKey) {
        seen.set(key, pin);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, []);

  // Filter pins by active pill
  const filteredPins = useMemo(() => {
    if (!activePill) return allPins;
    return allPins.filter((p) => p.category === activePill);
  }, [allPins, activePill]);

  // How many pins are visible based on scroll progress
  const visibleCount = Math.floor(progress * filteredPins.length);
  const visiblePins = filteredPins.slice(0, visibleCount);

  // Current date label during scroll
  const currentDateLabel = useMemo(() => {
    if (visiblePins.length === 0) return "";
    const last = visiblePins[visiblePins.length - 1];
    return last.dateRange || "";
  }, [visiblePins]);

  // Cluster visible pins
  const projectionFn = useCallback(
    (coords: [number, number]) => projection(coords),
    [projection]
  );
  const clusters = useMemo(
    () => clusterPins(visiblePins, projectionFn, 30),
    [visiblePins, projectionFn]
  );

  const setTooltipFromEvent = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handlePillClick = useCallback((key: PillKey) => {
    setActivePill((prev) => (prev === key ? null : key));
    setExpandedCluster(null);
    setHoveredCluster(null);
    setHoveredPin(null);
  }, []);

  const handleClusterClick = useCallback((cluster: Cluster) => {
    setExpandedCluster((prev) => (prev === cluster.id ? null : cluster.id));
  }, []);

  return (
    <div ref={sentinelRef} style={{ height: "150vh", position: "relative" }}>
      <section
        id="map"
        className="px-4"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div className="relative w-full max-w-[1200px]">
          {/* Date scrubber */}
          {currentDateLabel && progress > 0.01 && progress < 0.99 && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10 font-mono text-xs px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: "rgba(245, 240, 235, 0.9)",
                color: "var(--color-charcoal)",
                border: "1px solid rgba(45, 42, 38, 0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              {currentDateLabel}
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            style={{ maxHeight: "70vh" }}
          >
            {/* Country shapes */}
            {worldData?.features.map((feat, i) => (
              <path
                key={i}
                d={pathGenerator(feat) || ""}
                fill="rgba(45, 42, 38, 0.06)"
                stroke="rgba(45, 42, 38, 0.12)"
                strokeWidth={0.5}
              />
            ))}

            {/* Clusters / pins */}
            {clusters.map((cluster) => {
              const isExpanded = expandedCluster === cluster.id;
              const isSingle = cluster.pins.length === 1;

              if (isExpanded && !isSingle) {
                // Expanded: fan out individual pins
                const fanRadius = 18;
                return (
                  <g key={cluster.id}>
                    {cluster.pins.map((pin, i) => {
                      const angle = (i / cluster.pins.length) * Math.PI * 2 - Math.PI / 2;
                      const px = cluster.cx + Math.cos(angle) * fanRadius;
                      const py = cluster.cy + Math.sin(angle) * fanRadius;
                      const meta = categoryMeta[pin.category as LocationCategory] || { color: "#A89F95" };
                      return (
                        <g
                          key={pin.id}
                          className="cursor-pointer"
                          onMouseEnter={(e) => {
                            setHoveredPin(pin);
                            setTooltipFromEvent(e);
                          }}
                          onMouseLeave={() => setHoveredPin(null)}
                        >
                          <circle cx={px} cy={py} r={6} fill={meta.color} opacity={0.25} />
                          <circle
                            cx={px}
                            cy={py}
                            r={3.5}
                            fill={meta.color}
                            stroke="var(--color-cream)"
                            strokeWidth={1.5}
                          />
                        </g>
                      );
                    })}
                    {/* Close button */}
                    <circle
                      cx={cluster.cx}
                      cy={cluster.cy}
                      r={5}
                      fill="rgba(45, 42, 38, 0.3)"
                      className="cursor-pointer"
                      onClick={() => setExpandedCluster(null)}
                    />
                  </g>
                );
              }

              if (isSingle) {
                // Single pin — simple dot
                const pin = cluster.pins[0];
                const meta = categoryMeta[pin.category as LocationCategory] || { color: "#A89F95" };
                return (
                  <g
                    key={cluster.id}
                    className="cursor-pointer"
                    style={{ transformOrigin: `${cluster.cx}px ${cluster.cy}px` }}
                    onMouseEnter={(e) => {
                      setHoveredPin(pin);
                      setTooltipFromEvent(e);
                    }}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <circle cx={cluster.cx} cy={cluster.cy} r={6} fill={meta.color} opacity={0.2}>
                      <animate attributeName="r" from="2" to="6" dur="0.3s" fill="freeze" />
                      <animate attributeName="opacity" from="0" to="0.2" dur="0.3s" fill="freeze" />
                    </circle>
                    <circle
                      cx={cluster.cx}
                      cy={cluster.cy}
                      r={3.5}
                      fill={meta.color}
                      stroke="var(--color-cream)"
                      strokeWidth={1.5}
                    >
                      <animate attributeName="r" from="0" to="3.5" dur="0.3s" fill="freeze" />
                    </circle>
                  </g>
                );
              }

              // Multi-pin cluster — count badge
              const categories = new Set(cluster.pins.map((p) => p.category));
              const primaryCategory = cluster.pins[0].category as LocationCategory;
              const color = categoryMeta[primaryCategory]?.color || "#A89F95";
              return (
                <g
                  key={cluster.id}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredCluster(cluster);
                    setTooltipFromEvent(e);
                  }}
                  onMouseLeave={() => setHoveredCluster(null)}
                  onClick={() => handleClusterClick(cluster)}
                >
                  {/* Multi-category ring */}
                  {categories.size > 1 && (
                    <circle
                      cx={cluster.cx}
                      cy={cluster.cy}
                      r={14}
                      fill="none"
                      stroke="rgba(45, 42, 38, 0.15)"
                      strokeWidth={1}
                      strokeDasharray="3 2"
                    />
                  )}
                  <circle cx={cluster.cx} cy={cluster.cy} r={11} fill={color} opacity={0.15} />
                  <circle
                    cx={cluster.cx}
                    cy={cluster.cy}
                    r={8}
                    fill="var(--color-cream)"
                    stroke={color}
                    strokeWidth={1.5}
                  />
                  <text
                    x={cluster.cx}
                    y={cluster.cy + 3.5}
                    textAnchor="middle"
                    fontSize={8}
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                    fill={color}
                  >
                    {cluster.pins.length}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip — single pin */}
          {hoveredPin && !hoveredCluster && (
            <div
              className="absolute pointer-events-none z-10 bg-warm-white rounded-xl shadow-lg px-5 py-4 max-w-[260px] border"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 12,
                transform: "translate(-50%, -100%)",
                borderColor: "rgba(45, 42, 38, 0.08)",
              }}
            >
              <p className="font-serif font-bold text-base mb-0.5">
                {hoveredPin.label}
              </p>
              {hoveredPin.dateRange && (
                <p className="font-mono text-xs mb-1" style={{ color: "var(--color-muted)" }}>
                  {hoveredPin.dateRange}
                </p>
              )}
              {hoveredPin.industries && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {hoveredPin.industries.map((ind) => (
                    <span
                      key={ind}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: "rgba(196, 114, 90, 0.1)",
                        color: "var(--color-terracotta)",
                      }}
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              )}
              {hoveredPin.description && (
                <p className="text-xs leading-relaxed text-charcoal/70">
                  {hoveredPin.description}
                </p>
              )}
            </div>
          )}

          {/* Tooltip — cluster summary */}
          {hoveredCluster && !expandedCluster && (
            <div
              className="absolute pointer-events-none z-10 bg-warm-white rounded-xl shadow-lg px-5 py-4 max-w-[280px] border"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 12,
                transform: "translate(-50%, -100%)",
                borderColor: "rgba(45, 42, 38, 0.08)",
              }}
            >
              <p className="font-serif font-bold text-base mb-1">
                {hoveredCluster.pins.length} items
              </p>
              <div className="flex flex-col gap-1">
                {hoveredCluster.pins.slice(0, 5).map((pin) => {
                  const meta = categoryMeta[pin.category as LocationCategory] || { color: "#A89F95", label: pin.category };
                  return (
                    <div key={pin.id} className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="font-mono text-[10px] truncate">
                        {pin.label}
                      </span>
                    </div>
                  );
                })}
                {hoveredCluster.pins.length > 5 && (
                  <p className="font-mono text-[10px] text-charcoal/40">
                    +{hoveredCluster.pins.length - 5} more — click to expand
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Category pills */}
          <div className="absolute bottom-3 right-3 flex flex-col-reverse gap-1.5 z-10">
            {pillKeys.map((key) => {
              const meta = categoryMeta[key];
              const isActive = activePill === key;
              const dimmed = activePill !== null && !isActive;
              return (
                <button
                  key={key}
                  onClick={() => handlePillClick(key)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] transition-all duration-300 border backdrop-blur-sm"
                  style={{
                    borderColor: dimmed ? "var(--color-muted)" : meta.color,
                    backgroundColor: isActive
                      ? `${meta.color}20`
                      : "rgba(245, 240, 235, 0.8)",
                    color: dimmed ? "var(--color-muted)" : meta.color,
                    opacity: dimmed ? 0.35 : 1,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: dimmed ? "var(--color-muted)" : meta.color,
                    }}
                  />
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Progress indicator */}
          {progress > 0.01 && progress < 0.99 && (
            <div className="absolute bottom-3 left-3 z-10">
              <div
                className="font-mono text-[10px] px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(245, 240, 235, 0.8)",
                  color: "var(--color-muted)",
                  border: "1px solid rgba(45, 42, 38, 0.08)",
                }}
              >
                {visibleCount} / {filteredPins.length}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/** Parse a date string into a sortable month number (months from Jan 2013) */
function parseSortKey(dateStr: string | null): number {
  if (!dateStr) return 0;
  const match = dateStr.match(
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/
  );
  if (match) {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const monthName = dateStr.match(
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/
    )![0];
    const year = parseInt(match[1]);
    return (year - 2013) * 12 + months[monthName];
  }
  // Try plain year
  const yearMatch = dateStr.match(/(\d{4})/);
  if (yearMatch) return (parseInt(yearMatch[1]) - 2013) * 12;
  return 0;
}
