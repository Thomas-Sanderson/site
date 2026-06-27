import type { Metadata } from "next";
import { caseStudies } from "@/data/caseStudies";
import WorkCard from "@/components/WorkCard";

export const metadata: Metadata = {
  title: "Case Studies — Thomas",
  description:
    "Selected work — deterministic AI systems for healthcare admissions, behavioral-health EMR, and multi-agent research synthesis.",
};

export default function WorkIndexPage() {
  return (
    <main className="px-6 md:px-12 max-w-[1100px] mx-auto pt-28 sm:pt-32 pb-20 min-h-[100svh]">
      <p
        className="font-mono text-sm tracking-widest uppercase mb-4"
        style={{ color: "var(--color-terracotta)" }}
      >
        Selected Work
      </p>
      <h1 className="font-serif text-3xl sm:text-5xl font-bold mb-4">Case Studies</h1>
      <p className="text-base sm:text-lg leading-relaxed max-w-[640px] text-charcoal/70 mb-12">
        A few systems I&rsquo;ve designed and built — where the interesting problem
        was making AI behave deterministically inside regulated, high-stakes
        environments.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {caseStudies.map((study) => (
          <WorkCard key={study.slug} study={study} />
        ))}
      </div>
    </main>
  );
}
