"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reset scroll to the top on every route (path) change.
 *
 * Next's built-in scroll-to-top is unreliable across devices here because
 * `html { scroll-behavior: smooth }` turns the programmatic reset into an
 * animation that can be interrupted by the incoming page's layout — leaving you
 * partway down (e.g. the résumé opening at the bottom after navigating from the
 * bottom of the story). We force an INSTANT jump by briefly overriding
 * scroll-behavior, which keeps smooth scrolling for in-page anchors intact.
 *
 * Hash navigations are left alone so `#section` targets still land correctly.
 */
export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return; // let anchor targets win

    const el = document.documentElement;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto"; // override globals.css smooth
    window.scrollTo(0, 0);
    el.style.scrollBehavior = prev;
  }, [pathname]);

  return null;
}
