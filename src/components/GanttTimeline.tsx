"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { timelineEntries, timelineEras, eraLabels } from "@/data/timeline";
import { pct, groupByCompany, getColor } from "@/lib/timeline";
import { lerp } from "@/lib/useScrollCard";
import { useIsMobile } from "@/lib/useIsMobile";
import { siteConfig } from "@/data/siteConfig";

const HEADER_HEIGHT = 52;

export default function GanttTimeline() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();

  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [hoveredRowTop, setHoveredRowTop] = useState(0);

  // Responsive scroll fuel
  const scrollFuel = isMobile ? 700 : 1200;

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
        setProgress(Math.max(0, Math.min(1, scrollInto / scrollFuel)));
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollFuel]);

  // Dismiss hover card on tap outside (mobile)
  useEffect(() => {
    if (!isMobile || !hoveredCompany) return;
    const dismiss = (e: MouseEvent) => {
      if (ganttRef.current && !ganttRef.current.contains(e.target as Node)) {
        setHoveredCompany(null);
      }
    };
    // Delay to avoid immediate dismiss from the same tap
    const timer = setTimeout(() => {
      document.addEventListener("click", dismiss);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", dismiss);
    };
  }, [isMobile, hoveredCompany]);

  const groups = useMemo(() => groupByCompany(timelineEntries), []);
  const N = groups.length;

  // Phase breakdowns
  const revealProgress = Math.min(1, progress / 0.45);
  const migrateT = Math.max(0, Math.min(1, (progress - 0.65) / 0.15));
  const collapseProgress = Math.max(0, Math.min(1, (progress - 0.80) / 0.20));

  const ganttVisible = progress > 0;

  const ganttApproxHeight = 340;
  const centerY = `calc(50vh - ${ganttApproxHeight / 2}px)`;
  const finalY = `${HEADER_HEIGHT}px`;
  const fixedTop = migrateT < 1
    ? `calc(${centerY} + (${finalY} - ${centerY}) * ${migrateT})`
    : finalY;

  // Visual interpolations
  const backdropOpacity = lerp(0, 0.92, revealProgress);
  const revealAxisOpacity = lerp(0, 1, Math.max(0, (revealProgress - 0.5) / 0.5));
  const navRowOpacity = lerp(0, 1, Math.max(0, (collapseProgress - 0.3) / 0.7));
  const verticalPadding = lerp(isMobile ? 16 : 24, 8, collapseProgress);
  const tickHeight = lerp(8, 4, collapseProgress);
  const minorTickHeight = lerp(5, 3, collapseProgress);
  const yearFontSize = lerp(9, 7, collapseProgress);
  const maxWidth = isMobile ? "100%" : `${lerp(1250, 1200, collapseProgress)}px`;
  const hoverEnabled = revealProgress >= 1 && collapseProgress < 0.05;

  // Desktop: hover. Mobile: tap to toggle.
  const handleRowEnter = useCallback(
    (company: string, e: React.MouseEvent) => {
      if (isMobile || !hoverEnabled) return;
      setHoveredCompany(company);
      const rect = ganttRef.current?.getBoundingClientRect();
      const rowRect = e.currentTarget.getBoundingClientRect();
      if (rect) setHoveredRowTop(rowRect.bottom - rect.top);
    },
    [hoverEnabled, isMobile]
  );

  const handleRowLeave = useCallback(() => {
    if (isMobile) return;
    setHoveredCompany(null);
  }, [isMobile]);

  const handleRowClick = useCallback(
    (company: string, e: React.MouseEvent) => {
      if (!isMobile || !hoverEnabled) return;
      e.stopPropagation();
      setHoveredCompany((prev) => (prev === company ? null : company));
      const rect = ganttRef.current?.getBoundingClientRect();
      const rowRect = e.currentTarget.getBoundingClientRect();
      if (rect) setHoveredRowTop(rowRect.bottom - rect.top);
    },
    [hoverEnabled, isMobile]
  );

  const padL = lerp(isMobile ? 12 : 24, isMobile ? 8 : 16, collapseProgress);
  const padR = padL;

  return (
    <>
      {/* Sentinel — scroll fuel */}
      <div
        ref={sentinelRef}
        id="gantt-sentinel"
        style={{ height: `calc(${scrollFuel}px + 50vh)`, position: "relative" }}
      />

      {/* Gantt — fixed overlay */}
      {ganttVisible && (
        <div
          ref={ganttRef}
          style={{
            position: "fixed",
            top: fixedTop,
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
              maxWidth,
              marginLeft: "auto",
              marginRight: "auto",
              paddingLeft: `${padL}px`,
              paddingRight: `${padR}px`,
              paddingTop: `${verticalPadding}px`,
              paddingBottom: `${verticalPadding}px`,
            }}
          >
            {/* Nav links — fade in during collapse */}
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
                  const heightT = Math.min(1, revealT / 0.4);
                  const rowHeight = isRevealing
                    ? lerp(0, 14, heightT)
                    : lerp(14, 0, collapseT);

                  const isRowActive = hoveredCompany === company && hoverEnabled;

                  return (
                    <div
                      key={company}
                      className="flex items-center px-1 -mx-1"
                      style={{
                        gap: isMobile ? "6px" : "12px",
                        opacity: rowOpacity,
                        height: `${rowHeight}px`,
                        overflow: "hidden",
                        backgroundColor: isRowActive
                          ? "rgba(45, 42, 38, 0.03)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => handleRowEnter(company, e)}
                      onMouseLeave={handleRowLeave}
                      onClick={(e) => handleRowClick(company, e)}
                    >
                      {/* Company label — desktop only */}
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
                            color: isRowActive
                              ? color.vivid
                              : "rgba(45, 42, 38, 0.4)",
                          }}
                        >
                          {company}
                        </p>
                      </div>

                      {/* Bars */}
                      {(() => {
                        const clipT = isRevealing
                          ? Math.max(0, Math.min(1, (revealT - 0.15) / 0.85))
                          : 1;
                        const clipRight = lerp(100, 0, clipT);
                        return (
                          <div
                            className="relative flex-1"
                            style={{
                              height: "14px",
                              clipPath:
                                isRevealing && clipRight > 0.5
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
                                          isRowActive
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
                                      backgroundColor: isRowActive
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

                      {/* Location label — desktop only */}
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
                            color: isRowActive
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

              {/* Era labels — above the year axis line */}
              <div
                className="flex items-end px-1 -mx-1 mt-1"
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
                    const w = right - left;
                    const shortLabels: Record<string, string> = {
                      "Consulting": "Consult.",
                      "Art + Independence": "Art+Ind.",
                      "Behavioral Health": "BH",
                      "Acceleration": "Accel.",
                    };
                    return (
                      <div
                        key={era.label}
                        className="absolute bottom-0 flex flex-col items-center"
                        style={{ left: `${left}%`, width: `${w}%` }}
                      >
                        <span
                          className="font-mono whitespace-nowrap mb-0.5"
                          style={{
                            fontSize: "7px",
                            color: era.color,
                            opacity: 0.7,
                          }}
                        >
                          {isMobile ? shortLabels[era.label] || era.label : era.label}
                        </span>
                        <div
                          className="w-full"
                          style={{
                            height: "2px",
                            backgroundColor: era.color,
                            opacity: 0.4,
                            borderRadius: "1px",
                          }}
                        />
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

              {/* Year axis */}
              <div
                className="flex items-start px-1 -mx-1"
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
                    // Edge labels align inward to avoid clipping
                    const isLeft = yr === 2013 || yr === 2015;
                    const isRight = yr === 2025;
                    const align = isLeft ? "items-start" : isRight ? "items-end" : "items-center";
                    const tx = isLeft ? "translateX(0)" : isRight ? "translateX(-100%)" : "translateX(-50%)";
                    return (
                      <div
                        key={era.label}
                        className={`absolute top-0 flex flex-col ${align}`}
                        style={{
                          left: `${pct(era.month)}%`,
                          transform: tx,
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
                        className="absolute top-0 flex flex-col items-end"
                        style={{
                          left: `${pct(todayMonth)}%`,
                          transform: "translateX(-100%)",
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


              {/* Hover/tap card */}
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
                      className="absolute z-30 left-0 right-0"
                      style={{
                        top: `${hoveredRowTop + 8}px`,
                        pointerEvents: isMobile ? "auto" : "none",
                      }}
                    >
                      <div
                        className="sm:ml-12 ml-4 w-0 h-0"
                        style={{
                          borderLeft: "8px solid transparent",
                          borderRight: "8px solid transparent",
                          borderBottom: `8px solid ${color.vivid}`,
                        }}
                      />
                      <div
                        className="bg-warm-white rounded-xl shadow-lg px-4 py-4 sm:px-8 sm:py-6 border w-full"
                        style={{
                          borderColor: "rgba(45, 42, 38, 0.06)",
                          borderTop: `2px solid ${color.vivid}`,
                        }}
                      >
                        <div className="flex items-baseline justify-between mb-4">
                          <h3 className="font-serif font-bold text-base sm:text-lg leading-tight">
                            {hoveredCompany}
                          </h3>
                          <p className="font-mono text-[10px] sm:text-xs text-charcoal/40">
                            {group.entries[0].start} –{" "}
                            {group.entries[group.entries.length - 1].end}
                          </p>
                        </div>
                        <div className="grid gap-2 sm:gap-3">
                          {group.entries.map((entry, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 sm:gap-3"
                            >
                              <div
                                className="w-2 h-2 rounded-full shrink-0 mt-[5px]"
                                style={{
                                  backgroundColor: color.vivid,
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2 sm:gap-4">
                                  <p className="text-xs sm:text-sm font-medium leading-snug">
                                    {entry.role}
                                  </p>
                                  <p className="font-mono text-[9px] sm:text-[10px] text-charcoal/40 shrink-0">
                                    {entry.duration}
                                  </p>
                                </div>
                                <p className="font-mono text-[9px] sm:text-[10px] text-charcoal/35 mt-0.5">
                                  {entry.type} · {entry.location}
                                </p>
                                {entry.highlights &&
                                  entry.highlights.length > 0 && (
                                    <p className="text-[11px] sm:text-xs text-charcoal/50 mt-1 leading-relaxed hidden sm:block">
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
