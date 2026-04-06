"use client";

import { useEffect, useCallback, useRef, useState } from "react";

/**
 * Scroll-card hook: tracks scroll progress through a sentinel element.
 *
 * Pattern: a tall sentinel div provides "scroll fuel". A sticky inner div
 * pins content to the viewport. progress goes 0→1 as the sentinel scrolls
 * through the viewport.
 *
 * @param sentinelRef - ref to the outer sentinel div
 * @returns progress (0–1), clamped
 */
export function useScrollCard(sentinelRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = sentinelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const denom = rect.height - window.innerHeight;
      const p = denom <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / denom));
      setProgress(p);
    });
  }, [sentinelRef]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [handleScroll]);

  return progress;
}

/** Linear interpolation, clamped 0–1 */
export function lerp(a: number, b: number, t: number) {
  const tc = Math.max(0, Math.min(1, t));
  return a + (b - a) * tc;
}
