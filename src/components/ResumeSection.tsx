"use client";

import { useEffect, useRef, useState } from "react";
import { timelineEntries, type TimelineEntry } from "@/data/timeline";
import { skillGroups, education } from "@/data/resume";

/**
 * One job = a disclosure: a header <button> (role · company · location · dates)
 * controlling its bullet list. The bullets render fully EXPANDED in SSR with no
 * `hidden` attribute (crawler / no-JS / Cmd-F baseline). Only after hydration,
 * and only where the browser supports `beforematch` (Chromium), do we collapse
 * each list with hidden="until-found" — which keeps the text findable by native
 * find-in-page and auto-expands the group when a collapsed word is searched.
 * Browsers without `beforematch` (e.g. Safari) stay fully expanded, so no
 * browser ends up worse than the static baseline.
 */
function CollapsibleJob({ entry, index }: { entry: TimelineEntry; index: number }) {
  const ref = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(true); // SSR / baseline: expanded
  const [enhanced, setEnhanced] = useState(false);
  const bullets = entry.highlights ?? [];
  const regionId = `resume-job-${index}`;
  const headerId = `resume-job-h-${index}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || bullets.length === 0) return;
    // Capability gate: only collapse where find-in-page can re-expand it.
    const supported =
      typeof document !== "undefined" && !!document.body && "onbeforematch" in document.body;
    if (!supported) return; // leave expanded — Cmd-F finds everything

    setEnhanced(true);
    el.setAttribute("hidden", "until-found"); // imperative, never a JSX prop
    setOpen(false);

    const onBeforeMatch = () => {
      el.removeAttribute("hidden");
      setOpen(true);
    };
    el.addEventListener("beforematch", onBeforeMatch);
    return () => el.removeEventListener("beforematch", onBeforeMatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el || !enhanced) return;
    if (open) {
      el.setAttribute("hidden", "until-found");
      setOpen(false);
    } else {
      el.removeAttribute("hidden");
      setOpen(true);
    }
  };

  const hasBullets = bullets.length > 0;

  return (
    <div className="border-t" style={{ borderColor: "rgba(45, 42, 38, 0.08)" }}>
      <button
        id={headerId}
        type="button"
        aria-expanded={open}
        aria-controls={hasBullets ? regionId : undefined}
        onClick={toggle}
        className="w-full flex items-start justify-between gap-4 text-left py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
        style={{ cursor: enhanced && hasBullets ? "pointer" : "default", outlineColor: "var(--color-terracotta)" }}
      >
        <span className="text-sm leading-snug">
          <span className="font-bold">{entry.role}</span>
          <span style={{ color: "var(--color-muted)" }}> — {entry.company}</span>
          <span className="block text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
            {entry.start} – {entry.end}
            {entry.location ? ` · ${entry.location}` : ""}
          </span>
        </span>
        {enhanced && hasBullets && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0 mt-1"
            style={{
              color: "var(--color-muted)",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {hasBullets && (
        <ul
          id={regionId}
          ref={ref}
          aria-labelledby={headerId}
          className="resume-bullets list-disc pl-5 pb-4 flex flex-col gap-1.5 text-sm leading-relaxed text-charcoal/80"
        >
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResumeSection() {
  const workEntries = timelineEntries
    .filter((e) => e.type !== "Education")
    .sort((a, b) => b.startMonth - a.startMonth);

  return (
    <section
      id="resume"
      className="px-6 md:px-12 py-16 sm:py-24 max-w-[960px] mx-auto"
      style={{ fontFamily: "var(--font-mono, monospace)" }}
    >
      <p
        className="text-xs tracking-widest uppercase mb-4"
        style={{ color: "var(--color-muted)" }}
      >
        Resume
      </p>
      <h2
        className="text-3xl md:text-4xl font-bold mb-16"
        style={{ fontFamily: "var(--font-mono, monospace)" }}
      >
        Just the data.
      </h2>

      {/* Work History — collapsible, but always Cmd-F findable */}
      <div className="mb-16">
        <h3
          className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "var(--color-terracotta)" }}
        >
          Work History
        </h3>
        <div className="flex flex-col">
          {workEntries.map((entry, i) => (
            <CollapsibleJob key={i} entry={entry} index={i} />
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-16">
        <h3
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--color-terracotta)" }}
        >
          Skills &amp; Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {skillGroups.map((group) => (
            <div key={group.category}>
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--color-muted)" }}
              >
                {group.category}
              </p>
              <p className="text-sm leading-relaxed">
                {group.skills.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h3
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--color-terracotta)" }}
        >
          Education
        </h3>
        {education.map((edu) => (
          <div key={edu.institution} className="text-sm">
            <p className="font-bold">{edu.institution}</p>
            <p style={{ color: "var(--color-muted)" }}>
              {edu.degree} · {edu.year} · {edu.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
