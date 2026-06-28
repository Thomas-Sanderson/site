// Life Map geometry — pure, deterministic, computed once at import.
//
// Ported from the life-line reference: plate-carrée projection with a uniform
// scale fit to every place, concentric mode-ring "nodes" aggregated per place,
// simplified land paths, a 20° graticule, and the full chronological route path.
//
// Everything here is a plain value/function with no DOM or React dependency, so
// it runs identically on the server (for the static SSR map) and on the client
// (for the draw animation), guaranteeing both resolve to the same final state.

import { PLACES, MONTHS, MODE_HEX, type Mode } from "@/data/lifeGrid";
import worldLand from "@/data/worldLand.json";

export const VBW = 1200;
export const VBH = 600;
const PADX = 95;
const LONPAD = 12;

export const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ── Projection: plate carrée, uniform scale, fit to all places ────────────
const placeKeys = Object.keys(PLACES);
const lons = placeKeys.map((k) => PLACES[k].lon);
const lats = placeKeys.map((k) => PLACES[k].lat);
const lonMin = Math.min(...lons);
const lonMax = Math.max(...lons);
const latMin = Math.min(...lats);
const latMax = Math.max(...lats);

const lon0 = lonMin - LONPAD;
const scale = (VBW - 2 * PADX) / ((lonMax - lonMin) + 2 * LONPAD);
const cLat = (latMin + latMax) / 2;

export function projX(lon: number): number {
  return PADX + (lon - lon0) * scale;
}
export function projY(lat: number): number {
  return VBH / 2 - (lat - cLat) * scale;
}

// ── Months, projected and in chronological order ──────────────────────────
export interface ProjMonth {
  i: number;
  year: number;
  month: number;
  placeKey: string;
  place: string;
  region: string;
  x: number;
  y: number;
  mode: Mode;
}

export const MONTHS_PROJ: ProjMonth[] = MONTHS.map((m, i) => {
  const p = PLACES[m.placeKey];
  return {
    i,
    year: m.year,
    month: m.month,
    placeKey: m.placeKey,
    place: p.name,
    region: p.region,
    x: projX(p.lon),
    y: projY(p.lat),
    mode: m.mode,
  };
});

export const N = MONTHS_PROJ.length;

// ── Nodes: one per place, with concentric mode bands ──────────────────────
const RING_ORDER: Mode[] = ["live", "make", "work", "learn", "travel"];

export interface Band {
  color: string;
  /** Month count for this mode at this place. */
  n: number;
  /** Outer radius of the band at full draw. */
  r: number;
}

export interface LifeNode {
  key: string;
  place: string;
  region: string;
  x: number;
  y: number;
  /** Index of the first month spent here. */
  first: number;
  /** Index of the last month spent here. */
  lastIdx: number;
  count: number;
  firstY: number;
  lastY: number;
  modes: Partial<Record<Mode, number>>;
  baseR: number;
  bands: Band[];
  /** Radius of the transparent pointer hit-target. */
  hitR: number;
  /** Tooltip primary line: "Place, Region". */
  tipName: string;
  /** Tooltip secondary line: dates / duration (precomputed). */
  tipSub: string;
}

function baseRadius(count: number): number {
  return Math.min(18, 3.5 + Math.sqrt(count) * 1.05);
}

function bandsFor(count: number, modes: Partial<Record<Mode, number>>): Band[] {
  const R = baseRadius(count);

  // Concentric rings ordered from the centre outward: live, make, work, learn,
  // travel. "Live" is weighted by the FULL time at a place — the other modes
  // happen during months you also lived there, so the alternating Live/Work
  // tagging shouldn't shrink how long you lived somewhere. A residence reads as
  // a green core sized by that full duration, with the activities as outer
  // shells; trip-only places just stack their present modes in the same order.
  const present: { color: string; n: number; weight: number }[] = [];
  for (const m of RING_ORDER) {
    if (m === "live") {
      if ((modes.live ?? 0) > 0) present.push({ color: MODE_HEX.live, n: count, weight: count });
    } else {
      const n = modes[m] ?? 0;
      if (n > 0) present.push({ color: MODE_HEX[m], n, weight: n });
    }
  }

  const bands: Band[] = present.map((p) => ({ color: p.color, n: p.n, r: 0 }));
  if (bands.length <= 1) {
    if (bands.length === 1) bands[0].r = R;
    return bands;
  }

  const total = present.reduce((s, p) => s + p.weight, 0);
  const minW = 1.5;
  const free = Math.max(0, R - minW * bands.length);
  let cum = 0;
  for (let i = 0; i < bands.length; i++) {
    cum += minW + free * (present[i].weight / total);
    bands[i].r = cum;
  }
  const sc = R / cum;
  for (const b of bands) b.r *= sc;
  return bands;
}

export const NODES: LifeNode[] = (() => {
  const map: Record<string, LifeNode> = {};
  const order: LifeNode[] = [];
  for (const mo of MONTHS_PROJ) {
    let nd = map[mo.placeKey];
    if (!nd) {
      nd = {
        key: mo.placeKey,
        place: mo.place,
        region: mo.region,
        x: mo.x,
        y: mo.y,
        first: mo.i,
        lastIdx: mo.i,
        count: 0,
        firstY: mo.year,
        lastY: mo.year,
        modes: {},
        baseR: 0,
        bands: [],
        hitR: 0,
        tipName: "",
        tipSub: "",
      };
      map[mo.placeKey] = nd;
      order.push(nd);
    }
    nd.count++;
    nd.lastIdx = mo.i;
    nd.lastY = mo.year;
    nd.modes[mo.mode] = (nd.modes[mo.mode] ?? 0) + 1;
  }
  for (const nd of order) {
    nd.baseR = baseRadius(nd.count);
    nd.bands = bandsFor(nd.count, nd.modes);
    nd.hitR = Math.max(nd.baseR + 8, 14);
    nd.tipName = `${nd.place}, ${nd.region}`;
    const yrs = Math.max(1, Math.round(nd.count / 12));
    if (nd.count <= 2) {
      const f = MONTHS_PROJ[nd.first];
      nd.tipSub = `${MONTH_ABBR[f.month]} ${f.year} · visit`;
    } else {
      const endTxt = nd.lastIdx >= N - 1 ? "now" : String(nd.lastY);
      nd.tipSub = `${nd.firstY}–${endTxt} · ~${yrs} yr${yrs > 1 ? "s" : ""} total`;
    }
  }
  return order;
})();

// ── Static land paths ─────────────────────────────────────────────────────
// Antimeridian guard: start a new sub-path (M) when a longitude jump exceeds
// 180° so a ring doesn't draw a stray line across the whole map.
export const LAND_PATHS: string[] = (worldLand as number[][][]).map((ring) => {
  let d = "";
  let prev: number | null = null;
  for (const [lon, lat] of ring) {
    const cmd = d === "" || (prev !== null && Math.abs(lon - prev) > 180) ? "M" : "L";
    d += `${cmd}${projX(lon).toFixed(1)} ${projY(lat).toFixed(1)} `;
    prev = lon;
  }
  return d + "Z";
});

// ── Graticule (every 20°) ─────────────────────────────────────────────────
export interface GratLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  axis: boolean;
}

export const GRATICULE: GratLine[] = (() => {
  const out: GratLine[] = [];
  const loEnd = lon0 + ((lonMax - lonMin) + 2 * LONPAD);
  for (let lo = Math.ceil(lon0 / 20) * 20; lo <= loEnd; lo += 20) {
    out.push({ x1: projX(lo), y1: 0, x2: projX(lo), y2: VBH, axis: lo === 0 });
  }
  const laTop = cLat + VBH / 2 / scale;
  const laBot = cLat - VBH / 2 / scale;
  for (let la = Math.ceil(laBot / 20) * 20; la <= laTop; la += 20) {
    out.push({ x1: 0, y1: projY(la), x2: VBW, y2: projY(la), axis: la === 0 });
  }
  return out;
})();

// ── Full chronological route path ─────────────────────────────────────────
function pathFrom(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let k = 1; k < points.length; k++) {
    d += ` L ${points[k].x.toFixed(1)} ${points[k].y.toFixed(1)}`;
  }
  return d;
}

export const FULL_PATH_D = pathFrom(MONTHS_PROJ);

/** Path through the first `count` months, plus an optional fractional lead point. */
export function partialPath(count: number, lead?: { x: number; y: number }): string {
  const pts = MONTHS_PROJ.slice(0, Math.max(0, count)).map((m) => ({ x: m.x, y: m.y }));
  if (lead) pts.push(lead);
  return pathFrom(pts);
}
