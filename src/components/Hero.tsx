"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { siteConfig } from "@/data/siteConfig";
import { lerp } from "@/lib/timeline";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [ganttCollapse, setGanttCollapse] = useState(0);
  const [headingInitialY, setHeadingInitialY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Measure heading position for shrink animation target
  useEffect(() => {
    const measure = () => {
      if (headingRef.current) {
        setHeadingInitialY(headingRef.current.getBoundingClientRect().top);
      }
    };
    const timer = setTimeout(measure, 50);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const handleScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Progress 0→1 over the 200vh section (minus one viewport of sticky space)
    const p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
    setProgress(p);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Listen for Gantt collapse to crossfade heading → Gantt nav row
  useEffect(() => {
    const handler = (e: Event) => setGanttCollapse((e as CustomEvent<number>).detail);
    window.addEventListener("gantt-progress", handler);
    return () => window.removeEventListener("gantt-progress", handler);
  }, []);

  // Broadcast hero progress
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hero-progress", { detail: progress }));
  }, [progress]);

  // ── Phase calculations ──────────────────────────────────────
  // Bio paragraph: fades during 0.10–0.30
  const bioT = Math.max(0, Math.min(1, (progress - 0.10) / 0.20));
  const bioOpacity = lerp(1, 0, bioT);

  // Label ("DESIGN TECHNOLOGIST"): zips left 0.25–0.55
  const labelT = Math.max(0, Math.min(1, (progress - 0.25) / 0.30));
  const labelOpacity = isMobile
    ? lerp(1, 0, labelT)
    : lerp(1, 0, Math.max(0, (labelT - 0.8) / 0.2));
  const labelTranslateX = isMobile ? 0 : lerp(0, -250, labelT);
  const labelTranslateY = isMobile ? 0 : lerp(0, -80, labelT);
  const labelScaleVal = isMobile ? 1 : lerp(1, 0.6, labelT);

  // Heading ("Thomas"): shrinks + moves to top-left 0.40–0.70
  const headingT = Math.max(0, Math.min(1, (progress - 0.40) / 0.30));
  const targetScale = isMobile ? 0.29 : 0.19;
  const headingScale = lerp(1, targetScale, headingT);
  const headingTargetY = 24; // px from viewport top — matches Gantt nav row paddingTop
  const headingMoveY = headingInitialY > 0 ? headingInitialY - headingTargetY : 0;
  const headingTranslateY = lerp(0, -headingMoveY, headingT);

  // Heading fades when Gantt nav row appears (during Gantt collapse)
  const headingOpacity = ganttCollapse > 0.2
    ? lerp(1, 0, Math.min(1, (ganttCollapse - 0.2) / 0.3))
    : 1;

  return (
    <>
      {/* Scroll fuel — 200vh of empty space */}
      <section id="intro" ref={sectionRef} style={{ height: "200vh" }} />

      {/* Fixed overlay — animated hero content */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 45,
          pointerEvents: "none",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.8s ease",
          visibility:
            bioOpacity > 0.01 || labelOpacity > 0.01 || headingOpacity > 0.01
              ? "visible"
              : "hidden",
        }}
      >
        <div
          className="max-w-[960px] mx-auto px-6 md:px-12"
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            className="font-mono text-sm tracking-widest uppercase mb-4"
            style={{
              color: "var(--color-terracotta)",
              opacity: labelOpacity,
              transform: `translate(${labelTranslateX}px, ${labelTranslateY}px) scale(${labelScaleVal})`,
              transformOrigin: "left center",
            }}
          >
            {siteConfig.title}
          </p>

          <h1
            ref={headingRef}
            className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight"
            style={{
              opacity: headingOpacity,
              transform: `translateY(${headingTranslateY}px) scale(${headingScale})`,
              transformOrigin: "top left",
            }}
          >
            {siteConfig.name}
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed max-w-[640px] mb-12 text-charcoal/80"
            style={{
              opacity: bioOpacity,
              transform: `translateY(${bioT * 30}px)`,
            }}
          >
            I spent the first chapter of my career in boardrooms — consulting for
            the world&rsquo;s largest banks, insurers, and healthcare systems. Then I
            left to make art in Portugal for two years. After that, I went where the
            work mattered most: behavioral health, where I designed systems for
            people in crisis. Now I build things with AI that most teams haven&rsquo;t
            figured out are possible yet.
          </p>
        </div>
      </div>
    </>
  );
}
