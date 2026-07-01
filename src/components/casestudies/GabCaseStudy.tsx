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
  StageDiagram,
  type Stage,
} from "./primitives";

/**
 * Bespoke editorial layout for the Gab case study — the first of the "v3"
 * richer case studies and the reference other studies follow. Narrative
 * structure (hook → principle → decisions → the system drawn → seeing it run →
 * impact → next move) with two scalable in-page diagrams (StageDiagram,
 * CareFlow) instead of screenshots.
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
    p: "The model rewrites stiff prompts into something human, recovers gracefully when someone types off-script, and — the part I'm proudest of — catches a detail at the exact moment a person leans in, the way a good coordinator hears “my insurance is through my job” and quietly writes it down. What it's forbidden to do: decide what happens next, state a clinical fact, or judge how much danger someone is in. Warmth is a feature. Authority is not.",
  },
  {
    k: "Crisis is not\na conversation",
    h: "When someone's in danger, the product stops being a product.",
    p: "If a message signals suicidal intent or an overdose, the system doesn't improvise empathy and hope the model handles it. It hard-stops — every time, no exceptions — and puts a crisis line and a human phone number in front of them. That trigger is pattern-matched and absolute; the model never gets a vote, because “usually right” is not a safety standard when a life is on the line.",
  },
  {
    k: "Ask for less",
    h: "Every extra question is a reason to leave.",
    p: "There are three depths of intake, and the flow only ever uses the shallowest one that fits. A callback needs a name and a number. Checking coverage needs an insurance card. A full pre-screen happens only once someone has explicitly said they're ready. Nobody at rock bottom should have to earn help by answering fourteen questions — and nothing they share ever touches their device.",
  },
  {
    k: "Designed to\nbe attacked",
    h: "The warmth is also the vulnerability.",
    p: "A public widget means someone will try to jailbreak it — make it drop its role, write their homework, or say something a treatment center can never be caught saying. The same flexibility that lets the model feel human is exactly what makes it manipulable. So keeping the assistant in character, no matter what's typed at it, wasn't a finishing touch. It was load-bearing, and it's handled before a single word reaches the model.",
  },
];

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
          <div className={`${MEASURE} mt-10 pt-8 border-t`} style={{ borderColor: "rgba(45,42,38,0.1)" }}>
            <p className="leading-[1.5]" style={{ fontSize: "clamp(20px,2.4vw,24px)", color: "var(--color-charcoal)" }}>
              It's 2&nbsp;a.m. and someone opens a rehab's website. Maybe it's them. Maybe it's a mother holding her son's phone, reading his messages, terrified. They're ashamed, exhausted, and one cold reply away from closing the tab.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              The assistant that greets them has to feel like a person who cares — and it absolutely cannot invent a treatment fact, mishandle what someone just confessed, or get talked out of its own guardrails. That gap — warm enough to trust, safe enough for healthcare — is the entire design problem behind Gab.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE REAL PROBLEM */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The real problem</Eyebrow>
            <SectionH2>Warm and safe usually pull in opposite directions.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              A form is safe but cold — a phone tree at the lowest moment of someone's life. An open-ended chatbot is warm but reckless: it invents clinical details, spills protected health information, and folds the second a bored teenager tells it to ignore its instructions.
            </p>
            <p className="text-[17px] leading-relaxed">
              Most “AI for healthcare” quietly picks a side. The brief here was to refuse — to build something that reads like a caring intake coordinator <em>and</em> is provably safe in a regulated, HIPAA-bound environment. Everything below is how.
            </p>
          </div>
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
                The trap is letting the AI decide things — so it doesn't get to. Every choice that carries risk — where the conversation goes, which facts get stated, how much someone's asked to share, whether a moment is a crisis — belongs to a deterministic system. The model is handed exactly one job: make it sound human. Three layers, checked in order, each trusted with a different amount.
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
          </div>
        </Reveal>
      </DarkSection>

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
              Decline, crisis, “just browsing,” a question the system can't answer — all of it routes somewhere humane, and the phrase “start admission” pulls a person back to the front of the line from anywhere in the flow.
            </p>
          </div>
          <CareFlow />
        </div>
      </Reveal>

      {/* SEEING IT RUN */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-8`}>
            <Eyebrow>Seeing it run</Eyebrow>
            <SectionH2>The warmth on one side, the machine on the other.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              Left, what the person sees: warm, branded, one question at a time. Right, what's actually happening underneath — the deterministic core filling structured fields while the model handles nothing but tone.
            </p>
          </div>
          <figure className="m-0">
            <div className="rounded-xl overflow-hidden border p-2.5" style={{ borderColor: "rgba(45,42,38,0.08)", backgroundColor: "var(--color-warm-white)" }}>
              <video src="/images/gab/demo.mp4" controls autoPlay muted loop playsInline className="block w-full rounded-md" />
            </div>
            <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
              Live walkthrough — the conversation and the inspector, side by side.
            </figcaption>
          </figure>
        </div>
      </Reveal>

      {/* IMPACT */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Where it landed</Eyebrow>
            <SectionH2 className="!mb-6">Built for a national behavioral-health provider.</SectionH2>
            <ImpactCallout note="One concrete number goes here once it's live — entry-to-admission conversion, drop-off reduction, or share of intake handled unattended.">
              What shipped: a care navigator that owns first contact at admissions — greeting, triage, coverage capture — with no form to fill out and no one on the other end at 2&nbsp;a.m. It replaces a static contact page as the front door, and hands a warm, structured lead to the humans who take it from there.
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
                The intake conversation already collects everything a benefits check needs — payer, member ID, date of birth. The next step wires Gab to{" "}
                <Link href="/work/couve" className="border-b" style={{ color: "var(--color-terracotta)", borderColor: "rgba(45,42,38,0.2)" }}>
                  Couve
                </Link>
                , the behavioral-health EMR, so the moment coverage is verified a real out-of-pocket number appears right in the chat — before anyone talks to a human, and without a single form. Two projects, one system: the intake-to-admission spine.
              </p>
            </div>
          </div>
        </Reveal>
      </SeamBand>
    </main>
  );
}
