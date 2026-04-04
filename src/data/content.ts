import { timelineEntries } from "./timeline";
import { locations } from "./locations";
import galleryData from "./gallery.json";

export interface ContentItem {
  id: string;
  source: "timeline" | "location" | "gallery";
  label: string;
  description: string | null;
  role: string | null;
  type: string | null;
  industries: string[] | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  start: string | null;
  end: string | null;
  dateRange: string | null;
  category: string | null;
  imageSlugs: string[] | null;
}

export function buildContentItems(): ContentItem[] {
  const items: ContentItem[] = [];

  // Timeline entries
  for (const entry of timelineEntries) {
    items.push({
      id: `timeline-${entry.company}-${entry.role}`.replace(/\s+/g, "-").toLowerCase(),
      source: "timeline",
      label: `${entry.company} — ${entry.role}`,
      description: entry.highlights?.[0] ?? null,
      role: entry.role,
      type: entry.type,
      industries: null,
      city: entry.location ?? null,
      country: entry.country ?? null,
      lat: entry.lat ?? null,
      lng: entry.lng ?? null,
      start: entry.start,
      end: entry.end,
      dateRange: `${entry.start} – ${entry.end}`,
      category: entry.category ?? null,
      imageSlugs: null,
    });
  }

  // Location entries
  for (const loc of locations) {
    items.push({
      id: `location-${loc.city}-${loc.category}`.replace(/\s+/g, "-").toLowerCase(),
      source: "location",
      label: `${loc.city}, ${loc.country}`,
      description: loc.description ?? null,
      role: null,
      type: null,
      industries: loc.industries ?? null,
      city: loc.city,
      country: loc.country,
      lat: loc.lat,
      lng: loc.lng,
      start: null,
      end: null,
      dateRange: loc.dateRange ?? null,
      category: loc.category,
      imageSlugs: null,
    });
  }

  // Gallery entries
  const gallery = galleryData as Array<{
    slug: string;
    location?: string;
    date?: string;
    lat?: number;
    lng?: number;
    category?: string;
  }>;
  for (const img of gallery) {
    items.push({
      id: `gallery-${img.slug}`,
      source: "gallery",
      label: img.slug.replace(/-/g, " "),
      description: null,
      role: null,
      type: null,
      industries: null,
      city: img.location ?? null,
      country: null,
      lat: img.lat ?? null,
      lng: img.lng ?? null,
      start: null,
      end: null,
      dateRange: img.date ?? null,
      category: img.category ?? null,
      imageSlugs: [img.slug],
    });
  }

  return items;
}
