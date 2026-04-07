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
    category: "Domain",
    skills: [
      "Healthcare",
      "Behavioral Health",
      "Agriculture",
      "Banking",
      "Insurance",
      "EMR / EHR Systems",
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
