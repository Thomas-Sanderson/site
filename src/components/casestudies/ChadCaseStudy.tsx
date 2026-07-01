import GameEmbed from "@/components/GameEmbed";
import Reveal from "./Reveal";
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
 * Bespoke editorial layout for the CHAD ("Chad Rescues Nobody") case study —
 * a v3 study following the Gab reference. Narrative structure (hook → real
 * problem → principle → decisions → the build running → where it stands → next
 * move → play it) with the shared StageDiagram carrying the four-beat learning
 * loop, and the live game embedded as the closing beat.
 */

/** Inline Cyrillic — mono + semibold so untranslated words read as artifacts. */
function Ru({ children }: { children: React.ReactNode }) {
  return <span className="font-mono font-semibold">{children}</span>;
}

const LOOP: Stage[] = [
  {
    tag: "Briefing",
    role: "Context, not translation",
    color: "#4FB6CE",
    items: [
      "Mixed English / Russian messages",
      <>&ldquo;Grab <Ru>СМЕТАНА</Ru> on the way&rdquo;</>,
      "Clues hide in the exasperation",
    ],
  },
  {
    tag: "Run",
    role: "Guess with your feet",
    color: "#C99A4A",
    items: [
      "Side-scrolling collection + decoys",
      "Babushkas scold, marshrutkas kill",
      "Spatial memory anchors the word",
    ],
  },
  {
    tag: "Gate",
    role: "The stakes",
    color: "#CF5B45",
    items: [
      "Inventory checked at the door",
      <>Wrong? <Ru>«ГДЕ ПРОДУКТЫ?!»</Ru></>,
      "No life lost — just shame",
    ],
  },
  {
    tag: "Reveal",
    role: "Confirmation, in character",
    color: "#3F9E77",
    items: [
      "Meaning paired with the item",
      "Delivered as Anya roasting Chad",
      "Failed runs re-read differently",
    ],
  },
];

const LEGEND = [
  { color: "#4FB6CE", name: "Cyan", note: "locations, in-game and in UI" },
  { color: "#C99A4A", name: "Amber", note: "items" },
  { color: "#CF5B45", name: "Gate", note: "comedy, not punishment" },
  { color: "#3F9E77", name: "Reveal", note: "never a flashcard" },
];

const DECISIONS = [
  {
    k: "One trie,\ntwo directions",
    h: "The alphabet is a mechanic, not a lesson.",
    p: (
      <>
        Cyrillic gets taught by a WASD-driven trie that runs both ways. <em>Encode</em> — sound to letter — is how you sound out a mystery can or spell a destination. <em>Decode</em> — letter to sound — is how you read the street sign that just appeared in Cyrillic only. Same component, opposite directions, same skill built from both ends. It&rsquo;s also why this is a desktop game targeting Steam: the trie is keyboard-native, and a touch port would gut the feel of the core mechanic.
      </>
    ),
  },
  {
    k: "Directions you\nhave to earn",
    h: "You can't get across Minsk without reading Minsk.",
    p: (
      <>
        To travel, you spell your destination on the trie, a street sign appears in Cyrillic, and you decode the street name before directions unlock. Babushka gatekeepers demand <Ru>«КУДА?»</Ru> — <em>where to?</em> — and won&rsquo;t budge until you can answer in Russian and prove you can read the street. Navigation vocabulary isn&rsquo;t a level theme; it&rsquo;s the fare. This whole system shipped in the current build, along with a four-season city that changes what the same streets ask of you.
      </>
    ),
  },
  {
    k: "Failure is a\ncomedy beat",
    h: "Stress kills acquisition, so the fail state is a punchline.",
    p: (
      <>
        Bring the wrong groceries and a voice from the cosmos bellows <Ru>«ГДЕ ПРОДУКТЫ?!»</Ru> before Chad can finish &ldquo;But I&mdash;&rdquo;. No lives lost, no score docked — you&rsquo;re back at the briefing, and Anya&rsquo;s texts hit different on the second read because now you know which word betrayed you. The retry <em>is</em> the spaced repetition; it just doesn&rsquo;t look like homework.
      </>
    ),
  },
  {
    k: "The joke is\nalways Chad",
    h: "Comedy is the pedagogy — with rules.",
    p: (
      <>
        The joke is never &ldquo;Belarus is weird&rdquo; and never at Anya&rsquo;s expense. Belarus is drawn with affection and specificity, down to the sacred potato hidden in every level; Anya is smarter than everyone in the room and regrets giving out her number. Chad — sincere, oblivious, confidently wrong about neural networks in 1994 — absorbs every punchline. Laughing while you learn isn&rsquo;t a garnish; emotional encoding is one of the three cognitive levers the design leans on, alongside embodied association and consequential motivation.
      </>
    ),
  },
];

const CHIPS: { label: string; body: React.ReactNode; next?: boolean }[] = [
  { label: "Live", body: "13 levels" },
  { label: "Live", body: "WASD Cyrillic trie (encode + decode)" },
  { label: "Live", body: "City directions & street signs" },
  { label: "Live", body: "Four-season system" },
  { label: "Next", body: "Curriculum rebuild on Bloom's taxonomy", next: true },
];

function StatusChips() {
  return (
    <div className="flex flex-wrap gap-2 mt-8">
      {CHIPS.map((c) => (
        <span
          key={String(c.body)}
          className="font-mono text-[12px] rounded-full px-3 py-1.5 border"
          style={{ borderColor: "rgba(45,42,38,0.12)", backgroundColor: "var(--color-warm-white)", color: "var(--color-charcoal)" }}
        >
          <b style={{ color: c.next ? "var(--color-terracotta)" : "var(--color-teal)", fontWeight: 600 }}>{c.label}</b>{" "}
          <span style={{ color: "var(--color-muted)" }}>· {c.body}</span>
        </span>
      ))}
    </div>
  );
}

export default function ChadCaseStudy() {
  return (
    <main className="pt-24 sm:pt-28 pb-4">
      <div className={WRAP}>
        <BackLink />
      </div>

      {/* HERO */}
      <Reveal as="section" className="pt-10 pb-10">
        <div className={WRAP}>
          <Eyebrow>Case study — Language learning as game design</Eyebrow>
          <h1 className="font-serif font-bold leading-[0.98] tracking-[-0.02em]" style={{ fontSize: "clamp(44px,8vw,80px)" }}>
            Chad Rescues Nobody
          </h1>
          <p className="font-mono text-[15px] mt-3" style={{ color: "var(--color-muted)" }}>
            A pixel-art platformer set in 1994 Belarus — where you learn Russian by guessing wrong, and the potato is always watching.
          </p>
          <div className={`${MEASURE} mt-10 pt-8 border-t`} style={{ borderColor: "rgba(45,42,38,0.1)" }}>
            <p className="leading-[1.5]" style={{ fontSize: "clamp(20px,2.4vw,24px)", color: "var(--color-charcoal)" }}>
              Chad is an American in cargo shorts who cannot find Belarus on a map. Anya — a Minsk programmer who did not ask to be rescued — texts him grocery lists in a mix of English and Russian, because that&rsquo;s how bilingual people text. The Cyrillic words are never translated. You infer <Ru>СМЕТАНА</Ru> from context, grab the tub you <em>think</em> is sour cream, and find out at the door.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              Every language app promises immersion; almost none delivers it, because immersion means being wrong in public with something at stake. This game makes being wrong the whole loop — and makes it funny instead of humiliating. Two rules govern every piece of content: <em>is it funny?</em> and <em>did the player learn a word?</em>
            </p>
            <StatusChips />
          </div>
        </div>
      </Reveal>

      {/* THE REAL PROBLEM */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The real problem</Eyebrow>
            <SectionH2>Flashcard apps optimize the streak, not the word.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              Drill apps teach you to win the drill: you recognize a translation pair, the streak survives day nine, and the word still isn&rsquo;t yours. Real acquisition happens the way it does for a kid — encounter a word in context, guess, act on the guess, get corrected. That process needs stakes, repetition across contexts, and low stress. Games are unreasonably good at all three.
            </p>
            <p className="text-[17px] leading-relaxed">
              The brief I set myself: don&rsquo;t gamify a curriculum. Build the immersion environment itself — a place where a word matters because you need it to eat, get across town, or get a babushka to let you pass.
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
                Learning happens through <em style={{ color: "#fff" }}>inference</em>, not instruction.
              </p>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                There are no flashcards, no translations, no &ldquo;press X to learn.&rdquo; Vocabulary arrives inside Anya&rsquo;s texts, in Cyrillic, surrounded by just enough context to guess from. The level is the test; the door is the grade; the reveal is a roast. Every level runs the same four-beat loop.
              </p>
            </div>
            <div className="mt-12">
              <StageDiagram
                inputLabel={<>Anya&rsquo;s<br />texts</>}
                outputLabel={<>A word<br />you own</>}
                stages={LOOP}
                legend={LEGEND}
                ariaLabel="The learning loop: Anya's messages feed the briefing, the player collects guesses in the run, the gate checks the inventory at the door, and the reveal confirms meaning in character — feeding back into the next briefing."
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

      {/* THE BUILD, RUNNING */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The build, running</Eyebrow>
            <SectionH2>Thirteen levels, playable today.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              This is the current desktop build — the original level set with the two-direction trie, the babushka-gated direction system, and the seasonal city already in. Screens only get you so far; the loop is best felt moving, so the whole thing is playable at the bottom of this page.
            </p>
          </div>
          <FigureFrame
            src="/images/chad/title.png"
            alt="Title screen for Chad Rescues Nobody — pixel-art 1994 Minsk."
            caption={<>The title screen — 1994 Minsk, rendered in pixels. <span style={{ color: "var(--color-charcoal)" }}>The potato is already watching.</span></>}
            pixelated
          />
        </div>
      </Reveal>

      {/* WHERE IT STANDS */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Where it stands</Eyebrow>
            <SectionH2 className="!mb-6">A working game, honestly mid-build.</SectionH2>
            <ImpactCallout note={<>One real playtest observation goes here once it&rsquo;s run — e.g. &ldquo;testers with zero Cyrillic decoded street names by level N.&rdquo; One concrete result beats three adjectives.</>}>
              The full inference loop, the two-direction Cyrillic trie, babushka-gated navigation, and the seasonal city are live across 13 playable levels in the desktop build. What doesn&rsquo;t exist yet: retention metrics and the expanded curriculum — the next milestone is playtesting vocabulary recall against the rebuilt level structure.
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
              <SectionH2>Rebuilding the levels around how learning actually deepens.</SectionH2>
              <p className="text-[17px] leading-relaxed">
                The 13 levels proved the loop; the next pass restructures them as the spine of a curriculum mapped to Bloom&rsquo;s taxonomy — climbing from <em>remember</em> (grab the right can) toward <em>create</em> (spell your own destination, hold your own at the embassy). The plan&rsquo;s signature idea: completing a phase unlocks a deeper tier of every <em>earlier</em> level, so the game grows backward and old streets ask new questions. And because the engine already separates content from code, the longer bet is a contributor platform — bilingual friends authoring new language skins as data packs, no fork required.
              </p>
            </div>
          </div>
        </Reveal>
      </SeamBand>

      {/* PLAY IT */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-8`}>
            <Eyebrow>Play it</Eyebrow>
            <SectionH2>Thirteen levels. The potato is watching.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              The live desktop build, right here. Press play, read Anya&rsquo;s texts, and find out at the door whether you grabbed the right tub.
            </p>
          </div>
          <GameEmbed src="https://chad-pearl.vercel.app" poster="/images/chad/title.png" title="Chad Rescues Nobody" />
        </div>
      </Reveal>
    </main>
  );
}
