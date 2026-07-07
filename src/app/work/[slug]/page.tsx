import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { caseStudies } from "@/data/caseStudies";
import CaseStudyCard from "@/components/CaseStudyCard";
import GabCaseStudy from "@/components/casestudies/GabCaseStudy";
import CouveCaseStudy from "@/components/casestudies/CouveCaseStudy";
import PaperCannonCaseStudy from "@/components/casestudies/PaperCannonCaseStudy";
import ChadCaseStudy from "@/components/casestudies/ChadCaseStudy";
import AwqatCaseStudy from "@/components/casestudies/AwqatCaseStudy";

/**
 * Bespoke, richer layouts live in src/components/casestudies and own their full
 * page (chrome, width, sections). Slugs not listed here fall back to the
 * generic CaseStudyCard template.
 */
const BESPOKE: Record<string, () => React.ReactNode> = {
  gab: () => <GabCaseStudy />,
  couve: () => <CouveCaseStudy />,
  "paper-cannon": () => <PaperCannonCaseStudy />,
  chad: () => <ChadCaseStudy />,
  awqat: () => <AwqatCaseStudy />,
};

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) return { title: "Case Study — Thomas" };
  return {
    title: `${study.title} — ${study.subtitle}`,
    description: study.context,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) notFound();

  const bespoke = BESPOKE[slug];
  if (bespoke) return bespoke();

  return (
    <main className="px-6 md:px-12 max-w-[960px] mx-auto pt-24 sm:pt-28 pb-20 min-h-[100svh]">
      <Link
        href="/work"
        className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide mb-8 hover:opacity-70 transition-opacity"
        style={{ color: "var(--color-muted)" }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All case studies
      </Link>

      <CaseStudyCard study={study} fullPage />
    </main>
  );
}
