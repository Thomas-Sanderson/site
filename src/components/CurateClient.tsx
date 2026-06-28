"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { GalleryPhoto } from "@/lib/mapDots";

interface CurateDot {
  key: string;
  label: string;
  category: string;
  dateRange: string | null;
  currentSlug: string | null;
}

const CAT_COLOR: Record<string, string> = {
  live: "#2A6B5A",
  work: "#C4725A",
  art: "#7B5EA7",
  travel: "#5A8FC4",
};

export default function CurateClient({
  dots,
  photos,
}: {
  dots: CurateDot[];
  photos: GalleryPhoto[];
}) {
  const [i, setI] = useState(0);
  const [photoList, setPhotoList] = useState<GalleryPhoto[]>(photos);
  const [assigned, setAssigned] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(dots.map((d) => [d.key, d.currentSlug]))
  );
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("");

  const srcBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of photoList) m.set(p.slug, p.src);
    return m;
  }, [photoList]);

  const dot = dots[i];
  const currentSlug = dot ? assigned[dot.key] : null;
  const assignedCount = Object.values(assigned).filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return photoList;
    return photoList.filter(
      (p) => p.slug.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }, [photoList, filter]);

  const go = useCallback((delta: number) => {
    setI((v) => Math.max(0, Math.min(dots.length - 1, v + delta)));
    setFilter("");
  }, [dots.length]);

  const assign = useCallback(
    async (slug: string | null) => {
      if (!dot) return;
      setAssigned((a) => ({ ...a, [dot.key]: slug }));
      setStatus("saving…");
      try {
        await fetch("/api/curate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: dot.key, slug }),
        });
        setStatus("saved");
      } catch {
        setStatus("save failed");
      }
    },
    [dot]
  );

  const uploadPaste = useCallback(
    async (dataUrl: string) => {
      if (!dot) return;
      setStatus("uploading pasted image…");
      try {
        const res = await fetch("/api/curate/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: dot.key, location: dot.label, date: dot.dateRange, dataUrl }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "upload failed");
        setPhotoList((prev) => [
          { slug: json.slug, src: json.src, location: dot.label, date: dot.dateRange ?? "", category: "" },
          ...prev,
        ]);
        setAssigned((a) => ({ ...a, [dot.key]: json.slug }));
        setStatus(`added ${json.slug}`);
      } catch (e) {
        setStatus("upload failed: " + (e as Error).message);
      }
    },
    [dot]
  );

  // ⌘V paste an image -> upload + assign to the current dot
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((it) => it.type.startsWith("image/"));
      if (!item) return;
      const blob = item.getAsFile();
      if (!blob) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = () => uploadPaste(reader.result as string);
      reader.readAsDataURL(blob);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [uploadPaste]);

  if (!dot) return <div className="p-8 font-mono">No dots.</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1a1a1a", color: "#f5f0eb" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-white/10" style={{ backgroundColor: "#1a1a1a" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => go(-1)} disabled={i === 0} className="px-3 py-1.5 rounded border border-white/15 disabled:opacity-30 font-mono text-xs">◀ Prev</button>
          <span className="font-mono text-xs text-white/50">{i + 1} / {dots.length}</span>
          <button onClick={() => go(1)} disabled={i === dots.length - 1} className="px-3 py-1.5 rounded border border-white/15 disabled:opacity-30 font-mono text-xs">Keep ▶</button>
        </div>
        <div className="font-mono text-xs text-white/40">
          {assignedCount}/{dots.length} have photos{status ? ` · ${status}` : ""}
        </div>
      </div>

      {/* Current dot */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-5 items-start border-b border-white/10">
        <div className="shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CAT_COLOR[dot.category] ?? "#999" }} />
            <span className="font-serif text-2xl font-bold">{dot.label}</span>
          </div>
          <p className="font-mono text-xs text-white/50">{dot.category} · {dot.dateRange ?? "—"}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => go(1)} className="px-3 py-1.5 rounded font-mono text-xs" style={{ backgroundColor: "#C4725A", color: "#fff" }}>Keep current →</button>
            <button onClick={() => assign(null)} className="px-3 py-1.5 rounded border border-white/15 font-mono text-xs">Clear</button>
          </div>
          <p className="mt-2 font-mono text-[10px] text-white/40">⌘V to paste a new photo for this dot</p>
        </div>
        <div className="w-full sm:w-[360px] shrink-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">Current</p>
          {currentSlug && srcBySlug.get(currentSlug) ? (
            <>
              <img src={srcBySlug.get(currentSlug)} alt="" className="w-full rounded border border-white/10 max-h-72 object-contain bg-black/30" />
              <p className="font-mono text-[10px] text-white/40 mt-1">{currentSlug}</p>
            </>
          ) : (
            <div className="w-full h-40 rounded border border-dashed border-white/20 flex items-center justify-center font-mono text-xs text-white/30">— no photo · ⌘V to paste —</div>
          )}
        </div>
      </div>

      {/* Photo picker */}
      <div className="px-5 py-3 sticky top-[49px] z-10" style={{ backgroundColor: "#1a1a1a" }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${photoList.length} photos by slug or location…`}
          className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 font-mono text-sm outline-none focus:border-white/30"
        />
      </div>
      <div className="px-5 pb-16 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {filtered.map((p) => {
          const isCurrent = p.slug === currentSlug;
          return (
            <button
              key={p.slug}
              onClick={() => assign(p.slug)}
              className="group text-left rounded overflow-hidden border transition-all"
              style={{ borderColor: isCurrent ? "#C4725A" : "rgba(255,255,255,0.1)", outline: isCurrent ? "2px solid #C4725A" : "none" }}
              title={`${p.slug} · ${p.location}`}
            >
              <div className="aspect-[4/3] bg-black/30">
                <img src={p.src} alt="" loading="lazy" className="w-full h-full object-cover group-hover:opacity-90" />
              </div>
              <div className="px-1.5 py-1">
                <p className="font-mono text-[9px] truncate text-white/70">{p.slug}</p>
                <p className="font-mono text-[8px] truncate text-white/35">{p.location}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
