"use client";

import Link from "next/link";
import { useReveal } from "@/lib/useReveal";

/**
 * The two "doors" that close the Story deck — explicit routes into the heavier
 * content that moved out of the scroll: the case studies and the resume.
 */
export default function StoryDoors() {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section
      id="story-doors"
      className="px-6 md:px-12 max-w-[960px] mx-auto py-20 sm:py-28"
    >
      <p
        className="font-mono text-sm tracking-widest uppercase mb-8 text-center"
        style={{ color: "var(--color-terracotta)" }}
      >
        Where to next
      </p>
      <div
        ref={ref}
        className="grid sm:grid-cols-2 gap-6"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <Link
          href="/work"
          className="group block rounded-2xl p-8 ring-1 ring-charcoal/5 bg-warm-white hover:ring-charcoal/15 hover:-translate-y-0.5 transition-all duration-300"
        >
          <h3 className="font-serif text-2xl font-bold mb-2 flex items-center gap-2">
            See the work
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </h3>
          <p className="text-base leading-relaxed text-charcoal/70">
            Case studies — Gab, Couve, and Paper Cannon. Deterministic AI in
            regulated, high-stakes environments.
          </p>
        </Link>

        <Link
          href="/resume"
          className="group block rounded-2xl p-8 ring-1 ring-charcoal/5 bg-warm-white hover:ring-charcoal/15 hover:-translate-y-0.5 transition-all duration-300"
        >
          <h3 className="font-serif text-2xl font-bold mb-2 flex items-center gap-2">
            Read the resume
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </h3>
          <p className="text-base leading-relaxed text-charcoal/70">
            The career timeline as an interactive chart, plus the full,
            searchable text résumé.
          </p>
        </Link>
      </div>
    </section>
  );
}
