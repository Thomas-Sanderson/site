/**
 * The cast — the fourteen-agent roster for the Paper Cannon case study. Six
 * group cards in a responsive grid (3 → 2 → 1), each with a colored top border,
 * a mono group heading, and its agents (name + one-line role + a model-tier
 * pill). Pure / server — no hooks, so it stays out of the client bundle. Sits on
 * the light (cream) page, not inside a dark section.
 */

type Tier = "Opus" | "Sonnet" | "Haiku";

interface Agent {
  name: string;
  role: string;
  tier: Tier;
}

interface Group {
  name: string;
  color: string;
  agents: Agent[];
}

const GROUPS: Group[] = [
  {
    name: "Production",
    color: "var(--color-terracotta)",
    agents: [
      { name: "Writer", role: "Drafts from context; the only agent that writes", tier: "Opus" },
      { name: "Formatter", role: "Mechanical compile, no content changes", tier: "Haiku" },
    ],
  },
  {
    name: "Review",
    color: "#3F9E77",
    agents: [
      { name: "Editor", role: "Prose, clarity, correction compliance", tier: "Sonnet" },
      { name: "Fact-Checker", role: "Character-level quote verification", tier: "Sonnet" },
      { name: "Sequence-Checker", role: "Attribution order & chronology", tier: "Sonnet" },
      { name: "Auditor", role: "Full-corpus audit, scope compliance", tier: "Opus" },
    ],
  },
  {
    name: "Adversarial",
    color: "#CF5B45",
    agents: [
      { name: "Devil's Advocate", role: "Strongest counter to every claim", tier: "Opus" },
      { name: "Red-Team", role: "Hostile review; defaults to reject", tier: "Opus" },
    ],
  },
  {
    name: "Research",
    color: "#5C7C9E",
    agents: [
      { name: "Librarian", role: "Corpus index & evidence retrieval", tier: "Opus" },
      { name: "Lit Reviewer", role: "Positions the work; finds gaps", tier: "Sonnet" },
      { name: "Bibliographer", role: "Citation completeness", tier: "Sonnet" },
      { name: "Surveyor", role: "Maps the evidence landscape", tier: "Opus" },
    ],
  },
  {
    name: "Operations",
    color: "#C99A4A",
    agents: [
      { name: "Dashboard (JJJ)", role: "Editor-in-chief: gates, pressure, distillation", tier: "Sonnet" },
    ],
  },
  {
    name: "Containment",
    color: "#8A6A96",
    agents: [
      { name: "Reindeer", role: "Drift monitor across every agent", tier: "Sonnet" },
    ],
  },
];

const TIER_STYLE: Record<Tier, React.CSSProperties> = {
  Opus: { backgroundColor: "#F6E8E2", color: "#9C4A32", borderColor: "#EAD3C8" },
  Sonnet: { backgroundColor: "#E7F0EA", color: "#2E7D57", borderColor: "#CFE2D6" },
  Haiku: { backgroundColor: "#EEF0F3", color: "#4E6E8E", borderColor: "#DBE1E8" },
};

function TierPill({ tier }: { tier: Tier }) {
  return (
    <span
      className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.05em] rounded-full px-[7px] py-[2px] border"
      style={TIER_STYLE[tier]}
    >
      {tier}
    </span>
  );
}

export default function CastRoster() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
      {GROUPS.map((g) => (
        <div
          key={g.name}
          className="rounded-xl px-[18px] pt-4 pb-[18px] border"
          style={{
            backgroundColor: "var(--color-warm-white)",
            borderColor: "rgba(45,42,38,0.1)",
            borderTop: `3px solid ${g.color}`,
          }}
        >
          <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.11em] mb-3" style={{ color: g.color }}>
            {g.name}
          </div>
          <div>
            {g.agents.map((a, i) => (
              <div
                key={a.name}
                className="flex items-baseline justify-between gap-2.5 py-2"
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(45,42,38,0.1)" }}
              >
                <span className="min-w-0">
                  <span className="text-[15px] leading-[1.3]" style={{ color: "var(--color-charcoal)" }}>
                    {a.name}
                  </span>
                  <span className="block text-[12.5px] mt-px leading-[1.4]" style={{ color: "var(--color-muted)" }}>
                    {a.role}
                  </span>
                </span>
                <TierPill tier={a.tier} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
