/**
 * Admission Readiness — the key visual for the Couve case study, drawn in-page
 * as a scalable component instead of a screenshot. It reproduces the product's
 * one-glance readiness card: four tracks as labeled status rings, followed by
 * the gate itself — a red BLOCKED banner and an amber WARNING banner that
 * explain, in plain language, why admission is held until benefits clear.
 *
 * Green (teal) means go; every unfinished track is impossible to miss. Real
 * text and vectors — crisp at any size; the rings wrap to a grid on mobile.
 * Pure / server component.
 */

const TRACKS = [
  { letter: "D", name: "Demographics", status: "10 / 10 fields", color: "var(--color-teal)", bg: "rgba(42,107,90,0.09)" },
  { letter: "F", name: "Financial", status: "VOB Requested", color: "#C0902E", bg: "rgba(192,144,46,0.12)" },
  { letter: "M", name: "Medical", status: "Not Started", color: "#9A9186", bg: "rgba(154,145,134,0.14)" },
  { letter: "D", name: "Disposition", status: "Active", color: "#3E6FA0", bg: "rgba(62,111,160,0.10)" },
] as const;

function Banner({
  kind,
  label,
  children,
}: {
  kind: "block" | "warn";
  label: string;
  children: React.ReactNode;
}) {
  const palette =
    kind === "block"
      ? { bg: "#FBECEA", border: "#E7B9B0", text: "#A23B2A" }
      : { bg: "#FAF2D9", border: "#E6D08C", text: "#856A1C" };
  return (
    <div
      className="font-mono text-[13px] leading-[1.45] rounded-[7px] px-3.5 py-2.5 mt-2.5"
      style={{ backgroundColor: palette.bg, border: `1px solid ${palette.border}`, color: palette.text }}
    >
      <b className="font-semibold tracking-[0.04em]">{label}</b> · {children}
    </div>
  );
}

export default function ReadinessGate() {
  return (
    <div>
      <div
        className="rounded-xl p-6 sm:p-7"
        style={{ backgroundColor: "var(--color-warm-white)", border: "1px solid rgba(45,42,38,0.1)", boxShadow: "0 1px 0 rgba(42,35,27,0.03)" }}
      >
        <p className="font-serif text-[18px] font-semibold m-0 mb-5" style={{ color: "var(--color-charcoal)" }}>
          Admission Readiness
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-2 mb-5" role="img" aria-label="Four admission tracks: Demographics complete, Financial at VOB requested, Medical not started, Disposition active.">
          {TRACKS.map((t) => (
            <div key={t.name} className="text-center px-1">
              <div
                className="w-[54px] h-[54px] rounded-full mx-auto mb-2.5 flex items-center justify-center font-mono font-semibold text-[19px]"
                style={{ border: `3px solid ${t.color}`, color: t.color, backgroundColor: t.bg }}
              >
                {t.letter}
              </div>
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-charcoal)" }}>
                {t.name}
              </div>
              <div className="font-mono text-[12px] mt-0.5" style={{ color: "var(--color-muted)" }}>
                {t.status}
              </div>
            </div>
          ))}
        </div>

        <Banner kind="block" label="BLOCKED">
          VOB before admission: currently VOB Requested
        </Banner>
        <Banner kind="warn" label="WARNING">
          Financial clearance before admission: currently VOB Requested
        </Banner>
      </div>

      <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        One patient&rsquo;s readiness, at a glance. Financial isn&rsquo;t cleared &mdash; so the system{" "}
        <span style={{ color: "var(--color-charcoal)" }}>blocks admission and says exactly why.</span> You can&rsquo;t skip the step that protects them.
      </figcaption>
    </div>
  );
}
