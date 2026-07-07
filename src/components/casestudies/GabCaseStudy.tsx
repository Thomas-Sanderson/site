import Link from "next/link";
import Reveal from "./Reveal";
import CareFlow from "./CareFlow";
import {
  WRAP,
  MEASURE,
  Eyebrow,
  SectionH2,
  BackLink,
  DarkSection,
  SeamBand,
  DecisionList,
  ImpactCallout,
  FigureFrame,
  StageDiagram,
  type Stage,
} from "./primitives";

/**
 * Bespoke editorial layout for the Gab case study (v6). The reference other
 * studies follow: narrative structure (hook → the problem shipped twice → the
 * brief behind the brief → principle → seeing it run → decisions → the system
 * drawn → handoff → who did what → impact → next move).
 *
 * Diagrams-over-screenshots is the site thesis, so the live StageDiagram and
 * CareFlow carry the architecture; the two research artifacts (the field-research
 * map and the full node map) come in as framed figures. The hero "diorama" —
 * chat on the warm side, inspector on the machine side — is a real React
 * component, not an embed. All pure/server; scroll reveal lives in `Reveal`.
 */

const LAYERS: Stage[] = [
  { tag: "Guardrail", role: "Checked first", color: "#CF5B45", items: ["Crisis detection", "Jailbreak defense", "Hard-coded safety override"] },
  {
    tag: "Deterministic core",
    role: "Owns every decision",
    color: "#C99A4A",
    items: ["Navigation & flow authority", "The three intake paths", "Scoped data capture", "Vetted content — no hallucination"],
  },
  { tag: "The model", role: "Voice & warmth only", color: "#3F9E77", items: ["Tone & phrasing", "Off-topic recovery", "Micro-capture at the right moment", "Multi-field parsing"] },
];

const LEGEND = [
  { color: "#CF5B45", name: "Guardrail", note: "safety first" },
  { color: "#C99A4A", name: "Deterministic", note: "flow authority" },
  { color: "#3F9E77", name: "Model", note: "voice, not brain" },
];

const DECISIONS = [
  {
    k: "Structure,\nchosen twice",
    h: "The answer to bad nodes wasn’t no nodes.",
    p: "A node tree again — designed properly this time. Every path authored, every stated fact vetted content: nobody gets told something untrue or pushed anywhere. The first version’s mistake was never the structure; it was the authoring. Now it has rooms.",
  },
  {
    k: "Where the AI\nearns its place",
    h: "It warms the words. It never picks the path.",
    p: "The model rewrites stiff prompts into something human, recovers off-script moments, and catches a detail the second a person leans in — “my insurance is through my job.” It cannot pick the path, state a clinical fact, or judge danger. Warmth is a feature. Authority is not.",
  },
  {
    k: "Crisis is not\na conversation",
    h: "When someone’s in danger, the product stops being a product.",
    p: "Suicidal intent or overdose hard-stops the flow — every time, no exceptions — and puts a crisis line and a human’s number on screen. The model never gets a vote, because “usually right” is not a safety standard when a life is on the line.",
  },
  {
    k: "Ask for less",
    h: "Every extra question is a reason to leave.",
    p: "Three depths of intake, always the shallowest that fits — a callback needs a name and a number; a full pre-screen waits until someone says they’re ready. Sessions live server-side; the browser never holds the record.",
  },
  {
    k: "Designed to\nbe attacked",
    h: "The warmth is also the vulnerability.",
    p: "A public widget will be jailbroken. A filter runs first, but the real defense is structural — the model is pinned to one point in the flow with one acceptable kind of output. You can’t talk a system out of a decision it was never allowed to make.",
  },
];

/* ── Hero meta row — four fast facts under the deck ──────────────────────── */

const HERO_META: React.ReactNode[] = [
  "Sole designer",
  <>Working build in <b style={{ fontWeight: 600, color: "var(--color-charcoal)" }}>about a month</b>, with Claude Code</>,
  "Handed off for production",
  "HIPAA-bound behavioral health",
];

function HeroMeta() {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-5 font-mono text-[12px]" style={{ color: "var(--color-muted)" }}>
      {HERO_META.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-x-2.5">
          {i > 0 && <span aria-hidden style={{ color: "rgba(45,42,38,0.25)" }}>·</span>}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

/* ── Hero diorama — warmth on the left, the machine on the right ─────────── */

function Bubble({ who, children }: { who: "a" | "u"; children: React.ReactNode }) {
  const isUser = who === "u";
  return (
    <div
      className="text-[13.5px] leading-[1.45] rounded-2xl px-3.5 py-2.5 max-w-[86%]"
      style={
        isUser
          ? { alignSelf: "flex-end", backgroundColor: "rgba(196,114,90,0.14)", color: "var(--color-charcoal)", borderBottomRightRadius: 5 }
          : { alignSelf: "flex-start", backgroundColor: "rgba(45,42,38,0.05)", color: "var(--color-charcoal)", borderBottomLeftRadius: 5 }
      }
    >
      {children}
    </div>
  );
}

function InspRow({ label, value, hot = false }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-[7px] border-b font-mono" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <span className="text-[11px] uppercase tracking-[0.1em] shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span className="text-[12.5px] text-right" style={hot ? { color: "#7FD1B4", fontWeight: 500 } : { color: "rgba(255,255,255,0.82)" }}>
        {value}
      </span>
    </div>
  );
}

function HeroDiorama() {
  return (
    <figure className="m-0 mt-10">
      <div
        role="img"
        aria-label="Staged split view of the reference build: the Rowan chat on the left; on the right, the inspector capturing the payer field the moment it is typed."
        className="grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden border"
        style={{ borderColor: "rgba(45,42,38,0.1)" }}
      >
        {/* The warmth */}
        <div className="p-5 sm:p-6" style={{ backgroundColor: "var(--color-warm-white)" }}>
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b" style={{ borderColor: "rgba(45,42,38,0.08)" }}>
            <span aria-hidden className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px]" style={{ backgroundColor: "rgba(42,107,90,0.12)", color: "var(--color-teal)" }}>
              ✳
            </span>
            <span className="font-mono text-[13px] font-medium" style={{ color: "var(--color-charcoal)" }}>Care Navigator</span>
            <span className="font-mono text-[11px] ml-auto" style={{ color: "var(--color-muted)" }}>2:07 AM</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <Bubble who="a">Hi, I’m Rowan. Whatever brought you here tonight — we can take it one step at a time. Want to look around, or start with something specific?</Bubble>
            <Bubble who="u">my insurance is through my job, aetna i think</Bubble>
            <Bubble who="a">Got it — I’ve noted Aetna. When you’re ready I can check what your plan covers, or we can just keep talking. No forms tonight.</Bubble>
          </div>
        </div>
        {/* The machine */}
        <div className="p-5 sm:p-6" style={{ backgroundColor: "#1A1714" }}>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] pb-4 mb-3.5 border-b" style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}>
            Inspector — what the machine heard
          </div>
          <div className="flex flex-col">
            <InspRow label="path" value="Verify insurance" />
            <InspRow label="payer" value="Aetna ✓" hot />
            <InspRow label="member id" value="—" />
            <InspRow label="date of birth" value="—" />
            <InspRow label="deferred" value="cost of treatment → human" />
            <InspRow label="model" value="voice only · 2 calls" />
          </div>
          <p className="font-mono text-[11px] leading-[1.5] mt-4 pt-4 border-t m-0" style={{ color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.1)" }}>
            Every field green-lit by the flow, not the model. The browser never holds the record.
          </p>
        </div>
      </div>
      <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        <b style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>The moment that sells the thesis, staged in the reference build.</b> Left, the warmth — the navigator goes by Rowan. Right, the machine underneath, catching “Aetna” as structured data the instant it’s typed. The model handled nothing but the tone.
      </figcaption>
    </figure>
  );
}

/* ── The problem, already shipped twice — three-card autopsy ─────────────── */

const AUTOPSY = [
  {
    tag: "First front door — the vendor widget",
    verdict: "Safe, and cold.",
    color: "#8B8178",
    body: "Multiple-choice buttons in a node tree — a maze with one exit: a form. It collected insurance details against the promise of a call. The call always came; the conversation never happened.",
  },
  {
    tag: "Second front door — the open chatbot",
    verdict: "Warm, and reckless.",
    color: "#CF5B45",
    body: "The nodes were thrown out and a model set loose. No direction, no close, no sense of when a moment had earned a human — and protected health information sitting in the browser.",
  },
  {
    tag: "Third front door — Gab",
    verdict: "Neither. And both.",
    color: "var(--color-teal)",
    body: "A node tree again, authored properly — every path safe, nothing invented. A model on top for the words only: it warms the language, never picks the route. Warm like the second door, safe like the first, minus the trade-off both settled for.",
    resolved: true,
  },
];

function Autopsy() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
      {AUTOPSY.map((c) => (
        <div
          key={c.tag}
          className="rounded-xl p-5 flex flex-col"
          style={{
            backgroundColor: c.resolved ? "rgba(42,107,90,0.05)" : "var(--color-warm-white)",
            border: "1px solid rgba(45,42,38,0.1)",
            borderTop: `3px solid ${c.color}`,
          }}
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] leading-[1.4] mb-3" style={{ color: c.color }}>
            {c.tag}
          </div>
          <div className="font-serif text-[20px] font-semibold leading-tight tracking-[-0.01em] mb-2.5" style={{ color: "var(--color-charcoal)" }}>
            {c.verdict}
          </div>
          <p className="text-[14.5px] leading-relaxed m-0">{c.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Stats row — the thesis on an invoice (dark section) ─────────────────── */

const STATS: { n: React.ReactNode; l: string }[] = [
  { n: <>0</>, l: "facts the model is allowed to state on its own" },
  { n: <><span style={{ fontSize: "0.58em", verticalAlign: "0.18em", opacity: 0.75 }}>$</span>0.006</>, l: "per question that does reach the model" },
];

function StatsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {STATS.map((s, i) => (
        <div key={i} className="rounded-[10px] px-5 py-5" style={{ backgroundColor: "#211E1A", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="font-serif font-semibold leading-none tracking-[-0.02em]" style={{ fontSize: "clamp(34px,5vw,44px)", color: "#ECE7DD" }}>
            {s.n}
          </div>
          <div className="font-mono text-[12px] leading-[1.5] mt-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GabCaseStudy() {
  return (
    <main className="pt-24 sm:pt-28 pb-4">
      <div className={WRAP}>
        <BackLink />
      </div>

      {/* HERO */}
      <Reveal as="section" className="pt-10 pb-10">
        <div className={WRAP}>
          <Eyebrow>Case study — Conversational AI in healthcare</Eyebrow>
          <h1 className="font-serif font-bold leading-[0.98] tracking-[-0.02em]" style={{ fontSize: "clamp(52px,9vw,88px)" }}>
            Gab
          </h1>
          <p className="font-mono text-[15px] mt-3" style={{ color: "var(--color-muted)" }}>
            An AI care navigator for addiction treatment — designed so it can feel human without ever being dangerous.
          </p>
          <HeroMeta />
          <HeroDiorama />
          <div className={`${MEASURE} mt-10 pt-8 border-t`} style={{ borderColor: "rgba(45,42,38,0.1)" }}>
            <p className="leading-[1.5]" style={{ fontSize: "clamp(20px,2.4vw,24px)", color: "var(--color-charcoal)" }}>
              It’s 2&nbsp;a.m. and someone opens a rehab’s website. Maybe it’s them. Maybe it’s a mother holding her son’s phone, terrified. They’re ashamed, exhausted, one cold reply away from closing the tab.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              The assistant that greets them has to feel like a person who cares — and cannot invent a fact, mishandle a confession, or get talked out of its guardrails. Warm enough to trust, safe enough for healthcare: that gap is the whole design problem.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE PROBLEM, ALREADY SHIPPED TWICE */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The problem, already shipped twice</Eyebrow>
            <SectionH2>Warm and safe usually pull in opposite directions.</SectionH2>
            <p className="text-[17px] leading-relaxed">This site had already proven it — twice in six months.</p>
          </div>
          <Autopsy />
        </div>
      </Reveal>

      {/* THE BRIEF BEHIND THE BRIEF */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The brief behind the brief</Eyebrow>
            <SectionH2>The quiet hope was automation.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              Under the official brief sat a quieter one: automate admissions, need fewer reps. Gab is — respectfully — a counter-argument. In behavioral health a good rep is often the difference between enrolling and disappearing; the honest problem was that no tool served them. So the work splits along what each side is good at: the machine is patient and unshockable at 2&nbsp;a.m.; the human keeps the trust, the judgment, the decision.
            </p>
          </div>
          <FigureFrame
            src="/images/gab/research-map.webp"
            alt="Hand-annotated research map tracing a competitor's admissions onboarding message by message, from first contact through the prior-authorization wait."
            caption={
              <>
                <b style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>Field research: a competitor’s onboarding, mapped firsthand, message by message.</b> The category’s best experience runs on fast human follow-through — no AI in it. Its one dropped ball: a “2–14 day” prior-authorization silence. Hold that thought.
              </>
            }
          />
        </div>
      </Reveal>

      {/* THE PRINCIPLE — dark */}
      <DarkSection>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow tone="amber">The principle</Eyebrow>
              <p className="font-serif font-semibold leading-[1.06] tracking-[-0.02em] mb-5" style={{ fontSize: "clamp(30px,5vw,52px)", color: "#ECE7DD" }}>
                The model is the <em style={{ color: "#fff" }}>voice</em>, not the <em style={{ color: "#fff" }}>brain</em>.
              </p>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                Every choice that carries risk — where the conversation goes, which facts get stated, how much someone’s asked to share, whether a moment is a crisis — belongs to a deterministic system. The model is handed exactly one job: make it sound human. Three layers, checked in order, each trusted with a different amount.
              </p>
            </div>
            <div className="mt-12">
              <StageDiagram
                inputLabel={<>User<br />input</>}
                outputLabel={<>What the<br />person sees</>}
                stages={LAYERS}
                legend={LEGEND}
                ariaLabel="Three-layer control model: user input passes through a guardrail layer, then a deterministic core, then the model, before reaching the person."
              />
            </div>
            <div className={`${MEASURE} mt-14`}>
              <StatsRow />
              <p className="text-[16px] leading-relaxed mt-6 mb-0" style={{ color: "#CFCBD6" }}>
                The thesis on an invoice: nothing to invent, and at that leash length, sounding human costs fractions of a cent — on a bill that can’t surprise you.
              </p>
            </div>
          </div>
        </Reveal>
      </DarkSection>

      {/* SEEING IT RUN */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-8`}>
            <Eyebrow>Seeing it run</Eyebrow>
            <SectionH2>The warmth on one side, the machine on the other.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              The hero moment, in motion — three ways in, a stress test, and the one message that stops the product cold.
            </p>
          </div>
          <figure className="m-0">
            <div className="rounded-xl overflow-hidden border p-2.5" style={{ borderColor: "rgba(45,42,38,0.08)", backgroundColor: "var(--color-warm-white)" }}>
              <video src="/images/gab/demo.mp4" controls preload="metadata" muted playsInline className="block w-full rounded-md" style={{ backgroundColor: "#1A1714" }} />
            </div>
            <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
              Live walkthrough — the conversation and the inspector, side by side.
            </figcaption>
          </figure>
        </div>
      </Reveal>

      {/* THE DECISIONS */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-2`}>
            <Eyebrow>The decisions that mattered</Eyebrow>
            <SectionH2>A case study is really a record of what you chose.</SectionH2>
            <p className="text-[17px]" style={{ color: "var(--color-muted)" }}>
              Five calls did the most work.
            </p>
          </div>
          <DecisionList items={DECISIONS} />
        </div>
      </Reveal>

      {/* THE SYSTEM, DRAWN */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-10`}>
            <Eyebrow>The system, drawn</Eyebrow>
            <SectionH2>Every path resolves. Nobody hits a dead end.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              Decline, crisis, “just browsing,” a question the system can’t answer — all of it routes somewhere humane, and the phrase “start admission” pulls a person back to the front of the line from anywhere in the flow.
            </p>
          </div>
          <CareFlow />
          <div className={MEASURE}>
            <p className="text-[15px] leading-relaxed mt-14 mb-0" style={{ color: "var(--color-muted)" }}>
              That’s the shape a visitor feels. Underneath, it’s a few dozen scripted nodes — the real map, as designed:
            </p>
          </div>
          <FigureFrame
            src="/images/gab/node-map.png"
            alt="The complete Care Navigator node map: dozens of scripted conversation nodes, the assistant's turns and the few data-collection points marked, every model call pinned to a node."
            caption={
              <>
                <b style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>The full node map as designed.</b> Blue is the assistant speaking; green, the only places data is collected; every model call pinned to a scripted node. Unglamorous on purpose — this is “the voice, not the brain” on paper.
              </>
            }
          />
        </div>
      </Reveal>

      {/* THE HANDOFF */}
      <SeamBand>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow>The handoff</Eyebrow>
              <SectionH2>The first phone call stops being cold.</SectionH2>
              <p className="text-[17px] leading-relaxed">
                Every earlier tool ended with a name, a number, and a rep dialing into the unknown. Gab treats the conversation as the payload: the lead arrives with the path taken, the questions asked, and the ones deferred on purpose because they deserved a human. The machine’s last job is to make the human’s first minute count — and the question it refuses to guess at, <em>what is this going to cost me?</em>, is the one the next project exists to answer.
              </p>
            </div>
          </div>
        </Reveal>
      </SeamBand>

      {/* WHO DID WHAT */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Who did what, plainly</Eyebrow>
            <SectionH2>One designer, one coding agent, one working build.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              I didn’t write a line of code. I wrote everything else — every node, every vetted answer, the three depths of intake, the crisis rule, the words. Claude Code typed; I decided. The build on this page is my own reference engine, white-labeled.
            </p>
            <p className="text-[17px] leading-relaxed mb-4">
              What that produced was a complete, working skeleton — the full anatomy of the product, every bone in the right place, and it ran. Scoped on purpose to settle how the thing behaves, not to survive production traffic: every open question about the design, answered in something you could actually use.
            </p>
            <p className="text-[17px] leading-relaxed">
              The handoff was that running build, the node map, and a filmed walkthrough — with one precondition: a BAA, because you don’t hand a design that captures insurance details to infrastructure that can’t legally hold them. From there the client’s engineers fleshed the skeleton into a production system — the compliance and scale a prototype gets to skip. The design was theirs to build, never to reinvent.
            </p>
          </div>
        </div>
      </Reveal>

      {/* IMPACT */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Where it landed</Eyebrow>
            <SectionH2 className="!mb-6">The design was finished before production began.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              Built for a national behavioral-health provider: a care navigator that owns first contact — greeting, exploration, triage, coverage capture — no form, and nobody needed on the other end at 2&nbsp;a.m.
            </p>
            <p className="text-[17px] leading-relaxed mb-6">
              The whole system existed as a working build in about a month — one designer, Claude Code for hands. Not a mockup: every path, every vetted answer, the crisis stop, the data boundaries, all of it running. A complete skeleton, handed to the client’s engineers to be fleshed out for production.
            </p>
            <ImpactCallout
              note={
                <>
                  <strong style={{ color: "var(--color-charcoal)" }}>The honest claim.</strong> No conversion number lives here — the production system and its analytics are the client’s.
                </>
              }
            >
              The claim isn’t speed, it’s resolution: two earlier front doors had shipped and fallen short, so the question was never whether this could be built, but what to build. A design you can run instead of read settles that — and it was settled before production started.
            </ImpactCallout>
          </div>
        </div>
      </Reveal>

      {/* NEXT / SEAM */}
      <SeamBand>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow>The next move</Eyebrow>
              <SectionH2>Gab is the front door. Couve is the building.</SectionH2>
              <p className="text-[17px] leading-relaxed">
                The intake conversation already collects everything a benefits check needs — payer, member ID, date of birth. Wiring Gab to{" "}
                <Link href="/work/couve" className="border-b" style={{ color: "var(--color-terracotta)", borderColor: "rgba(45,42,38,0.2)" }}>
                  Couve
                </Link>
                , the behavioral-health EMR, puts a real out-of-pocket number in the chat the moment coverage verifies — closing the exact gap the research map ends on: authorization silence after a person has said yes. Two projects, one system: the intake-to-admission spine.
              </p>
            </div>
          </div>
        </Reveal>
      </SeamBand>
    </main>
  );
}
