/* One-off: print the current map data (dots + photo matching) and all photos. */
import { buildContentItems } from "../src/data/content";
import galleryData from "../src/data/gallery.json";

type Photo = { slug: string; cropped: string; location?: string; date?: string; category?: string; lat?: number; lng?: number };
const photos = galleryData as Photo[];

function normCity(s: string): string {
  return s.split(",")[0].trim().toLowerCase().replace(/\s+city$/, "");
}
function parseSortKey(dateStr: string | null): number {
  if (!dateStr) return 0;
  const m = dateStr.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (m) {
    const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const mn = dateStr.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)![0];
    return (parseInt(m[1]) - 2013) * 12 + months[mn];
  }
  const y = dateStr.match(/(\d{4})/);
  return y ? (parseInt(y[1]) - 2013) * 12 : 0;
}

// photoByCity = first photo per normalized city
const photoByCity = new Map<string, Photo>();
for (const p of photos) {
  if (!p.location) continue;
  const c = normCity(p.location);
  if (!photoByCity.has(c)) photoByCity.set(c, p);
}
const photoBySlug = new Map<string, Photo>();
for (const p of photos) photoBySlug.set(p.slug, p);

// Reconstruct map dots exactly like MapSection.allPins
const items = buildContentItems();
type Dot = { id: string; label: string; category: string; city: string | null; dateRange: string | null; lat: number; lng: number; photo: string | null; sortKey: number };
const raw: Dot[] = [];
for (const it of items) {
  if (it.lat == null || it.lng == null) continue;
  if (it.source === "gallery") continue;
  if (it.source === "timeline" && it.label?.startsWith("Columbia University")) continue;
  const ck = it.city ? normCity(it.city) : "";
  const ph = (it.photoSlug ? photoBySlug.get(it.photoSlug) : undefined) ?? (ck ? photoByCity.get(ck) : undefined);
  raw.push({ id: it.id, label: (it.source === "timeline" && it.city ? it.city : it.label), category: it.category || "work", city: it.city, dateRange: it.dateRange, lat: it.lat, lng: it.lng, photo: ph ? ph.cropped : null, sortKey: parseSortKey(it.start || it.dateRange) });
}
const seen = new Map<string, Dot>();
for (const d of raw) {
  const key = `${d.lat.toFixed(2)},${d.lng.toFixed(2)},${d.category}`;
  if (!seen.has(key) || d.sortKey < seen.get(key)!.sortKey) seen.set(key, d);
}
const dots = [...seen.values()].sort((a, b) => a.sortKey - b.sortKey);

const usedCities = new Set(dots.filter(d => d.photo).map(d => normCity(d.city || "")));

console.log(`\n=== MAP DOTS (${dots.length}) — chronological ===`);
console.log(`  #  | date           | category | place                              | photo`);
dots.forEach((d, i) => {
  console.log(
    `  ${String(i+1).padStart(2)} | ${(d.dateRange||"?").padEnd(14)} | ${d.category.padEnd(8)} | ${d.label.padEnd(34)} | ${d.photo ? d.photo : "— placeholder"}`
  );
});

const withPhoto = dots.filter(d => d.photo).length;
console.log(`\nDots with a real photo: ${withPhoto}/${dots.length} (${dots.length - withPhoto} placeholders)`);

console.log(`\n=== ALL GALLERY PHOTOS (${photos.length}) ===`);
for (const p of photos) {
  const c = p.location ? normCity(p.location) : "";
  const isFirst = c && photoByCity.get(c)?.slug === p.slug;
  const onMap = isFirst && usedCities.has(c);
  const status = onMap ? "USED" : (isFirst ? "matched-city-but-no-dot" : "unused");
  console.log(`  [${status.padEnd(24)}] ${(p.location||"?").padEnd(34)} ${(p.date||"").padEnd(20)} ${p.slug}`);
}
const usedCount = photos.filter(p => { const c = p.location?normCity(p.location):""; return c && photoByCity.get(c)?.slug===p.slug && usedCities.has(c); }).length;
console.log(`\nPhotos shown on the map: ${usedCount}/${photos.length}`);
