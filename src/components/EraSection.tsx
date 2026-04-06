"use client";

import { useRef, useEffect, useMemo } from "react";
import { useScrollCard, lerp } from "@/lib/useScrollCard";
import type { Era } from "@/data/eras";
import galleryData from "@/data/gallery.json";

interface GalleryImage {
  slug: string;
  cropped: string;
  width: number;
  height: number;
  location?: string;
  date?: string;
}

export default function EraSection({ era }: { era: Era }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const progress = useScrollCard(sentinelRef);

  // Dispatch era-highlight event for TimelineBar
  useEffect(() => {
    const isActive = progress > 0.05 && progress < 0.95;
    window.dispatchEvent(
      new CustomEvent("era-highlight", {
        detail: { eraId: isActive ? era.id : null },
      })
    );
  }, [progress, era.id]);

  // Gallery images for this era (if galleryFilter set)
  const galleryImages = useMemo(() => {
    if (!era.galleryFilter) return [];
    return (galleryData as GalleryImage[]).filter(
      (img) =>
        img.location?.toLowerCase().includes(era.galleryFilter!.toLowerCase())
    );
  }, [era.galleryFilter]);

  // Animation phases: Enter 0–0.3, Hold 0.3–0.7, Exit 0.7–1.0
  const enterT = Math.min(1, progress / 0.3);
  const exitT = Math.max(0, (progress - 0.7) / 0.3);

  const stagger = (index: number, total: number) => {
    const delay = (index / total) * 0.5;
    return Math.max(0, Math.min(1, (enterT - delay) / (1 - delay)));
  };

  const dateEnter = stagger(0, 4);
  const titleEnter = stagger(1, 4);
  const subtitleEnter = stagger(2, 4);
  const narrativeEnter = stagger(3, 4);

  const fadeIn = (t: number) => lerp(0, 1, t);
  const slideIn = (t: number) => lerp(30, 0, t);
  const fadeOut = lerp(1, 0, exitT);
  const slideOut = lerp(0, -40, exitT);

  return (
    <div ref={sentinelRef} style={{ height: "200vh", position: "relative" }}>
      <section
        id={`era-${era.id}`}
        className="px-6 md:px-12 max-w-[960px] mx-auto flex flex-col justify-start pt-8 sm:justify-center sm:pt-0"
        style={{
          position: "sticky",
          top: "60px",
          height: "calc(100vh - 60px)",
          zIndex: 30,
          overflow: "hidden",
        }}
      >
        {/* Era accent border */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "15%",
            bottom: "15%",
            width: "3px",
            backgroundColor: era.color,
            opacity: lerp(0, 0.6, enterT) * fadeOut,
            borderRadius: "2px",
          }}
        />

        <p
          className="font-mono text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4"
          style={{
            color: era.color,
            opacity: fadeIn(dateEnter) * fadeOut,
            transform: `translateY(${slideIn(dateEnter) + slideOut}px)`,
          }}
        >
          {era.dateRange}
        </p>

        <h2
          className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2"
          style={{
            opacity: fadeIn(titleEnter) * fadeOut,
            transform: `translateY(${slideIn(titleEnter) + slideOut}px)`,
          }}
        >
          {era.title}
        </h2>

        <p
          className="font-mono text-xs sm:text-sm mb-6 sm:mb-12"
          style={{
            color: "var(--color-muted)",
            opacity: fadeIn(subtitleEnter) * fadeOut,
            transform: `translateY(${slideIn(subtitleEnter) + slideOut}px)`,
          }}
        >
          {era.subtitle}
        </p>

        <div className="flex flex-col gap-3 sm:gap-6 mb-4 sm:mb-8">
          {era.narrative.map((paragraph, i) => {
            const paraT = Math.max(
              0,
              Math.min(1, (narrativeEnter - i * 0.3) / (1 - i * 0.3))
            );
            return (
              <p
                key={i}
                className="text-sm sm:text-lg leading-relaxed max-w-[640px] text-charcoal/80"
                style={{
                  opacity: fadeIn(paraT) * fadeOut,
                  transform: `translateY(${slideIn(paraT) + slideOut}px)`,
                }}
              >
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Gallery grid (if this era has a galleryFilter) */}
        {galleryImages.length > 0 && (
          <div
            className="flex gap-2 overflow-x-auto pb-2 mt-4"
            style={{
              opacity: fadeIn(narrativeEnter) * fadeOut,
              transform: `translateY(${slideIn(narrativeEnter) + slideOut}px)`,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {galleryImages.slice(0, 6).map((img) => (
              <div
                key={img.slug}
                className="shrink-0 rounded-lg overflow-hidden w-[100px] h-[75px] sm:w-[120px] sm:h-[90px]"
              >
                <img
                  src={`/images/gallery/${img.cropped}`}
                  alt={img.slug.replace(/-/g, " ")}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {galleryImages.length > 6 && (
              <div
                className="shrink-0 rounded-lg flex items-center justify-center font-mono text-xs w-[100px] h-[75px] sm:w-[120px] sm:h-[90px]"
                style={{
                  backgroundColor: "rgba(45, 42, 38, 0.05)",
                  color: "var(--color-muted)",
                }}
              >
                +{galleryImages.length - 6} more
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
