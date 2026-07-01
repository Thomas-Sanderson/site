/**
 * The loop, drawn — the four-phase production cycle for the Paper Cannon case
 * study. Horizontal phase cards with colored top borders and step arrows
 * between them (stacks vertically on mobile, arrows rotate). Below: a centered
 * mono "loop" note and a dashed "Reindeer · watching" watch band. Pure / server
 * — sits on the light (cream) page, mirrors StageDiagram's rhythm.
 */

interface Phase {
  n: string;
  title: string;
  color: string;
  body: React.ReactNode;
}

const PHASES: Phase[] = [
  {
    n: "Phase 1",
    title: "Water Cooler",
    color: "#5C7C9E",
    body: "All fourteen agents react to the thesis before a draft exists. Scouts, critics, reviewers, builders — in sequence, each hearing the last.",
  },
  {
    n: "Phase 2",
    title: "Write",
    color: "var(--color-terracotta)",
    body: "The writer produces a draft from mediated context and last cycle's revision list, prioritizing must-change items.",
  },
  {
    n: "Phase 3",
    title: "Review",
    color: "#3F9E77",
    body: "Six reviewers run cold in managed groups — quotes, sequence, citations, scope — with the editor reading last.",
  },
  {
    n: "Phase 4",
    title: "Challenge",
    color: "#CF5B45",
    body: "Devil's advocate and red-team attack in parallel, then the cycle auto-distills into a ranked revision list.",
  },
];

function StepArrow() {
  return (
    <div
      className="shrink-0 flex items-center justify-center self-center text-[19px] rotate-90 md:rotate-0 py-1.5 md:py-0 md:px-1"
      style={{ color: "#C6BBA9" }}
      aria-hidden
    >
      &#8594;
    </div>
  );
}

export default function CycleDiagram() {
  return (
    <div className="mt-2">
      <div
        className="flex flex-col md:flex-row md:items-stretch gap-0 md:gap-1"
        role="img"
        aria-label="Four-phase cycle: Water Cooler, Write, Review, Challenge, repeating."
      >
        {PHASES.map((p, i) => (
          <div key={p.title} className="contents">
            <div
              className="flex-1 min-w-0 rounded-[10px] px-4 pt-[15px] pb-4 my-1.5 md:my-0 border"
              style={{
                backgroundColor: "var(--color-warm-white)",
                borderColor: "rgba(45,42,38,0.1)",
                borderTop: `3px solid ${p.color}`,
              }}
            >
              <div className="font-mono text-[11px] tracking-[0.08em]" style={{ color: "var(--color-muted)" }}>
                {p.n}
              </div>
              <h4 className="font-serif font-semibold text-[18px] tracking-[-0.01em] mt-0.5 mb-1.5">{p.title}</h4>
              <p className="text-[13.5px] leading-[1.4] m-0" style={{ color: "var(--color-charcoal)" }}>
                {p.body}
              </p>
            </div>
            {i < PHASES.length - 1 && <StepArrow />}
          </div>
        ))}
      </div>

      <p className="font-mono text-[12.5px] tracking-[0.03em] text-center mt-3.5 mb-0" style={{ color: "var(--color-muted)" }}>
        Phases 2&ndash;4 repeat each cycle.{" "}
        <span style={{ color: "var(--color-terracotta)" }}>The paper ships when the red-team stops recommending reject</span>{" "}
        &mdash; not before.
      </p>

      <div
        className="mt-3.5 rounded-[10px] px-4 py-3 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-baseline"
        style={{ border: "1px dashed #D8B7AB", backgroundColor: "rgba(188,99,73,0.05)" }}
      >
        <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.04em] whitespace-nowrap" style={{ color: "var(--color-terracotta)" }}>
          Reindeer &middot; watching
        </span>
        <span className="font-mono text-[12.5px] leading-[1.5]" style={{ color: "var(--color-muted)" }}>
          Runs as a background monitor across the whole loop. If an agent starts to drift, it flags the exact passage, the operator confirms a coaching note, and the agent re-runs. Drift that survives coaching pauses the pipeline for a human.
        </span>
      </div>
    </div>
  );
}
