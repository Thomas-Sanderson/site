"use client";

import { useState, useEffect, useCallback } from "react";

// Story-deck snap sequence only. Each entry maps to the next anchor to advance
// to. Targets are real in-flow sections carrying scroll-mt, so a plain
// scrollIntoView lands correctly on every device — no pixel offsets.
const sections = [
  { id: "intro", next: "era-consulting", label: "The eras" },
  { id: "era-consulting", next: "era-art", label: "Continue" },
  { id: "era-art", next: "era-behavioral-health", label: "Continue" },
  { id: "era-behavioral-health", next: "era-acceleration", label: "Continue" },
  { id: "era-acceleration", next: "map", label: "The map" },
  { id: "map", next: "story-doors", label: "Where to next" },
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

      // Hide once the doors (end of the deck) come into view
      const doors = document.getElementById("story-doors");
      if (doors) {
        const rect = doors.getBoundingClientRect();
        setVisible(rect.top > window.innerHeight - 80);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = useCallback(() => {
    const target = document.getElementById(current.next);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [current]);

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed left-1/2 -translate-x-1/2 z-[48] flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
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
