// Life Map data pipeline.
//
// The raw grid lives in `lifeGrid.json` (places + month tuples), copied verbatim
// from the life-line reference. This module gives it types, maps the compact
// month tuples into named records, and runs a build-time assertion so a typo in
// a place key fails loudly at module load instead of silently dropping a dot.

import raw from "./lifeGrid.json";

export type Mode = "live" | "work" | "learn" | "make" | "travel";

export const MODES: Mode[] = ["live", "work", "learn", "make", "travel"];

/** Display colour per mode (softened site palette: teal/terracotta/gold/purple/blue). */
export const MODE_HEX: Record<Mode, string> = {
  live: "#2A6B5A",
  work: "#C4725A",
  learn: "#BFA052",
  make: "#7B5EA7",
  travel: "#5A8FC4",
};

export const MODE_LABEL: Record<Mode, string> = {
  live: "Live",
  work: "Work",
  learn: "Learn",
  make: "Make",
  travel: "Travel",
};

export interface Place {
  name: string;
  region: string;
  lat: number;
  lon: number;
}

export interface Month {
  year: number;
  /** 0-indexed month (0 = January). */
  month: number;
  placeKey: string;
  mode: Mode;
}

export interface Meta {
  eyebrow: string;
  note: string;
}

/** [year, 0-indexed month] of the first month in the grid. */
export const BIRTH: readonly [number, number] = raw.birth as [number, number];

export const META: Meta = raw.meta as Meta;

export const PLACES: Record<string, Place> = raw.places as Record<string, Place>;

// Raw month tuples: [year, month(0-11), placeKey, tag].
type MonthTuple = [number, number, string, string];

function toMode(tag: string): Mode {
  const m = tag.toLowerCase();
  if ((MODES as string[]).includes(m)) return m as Mode;
  throw new Error(`[lifeGrid] unknown mode tag: ${JSON.stringify(tag)}`);
}

export const MONTHS: Month[] = (raw.months as MonthTuple[]).map(
  ([year, month, placeKey, tag]) => ({ year, month, placeKey, mode: toMode(tag) })
);

// --- Build assertion -------------------------------------------------------
// Every month must reference a known place. Throwing here turns a data typo
// into an immediate, obvious failure at import (and therefore at build) time.
{
  const missing = new Set<string>();
  for (const m of MONTHS) {
    if (!Object.prototype.hasOwnProperty.call(PLACES, m.placeKey)) {
      missing.add(m.placeKey);
    }
  }
  if (missing.size > 0) {
    throw new Error(
      `[lifeGrid] ${missing.size} month place key(s) missing from PLACES: ${[...missing]
        .map((k) => JSON.stringify(k))
        .join(", ")}`
    );
  }
  for (const m of MONTHS) {
    if (!Number.isInteger(m.month) || m.month < 0 || m.month > 11) {
      throw new Error(`[lifeGrid] month out of range for ${m.year}: ${m.month}`);
    }
  }
}

/** Resolve a month's place record. Safe after the build assertion above. */
export function placeOf(m: Month): Place {
  return PLACES[m.placeKey];
}
