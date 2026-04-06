"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { timelineEntries, timelineEras, eraLabels } from "@/data/timeline";
import { pct, groupByCompany, getColor } from "@/lib/timeline";
import { lerp } from "@/lib/useScrollCard";
import { siteConfig } from "@/data/siteConfig";

/*
  Scroll choreography (fuel: 1200px sentinel below a spacer):

  The Gantt renders as a FIXED element during reveal/hold/migrate,
  then transitions to a STICKY element for the collapse phase.
  This avoids the dead-scroll problem where sticky positioning
  delays appearance based on viewport geometry.

  Phase 1 — REVEAL (0–0.4):  Fixed at vertical center. Rows appear.
  Phase 2 — HOLD (0.4–0.5):  Fully revealed, hover enabled.
  Phase 3 — MIGRATE (0.5–0.7): Slides from center to top: HEADER_HEIGHT.
  Phase 4 — COLLAPSE (0.7–1.0): Rows collapse, nav links appear.
*/

const SCROLL_FUEL = 1200;
const HEADER_HEIGHT = 52;

export default function GanttTimeline() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [sentinelTop, setSentinelTop] = useState(0);

  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [hoveredRowTop, setHoveredRowTop] = useState(0);

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = sentinelRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const scrollInto = -rect.top;
        setProgress(Math.max(0, Math.min(1, scrollInto / SCROLL_FUEL)));
        setSentinelTop(rect.top);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const groups = useMemo(() => groupByCompany(timelineEntries), []);
  const N = groups.length;

  // Phase breakdowns
  // Reveal takes 45% of scroll, then a generous hold (45-65%) where the
  // fully-revealed Gantt sits in the center with no animation.
  // Migrate (65-80%), collapse (80-100%).
  const revealProgress = Math.min(1, progress / 0.45);
  const migrateT = Math.max(0, Math.min(1, (progress - 0.65) / 0.15));
  const collapseProgress = Math.max(0, Math.min(1, (progress - 0.80) / 0.20));

  // Visibility: show the Gantt once the sentinel is in view (progress > 0)
  const ganttVisible = progress > 0;

  // Positioning: use fixed during reveal/hold/migrate, then sticky for collapse
  const isCollapsePhase = progress >= 0.7;
  const ganttApproxHeight = 340;
  const centerY = `calc(50vh - ${ganttApproxHeight / 2}px)`;
  const finalY = `${HEADER_HEIGHT}px`;

  // During reveal+hold: centered. During migrate: sliding to top.
  const fixedTop = migrateT < 1
    ? `calc(${centerY} + (${finalY} - ${centerY}) * ${migrateT})`
    : finalY;

  // Visual interpolations
  const backdropOpacity = lerp(0, 0.92, revealProgress);
  const revealAxisOpacity = lerp(0, 1, Math.max(0, (revealProgress - 0.5) / 0.5));
  const navRowOpacity = lerp(0, 1, Math.max(0, (collapseProgress - 0.3) / 0.7));
  const verticalPadding = lerp(24, 8, collapseProgress);
  const tickHeight = lerp(8, 4, collapseProgress);
  const minorTickHeight = lerp(5, 3, collapseProgress);
  const yearFontSize = lerp(9, 7, collapseProgress);
  const maxWidth = lerp(1250, 1200, collapseProgress);
  const hoverEnabled = revealProgress >= 1 && collapseProgress < 0.05;

  const handleRowEnter = useCallback(
    (company: string, e: React.MouseEvent) => {
      if (!hoverEnabled) return;
      setHoveredCompany(company);
      const rect = ganttRef.current?.getBoundingClientRect();
      const rowRect = e.currentTarget.getBoundingClientRect();
      if (rect) setHoveredRowTop(rowRect.bottom - rect.top);
    },
    [hoverEnabled]
  );

  return (
    <>
      {/* Sentinel — scroll fuel (progress tracks scroll through this) */}
      <div
        ref={sentinelRef}
        id="gantt-sentinel"
        style={{ height: `calc(${SCROLL_FUEL}px + 50vh)`, position: "relative" }}
      />

      {/* Gantt — fixed during reveal/hold/migrate, sticky during collapse */}
      {ganttVisible && (
        <div
          ref={ganttRef}
          style={{
            position: "fixed",
            top: isCollapsePhase ? finalY : fixedTop,
            left: 0,
            right: 0,
            zIndex: 39,
            backgroundColor: `rgba(245, 240, 235, ${backdropOpacity})`,
            backdropFilter: revealProgress > 0 ? "blur(12px)" : "none",
            borderBottom:
              collapseProgress > 0.1
                ? "1px solid rgba(45, 42, 38, 0.08)"
                : "1px solid transparent",
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              maxWidth: `${maxWidth}px`,
              marginLeft: "auto",
              marginRight: "auto",
              paddingLeft: `${lerp(24, 16, collapseProgress)}px`,
              paddingRight: `${lerp(24, 16, collapseProgress)}px`,
              paddingTop: `${verticalPadding}px`,
              paddingBottom: `${verticalPadding}px`,
            }}
          >
            {/* Nav links — fade in during collapse, positioned in the hero header row */}
            {navRowOpacity > 0.01 && (
              <div
                className="flex gap-5 items-center justify-end"
                style={{
                  position: "fixed",
                  top: "18px",
                  right: "16px",
                  zIndex: 46,
                  opacity: navRowOpacity,
                  pointerEvents: navRowOpacity > 0.3 ? "auto" : "none",
                }}
              >
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
            )}

            {/* Gantt rows */}
            <div className="relative">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: `${lerp(3, 0, collapseProgress)}px`,
                }}
              >
                {groups.map(({ company, entries }, groupIndex) => {
                  const color = getColor(company);

                  const revealStart = groupIndex / N;
                  const revealT = Math.max(
                    0,
                    Math.min(1, (revealProgress - revealStart) * N)
                  );

                  const visualIndex = N - 1 - groupIndex;
                  const collapseStart = visualIndex / N;
                  const collapseT = Math.max(
                    0,
                    Math.min(1, (collapseProgress - collapseStart) * N)
                  );

                  if (collapseT >= 1) return null;

                  const isRevealing = revealProgress < 1;
                  const rowOpacity = isRevealing
                    ? lerp(0, 1, revealT)
                    : lerp(1, 0, collapseT);
                  // Height grows in the first 40% of revealT (smooth unfold),
                  // then stays at full height while the clip sweep continues
                  const heightT = Math.min(1, revealT / 0.4);
                  const rowHeight = isRevealing
                    ? lerp(0, 14, heightT)
                    : lerp(14, 0, collapseT);

                  return (
                    <div
                      key={company}
                      className="flex items-center px-1 -mx-1"
                      style={{
                        gap: "12px",
                        opacity: rowOpacity,
                        height: `${rowHeight}px`,
                        overflow: "hidden",
                        backgroundColor:
                          hoveredCompany === company && hoverEnabled
                            ? "rgba(45, 42, 38, 0.03)"
                            : "transparent",
                      }}
                      onMouseEnter={(e) => handleRowEnter(company, e)}
                      onMouseLeave={() => setHoveredCompany(null)}
                    >
                      {/* Company label */}
                      <div
                        className="shrink-0 text-right hidden sm:block"
                        style={{
                          width: `${lerp(150, 0, collapseProgress)}px`,
                          minWidth: 0,
                        }}
                      >
                        <p
                          className="font-mono text-[8px] leading-tight truncate"
                          style={{
                            color:
                              hoveredCompany === company
                                ? color.vivid
                                : "rgba(45, 42, 38, 0.4)",
                          }}
                        >
                          {company}
                        </p>
                      </div>

                      {/* Bars — row clips left-to-right during reveal */}
                      {(() => {
                        // Clip sweep starts after height settles (revealT > 0.2)
                        // and progresses more slowly across the full range
                        const clipT = isRevealing
                          ? Math.max(0, Math.min(1, (revealT - 0.15) / 0.85))
                          : 1;
                        const clipRight = lerp(100, 0, clipT);
                        return (
                      <div
                        className="relative flex-1"
                        style={{
                          height: "14px",
                          clipPath: isRevealing && clipRight > 0.5
                            ? `inset(0 ${clipRight}% 0 0)`
                            : undefined,
                        }}
                      >
                        {entries.map((entry, i) => {
                          const rawLeft = pct(entry.startMonth);
                          const clipped = rawLeft < 0;
                          const left = Math.max(rawLeft, 0);
                          const rawRight = pct(entry.endMonth);
                          const w = Math.max(
                            Math.min(rawRight, 100) - left,
                            0.8
                          );
                          const isRowHovered =
                            hoveredCompany === company && hoverEnabled;
                          return (
                            <div
                              key={i}
                              className="absolute h-full flex items-center"
                              style={{
                                left: `${left}%`,
                                width: `${w}%`,
                                minWidth: "4px",
                              }}
                            >
                              {clipped && (
                                <svg
                                  className="absolute shrink-0"
                                  style={{
                                    left: 0,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                  }}
                                  width="8"
                                  height="14"
                                  viewBox="0 0 8 14"
                                >
                                  <polygon
                                    points="8,0 0,7 8,14"
                                    fill={
                                      isRowHovered
                                        ? color.vivid
                                        : color.muted
                                    }
                                  />
                                </svg>
                              )}
                              <div
                                className="absolute h-full w-full"
                                style={{
                                  left: clipped ? "8px" : 0,
                                  width: clipped
                                    ? "calc(100% - 8px)"
                                    : "100%",
                                  backgroundColor: isRowHovered
                                    ? color.vivid
                                    : color.muted,
                                  borderRadius: clipped
                                    ? "0 3px 3px 0"
                                    : "3px",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                        );
                      })()}

                      {/* Location label */}
                      <div
                        className="shrink-0 hidden sm:block"
                        style={{
                          width: `${lerp(120, 0, collapseProgress)}px`,
                          minWidth: 0,
                        }}
                      >
                        <p
                          className="font-mono text-[8px] leading-tight truncate"
                          style={{
                            color:
                              hoveredCompany === company
                                ? color.vivid
                                : "rgba(45, 42, 38, 0.3)",
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
              <div
                className="flex items-start px-1 -mx-1 mt-1"
                style={{
                  gap: `${lerp(12, 0, collapseProgress)}px`,
                  opacity: revealProgress < 1 ? revealAxisOpacity : 1,
                }}
              >
                <div
                  className="shrink-0 hidden sm:block"
                  style={{
                    width: `${lerp(150, 0, collapseProgress)}px`,
                    minWidth: 0,
                  }}
                />
                <div className="relative flex-1">
                  <div
                    className="w-full"
                    style={{
                      height: "1px",
                      backgroundColor: "rgba(45, 42, 38, 0.25)",
                    }}
                  />
                  {timelineEras.map((era) => {
                    const yr = parseInt(era.year);
                    const isMajor = yr % 5 === 0 || yr === 2013;
                    if (!isMajor && collapseProgress > 0.5) return null;
                    const isAccented = yr === 2013;
                    const tickColor =
                      isAccented && collapseProgress < 0.5
                        ? "var(--color-terracotta)"
                        : "rgba(45, 42, 38, 0.25)";
                    const labelColor =
                      isAccented && collapseProgress < 0.5
                        ? "var(--color-terracotta)"
                        : "rgba(45, 42, 38, 0.45)";
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
                  {(() => {
                    const now = new Date();
                    const todayMonth =
                      (now.getFullYear() - 2013) * 12 + now.getMonth();
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
                        {collapseProgress < 0.5 && (
                          <span
                            className="font-mono mt-0.5 whitespace-nowrap"
                            style={{
                              fontSize: `${yearFontSize}px`,
                              color: "var(--color-terracotta)",
                              opacity: lerp(1, 0, collapseProgress * 2),
                            }}
                          >
                            Today
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div
                  className="shrink-0 hidden sm:block"
                  style={{
                    width: `${lerp(120, 0, collapseProgress)}px`,
                    minWidth: 0,
                  }}
                />
              </div>

              {/* Era labels */}
              <div
                className="flex items-start px-1 -mx-1"
                style={{
                  gap: `${lerp(12, 0, collapseProgress)}px`,
                  opacity:
                    revealProgress < 1
                      ? revealAxisOpacity
                      : lerp(1, 0, collapseProgress * 2),
                }}
              >
                <div
                  className="shrink-0 hidden sm:block"
                  style={{
                    width: `${lerp(150, 0, collapseProgress)}px`,
                    minWidth: 0,
                  }}
                />
                <div className="relative flex-1" style={{ height: "14px" }}>
                  {eraLabels.map((era) => {
                    const left = pct(era.startMonth);
                    const right = pct(era.endMonth);
                    const width = right - left;
                    return (
                      <div
                        key={era.label}
                        className="absolute top-0 flex flex-col items-center"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <div
                          className="w-full"
                          style={{
                            height: "2px",
                            backgroundColor: era.color,
                            opacity: 0.4,
                            borderRadius: "1px",
                          }}
                        />
                        <span
                          className="font-mono whitespace-nowrap mt-0.5"
                          style={{
                            fontSize: "7px",
                            color: era.color,
                            opacity: 0.7,
                          }}
                        >
                          {era.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="shrink-0 hidden sm:block"
                  style={{
                    width: `${lerp(120, 0, collapseProgress)}px`,
                    minWidth: 0,
                  }}
                />
              </div>

              {/* Hover card */}
              {hoveredCompany &&
                hoverEnabled &&
                (() => {
                  const group = groups.find(
                    (g) => g.company === hoveredCompany
                  );
                  if (!group) return null;
                  const color = getColor(hoveredCompany);
                  return (
                    <div
                      className="absolute z-30 pointer-events-none left-0 right-0"
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
                            {group.entries[0].start} –{" "}
                            {group.entries[group.entries.length - 1].end}
                          </p>
                        </div>
                        <div className="grid gap-3">
                          {group.entries.map((entry, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3"
                            >
                              <div
                                className="w-2 h-2 rounded-full shrink-0 mt-[5px]"
                                style={{
                                  backgroundColor: color.vivid,
                                }}
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
                                {entry.highlights &&
                                  entry.highlights.length > 0 && (
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
      )}
    </>
  );
}
