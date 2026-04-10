export interface Era {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  narrative: string[];
  color: string;
  companies: string[];
  caseStudySlugs?: string[];
  galleryFilter?: string;
}

export const eras: Era[] = [
  {
    id: "consulting",
    title: "Consulting",
    subtitle: "Enterprise design at global scale",
    dateRange: "2013–2019",
    narrative: [
      "I started my career at the intersection of design and strategy — first at Columbia, then through a series of roles that took me from startup pitch decks to McKinsey engagement rooms. Over six years I designed digital products for the world's largest banks, insurers, manufacturers, and healthcare systems. The work was rigorous: mixed-methods research translated into personas, service journeys, and prototypes that had to survive scrutiny from partners and C-suites.",
      "By the time I left as Associate Design Director, I'd learned how to build client-side design capability from scratch — research ops, training programs, playbooks. I'd also learned that the most interesting design problems aren't in boardrooms. They're wherever the systems are most broken and the stakes are highest.",
    ],
    color: "#C4725A",
    companies: [
      "Columbia University",
      "Scout Ventures",
      "Tipic i Catala",
      "McKinsey & Company",
      "Greyt Solutions LLC",
      "Workforce Logiq (NetApp)",
    ],
  },
  {
    id: "art",
    title: "Art + Independence",
    subtitle: "Making things with my hands in Portugal",
    dateRange: "2019–2023",
    narrative: [
      "After nearly a decade in consulting, I left the US to make art in Porto. I carved wood, shaped metal, designed websites for local businesses, and built 3D-audio experiences with artists like Mary J. Blige and the Prince estate. I worked a hostel front desk to practice Portuguese and stay close to the neighborhood.",
      "This wasn't a sabbatical — it was a deliberate reset. I wanted to understand what I could build when I wasn't constrained by client briefs and sprint cycles. The answer: sculptures, jewelry, digital works, physical exhibitions, and a creative practice that still informs how I approach design problems today.",
    ],
    color: "#7B5EA7",
    companies: [
      "Soul In The Horn",
      "Self-employed",
      "Casa Bonjardim Guest House Porto",
    ],
    galleryFilter: "Porto",
  },
  {
    id: "behavioral-health",
    title: "Behavioral Health",
    subtitle: "From the clinical floor to the systems behind it",
    dateRange: "2023–2025",
    narrative: [
      "I came back to the US and went straight to the hardest environment I could find: residential addiction treatment. I started as a Behavioral Health Technician — taking vitals, running groups, doing crisis de-escalation. Within months I was leading the BHT team, then running day-to-day facility operations as Operations Manager.",
      "What I saw from the inside was a system held together with workarounds. EMRs designed for billing, not care. Intake processes that lost patients in the gap between phone call and admission. Staff burning out on paperwork that didn't make anyone healthier. I didn't just observe these problems — I lived them. That's the difference between designing for healthcare and designing from within it.",
    ],
    color: "#2A6B5A",
    companies: ["Recovery Unplugged"],
  },
  {
    id: "acceleration",
    title: "Acceleration",
    subtitle: "Building what the industry doesn't have yet",
    dateRange: "2025–present",
    narrative: [
      "Everything converged \u2014 the consulting rigor, the creative instinct, the clinical domain knowledge, and a set of tools that finally close the gap between \u201cI see the problem\u201d and \u201chere\u2019s a working demo.\u201d",
      "I\u2019ve been exploring what becomes possible when you treat LLMs as deterministic components inside well-scoped systems rather than as the system itself. Sudsy reimagines behavioral health EMR workflows from the patient and clinician experience outward. Gab is a care navigator for healthcare admissions that stays inside its rails \u2014 no hallucination, no PHI exposure. Paper Cannon is a multi-agent research synthesis pipeline with adversarial quality control built into the process, not bolted on after.",
      "The interesting part isn\u2019t the building. It\u2019s that the risks and assumptions designers would have flagged in a problem-solving session ten years ago are now testable in real time.",
    ],
    color: "#C4725A",
    companies: ["Recovery Unplugged (Consultant)", "Recovery Unplugged"],
  },
];
