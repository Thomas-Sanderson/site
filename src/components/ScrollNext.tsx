"use client";

import { useState, useEffect, useCallback } from "react";

const GANTT_OFFSET = () => (window.innerWidth < 640 ? 700 : 1200) * 0.5;
const MAP_OFFSET = () => window.innerHeight + 600; // 100vh lead-in + 600px anim range
const ERA_OFFSET = () => window.innerHeight * 0.5; // mid-hold of 200vh sentinel

const sections = [
  { id: "intro", next: "gantt-sentinel", label: "Employment", scrollPx: GANTT_OFFSET },
  { id: "gantt-sentinel", next: "map", label: "World", scrollPx: MAP_OFFSET },
  { id: "map", next: "era-consulting", label: "Eras", scrollPx: ERA_OFFSET },
  { id: "era-consulting", next: "era-art", label: "Continue", scrollPx: ERA_OFFSET },
  { id: "era-art", next: "era-behavioral-health", label: "Continue", scrollPx: ERA_OFFSET },
  { id: "era-behavioral-health", next: "era-acceleration", label: "Continue", scrollPx: ERA_OFFSET },
  { id: "era-acceleration", next: "case-studies", label: "Case Studies" },
  { id: "case-studies", next: "resume", label: "Resume" },
  { id: "resume", next: "contact", label: "Get in Touch" },
] as const;

type Section = (typeof sections)[number];

export default function ScrollNext() {
  const [current, setCurrent] = useState<Section>(sections[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Use a higher threshold so sections don't switch too early
      const threshold = window.innerHeight * 0.35;
      let active: Section = sections[0];
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < threshold) active = s;
        }
      }
      setCurrent(active);

      // Hide when at the footer
      const footer = document.getElementById("contact");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        setVisible(rect.top > window.innerHeight - 80);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const target = document.getElementById(current.next);
      if (!target) return;

      if ("scrollPx" in current && current.scrollPx) {
        const px = current.scrollPx();
        const targetY = target.getBoundingClientRect().top + window.scrollY + px;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    [current]
  );

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[48] flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        color: "var(--color-charcoal)",
        backgroundColor: "rgba(245, 240, 235, 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(45, 42, 38, 0.1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {current.label}
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 3v9m0 0l-3.5-3.5M8 12l3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
