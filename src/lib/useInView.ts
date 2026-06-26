"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** 0–1 fraction of the element that must be visible to count as "in view". */
  threshold?: number;
  /** Margin around the root, e.g. "-45% 0px" to create a centered activation band. */
  rootMargin?: string;
  /** If true, latches to true on first intersection and stops observing. */
  once?: boolean;
}

/**
 * Reveal-on-scroll primitive. Returns a ref to attach to an element and a
 * boolean that flips to true when the element enters the viewport.
 *
 * This replaces the old scroll-fuel / sticky-pin math: instead of tying
 * animation to a fixed-height pinned container (which clips content when the
 * font size or viewport changes), sections live in normal document flow and
 * simply animate once as they scroll into view. Robust across font sizes,
 * viewport sizes, and portrait mobile.
 */
export function useInView<T extends HTMLElement>(options?: UseInViewOptions) {
  const { threshold = 0.15, rootMargin = "0px", once = false } = options ?? {};
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // SSR / very old browsers: fail open so content is never hidden.
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
