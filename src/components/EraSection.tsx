"use client";

import { useEffect, useMemo, useState } from "react";
import { useInView } from "@/lib/useInView";
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
  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.2,
    once: true,
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Dispatch era-highlight for the TimelineBar when this section occupies the
  // vertical center band of the viewport (rootMargin shrinks the root to a
  // thin strip through the middle).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.dispatchEvent(
          new CustomEvent("era-highlight", {
            detail: { eraId: entry.isIntersecting ? era.id : null },
          })
        );
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      // Clear highlight on unmount so a stale era doesn't stay lit.
      window.dispatchEvent(
        new CustomEvent("era-highlight", { detail: { eraId: null } })
      );
    };
  }, [era.id, sectionRef]);

  // Gallery images for this era — match by era tag or location filter, shuffled
  const galleryImages = useMemo(() => {
    const images = (galleryData as GalleryImage[]).filter(
      (img) =>
        img.era === era.id ||
        (era.galleryFilter &&
          img.location?.toLowerCase().includes(era.galleryFilter.toLowerCase()))
    );
    // Seeded shuffle so order is stable but mixed
    let seed = era.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    for (let i = images.length - 1; i > 0; i--) {
      seed = (seed * 16807 + 1) % 2147483647;
      const j = seed % (i + 1);
      [images[i], images[j]] = [images[j], images[i]];
    }
    return images;
  }, [era.id, era.galleryFilter]);

  // One-shot staggered reveal. `i` controls the cascade order.
  const reveal = (i: number): React.CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
    transitionDelay: `${i * 0.1}s`,
  });

  return (
    <div className="relative">
      <section
        ref={sectionRef}
        id={`era-${era.id}`}
        className="relative px-6 md:px-12 max-w-[960px] mx-auto py-20 sm:py-28 scroll-mt-28"
      >
        {/* Era accent border */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: "10%",
            bottom: "10%",
            width: "3px",
            backgroundColor: era.color,
            opacity: inView ? 0.6 : 0,
            borderRadius: "2px",
            transition: "opacity 0.9s ease-out",
          }}
        />

        <p
          className="font-mono text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-4"
          style={{ color: era.color, ...reveal(0) }}
        >
          {era.dateRange}
        </p>

        <h2
          className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2"
          style={reveal(1)}
        >
          {era.title}
        </h2>

        <p
          className="font-mono text-xs sm:text-sm mb-6 sm:mb-12"
          style={{ color: "var(--color-muted)", ...reveal(2) }}
        >
          {era.subtitle}
        </p>

        <div className="flex flex-col gap-3 sm:gap-6 mb-4 sm:mb-8">
          {era.narrative.map((paragraph, i) => (
            <p
              key={i}
              className="text-sm sm:text-lg leading-relaxed max-w-[640px] text-charcoal/80"
              style={reveal(3 + i)}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Gallery grid (if this era has matching images) */}
        {galleryImages.length > 0 && (
          <div
            className="grid grid-cols-3 gap-2 mt-4 max-w-[400px]"
            style={reveal(3 + era.narrative.length)}
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
