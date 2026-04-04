import {
  TIMELINE_START,
  TIMELINE_END,
  type TimelineEntry,
} from "@/data/timeline";

export function pct(month: number) {
  return ((month - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
}

/** Group entries by company, preserving order of first appearance */
export function groupByCompany(entries: TimelineEntry[]) {
  const order: string[] = [];
  const map = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    if (!map.has(e.company)) {
      order.push(e.company);
      map.set(e.company, []);
    }
    map.get(e.company)!.push(e);
  }
  return order.map((company) => ({ company, entries: map.get(company)! }));
}

/** Brand colors — muted at rest, vivid on hover */
export const companyColors: Record<string, { muted: string; vivid: string }> = {
  "McKinsey & Company": { muted: "rgba(5, 28, 96, 0.18)", vivid: "rgba(5, 28, 96, 0.7)" },
  "Scout Ventures": { muted: "rgba(0, 100, 62, 0.18)", vivid: "rgba(0, 100, 62, 0.7)" },
  "Tipic i Catala": { muted: "rgba(128, 0, 32, 0.18)", vivid: "rgba(128, 0, 32, 0.7)" },
  "Greyt Solutions LLC": { muted: "rgba(85, 85, 85, 0.18)", vivid: "rgba(85, 85, 85, 0.7)" },
  "Workforce Logiq (NetApp)": { muted: "rgba(0, 118, 206, 0.18)", vivid: "rgba(0, 118, 206, 0.7)" },
  "Soul In The Horn": { muted: "rgba(200, 160, 40, 0.18)", vivid: "rgba(200, 160, 40, 0.7)" },
  "Self-employed": { muted: "rgba(160, 100, 60, 0.18)", vivid: "rgba(160, 100, 60, 0.7)" },
  "Casa Bonjardim Guest House Porto": { muted: "rgba(180, 130, 70, 0.18)", vivid: "rgba(180, 130, 70, 0.7)" },
  "Recovery Unplugged": { muted: "rgba(0, 140, 149, 0.18)", vivid: "rgba(0, 140, 149, 0.7)" },
  "Recovery Unplugged (Consultant)": { muted: "rgba(0, 140, 149, 0.18)", vivid: "rgba(0, 140, 149, 0.7)" },
  "Columbia University": { muted: "rgba(0, 114, 206, 0.18)", vivid: "rgba(0, 114, 206, 0.7)" },
};
const defaultColor = { muted: "rgba(45, 42, 38, 0.15)", vivid: "rgba(45, 42, 38, 0.6)" };

export function getColor(company: string) {
  return companyColors[company] || defaultColor;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
