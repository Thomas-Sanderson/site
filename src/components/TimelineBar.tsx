"use client";

import { useState, useEffect } from "react";
import { eraLabels } from "@/data/timeline";
import { pct } from "@/lib/timeline";

/*
  Persistent era-segment bar that appears after the Gantt fully collapses.
  Sits below the hero header (which is already fixed at top by Hero.tsx).
  Shows era-colored segments that highlight the active era.

  The "Design Technologist / Thomas" header and nav links are already
  handled by Hero.tsx and GanttTimeline.tsx respectively — no duplication here.
*/

const HEADER_HEIGHT = 52; // height of hero's anchored header

export default function TimelineBar() {
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Listen for era-highlight events from EraSection
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ eraId: string | null }>).detail;
      setActiveEra(detail.eraId);
    };
    window.addEventListener("era-highlight", handler);
    return () => window.removeEventListener("era-highlight", handler);
  }, []);

  // Show bar after Gantt sentinel has been scrolled past
  useEffect(() => {
    const handleScroll = () => {
      const sentinel = document.getElementById("gantt-sentinel");
      if (!sentinel) return;
      const rect = sentinel.getBoundingClientRect();
      setVisible(rect.bottom < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: `${HEADER_HEIGHT}px`,
        left: 0,
        right: 0,
        zIndex: 44, // below hero header (45), above content
        pointerEvents: "none",
      }}
    >
      <div
        className="max-w-[1200px] mx-auto px-4"
        style={{ paddingTop: "4px", paddingBottom: "4px" }}
      >
        {/* Era segments bar */}
        <div className="relative w-full" style={{ height: "3px" }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "rgba(45, 42, 38, 0.04)" }}
          />
          {eraLabels.map((era) => {
            const left = pct(era.startMonth);
            const right = pct(era.endMonth);
            const width = right - left;
            const isActive = activeEra === era.id;
            return (
              <div
                key={era.label}
                className="absolute top-0 h-full rounded-full transition-opacity duration-300"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: era.color,
                  opacity: isActive ? 0.9 : 0.2,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
