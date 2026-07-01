import Link from "next/link";
import Reveal from "./Reveal";
import ReadinessGate from "./ReadinessGate";
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
} from "./primitives";

/**
 * Bespoke editorial layout for the Couve case study — sibling to Gab, the "v3"
 * reference. Same rhythm (hook → real problem → principle → decisions → the
 * system running → seam → impact), with one scalable in-page diagram
 * (ReadinessGate) standing in for the product's key screen, and the two real
 * screenshots plus a looping demo where the system actually runs.
 */

const DECISIONS = [
  {
    k: "Make the money\nknowable first",
    h: "Nobody should say yes to treatment blind to the cost.",
    p: "The financial track runs a real verification of benefits, then turns raw coverage — plan, remaining deductible, out-of-pocket max — into a plain-language patient-responsibility estimate, priced against the actual contracted rate for that payer and level of care. Not a terrifying EOB. A number a frightened person can understand before they commit. It's the single most humane thing the system does, and the thing most EMRs treat as an afterthought.",
  },
  {
    k: "One answer,\nnot five systems",
    h: "Four tracks, one legible state.",
    p: "Demographics, financial, medical, disposition — each has a real status, and together they roll up into a single readiness view for one patient and a board view for the whole population. A coordinator can look at 300 people and instantly see who's stuck on VOB, who's medically cleared, who's one signature from admission. The goal was to make an entire admissions operation legible in a glance instead of a morning of reconciliation.",
  },
  {
    k: "Refuse to let\nyou skip a step",
    h: "Some gates shouldn't be polite suggestions.",
    p: "You cannot admit someone whose benefits are only “requested.” The system blocks it, in red, and tells you why — the same way it warns before financial clearance is real. These gates are deliberate friction in exactly the places where skipping ahead creates a surprise bill or an uncovered stay. Encoding that judgment into the workflow, instead of hoping a busy human remembers it, is the difference between software that helps and software that just records what already went wrong.",
  },
  {
    k: "Built for the\nperson doing the work",
    h: "Plain language, one place, no billing-code fluency required.",
    p: "Dispositions, an activity log that reads like a human timeline, contracted rates you can actually see, denials tracked by payer — the whole thing speaks the language of admissions and clinical staff, not claim adjusters. A good EMR isn't measured by how much it can store. It's whether the person using it at 4 p.m. on a full census can find the truth fast. Couve is designed for that person's day, not the audit.",
  },
];

export default function CouveCaseStudy() {
  return (
    <main className="pt-24 sm:pt-28 pb-4">
      <div className={WRAP}>
        <BackLink />
      </div>

      {/* HERO */}
      <Reveal as="section" className="pt-10 pb-10">
        <div className={WRAP}>
          <Eyebrow>Case study — Behavioral-health EMR</Eyebrow>
          <h1 className="font-serif font-bold leading-[0.98] tracking-[-0.02em]" style={{ fontSize: "clamp(52px,9vw,88px)" }}>
            Couve
          </h1>
          <p className="font-mono text-[15px] mt-3" style={{ color: "var(--color-muted)" }}>
            A behavioral-health admissions and revenue platform — built so a person knows what treatment will cost before they say yes.
          </p>
          <div className={`${MEASURE} mt-10 pt-8 border-t`} style={{ borderColor: "rgba(45,42,38,0.1)" }}>
            <p className="leading-[1.5]" style={{ fontSize: "clamp(20px,2.4vw,24px)", color: "var(--color-charcoal)" }}>
              Someone finally agrees to go to treatment. It's the hardest yes of their life. Three weeks in, a bill lands for twelve thousand dollars nobody warned them about — because the benefits check was wrong, or never happened, or lived in an inbox no one opened.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              Meanwhile the coordinator who admitted them was flying blind: piecing coverage, clinical clearance, and consent together from five systems that don't talk. Couve is what a behavioral-health EMR looks like when you design it around those two people instead of the billing code.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE REAL PROBLEM */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The real problem</Eyebrow>
            <SectionH2>The facts that decide an admission are scattered across systems that don&rsquo;t talk.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              Whether someone is actually ready to be admitted — demographics captured, benefits verified, medically cleared, consent signed — is one question with its answer buried in a spreadsheet, a biller's inbox, a clinician's notes, and three browser tabs. So people get admitted into financial surprises, or don't get admitted at all because nobody can tell they're cleared.
            </p>
            <p className="text-[17px] leading-relaxed">
              Behavioral health runs on EMRs built for billing departments, not for the person in crisis or the coordinator trying to help them. The brief was to start over from their side of the screen.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE PRINCIPLE + READINESS GATE — dark */}
      <DarkSection>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow tone="amber">The principle</Eyebrow>
              <p className="font-serif font-semibold leading-[1.06] tracking-[-0.02em] mb-5" style={{ fontSize: "clamp(30px,5vw,52px)", color: "#ECE7DD" }}>
                Readiness is one <em style={{ color: "#fff" }}>answer</em>, not five <em style={{ color: "#fff" }}>systems</em>.
              </p>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                Every admission has to clear four tracks — demographics, financial, medical, disposition — and each normally lives in a different tool. Couve pulls them into one place and makes the answer legible at a glance: green means go, and anything unfinished is impossible to miss. The system's job isn't to store records. It's to always be able to tell you, honestly, whether this person is ready — and to refuse to pretend they are when they aren't.
              </p>
            </div>
            <div className="mt-12">
              <ReadinessGate />
            </div>
          </div>
        </Reveal>
      </DarkSection>

      {/* THE DECISIONS */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-2`}>
            <Eyebrow>The decisions that mattered</Eyebrow>
            <SectionH2>Like any real product, it&rsquo;s a record of what you chose.</SectionH2>
            <p className="text-[17px]" style={{ color: "var(--color-muted)" }}>
              Four calls carried the most weight.
            </p>
          </div>
          <DecisionList items={DECISIONS} />
        </div>
      </Reveal>

      {/* THE SYSTEM, RUNNING */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-8`}>
            <Eyebrow>The system, running</Eyebrow>
            <SectionH2>Synthetic data, real behavior.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              The whole operation at a glance — active census, an admissions pipeline broken out by track, and the readiness gate doing its job on a live population instead of a mockup.
            </p>
          </div>
          <figure className="m-0">
            <div className="rounded-xl overflow-hidden border p-2.5" style={{ borderColor: "rgba(45,42,38,0.08)", backgroundColor: "var(--color-warm-white)" }}>
              <video src="/images/couve/demo.mp4" autoPlay muted loop playsInline className="block w-full rounded-md" />
            </div>
            <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
              A walkthrough of the platform — census, pipeline, and a patient&rsquo;s readiness resolving in place.
            </figcaption>
          </figure>
          <FigureFrame
            src="/images/couve/census.png"
            alt="Couve census — active patients with their demographics, financial, and medical track status."
            caption={
              <>
                The active census — every patient carrying their demographics / financial / medical status. <span style={{ color: "var(--color-charcoal)" }}>Readiness for the whole population, scannable in seconds.</span>
              </>
            }
          />
          <FigureFrame
            src="/images/couve/attendance.png"
            alt="Couve attendance tracking — daily presence per patient across the census."
            caption={
              <>
                Attendance tracked against the census, day by day. <span style={{ color: "var(--color-charcoal)" }}>The same legibility applied to the stay, not just the admission.</span>
              </>
            }
          />
        </div>
      </Reveal>

      {/* IMPACT */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Where it landed</Eyebrow>
            <SectionH2 className="!mb-6">Built for a national behavioral-health provider.</SectionH2>
            <ImpactCallout note="One concrete result goes here once it's live — VOB turnaround cut from days to hours, estimates within $X of the final bill, or uncovered days avoided. If it stays a concept build, say so plainly and let the depth carry it.">
              What shipped: an admissions and revenue platform that makes one patient's readiness — demographics, benefits, medical clearance, disposition — a single legible answer, and refuses to admit anyone whose coverage hasn't cleared. Underneath it, a pricing engine turns a verification of benefits into a plain-language out-of-pocket number, so the cost of treatment is knowable before anyone says yes.
            </ImpactCallout>
          </div>
        </div>
      </Reveal>

      {/* NEXT / SEAM */}
      <SeamBand>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow>The other half</Eyebrow>
              <SectionH2>Couve is the building. Gab is the front door.</SectionH2>
              <p className="text-[17px] leading-relaxed">
                Every one of those leads starts as a conversation.{" "}
                <Link href="/work/gab" className="border-b" style={{ color: "var(--color-terracotta)", borderColor: "rgba(45,42,38,0.2)" }}>
                  Gab
                </Link>
                {" "}— the intake assistant — collects demographics and insurance at the very first contact, warmly, and hands off a lead that lands here already sitting at “demographics complete, VOB requested.” The moment Couve finishes verification, the out-of-pocket number it computes can travel right back into that conversation, before the person ever speaks to a human. Two products, one spine: the path from a scared 2&nbsp;a.m. message to a benefits-verified admission with no surprises.
              </p>
            </div>
          </div>
        </Reveal>
      </SeamBand>
    </main>
  );
}
