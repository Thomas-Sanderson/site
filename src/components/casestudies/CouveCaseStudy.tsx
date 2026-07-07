import Link from "next/link";
import Reveal from "./Reveal";
import ReadinessGate from "./ReadinessGate";
import EstimateWalk from "./EstimateWalk";
import {
  WRAP,
  MEASURE,
  Eyebrow,
  SectionH2,
  BackLink,
  DarkSection,
  SeamBand,
  ImpactCallout,
  FigureFrame,
} from "./primitives";

/**
 * Bespoke editorial layout for the Couve case study, rebuilt to the
 * case-study standard: hook (meta strip, demo CTA, hero shot) → problem as
 * autopsy → dark thesis with exactly two stats → see it run → decisions with
 * the live estimate walk → machinery spine → who did what / where it landed
 * (honest-claim box) → weld to Gab.
 */

const DEMO_URL = "https://helpful-liberation-production-3771.up.railway.app/";

const MORGUE = [
  { name: "The intake inbox", lesson: "Caught every lead — then lost them to whoever remembered to follow up.", kept: "kept: capture everything" },
  { name: "The payer portals", lesson: "Held the real benefits — behind three logins, with three different answers.", kept: "kept: verify, don't guess" },
  { name: "The cost calculator", lesson: "Did the math — in a language only the biller spoke.", kept: "kept: the math itself" },
  { name: "The census spreadsheet", lesson: "Tracked everyone — four editors, no audit trail, one sort from chaos.", kept: "kept: one view of everyone" },
];

const SPINE = [
  { tag: "Lead", color: "#3E6FA0", what: "Every call and form on one timeline, tracked across all four readiness tracks." },
  { tag: "VOB", color: "#C0902E", what: "A verified benefits record — who checked, when, what remains — finalized before anyone may trust it." },
  { tag: "Estimate", color: "var(--color-teal)", what: "The benefit walk priced on contracted rates, per level of care." },
  { tag: "Care + agreement", color: "var(--color-terracotta)", what: "An instance of care with a signed financial agreement and payment plan." },
  { tag: "Census", color: "#9A9186", what: "Live census, groups, attendance — with an audit trail of who changed what." },
];

const DECISIONS: { k: string; h: string; p: React.ReactNode; extra?: React.ReactNode }[] = [
  {
    k: "Cost before\ncommitment",
    h: "Nobody says yes to treatment blind.",
    p: "A real verification of benefits becomes a plain-language, session-by-session estimate priced on the contracted rate. A frightened person can plan around a number; nobody plans around an EOB.",
    extra: <EstimateWalk />,
  },
  {
    k: "Gates that\nrefuse",
    h: "Some steps shouldn't be polite suggestions.",
    p: "You cannot admit someone whose benefits are only “requested” — the system blocks it, in red, with the reason. Deliberate friction, placed exactly where skipping ahead becomes a surprise bill.",
  },
  {
    k: "Built for 4 p.m.\non a full census",
    h: "Plain language, no billing-code fluency required.",
    p: "Dispositions, human-readable timelines, contracted rates you can actually see. An EMR is measured by how fast one tired coordinator can find the truth.",
  },
  {
    k: "White-label\nfrom day one",
    h: "No org name is hardcoded anywhere.",
    p: "Branding, facilities, payers, rates — all configuration. Any provider could stand this up without touching the code, because that discipline started at the first commit.",
  },
];

export default function CouveCaseStudy() {
  return (
    <main className="pt-24 sm:pt-28 pb-4">
      <div className={WRAP}>
        <BackLink />
      </div>

      {/* HOOK */}
      <Reveal as="section" className="pt-8 pb-8">
        <div className={WRAP}>
          <Eyebrow>Case study — Behavioral-health EMR</Eyebrow>
          <h1 className="font-serif font-bold leading-[0.98] tracking-[-0.02em]" style={{ fontSize: "clamp(48px,8vw,80px)" }}>
            Couve
          </h1>
          <p className="font-serif mt-3 leading-[1.4] max-w-[36ch]" style={{ fontSize: "clamp(19px,2.4vw,23px)", color: "var(--color-charcoal)" }}>
            An admissions and revenue platform built so a person knows what treatment costs before they say yes.
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-1.5 mt-5 font-mono text-[12.5px]" style={{ color: "var(--color-muted)" }}>
            <span><b style={{ color: "var(--color-charcoal)" }}>Role</b> · product design &amp; build, solo</span>
            <span><b style={{ color: "var(--color-charcoal)" }}>Build</b> · Django + HTMX, server-rendered</span>
            <span><b style={{ color: "var(--color-charcoal)" }}>Timeline</b> · <span style={{ color: "var(--color-terracotta)", fontWeight: 600 }}>Feb–Jul 2026</span></span>
            <span><b style={{ color: "var(--color-charcoal)" }}>Status</b> · live demo, synthetic data</span>
          </div>
          <div className="mt-6">
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 font-mono text-[13.5px] font-semibold tracking-[0.03em] rounded-lg px-5 py-3 transition-opacity hover:opacity-85"
              style={{ backgroundColor: "var(--color-teal)", color: "var(--color-cream)" }}
            >
              Open the live demo →
            </a>
            <p className="font-mono text-[12px] mt-2.5" style={{ color: "var(--color-muted)" }}>
              One click to sign in · no credentials · all data synthetic
            </p>
          </div>

          <FigureFrame
            src="/images/couve/dashboard.png"
            alt="Couve dashboard — active census of 318, admissions pipeline by disposition with per-track status, and an estimated patient-responsibility pipeline of $896,256."
            caption={
              <>
                <span style={{ color: "var(--color-charcoal)" }}>The whole operation, one screen.</span> A live census of 318, every admission&rsquo;s intake / financial / medical status rolled up by disposition, and an estimated patient-responsibility pipeline of{" "}
                <span style={{ color: "var(--color-charcoal)" }}>$896,256.12</span> — computed, not typed in.
              </>
            }
          />
        </div>
      </Reveal>

      {/* THE PROBLEM — autopsy */}
      <Reveal as="section" className="py-12">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The problem</Eyebrow>
            <SectionH2>Four tools each knew half the truth about one patient.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              Someone says the hardest yes of their life; three weeks later a $12,000 bill nobody warned them about lands. The coordinator never stood a chance — the answer lived in four tools, each of which shipped half of it:
            </p>
          </div>
          <div className="mt-6 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(45,42,38,0.1)", backgroundColor: "var(--color-warm-white)" }}>
            {MORGUE.map((m, i) => (
              <div
                key={m.name}
                className="grid grid-cols-1 md:grid-cols-[190px_1fr_170px] gap-x-5 gap-y-0.5 items-baseline px-6 py-3"
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(45,42,38,0.08)" }}
              >
                <div className="font-serif font-semibold text-[16.5px]">{m.name}</div>
                <div className="text-[14.5px] leading-normal" style={{ color: "var(--color-charcoal)" }}>{m.lesson}</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.06em] md:text-right" style={{ color: "var(--color-terracotta)" }}>{m.kept}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* THE THESIS — dark, with the two stats */}
      <DarkSection>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow tone="amber">The thesis</Eyebrow>
              <p className="font-serif font-semibold leading-[1.06] tracking-[-0.02em] mb-0" style={{ fontSize: "clamp(30px,5vw,52px)", color: "#ECE7DD" }}>
                Readiness is one <em style={{ color: "#fff" }}>answer</em>, not five <em style={{ color: "#fff" }}>systems</em>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="rounded-xl px-6 py-5" style={{ backgroundColor: "#211E1A", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="font-serif font-bold text-[38px] leading-none" style={{ color: "#ECE7DD" }}>20,000+</div>
                <div className="font-mono text-[12px] mt-2 leading-[1.55]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  real insurance plans in the pricing engine — CMS public-use data, so every estimate prices against an actual plan
                </div>
              </div>
              <div className="rounded-xl px-6 py-5" style={{ backgroundColor: "#211E1A", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="font-serif font-bold text-[38px] leading-none" style={{ color: "#ECE7DD" }}>5 → 1</div>
                <div className="font-mono text-[12px] mt-2 leading-[1.55]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  tools and payer portals consolidated into one patient record — the readiness answer has one address
                </div>
              </div>
            </div>

            <div className={`${MEASURE} mt-8`}>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                Every admission clears four tracks — demographics, financial, medical, disposition — rolled into one honest state on one patient record. The system&rsquo;s job isn&rsquo;t to store records; it&rsquo;s to say whether this person is ready, and to refuse to pretend when they aren&rsquo;t.
              </p>
            </div>
            <div className="mt-10">
              <ReadinessGate />
            </div>
          </div>
        </Reveal>
      </DarkSection>

      {/* SEE IT RUN */}
      <Reveal as="section" className="py-12">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>See it run</Eyebrow>
            <SectionH2>You&rsquo;re one click from the coordinator&rsquo;s chair.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              No credentials, no sandbox tour —{" "}
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="border-b" style={{ color: "var(--color-terracotta)", borderColor: "rgba(45,42,38,0.2)" }}>
                the demo
              </a>{" "}
              signs you straight in. Work the pipeline, open a lead, run an estimate, try to admit someone who isn&rsquo;t cleared. The data is synthetic and resets itself; the behavior is real.
            </p>
          </div>
          <figure className="m-0 mt-8">
            <div className="rounded-xl overflow-hidden border p-2.5" style={{ borderColor: "rgba(45,42,38,0.08)", backgroundColor: "var(--color-warm-white)" }}>
              <video src="/images/couve/demo.mp4" autoPlay muted loop playsInline className="block w-full rounded-md" />
            </div>
            <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
              A walkthrough of the platform — census, pipeline, and a patient&rsquo;s readiness resolving in place.
            </figcaption>
          </figure>
          <FigureFrame
            src="/images/couve/pipeline.png"
            alt="Couve pipeline board — active admissions as cards, each with demographics, financial, and medical status dots, grouped by disposition."
            caption={
              <>
                The pipeline board — every active admission as a card carrying its track status.{" "}
                <span style={{ color: "var(--color-charcoal)" }}>An entire operation, scannable in seconds instead of a morning of reconciliation.</span>
              </>
            }
          />
        </div>
      </Reveal>

      {/* THE DECISIONS — with the live estimate walk in the first call */}
      <Reveal as="section" className="py-12">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-2`}>
            <Eyebrow>The decisions</Eyebrow>
            <SectionH2>Make the money knowable. Make the gates honest.</SectionH2>
          </div>
          <div className="border-t mt-6" style={{ borderColor: "rgba(45,42,38,0.1)" }}>
            {DECISIONS.map((d) => (
              <div
                key={d.h}
                className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-10 gap-y-2 py-8 border-b"
                style={{ borderColor: "rgba(45,42,38,0.1)" }}
              >
                <div className="font-mono text-[12px] font-medium uppercase tracking-[0.13em] leading-[1.5] md:pt-1.5 whitespace-pre-line" style={{ color: "var(--color-terracotta)" }}>
                  {d.k}
                </div>
                <div>
                  <div className="max-w-[60ch]">
                    <h3 className="font-serif text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] mb-2">{d.h}</h3>
                    <p className="text-[16px] leading-relaxed m-0">{d.p}</p>
                  </div>
                  {d.extra}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* THE MACHINERY — the data spine */}
      <Reveal as="section" className="py-12">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The machinery</Eyebrow>
            <SectionH2>One record, from first call to final payment.</SectionH2>
          </div>
          <div className="flex flex-col md:flex-row md:items-stretch gap-1.5 mt-8" role="img" aria-label="Data spine: lead intake flows to verified benefits, to priced estimate, to instance of care with signed agreement, to live census.">
            {SPINE.map((s, i) => (
              <div key={s.tag} className="contents">
                <div
                  className="flex-1 min-w-0 rounded-[10px] px-4 pt-3 pb-3"
                  style={{ backgroundColor: "var(--color-warm-white)", border: "1px solid rgba(45,42,38,0.1)", borderTop: `3px solid ${s.color}` }}
                >
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: s.color }}>
                    {s.tag}
                  </div>
                  <div className="text-[13.5px] leading-snug mt-1.5" style={{ color: "var(--color-charcoal)" }}>{s.what}</div>
                </div>
                {i < SPINE.length - 1 && (
                  <div className="shrink-0 flex items-center justify-center self-center text-base rotate-90 md:rotate-0 py-0.5 md:py-0" style={{ color: "var(--color-muted)" }} aria-hidden>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="font-mono text-[12.5px] mt-4 leading-[1.5] max-w-[78ch]" style={{ color: "var(--color-muted)" }}>
            The spine every screen hangs off. Because it&rsquo;s one record, the dashboard&rsquo;s revenue pipeline, the readiness gate, and the patient&rsquo;s estimate can never disagree —{" "}
            <span style={{ color: "var(--color-charcoal)" }}>they&rsquo;re reading the same row.</span>
          </p>
        </div>
      </Reveal>

      {/* WHO DID WHAT + WHERE IT LANDED */}
      <Reveal as="section" className="py-12">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Who did what, plainly</Eyebrow>
            <SectionH2>Solo build. Borrowed scars.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              I designed and built all of it — schema, workflow, and interface. The judgment inside it isn&rsquo;t mine alone: it comes from two years working inside a national behavioral-health provider, watching coordinators reconcile these systems by hand. Their workarounds are this product&rsquo;s requirements.
            </p>
            <p className="text-[17px] leading-relaxed">
              What a production deployment would add is the load-bearing work a prototype gets to skip: a BAA-backed hosting posture, real payer integrations, and the compliance hardening that protects patients and staff — tracked in the repo as explicit debt, not hand-waved.
            </p>

            <div className="mt-10">
              <Eyebrow>Where it landed</Eyebrow>
              <SectionH2 className="!mb-4">Kickoff to a live, seeded demo: five months, solo.</SectionH2>
              <ImpactCallout note={
                <>
                  <b style={{ color: "var(--color-charcoal)" }}>What I&rsquo;m not claiming:</b> production use, real patients, or measured outcomes — the data is synthetic and no PHI exists anywhere in the system. The claims here are the kind architecture can guarantee, and the demo will show you.
                </>
              }>
                February: first commit. July: a deployed platform with a one-click demo, a 20,000-plan pricing engine, and a seeded operation exercising every readiness state — every claim on this page checkable by clicking around it.
              </ImpactCallout>
            </div>
          </div>
        </div>
      </Reveal>

      {/* NEXT — weld to Gab */}
      <SeamBand>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow>Next</Eyebrow>
              <SectionH2>Gab is the front door. Couve is the building.</SectionH2>
              <p className="text-[17px] leading-relaxed">
                Every lead here begins as a conversation.{" "}
                <Link href="/work/gab" className="border-b" style={{ color: "var(--color-terracotta)", borderColor: "rgba(45,42,38,0.2)" }}>
                  Gab
                </Link>
                , the intake assistant, hands off a lead that arrives demographics-complete — and the moment Couve verifies benefits, the out-of-pocket number can travel back into that conversation. One spine, from a scared 2&nbsp;a.m. message to an admission with no surprises.
              </p>
            </div>
          </div>
        </Reveal>
      </SeamBand>
    </main>
  );
}
