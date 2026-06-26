"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/data/siteConfig";

/**
 * Persistent site header + nav. Fades in once the hero (#intro) has scrolled
 * out of view, replacing the old scroll-driven "name morphs into header"
 * animation. Lives entirely in fixed positioning so it never participates in
 * document flow — and uses plain anchor links (sections carry `scroll-mt`),
 * so there are no device-tuned pixel scroll offsets.
 */
export default function SiteHeader() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("intro");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-52px 0px 0px 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[45]"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        backgroundColor: "rgba(245, 240, 235, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(45, 42, 38, 0.08)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.4s ease",
      }}
    >
      <div className="max-w-[1200px] mx-auto h-[52px] px-6 md:px-12 flex items-center justify-between">
        {/* Name + title */}
        <a href="#intro" className="flex items-baseline gap-2 hover:opacity-70 transition-opacity">
          <span className="font-serif font-bold text-base leading-none">
            {siteConfig.name}
          </span>
          <span
            className="font-mono text-[10px] tracking-widest uppercase hidden sm:inline"
            style={{ color: "var(--color-terracotta)" }}
          >
            {siteConfig.title}
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-5">
          {siteConfig.navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[10px] tracking-wide hover:opacity-70 transition-opacity"
              style={{ color: "rgba(45, 42, 38, 0.5)" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-1"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <line x1="0" y1="1" x2="18" y2="1" stroke="rgba(45, 42, 38, 0.5)" strokeWidth="2" />
            <line x1="0" y1="7" x2="18" y2="7" stroke="rgba(45, 42, 38, 0.5)" strokeWidth="2" />
            <line x1="0" y1="13" x2="18" y2="13" stroke="rgba(45, 42, 38, 0.5)" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="sm:hidden"
          style={{
            backgroundColor: "rgba(245, 240, 235, 0.98)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(45, 42, 38, 0.08)",
          }}
        >
          <div className="flex flex-col px-6 py-3 gap-1">
            {siteConfig.navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-xs tracking-wide py-2 hover:opacity-70 transition-opacity"
                style={{ color: "rgba(45, 42, 38, 0.6)" }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
