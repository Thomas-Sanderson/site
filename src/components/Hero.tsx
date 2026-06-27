"use client";

import { siteConfig } from "@/data/siteConfig";
import { useInView } from "@/lib/useInView";

/**
 * Hero — a full-height intro section in normal document flow. The old version
 * was a fixed overlay whose name/title "morphed" into the site header based on
 * scroll position (scroll-capture). That morph is gone; the persistent header
 * now lives in <SiteHeader/> and fades in once this section scrolls away.
 *
 * Living in flow means the section auto-grows with its content at any font
 * size — no fixed-height pin, no clipping.
 */
export default function Hero() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2, once: true });

  const reveal = (i: number): React.CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
    transitionDelay: `${i * 0.12}s`,
  });

  return (
    <section
      id="intro"
      ref={ref}
      className="relative max-w-[960px] mx-auto px-6 md:px-12 min-h-[100svh] flex flex-col justify-center"
    >
      {/* Headshot — decorative, fades in */}
      <div
        className="absolute right-6 md:right-12 bottom-[5%] md:top-1/2 md:bottom-auto md:-translate-y-1/2 pointer-events-none"
        style={{ opacity: inView ? 0.28 : 0, transition: "opacity 1.1s ease-out" }}
        aria-hidden
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
        className="font-mono text-sm tracking-widest uppercase mb-4"
        style={{ color: "var(--color-terracotta)", ...reveal(0) }}
      >
        {siteConfig.title}
      </p>

      <h1
        className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight"
        style={reveal(1)}
      >
        {siteConfig.name}
      </h1>

      <p
        className="text-base sm:text-lg md:text-xl leading-relaxed max-w-[640px] mb-12 text-charcoal/80"
        style={reveal(2)}
      >
        I spent the first chapter of my career in boardrooms — consulting for
        the world&rsquo;s largest banks, insurers, and healthcare systems. Then I
        left to make art in Portugal for two years. After that, I went where the
        work mattered most: behavioral health, where I designed systems for
        people in crisis. Now I am trying to build things with AI that most teams
        haven&rsquo;t figured out are possible yet.
      </p>
    </section>
  );
}
