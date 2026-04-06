"use client";

import { useEffect, useRef } from "react";
import type { CaseStudy } from "@/data/caseStudies";

export default function CaseStudyCard({ study }: { study: CaseStudy }) {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={ref}
      className={`reveal rounded-2xl ${
        study.flagship ? "p-8 md:p-12 bg-warm-white ring-1 ring-charcoal/5" : ""
      }`}
    >
      {study.flagship && (
        <span
          className="inline-block font-mono text-xs uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
          style={{
            backgroundColor: "rgba(196, 114, 90, 0.1)",
            color: "var(--color-terracotta)",
          }}
        >
          Flagship Project
        </span>
      )}

      <h3 className="font-serif text-3xl md:text-4xl font-bold mb-1">
        {study.title}
      </h3>
      <p
        className="font-mono text-sm mb-8"
        style={{ color: "var(--color-muted)" }}
      >
        {study.subtitle}
      </p>

      <div className="grid gap-8 md:gap-10">
        <Block label="Context" text={study.context} />
        <Block label="Problem" text={study.problem} />
        <Block label="What I Built" text={study.built} />
        <Block label="Why It Matters" text={study.matters} />

        {study.extra && (
          <div
            className="rounded-xl p-6 mt-2"
            style={{ backgroundColor: "rgba(42, 107, 90, 0.06)" }}
          >
            <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-teal)" }}>
              {study.extra.label}
            </p>
            <p className="text-base leading-relaxed">{study.extra.text}</p>
          </div>
        )}

        {/* Image placeholders */}
        <div className={`grid gap-4 ${study.imagePlaceholders.length > 1 ? "md:grid-cols-2" : ""}`}>
          {study.imagePlaceholders.map((label) => (
            <div
              key={label}
              className="rounded-xl border-2 border-dashed flex items-center justify-center min-h-[200px]"
              style={{ borderColor: "var(--color-muted)" }}
            >
              <p className="font-mono text-sm text-center px-4" style={{ color: "var(--color-muted)" }}>
                {label}
                <br />
                <span className="text-xs opacity-60">
                  /public/images/{study.slug}/
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p
        className="font-mono text-xs uppercase tracking-widest mb-2"
        style={{ color: "var(--color-terracotta)" }}
      >
        {label}
      </p>
      <p className="text-base md:text-lg leading-relaxed">{text}</p>
    </div>
  );
}
