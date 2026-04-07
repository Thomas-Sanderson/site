"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
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
  era?: string;
}

export default function EraSection({ era }: { era: Era }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const progress = useScrollCard(sentinelRef);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Dispatch era-highlight event for TimelineBar
  useEffect(() => {
    const isActive = progress > 0.05 && progress < 0.95;
    window.dispatchEvent(
      new CustomEvent("era-highlight", {
        detail: { eraId: isActive ? era.id : null },
      })
    );
  }, [progress, era.id]);

  // Gallery images for this era — match by era tag or location filter
  const galleryImages = useMemo(() => {
    return (galleryData as GalleryImage[]).filter(
      (img) =>
        img.era === era.id ||
        (era.galleryFilter &&
          img.location?.toLowerCase().includes(era.galleryFilter.toLowerCase()))
    );
  }, [era.id, era.galleryFilter]);

  // Animation phases — mobile exits later so content lingers
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const enterEnd = isMobile ? 0.25 : 0.3;
  const exitStart = isMobile ? 0.82 : 0.7;
  const enterT = Math.min(1, progress / enterEnd);
  const exitT = Math.max(0, (progress - exitStart) / (1 - exitStart));

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
  const slideOut = lerp(0, isMobile ? -20 : -40, exitT);

  return (
    <div ref={sentinelRef} style={{ height: "200vh", position: "relative" }}>
      <section
        id={`era-${era.id}`}
        className="px-6 md:px-12 max-w-[960px] mx-auto flex flex-col justify-start pt-8 sm:justify-center sm:pt-0"
        style={{
          position: "sticky",
          top: "calc(90px + env(safe-area-inset-top, 0px))",
          height: "calc(100vh - 90px - env(safe-area-inset-top, 0px))",
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
            className="grid grid-cols-3 gap-2 mt-4 max-w-[400px]"
            style={{
              opacity: fadeIn(narrativeEnter) * fadeOut,
              transform: `translateY(${slideIn(narrativeEnter) + slideOut}px)`,
            }}
          >
            {galleryImages.slice(0, 5).map((img, i) => (
              <div
                key={img.slug}
                className="rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                style={{ aspectRatio: "4/3" }}
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={`/images/gallery/${img.cropped}`}
                  alt={img.slug.replace(/-/g, " ")}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {galleryImages.length > 5 && (
              <div
                className="rounded-lg flex items-center justify-center font-mono text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  aspectRatio: "4/3",
                  backgroundColor: "rgba(45, 42, 38, 0.05)",
                  color: "var(--color-muted)",
                }}
                onClick={() => setLightboxIndex(5)}
              >
                +{galleryImages.length - 5} more
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lightbox with prev/next */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Prev button */}
          {lightboxIndex > 0 && (
            <button
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}

          {/* Image */}
          <img
            src={`/images/gallery/${galleryImages[lightboxIndex].cropped}`}
            alt={galleryImages[lightboxIndex].slug.replace(/-/g, " ")}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {lightboxIndex < galleryImages.length - 1 && (
            <button
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}

          {/* Counter */}
          <span
            className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-white/50"
          >
            {lightboxIndex + 1} / {galleryImages.length}
          </span>

          {/* Close */}
          <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
