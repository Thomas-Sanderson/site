"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/data/siteConfig";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="reveal min-h-[85vh] flex flex-col justify-center px-6 md:px-12 max-w-[960px] mx-auto py-24"
    >
      <p
        className="font-mono text-sm tracking-widest uppercase mb-4"
        style={{ color: "var(--color-terracotta)" }}
      >
        {siteConfig.title}
      </p>

      <h1 className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight">
        {siteConfig.name}
      </h1>

      <p className="text-lg md:text-xl leading-relaxed max-w-[640px] mb-12 text-charcoal/80">
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
