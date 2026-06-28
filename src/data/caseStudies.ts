export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  flagship?: boolean;
  context: string;
  problem: string;
  built: string;
  matters: string;
  /** If set, renders a 'Play Now' CTA linking here. */
  playUrl?: string;
  /** If set, embeds the project (e.g. a playable iframe) at the bottom. */
  embedUrl?: string;
  /** Index-card thumbnail; falls back to the first body image. */
  thumb?: string;
  extra?: { label: string; text: string };
  images?: { src: string; alt: string; clipped?: boolean }[];
  videos?: { src: string; alt: string }[];
  imagePlaceholders: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "gab",
    title: "Gab",
    subtitle: "Deterministic LLM Chatbot for Healthcare Admissions",
    context:
      "A behavioral health organization needed a patient-facing chatbot for their admissions website — handling sensitive mental health and addiction inquiries with PHI compliance requirements.",
    problem:
      "Most LLM chatbots hallucinate, can't handle PHI safely, and don't know when to escalate to a human. In healthcare admissions, a wrong answer or a privacy violation isn't a bug — it's a liability.",
    built:
      "A 954-line conversational flow specification with state machine architecture. Deterministic routing with LLM flexibility where appropriate. PHI compliance gaps identified and remediated. Guardrails that actually guard.",
    matters:
      'This is what responsible AI deployment looks like in a regulated environment — not "we added ChatGPT to our website" but a system designed to know what it doesn\'t know.',
    videos: [
      { src: "/images/gab/demo.mp4", alt: "Gab chatbot demo — deterministic conversational flow in action" },
    ],
    images: [
      { src: "/images/gab/architecture.svg", alt: "Gab architecture — deterministic state machine with LLM flexibility layers" },
    ],
    imagePlaceholders: [],
  },
  {
    slug: "sudsy",
    title: "Sudsy",
    subtitle: "Behavioral Health EMR Concept",
    context:
      "The behavioral health industry runs on fragmented, outdated EHR/EMR systems that weren't designed for the complexity of addiction treatment and mental health care.",
    problem:
      "Patient financial responsibility estimation is broken, verification of benefits is unreliable, and clinical teams are stuck working around systems that don't talk to each other.",
    built:
      "An end-to-end behavioral health EMR concept — from intake to billing — designed around how these organizations actually operate. Started as a design vision, evolved into working prototypes for VOB accuracy and PFR estimation.",
    matters:
      "This isn't a redesign. It's a rethinking of what the system should be when you start from the patient and clinician experience rather than the billing code.",
    videos: [
      { src: "/images/sudsy/demo.mp4", alt: "Sudsy EMR concept — intake to billing workflow demo" },
    ],
    images: [
      { src: "/images/sudsy/census.png", alt: "Sudsy Census — real-time patient census with filtering by state, level of care, and group", clipped: true },
      { src: "/images/sudsy/attendance.png", alt: "Sudsy Attendance — virtual IOP attendance tracking with AM/PM group management", clipped: true },
    ],
    imagePlaceholders: [],
  },
  {
    slug: "paper-cannon",
    title: "Paper Cannon",
    subtitle: "Multi-Agent Research Synthesis Pipeline",
    context:
      "Research organizations — whether academic, clinical, or product — drown in source material. Studies, interviews, reports, analytics, support tickets. The data exists. The synthesis doesn't.",
    problem:
      "When synthesis is manual, it's slow, inconsistent, and vulnerable to cherry-picking. PMs and stakeholders do their own interpretation of research, which means the loudest voice or the most convenient data point wins — not the most rigorous reading.",
    built:
      'A 14-agent multi-agent pipeline that takes disparate source material and produces editorial-quality synthesized output. The pipeline includes: ingestion agents that handle multiple input formats, analysis agents that extract and cross-reference findings, a synthesis agent that produces coherent narrative, a red-team agent that challenges the output, and a containment agent (Reindeer) that monitors all other agents for drift from their designated roles. The system includes a pixel-art "Newsroom" GUI for monitoring pipeline status.',
    matters:
      "This isn't a summarizer. It's a system where the research team maintains editorial authority over what the data says, while AI handles the scale problem. The red-team and containment architecture means the system is designed to catch its own mistakes — the same principles that make LLMs dangerous in uncontrolled environments make them powerful when you build adversarial quality control into the pipeline itself.",
    extra: {
      label: "The Reindeer Moment",
      text: "The containment agent (Reindeer) operates in detection-only mode, issuing CLEAR or DRIFT assessments per agent. During testing, Reindeer caught the Red-Team agent drifting during the challenge phase — the system policing itself in real time.",
    },
    images: [
      { src: "/images/paper-cannon/newsroom.png", alt: "Paper Cannon Newsroom GUI — pixel-art interface showing agents in the Challenge phase" },
      { src: "/images/paper-cannon/architecture.svg", alt: "Paper Cannon pipeline architecture — 14-agent multi-agent research synthesis system" },
      { src: "/images/paper-cannon/stacks.png", alt: "The Stacks — pre-flight phase extracting thesis, scope, claims, and correction candidates", clipped: true },
      { src: "/images/paper-cannon/distillation.png", alt: "Chat log distillation — session dynamics, counter-arguments, and trigger candidates", clipped: true },
    ],
    imagePlaceholders: [],
  },
  {
    slug: "chad",
    title: "CHAD Rescues Nobody",
    subtitle:
      "A puzzle-platformer that teaches you to survive a country, not pass a test",
    context:
      "A puzzle-platformer that teaches you to survive in a foreign country, not pass a language exam. You play Chad — an oblivious American accidental-billionaire in cargo shorts — who lands in 1994 Belarus and has to function: order food, find an apartment, navigate the city, handle visa paperwork, all in Russian he doesn't speak. You learn by inference and immersion, not flashcards: Cyrillic words appear in context, you guess what they mean, and you test the guess by collecting the right items.",
    problem:
      "Language apps optimize for streaks and recognition. They make you feel like you're learning while leaving you unable to order coffee in the actual country — vocabulary in isolation, no spatial memory, no stakes, no social context. But people don't acquire language by memorizing rules; they acquire it by needing something, failing to get it, and trying again. CHAD makes the game itself the immersion environment: you learn Russian because a fictional idiot can't, and the comedy is the pedagogy — laughter lowers the stress that kills language acquisition, and physically navigating to the right object burns vocabulary into spatial memory.",
    built:
      "A content-driven game engine (React / TypeScript / Vite, Canvas) with a briefing → run → gate → reveal phase structure, wrapped around mechanics that teach reading, listening, and survival production rather than grammar. A WASD-driven Cyrillic input system works both ways — sound-to-letter for spelling, letter-to-sound for reading signs. A vertical city built from real Minsk streets is navigated by reading Soviet signage and asking grandmothers for directions; shopkeeper conversations force the local social register (greet, ask, thank); and a mentor, Anya, refuses to explain grammar and trusts repetition. Crucially, a new language is a data pack a bilingual non-programmer can author — the mechanics are the platform; the language and culture are content.",
    matters:
      "Most “educational games” are neither. CHAD bets that the way to teach survival-level language is to make the player live a comedy of errors in the target culture — never explaining a rule, never breaking the joke — and that this produces functional speakers faster and more durably than apps that aim for fluency and deliver neither. It is built to scale: any phonetic, case-heavy language that follows Russian's rules — Polish, Ukrainian, Greek, Korean, Turkish — can ride the same engine, authored by native speakers. The unbreakable rule across every version: the joke is always the clueless foreigner, never the country. The promise isn't fluency — it's that you'll step off the plane able to get by.",
    playUrl: "/chad",
    embedUrl: "/chad",
    thumb: "/images/chad/title.png",
    imagePlaceholders: [],
  },
];
