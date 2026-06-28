import { buildMapDots, allGalleryPhotos } from "@/lib/mapDots";
import CurateClient from "@/components/CurateClient";

// Always re-read overrides on load (temporary dev tool).
export const dynamic = "force-dynamic";

export default function CuratePage() {
  const dots = buildMapDots().map((d) => ({
    key: d.key,
    label: d.label,
    category: d.category,
    dateRange: d.dateRange,
    currentSlug: d.currentSlug,
  }));
  const photos = allGalleryPhotos();
  return <CurateClient dots={dots} photos={photos} />;
}
