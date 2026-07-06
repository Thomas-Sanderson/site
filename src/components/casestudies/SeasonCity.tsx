/**
 * One city, four seasons — the level-design payoff. The building geometry is
 * shared data; each card re-costumes the exact same street with a seasonal
 * sprite palette (birch/linden/ornamental trees, ground, sky) so a familiar
 * map asks to be re-read under new light. Falling petals / leaves / snow are
 * CSS-only and freeze under prefers-reduced-motion.
 *
 * Pure / server component, light (cream) page. Mirrors CycleDiagram's card row.
 */

type Palette = {
  key: string;
  name: string;
  sky: string;
  ground: string;
  bldg: string;
  roof: string;
  win: string;
  tree: string;
  particle?: string;
};

const SEASONS: Palette[] = [
  { key: "spring", name: "Spring", sky: "linear-gradient(#cfe1f2,#ecd8e8)", ground: "#7cab55", bldg: "#c9b596", roof: "#9a5a48", win: "#3a4a63", tree: "#e79ecb", particle: "#f4c6e2" },
  { key: "summer", name: "Summer", sky: "linear-gradient(#8ec4ec,#bfe0f2)", ground: "#6ba046", bldg: "#c9b596", roof: "#8a4a3a", win: "#2f3f58", tree: "#3f8a3f" },
  { key: "autumn", name: "Autumn", sky: "linear-gradient(#b7c1cb,#d8cbb4)", ground: "#a8894f", bldg: "#c2ac8c", roof: "#7d4632", win: "#3a3346", tree: "#d1893f", particle: "#c9772f" },
  { key: "winter", name: "Winter", sky: "linear-gradient(#cdd6de,#e7edf2)", ground: "#eef2f5", bldg: "#b7ab9a", roof: "#6f5f52", win: "#3d4757", tree: "#dbe4ea", particle: "#ffffff" },
];

// Shared geometry (percent-left / px sizes) — identical across every season.
const BLDGS = [
  { left: "5%", w: 46, h: 84 },
  { left: "27%", w: 32, h: 58 },
  { left: "46%", w: 52, h: 96 },
  { left: "74%", w: 40, h: 70 },
];
const TREES = ["23%", "69%"];
const GROUND = 22;
const H = 150;

function Scene({ p, idx }: { p: Palette; idx: number }) {
  return (
    <div className="relative w-full overflow-hidden rounded-t-[9px]" style={{ height: H, background: p.sky }}>
      {/* falling particles */}
      {p.particle &&
        [0, 1, 2].map((n) => (
          <span
            key={n}
            className="seasonParticle"
            style={{
              position: "absolute",
              top: -6,
              left: `${18 + n * 30 + idx * 4}%`,
              width: 4,
              height: 4,
              borderRadius: p.key === "winter" ? "50%" : "1px",
              backgroundColor: p.particle,
              animationDelay: `${n * 1.1 + idx * 0.3}s`,
            }}
          />
        ))}

      {/* buildings — same footprint every season */}
      {BLDGS.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.left,
            bottom: GROUND,
            width: b.w,
            height: b.h,
            backgroundColor: p.bldg,
            borderTop: `4px solid ${p.roof}`,
            backgroundImage: `repeating-linear-gradient(${p.win} 0 4px, transparent 4px 12px), repeating-linear-gradient(90deg, ${p.win} 0 5px, transparent 5px 14px)`,
            backgroundPosition: "6px 12px",
            backgroundSize: "auto",
          }}
        />
      ))}

      {/* trees — same positions, seasonal canopy */}
      {TREES.map((left, i) => (
        <div key={i} style={{ position: "absolute", left, bottom: GROUND, width: 22, height: 40 }}>
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 5, height: 20, backgroundColor: "#5a4a3a" }} />
          <div
            className="seasonCanopy"
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              width: p.key === "winter" ? 16 : 22,
              height: p.key === "winter" ? 16 : 22,
              borderRadius: "50%",
              backgroundColor: p.tree,
              opacity: p.key === "winter" ? 0.85 : 1,
            }}
          />
        </div>
      ))}

      {/* ground */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: GROUND, backgroundColor: p.ground }} />
    </div>
  );
}

export default function SeasonCity() {
  return (
    <div className="mt-2">
      <style>{`
        @keyframes seasonFall {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(150px) translateX(10px); opacity: 0; }
        }
        @keyframes seasonSway {
          0%,100% { transform: translateX(-50%) rotate(-2deg); }
          50%     { transform: translateX(-50%) rotate(2deg); }
        }
        .seasonParticle { animation: seasonFall 4.5s linear infinite; }
        .seasonCanopy  { animation: seasonSway 5s ease-in-out infinite; transform-origin: bottom center; }
        @media (prefers-reduced-motion: reduce) {
          .seasonParticle { animation: none; opacity: 0.9; }
          .seasonCanopy  { animation: none; }
        }
      `}</style>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        role="img"
        aria-label="The same four-building street rendered in spring, summer, autumn, and winter. The geometry never changes; only the sky, ground, tree canopies, and weather do."
      >
        {SEASONS.map((p, i) => (
          <div
            key={p.key}
            className="rounded-[10px] overflow-hidden border"
            style={{ borderColor: "rgba(45,42,38,0.1)", backgroundColor: "var(--color-warm-white)" }}
          >
            <Scene p={p} idx={i} />
            <div className="px-3 py-2 border-t" style={{ borderColor: "rgba(45,42,38,0.08)" }}>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--color-charcoal)" }}>
                {p.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[12.5px] tracking-[0.03em] text-center mt-3.5 mb-0 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        Same streets, four palettes.{" "}
        <span style={{ color: "var(--color-terracotta)" }}>Geometry is data; the season is a costume</span>{" "}
        &mdash; so a map you&rsquo;ve already learned asks new questions under new light.
      </p>
    </div>
  );
}
