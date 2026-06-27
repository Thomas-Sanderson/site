"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import { categoryMeta, type LocationCategory } from "@/data/locations";
import { buildContentItems } from "@/data/content";
import galleryData from "@/data/gallery.json";
import { useInView } from "@/lib/useInView";
import { useIsMobile } from "@/lib/useIsMobile";
import MapGallery, { type GalleryStop } from "@/components/MapGallery";

const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type PillKey = LocationCategory;

const pillKeys: PillKey[] = ["live", "work", "art", "travel"];

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
  city: string | null;
  /** One photo per dot — real where the location matches gallery.json, else null. */
  photo: { src: string; alt: string } | null;
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

/** Project pins and push overlapping dots apart so they form loose clusters */
function spreadPins(pins: Pin[], projection: (coords: [number, number]) => [number, number] | null, minDist: number): Cluster[] {
  const projected = pins
    .map((pin) => {
      const coords = projection([pin.lng, pin.lat]);
      if (!coords) return null;
      return { pin, cx: coords[0], cy: coords[1] };
    })
    .filter(Boolean) as { pin: Pin; cx: number; cy: number }[];

  // Force-push iterations: nudge overlapping dots apart
  for (let iter = 0; iter < 8; iter++) {
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[j].cx - projected[i].cx;
        const dy = projected[j].cy - projected[i].cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist && dist > 0) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          projected[i].cx -= nx * push;
          projected[i].cy -= ny * push;
          projected[j].cx += nx * push;
          projected[j].cy += ny * push;
        } else if (dist === 0) {
          // Identical positions — nudge randomly
          projected[j].cx += minDist * 0.5;
          projected[j].cy += minDist * 0.3;
        }
      }
    }
  }

  // Each pin becomes its own "cluster" (single-pin) for rendering
  return projected.map((p) => ({
    id: p.pin.id,
    pins: [p.pin],
    cx: p.cx,
    cy: p.cy,
    lat: p.pin.lat,
    lng: p.pin.lng,
  }));
}

// ── Component ───────────────────────────────────────────────────────

export default function MapSection() {
  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.3,
    once: true,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);

  // Pin-fill animation: plays once when the map scrolls into view. Time-based
  // (not scroll-based) so there's no scroll hijacking.
  useEffect(() => {
    if (!inView) return;
    const DURATION = 2200; // ms to reveal all pins
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / DURATION);
      setProgress(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const isMobile = useIsMobile();
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [activePill, setActivePill] = useState<PillKey | null>(null);
  const [hoveredPin, setHoveredPin] = useState<Pin | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Gallery modal state + the dot that triggered it (for focus return).
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const triggerRef = useRef<SVGGElement | null>(null);

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
  // Mobile: cropped viewBox centered on Americas/Atlantic (no horizontal scroll)
  const MOBILE_VB_X = 100;
  const MOBILE_VB_W = 550;

  const projection = useMemo(
    () => geoNaturalEarth1().scale(160).translate([width / 2, height / 2]),
    []
  );
  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  // city (lowercased token) → first gallery photo for that city
  const photoByCity = useMemo(() => {
    const map = new Map<string, { src: string; alt: string }>();
    for (const img of galleryData as { cropped: string; location?: string }[]) {
      if (!img.location) continue;
      const city = normCity(img.location);
      if (!map.has(city)) {
        map.set(city, { src: `/images/gallery/${img.cropped}`, alt: img.location });
      }
    }
    return map;
  }, []);

  // Build chronologically sorted pins from content items, each with one photo.
  const allPins = useMemo(() => {
    const items = buildContentItems();
    const pins: Pin[] = [];
    for (const item of items) {
      if (item.lat == null || item.lng == null) continue;
      if (item.source === "gallery") continue; // gallery photos placed via their own dots
      if (item.source === "timeline" && item.label?.startsWith("Columbia University")) continue; // already in locations.ts
      const cityKey = item.city ? normCity(item.city) : "";
      const photo = cityKey ? photoByCity.get(cityKey) ?? null : null;
      pins.push({
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        label: item.label,
        category: item.category || "work",
        dateRange: item.dateRange,
        description: item.description,
        industries: item.industries,
        city: item.city,
        photo,
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
  }, [photoByCity]);

  // Filter pins by active pill
  const filteredPins = useMemo(() => {
    if (!activePill) return allPins;
    return allPins.filter((p) => p.category === activePill);
  }, [allPins, activePill]);

  // Gallery sequence = the currently-shown dots, in chronological order.
  const galleryStops: GalleryStop[] = useMemo(
    () =>
      filteredPins.map((p) => ({
        id: p.id,
        label: p.label,
        dateRange: p.dateRange,
        photo: p.photo,
        annotation: null,
      })),
    [filteredPins]
  );
  const stopIndexById = useMemo(() => {
    const m = new Map<string, number>();
    filteredPins.forEach((p, i) => m.set(p.id, i));
    return m;
  }, [filteredPins]);

  const openGallery = useCallback(
    (pinId: string, el: SVGGElement) => {
      const i = stopIndexById.get(pinId);
      if (i == null) return;
      triggerRef.current = el;
      setHoveredPin(null);
      setGalleryIndex(i);
    },
    [stopIndexById]
  );
  const closeGallery = useCallback(() => {
    setGalleryIndex(null);
    triggerRef.current?.focus?.();
  }, []);

  // How many pins are visible based on animation progress
  const visibleCount = Math.floor(progress * filteredPins.length);
  const visiblePins = filteredPins.slice(0, visibleCount);

  // Current year label during the fill — extract just the year
  const currentDateLabel = useMemo(() => {
    if (visiblePins.length === 0) return "";
    const last = visiblePins[visiblePins.length - 1];
    const dr = last.dateRange || "";
    const match = dr.match(/\d{4}/);
    return match ? match[0] : "";
  }, [visiblePins]);

  // Cluster visible pins
  const projectionFn = useCallback(
    (coords: [number, number]) => projection(coords),
    [projection]
  );
  const clusters = useMemo(
    () => spreadPins(visiblePins, projectionFn, 14),
    [visiblePins, projectionFn]
  );

  // Position tooltip relative to SVG coordinates, clamped to stay on-screen
  const setTooltipFromSvgCoords = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const tooltipHalf = 130;
    if (isMobile) {
      const scaleX = rect.width / MOBILE_VB_W;
      const scaleY = rect.height / height;
      const x = Math.max(tooltipHalf, Math.min((cx - MOBILE_VB_X) * scaleX, rect.width - tooltipHalf));
      setTooltipPos({ x, y: cy * scaleY });
    } else {
      const scaleX = rect.width / width;
      const scaleY = rect.height / height;
      setTooltipPos({ x: cx * scaleX, y: cy * scaleY });
    }
  }, [isMobile]);

  const handlePillClick = useCallback((key: PillKey) => {
    setActivePill((prev) => (prev === key ? null : key));
    setHoveredPin(null);
  }, []);

  return (
    <section
      id="map"
      ref={sectionRef}
      className="relative px-0 sm:px-4 py-16 sm:py-24 flex flex-col items-center"
    >
        <div
          className="relative w-full max-w-[1200px]"
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
            viewBox={isMobile ? `${MOBILE_VB_X} 0 ${MOBILE_VB_W} ${height}` : `0 0 ${width} ${height}`}
            className="h-auto w-full"
            style={{
              maxHeight: isMobile ? "none" : "70vh",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setHoveredPin(null);
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

            {/* Pins — force-spread individual dots; click/Enter opens the gallery */}
            {clusters.map((cluster, ci) => {
              const pin = cluster.pins[0];
              const meta = categoryMeta[pin.category as LocationCategory] || { color: "#A89F95" };
              return (
                <g
                  key={cluster.id + "-" + ci}
                  className="cursor-pointer"
                  style={{ transformOrigin: `${cluster.cx}px ${cluster.cy}px` }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${pin.label} — open photo`}
                  onMouseEnter={() => {
                    setHoveredPin(pin);
                    setTooltipFromSvgCoords(cluster.cx, cluster.cy);
                  }}
                  onMouseLeave={() => { if (!isMobile) setHoveredPin(null); }}
                  onClick={(e) => openGallery(pin.id, e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openGallery(pin.id, e.currentTarget);
                    }
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
            })}

          </svg>

          {/* Tooltip — hover preview (desktop) */}
          {hoveredPin && (
            <div
              className="absolute pointer-events-none z-10 bg-warm-white rounded-xl shadow-lg max-w-[260px] border overflow-hidden"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y < 120 ? tooltipPos.y + 20 : tooltipPos.y - 12,
                transform: tooltipPos.y < 120 ? "translateX(-50%)" : "translate(-50%, -100%)",
                borderColor: "rgba(45, 42, 38, 0.08)",
              }}
            >
              {hoveredPin.photo && (
                <img
                  src={hoveredPin.photo.src}
                  alt=""
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="px-5 py-4">
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
            </div>
          )}


        </div>

        {/* Category pills — right below the map, space always reserved */}
        <div
          className="flex justify-center gap-1.5 mt-3 z-10"
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

        {/* Progress indicator — bottom-left of the section */}
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

        <MapGallery
          stops={galleryStops}
          index={galleryIndex}
          onClose={closeGallery}
          onIndex={setGalleryIndex}
        />
    </section>
  );
}

/** Normalize a city token for photo matching ("New York City" -> "new york"). */
function normCity(s: string): string {
  return s.split(",")[0].trim().toLowerCase().replace(/\s+city$/, "");
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
