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
import { lerp } from "@/lib/useScrollCard";
import { useIsMobile } from "@/lib/useIsMobile";

const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type PillKey = LocationCategory;

const pillKeys: PillKey[] = ["work", "art", "volunteer", "travel"];

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
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Animation range: rapid-fire pins fill over this many px of scroll.
  // The sentinel is taller to add a hold period after.
  const ANIM_RANGE = 600; // px of scroll for the rapid-fire animation

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = sentinelRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const scrollInto = -rect.top;
        // Progress 0→1 over ANIM_RANGE, then clamps at 1 for the hold period
        setProgress(Math.max(0, Math.min(1, scrollInto / ANIM_RANGE)));
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const isMobile = useIsMobile();
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [activePill, setActivePill] = useState<PillKey | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
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

  // Position tooltip relative to SVG coordinates, clamped to stay on-screen
  const setTooltipFromSvgCoords = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    const scrollContainer = mapScrollRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width / width;
    const scaleY = rect.height / height;
    let x = cx * scaleX;
    const y = cy * scaleY;
    // On mobile, account for horizontal scroll offset and clamp within visible area
    if (scrollContainer) {
      const scrollLeft = scrollContainer.scrollLeft;
      const visibleLeft = scrollLeft + 130; // half tooltip width
      const visibleRight = scrollLeft + scrollContainer.clientWidth - 130;
      x = Math.max(visibleLeft, Math.min(x, visibleRight));
    }
    setTooltipPos({ x, y });
  }, []);

  // On mobile, scroll the map container so it starts with Alaska off-screen left
  useEffect(() => {
    if (!isMobile || !mapScrollRef.current) return;
    // Scroll just enough to push Alaska barely off-screen left
    const el = mapScrollRef.current;
    const setScroll = () => {
      el.scrollLeft = el.scrollWidth * 0.12;
    };
    setScroll();
    const t1 = setTimeout(setScroll, 50);
    const t2 = setTimeout(setScroll, 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isMobile, worldData]);

  const handlePillClick = useCallback((key: PillKey) => {
    setActivePill((prev) => (prev === key ? null : key));
    setHoveredCluster(null);
    setHoveredPin(null);
  }, []);

  return (
    <div ref={sentinelRef} style={{ height: "calc(100vh + 600px + 80vh)", position: "relative" }}>
      <section
        id="map"
        className="px-0 sm:px-4"
        style={{
          position: "sticky",
          top: "calc(90px + env(safe-area-inset-top, 0px))",
          height: "calc(100vh - 90px - env(safe-area-inset-top, 0px))",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          ref={mapScrollRef}
          className="relative w-full max-w-[1200px]"
          style={{
            // During animation: no overflow capture, touches pass through for page scroll
            // After pills appear: horizontal scroll enabled for map panning
            overflowX: isMobile ? "auto" : "visible",
            overflowY: "visible",
            touchAction: isMobile ? (progress >= 0.99 ? "pan-x pan-y" : "pan-y") : "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
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
            className="h-auto"
            style={{
              maxHeight: isMobile ? "none" : "70vh",
              width: isMobile ? "180vw" : "100%",
              minWidth: isMobile ? "180vw" : undefined,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setHoveredPin(null);
                setHoveredCluster(null);
              }
            }}
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
              const isSingle = cluster.pins.length === 1;

              if (isSingle) {
                // Single pin — simple dot
                const pin = cluster.pins[0];
                const meta = categoryMeta[pin.category as LocationCategory] || { color: "#A89F95" };
                return (
                  <g
                    key={cluster.id}
                    className="cursor-pointer"
                    style={{ transformOrigin: `${cluster.cx}px ${cluster.cy}px` }}
                    onMouseEnter={() => {
                      setHoveredPin(pin);
                      setHoveredCluster(null);
                      setTooltipFromSvgCoords(cluster.cx, cluster.cy);
                    }}
                    onMouseLeave={() => { if (!isMobile) setHoveredPin(null); }}
                    onClick={() => {
                      setHoveredPin((prev) => prev?.id === pin.id ? null : pin);
                      setHoveredCluster(null);
                      setTooltipFromSvgCoords(cluster.cx, cluster.cy);
                    }}
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
                  onMouseEnter={() => {
                    setHoveredCluster(cluster);
                    setHoveredPin(null);
                    setTooltipFromSvgCoords(cluster.cx, cluster.cy);
                  }}
                  onMouseLeave={() => { if (!isMobile) setHoveredCluster(null); }}
                  onClick={() => {
                    setHoveredCluster((prev) => prev?.id === cluster.id ? null : cluster);
                    setHoveredPin(null);
                    setTooltipFromSvgCoords(cluster.cx, cluster.cy);
                  }}
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
                top: tooltipPos.y < 120 ? tooltipPos.y + 20 : tooltipPos.y - 12,
                transform: tooltipPos.y < 120 ? "translateX(-50%)" : "translate(-50%, -100%)",
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
          {hoveredCluster && (
            <div
              className="absolute pointer-events-none z-10 bg-warm-white rounded-xl shadow-lg px-5 py-4 max-w-[280px] border"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y < 120 ? tooltipPos.y + 20 : tooltipPos.y - 12,
                transform: tooltipPos.y < 120 ? "translateX(-50%)" : "translate(-50%, -100%)",
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

        </div>

        {/* Category pills — right below the map, space always reserved */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3 z-10"
          style={{
            opacity: progress >= 0.99 ? 1 : 0,
            pointerEvents: progress >= 0.99 ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
        >
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

        {/* Progress indicator — outside scroll container */}
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
