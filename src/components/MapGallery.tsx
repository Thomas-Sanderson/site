"use client";

import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

export interface GalleryStop {
  id: string;
  label: string;
  dateRange: string | null;
  photo: { src: string; alt: string } | null;
  annotation?: string | null;
}

/**
 * Full-bleed modal gallery for the map. Opens at a given stop index and walks
 * the full chronological sequence. Accessibility: role=dialog/aria-modal, Esc +
 * close button + click-outside dismiss, focus trapped while open, arrow keys
 * navigate (desktop), tap-image advances (mobile). Returning focus to the
 * triggering dot is handled by the parent via `onClose`.
 */
export default function MapGallery({
  stops,
  index,
  onClose,
  onIndex,
}: {
  stops: GalleryStop[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;
  const isMobile = useIsMobile();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (delta: number) => {
      if (index === null || stops.length === 0) return;
      const n = stops.length;
      onIndex((((index + delta) % n) + n) % n);
    },
    [index, stops.length, onIndex]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Tab") {
        const f = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go, onClose]);

  if (!open || index === null) return null;
  const stop = stops[index];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo — ${stop.label}`}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: "rgba(10, 10, 18, 0.94)", backdropFilter: "blur(4px)" }}
    >
      {/* Top bar — counter + close */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="font-mono text-xs text-white/60">
          {index + 1} / {stops.length}
        </span>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close gallery"
          className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* Image area — click the surround to close; tap image advances on mobile */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          aria-label="Previous"
          className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {stop.photo ? (
          <img
            src={stop.photo.src}
            alt={stop.photo.alt}
            className="max-w-full max-h-full object-contain rounded"
            onClick={(e) => { e.stopPropagation(); if (isMobile) go(1); }}
          />
        ) : (
          <div
            onClick={(e) => { e.stopPropagation(); if (isMobile) go(1); }}
            className="flex flex-col items-center justify-center rounded-xl border px-10 py-16 max-w-[88vw]"
            style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <span className="text-3xl mb-3 opacity-40" aria-hidden>▦</span>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Photo coming</p>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); go(1); }}
          aria-label="Next"
          className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Caption footer — where + when (+ annotation later) */}
      <div className="shrink-0 px-5 py-5 text-center">
        <p className="font-serif text-white text-lg">{stop.label}</p>
        {stop.dateRange && (
          <p className="font-mono text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {stop.dateRange}
          </p>
        )}
        {stop.annotation && (
          <p className="text-sm mt-2 max-w-[600px] mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
            {stop.annotation}
          </p>
        )}
      </div>
    </div>
  );
}
