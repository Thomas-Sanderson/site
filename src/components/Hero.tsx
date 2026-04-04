"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/data/siteConfig";
import {
  timelineEntries,
  timelineEras,
  TIMELINE_START,
  TIMELINE_END,
  type TimelineEntry,
} from "@/data/timeline";

function pct(month: number) {
  return ((month - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
}

/** Group entries by company, preserving order of first appearance */
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

/** Brand colors — muted at rest, vivid on hover */
const companyColors: Record<string, { muted: string; vivid: string }> = {
  "McKinsey & Company": { muted: "rgba(5, 28, 96, 0.18)", vivid: "rgba(5, 28, 96, 0.7)" },
  "Scout Ventures": { muted: "rgba(0, 100, 62, 0.18)", vivid: "rgba(0, 100, 62, 0.7)" },
  "Tipic i Catala": { muted: "rgba(128, 0, 32, 0.18)", vivid: "rgba(128, 0, 32, 0.7)" },
  "Greyt Solutions LLC": { muted: "rgba(85, 85, 85, 0.18)", vivid: "rgba(85, 85, 85, 0.7)" },
  "Workforce Logiq (NetApp)": { muted: "rgba(0, 118, 206, 0.18)", vivid: "rgba(0, 118, 206, 0.7)" },
  "Soul In The Horn": { muted: "rgba(200, 160, 40, 0.18)", vivid: "rgba(200, 160, 40, 0.7)" },
  "Self-employed": { muted: "rgba(160, 100, 60, 0.18)", vivid: "rgba(160, 100, 60, 0.7)" },
  "Casa Bonjardim Guest House Porto": { muted: "rgba(180, 130, 70, 0.18)", vivid: "rgba(180, 130, 70, 0.7)" },
  "Recovery Unplugged": { muted: "rgba(0, 140, 149, 0.18)", vivid: "rgba(0, 140, 149, 0.7)" },
  "Recovery Unplugged (Consultant)": { muted: "rgba(0, 140, 149, 0.18)", vivid: "rgba(0, 140, 149, 0.7)" },
  "Columbia University": { muted: "rgba(0, 114, 206, 0.18)", vivid: "rgba(0, 114, 206, 0.7)" },
};
const defaultColor = { muted: "rgba(45, 42, 38, 0.15)", vivid: "rgba(45, 42, 38, 0.6)" };

function getColor(company: string) {
  return companyColors[company] || defaultColor;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<TimelineEntry | null>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [hoveredRowTop, setHoveredRowTop] = useState(0);
  const [tooltipX, setTooltipX] = useState(50);
  const ganttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTickEnter = (entry: TimelineEntry) => {
    setHovered(entry);
    const midMonth = (entry.startMonth + entry.endMonth) / 2;
    setTooltipX(pct(midMonth));
  };

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="reveal min-h-[85vh] flex flex-col justify-center px-6 md:px-12 max-w-[960px] mx-auto py-24"
    >
      <p
        className="font-mono text-sm tracking-widest uppercase mb-4"
        style={{ color: "var(--color-terracotta)" }}
      >
        {siteConfig.title}
      </p>

      <h1 className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight">
        {siteConfig.name}
      </h1>

      <p className="text-lg md:text-xl leading-relaxed max-w-[640px] mb-12 text-charcoal/80">
        I spent the first chapter of my career in boardrooms — consulting for
        the world&rsquo;s largest banks, insurers, and healthcare systems. Then I
        left to make art in Portugal for two years. After that, I went where the
        work mattered most: behavioral health, where I designed systems for
        people in crisis. Now I build things with AI that most teams haven&rsquo;t
        figured out are possible yet.
      </p>

      {/* Gantt Chart — bleeds left for labels */}
      <div ref={ganttRef} className="relative mt-6 sm:-ml-[160px]">
        {/* Rows — one per company */}
        <div className="flex flex-col-reverse gap-[3px]">
          {groupByCompany(timelineEntries).map(({ company, entries }) => (
            <div
              key={company}
              className="flex items-center gap-3 rounded-md px-1 -mx-1 transition-colors duration-200"
              style={{
                backgroundColor: hoveredCompany === company
                  ? "rgba(45, 42, 38, 0.03)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                setHoveredCompany(company);
                const ganttRect = ganttRef.current?.getBoundingClientRect();
                const rowRect = e.currentTarget.getBoundingClientRect();
                if (ganttRect) {
                  setHoveredRowTop(rowRect.bottom - ganttRect.top);
                }
              }}
              onMouseLeave={() => setHoveredCompany(null)}
            >
              {/* Company label — sits in the bleed area */}
              <div className="w-[150px] shrink-0 text-right hidden sm:block">
                <p
                  className="font-mono text-[8px] leading-tight truncate transition-colors duration-200"
                  style={{
                    color: hoveredCompany === company
                      ? getColor(company).vivid
                      : "rgba(45, 42, 38, 0.4)",
                  }}
                >
                  {company}
                </p>
              </div>
              {/* Bar row */}
              <div className="relative h-[14px] flex-1 overflow-hidden">
                {entries.map((entry, i) => {
                  const rawLeft = pct(entry.startMonth);
                  const clipped = rawLeft < 0;
                  const left = Math.max(rawLeft, 0);
                  const rawRight = pct(entry.endMonth);
                  const w = Math.max(Math.min(rawRight, 100) - left, 0.8);
                  const isRowHovered = hoveredCompany === company;
                  const color = getColor(company);
                  return (
                    <div
                      key={i}
                      className="absolute h-full flex items-center transition-all duration-200"
                      style={{
                        left: `${left}%`,
                        width: `${w}%`,
                        minWidth: "4px",
                      }}
                    >
                      {/* Left-pointing arrow for bars that extend before the visible range */}
                      {clipped && (
                        <svg
                          className="absolute shrink-0 transition-colors duration-200"
                          style={{ left: 0, top: "50%", transform: "translateY(-50%)" }}
                          width="8" height="14" viewBox="0 0 8 14"
                        >
                          <polygon
                            points="8,0 0,7 8,14"
                            fill={isRowHovered ? color.vivid : color.muted}
                          />
                        </svg>
                      )}
                      <div
                        className="absolute h-full w-full transition-colors duration-200"
                        style={{
                          left: clipped ? "8px" : 0,
                          width: clipped ? "calc(100% - 8px)" : "100%",
                          backgroundColor: isRowHovered
                            ? color.vivid
                            : color.muted,
                          borderRadius: clipped ? "0 3px 3px 0" : "3px",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              {/* Location label */}
              <div className="w-[120px] shrink-0 hidden sm:block">
                <p
                  className="font-mono text-[8px] leading-tight truncate transition-colors duration-200"
                  style={{
                    color: hoveredCompany === company
                      ? getColor(company).vivid
                      : "rgba(45, 42, 38, 0.3)",
                  }}
                >
                  {entries[entries.length - 1].location || ""}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Year axis — baseline rule + uniform ticks */}
        <div className="relative mt-1 sm:ml-[153px] sm:mr-[123px]">
          {/* Baseline rule */}
          <div className="w-full" style={{ height: "1px", backgroundColor: "rgba(45, 42, 38, 0.25)" }} />

          {/* Year ticks + labels */}
          {timelineEras.map((era) => {
            const yr = parseInt(era.year);
            const isMajor = yr % 5 === 0 || yr === 2013;
            const isAccented = yr === 2013;
            const tickColor = isAccented ? "var(--color-terracotta)" : "rgba(45, 42, 38, 0.25)";
            const labelColor = isAccented ? "var(--color-terracotta)" : "rgba(45, 42, 38, 0.45)";
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
                    height: isMajor ? "8px" : "5px",
                    backgroundColor: tickColor,
                  }}
                />
                {isMajor && (
                  <span className="font-mono text-[9px] mt-0.5 whitespace-nowrap" style={{ color: labelColor }}>
                    {era.year}
                  </span>
                )}
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
                    height: "8px",
                    backgroundColor: "var(--color-terracotta)",
                  }}
                />
                <span className="font-mono text-[9px] mt-0.5 whitespace-nowrap" style={{ color: "var(--color-terracotta)" }}>
                  Today
                </span>
              </div>
            );
          })()}
        </div>

        {/* Row hover — floating callout card */}
        {hoveredCompany && (() => {
          const group = groupByCompany(timelineEntries).find(g => g.company === hoveredCompany);
          if (!group) return null;
          const color = getColor(hoveredCompany);
          return (
            <div
              className="absolute z-30 pointer-events-none sm:left-[153px] left-0 right-0"
              style={{ top: `${hoveredRowTop + 8}px` }}
            >
              {/* Triangle callout */}
              <div
                className="sm:ml-12 ml-6 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: `8px solid ${color.vivid}`,
                }}
              />
              <div
                className="bg-warm-white rounded-xl shadow-lg px-8 py-6 border w-full"
                style={{
                  borderColor: "rgba(45, 42, 38, 0.06)",
                  borderTop: `2px solid ${color.vivid}`,
                }}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg leading-tight">
                    {hoveredCompany}
                  </h3>
                  <p className="font-mono text-xs text-charcoal/40">
                    {group.entries[0].start} – {group.entries[group.entries.length - 1].end}
                  </p>
                </div>
                <div className="grid gap-3">
                  {group.entries.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-[5px]"
                        style={{ backgroundColor: color.vivid }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="text-sm font-medium leading-snug">
                            {entry.role}
                          </p>
                          <p className="font-mono text-[10px] text-charcoal/40 shrink-0">
                            {entry.duration}
                          </p>
                        </div>
                        <p className="font-mono text-[10px] text-charcoal/35 mt-0.5">
                          {entry.type} · {entry.location}
                        </p>
                        {entry.highlights && entry.highlights.length > 0 && (
                          <p className="text-xs text-charcoal/50 mt-1 leading-relaxed">
                            {entry.highlights[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
