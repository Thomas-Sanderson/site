import Link from "next/link";

/**
 * Shared building blocks for the v3 (bespoke, editorial) case studies. Pure /
 * server components — no hooks, so they stay out of the client bundle. Scroll
 * reveal lives in the separate client component `Reveal`.
 *
 * Layout tokens: WRAP is the outer column, MEASURE caps prose to a readable
 * line length. Palette comes from the site's CSS custom properties
 * (--color-cream/charcoal/terracotta/teal/muted/warm-white). The dark sections
 * use a warm near-black (#1A1714) with card panels at #211E1A.
 */

export const WRAP = "mx-auto max-w-[1000px] px-6 md:px-10";
export const MEASURE = "max-w-[680px]";

const AMBER = "#D7A24A";

export function Eyebrow({ children, tone = "clay" }: { children: React.ReactNode; tone?: "clay" | "amber" }) {
  return (
    <p
      className="font-mono text-[12px] font-medium uppercase tracking-[0.15em] mb-4"
      style={{ color: tone === "amber" ? AMBER : "var(--color-terracotta)" }}
    >
      {children}
    </p>
  );
}

/** Section headline. `light` for use inside dark sections. */
export function SectionH2({ children, className = "", light = false }: { children: React.ReactNode; className?: string; light?: boolean }) {
  return (
    <h2
      className={`font-serif font-semibold leading-[1.12] tracking-[-0.015em] mb-5 ${className}`}
      style={{ fontSize: "clamp(27px,3.6vw,38px)", color: light ? "#ECE7DD" : undefined }}
    >
      {children}
    </h2>
  );
}

export function BackLink() {
  return (
    <Link
      href="/work"
      className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide hover:opacity-70 transition-opacity"
      style={{ color: "var(--color-muted)" }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      All case studies
    </Link>
  );
}

/**
 * Full-bleed warm-dark band (breaks out of WRAP to 100vw). Relies on the global
 * `body { overflow-x: clip }` so it never causes horizontal scroll.
 */
export function DarkSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`py-20 my-4 ${className}`} style={{ backgroundColor: "#1A1714", width: "100vw", marginLeft: "calc(50% - 50vw)" }}>
      {children}
    </section>
  );
}

/** Full-bleed subtle cream band with top/bottom rules — used for the seam / next-move. */
export function SeamBand({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`py-16 ${className}`}
      style={{
        backgroundColor: "var(--color-cream)",
        filter: "brightness(0.985)",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        borderTop: "1px solid rgba(45,42,38,0.1)",
        borderBottom: "1px solid rgba(45,42,38,0.1)",
      }}
    >
      {children}
    </section>
  );
}

/** The "decisions that mattered" key/body list. */
export function DecisionList({ items }: { items: { k: string; h: string; p: React.ReactNode }[] }) {
  return (
    <div className="border-t mt-6" style={{ borderColor: "rgba(45,42,38,0.1)" }}>
      {items.map((d) => (
        <div
          key={d.h}
          className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-10 gap-y-2 py-9 border-b"
          style={{ borderColor: "rgba(45,42,38,0.1)" }}
        >
          <div className="font-mono text-[12px] font-medium uppercase tracking-[0.13em] leading-[1.5] md:pt-1.5 whitespace-pre-line" style={{ color: "var(--color-terracotta)" }}>
            {d.k}
          </div>
          <div className="max-w-[60ch]">
            <h3 className="font-serif text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] mb-2">{d.h}</h3>
            <p className="text-[16px] leading-relaxed">{d.p}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Teal-accented impact callout with an optional muted mono note line. */
export function ImpactCallout({ children, note }: { children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] px-7 py-6"
      style={{ backgroundColor: "rgba(42,107,90,0.06)", border: "1px solid rgba(45,42,38,0.1)", borderLeft: "3px solid var(--color-teal)" }}
    >
      <p className="text-[16px] leading-relaxed m-0">{children}</p>
      {note && (
        <p className="font-mono text-[12.5px] leading-[1.55] mt-4 mb-0" style={{ color: "var(--color-muted)" }}>
          <span style={{ color: "var(--color-teal)" }}>▸</span> {note}
        </p>
      )}
    </div>
  );
}

/** Framed screenshot with a mono caption. `pixelated` for pixel-art assets. */
export function FigureFrame({ src, alt, caption, pixelated = false }: { src: string; alt: string; caption?: React.ReactNode; pixelated?: boolean }) {
  return (
    <figure className="m-0 mt-9">
      <div className="rounded-xl overflow-hidden border p-2.5" style={{ borderColor: "rgba(45,42,38,0.08)", backgroundColor: "var(--color-warm-white)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block w-full rounded-md" style={pixelated ? { imageRendering: "pixelated" } : undefined} />
      </div>
      {caption && (
        <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ----------------------------------------------------------------------- */
/* StageDiagram — the horizontal input → stages → output diagram shared by   */
/* every "principle" section (Gab's layers, Paper Cannon's rooms, CHAD's     */
/* loop). Dark styling; stacks vertically on mobile. Pure/server.            */
/* ----------------------------------------------------------------------- */

export interface Stage {
  tag: string;
  role: string;
  color: string;
  items: React.ReactNode[];
}

function DiagArrow() {
  return (
    <div className="shrink-0 flex items-center justify-center self-center text-lg rotate-90 md:rotate-0 py-1 md:py-0" style={{ color: "rgba(255,255,255,0.28)" }} aria-hidden>
      &#8594;
    </div>
  );
}

function DiagIO({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 flex items-center justify-center text-center font-mono text-[11px] leading-snug tracking-wide md:w-[84px] py-2 md:py-0" style={{ color: "rgba(255,255,255,0.5)" }}>
      {children}
    </div>
  );
}

export function StageDiagram({
  inputLabel,
  outputLabel,
  stages,
  band,
  legend,
  ariaLabel,
}: {
  inputLabel: React.ReactNode;
  outputLabel: React.ReactNode;
  stages: Stage[];
  band?: { label: string; text: React.ReactNode };
  legend?: { color: string; name: string; note: string }[];
  ariaLabel: string;
}) {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-stretch gap-0 md:gap-1" role="img" aria-label={ariaLabel}>
        <DiagIO>{inputLabel}</DiagIO>
        <DiagArrow />
        {stages.map((s, i) => (
          <div key={s.tag} className="contents">
            <div
              className="flex-1 min-w-0 rounded-[10px] px-4 pt-3.5 pb-3.5 my-1.5 md:my-0"
              style={{ backgroundColor: "#211E1A", border: "1px solid rgba(255,255,255,0.08)", borderTop: `3px solid ${s.color}` }}
            >
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: s.color }}>
                {s.tag}
              </div>
              <div className="font-mono text-[12px] mt-0.5 mb-3" style={{ color: "rgba(255,255,255,0.42)" }}>
                {s.role}
              </div>
              <ul className="list-none m-0 p-0">
                {s.items.map((it, j) => (
                  <li key={j} className="text-[14px] leading-snug py-[7px]" style={{ color: "rgba(255,255,255,0.82)", borderTop: j === 0 ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            {i < stages.length - 1 && <DiagArrow />}
          </div>
        ))}
        <DiagArrow />
        <DiagIO>{outputLabel}</DiagIO>
      </div>

      {band && (
        <div className="mt-3.5 rounded-[10px] px-4 py-3 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-baseline" style={{ border: "1px dashed rgba(255,255,255,0.18)" }}>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] whitespace-nowrap" style={{ color: "#CF5B45" }}>
            {band.label}
          </span>
          <span className="font-mono text-[12.5px] leading-[1.5]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {band.text}
          </span>
        </div>
      )}

      {legend && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          {legend.map((l) => (
            <span key={l.name} className="inline-flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span style={{ color: "rgba(255,255,255,0.78)" }}>{l.name}</span>
              <span>— {l.note}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
