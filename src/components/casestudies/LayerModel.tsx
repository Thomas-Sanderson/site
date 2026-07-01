/**
 * The three-layer control model, drawn in-page (no image). User input passes
 * through a guardrail, then a deterministic core, then the model, before it
 * reaches the person — each layer trusted with a different amount. Horizontal
 * on desktop, stacks vertically on mobile. Pure/server component.
 */

const LAYERS = [
  {
    tag: "Guardrail",
    role: "Checked first",
    color: "#CF5B45",
    items: ["Crisis detection", "Jailbreak defense", "Hard-coded safety override"],
  },
  {
    tag: "Deterministic core",
    role: "Owns every decision",
    color: "#C99A4A",
    items: [
      "Navigation & flow authority",
      "The three intake paths",
      "Scoped data capture",
      "Vetted content — no hallucination",
    ],
  },
  {
    tag: "The model",
    role: "Voice & warmth only",
    color: "#3F9E77",
    items: ["Tone & phrasing", "Off-topic recovery", "Micro-capture at the right moment", "Multi-field parsing"],
  },
] as const;

function IO({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 flex items-center justify-center text-center font-mono text-[11px] leading-snug tracking-wide md:w-[84px] py-2 md:py-0" style={{ color: "rgba(255,255,255,0.5)" }}>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div className="shrink-0 flex items-center justify-center self-center text-lg md:rotate-0 rotate-90" style={{ color: "rgba(255,255,255,0.28)" }} aria-hidden>
      &#8594;
    </div>
  );
}

export default function LayerModel() {
  return (
    <div>
      <div
        className="flex flex-col md:flex-row md:items-stretch gap-0 md:gap-1"
        role="img"
        aria-label="Three-layer control model: user input passes through a guardrail layer, then a deterministic core, then the model, before reaching the person."
      >
        <IO>
          User
          <br />
          input
        </IO>
        <Arrow />
        {LAYERS.map((layer, i) => (
          <div key={layer.tag} className="contents">
            <div
              className="flex-1 min-w-0 rounded-[10px] px-4 pt-3.5 pb-3.5 my-1.5 md:my-0"
              style={{
                backgroundColor: "#211E1A",
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: `3px solid ${layer.color}`,
              }}
            >
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: layer.color }}>
                {layer.tag}
              </div>
              <div className="font-mono text-[12px] mt-0.5 mb-3" style={{ color: "rgba(255,255,255,0.42)" }}>
                {layer.role}
              </div>
              <ul className="list-none m-0 p-0">
                {layer.items.map((it, j) => (
                  <li
                    key={it}
                    className="text-[14px] leading-snug py-[7px]"
                    style={{
                      color: "rgba(255,255,255,0.82)",
                      borderTop: j === 0 ? "none" : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            {i < LAYERS.length - 1 && <Arrow />}
          </div>
        ))}
        <Arrow />
        <IO>
          What the
          <br />
          person sees
        </IO>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
        {[
          ["#CF5B45", "Guardrail", "safety first"],
          ["#C99A4A", "Deterministic", "flow authority"],
          ["#3F9E77", "Model", "voice, not brain"],
        ].map(([c, name, note]) => (
          <span key={name} className="inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
            <span style={{ color: "rgba(255,255,255,0.78)" }}>{name}</span>
            <span>— {note}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
