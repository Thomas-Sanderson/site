/**
 * The evidence ledger — the honest two-column "What we can say" (teal, +) /
 * "What we can't say yet" (clay, –) card grid for the Paper Cannon case study.
 * Renders INSIDE the dark "evidence" DarkSection, so it's styled for a dark
 * background: light text, translucent borders. Pure / server.
 */

const CAN = [
  "The pipeline runs end to end: intake, production cycles, gating, and distillation all work.",
  "The containment layer found real drift — it caught the red-team softening during a challenge phase, on the run it was built for.",
  "The surveyor independently flagged the source corpus as counter-evidence to the thesis. The system found problems it was designed to find.",
  "Every design decision traces to a specific failure encountered during that run. The origin is concrete.",
];

const CANT = [
  "That drift prevention is proven. It's structurally motivated and observed once — not validated across diverse corpora or teams.",
  "That the mechanism is established. We watched one session, designed defensively, and stop there.",
  "That good output is guaranteed. Bad context produces a rigorously reviewed bad paper.",
  "That it replaces judgment. The human in the loop is not optional.",
];

function Column({
  heading,
  color,
  mark,
  items,
}: {
  heading: string;
  color: string;
  mark: string;
  items: string[];
}) {
  return (
    <div
      className="rounded-xl px-[26px] py-6"
      style={{ backgroundColor: "#211E1A", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${color}` }}
    >
      <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.09em] mb-3.5" style={{ color }}>
        {heading}
      </h3>
      <ul className="list-none m-0 p-0">
        {items.map((it, i) => (
          <li
            key={i}
            className="relative text-[15.5px] leading-[1.45] py-[9px] pl-5"
            style={{ color: "rgba(255,255,255,0.82)", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="absolute left-0 font-bold" style={{ color }} aria-hidden>
              {mark}
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Ledger() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-9">
      <Column heading="What we can say" color="var(--color-teal)" mark="+" items={CAN} />
      <Column heading="What we can't say yet" color="#CF5B45" mark="–" items={CANT} />
    </div>
  );
}
