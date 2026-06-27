"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/siteConfig";

/**
 * Persistent site header + route-based nav. Always visible on every page.
 * Navigation moves between real routes (Story / Case Studies / Resume) via
 * next/link — no scroll-jacking, no in-page anchor offsets.
 */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[45]"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        backgroundColor: "rgba(245, 240, 235, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(45, 42, 38, 0.08)",
      }}
    >
      <div className="max-w-[1200px] mx-auto h-[52px] px-6 md:px-12 flex items-center justify-between">
        {/* Name + title → home */}
        <Link href="/" className="flex items-baseline gap-2 hover:opacity-70 transition-opacity">
          <span className="font-serif font-bold text-base leading-none">
            {siteConfig.name}
          </span>
          <span
            className="font-mono text-[10px] tracking-widest uppercase hidden sm:inline"
            style={{ color: "var(--color-terracotta)" }}
          >
            {siteConfig.title}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-5">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[10px] tracking-wide hover:opacity-70 transition-opacity"
              style={{
                color: isActive(item.href)
                  ? "var(--color-charcoal)"
                  : "rgba(45, 42, 38, 0.5)",
              }}
            >
              {item.label}
            </Link>
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
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-xs tracking-wide py-2 hover:opacity-70 transition-opacity"
                style={{
                  color: isActive(item.href)
                    ? "var(--color-charcoal)"
                    : "rgba(45, 42, 38, 0.6)",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
