"use client";

import {
  VBW,
  VBH,
  GRATICULE,
  LAND_PATHS,
  FULL_PATH_D,
  NODES,
  MONTHS_PROJ,
  N,
} from "@/lib/lifeMapGeometry";
import { useLifeDraw } from "@/lib/useLifeDraw";
import { META, MODE_HEX, MODE_LABEL, type Mode } from "@/data/lifeGrid";

// Legend display order (matches the life-line reference).
const LEGEND_MODES: Mode[] = ["live", "make", "work", "learn", "travel"];

/**
 * Life Map — a line drawn through a life, paced by where it paused.
 *
 * Progressive enhancement: this server-renders the COMPLETE final map (full
 * route path, every place at full radius with its concentric mode-rings,
 * graticule, land, legend, meta copy). No-JS and reduced-motion both rest on
 * exactly this state. `useLifeDraw` only resets+plays the 30s draw once JS is
 * alive and motion is allowed, auto-starting when the section scrolls into view.
 */
export default function LifeMap() {
  const last = MONTHS_PROJ[N - 1];
  const { rootRef, replay } = useLifeDraw<HTMLElement>();

  return (
    <section
      ref={rootRef}
      id="map"
      className="lifemap relative min-h-[100svh] px-6 md:px-12 max-w-[1120px] mx-auto py-16 sm:py-24 flex flex-col justify-center"
    >
      {/* Header: eyebrow + heading + ticker */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-muted)] mb-2">
            {META.eyebrow}
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl leading-tight max-w-[20ch]">
            A line drawn through a life, paced by where it paused.
          </h2>
        </div>
        <div className="text-right min-w-[170px]">
          <div
            data-lifemap-year
            className="font-mono font-bold leading-none tabular-nums text-[clamp(34px,6vw,56px)]"
          >
            {last.year}
          </div>
          <div
            data-lifemap-place
            className="font-mono text-xs text-[color:var(--color-muted)] mt-1.5 min-h-[1.2em] tracking-wide"
          >
            {last.place}, {last.region}&nbsp;&nbsp;·&nbsp;&nbsp;{MODE_LABEL[last.mode]}
          </div>
        </div>
      </header>

      {/* Stage */}
      <div className="lifemap-stage relative rounded-[14px] overflow-hidden border border-[#E2D9C9] bg-[#F1EADD] shadow-[0_18px_40px_-28px_rgba(34,28,20,0.4)]">
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="A map tracing one person's path month by month from July 1992 to June 2026 across real geography. Each place is drawn as concentric rings showing the mix of time spent there, sized by how long."
        >
          {/* Graticule */}
          <g>
            {GRATICULE.map((g, i) => (
              <line
                key={`grat-${i}`}
                x1={g.x1}
                y1={g.y1}
                x2={g.x2}
                y2={g.y2}
                className={`lifemap-grat${g.axis ? " axis" : ""}`}
              />
            ))}
          </g>

          {/* Land */}
          <g>
            {LAND_PATHS.map((d, i) => (
              <path key={`land-${i}`} d={d} className="lifemap-land" />
            ))}
          </g>

          {/* Full route line (drawn complete in the static state) */}
          <path data-lifemap-line className="lifemap-line" d={FULL_PATH_D} />

          {/* Place nodes — concentric mode-rings at full radius */}
          <g>
            {NODES.map((n) => (
              <g key={n.key}>
                {[...n.bands].reverse().map((b, bi) => (
                  <circle
                    key={`${n.key}-band-${bi}`}
                    data-lifemap-ring={n.key}
                    cx={n.x}
                    cy={n.y}
                    r={b.r}
                    fill={b.color}
                  />
                ))}
                {/* Transparent pointer target (hover tooltip wired later) */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.hitR}
                  className="lifemap-hit"
                  aria-hidden="true"
                />
              </g>
            ))}
          </g>

          {/* Leader + halo (invisible in the static state) */}
          <circle data-lifemap-halo r={0} fill="rgba(232,99,43,0.22)" />
          <circle data-lifemap-leader r={0} fill={MODE_HEX.work} />
        </svg>
      </div>

      {/* Controls: legend + replay */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-2 text-[12.5px] text-[color:var(--color-muted)]">
            <svg width="22" height="16" className="overflow-visible block">
              <circle cx="11" cy="8" r="7" fill={MODE_HEX.travel} />
              <circle cx="11" cy="8" r="5" fill={MODE_HEX.learn} />
              <circle cx="11" cy="8" r="2.6" fill={MODE_HEX.live} />
            </svg>
            Place — rings show the mix of time, size shows how long
          </span>
          <span className="text-[12.5px] text-[color:var(--color-muted)]">
            Hover a place for its name and dates
          </span>
        </div>
        <button
          type="button"
          onClick={replay}
          aria-label="Replay the animation"
          className="font-mono text-xs tracking-[0.04em] inline-flex items-center gap-2 rounded-full px-4 py-2 text-[color:var(--color-cream)] bg-[color:var(--color-charcoal)] transition-transform active:translate-y-px hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-teal)] focus-visible:outline-offset-2"
        >
          ▷ Replay
        </button>
      </div>

      {/* Modes key */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
          Modes
        </span>
        {LEGEND_MODES.map((m) => (
          <span
            key={m}
            className="inline-flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-[color:var(--color-muted)]"
          >
            <i
              className="inline-block w-[11px] h-[11px] rounded-full"
              style={{ backgroundColor: MODE_HEX[m] }}
            />
            {MODE_LABEL[m]}
          </span>
        ))}
      </div>

      {/* Note */}
      <p
        className="font-mono text-[11.5px] leading-relaxed tracking-[0.01em] text-[color:var(--color-muted)] mt-5 max-w-[70ch]"
        dangerouslySetInnerHTML={{ __html: META.note }}
      />
    </section>
  );
}
