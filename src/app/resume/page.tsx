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
      {/* Intro */}
      <div className="px-6 md:px-12 max-w-[960px] mx-auto">
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
      </div>

      {/* Interactive employment timeline (augments, never replaces, the text below) */}
      <GanttTimeline />

      {/* Full, Cmd-F-able text résumé */}
      <ResumeSection />
    </main>
  );
}
