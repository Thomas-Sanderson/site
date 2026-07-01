/**
 * The Care Navigator flow, drawn in-page as a scalable diagram instead of a
 * flat screenshot. The source flowchart has 40+ nodes and is illegible when
 * shrunk to page width; this distills the real structure a recruiter should
 * read in five seconds:
 *
 *   three ways in  →  the shallowest capture that fits  →  every branch resolves
 *
 * with the crisis hard-stop drawn as an always-on rail (it can fire from any
 * step) and the "start admission" return path noted below. Green marks the only
 * cells where any data is collected. Real text, real vectors — crisp at any
 * size, reflows to a single column on mobile. Pure/server component.
 */

const TEAL = "var(--color-teal)";
const CLAY = "var(--color-terracotta)";

const LANES = [
  {
    say: "“Just looking.”",
    capture: "Answers the question. One soft, optional invite to talk.",
    collects: false,
    resolve: "Leaves informed — no form, no pressure.",
  },
  {
    say: "“I need to talk to someone.”",
    capture: "A name and a number.",
    collects: true,
    resolve: "A real person calls back.",
  },
  {
    say: "“Will you take my insurance?”",
    capture: "Insurance card details.",
    collects: true,
    resolve: "A coverage answer, right in the chat.",
  },
] as const;

const COLS = "md:grid-cols-[1fr_26px_1.1fr_26px_1fr]";

function Chevron() {
  return (
    <div className="flex items-center justify-center self-center rotate-90 md:rotate-0 py-1 md:py-0 text-base" style={{ color: "var(--color-muted)" }} aria-hidden>
      &#8594;
    </div>
  );
}

function Kicker({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: color ?? "var(--color-muted)" }}>
      {children}
    </p>
  );
}

export default function CareFlow() {
  return (
    <div>
      {/* Always-on crisis rail — can interrupt from any step. */}
      <div
        className="rounded-xl px-5 py-4 mb-5 flex items-start gap-3"
        style={{ backgroundColor: "rgba(196, 114, 90, 0.08)", border: `1px solid rgba(196,114,90,0.28)`, borderLeft: `3px solid ${CLAY}` }}
      >
        <span className="text-lg leading-none mt-0.5" aria-hidden style={{ color: CLAY }}>
          &#9888;
        </span>
        <p className="text-[14px] leading-relaxed m-0" style={{ color: "var(--color-charcoal)" }}>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] mr-2" style={{ color: CLAY }}>
            From any step
          </span>
          A message signaling suicidal intent or overdose <strong>hard-stops the flow</strong> and puts a crisis line and a human&rsquo;s phone number on screen. The model never gets a vote.
        </p>
      </div>

      {/* Stage headers (desktop only) */}
      <div className={`hidden md:grid ${COLS} gap-x-2 mb-2`}>
        <Kicker color={CLAY}>They arrive saying&hellip;</Kicker>
        <div />
        <Kicker color={TEAL}>It asks the least that fits</Kicker>
        <div />
        <Kicker>&hellip;and every path resolves</Kicker>
      </div>

      {/* Lanes */}
      <div className="flex flex-col gap-3">
        {LANES.map((lane) => (
          <div
            key={lane.say}
            className={`grid grid-cols-1 ${COLS} gap-x-2 gap-y-1 items-stretch rounded-xl p-2.5`}
            style={{ backgroundColor: "var(--color-warm-white)", border: "1px solid rgba(45,42,38,0.07)" }}
          >
            {/* Intent */}
            <div className="rounded-lg px-4 py-3 flex items-center" style={{ backgroundColor: "rgba(45,42,38,0.03)" }}>
              <p className="text-[15px] font-medium leading-snug m-0" style={{ color: "var(--color-charcoal)" }}>
                {lane.say}
              </p>
            </div>
            <Chevron />
            {/* Capture */}
            <div
              className="rounded-lg px-4 py-3"
              style={
                lane.collects
                  ? { backgroundColor: "rgba(42,107,90,0.08)", borderLeft: `3px solid ${TEAL}` }
                  : { backgroundColor: "transparent", border: "1px dashed rgba(45,42,38,0.18)" }
              }
            >
              <Kicker color={lane.collects ? TEAL : "var(--color-muted)"}>{lane.collects ? "Collects" : "Collects nothing"}</Kicker>
              <p className="text-[14px] leading-snug m-0" style={{ color: "var(--color-charcoal)" }}>
                {lane.capture}
              </p>
            </div>
            <Chevron />
            {/* Resolve */}
            <div className="rounded-lg px-4 py-3 flex items-center">
              <p className="text-[14px] leading-snug m-0" style={{ color: "var(--color-charcoal)" }}>
                {lane.resolve}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Notes: gated pre-screen + universal return path */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5 font-mono text-[12px]" style={{ color: "var(--color-muted)" }}>
        <p className="m-0 flex-1">
          <span style={{ color: TEAL }}>&#9679;</span> A full pre-screen only unlocks once someone says they&rsquo;re ready &mdash; never before.
        </p>
        <p className="m-0 flex-1">
          <span style={{ color: CLAY }}>&#8617;</span> Typing &ldquo;start admission&rdquo; anywhere pulls a person back to the front of the line.
        </p>
      </div>
    </div>
  );
}
