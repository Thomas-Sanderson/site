"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { siteConfig } from "@/data/siteConfig";
import {
  timelineEntries,
  timelineEras,
} from "@/data/timeline";
import { pct, groupByCompany, getColor, lerp } from "@/lib/timeline";

const ContentQuiz = dynamic(() => import("./ContentQuiz"), { ssr: false });

export default function GanttTimeline() {
  const ganttRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [hoveredRowTop, setHoveredRowTop] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const rect = sentinel.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (0 - rect.top) / 120));
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
  const N = groups.length;

  const navRowOpacity = lerp(0, 1, Math.max(0, (progress - 0.3) / 0.7));
  const backdropOpacity = lerp(0, 0.92, progress);
  const verticalPadding = lerp(24, 8, progress);
  const hoverEnabled = progress < 0.1;

  // Year axis interpolation
  const tickHeight = lerp(8, 4, progress);
  const minorTickHeight = lerp(5, 3, progress);
  const yearFontSize = lerp(9, 7, progress);

  // Container width: Gantt (960) → Map (1200) as it collapses
  const maxWidth = lerp(960, 1200, progress);

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
        <style>{`
          [data-gantt-container] {
            max-width: ${maxWidth}px;
            margin-left: auto;
            margin-right: auto;
            padding-left: ${lerp(24, 16, progress)}px;
            padding-right: ${lerp(24, 16, progress)}px;
          }
          @media (min-width: 768px) {
            [data-gantt-container] {
              padding-left: ${lerp(48, 16, progress)}px;
              padding-right: ${lerp(48, 16, progress)}px;
            }
          }
        `}</style>
        <div
          data-gantt-container=""
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
            <div className="flex gap-5 items-center">
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
              <button
                onClick={() => setQuizOpen(true)}
                className="font-mono text-[10px] tracking-wide hover:opacity-70 transition-opacity hidden sm:block"
                style={{ color: "rgba(45, 42, 38, 0.5)" }}
                title="Edit content data"
              >
                &#9998;
              </button>
            </div>
          </div>

          {/* Gantt rows — each row disappears one-by-one from top */}
          <div className="relative">
            <style>{`
              @media (min-width: 640px) {
                [data-gantt-bleed] { margin-left: ${lerp(-160, 0, progress)}px; }
              }
            `}</style>
            <div data-gantt-bleed="">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: `${lerp(3, 0, progress)}px`,
                }}
              >
                {groups.map(({ company, entries }, groupIndex) => {
                  const color = getColor(company);

                  // Staggered: top rows disappear first
                  // column-reverse means groupIndex 0 = bottom, N-1 = top
                  const visualIndex = N - 1 - groupIndex;
                  const rowStart = visualIndex / N;
                  const rowT = Math.max(0, Math.min(1, (progress - rowStart) * N));

                  // Row is fully gone when rowT >= 1
                  if (rowT >= 1) return null;

                  const rowOpacity = lerp(1, 0, rowT);
                  const rowHeight = lerp(14, 0, rowT);

                  return (
                    <div
                      key={company}
                      className="flex items-center px-1 -mx-1"
                      style={{
                        gap: "12px",
                        opacity: rowOpacity,
                        height: `${rowHeight}px`,
                        overflow: "hidden",
                        backgroundColor: hoveredCompany === company && hoverEnabled
                          ? "rgba(45, 42, 38, 0.03)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!hoverEnabled) return;
                        setHoveredCompany(company);
                        const rect = ganttRef.current?.getBoundingClientRect();
                        const rowRect = e.currentTarget.getBoundingClientRect();
                        if (rect) setHoveredRowTop(rowRect.bottom - rect.top);
                      }}
                      onMouseLeave={() => setHoveredCompany(null)}
                    >
                      {/* Company label */}
                      <div className="shrink-0 text-right hidden sm:block" style={{ width: "150px" }}>
                        <p
                          className="font-mono text-[8px] leading-tight truncate"
                          style={{
                            color: hoveredCompany === company ? color.vivid : "rgba(45, 42, 38, 0.4)",
                          }}
                        >
                          {company}
                        </p>
                      </div>
                      {/* Bar row */}
                      <div className="relative flex-1" style={{ height: "14px" }}>
                        {entries.map((entry, i) => {
                          const rawLeft = pct(entry.startMonth);
                          const clipped = rawLeft < 0;
                          const left = Math.max(rawLeft, 0);
                          const rawRight = pct(entry.endMonth);
                          const w = Math.max(Math.min(rawRight, 100) - left, 0.8);
                          const isRowHovered = hoveredCompany === company && hoverEnabled;
                          return (
                            <div
                              key={i}
                              className="absolute h-full flex items-center"
                              style={{ left: `${left}%`, width: `${w}%`, minWidth: "4px" }}
                            >
                              {clipped && (
                                <svg
                                  className="absolute shrink-0"
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
                                className="absolute h-full w-full"
                                style={{
                                  left: clipped ? "8px" : 0,
                                  width: clipped ? "calc(100% - 8px)" : "100%",
                                  backgroundColor: isRowHovered ? color.vivid : color.muted,
                                  borderRadius: clipped ? "0 3px 3px 0" : "3px",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {/* Location label */}
                      <div className="shrink-0 hidden sm:block" style={{ width: "120px" }}>
                        <p
                          className="font-mono text-[8px] leading-tight truncate"
                          style={{
                            color: hoveredCompany === company ? color.vivid : "rgba(45, 42, 38, 0.3)",
                          }}
                        >
                          {entries[entries.length - 1].location || ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Year axis */}
              <div className="flex items-start px-1 -mx-1 mt-1" style={{ gap: `${lerp(12, 0, progress)}px` }}>
                <div className="shrink-0 hidden sm:block" style={{ width: `${lerp(150, 0, progress)}px`, minWidth: 0 }} />
                <div className="relative flex-1">
                  <div className="w-full" style={{ height: "1px", backgroundColor: "rgba(45, 42, 38, 0.25)" }} />
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
                        style={{ left: `${pct(era.month)}%`, transform: "translateX(-50%)" }}
                      >
                        <div style={{ width: "1px", height: `${isMajor ? tickHeight : minorTickHeight}px`, backgroundColor: tickColor }} />
                        {isMajor && (
                          <span className="font-mono mt-0.5 whitespace-nowrap" style={{ fontSize: `${yearFontSize}px`, color: labelColor }}>
                            {era.year}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {(() => {
                    const now = new Date();
                    const todayMonth = (now.getFullYear() - 2013) * 12 + now.getMonth();
                    return (
                      <div
                        className="absolute top-0 flex flex-col items-center"
                        style={{ left: `${pct(todayMonth)}%`, transform: "translateX(-50%)" }}
                      >
                        <div style={{ width: "1px", height: `${tickHeight}px`, backgroundColor: "var(--color-terracotta)" }} />
                        {progress < 0.5 && (
                          <span
                            className="font-mono mt-0.5 whitespace-nowrap"
                            style={{ fontSize: `${yearFontSize}px`, color: "var(--color-terracotta)", opacity: lerp(1, 0, progress * 2) }}
                          >
                            Today
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="shrink-0 hidden sm:block" style={{ width: `${lerp(120, 0, progress)}px`, minWidth: 0 }} />
              </div>

              {/* Hover card */}
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
                      style={{ borderColor: "rgba(45, 42, 38, 0.06)", borderTop: `2px solid ${color.vivid}` }}
                    >
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className="font-serif font-bold text-lg leading-tight">{hoveredCompany}</h3>
                        <p className="font-mono text-xs text-charcoal/40">
                          {group.entries[0].start} – {group.entries[group.entries.length - 1].end}
                        </p>
                      </div>
                      <div className="grid gap-3">
                        {group.entries.map((entry, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full shrink-0 mt-[5px]" style={{ backgroundColor: color.vivid }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-4">
                                <p className="text-sm font-medium leading-snug">{entry.role}</p>
                                <p className="font-mono text-[10px] text-charcoal/40 shrink-0">{entry.duration}</p>
                              </div>
                              <p className="font-mono text-[10px] text-charcoal/35 mt-0.5">{entry.type} · {entry.location}</p>
                              {entry.highlights && entry.highlights.length > 0 && (
                                <p className="text-xs text-charcoal/50 mt-1 leading-relaxed">{entry.highlights[0]}</p>
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
      <div ref={sentinelRef} id="gantt-sentinel" />
      <ContentQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />
    </>
  );
}
