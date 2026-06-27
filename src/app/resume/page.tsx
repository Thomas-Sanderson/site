import type { Metadata } from "next";
import GanttTimeline from "@/components/GanttTimeline";
import ResumeSection from "@/components/ResumeSection";

export const metadata: Metadata = {
  title: "Resume — Thomas",
  description:
    "Career timeline and full résumé for Thomas — Design Technologist across consulting, art, behavioral health, and AI.",
};

export default function ResumePage() {
  return (
    <main className="pt-24 sm:pt-28 pb-20 min-h-[100svh]">
      {/* Intro + download */}
      <div className="px-6 md:px-12 max-w-[960px] mx-auto">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p
              className="font-mono text-sm tracking-widest uppercase mb-2"
              style={{ color: "var(--color-terracotta)" }}
            >
              Career Timeline
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold mb-2">
              The receipts.
            </h1>
            <p className="text-base leading-relaxed max-w-[520px] text-charcoal/70">
              Every role, mapped. The full text résumé is right below — searchable
              and copy-pasteable.
            </p>
          </div>
          <a
            href="/thomas-resume.pdf"
            download
            className="shrink-0 inline-flex items-center gap-2 font-mono text-xs tracking-wide px-4 py-2 rounded-full border hover:opacity-70 transition-opacity"
            style={{ borderColor: "rgba(45, 42, 38, 0.2)", color: "var(--color-charcoal)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download PDF
          </a>
        </div>
      </div>

      {/* Interactive employment timeline (augments, never replaces, the text below) */}
      <GanttTimeline />

      {/* Full, Cmd-F-able text résumé */}
      <ResumeSection />
    </main>
  );
}
