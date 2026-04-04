"use client";

import { useEffect, useState, useCallback } from "react";
import {
  timelineEntries,
  timelineEras,
  TIMELINE_START,
  TIMELINE_END,
  type TimelineEntry,
} from "@/data/timeline";
import { siteConfig } from "@/data/siteConfig";

function pct(month: number) {
  return ((month - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
}

/** Group entries by company, preserving first-appearance order */
function groupByCompany(entries: TimelineEntry[]) {
  const order: string[] = [];
  const map = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    if (!map.has(e.company)) {
      order.push(e.company);
      map.set(e.company, []);
    }
    map.get(e.company)!.push(e);
  }
  return order.map((company) => ({ company, entries: map.get(company)! }));
}

/** Brand colors — same as Hero */
const companyColors: Record<string, { muted: string; vivid: string }> = {
  "McKinsey & Company": { muted: "rgba(5, 28, 96, 0.25)", vivid: "rgba(5, 28, 96, 0.7)" },
  "Scout Ventures": { muted: "rgba(0, 100, 62, 0.25)", vivid: "rgba(0, 100, 62, 0.7)" },
  "Tipic i Catala": { muted: "rgba(128, 0, 32, 0.25)", vivid: "rgba(128, 0, 32, 0.7)" },
  "Greyt Solutions LLC": { muted: "rgba(85, 85, 85, 0.25)", vivid: "rgba(85, 85, 85, 0.7)" },
  "Workforce Logiq (NetApp)": { muted: "rgba(0, 118, 206, 0.25)", vivid: "rgba(0, 118, 206, 0.7)" },
  "Soul In The Horn": { muted: "rgba(200, 160, 40, 0.25)", vivid: "rgba(200, 160, 40, 0.7)" },
  "Self-employed": { muted: "rgba(160, 100, 60, 0.25)", vivid: "rgba(160, 100, 60, 0.7)" },
  "Casa Bonjardim Guest House Porto": { muted: "rgba(180, 130, 70, 0.25)", vivid: "rgba(180, 130, 70, 0.7)" },
  "Recovery Unplugged": { muted: "rgba(0, 140, 149, 0.25)", vivid: "rgba(0, 140, 149, 0.7)" },
  "Recovery Unplugged (Consultant)": { muted: "rgba(0, 140, 149, 0.25)", vivid: "rgba(0, 140, 149, 0.7)" },
  "Columbia University": { muted: "rgba(0, 114, 206, 0.25)", vivid: "rgba(0, 114, 206, 0.7)" },
};
const defaultColor = { muted: "rgba(45, 42, 38, 0.2)", vivid: "rgba(45, 42, 38, 0.6)" };

function getColor(company: string) {
  return companyColors[company] || defaultColor;
}

export default function StickyGantt() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const hero = document.getElementById("intro");
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    // Show sticky when the hero Gantt area has scrolled past
    setVisible(rect.bottom < 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const groups = groupByCompany(timelineEntries);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        backgroundColor: "rgba(245, 240, 235, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(45, 42, 38, 0.08)",
      }}
    >
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-2">
        {/* Name + nav */}
        <div className="flex items-center justify-between mb-1.5">
          <a href="#intro" className="font-serif font-bold text-sm">
            {siteConfig.name}
          </a>
          <div className="flex gap-5">
            {siteConfig.navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-mono text-[10px] tracking-wide hover:opacity-70 transition-opacity hidden sm:block"
                style={{ color: "rgba(45, 42, 38, 0.5)" }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Condensed bars — all companies stacked */}
        <div className="flex flex-col gap-[1px]">
          {groups.slice().reverse().map(({ company, entries }) => {
            const color = getColor(company);
            return (
              <div key={company} className="relative h-[2px]">
                {entries.map((entry, i) => {
                  const rawLeft = pct(entry.startMonth);
                  const clipped = rawLeft < 0;
                  const left = Math.max(rawLeft, 0);
                  const rawRight = pct(entry.endMonth);
                  const w = Math.max(Math.min(rawRight, 100) - left, 0.5);
                  return (
                    <div
                      key={i}
                      className="absolute h-full rounded-full"
                      style={{
                        left: `${left}%`,
                        width: `${w}%`,
                        minWidth: "2px",
                        backgroundColor: color.vivid,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Year axis */}
        <div className="relative mt-1" style={{ height: "14px" }}>
          {/* Baseline */}
          <div
            className="absolute top-0 w-full"
            style={{ height: "1px", backgroundColor: "rgba(45, 42, 38, 0.15)" }}
          />

          {timelineEras.map((era) => {
            const yr = parseInt(era.year);
            const isMajor = yr % 5 === 0 || yr === 2013;
            if (!isMajor) return null;
            return (
              <div
                key={era.label}
                className="absolute top-0 flex flex-col items-center"
                style={{
                  left: `${pct(era.month)}%`,
                  transform: "translateX(-50%)",
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
                  className="font-mono text-[7px] mt-px whitespace-nowrap"
                  style={{ color: "rgba(45, 42, 38, 0.4)" }}
                >
                  {era.year}
                </span>
              </div>
            );
          })}

          {/* Today marker */}
          {(() => {
            const now = new Date();
            const todayMonth = (now.getFullYear() - 2013) * 12 + now.getMonth();
            return (
              <div
                className="absolute top-0 flex flex-col items-center"
                style={{
                  left: `${pct(todayMonth)}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  style={{
                    width: "1px",
                    height: "4px",
                    backgroundColor: "var(--color-terracotta)",
                  }}
                />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
