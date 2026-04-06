"use client";

import { useState, useEffect } from "react";

/**
 * Detects if the viewport is below a breakpoint (default 640px = Tailwind sm).
 * Returns false during SSR. Only updates on mount and resize.
 */
export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
