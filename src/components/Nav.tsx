"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/data/siteConfig";

export default function Nav() {
  const [ganttProgress, setGanttProgress] = useState(0);

  useEffect(() => {
    const handleGanttProgress = (e: Event) => {
      setGanttProgress((e as CustomEvent<number>).detail);
    };
    window.addEventListener("gantt-progress", handleGanttProgress);
    return () => {
      window.removeEventListener("gantt-progress", handleGanttProgress);
    };
  }, []);

  // Nav only appears after Gantt fully collapses
  const visible = ganttProgress >= 0.95;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: visible ? "rgba(245, 240, 235, 0.9)" : "transparent",
        backdropFilter: visible ? "blur(12px)" : "none",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <a href="#intro" className="flex items-baseline gap-4">
          <span className="font-mono text-[10px] tracking-wide uppercase hidden sm:inline" style={{ color: "var(--color-terracotta)" }}>
            {siteConfig.title}
          </span>
          <span className="font-serif font-bold text-lg">
            {siteConfig.name}
          </span>
        </a>
        <div className="flex gap-6">
          {siteConfig.navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-xs tracking-wide hover:opacity-70 transition-opacity hidden sm:block"
              style={{ color: "var(--color-charcoal)" }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
