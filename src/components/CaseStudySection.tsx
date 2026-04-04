import { caseStudies } from "@/data/caseStudies";
import CaseStudyCard from "./CaseStudyCard";

export default function CaseStudySection() {
  return (
    <section id="case-studies" className="px-6 md:px-12 py-24 max-w-[960px] mx-auto">
      <p
        className="font-mono text-sm tracking-widest uppercase mb-4"
        style={{ color: "var(--color-terracotta)" }}
      >
        Selected Work
      </p>
      <h2 className="font-serif text-4xl md:text-5xl font-bold mb-16">
        Case Studies
      </h2>

      <div className="flex flex-col gap-16">
        {caseStudies.map((study) => (
          <CaseStudyCard key={study.slug} study={study} />
        ))}
      </div>
    </section>
  );
}
