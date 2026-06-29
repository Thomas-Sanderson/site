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

// Curated to tell the design → behavioral-health story without a pile of
// generic dev skills.
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
    ],
  },
  {
    category: "Domain & Operations",
    skills: [
      "Behavioral Health",
      "Healthcare",
      "EMR / EHR Systems",
      "Case Management",
      "Insurance Verification",
      "Lean Management",
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
