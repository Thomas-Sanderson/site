"use client";

import { useState, useEffect } from "react";
import { eraLabels, timelineEras } from "@/data/timeline";
import { pct } from "@/lib/timeline";

const HEADER_HEIGHT = 52;

export default function TimelineBar() {
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ eraId: string | null }>).detail;
      setActiveEra(detail.eraId);
    };
    window.addEventListener("era-highlight", handler);
    return () => window.removeEventListener("era-highlight", handler);
  }, []);

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
        zIndex: 44,
        pointerEvents: "none",
      }}
    >
      <div
        className="max-w-[1200px] mx-auto px-4"
        style={{
          height: "28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Era segments — colored bars */}
        <div className="relative w-full" style={{ height: "2px", marginBottom: "1px" }}>
          {eraLabels.map((era) => {
            const left = pct(era.startMonth);
            const right = pct(era.endMonth);
            const width = right - left;
            const isActive = activeEra === era.id;
            return (
              <div
                key={era.id}
                className="absolute top-0 h-full transition-opacity duration-300"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: era.color,
                  opacity: isActive ? 0.9 : 0.3,
                  borderRadius: "1px",
                }}
              />
            );
          })}
        </div>

        {/* Year axis line + ticks */}
        <div className="relative w-full">
          <div
            className="w-full"
            style={{
              height: "1px",
              backgroundColor: "rgba(45, 42, 38, 0.15)",
            }}
          />
          {timelineEras
            .filter((era) => {
              const yr = parseInt(era.year);
              return yr % 5 === 0 || yr === 2013;
            })
            .map((era) => {
              const yr = parseInt(era.year);
              const isLeft = yr === 2013 || yr === 2015;
              const isRight = yr === 2025;
              const align = isLeft ? "items-start" : isRight ? "items-end" : "items-center";
              const tx = isLeft ? "translateX(0)" : isRight ? "translateX(-100%)" : "translateX(-50%)";
              return (
                <div
                  key={era.year}
                  className={`absolute top-0 flex flex-col ${align}`}
                  style={{
                    left: `${pct(era.month)}%`,
                    transform: tx,
                  }}
                >
                  <div
                    style={{
                      width: "1px",
                      height: "4px",
                      backgroundColor: "rgba(45, 42, 38, 0.2)",
                    }}
                  />
                  <span
                    className="font-mono mt-0.5 whitespace-nowrap"
                    style={{
                      fontSize: "7px",
                      color: "rgba(45, 42, 38, 0.35)",
                    }}
                  >
                    {era.year}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
