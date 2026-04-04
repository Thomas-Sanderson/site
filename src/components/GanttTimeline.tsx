"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { siteConfig } from "@/data/siteConfig";
import {
  timelineEntries,
  timelineEras,
} from "@/data/timeline";
import { pct, groupByCompany, getColor, lerp } from "@/lib/timeline";

export default function GanttTimeline() {
  const ganttRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [hoveredRowTop, setHoveredRowTop] = useState(0);

  const handleScroll = useCallback(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const rect = sentinel.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (0 - rect.top) / 200));
    setProgress(p);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Broadcast progress so Nav can react
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("gantt-progress", { detail: progress }));
  }, [progress]);

  const groups = groupByCompany(timelineEntries);

  // Interpolated values
  const rowHeight = lerp(14, 2, progress);
  const rowGap = lerp(3, 1, progress);
  const labelOpacity = lerp(1, 0, progress);
  const bleedMargin = lerp(-160, 0, progress);
  const navRowOpacity = lerp(0, 1, Math.max(0, (progress - 0.3) / 0.7));
  const backdropOpacity = lerp(0, 0.92, progress);
  const verticalPadding = lerp(24, 8, progress);
  const hoverEnabled = progress < 0.5;

  // Year axis interpolation
  const tickHeight = lerp(8, 4, progress);
  const minorTickHeight = lerp(5, 3, progress);
  const yearFontSize = lerp(9, 7, progress);

  return (
    <>
      <div
        ref={ganttRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: `rgba(245, 240, 235, ${backdropOpacity})`,
          backdropFilter: progress > 0 ? "blur(12px)" : "none",
          borderBottom: progress > 0.1 ? "1px solid rgba(45, 42, 38, 0.08)" : "1px solid transparent",
          transition: "border-color 0.2s",
        }}
      >
        <div
          className="max-w-[960px] mx-auto px-6 md:px-12"
          style={{ paddingTop: `${verticalPadding}px`, paddingBottom: `${verticalPadding}px` }}
        >
          {/* Name + nav row — fades in as chart collapses */}
          <div
            className="flex items-center justify-between"
            style={{
              opacity: navRowOpacity,
              pointerEvents: navRowOpacity > 0.3 ? "auto" : "none",
              maxHeight: navRowOpacity > 0.05 ? "40px" : "0px",
              marginBottom: navRowOpacity > 0.05 ? "6px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.15s ease, margin-bottom 0.15s ease",
            }}
          >
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

          {/* Gantt — bleeds left on desktop for labels */}
          <div className="relative" style={{ marginLeft: undefined }}>
            {/* On desktop, apply the interpolated bleed margin */}
            <div className="hidden sm:contents">
              <style>{`
                @media (min-width: 640px) {
                  [data-gantt-bleed] { margin-left: ${bleedMargin}px; }
                }
              `}</style>
            </div>
            <div data-gantt-bleed="">
              {/* Rows — one per company */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: `${rowGap}px`,
                }}
              >
                {groups.map(({ company, entries }) => (
                  <div
                    key={company}
                    className="flex items-center gap-3 rounded-md px-1 -mx-1 transition-colors duration-200"
                    style={{
                      backgroundColor: hoveredCompany === company && hoverEnabled
                        ? "rgba(45, 42, 38, 0.03)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!hoverEnabled) return;
                      setHoveredCompany(company);
                      const rect = ganttRef.current?.getBoundingClientRect();
                      const rowRect = e.currentTarget.getBoundingClientRect();
                      if (rect) {
                        setHoveredRowTop(rowRect.bottom - rect.top);
                      }
                    }}
                    onMouseLeave={() => setHoveredCompany(null)}
                  >
                    {/* Company label — sits in the bleed area */}
                    <div
                      className="w-[150px] shrink-0 text-right hidden sm:block"
                      style={{ opacity: labelOpacity }}
                    >
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
                    <div
                      className="relative flex-1 overflow-hidden"
                      style={{ height: `${rowHeight}px` }}
                    >
                      {entries.map((entry, i) => {
                        const rawLeft = pct(entry.startMonth);
                        const clipped = rawLeft < 0;
                        const left = Math.max(rawLeft, 0);
                        const rawRight = pct(entry.endMonth);
                        const w = Math.max(Math.min(rawRight, 100) - left, 0.8);
                        const isRowHovered = hoveredCompany === company && hoverEnabled;
                        const color = getColor(company);
                        const barColor = progress > 0.5
                          ? color.vivid
                          : isRowHovered ? color.vivid : color.muted;
                        return (
                          <div
                            key={i}
                            className="absolute h-full flex items-center transition-colors duration-200"
                            style={{
                              left: `${left}%`,
                              width: `${w}%`,
                              minWidth: progress > 0.5 ? "2px" : "4px",
                            }}
                          >
                            {clipped && progress < 0.5 && (
                              <svg
                                className="absolute shrink-0 transition-colors duration-200"
                                style={{ left: 0, top: "50%", transform: "translateY(-50%)", opacity: lerp(1, 0, progress * 2) }}
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
                                left: clipped && progress < 0.5 ? "8px" : 0,
                                width: clipped && progress < 0.5 ? "calc(100% - 8px)" : "100%",
                                backgroundColor: barColor,
                                borderRadius: progress > 0.7
                                  ? "9999px"
                                  : clipped ? "0 3px 3px 0" : "3px",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Location label */}
                    <div
                      className="w-[120px] shrink-0 hidden sm:block"
                      style={{ opacity: labelOpacity }}
                    >
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

              {/* Year axis — aligned with bar area using same flex layout */}
              <div className="flex items-start gap-3 px-1 -mx-1 mt-1">
                {/* Spacer matching company label column */}
                <div className="w-[150px] shrink-0 hidden sm:block" style={{ opacity: labelOpacity }} />
                <div className="relative flex-1">
                  {/* Baseline rule */}
                  <div className="w-full" style={{ height: "1px", backgroundColor: "rgba(45, 42, 38, 0.25)" }} />

                  {/* Year ticks + labels */}
                  {timelineEras.map((era) => {
                    const yr = parseInt(era.year);
                    const isMajor = yr % 5 === 0 || yr === 2013;
                    const isAccented = yr === 2013;
                    if (!isMajor && progress > 0.5) return null;
                    const tickColor = isAccented && progress < 0.5 ? "var(--color-terracotta)" : "rgba(45, 42, 38, 0.25)";
                    const labelColor = isAccented && progress < 0.5 ? "var(--color-terracotta)" : "rgba(45, 42, 38, 0.45)";
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
                            height: `${isMajor ? tickHeight : minorTickHeight}px`,
                            backgroundColor: tickColor,
                          }}
                        />
                        {isMajor && (
                          <span
                            className="font-mono mt-0.5 whitespace-nowrap"
                            style={{
                              fontSize: `${yearFontSize}px`,
                              color: labelColor,
                            }}
                          >
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
                            height: `${tickHeight}px`,
                            backgroundColor: "var(--color-terracotta)",
                          }}
                        />
                        {progress < 0.5 && (
                          <span
                            className="font-mono mt-0.5 whitespace-nowrap"
                            style={{
                              fontSize: `${yearFontSize}px`,
                              color: "var(--color-terracotta)",
                              opacity: lerp(1, 0, progress * 2),
                            }}
                          >
                            Today
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                {/* Spacer matching location label column */}
                <div className="w-[120px] shrink-0 hidden sm:block" style={{ opacity: labelOpacity }} />
              </div>

              {/* Row hover — floating callout card */}
              {hoveredCompany && hoverEnabled && (() => {
                const group = groups.find(g => g.company === hoveredCompany);
                if (!group) return null;
                const color = getColor(hoveredCompany);
                return (
                  <div
                    className="absolute z-30 pointer-events-none sm:left-[153px] left-0 right-0"
                    style={{ top: `${hoveredRowTop + 8}px` }}
                  >
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
          </div>
        </div>
      </div>
      {/* Sentinel for scroll progress measurement */}
      <div ref={sentinelRef} id="gantt-sentinel" />
    </>
  );
}
