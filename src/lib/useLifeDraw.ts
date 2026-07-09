"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { MONTHS_PROJ, NODES, N, partialPath } from "./lifeMapGeometry";
import { type Mode } from "@/data/lifeGrid";

export interface DotEnterRing {
  /** The ring's type — chooses the voice. */
  mode: Mode;
  /** On-screen growth time in seconds (→ fading-envelope length). */
  growthSec: number;
}

export interface DotEnter {
  /** Place whose dot just appeared. */
  placeKey: string;
  /** Current home the dot's distance (→ pitch) is measured from. */
  homeKey: string | null;
  /** Activity rings, inner→outer — one voice each. */
  rings: DotEnterRing[];
}

export interface LifeDrawCallbacks {
  /** Fires once, when a place's dot first appears in the draw. */
  onDotEnter?: (d: DotEnter) => void;
  /** Fires when the home anchor moves onto a new place (the "move"). */
  onHomeChange?: (homeKey: string) => void;
  /** Fires when the draw actually begins (after the pre-roll delay). */
  onStart?: () => void;
  /** Fires when the draw reaches its final frame. */
  onEnd?: () => void;
}

// 30-second pass, matching the life-line reference.
const DUR = 30000;
// Hold the map blank briefly before the line starts drawing.
const START_DELAY = 650;
// Months a NEW home's dot must have been drawing before the border (active
// white ring) moves onto it. 0 = it transfers the instant the line reaches the
// new home, so it never lingers on the previous stop — e.g. it no longer holds
// on a repeat like Kenilworth while the line is already heading to NC.
const BORDER_LAG = 0;
// Real time each drawn month occupies — the unit behind a ring's "time to grow".
const MONTH_MS = DUR / Math.max(1, N - 1);

// Thin border drawn on the dot that's currently expanding, so small
// month-to-month growth is easier to see. Warm sand tone (sampled from the
// continent fill) that stays visible on the saturated dots.
const ACTIVE_STROKE = "#E3D9C2";
const ACTIVE_STROKE_W = "1";

// Activity rings (inner→outer) that sound when a place's DOT first appears.
// "live" is intentionally excluded: the home/bass voice is driven separately by
// onHomeChange (the move), so a place you only visit first — e.g. Delaware —
// doesn't sound like "moving there" until it actually becomes home.
const ACTIVITY_ORDER: Mode[] = ["make", "work", "learn", "travel"];

// Per-place activity-ring list: every non-live mode present at the place gets a
// voice, ordered inner→outer, each carrying its own growth time so a multi-type
// dot is heard in full, layer by layer.
const NODE_RINGS = new Map<string, DotEnterRing[]>(
  NODES.map((n) => [
    n.key,
    ACTIVITY_ORDER.filter((m) => (n.modes[m] ?? 0) > 0).map((m) => ({
      mode: m,
      growthSec: ((n.modes[m] ?? 0) * MONTH_MS) / 1000,
    })),
  ])
);

// Layout effect on the client, no-op on the server (avoids the SSR warning
// while still letting us reset-before-paint to prevent a flash).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// key -> "Place, Region" for the home ticker.
const PLACE_LABEL = new Map(NODES.map((n) => [n.key, `${n.place}, ${n.region}`]));

// Mirrors the geometry's baseRadius core — the sqrt size curve a dot's radius
// follows as time accrues. Used so a trip shows at full "one-visit" size on its
// first visit and only grows a little when visited again.
const sizeAt = (n: number) => 3.5 + Math.sqrt(Math.max(0, n)) * 1.05;

interface RingEl {
  el: SVGCircleElement;
  rTarget: number;
  /** Month index this ring starts drawing at (its mode's first month here). */
  start: number;
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
 * Optional `cb` callbacks let a caller score the draw (used by the Life Map
 * audio engine): `onDotEnter` fires once per place as its dot appears (with its
 * activity rings + the current home), `onHomeChange` fires when you move (the
 * home anchor lands on a new place), and `onStart`/`onEnd` bracket a run. They
 * are read through a ref so the effect stays mount-once.
 *
 * Progressive enhancement: if `prefers-reduced-motion` is set (or this hook
 * never runs, i.e. no JS), the map is left on its server-rendered final state
 * with every dot present, no borders.
 */
export function useLifeDraw<T extends HTMLElement>(cb?: LifeDrawCallbacks) {
  const rootRef = useRef<T>(null);
  const playRef = useRef<() => void>(() => {});
  const cbRef = useRef<LifeDrawCallbacks | undefined>(cb);
  cbRef.current = cb;

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
      const start = parseInt(el.getAttribute("data-lifemap-start") ?? "0", 10);
      const arr = byKey.get(k) ?? [];
      arr.push({ el, rTarget, start });
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
    let activeKey: string | null = null;
    let anchorKey: string | null = null;
    let borderKey: string | null = null;
    let homeVoiced: string | null = null;
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

    // Sound a bass root the first time you MOVE to a place (anchor lands on it).
    const voiceHome = (key: string | null) => {
      if (key && key !== homeVoiced) {
        homeVoiced = key;
        cbRef.current?.onHomeChange?.(key);
      }
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
          if (!rn.visible) {
            rn.visible = true;
            // The dot has just appeared — score its activity rings (the home
            // bass is handled separately by the move, below).
            cbRef.current?.onDotEnter?.({
              placeKey: rn.key,
              homeKey: anchorKey,
              rings: NODE_RINGS.get(rn.key) ?? [],
            });
          }
          // Radius tracks the TIME accrued here so far, on an absolute size
          // scale: an early visit shows at real visit-size (never a sliver of
          // an eventual home — e.g. Austin's 2011 trip), it grows a little on
          // each revisit (e.g. Charleston, Miami), and the linear term still
          // fills it to full size as its months complete, keeping home revisit
          // growth visible (e.g. NYC, Bay Area, Kenilworth).
          const elapsed = elapsedIn(rn, ff);
          const full = rn.outer?.rTarget ?? 1;
          const gr = Math.max(elapsed / rn.count, Math.min(1, sizeAt(elapsed) / full));
          // Each ring only appears once its own activity has begun here, so a
          // place visited before you lived there doesn't show its home/work
          // rings during those early visits.
          for (const c of rn.circles)
            c.el.setAttribute("r", ff >= c.start ? (c.rTarget * gr).toFixed(2) : "0");
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
        // The move (bass) tracks the actual residence, not the lagged border,
        // so the home voice lands when you arrive — including the final home.
        voiceHome(anchorKey);
      } else {
        setActive(finalLiveAnchor);
        voiceHome(finalLiveAnchor);
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
      homeVoiced = null;
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
        cbRef.current?.onStart?.();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, Math.max(0, (now - t0) / DUR));
          render(p * (N - 1));
          if (p < 1) raf = requestAnimationFrame(step);
          else {
            render(N - 1);
            raf = 0;
            cbRef.current?.onEnd?.();
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

    // The map rests on its complete, final state. It does NOT auto-play on
    // scroll — the "Play the journey" button plays the draw on demand.
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (startTimer) clearTimeout(startTimer);
    };
  }, []);

  const replay = useCallback(() => playRef.current(), []);

  return { rootRef, replay };
}
