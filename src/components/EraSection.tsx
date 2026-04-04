"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lerp } from "@/lib/timeline";
import type { Era } from "@/data/eras";

export default function EraSection({ era }: { era: Era }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h = rect.height;
    // progress 0 when top hits viewport top, 1 when bottom hits viewport top
    const p = Math.max(0, Math.min(1, -rect.top / (h - window.innerHeight)));
    setProgress(p);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Animation phases
  // Enter: 0–0.3, Hold: 0.3–0.7, Exit: 0.7–1.0
  const enterT = Math.min(1, progress / 0.3); // 0→1 during enter
  const exitT = Math.max(0, (progress - 0.7) / 0.3); // 0→1 during exit

  // Staggered enter for each element (date, title, subtitle, narrative)
  const stagger = (index: number, total: number) => {
    const delay = (index / total) * 0.5; // spread over half the enter phase
    return Math.max(0, Math.min(1, (enterT - delay) / (1 - delay)));
  };

  const dateEnter = stagger(0, 4);
  const titleEnter = stagger(1, 4);
  const subtitleEnter = stagger(2, 4);
  const narrativeEnter = stagger(3, 4);

  // Composite opacity/transform
  const fadeIn = (t: number) => lerp(0, 1, t);
  const slideIn = (t: number) => lerp(30, 0, t);
  const fadeOut = lerp(1, 0, exitT);
  const slideOut = lerp(0, -40, exitT);

  return (
      <div
        ref={outerRef}
        style={{ height: "200vh", position: "relative" }}
      >
        <section
          id={`era-${era.id}`}
          className="px-6 md:px-12 max-w-[960px] mx-auto flex flex-col justify-center"
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
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
            className="font-mono text-sm tracking-widest uppercase mb-4"
            style={{
              color: era.color,
              opacity: fadeIn(dateEnter) * fadeOut,
              transform: `translateY(${slideIn(dateEnter) + slideOut}px)`,
            }}
          >
            {era.dateRange}
          </p>

          <h2
            className="font-serif text-4xl md:text-5xl font-bold mb-2"
            style={{
              opacity: fadeIn(titleEnter) * fadeOut,
              transform: `translateY(${slideIn(titleEnter) + slideOut}px)`,
            }}
          >
            {era.title}
          </h2>

          <p
            className="font-mono text-sm mb-12"
            style={{
              color: "var(--color-muted)",
              opacity: fadeIn(subtitleEnter) * fadeOut,
              transform: `translateY(${slideIn(subtitleEnter) + slideOut}px)`,
            }}
          >
            {era.subtitle}
          </p>

          <div className="flex flex-col gap-6 mb-16">
            {era.narrative.map((paragraph, i) => {
              // Stagger each paragraph within the narrative phase
              const paraT = Math.max(
                0,
                Math.min(1, (narrativeEnter - i * 0.3) / (1 - i * 0.3))
              );
              return (
                <p
                  key={i}
                  className="text-lg leading-relaxed max-w-[640px] text-charcoal/80"
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
        </section>
      </div>
  );
}
