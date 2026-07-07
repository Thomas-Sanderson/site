"use client";

import { useEffect, useRef, useState } from "react";
import {
  VBW,
  VBH,
  GRATICULE,
  LAND_PATHS,
  FULL_PATH_D,
  NODES,
  MONTHS_PROJ,
  N,
  type LifeNode,
} from "@/lib/lifeMapGeometry";
import { useLifeDraw } from "@/lib/useLifeDraw";
import { createLifeMapAudio, type LifeMapAudio } from "@/lib/lifeMapAudio";
import { MODE_HEX, MODE_LABEL, type Mode } from "@/data/lifeGrid";

// Legend display order (matches the life-line reference).
const LEGEND_MODES: Mode[] = ["live", "make", "work", "learn", "travel"];

interface TipState {
  name: string;
  sub: string;
  left: number;
  top: number;
}

/**
 * Life Map — every place I've lived, worked, and wandered.
 *
 * Progressive enhancement: this server-renders the COMPLETE final map (full
 * route path, every place at full radius with its concentric mode-rings,
 * graticule, land). No-JS and reduced-motion both rest on exactly this state.
 * `useLifeDraw` only resets+plays the 30s draw once JS is alive and motion is
 * allowed, auto-starting when the section scrolls into view. Hover tooltips are
 * a pure pointer enhancement over transparent hit-circles.
 *
 * Optional sound: an opt-in Web Audio "score" (see `lifeMapAudio`) plays one
 * fading note per dot as it appears — a bass voice for the home/live dots and
 * snap/horn/snare/keys for the other dot types, pitched by each dot's distance
 * from the current home and length-modulated by its growth time. It is off by
 * default and enabled only from a user gesture (autoplay policy).
 */
export default function LifeMap() {
  const last = MONTHS_PROJ[N - 1];
  const lastLive = [...MONTHS_PROJ].reverse().find((m) => m.mode === "live");
  const homeLabel = lastLive ? `${lastLive.place}, ${lastLive.region}` : "";

  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<LifeMapAudio | null>(null);
  const drawingRef = useRef(false);
  const getAudio = () => (audioRef.current ??= createLifeMapAudio());

  const { rootRef, replay } = useLifeDraw<HTMLElement>({
    onDotEnter: (d) => audioRef.current?.triggerDot(d),
    onStart: () => {
      drawingRef.current = true;
      if (soundOn) audioRef.current?.start();
    },
    onEnd: () => {
      drawingRef.current = false;
      audioRef.current?.stop();
    },
  });

  // Tear the audio context down when the map unmounts.
  useEffect(() => () => audioRef.current?.dispose(), []);

  const toggleSound = async () => {
    const audio = getAudio();
    if (soundOn) {
      audio.disable();
      setSoundOn(false);
    } else {
      await audio.enable(); // resume the context inside this click gesture
      setSoundOn(true);
      if (drawingRef.current) audio.start(); // join a draw already in progress
    }
  };

  const watch = () => {
    // Resume the context within the gesture so the score can start after the
    // pre-roll delay (which is not itself a user gesture).
    if (soundOn) getAudio().enable();
    replay();
  };

  const stageRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  const showTip = (n: LifeNode) => (e: React.PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    setTip({ name: n.tipName, sub: n.tipSub, left: e.clientX - r.left, top: e.clientY - r.top });
  };
  const hideTip = () => setTip(null);

  return (
    <section
      ref={rootRef}
      id="map"
      className="lifemap relative min-h-[100svh] px-6 md:px-12 max-w-[1120px] mx-auto py-16 sm:py-24 flex flex-col justify-center"
    >
      {/* Heading */}
      <header className="mb-5">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight max-w-[20ch]">
          Every place I&rsquo;ve lived, worked, and wandered.
        </h2>
      </header>

      {/* Stage */}
      <div ref={stageRef} className="lifemap-stage relative">
        {/* Year + current home — subtle, bottom-right, in the continent tone */}
        <div
          className="pointer-events-none select-none absolute right-4 bottom-3 z-10 text-right"
          style={{ color: "#C9B89B" }}
        >
          <div
            data-lifemap-year
            className="font-mono font-semibold tabular-nums tracking-wide leading-none text-[clamp(18px,2.6vw,26px)]"
          >
            {last.year}
          </div>
          <div
            data-lifemap-place
            className="font-mono tracking-wide leading-none mt-1 text-[11px] min-h-[1em]"
          >
            {homeLabel}
          </div>
        </div>

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
                    data-lifemap-r={b.r}
                    cx={n.x}
                    cy={n.y}
                    r={b.r}
                    fill={b.color}
                  />
                ))}
                {/* Transparent pointer target → hover tooltip */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.hitR}
                  data-lifemap-hit={n.key}
                  className="lifemap-hit"
                  aria-hidden="true"
                  onPointerEnter={showTip(n)}
                  onPointerMove={showTip(n)}
                  onPointerLeave={hideTip}
                />
              </g>
            ))}
          </g>
        </svg>

        {/* Hover tooltip (pointer enhancement) */}
        {tip && (
          <div className="lifemap-tip" style={{ left: tip.left, top: tip.top }}>
            <b>{tip.name}</b>
            <span className="lifemap-tip-sub">{tip.sub}</span>
          </div>
        )}
      </div>

      {/* Modes key + controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
            Key
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Turn map sound off" : "Turn map sound on"}
            title="Score the journey with sound"
            className="font-mono text-xs tracking-[0.04em] inline-flex items-center gap-2 rounded-full px-4 py-2 border transition-colors active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-teal)] focus-visible:outline-offset-2"
            style={{
              borderColor: soundOn ? "var(--color-teal)" : "rgba(45,42,38,0.2)",
              color: soundOn ? "var(--color-teal)" : "var(--color-muted)",
              backgroundColor: soundOn ? "rgba(42,107,90,0.08)" : "transparent",
            }}
          >
            {soundOn ? "♪ Sound on" : "♪ Sound off"}
          </button>
          <button
            type="button"
            onClick={watch}
            aria-label="Watch the journey animation"
            className="font-mono text-xs tracking-[0.04em] inline-flex items-center gap-2 rounded-full px-4 py-2 text-[color:var(--color-cream)] bg-[color:var(--color-charcoal)] transition-transform active:translate-y-px hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-teal)] focus-visible:outline-offset-2"
          >
            ▷ Watch the journey
          </button>
        </div>
      </div>
    </section>
  );
}
