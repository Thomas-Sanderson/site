"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "intro", next: "gantt-sentinel", label: "Employment" },
  { id: "gantt-sentinel", next: "map", label: "World" },
  { id: "map", next: "era-consulting", label: "Eras" },
  { id: "era-consulting", next: "era-art", label: "Continue" },
  { id: "era-art", next: "era-behavioral-health", label: "Continue" },
  { id: "era-behavioral-health", next: "era-acceleration", label: "Continue" },
  { id: "era-acceleration", next: "case-studies", label: "Case Studies" },
  { id: "case-studies", next: "resume", label: "Resume" },
  { id: "resume", next: "contact", label: "Get in Touch" },
];

export default function ScrollNext() {
  const [current, setCurrent] = useState(sections[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Find which section is currently in view (last one whose top has passed mid-viewport)
      const mid = window.innerHeight * 0.5;
      let active = sections[0];
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < mid) active = s;
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

  if (!visible) return null;

  return (
    <a
      href={`#${current.next}`}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[48] flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
      style={{
        color: "var(--color-charcoal)",
        backgroundColor: "rgba(245, 240, 235, 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(45, 42, 38, 0.1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        pointerEvents: "auto",
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
    </a>
  );
}
