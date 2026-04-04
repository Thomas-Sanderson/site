"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import {
  locations,
  categoryMeta,
  type Location,
  type LocationCategory,
} from "@/data/locations";
import galleryData from "@/data/gallery.json";

interface GalleryImage {
  slug: string;
  cropped: string;
  width: number;
  height: number;
  location?: string;
  date?: string;
}

function getGalleryCoords(loc: string): [number, number] | null {
  const mapping: Record<string, [number, number]> = {
    "Porto, Portugal": [-8.6291, 41.1579],
    "Delaware": [-75.5277, 38.9108],
    "Lewes, Delaware": [-75.1394, 38.7746],
    "Rehoboth, Delaware": [-75.076, 38.721],
    "Saratoga, California": [-122.023, 37.2638],
    "Fort Bragg, California": [-123.8053, 39.4457],
    "South Royalton, New Hampshire": [-72.5218, 43.8195],
    "Memphis, Tennessee": [-90.049, 35.1495],
    "Big South Fork National River & Recreation Area": [-84.6985, 36.487],
    "Pinnacle Natural Park": [-83.55, 36.6],
  };
  return mapping[loc] || null;
}

const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type PillKey = LocationCategory | "see";

const pillMeta: Record<PillKey, { label: string; color: string }> = {
  ...categoryMeta,
  see: { label: "See", color: "#7B5EA7" },
};

const pillKeys: PillKey[] = ["work", "art", "volunteer", "travel", "want-to-visit", "see"];

/** Group locations by city, counting industries per city for a given category */
interface CityGroup {
  city: string;
  lat: number;
  lng: number;
  category: LocationCategory;
  count: number;
  locations: Location[];
}

export default function MapSection() {
  const [worldData, setWorldData] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [activePill, setActivePill] = useState<PillKey | null>(null);
  const [hoveredPin, setHoveredPin] = useState<Location | null>(null);
  const [hoveredCityGroup, setHoveredCityGroup] = useState<CityGroup | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedGalleryLocation, setSelectedGalleryLocation] =
    useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [mapOffset, setMapOffset] = useState(0);

  const handlePillClick = useCallback((key: PillKey) => {
    setActivePill((prev) => {
      const next = prev === key ? null : key;
      if (next !== prev) {
        setSelectedGalleryLocation(null);
        setHoveredPin(null);
        setHoveredCityGroup(null);
      }
      return next;
    });
  }, []);

  const images = galleryData as GalleryImage[];
  const isSelected = activePill !== null;
  const isSeeMode = activePill === "see";
  const isGeoCategory =
    activePill !== null && activePill !== "see";

  const imagesByLocation = useMemo(() => {
    const map = new Map<string, GalleryImage[]>();
    for (const img of images) {
      const loc = img.location || "Unknown";
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc)!.push(img);
    }
    return map;
  }, [images]);

  /** When a geo category is selected, group by city and count industries */
  const cityGroups = useMemo(() => {
    if (!isGeoCategory) return [];
    const filtered = locations.filter((loc) => loc.category === activePill);
    const byCity = new Map<string, Location[]>();
    for (const loc of filtered) {
      if (!byCity.has(loc.city)) byCity.set(loc.city, []);
      byCity.get(loc.city)!.push(loc);
    }
    return Array.from(byCity.entries()).map(([city, locs]): CityGroup => {
      const totalIndustries = locs.reduce(
        (sum, l) => sum + (l.industries?.length || 1),
        0
      );
      return {
        city,
        lat: locs[0].lat,
        lng: locs[0].lng,
        category: locs[0].category,
        count: totalIndustries,
        locations: locs,
      };
    });
  }, [activePill, isGeoCategory]);

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

  // Parallax scroll effect
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollProgress = -rect.top / window.innerHeight;
      setMapOffset(scrollProgress * 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const width = 960;
  const height = 500;

  const projection = useMemo(
    () =>
      geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]),
    []
  );

  const pathGenerator = useMemo(
    () => geoPath().projection(projection),
    [projection]
  );

  // categoryCounts kept for potential future use by tooltips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const loc of locations) {
      const industryCount = loc.industries?.length || 1;
      counts[loc.category] = (counts[loc.category] || 0) + industryCount;
    }
    counts["see"] = images.length;
    return counts;
  }, [images]);

  const setTooltipFromEvent = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const selectedImages = selectedGalleryLocation
    ? imagesByLocation.get(selectedGalleryLocation) || []
    : [];

  /** Render a count-badge pin (used when a pill is selected) */
  const renderCountPin = (
    key: string,
    cx: number,
    cy: number,
    count: number,
    color: string,
    onEnter?: (e: React.MouseEvent) => void,
    onLeave?: () => void,
    onClick?: () => void
  ) => (
    <g
      key={key}
      className="cursor-pointer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.15} />
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="var(--color-cream)"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Count number */}
      <text
        x={cx}
        y={cy + 3.5}
        textAnchor="middle"
        fontSize={8}
        fontFamily="var(--font-mono)"
        fontWeight="bold"
        fill={color}
      >
        {count}
      </text>
    </g>
  );

  /** Render a simple dot pin (used in all-visible mode) */
  const renderDotPin = (
    key: string,
    cx: number,
    cy: number,
    color: string,
    onEnter?: (e: React.MouseEvent) => void,
    onLeave?: () => void
  ) => (
    <g
      key={key}
      className="pin-marker cursor-pointer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.2} />
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill={color}
        stroke="var(--color-cream)"
        strokeWidth={1.5}
      />
    </g>
  );

  return (
    <section
      id="map"
      ref={sectionRef}
      className="reveal py-24 overflow-hidden"
    >
      {/* Map container with parallax */}
      <div className="relative w-full max-w-[1200px] mx-auto px-4">
        <div
          className="relative"
          style={{ transform: `translateY(${mapOffset}px)` }}
        >
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

            {/* ALL-VISIBLE MODE: simple dots for everything */}
            {!isSelected &&
              locations.map((loc) => {
                const coords = projection([loc.lng, loc.lat]);
                if (!coords) return null;
                const meta = categoryMeta[loc.category];
                return renderDotPin(
                  `dot-${loc.city}-${loc.category}`,
                  coords[0],
                  coords[1],
                  meta.color,
                  (e) => {
                    setHoveredPin(loc);
                    setTooltipFromEvent(e);
                  },
                  () => setHoveredPin(null)
                );
              })}

            {/* ALL-VISIBLE MODE: gallery dots (no counts) */}
            {!isSelected &&
              Array.from(imagesByLocation.entries()).map(([loc]) => {
                const lngLat = getGalleryCoords(loc);
                if (!lngLat) return null;
                const coords = projection(lngLat);
                if (!coords) return null;
                return renderDotPin(
                  `gallery-dot-${loc}`,
                  coords[0],
                  coords[1],
                  pillMeta.see.color
                );
              })}

            {/* SELECTED GEO CATEGORY: count pins grouped by city */}
            {isGeoCategory &&
              cityGroups.map((group) => {
                const coords = projection([group.lng, group.lat]);
                if (!coords) return null;
                const color = categoryMeta[group.category].color;
                return renderCountPin(
                  `city-${group.city}-${group.category}`,
                  coords[0],
                  coords[1],
                  group.count,
                  color,
                  (e) => {
                    setHoveredCityGroup(group);
                    setTooltipFromEvent(e);
                  },
                  () => setHoveredCityGroup(null)
                );
              })}

            {/* SEE MODE: count pins per location */}
            {isSeeMode &&
              Array.from(imagesByLocation.entries()).map(([loc, imgs]) => {
                const lngLat = getGalleryCoords(loc);
                if (!lngLat) return null;
                const coords = projection(lngLat);
                if (!coords) return null;
                const isLocSelected = selectedGalleryLocation === loc;
                return renderCountPin(
                  `gallery-${loc}`,
                  coords[0],
                  coords[1],
                  imgs.length,
                  isLocSelected ? "var(--color-charcoal)" : pillMeta.see.color,
                  undefined,
                  undefined,
                  () =>
                    setSelectedGalleryLocation(isLocSelected ? null : loc)
                );
              })}
          </svg>

          {/* Geography tooltip — all-visible mode */}
          {!isSelected && hoveredPin && (
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
                {hoveredPin.city}
              </p>
              <p
                className="font-mono text-xs mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                {hoveredPin.country}
                {hoveredPin.dateRange && ` \u2022 ${hoveredPin.dateRange}`}
              </p>
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

          {/* City group tooltip — selected category mode */}
          {isGeoCategory && hoveredCityGroup && (
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
                {hoveredCityGroup.city}
              </p>
              <div className="flex flex-wrap gap-1">
                {hoveredCityGroup.locations.flatMap((loc) =>
                  (loc.industries || []).map((ind) => (
                    <span
                      key={ind}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${categoryMeta[hoveredCityGroup.category].color}15`,
                        color: categoryMeta[hoveredCityGroup.category].color,
                      }}
                    >
                      {ind}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Gallery overlay */}
          {isSeeMode &&
            selectedGalleryLocation &&
            selectedImages.length > 0 && (
              <div
                className="absolute inset-0 z-20 bg-charcoal/90 rounded-xl overflow-y-auto"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-charcoal/80">
                  <div>
                    <p className="font-mono text-xs text-white/50 uppercase tracking-widest">
                      {selectedGalleryLocation}
                    </p>
                    <p className="font-mono text-[10px] text-white/30">
                      {selectedImages.length} photo
                      {selectedImages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedGalleryLocation(null)}
                    className="font-mono text-xs text-white/60 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/20"
                  >
                    Close
                  </button>
                </div>
                <div className="columns-2 gap-3 p-4">
                  {selectedImages.map((img) => (
                    <div key={img.slug} className="break-inside-avoid mb-3">
                      <Image
                        src={`/images/gallery/${img.cropped}`}
                        alt={img.slug.replace(/-/g, " ")}
                        width={img.width}
                        height={img.height}
                        className="w-full h-auto rounded-lg"
                      />
                      {img.date && (
                        <p className="font-mono text-[10px] text-white/40 mt-1">
                          {img.date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          {/* Category pills — bottom-right of map */}
          <div className="absolute bottom-3 right-3 flex flex-col-reverse gap-1.5 z-10">
            {pillKeys.map((key) => {
              const meta = pillMeta[key];
              const isActive = activePill === key;
              const isNoneSelected = activePill === null;
              const dimmed = !isNoneSelected && !isActive;
              return (
                <button
                  key={key}
                  onClick={() => handlePillClick(key)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] transition-all duration-300 border backdrop-blur-sm"
                  style={{
                    borderColor: dimmed ? "var(--color-muted)" : meta.color,
                    backgroundColor: isActive ? `${meta.color}20` : "rgba(245, 240, 235, 0.8)",
                    color: dimmed ? "var(--color-muted)" : meta.color,
                    opacity: dimmed ? 0.35 : 1,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: dimmed ? "var(--color-muted)" : meta.color }}
                  />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
