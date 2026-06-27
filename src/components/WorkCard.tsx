import Link from "next/link";
import type { CaseStudy } from "@/data/caseStudies";

/**
 * Compact project card for the /work index grid. Links into the case-study
 * detail page. Uses the study's first image as a thumbnail.
 */
export default function WorkCard({ study }: { study: CaseStudy }) {
  const thumb = study.images?.[0]?.src;

  return (
    <Link
      href={`/work/${study.slug}`}
      className="group block rounded-2xl overflow-hidden ring-1 ring-charcoal/5 bg-warm-white hover:ring-charcoal/15 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden" style={{ backgroundColor: "rgba(45, 42, 38, 0.05)" }}>
        {thumb && (
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover object-left-top group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-5 sm:p-6">
        {study.flagship && (
          <span
            className="inline-block font-mono text-[10px] uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(196, 114, 90, 0.1)", color: "var(--color-terracotta)" }}
          >
            Flagship
          </span>
        )}
        <h3 className="font-serif text-xl sm:text-2xl font-bold mb-1">{study.title}</h3>
        <p className="font-mono text-xs sm:text-sm" style={{ color: "var(--color-muted)" }}>
          {study.subtitle}
        </p>
      </div>
    </Link>
  );
}
