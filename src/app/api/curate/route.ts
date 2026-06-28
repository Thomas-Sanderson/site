import { promises as fs } from "fs";
import path from "path";

// Dev-only curation endpoint: persists a dot -> photo-slug assignment into
// src/data/photoOverrides.json. The /curate page + this route are temporary;
// the overrides file is the durable output.
export async function POST(request: Request) {
  const { key, slug } = (await request.json()) as { key?: string; slug?: string | null };
  if (!key) return Response.json({ ok: false, error: "missing key" }, { status: 400 });

  const file = path.join(process.cwd(), "src/data/photoOverrides.json");
  let data: Record<string, string> = {};
  try {
    data = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    data = {};
  }

  if (slug) data[key] = slug;
  else delete data[key];

  // Stable, sorted output for clean diffs.
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(file, JSON.stringify(sorted, null, 2) + "\n");

  return Response.json({ ok: true, count: Object.keys(sorted).length });
}
