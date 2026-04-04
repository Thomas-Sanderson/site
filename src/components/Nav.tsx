"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/data/siteConfig";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [ganttProgress, setGanttProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    const handleGanttProgress = (e: Event) => {
      setGanttProgress((e as CustomEvent<number>).detail);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("gantt-progress", handleGanttProgress);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("gantt-progress", handleGanttProgress);
    };
  }, []);

  const ganttActive = ganttProgress > 0;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled && !ganttActive ? "rgba(245, 240, 235, 0.9)" : "transparent",
        backdropFilter: scrolled && !ganttActive ? "blur(12px)" : "none",
        opacity: ganttActive ? 0 : 1,
        pointerEvents: ganttActive ? "none" : "auto",
      }}
    >
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <a href="#intro" className="font-serif font-bold text-lg">
          {siteConfig.name}
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
