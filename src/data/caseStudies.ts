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
  /** If set, the /work index card links straight here instead of /work/[slug]. */
  href?: string;
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
    thumb: "/images/gab/card.webp",
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
    slug: "couve",
    title: "Couve",
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
      { src: "/images/couve/demo.mp4", alt: "Couve EMR concept — intake to billing workflow demo" },
    ],
    images: [
      { src: "/images/couve/census.png", alt: "Couve Census — real-time patient census with filtering by state, level of care, and group", clipped: true },
      { src: "/images/couve/attendance.png", alt: "Couve Attendance — virtual IOP attendance tracking with AM/PM group management", clipped: true },
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
    embedUrl: "https://chad-pearl.vercel.app",
    thumb: "/images/chad/title.png",
    imagePlaceholders: [],
  },
  {
    slug: "awqat",
    title: "AWQAT",
    subtitle: "A Retro-Pixel Prayer Clock That Computes Its Own Sky",
    context:
      "Most prayer-time apps are thin clients for somebody else's API — they phone home for a timetable, wrap it in ads, and go blank on airplane mode. But prayer times aren't a database; they're astronomy. The sun's position is a closed-form calculation that's been solvable with pencil and paper for centuries.",
    problem:
      "Fajr begins when the sun is a fixed angle below the horizon. Dhuhr is solar noon. Asr is a shadow-length ratio. Maghrib is sunset; Isha, deeper twilight. Given a date and coordinates, all five fall out of the solar declination and the equation of time — so why does checking them require a network connection, a tracking consent dialog, and somebody's server staying up?",
    built:
      "A vanilla-JavaScript web app with zero runtime dependencies — 18 KB gzipped — that computes all five prayers locally under seven calculation methods, then drives a living pixel sky from the same solar engine: the sun arcs on its true schedule, the palette blends through dawn and dusk, and the moon renders at its real lunar phase. Alongside the clock: a dual Gregorian/Hijri calendar with a year-long dawn–dusk chart, and a step-by-step Learn mode that walks each prayer posture-by-posture with per-line Arabic audio. Seven headless test suites drive the real module end to end.",
    matters:
      "It's an argument for local-first software: when the computation is centuries old and fits in your pocket, the respectful move is to do it on-device — offline, private, and explained. Every time on screen carries its astronomical definition, and every view carries its own disclaimer deferring to the local masjid. The app can always answer why.",
    extra: {
      label: "The Living Sky",
      text: "The clock face is the sky itself. The same engine that sets the times positions a pixel sun along its computed arc, blends the palette through the day's phases, lights the mosque windows at dusk, and draws the moon at its real synodic phase — calculated, never canned.",
    },
    thumb: "/images/awqat/today.png",
    images: [
      { src: "/images/awqat/today.png", alt: "AWQAT Today view — pixel mosque under an afternoon sky, countdown to Maghrib, five prayer cards with times and astronomical definitions" },
      { src: "/images/awqat/sky-maghrib.png", alt: "The sky scene moments before Maghrib — sun touching the horizon, countdown at 2:59" },
      { src: "/images/awqat/year.png", alt: "Year view — dawn-to-dusk chart showing seasonal drift of night, twilight, and daylight, with important Islamic dates", clipped: true },
      { src: "/images/awqat/learn-sujud.png", alt: "Learn mode — pixel figure in sujud with the tasbih line in Arabic, transliteration, and English" },
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
      { src: "/images/paper-cannon/newsroom.png", alt: "Paper Cannon Writer's Room GUI — pixel-art interface showing agents in the Challenge phase" },
      { src: "/images/paper-cannon/architecture.svg", alt: "Paper Cannon pipeline architecture — 14-agent multi-agent research synthesis system" },
      { src: "/images/paper-cannon/stacks.png", alt: "The Stacks — pre-flight phase extracting thesis, scope, claims, and correction candidates", clipped: true },
      { src: "/images/paper-cannon/distillation.png", alt: "Chat log distillation — session dynamics, counter-arguments, and trigger candidates", clipped: true },
    ],
    imagePlaceholders: [],
  },
  {
    slug: "going-train",
    title: "The Going Train",
    subtitle: "A Hand-Drawn Clock Blueprint, Run and Audited by AI",
    thumb: "/images/going-train/card.png",
    href: "/work/going-train",
    playUrl: "/going-train/index.html",
    context:
      "Seven years ago \u2014 no client, no deadline \u2014 I hand-drew a complete clock movement to understand it: six subsystems, every gear at its true tooth count, the ratios carried in the layer names. This year I handed the file to an AI.",
    problem:
      "Can a drawing be a spec? If the artifact is rigorous enough, a machine should be able to run it \u2014 and running it becomes an audit, catching errors a still image can hide for years.",
    built:
      "The blueprint's own linework, animated as a working movement: pallet contacts, lever throw, and escapement timing all measured out of the drawing \u2014 the two hand-drawn 'ghost' overlays turned out to be exact keyframes \u2014 with a tick synthesized at the instant each tooth lands on its jewel.",
    matters:
      "The audit came back with a bill: a pendulum variant physics prices at 4 cm long, and pallet jewels drawn 54\u00b0 apart where the geometry wants 60\u00b0 \u2014 so the second hand limps \u00b10.4\u00b0 per tick. Both kept, both labeled. A spec you can bill against is the whole point of a spec.",
    extra: {
      label: "The Fix",
      text: "How a grandfather clock pays that bill: remove a wheel. A 30-tooth escape turns once per minute and carries the second hand itself, the beat slows to one per second, and the pendulum becomes the 994 mm seconds pendulum \u2014 the reason longcase clocks are as tall as their owners.",
    },
    images: [
      { src: "/images/going-train/sheet.png", alt: "The full hand-drawn clock blueprint \u2014 six labeled subsystems in white and gold linework on blueprint blue", clipped: true },
    ],
    imagePlaceholders: [],
  },
];
