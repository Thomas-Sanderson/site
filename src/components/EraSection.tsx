"use client";

import { useEffect, useRef } from "react";
import type { Era } from "@/data/eras";
import { caseStudies } from "@/data/caseStudies";
import CaseStudyCard from "./CaseStudyCard";

export default function EraSection({ era }: { era: Era }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
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

  const studies = era.caseStudySlugs
    ? caseStudies.filter((s) => era.caseStudySlugs!.includes(s.slug))
    : [];

  return (
    <section
      id={`era-${era.id}`}
      ref={ref}
      className="reveal px-6 md:px-12 py-24 max-w-[960px] mx-auto"
    >
      <p
        className="font-mono text-sm tracking-widest uppercase mb-4"
        style={{ color: era.color }}
      >
        {era.dateRange}
      </p>

      <h2 className="font-serif text-4xl md:text-5xl font-bold mb-2">
        {era.title}
      </h2>
      <p className="font-mono text-sm mb-12" style={{ color: "var(--color-muted)" }}>
        {era.subtitle}
      </p>

      <div className="flex flex-col gap-6 mb-16">
        {era.narrative.map((paragraph, i) => (
          <p
            key={i}
            className="text-lg leading-relaxed max-w-[640px] text-charcoal/80"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {studies.length > 0 && (
        <div className="flex flex-col gap-16">
          {studies.map((study) => (
            <CaseStudyCard key={study.slug} study={study} />
          ))}
        </div>
      )}
    </section>
  );
}
