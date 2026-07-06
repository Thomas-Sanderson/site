/**
 * The Cyrillic trie, drawn — the signature CHAD mechanic. One WASD-driven
 * component runs both directions across the same node spine: DECODE reads a
 * sign (letter → sound), ENCODE spells a destination (sound → letter). A
 * read-head sweeps each lane so the motion reads as "walking the word."
 *
 * Pure / server component. Animation is CSS-only (inline keyframes) and honors
 * prefers-reduced-motion. Sits on the light (cream) page, mirroring the rhythm
 * of CycleDiagram / StageDiagram.
 */

const CYAN = "#4FB6CE"; // locations / reading a place
const AMBER = "#C99A4A"; // items / building a word

// РЫНОК — "market," a place you decode off a street sign then spell to travel.
const WORD = [
  { g: "Р", s: "r" },
  { g: "Ы", s: "y" },
  { g: "Н", s: "n" },
  { g: "О", s: "o" },
  { g: "К", s: "k" },
];

function Node({
  top,
  bottom,
  accent,
  i,
  dim,
}: {
  top: string;
  bottom: string;
  accent: string;
  i: number;
  dim?: boolean;
}) {
  return (
    <div
      className="trieNode flex-1 min-w-0 rounded-[9px] border flex flex-col items-center justify-center py-2.5"
      style={{
        backgroundColor: "var(--color-warm-white)",
        borderColor: "rgba(45,42,38,0.12)",
        borderTop: `3px solid ${accent}`,
        animationDelay: `${i * 0.22}s`,
      }}
    >
      <span
        className="font-mono font-bold leading-none"
        style={{ fontSize: 22, color: dim ? "var(--color-muted)" : "var(--color-charcoal)" }}
      >
        {top}
      </span>
      <span className="font-mono leading-none mt-1.5" style={{ fontSize: 11, color: "var(--color-muted)" }}>
        {bottom}
      </span>
    </div>
  );
}

function Lane({
  tag,
  role,
  accent,
  direction,
}: {
  tag: string;
  role: string;
  accent: string;
  direction: "decode" | "encode";
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-x-8 gap-y-2 items-center">
      <div>
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
          {tag}
        </div>
        <div className="font-mono text-[12px] mt-0.5" style={{ color: "var(--color-muted)" }}>
          {role}
        </div>
      </div>
      <div className="flex items-stretch gap-2">
        {WORD.map((n, i) => (
          <Node
            key={i}
            i={i}
            accent={accent}
            top={direction === "decode" ? n.g : n.s}
            bottom={direction === "decode" ? n.s : n.g}
            dim={direction === "encode"}
          />
        ))}
      </div>
    </div>
  );
}

export default function TrieDiagram() {
  return (
    <div className="mt-2">
      <style>{`
        @keyframes trieSweep {
          0%, 8%   { box-shadow: none; transform: translateY(0); }
          16%, 30% { box-shadow: 0 0 0 3px rgba(45,42,38,0.12); transform: translateY(-2px); }
          46%,100% { box-shadow: none; transform: translateY(0); }
        }
        .trieNode { animation: trieSweep 5.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .trieNode { animation: none; }
        }
      `}</style>

      <div
        className="rounded-[12px] border p-5 sm:p-6 flex flex-col gap-5"
        style={{ backgroundColor: "rgba(45,42,38,0.02)", borderColor: "rgba(45,42,38,0.1)" }}
        role="img"
        aria-label="One WASD-driven trie, two directions. Decode reads РЫНОК off a street sign, resolving each Cyrillic letter to its sound. Encode spells РЫНОК to travel, turning each sound back into a letter. A read-head sweeps both lanes across the same five-node spine."
      >
        <Lane tag="Decode" role="Read the sign · letter → sound" accent={CYAN} direction="decode" />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(45,42,38,0.1)" }} />
          <span className="font-mono text-[11px] tracking-[0.06em] whitespace-nowrap" style={{ color: "var(--color-muted)" }}>
            one trie ·{" "}
            <b className="font-semibold" style={{ color: "var(--color-charcoal)" }}>
              W A S D
            </b>{" "}
            · both directions
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(45,42,38,0.1)" }} />
        </div>

        <Lane tag="Encode" role="Spell to travel · sound → letter" accent={AMBER} direction="encode" />
      </div>

      <p className="font-mono text-[12.5px] tracking-[0.03em] mt-3.5 mb-0 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        Decoded prefixes stick.{" "}
        <span style={{ color: "var(--color-terracotta)" }}>Read <b className="font-semibold">РЫ-</b> once and every РЫ- word starts half-solved</span>{" "}
        &mdash; the same trie that read the sign already knows the branch.
      </p>
    </div>
  );
}
