"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { siteConfig } from "@/data/siteConfig";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const sectionHeight = rect.height;
    // Progress from 0 (top of section at top of viewport) to 1 (section scrolled away)
    const p = Math.max(0, Math.min(1, -rect.top / (sectionHeight * 0.6)));
    setProgress(p);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Broadcast progress so Nav can react
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hero-progress", { detail: progress }));
  }, [progress]);

  // Interpolation helpers
  const labelScale = 1 - progress * 0.3;
  const headingScale = 1 - progress * 0.4;
  const subtextOpacity = Math.max(0, 1 - progress * 3);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className={`min-h-[85vh] flex flex-col justify-center px-6 md:px-12 max-w-[960px] mx-auto py-24 ${visible ? "visible" : ""}`}
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.8s ease" }}
    >
      <p
        className="font-mono text-sm tracking-widest uppercase mb-4 origin-left"
        style={{
          color: "var(--color-terracotta)",
          transform: `scale(${labelScale}) translateY(${-progress * 10}px)`,
        }}
      >
        {siteConfig.title}
      </p>

      <h1
        className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight origin-left"
        style={{
          transform: `scale(${headingScale}) translateY(${-progress * 20}px)`,
        }}
      >
        {siteConfig.name}
      </h1>

      <p
        className="text-lg md:text-xl leading-relaxed max-w-[640px] mb-12 text-charcoal/80"
        style={{
          opacity: subtextOpacity,
          transform: `translateY(${progress * 30}px)`,
        }}
      >
        I spent the first chapter of my career in boardrooms — consulting for
        the world&rsquo;s largest banks, insurers, and healthcare systems. Then I
        left to make art in Portugal for two years. After that, I went where the
        work mattered most: behavioral health, where I designed systems for
        people in crisis. Now I build things with AI that most teams haven&rsquo;t
        figured out are possible yet.
      </p>
    </section>
  );
}
