export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  flagship?: boolean;
  context: string;
  problem: string;
  built: string;
  matters: string;
  extra?: { label: string; text: string };
  images?: { src: string; alt: string; clipped?: boolean }[];
  imagePlaceholders: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "melody",
    title: "Melody",
    subtitle: "Deterministic LLM Chatbot for Healthcare Admissions",
    context:
      "A behavioral health organization needed a patient-facing chatbot for their admissions website — handling sensitive mental health and addiction inquiries with PHI compliance requirements.",
    problem:
      "Most LLM chatbots hallucinate, can't handle PHI safely, and don't know when to escalate to a human. In healthcare admissions, a wrong answer or a privacy violation isn't a bug — it's a liability.",
    built:
      "A 954-line conversational flow specification with state machine architecture. Deterministic routing with LLM flexibility where appropriate. PHI compliance gaps identified and remediated. Guardrails that actually guard.",
    matters:
      'This is what responsible AI deployment looks like in a regulated environment — not "we added ChatGPT to our website" but a system designed to know what it doesn\'t know.',
    imagePlaceholders: ["architecture diagram / flow excerpt"],
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
    imagePlaceholders: ["screenshots / mockups"],
  },
  {
    slug: "paper-cannon",
    title: "Paper Cannon",
    subtitle: "Multi-Agent Research Synthesis Pipeline",
    flagship: true,
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
];
