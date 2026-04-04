export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
  location: string;
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Design",
    skills: [
      "User Research",
      "Service Design",
      "Interaction Design",
      "Prototyping",
      "Design Systems",
      "Figma",
      "Adobe Creative Suite",
    ],
  },
  {
    category: "Engineering",
    skills: [
      "TypeScript",
      "React / Next.js",
      "Node.js",
      "Python",
      "D3.js",
      "HTML / CSS",
      "Git",
      "Vercel",
    ],
  },
  {
    category: "AI / ML",
    skills: [
      "LLM Architecture",
      "Prompt Engineering",
      "Multi-Agent Systems",
      "Deterministic AI Pipelines",
      "Claude / OpenAI APIs",
    ],
  },
  {
    category: "Domain",
    skills: [
      "Behavioral Health Operations",
      "EMR / EHR Systems",
      "Healthcare Compliance",
      "Addiction Treatment",
      "Intake & Admissions",
      "VOB / PFR Estimation",
    ],
  },
];

export const education: Education[] = [
  {
    institution: "Columbia University",
    degree: "B.A. Sustainable Development, Biology concentration",
    year: "2014",
    location: "New York, NY",
  },
];
