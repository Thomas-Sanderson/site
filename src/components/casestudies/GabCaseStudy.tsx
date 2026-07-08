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
 * drawn → the node map was the real work → next move).
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
  <>Working build in <b style={{ fontWeight: 600, color: "var(--color-charcoal)" }}>about a week</b>, with Claude Code</>,
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

/* ── Hero diorama — the real Fern Crest Care Navigator, and the machine ──── */

const FC = { green: "#4C7A45", greenDk: "#274435", tan: "#D2B48C", paper: "#FAF6EE", ink: "#2B2119", inkMut: "#6E5C46", brownTint: "#EFE3D3", amber: "#C99A4A" };
// Fern Crest's actual leaf mark (from the app's brand content store).
const FERN_LEAF = "M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.09-6.24 7.36-7.93-2.77 2.34-4.71 5.61-5.39 9.32 2.6 1.23 5.8.78 7.95-1.37C19.43 14.47 20 4 20 4S9.53 4.57 6.05 8.05z";

function BotMsg({ tag, zone = "voice", children }: { tag: string; zone?: "voice" | "structured"; children: React.ReactNode }) {
  return (
    <div
      className="self-start max-w-[88%] rounded-[12px] px-3.5 py-2.5"
      style={{ backgroundColor: "#FFFFFF", color: FC.ink, borderLeft: `3px solid ${zone === "voice" ? FC.green : FC.amber}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-[11px]" style={{ color: FC.green }}>Rowan</span>
        <span className="font-mono text-[9.5px] tracking-wide" style={{ color: "rgba(43,33,25,0.32)" }}>{tag}</span>
      </div>
      <p className="text-[13px] leading-[1.45] m-0">{children}</p>
    </div>
  );
}

function UserMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="self-end max-w-[80%] px-3.5 py-2.5 text-[13px] leading-[1.45]" style={{ backgroundColor: FC.tan, color: FC.ink, borderRadius: "12px 12px 4px 12px" }}>
      {children}
    </div>
  );
}

function InspRow({ label, value, hot = false }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-[7px] border-b font-mono" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <span className="text-[11px] uppercase tracking-[0.1em] shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span className="text-[12.5px] text-right" style={hot ? { color: "#86C08A", fontWeight: 500 } : { color: "rgba(255,255,255,0.82)" }}>
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
        aria-label="Split view of the Fern Crest Care Navigator: Rowan's chat on the left, on its real nature-first palette; on the right, the inspector catching Aetna as structured data the instant it is typed from a fuzzy reply."
        className="grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden border"
        style={{ borderColor: "rgba(45,42,38,0.1)" }}
      >
        {/* The warmth — the real Fern Crest Care Navigator */}
        <div style={{ backgroundColor: FC.paper }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ backgroundColor: "#FFFFFF", borderBottom: `1px solid ${FC.brownTint}` }}>
            <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{ backgroundColor: "rgba(76,122,69,0.12)" }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill={FC.green} aria-hidden><path d={FERN_LEAF} /></svg>
            </span>
            <span className="flex flex-col">
              <span className="font-semibold text-[13px] leading-none" style={{ color: FC.ink }}>Care Navigator</span>
              <span className="font-mono text-[10px] mt-1" style={{ color: FC.inkMut }}>Fern Crest Wellness Retreats</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px]" style={{ color: FC.green }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FC.green }} /> online
            </span>
          </div>
          <div className="p-5 flex flex-col gap-2.5">
            <BotMsg tag="N-000" zone="voice">Hi, I&rsquo;m Rowan. Whatever brought you here tonight &mdash; we can take it one step at a time. Want to look around, or start with something specific?</BotMsg>
            <UserMsg>my insurance is through my job, aetna i think</UserMsg>
            <BotMsg tag="payer ✓ captured" zone="voice">Good news &mdash; we&rsquo;re in-network with Aetna. For exact coverage and cost, a team member can walk you through your benefits whenever you&rsquo;re ready &mdash; no forms tonight.</BotMsg>
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
            <InspRow label="in-network" value="yes · vetted" hot />
            <InspRow label="coverage · cost" value="deferred → team member" />
            <InspRow label="member id" value="—" />
            <InspRow label="model" value="voice only · phrasing" />
          </div>
          <p className="font-mono text-[11px] leading-[1.5] mt-4 pt-4 border-t m-0" style={{ color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.1)" }}>
            Every field green-lit by the flow, not the model. The browser never holds the record.
          </p>
        </div>
      </div>
      <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        <b style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>The moment that sells the thesis, from the real Fern Crest build.</b> Left, the warmth — the navigator goes by Rowan, on Fern Crest&rsquo;s nature-first palette. Right, the machine underneath: it catches &ldquo;Aetna&rdquo; from a fuzzy reply, confirms in-network from vetted content, and defers exact coverage and cost to a human. Rowan supplied the warmth; the flow supplied the facts &mdash; and knew where to stop.
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
          <div className={`${MEASURE} mt-8`}>
            <p className="text-[15px] leading-relaxed mb-0" style={{ color: "var(--color-muted)" }}>
              Whoever takes the callback gets the whole conversation — the path taken, the questions asked, the ones deferred to a human on purpose — not just a name and a number.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE DECISIONS */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-2`}>
            <Eyebrow>The decisions that mattered</Eyebrow>
            <SectionH2>A case study is really a record of what you chose.</SectionH2>
            <p className="text-[17px]" style={{ color: "var(--color-muted)" }}>
              Four calls did the most work.
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
              Decline, crisis, “just browsing,” a question the system can’t answer — every branch routes somewhere humane.
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

      {/* THE NODE MAP WAS THE REAL WORK (authorship + method) */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Who did what, plainly</Eyebrow>
            <SectionH2>The node map was the real work.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              The project began as an analysis of the site’s earlier, pre-LLM system — every path a conversation could take, drawn out as a node map. I prototyped the flow in Figma, then moved into code: getting the nodes and the model’s behavior to feel natural meant iterating them live, with the LLM in the loop, not on a static canvas. Claude Code typed; I decided — the build on this page is my own reference engine, white-labeled.
            </p>
            <p className="text-[17px] leading-relaxed mb-4">
              What that produced, in about a week, was a complete working skeleton — every path, every vetted answer, the crisis stop, the data boundaries, all of it running. Not a mockup: scoped to settle how the thing behaves, not to survive production traffic — every open design question answered in something you could actually use.
            </p>
            <p className="text-[17px] leading-relaxed mb-6">
              The handoff was that running build, the node map, and a filmed walkthrough — with one precondition: a BAA, because you don’t hand a design that captures insurance details to infrastructure that can’t legally hold them. From there the client’s engineers built it out for production — the compliance and scale a prototype gets to skip. The design was theirs to build, never to reinvent.
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
