"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { MONTHS_PROJ, NODES, N, partialPath } from "./lifeMapGeometry";

// 30-second pass, matching the life-line reference.
const DUR = 30000;
// Hold the map blank briefly before the line starts drawing.
const START_DELAY = 650;
// Months a NEW home's dot must have been drawing before the border moves onto
// it — so the border lingers on the old home instead of jumping the instant
// the line arrives.
const BORDER_LAG = 2;

// Thin border drawn on the dot that's currently expanding, so small
// month-to-month growth is easier to see. Warm sand tone (sampled from the
// continent fill) that stays visible on the saturated dots.
const ACTIVE_STROKE = "#E3D9C2";
const ACTIVE_STROKE_W = "1";

// Layout effect on the client, no-op on the server (avoids the SSR warning
// while still letting us reset-before-paint to prevent a flash).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// key -> "Place, Region" for the home ticker.
const PLACE_LABEL = new Map(NODES.map((n) => [n.key, `${n.place}, ${n.region}`]));

interface RingEl {
  el: SVGCircleElement;
  rTarget: number;
}

interface RNode {
  key: string;
  first: number;
  count: number;
  idxs: number[];
  circles: RingEl[];
  /** Outermost ring (largest radius) — carries the active border. */
  outer: RingEl | null;
  hit: SVGCircleElement | null;
  visible: boolean;
}

/**
 * Drives the Life Map draw animation by mutating SVG attributes imperatively
 * (no React re-render per frame). Returns a ref for the section root and a
 * `replay` callback for the Replay button.
 *
 * The growing line and the place rings ARE the animation — there is no separate
 * leader dot. The dot currently being drawn gets a thin border so small
 * expansions are visible; each place's transparent hit-target is disabled until
 * its dot has actually been drawn.
 *
 * Progressive enhancement: if `prefers-reduced-motion` is set (or this hook
 * never runs, i.e. no JS), the map is left on its server-rendered final state
 * with every dot present, no borders.
 */
export function useLifeDraw<T extends HTMLElement>() {
  const rootRef = useRef<T>(null);
  const playRef = useRef<() => void>(() => {});

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    const reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const line = root.querySelector<SVGPathElement>("[data-lifemap-line]");
    const yearEl = root.querySelector<HTMLElement>("[data-lifemap-year]");
    const placeEl = root.querySelector<HTMLElement>("[data-lifemap-place]");
    if (!line) return;

    // Group ring circles by place, reading their full radius as the target.
    const byKey = new Map<string, RingEl[]>();
    root.querySelectorAll<SVGCircleElement>("[data-lifemap-ring]").forEach((el) => {
      const k = el.getAttribute("data-lifemap-ring") ?? "";
      const rTarget = parseFloat(el.getAttribute("data-lifemap-r") ?? el.getAttribute("r") ?? "0");
      const arr = byKey.get(k) ?? [];
      arr.push({ el, rTarget });
      byKey.set(k, arr);
    });

    // Transparent pointer hit-targets, one per place.
    const hitByKey = new Map<string, SVGCircleElement>();
    root.querySelectorAll<SVGCircleElement>("[data-lifemap-hit]").forEach((el) => {
      hitByKey.set(el.getAttribute("data-lifemap-hit") ?? "", el);
    });

    // Chronological month indices per place (handles revisits).
    const idxByKey = new Map<string, number[]>();
    for (const m of MONTHS_PROJ) {
      const a = idxByKey.get(m.placeKey) ?? [];
      a.push(m.i);
      idxByKey.set(m.placeKey, a);
    }

    const byKeyNode = new Map<string, RNode>();
    const rnodes: RNode[] = NODES.map((n) => {
      const circles = byKey.get(n.key) ?? [];
      const outer = circles.reduce<RingEl | null>(
        (best, c) => (best && best.rTarget >= c.rTarget ? best : c),
        null
      );
      const rn: RNode = {
        key: n.key,
        first: n.first,
        count: n.count,
        idxs: idxByKey.get(n.key) ?? [],
        circles,
        outer,
        hit: hitByKey.get(n.key) ?? null,
        visible: true,
      };
      byKeyNode.set(n.key, rn);
      return rn;
    });

    let raf = 0;
    let io: IntersectionObserver | null = null;
    let activeKey: string | null = null;
    let anchorKey: string | null = null;
    let borderKey: string | null = null;
    let startTimer = 0;
    let finalLiveAnchor: string | null = null;
    for (let i = N - 1; i >= 0; i--) {
      if (MONTHS_PROJ[i].mode === "live") {
        finalLiveAnchor = MONTHS_PROJ[i].placeKey;
        break;
      }
    }

    const setBorder = (rn: RNode | undefined, on: boolean) => {
      const c = rn?.outer?.el;
      if (!c) return;
      if (on) {
        c.setAttribute("stroke", ACTIVE_STROKE);
        c.setAttribute("stroke-width", ACTIVE_STROKE_W);
      } else {
        c.removeAttribute("stroke");
        c.removeAttribute("stroke-width");
      }
    };

    const setActive = (key: string | null) => {
      if (key === activeKey) return;
      setBorder(activeKey ? byKeyNode.get(activeKey) : undefined, false);
      setBorder(key ? byKeyNode.get(key) : undefined, true);
      activeKey = key;
    };

    const elapsedIn = (rn: RNode, ff: number): number => {
      let c = 0;
      for (const ix of rn.idxs) {
        if (ix <= ff) c++;
        else break;
      }
      return c;
    };

    const render = (f: number) => {
      const cf = Number.isFinite(f) ? Math.max(0, Math.min(N - 1, f)) : 0;
      const ff = Math.floor(cf);

      // Draw the line up to a smooth fractional tip (this tip is what grows the
      // rings at the current place — no visible dot).
      let lead: { x: number; y: number } | undefined;
      if (ff < N - 1) {
        const t = cf - ff;
        const a = MONTHS_PROJ[ff];
        const b = MONTHS_PROJ[ff + 1];
        lead = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
      }
      line.setAttribute("d", partialPath(ff + 1, lead));

      for (const rn of rnodes) {
        if (ff >= rn.first) {
          rn.visible = true;
          const prog = elapsedIn(rn, ff) / rn.count;
          const gr = easeOut(Math.max(0.08, prog));
          for (const c of rn.circles) c.el.setAttribute("r", (c.rTarget * gr).toFixed(2));
          if (rn.hit) rn.hit.style.pointerEvents = "";
        } else if (rn.visible) {
          rn.visible = false;
          for (const c of rn.circles) c.el.setAttribute("r", "0");
          if (rn.hit) rn.hit.style.pointerEvents = "none";
        }
      }

      // Border tracks the current LIVE home, but LINGERS: when a new home
      // becomes live, the border stays on the previous home until the new
      // home's dot has been drawing for BORDER_LAG months, then transfers —
      // so it never leaves the old home the instant the line arrives. Returns
      // to an already-drawn home transfer immediately (its dot is past the lag).
      // At the very end it rests on the final home (e.g. Lewes).
      if (ff < N - 1) {
        const cm = MONTHS_PROJ[ff];
        if (cm.mode === "live") anchorKey = cm.placeKey;
        if (anchorKey) {
          if (borderKey === null) {
            borderKey = anchorKey;
          } else if (anchorKey !== borderKey) {
            const nd = byKeyNode.get(anchorKey);
            if (nd && ff >= nd.first + BORDER_LAG) borderKey = anchorKey;
          }
        }
        setActive(borderKey);
      } else {
        setActive(finalLiveAnchor);
      }

      const cur = MONTHS_PROJ[Math.min(N - 1, Math.round(cf))];
      if (yearEl) yearEl.textContent = String(cur.year);
      if (placeEl) {
        const homeKey = ff < N - 1 ? anchorKey : finalLiveAnchor;
        placeEl.textContent = homeKey ? PLACE_LABEL.get(homeKey) ?? "" : "";
      }
    };

    // Fully empty map: no line, no dots, no border — the pre-roll state.
    const renderBlank = () => {
      line.setAttribute("d", "");
      for (const rn of rnodes) {
        for (const c of rn.circles) c.el.setAttribute("r", "0");
        rn.visible = false;
        if (rn.hit) rn.hit.style.pointerEvents = "none";
      }
      anchorKey = null;
      borderKey = null;
      setActive(null);
      if (yearEl) yearEl.textContent = String(MONTHS_PROJ[0].year);
      if (placeEl) placeEl.textContent = "";
    };

    const play = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (startTimer) clearTimeout(startTimer);
      if (reduce) {
        render(N - 1);
        return;
      }
      // Start blank, hold a beat, then draw from the first month.
      renderBlank();
      startTimer = window.setTimeout(() => {
        startTimer = 0;
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, Math.max(0, (now - t0) / DUR));
          render(p * (N - 1));
          if (p < 1) raf = requestAnimationFrame(step);
          else {
            render(N - 1);
            raf = 0;
          }
        };
        raf = requestAnimationFrame(step);
      }, START_DELAY);
    };
    playRef.current = play;

    if (reduce) {
      // Leave the server-rendered final map untouched (all dots + hits present).
      return;
    }

    const rect = root.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    if (onScreen) {
      // Already in view: blank before paint (no flash), then draw.
      renderBlank();
      play();
    } else {
      // Leave the full server-rendered map as the resting state and only
      // blank+draw as it approaches the viewport. So if you navigate away
      // before ever scrolling to it, it is never left blank (and its dots'
      // targets are never read as 0 from a cached blank DOM). rootMargin fires
      // the observer early enough that the blank happens off-screen.
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            play();
            io?.disconnect();
            io = null;
          }
        },
        { rootMargin: "0px 0px 280px 0px", threshold: 0 }
      );
      io.observe(root);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (startTimer) clearTimeout(startTimer);
      io?.disconnect();
    };
  }, []);

  const replay = useCallback(() => playRef.current(), []);

  return { rootRef, replay };
}
