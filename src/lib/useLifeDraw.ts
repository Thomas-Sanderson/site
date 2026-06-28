"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { MONTHS_PROJ, NODES, N, partialPath } from "./lifeMapGeometry";
import { MODE_LABEL } from "@/data/lifeGrid";

// 30-second pass, matching the life-line reference.
const DUR = 30000;

// Layout effect on the client, no-op on the server (avoids the SSR warning
// while still letting us reset-before-paint to prevent a flash).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type RGB = [number, number, number];
const TAG_RGB: Record<string, RGB> = {
  live: [47, 161, 94],
  make: [126, 91, 208],
  work: [232, 99, 43],
  learn: [46, 120, 201],
  travel: [216, 162, 30],
};
const TAG_DEF: RGB = [232, 99, 43];

const colorFor = (mode: string): RGB => TAG_RGB[mode] ?? TAG_DEF;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (t: number) => t * t * (3 - 2 * t);
const mixc = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

interface RNode {
  first: number;
  count: number;
  idxs: number[];
  circles: { el: SVGCircleElement; rTarget: number }[];
  visible: boolean;
}

/**
 * Drives the Life Map draw animation by mutating SVG attributes imperatively
 * (no React re-render per frame). Returns a ref for the section root and a
 * `replay` callback for the Replay button.
 *
 * Progressive enhancement: if `prefers-reduced-motion` is set (or this hook
 * never runs, i.e. no JS), the map is left on its server-rendered final state.
 * Otherwise it resets to the start inside a layout effect (before paint, so no
 * flash) and plays forward to that same final state — auto-starting when the
 * section scrolls into view.
 */
export function useLifeDraw<T extends HTMLElement>() {
  const rootRef = useRef<T>(null);
  const playRef = useRef<() => void>(() => {});

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    const reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const line = root.querySelector<SVGPathElement>("[data-lifemap-line]");
    const leader = root.querySelector<SVGCircleElement>("[data-lifemap-leader]");
    const halo = root.querySelector<SVGCircleElement>("[data-lifemap-halo]");
    const yearEl = root.querySelector<HTMLElement>("[data-lifemap-year]");
    const placeEl = root.querySelector<HTMLElement>("[data-lifemap-place]");
    if (!line || !leader || !halo) return;

    // Group ring circles by place, reading their full radius as the target.
    const byKey = new Map<string, { el: SVGCircleElement; rTarget: number }[]>();
    root.querySelectorAll<SVGCircleElement>("[data-lifemap-ring]").forEach((el) => {
      const k = el.getAttribute("data-lifemap-ring") ?? "";
      const rTarget = parseFloat(el.getAttribute("r") ?? "0");
      const arr = byKey.get(k) ?? [];
      arr.push({ el, rTarget });
      byKey.set(k, arr);
    });

    // Chronological month indices per place (handles revisits).
    const idxByKey = new Map<string, number[]>();
    for (const m of MONTHS_PROJ) {
      const a = idxByKey.get(m.placeKey) ?? [];
      a.push(m.i);
      idxByKey.set(m.placeKey, a);
    }

    const rnodes: RNode[] = NODES.map((n) => ({
      first: n.first,
      count: n.count,
      idxs: idxByKey.get(n.key) ?? [],
      circles: byKey.get(n.key) ?? [],
      visible: true,
    }));

    let raf = 0;
    let io: IntersectionObserver | null = null;

    const tagRGB = (f: number): RGB => {
      const i = Math.floor(f);
      if (i >= N - 1) return colorFor(MONTHS_PROJ[N - 1].mode);
      return mixc(colorFor(MONTHS_PROJ[i].mode), colorFor(MONTHS_PROJ[i + 1].mode), smooth(f - i));
    };

    const elapsedIn = (rn: RNode, ff: number): number => {
      let c = 0;
      for (const ix of rn.idxs) {
        if (ix <= ff) c++;
        else break;
      }
      return c;
    };

    const leaderDraw = (x: number, y: number, f: number) => {
      if (f >= N - 1) {
        leader.setAttribute("r", "0");
        halo.setAttribute("r", "0");
        return;
      }
      const c = tagRGB(f);
      const t = performance.now();
      const pulse = 3.7 + Math.sin(t / 230) * 0.8;
      const ha = 0.15 + ((Math.sin(t / 560) + 1) / 2) * 0.13;
      leader.setAttribute("cx", String(x));
      leader.setAttribute("cy", String(y));
      leader.setAttribute("r", pulse.toFixed(2));
      leader.setAttribute("fill", `rgb(${c[0]},${c[1]},${c[2]})`);
      halo.setAttribute("cx", String(x));
      halo.setAttribute("cy", String(y));
      halo.setAttribute("r", (pulse + 9).toFixed(2));
      halo.setAttribute("fill", `rgba(${c[0]},${c[1]},${c[2]},${ha.toFixed(3)})`);
    };

    const render = (f: number) => {
      const ff = Math.floor(f);
      let tipX: number;
      let tipY: number;
      let lead: { x: number; y: number } | undefined;
      if (ff < N - 1) {
        const t = f - ff;
        const a = MONTHS_PROJ[ff];
        const b = MONTHS_PROJ[ff + 1];
        tipX = lerp(a.x, b.x, t);
        tipY = lerp(a.y, b.y, t);
        lead = { x: tipX, y: tipY };
      } else {
        tipX = MONTHS_PROJ[N - 1].x;
        tipY = MONTHS_PROJ[N - 1].y;
      }
      line.setAttribute("d", partialPath(ff + 1, lead));
      leaderDraw(tipX, tipY, f);

      for (const rn of rnodes) {
        if (ff >= rn.first) {
          rn.visible = true;
          const prog = elapsedIn(rn, ff) / rn.count;
          const gr = easeOut(Math.max(0.08, prog));
          for (const c of rn.circles) c.el.setAttribute("r", (c.rTarget * gr).toFixed(2));
        } else if (rn.visible) {
          rn.visible = false;
          for (const c of rn.circles) c.el.setAttribute("r", "0");
        }
      }

      const cur = MONTHS_PROJ[Math.min(N - 1, Math.round(f))];
      if (yearEl) yearEl.textContent = String(cur.year);
      if (placeEl) placeEl.textContent = `${cur.place}, ${cur.region}  ·  ${MODE_LABEL[cur.mode]}`;
    };

    const play = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (reduce) {
        render(N - 1);
        return;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / DUR);
        render(p * (N - 1));
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          render(N - 1);
          raf = 0;
        }
      };
      raf = requestAnimationFrame(step);
    };
    playRef.current = play;

    if (reduce) {
      // Leave the server-rendered final map untouched.
      return;
    }

    // Reset to the start before paint (no flash), then auto-play on view.
    render(0);
    const rect = root.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    if (onScreen) {
      play();
    } else {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            play();
            io?.disconnect();
            io = null;
          }
        },
        { threshold: 0.2 }
      );
      io.observe(root);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  const replay = useCallback(() => playRef.current(), []);

  return { rootRef, replay };
}
