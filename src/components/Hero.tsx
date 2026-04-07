"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { siteConfig } from "@/data/siteConfig";
import { lerp } from "@/lib/useScrollCard";
import { useIsMobile } from "@/lib/useIsMobile";

const navLinks = [
  { label: "Employment", id: "gantt-sentinel", scrollPx: () => (window.innerWidth < 640 ? 700 : 1200) * 0.5 },
  { label: "World", id: "map", scrollPx: () => 600 },
  { label: "Eras", id: "era-consulting", scrollPx: () => window.innerHeight * 0.5 },
  { label: "Case Studies", id: "case-studies" },
  { label: "Resume", id: "resume" },
];

/*
  Hero animation — driven by raw scrollY, NOT useScrollCard.

  The hero is position:fixed, so it doesn't need a tall sentinel.
  The sentinel is just a spacer that controls how much document space
  the hero "occupies" before the Gantt starts. We keep it short so
  there's minimal dead scroll between the hero finishing and the Gantt
  appearing.

  HERO_SCROLL_RANGE controls total scroll distance for the animation.
  The sentinel height = 100vh + HERO_SCROLL_RANGE (first 100vh is visible
  without scrolling, then HERO_SCROLL_RANGE px of actual scroll).

  Phase A — BIO FADE (0.0–0.15)
  Phase B — LABEL SLIDES RIGHT (0.10–0.35)
  Phase C — BOTH MOVE UP + SHRINK (0.30–0.85)
  Dead zone: 0.85–1.0 = 15% of range = small buffer before Gantt
*/

const HEADER_TOP = 16;
const HERO_SCROLL_RANGE = 400; // px of scroll for the full animation

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingTextRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headerTargetRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = useCallback((item: typeof navLinks[number]) => {
    const el = document.getElementById(item.id);
    if (!el) return;
    const px = item.scrollPx ? item.scrollPx() : 0;
    const targetY = el.getBoundingClientRect().top + window.scrollY + px;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, []);
  const [headerTargetTop, setHeaderTargetTop] = useState(0);
  const [labelTop, setLabelTop] = useState(0);
  const [labelLeft, setLabelLeft] = useState(0);
  const [labelWidth, setLabelWidth] = useState(0);
  const [headingTop, setHeadingTop] = useState(0);
  const [headingLeft, setHeadingLeft] = useState(0);
  const [headingHeight, setHeadingHeight] = useState(0);
  const [headingWidth, setHeadingWidth] = useState(0);

  useEffect(() => {
    // Scroll reset is handled by the inline script in layout.tsx (runs before hydration).
    // This is a safety net for client-side navigations.
    window.scrollTo(0, 0);
    setMounted(true);
  }, []);

  // Track scrollY directly
  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = Math.max(0, Math.min(1, window.scrollY / HERO_SCROLL_RANGE));
        setProgress(p);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      if (labelRef.current) {
        const r = labelRef.current.getBoundingClientRect();
        // Fixed element — r.top is already viewport-relative, no scrollY needed
        setLabelTop(r.top);
        setLabelLeft(r.left);
        setLabelWidth(r.width);
      }
      if (headingRef.current) {
        const r = headingRef.current.getBoundingClientRect();
        setHeadingTop(r.top);
        setHeadingLeft(r.left);
        setHeadingHeight(r.height);
        if (headingTextRef.current) {
          setHeadingWidth(headingTextRef.current.getBoundingClientRect().width);
        }
      }
      if (headerTargetRef.current) {
        setHeaderTargetTop(headerTargetRef.current.getBoundingClientRect().top);
      }
    };
    // Measure on mount
    const timer = setTimeout(measure, 50);

    // Re-measure on desktop resize (e.g. dragging to a different monitor).
    // Skip on mobile — iOS toolbar hide triggers resize and corrupts measurements.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      if (window.innerWidth < 640) return; // mobile — skip
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Reset scroll to get clean measurements
        window.scrollTo(0, 0);
        setTimeout(measure, 50);
      }, 200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const phases = useMemo(() => {
    // ── Phase A: Bio fade (0.0–0.15) ──
    const bioT = Math.max(0, Math.min(1, progress / 0.15));
    const bioOpacity = lerp(1, 0, bioT);
    const bioSlide = lerp(0, 30, bioT);

    // ── Phase B: Label slides right (0.10–0.35) ──
    const slideT = Math.max(0, Math.min(1, (progress - 0.10) / 0.25));

    // ── Phase C: Both move up + shrink (0.30–0.85) ──
    const riseT = Math.max(0, Math.min(1, (progress - 0.30) / 0.55));

    // Heading scale
    const headingFontPx = isMobile ? 48 : 72;
    const headingTargetScale = 22 / headingFontPx;
    const headingScale = lerp(1, headingTargetScale, riseT);

    // Heading Y — measured target position, not hardcoded (handles iOS dynamic toolbar)
    const headingMoveY = lerp(0, -(headingTop - headerTargetTop), riseT);

    // Label X — clamp on small screens so label doesn't overflow viewport
    const gapFull = isMobile ? 8 : 16;
    const maxSlide = typeof window !== "undefined"
      ? window.innerWidth - labelLeft - labelWidth - 24
      : Infinity;
    const slideTargetX = Math.min(headingWidth + gapFull, maxSlide);
    const labelSlideX = lerp(0, slideTargetX, slideT);

    const gapFinal = 10;
    const shrunkTargetX = headingWidth * headingScale + gapFinal;
    const labelShrinkAdjustX = lerp(0, shrunkTargetX - slideTargetX, riseT);
    const labelTotalX = labelSlideX + labelShrinkAdjustX;

    // Label Y
    const headingBottom = headingTop + headingHeight;
    const labelSlideTargetY = headingBottom - 14 - labelTop;
    const labelSlideY = lerp(0, labelSlideTargetY, slideT);

    const labelFinalY = headerTargetTop + 4;
    const labelAfterSlide = labelTop + labelSlideTargetY;
    const labelRiseTargetY = -(labelAfterSlide - labelFinalY);
    const labelRiseY = lerp(0, labelRiseTargetY, riseT);
    const labelTotalY = labelSlideY + labelRiseY;

    // Label scale
    const labelTotalScale = lerp(1, 10 / 14, Math.max(slideT, riseT));

    // On mobile only: once rise is mostly done, snap to fixed position
    // (bypasses iOS Safari dynamic toolbar issues). Desktop keeps transforms.
    const settled = isMobile && riseT >= 0.85;

    return {
      bioOpacity, bioSlide,
      labelTotalX, labelTotalY, labelTotalScale,
      headingScale, headingMoveY,
      slideT, riseT, settled,
    };
  }, [progress, isMobile, headerTargetTop, labelTop, labelLeft, labelWidth,
      headingTop, headingLeft, headingHeight, headingWidth]);

  // Sentinel height: just enough so the Gantt starts right after the animation.
  // The animation finishes at progress 0.85 = 340px of scroll.
  // Add a small buffer. Total sentinel = HERO_SCROLL_RANGE + small margin.
  // The first 100vh is visible without scrolling, so we need the sentinel
  // to push the Gantt down by the scroll range amount.
  const sentinelHeight = HERO_SCROLL_RANGE + 30; // 430px total

  return (
    <>
      {/* Scroll fuel — short sentinel, just enough to push Gantt down */}
      <div id="intro" style={{ height: `${sentinelHeight}px` }} />

      {/* Fixed overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 45,
          pointerEvents: "none",
          opacity: mounted && headingTop > 0 && headerTargetTop > 0 ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        {/* Backdrop — only appears after text has settled */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: 0,
            right: 0,
            height: "calc(152px + env(safe-area-inset-top, 0px))",
            paddingTop: "calc(100px + env(safe-area-inset-top, 0px))",
            backgroundColor: `rgba(245, 240, 235, ${phases.riseT >= 1 ? 1 : 0})`,
            backdropFilter: phases.riseT >= 1 ? "blur(12px)" : "none",
            borderBottom: phases.riseT >= 1
              ? "1px solid rgba(45, 42, 38, 0.08)"
              : "1px solid transparent",
            transition: "background-color 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease",
            pointerEvents: phases.riseT >= 1 ? "auto" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {/* Invisible marker at the desired heading resting position */}
          <div ref={headerTargetRef} style={{ position: "absolute", top: "116px", left: 0, width: 0, height: 0 }} />
          <nav
            className="max-w-[960px] w-full mx-auto px-6 md:px-12 flex justify-end gap-5"
            style={{
              opacity: phases.riseT >= 1 ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            {/* Desktop links */}
            {navLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(item); }}
                className="font-mono text-[10px] tracking-wide hover:opacity-70 transition-opacity hidden sm:block"
                style={{ color: "rgba(45, 42, 38, 0.5)" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Mobile hamburger — always visible */}
        <div
          className="sm:hidden absolute right-0 top-0 p-4"
          style={{
            top: "env(safe-area-inset-top, 0px)",
            zIndex: 47,
            pointerEvents: "auto",
          }}
        >
          <button
            className="p-1"
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

        {/* Mobile dropdown menu — outside overlay for correct z-stacking */}
        {menuOpen && (
          <div
            className="sm:hidden fixed left-0 right-0"
            style={{
              top: "calc(52px + env(safe-area-inset-top, 0px))",
              backgroundColor: "rgba(245, 240, 235, 0.98)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(45, 42, 38, 0.08)",
              zIndex: 9997,
              pointerEvents: "auto",
            }}
          >
            <div className="flex flex-col px-6 py-3 gap-1">
              {navLinks.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => { e.preventDefault(); setMenuOpen(false); scrollToSection(item); }}
                  className="font-mono text-xs tracking-wide py-2 hover:opacity-70 transition-opacity"
                  style={{ color: "rgba(45, 42, 38, 0.6)" }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Content — initial centered layout */}
        <div
          className="max-w-[960px] mx-auto px-6 md:px-12"
          style={{
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Headshot — fades out with bio */}
          <div
            className="absolute right-6 md:right-12 bottom-[5%] md:top-1/2 md:bottom-auto md:-translate-y-1/2"
            style={{
              opacity: phases.bioOpacity * 0.28,
              transform: `translateY(${phases.bioSlide}px)`,
              pointerEvents: "none",
            }}
          >
            <img
              src="/images/headshot.png"
              alt=""
              className="hidden md:block"
              style={{
                width: "280px",
                height: "280px",
                objectFit: "cover",
                objectPosition: "center top",
                borderRadius: "50%",
                filter: "grayscale(1) contrast(0.9) brightness(1.1)",
                mixBlendMode: "multiply",
              }}
            />
            <img
              src="/images/headshot.png"
              alt=""
              className="md:hidden"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                objectPosition: "center top",
                borderRadius: "50%",
                filter: "grayscale(1) contrast(0.9) brightness(1.1)",
                mixBlendMode: "multiply",
              }}
            />
          </div>

          <p
            ref={labelRef}
            className="font-mono text-sm tracking-widest uppercase mb-4"
            style={phases.settled ? {
              color: "var(--color-terracotta)",
              position: "fixed",
              top: `calc(${HEADER_TOP + 7}px + env(safe-area-inset-top, 0px))`,
              left: `${labelLeft + phases.labelTotalX}px`,
              fontSize: "10px",
              zIndex: 46,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              margin: 0,
            } : {
              color: "var(--color-terracotta)",
              transform: `translate(${phases.labelTotalX}px, ${phases.labelTotalY}px) scale(${phases.labelTotalScale})`,
              transformOrigin: "left bottom",
              position: "relative",
              zIndex: 46,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {siteConfig.title}
          </p>

          <h1
            ref={headingRef}
            className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight"
            style={phases.settled ? {
              position: "fixed",
              top: `calc(${HEADER_TOP}px + env(safe-area-inset-top, 0px))`,
              left: `${headingLeft}px`,
              fontSize: "22px",
              lineHeight: 1,
              zIndex: 46,
              pointerEvents: "none",
              margin: 0,
            } : {
              transform: `translateY(${phases.headingMoveY}px) scale(${phases.headingScale})`,
              transformOrigin: "top left",
              position: "relative",
              zIndex: 46,
              pointerEvents: "none",
            }}
          >
            <span ref={headingTextRef}>{siteConfig.name}</span>
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl leading-relaxed max-w-[640px] mb-12 text-charcoal/80"
            style={{
              opacity: phases.bioOpacity,
              transform: `translateY(${phases.bioSlide}px)`,
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
