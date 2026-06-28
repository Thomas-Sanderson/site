import { buildContentItems } from "@/data/content";
import galleryData from "@/data/gallery.json";
import overridesData from "@/data/photoOverrides.json";

const overrides = overridesData as Record<string, string>;

export interface MapDot {
  key: string;
  id: string;
  lat: number;
  lng: number;
  label: string;
  category: string;
  dateRange: string | null;
  description: string | null;
  industries: string[] | null;
  city: string | null;
  photo: { src: string; alt: string } | null;
  currentSlug: string | null;
  sortKey: number;
}

export interface GalleryPhoto {
  slug: string;
  src: string;
  location: string;
  date: string;
  category: string;
}

export function normCity(s: string): string {
  return s.split(",")[0].trim().toLowerCase().replace(/\s+city$/, "");
}

/** Stable per-dot key (matches the map's dedup key). */
export function dotKey(lat: number, lng: number, category: string): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)},${category}`;
}

export function parseSortKey(dateStr: string | null): number {
  if (!dateStr) return 0;
  const match = dateStr.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (match) {
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const mn = dateStr.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)![0];
    return (parseInt(match[1]) - 2013) * 12 + months[mn];
  }
  const y = dateStr.match(/(\d{4})/);
  return y ? (parseInt(y[1]) - 2013) * 12 : 0;
}

type RawPhoto = { slug: string; cropped: string; location?: string; date?: string; category?: string };

export function allGalleryPhotos(): GalleryPhoto[] {
  return (galleryData as RawPhoto[]).map((g) => ({
    slug: g.slug,
    src: `/images/gallery/${g.cropped}`,
    location: g.location ?? "",
    date: g.date ?? "",
    category: g.category ?? "",
  }));
}

/**
 * Build the ordered map dots with their resolved photo.
 * Resolution priority: photoOverrides[key] -> location/timeline photoSlug -> first photo for the city.
 * This is the single source of truth shared by the map and the /curate tool.
 */
export function buildMapDots(): MapDot[] {
  const bySlug = new Map<string, { src: string; alt: string }>();
  const cityToSlug = new Map<string, string>();
  for (const img of galleryData as RawPhoto[]) {
    bySlug.set(img.slug, { src: `/images/gallery/${img.cropped}`, alt: img.location ?? "" });
    if (img.location) {
      const c = normCity(img.location);
      if (!cityToSlug.has(c)) cityToSlug.set(c, img.slug);
    }
  }

  const items = buildContentItems();
  const dots: MapDot[] = [];
  for (const item of items) {
    if (item.lat == null || item.lng == null) continue;
    if (item.source === "gallery") continue;
    if (item.source === "timeline" && item.label?.startsWith("Columbia University")) continue;
    const category = item.category || "work";
    const key = dotKey(item.lat, item.lng, category);
    const cityKey = item.city ? normCity(item.city) : "";
    const slug =
      overrides[key] ??
      item.photoSlug ??
      (cityKey ? cityToSlug.get(cityKey) : undefined) ??
      null;
    const photo = slug ? bySlug.get(slug) ?? null : null;
    // Timeline (employment) dots use their place as the label, not the job title.
    const label = item.source === "timeline" && item.city ? item.city : item.label;
    dots.push({
      key,
      id: item.id,
      lat: item.lat,
      lng: item.lng,
      label,
      category,
      dateRange: item.dateRange,
      description: item.description,
      industries: item.industries,
      city: item.city,
      photo,
      currentSlug: slug,
      sortKey: parseSortKey(item.start || item.dateRange),
    });
  }

  // Deduplicate by key (city+coords+category), keeping the earliest.
  const seen = new Map<string, MapDot>();
  for (const d of dots) {
    if (!seen.has(d.key) || d.sortKey < seen.get(d.key)!.sortKey) seen.set(d.key, d);
  }
  return Array.from(seen.values()).sort((a, b) => a.sortKey - b.sortKey);
}
