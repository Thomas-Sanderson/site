"use client";

import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  /** 0–1 fraction visible to count as in view when scrolling in. */
  threshold?: number;
  /** Root margin for the scroll-in observer. */
  rootMargin?: string;
}

/**
 * Defensive reveal-on-scroll.
 *
 * Unlike a "hidden by default, shown by JS" reveal (which leaves a BLANK page
 * if the JS never runs — e.g. blocked chunks, hydration failure), this defaults
 * to VISIBLE and only arms the animation once React is actually alive:
 *
 *   - No JS / blocked JS / failed hydration  → effect never runs → content stays
 *     visible. Safe.
 *   - JS alive, element already on screen     → stays visible, no flash, no anim.
 *   - JS alive, element below the fold        → hidden off-screen (unseen), then
 *     animates in when scrolled into view.
 *
 * Returns `revealed` (drive opacity/transform off it) and a ref to attach.
 */
export function useReveal<T extends HTMLElement>(options?: UseRevealOptions) {
  const { threshold = 0.15, rootMargin = "0px" } = options ?? {};
  const ref = useRef<T>(null);
  // Default visible — this is what makes it defensive.
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Already on screen at mount: leave it visible (no flash, no entrance anim).
    const rect = el.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
    if (onScreen) return;

    // Off screen: hide now (unseen) and reveal when it scrolls into view.
    setRevealed(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, revealed };
}
