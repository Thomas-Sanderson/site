"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live moon-phase widget for the AWQAT case study. Runs the app's actual moon
 * renderer — a 12×12 pixel disc lit by the synodic phase fraction (waxing on
 * the right, waning on the left, earthshine on the dark side) — against the
 * real current date, so the moon shown is tonight's moon, not a screenshot.
 * Math is verbatim from AWQAT's src/main.js, where it's pinned by headless
 * tests against known new and full moons.
 */

const STONE = "#C4B8A0";
const WHT = "#F7F3EC";
const MOON_SHADOW = "#20243a";

function moonPhaseFraction(ms: number): number {
  const SYN = 29.530588853; // synodic month, days
  const REF = Date.UTC(2000, 0, 6, 18, 14); // a known new moon
  let f = ((ms - REF) / 86400000 / SYN) % 1;
  if (f < 0) f += 1;
  return f;
}

function moonIllumination(frac: number): number {
  return (1 - Math.cos(2 * Math.PI * frac)) / 2;
}

/**
 * Name the phase from the *displayed* illumination so the label can never
 * contradict the number, and in illumination terms a viewer can read directly:
 * crescent below half, gibbous above, "half moon" at exactly 50%, and the
 * new/full extremes. We deliberately avoid "first/last quarter" — that names a
 * quarter of the lunar *cycle*, not the lit fraction, so it reads like 25%.
 * This is why a 47%-lit waning moon reads "waning crescent".
 */
function moonPhaseName(pct: number, waxing: boolean): string {
  if (pct <= 0) return "New moon";
  if (pct >= 100) return "Full moon";
  if (pct === 50) return waxing ? "Waxing half moon" : "Waning half moon";
  if (pct < 50) return waxing ? "Waxing crescent" : "Waning crescent";
  return waxing ? "Waxing gibbous" : "Waning gibbous";
}

function moonGrid(frac: number): (string | null)[][] {
  const N = 12, R = 5.7, cc = 5.5;
  const waxing = frac < 0.5;
  const a = waxing ? frac : 1 - frac;
  const T = 1 - 4 * a;
  const g: (string | null)[][] = [];
  for (let r = 0; r < N; r++) {
    g.push([]);
    for (let c = 0; c < N; c++) {
      const nx = (c - cc) / R, ny = (r - cc) / R;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) { g[r].push(null); continue; }
      const w = Math.sqrt(Math.max(0, 1 - ny * ny));
      const lit = waxing ? nx >= T * w : nx <= -T * w;
      const edge = d2 > 0.6;
      g[r].push(lit ? (edge ? STONE : WHT) : MOON_SHADOW);
    }
  }
  return g;
}

export default function AwqatMoon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState("Tonight's moon");
  const [stat, setStat] = useState("computing…");

  useEffect(() => {
    const now = Date.now();
    const frac = moonPhaseFraction(now);
    const pct = Math.round(moonIllumination(frac) * 100);
    const name = moonPhaseName(pct, frac < 0.5);
    const g = moonGrid(frac);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 12, 12);
      for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) {
        const col = g[r][c];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(c, r, 1, 1);
      }
    }
    setLabel(`Tonight: ${name.toLowerCase()}`);
    const d = new Date(now).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    setStat(`${d} · ${pct}% illuminated · phase ${frac.toFixed(3)}`);
  }, []);

  return (
    <div
      className="mt-9 rounded-[10px] flex flex-col sm:flex-row items-center gap-7 px-7 py-6"
      style={{ backgroundColor: "#1A1714", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <canvas
        ref={canvasRef}
        width={12}
        height={12}
        aria-label="Pixel moon rendered at the current real lunar phase"
        className="shrink-0"
        style={{ imageRendering: "pixelated", width: 132, height: 132, filter: "drop-shadow(0 0 16px rgba(247,243,236,0.18))" }}
      />
      <div className="text-center sm:text-left">
        <p className="font-serif text-[20px] font-semibold m-0 mb-1" style={{ color: "#ECE7DD" }}>{label}</p>
        <p className="font-mono text-[12.5px] m-0 mb-3" style={{ color: "#C99A4A" }}>{stat}</p>
        <p className="text-[14.5px] leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.6)" }}>
          Not a screenshot. This is the app&rsquo;s actual moon renderer running on this page —
          it just drew the moon as it is right now, the moment you scrolled here. The same
          code paints AWQAT&rsquo;s night sky.
        </p>
      </div>
    </div>
  );
}
