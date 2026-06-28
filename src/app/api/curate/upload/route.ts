import { promises as fs } from "fs";
import path from "path";

// Dev-only: accept a pasted image, save it into the gallery, append a
// gallery.json entry, and assign it to the given dot (photoOverrides.json).
export async function POST(request: Request) {
  const { key, location, date, dataUrl } = (await request.json()) as {
    key?: string;
    location?: string;
    date?: string | null;
    dataUrl?: string;
  };
  if (!key || !dataUrl) return Response.json({ ok: false, error: "missing key/dataUrl" }, { status: 400 });

  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!m) return Response.json({ ok: false, error: "unsupported image" }, { status: 400 });
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const buf = Buffer.from(m[2], "base64");

  // unique slug from the dot's place
  const base =
    (location || "photo")
      .split(",")[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "photo";

  const galleryFile = path.join(process.cwd(), "src/data/gallery.json");
  const gallery = JSON.parse(await fs.readFile(galleryFile, "utf8")) as { slug: string }[];
  const taken = new Set(gallery.map((g) => g.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

  // PNG intrinsic size (clipboard pastes are usually PNG); otherwise 0.
  let w = 0, h = 0;
  if (ext === "png" && buf.length > 24 && buf.toString("ascii", 12, 16) === "IHDR") {
    w = buf.readUInt32BE(16);
    h = buf.readUInt32BE(20);
  }

  const cropped = `cropped/${slug}.${ext}`;
  await fs.mkdir(path.join(process.cwd(), "public/images/gallery/cropped"), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "public/images/gallery", cropped), buf);

  gallery.push({
    slug,
    source: "paste",
    cropped,
    width: w,
    height: h,
    location: location || "",
    date: (date || "").match(/\d{4}/)?.[0] || "",
    category: "",
  } as never);
  await fs.writeFile(galleryFile, JSON.stringify(gallery, null, 2) + "\n");

  // assign to the dot
  const ovFile = path.join(process.cwd(), "src/data/photoOverrides.json");
  let ov: Record<string, string> = {};
  try { ov = JSON.parse(await fs.readFile(ovFile, "utf8")); } catch { ov = {}; }
  ov[key] = slug;
  const sorted = Object.fromEntries(Object.entries(ov).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(ovFile, JSON.stringify(sorted, null, 2) + "\n");

  return Response.json({ ok: true, slug, src: `/images/gallery/${cropped}` });
}
