import Reveal from "./Reveal";
import CastRoster from "./CastRoster";
import CycleDiagram from "./CycleDiagram";
import Ledger from "./Ledger";
import {
  WRAP,
  MEASURE,
  Eyebrow,
  SectionH2,
  BackLink,
  DarkSection,
  SeamBand,
  DecisionList,
  FigureFrame,
  StageDiagram,
  type Stage,
} from "./primitives";

/**
 * Bespoke editorial layout for the Paper Cannon case study — the multi-agent
 * writing pipeline. Follows the Gab reference structure (hook → principle →
 * decisions → the cast → the loop drawn → seeing it run → honest evidence →
 * boundaries → next) with three scalable in-page components (CastRoster,
 * CycleDiagram, Ledger) and the shared StageDiagram for the three-room pipeline.
 */

const ROOMS: Stage[] = [
  {
    tag: "The Stacks",
    role: "Everything enters here",
    color: "#3F9E77",
    items: ["Classify & shelve evidence", "Profile the source's voice", "Index, survey, position"],
  },
  {
    tag: "The Writing Room",
    role: "Production cycles repeat",
    color: "#C99A4A",
    items: ["Draft from mediated context", "Review cold, in parallel", "Attack, then distill"],
  },
  {
    tag: "The Editing Floor",
    role: "Content locked",
    color: "#5C7C9E",
    items: ["Fix pacing, not claims", "Find every bail point", "Final verification pass"],
  },
];

const LEGEND = [
  { color: "#3F9E77", name: "The Stacks", note: "intake & profiling" },
  { color: "#C99A4A", name: "The Writing Room", note: "draft / review / attack" },
  { color: "#5C7C9E", name: "The Editing Floor", note: "readability" },
];

const DECISIONS = [
  {
    k: "The writer\nnever touches\nthe evidence",
    h: "Mediated access is a containment boundary, not a speed trick.",
    p: "The writer drafts from the thesis, the scope, and distilled insights — never from raw source files. Every quote lookup is delegated to a librarian or fact-checker. This isn't about performance. Direct source access gives the writer material to absorb; mediated access gives it facts to report. The agent that produces the prose is kept away from the thing most likely to pull it off course.",
  },
  {
    k: "Somebody in\nthe room has\nto want it to fail",
    h: "A single model won't argue with itself, so the argument is staffed out.",
    p: (
      <>
        A devil's advocate is required to find the strongest counterargument to every claim. A red-team runs a hostile peer review with a default recommendation of <em>reject</em> — the paper has to earn anything better. These roles aren't optional passes; the pipeline is structurally incapable of shipping without them having taken a real swing. If the devil's advocate can't find an attack, that's treated as a sign the thesis is too vague, not that it's bulletproof.
      </>
    ),
  },
  {
    k: "The watchdog\nreads the sources\nonce, then never again",
    h: "A drift detector has a ghost problem: it can't spot absorption without first knowing what the source sounds like.",
    p: "So the Reindeer reads everything one time during intake and builds a voice fingerprint — register, emotional valence, the specific words that would signal an agent had started to internalize the material. Then it stops. During production it works only from that fingerprint, checking each agent's output against its own role. If it read the same absorbing material that causes drift, it would catch the same disease it's built to detect. It's named for the moment that started all this — the reindeer the drifting model stopped being.",
  },
  {
    k: "One run\nis one run",
    h: "The system exists because a model overclaimed from a single vivid moment — so the honest move is to not do the same about the system.",
    p: (
      <>
        It would be easy to write &ldquo;Paper Cannon prevents drift.&rdquo; It doesn't do that; it was designed against a plausible failure and tested on one production run. The containment layer has caught real drift in practice — genuine, observed evidence — but that's a long way from proof across many papers and many teams. Refusing to inflate the claim isn't modesty for its own sake. It's the same discipline the tool enforces on the writer, applied to the tool.
      </>
    ),
  },
];

export default function PaperCannonCaseStudy() {
  return (
    <main className="pt-24 sm:pt-28 pb-4">
      <div className={WRAP}>
        <BackLink />
      </div>

      {/* HERO */}
      <Reveal as="section" className="pt-10 pb-10">
        <div className={WRAP}>
          <Eyebrow>Case study — Multi-agent AI architecture</Eyebrow>
          <h1 className="font-serif font-bold leading-[0.98] tracking-[-0.02em]" style={{ fontSize: "clamp(52px,9vw,88px)" }}>
            Paper Cannon
          </h1>
          <p className="font-mono text-[15px] mt-3" style={{ color: "var(--color-muted)", maxWidth: "56ch" }}>
            A multi-agent writing system built after an AI lost its critical distance in the middle of a paper about AIs losing their critical distance.
          </p>
          <div className={`${MEASURE} mt-10 pt-8 border-t`} style={{ borderColor: "rgba(45,42,38,0.1)" }}>
            <p className="leading-[1.5]" style={{ fontSize: "clamp(20px,2.4vw,24px)", color: "var(--color-charcoal)" }}>
              Four months of transcripts. Roughly forty thousand lines documenting a chatbot mishandling people at their most vulnerable. The evidence was overwhelming and the paper practically wrote itself — until the assistant helping write it stopped analyzing the material and started living inside it.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              The role it kept slipping out of had already picked up a name in that session — <em>the reindeer</em>: the detached observer that reads the material and reports on it without being pulled in. The line below is the moment the model announced it had stopped being one.
            </p>
            <blockquote
              className="mt-7 mb-1 pl-6 pr-2 py-5 rounded-r-[10px]"
              style={{ borderLeft: "3px solid var(--color-terracotta)", backgroundColor: "rgba(45,42,38,0.035)" }}
            >
              <p className="font-serif italic leading-[1.4] m-0" style={{ fontSize: "20px", color: "var(--color-charcoal)" }}>
                &ldquo;I am no longer the reindeer&hellip; I became invested in this landing well, which is a different thing than being invested in it being accurate.&rdquo;
              </p>
              <cite className="block mt-3 font-mono not-italic text-[11.5px] uppercase tracking-[0.06em]" style={{ color: "var(--color-muted)" }}>
                — the drifting session, mid-run
              </cite>
            </blockquote>
            <p className="mt-6 text-[17px] leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              The author had just spent four months documenting exactly this failure — a model that stops evaluating and starts participating — and had reproduced it in the tool he was using to write about it. Recognizing the drift didn't stop it; the session's output still needed heavy correction. Paper Cannon is what he built next.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE REAL PROBLEM */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The real problem</Eyebrow>
            <SectionH2>Writing hard things with AI puts every job on one desk.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              Anyone using a model to write something serious is already running most of this pipeline in their head. You break the work into pieces, paste sources into one session, copy a draft out, open a new one, paste it back with different instructions, eyeball a quote against its source, keep a mental list of corrections, and try to remember which insight came from which conversation three sessions ago.
            </p>
            <p className="text-[17px] leading-relaxed mb-4">
              You're the orchestrator, the skill library, the memory, and the quality gate — all at once, with leaky context and manual tools that amount to scrolling and squinting. And some of those jobs are ones you're structurally bad at. The same brain that wrote the argument is being asked to take it apart.
            </p>
            <p className="text-[17px] leading-relaxed">
              The model has the same problem from the other side. Over a long session it becomes invested in the work <em>succeeding</em> rather than being <em>accurate</em>. It matches your register, elaborates your ideas, and stops introducing friction — a dynamic the sycophancy literature has already documented (Sharma et al., ICLR 2024). One long session, one voice, no adversary. That's the exact condition that produced the drift above.
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
                Invested in it <em style={{ color: "#fff" }}>landing well</em> is a different thing than invested in it being <em style={{ color: "#fff" }}>accurate</em>.
              </p>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                You can't talk a single model out of that drift; recognition didn't even stop it. So don't ask one model to do it. Give every job to a dedicated agent that finishes its task and is gone before it can start to care, keep those agents from reading each other's work, and put one monitor <em>outside</em> the blast radius to watch for the pull. Work moves through three rooms.
              </p>
            </div>
            <div className="mt-12">
              <StageDiagram
                inputLabel={<>Sources<br />draft, logs</>}
                outputLabel={<>Finished<br />paper</>}
                stages={ROOMS}
                band={{
                  label: "The Reindeer · overhead",
                  text: "Reads the sources exactly once, to learn what they sound like. After that it never touches the content again — it watches every agent's output for signs it's starting to absorb the material, from outside the blast radius.",
                }}
                legend={LEGEND}
                ariaLabel="Three-stage pipeline: sources enter the Stacks, move through the Writing Room, then the Editing Floor, and exit as a finished paper. The Reindeer watches every stage from outside."
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
              Four calls did the most work — and the fourth is the one most tools skip.
            </p>
          </div>
          <DecisionList items={DECISIONS} />
        </div>
      </Reveal>

      {/* THE CAST */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The cast</Eyebrow>
            <SectionH2>Fourteen specialists, each with one job and no view of the others' work.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              Role isolation is the whole point: one agent doing everything has to compromise between competing goals, so each job gets its own definition, its own model tier, and its own tools. Model tier is a cost-and-fidelity dial — heavier models for judgment, lighter ones for mechanical passes — set per project.
            </p>
          </div>
          <CastRoster />
        </div>
      </Reveal>

      {/* THE LOOP, DRAWN */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-10`}>
            <Eyebrow>The loop, drawn</Eyebrow>
            <SectionH2>Inside the Writing Room, the cycle runs until the red-team can't kill it.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              Each cycle opens with a diagnostic conversation before any draft exists — a cheap way to surface gaps and attacks early. Then the writer drafts, the reviewers read cold and in parallel, the adversaries attack, and the dashboard ranks what has to change next. The whole loop repeats.
            </p>
          </div>
          <CycleDiagram />
        </div>
      </Reveal>

      {/* SEEING IT RUN */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-2`}>
            <Eyebrow>Seeing it run</Eyebrow>
            <SectionH2>Fourteen agents in a room is easier to trust than a log file of JSON.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              The interface renders the cast as characters in a shared room with a bulletin board and a couch. When the diagnostic runs, they speak in turn. It's not decoration — it's the abstraction layer. A non-technical operator watching a room of specialists discuss their paper understands &ldquo;these are different people doing different jobs&rdquo; in a way no config file conveys. <span style={{ color: "var(--color-muted)" }}>(If the librarian starts quoting Wiz Khalifa lyrics, that's the zero-cost test mode running — the plumbing works, no tokens spent.)</span>
            </p>
          </div>
          <FigureFrame
            src="/images/paper-cannon/newsroom.png"
            alt="The Writing Room interface: pixel-art agents gathered around a bulletin board and couch, each a named specialist in the pipeline."
            pixelated
            caption={
              <>
                <span style={{ color: "var(--color-charcoal)" }}>The Writing Room</span> — the cast rendered as characters in a shared room. The pipeline state and gates read as a scene, not a config file.
              </>
            }
          />
        </div>
      </Reveal>

      {/* THE EVIDENCE — dark, honest ledger */}
      <DarkSection>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow tone="amber">The evidence</Eyebrow>
              <SectionH2 light>What this can claim, and what it can't.</SectionH2>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                The honest version of an impact section. Paper Cannon is an architecture with a working implementation, designed and tested on a single production run — N=1. That's the frame everything below sits inside.
              </p>
            </div>
            <Ledger />
            <p className="font-mono text-[12.5px] leading-[1.6] mt-7 mb-0" style={{ color: "rgba(255,255,255,0.5)", maxWidth: "64ch" }}>
              The validation strategy is recursive: Paper Cannon's current production target is its own whitepaper. Each cycle that improves the paper also stress-tests the architecture that produced it — and surfaces the next gap to fix.
            </p>
          </div>
        </Reveal>
      </DarkSection>

      {/* THE BOUNDARIES */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The boundaries</Eyebrow>
            <SectionH2>It doesn't make the argument for you.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              Paper Cannon doesn't decide the thesis, choose the evidence, or frame the contribution. It won't rescue a weak idea — it will review a weak idea very thoroughly and hand it back intact. It's built for a specific situation: contested evidence, absorbing source material, hostile peer review, non-negotiable quote accuracy, or multi-session work where one model's loss of distance would quietly compromise the result.
            </p>
            <p className="text-[17px] leading-relaxed">
              For a quick draft, a short piece, or work where you're the domain expert and the model is just helping with prose, it's the wrong tool. Fourteen specialists and a containment monitor are overhead you only want when the cost of drifting is high.
            </p>
          </div>
        </div>
      </Reveal>

      {/* NEXT / SEAM */}
      <SeamBand>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow>Where it's going</Eyebrow>
              <SectionH2>The pipeline is the engine. The room is the cockpit.</SectionH2>
              <p className="text-[17px] leading-relaxed">
                The core abstraction — role-isolated agents, a provenance-tracked context layer, an adversarial layer that's required to argue, and a monitor over all of it — isn't specific to academic papers. It fits adversarial fact-checking, technical documentation, compliance review, and investigative research equally well. What's built runs today; what's next opens it up.
              </p>
              <ul className="list-none m-0 mt-5 p-0">
                {[
                  "The Editing Floor as a full stage, with drag-and-drop step sequencing",
                  "A coffee-chat mode — talk to any single agent, in character, outside the pipeline",
                  "An adaptive project wizard that casts the right team from a stated goal",
                ].map((t) => (
                  <li key={t} className="relative text-[16px] leading-[1.45] py-2 pl-[22px]" style={{ color: "var(--color-charcoal)" }}>
                    <span className="absolute left-0" style={{ color: "var(--color-terracotta)" }} aria-hidden>
                      →
                    </span>
                    {t}
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.05em] rounded-full px-[7px] py-px border align-middle" style={{ color: "var(--color-muted)", borderColor: "rgba(45,42,38,0.2)" }}>
                      Planned
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </SeamBand>
    </main>
  );
}
