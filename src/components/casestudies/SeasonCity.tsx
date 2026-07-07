"use client";

/**
 * One city — every season, every hour. The level-design payoff, shown with real
 * frames from the shipped game rather than a redrawn approximation, and driven
 * by the reader instead of an auto-cycling GIF.
 *
 * Two interactive panels, both the SAME tree-lined avenue (the "Весна" city
 * level), captured frame by frame from the running game:
 *   • Seasons — spring / summer / autumn / winter. The same birch, linden, and
 *     ornamental trees leaf, turn, and go bare; the ground greens then snows over.
 *   • Time of day — dawn → night, the engine's sky + scene-lighting system
 *     carrying the street from amber dawn to a starlit night.
 *
 * Click a phase to switch; every frame is preloaded and stacked so switching is
 * an instant cross-fade, not a reload. Geometry is data; the season and the hour
 * are costumes. Client component (selection state) on the cream editorial page.
 */

import { useState } from "react";

type Phase = { key: string; label: string };
type Panel = {
  id: string;
  title: string;
  dir: string; // /images/chad/<dir>/<key>.png
  phases: Phase[];
  initial: string;
};

const PANELS: Panel[] = [
  {
    id: "seasons",
    title: "Four seasons",
    dir: "seasons",
    initial: "autumn",
    phases: [
      { key: "spring", label: "spring" },
      { key: "summer", label: "summer" },
      { key: "autumn", label: "autumn" },
      { key: "winter", label: "winter" },
    ],
  },
  {
    id: "times",
    title: "Time of day",
    dir: "times",
    initial: "night",
    phases: [
      { key: "dawn", label: "dawn" },
      { key: "morning", label: "morning" },
      { key: "midday", label: "midday" },
      { key: "afternoon", label: "afternoon" },
      { key: "evening", label: "evening" },
      { key: "night", label: "night" },
    ],
  },
];

function Panel({ panel }: { panel: Panel }) {
  const [sel, setSel] = useState(panel.initial);
  return (
    <figure className="m-0">
      {/* Stacked, preloaded frames — selected fades in over the others */}
      <div
        className="relative rounded-xl overflow-hidden border p-2.5"
        style={{ borderColor: "rgba(45,42,38,0.08)", backgroundColor: "var(--color-warm-white)" }}
      >
        <div className="relative w-full rounded-md overflow-hidden" style={{ aspectRatio: "1563 / 503" }}>
          {panel.phases.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.key}
              src={`/images/chad/${panel.dir}/${p.key}.png`}
              alt={`The same street in Chad Rescues Nobody at ${p.label}.`}
              className="absolute inset-0 w-full h-full"
              style={{
                imageRendering: "pixelated",
                opacity: sel === p.key ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
              aria-hidden={sel !== p.key}
              draggable={false}
            />
          ))}
        </div>
      </div>

      {/* Clickable phase selector */}
      <figcaption className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-3">
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] mr-1" style={{ color: "var(--color-charcoal)" }}>
          {panel.title}
        </span>
        <div className="flex flex-wrap items-baseline" role="tablist" aria-label={panel.title}>
          {panel.phases.map((p, i) => {
            const active = sel === p.key;
            return (
              <span key={p.key} className="flex items-baseline">
                {i > 0 && (
                  <span aria-hidden className="font-mono text-[12px] mx-1.5 select-none" style={{ color: "rgba(45,42,38,0.25)" }}>
                    ·
                  </span>
                )}
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSel(p.key)}
                  className="font-mono text-[13px] tracking-[0.02em] transition-colors"
                  style={{
                    color: active ? "var(--color-terracotta)" : "var(--color-muted)",
                    fontWeight: active ? 600 : 400,
                    borderBottom: active ? "1.5px solid var(--color-terracotta)" : "1.5px solid transparent",
                    paddingBottom: 1,
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              </span>
            );
          })}
        </div>
      </figcaption>
    </figure>
  );
}

export default function SeasonCity() {
  return (
    <div className="mt-2 flex flex-col gap-6">
      {PANELS.map((p) => (
        <Panel key={p.id} panel={p} />
      ))}
      <p className="font-mono text-[12.5px] tracking-[0.03em] text-center mt-1 mb-0 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        Same street, every season and hour.{" "}
        <span style={{ color: "var(--color-terracotta)" }}>Geometry is data; the season and the light are costumes</span>{" "}
        &mdash; so a route you learned at summer noon asks new questions on a winter night.
      </p>
    </div>
  );
}
