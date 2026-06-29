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
  /** Index of the first/last month actually tagged "live" here (-1 if none). */
  firstLiveIdx: number;
  lastLiveIdx: number;
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

function bandsFor(
  count: number,
  modes: Partial<Record<Mode, number>>,
  liveSpan: number
): Band[] {
  // Residence: the green core is sized by HOW LONG you lived there — the span
  // (bounds) from your first to last live month, NOT the count of recorded
  // months (trips deflate that, which made two equally-long homes look unequal).
  // Activities ring outward from the green in RING_ORDER (make, work, learn,
  // travel), each a thin shell scaled by its own amount.
  if ((modes.live ?? 0) > 0 && liveSpan > 0) {
    const greenR = baseRadius(liveSpan);
    const bands: Band[] = [{ color: MODE_HEX.live, n: liveSpan, r: greenR }];
    let cum = greenR;
    for (const m of RING_ORDER) {
      if (m === "live") continue;
      const c = modes[m] ?? 0;
      if (c > 0) {
        cum += Math.min(4, 1.0 + Math.sqrt(c) * 0.45);
        bands.push({ color: MODE_HEX[m], n: c, r: cum });
      }
    }
    return bands;
  }

  // Trip-only place (no live months): cumulative bands sized by count.
  const R = baseRadius(count);
  const present: Band[] = [];
  for (const m of RING_ORDER) {
    const n = modes[m] ?? 0;
    if (n > 0) present.push({ color: MODE_HEX[m], n, r: 0 });
  }
  if (present.length <= 1) {
    if (present.length === 1) present[0].r = R;
    return present;
  }
  const total = present.reduce((sum, b) => sum + b.n, 0);
  const minW = 1.5;
  const free = Math.max(0, R - minW * present.length);
  let cum = 0;
  for (const b of present) {
    cum += minW + free * (b.n / total);
    b.r = cum;
  }
  const sc = R / cum;
  for (const b of present) b.r *= sc;
  return present;
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
        firstLiveIdx: -1,
        lastLiveIdx: -1,
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
    if (mo.mode === "live") {
      if (nd.firstLiveIdx < 0) nd.firstLiveIdx = mo.i;
      nd.lastLiveIdx = mo.i;
    }
  }
  for (const nd of order) {
    const liveSpan = nd.firstLiveIdx >= 0 ? nd.lastLiveIdx - nd.firstLiveIdx + 1 : 0;
    nd.bands = bandsFor(nd.count, nd.modes, liveSpan);
    nd.baseR = nd.bands.reduce((mx, b) => Math.max(mx, b.r), 0);
    // Hit-target matches the visible dot exactly, so tooltips correspond to
    // real dots (not padded geography); later dots drawn on top win overlaps.
    nd.hitR = nd.baseR;
    nd.tipName = `${nd.place}, ${nd.region}`;
    const yrs = Math.max(1, Math.round(nd.count / 12));
    if (nd.count <= 2) {
      const f = MONTHS_PROJ[nd.first];
      nd.tipSub = `${MONTH_ABBR[f.month]} ${f.year} · visit`;
    } else if (nd.firstY === nd.lastY) {
      // Entirely within one calendar year — show just the year, not a range.
      nd.tipSub = `${nd.firstY}`;
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
// Build a path that draws each unique segment only ONCE. A return trip retraces
// the same segment; redrawing it would double the dashes and render the line
// solid/inconsistent. When a segment (or a stay in one place) repeats, we jump
// (M) instead of stroking (L), so the dashing stays uniform everywhere.
function pathFrom(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const fx = (n: number) => n.toFixed(1);
  const ptKey = (p: { x: number; y: number }) => `${fx(p.x)},${fx(p.y)}`;
  const segKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const drawn = new Set<string>();
  let d = `M ${fx(points[0].x)} ${fx(points[0].y)}`;
  for (let k = 1; k < points.length; k++) {
    const a = ptKey(points[k - 1]);
    const b = ptKey(points[k]);
    if (a === b) continue; // same place, no segment
    if (drawn.has(segKey(a, b))) {
      d += ` M ${fx(points[k].x)} ${fx(points[k].y)}`; // already drawn — jump
    } else {
      drawn.add(segKey(a, b));
      d += ` L ${fx(points[k].x)} ${fx(points[k].y)}`;
    }
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
