export interface TimelineEntry {
  role: string;
  company: string;
  type: string;
  start: string;
  end: string;
  duration: string;
  location?: string;
  highlights?: string[];
  /** Numeric value for positioning: months from Jan 2013 */
  startMonth: number;
  endMonth: number;
}

// Month 0 = Jan 2013
function m(year: number, month: number) {
  return (year - 2013) * 12 + (month - 1);
}

export const timelineEntries: TimelineEntry[] = [
  {
    role: "B.A. Sustainable Development, Biology concentration",
    company: "Columbia University",
    type: "Education",
    start: "Sep 2010",
    end: "May 2014",
    duration: "4 yrs",
    location: "New York, NY",
    highlights: [
      "Interdisciplinary focus bridging environmental systems, biology, and design thinking",
    ],
    startMonth: m(2010, 9),
    endMonth: m(2014, 5),
  },
  {
    role: "Design Lead",
    company: "Scout Ventures",
    type: "Full-time",
    start: "Feb 2014",
    end: "Aug 2014",
    duration: "7 mos",
    location: "New York, NY",
    highlights: [
      "Designed internal transparency portal for real-time fund visibility",
      "Shipped MVP on schedule with Agile methodology",
    ],
    startMonth: m(2014, 2),
    endMonth: m(2014, 8),
  },
  {
    role: "Design Lead | Product Owner",
    company: "Tipic i Catala",
    type: "Contract",
    start: "Jun 2014",
    end: "Sep 2014",
    duration: "4 mos",
    location: "Barcelona, Spain",
    highlights: [
      "Redefined brand & digital strategy for boutique wine/gourmet shop",
      "Launched multilingual Shopify storefront with 300+ product photos",
    ],
    startMonth: m(2014, 6),
    endMonth: m(2014, 9),
  },
  {
    role: "Digital Analyst Intern — Experience Design | Product Owner",
    company: "McKinsey & Company",
    type: "Internship",
    start: "Jun 2013",
    end: "Oct 2014",
    duration: "1 yr 5 mos",
    location: "New York, NY",
    highlights: [
      "Supported discovery research and early-stage product definition",
      "Built flows, wireframes, and clickable prototypes to align stakeholders",
    ],
    startMonth: m(2013, 6),
    endMonth: m(2014, 10),
  },
  {
    role: "Designer",
    company: "McKinsey & Company",
    type: "Full-time",
    start: "Oct 2014",
    end: "Oct 2016",
    duration: "2 yrs 1 mo",
    location: "San Francisco, CA",
    highlights: [
      "Digital solutions spanning manufacturing optimization, patient adherence, and B2B sales",
      "Rapid prototyping to converge on viable designs under constraints",
    ],
    startMonth: m(2014, 10),
    endMonth: m(2016, 10),
  },
  {
    role: "Senior Designer",
    company: "McKinsey & Company",
    type: "Full-time",
    start: "Oct 2016",
    end: "Jul 2018",
    duration: "1 yr 10 mos",
    location: "San Francisco Bay Area",
    highlights: [
      "Mixed-methods research translated into personas, JTBD, and service journeys",
      "Embedded with dev teams through build; design QA to de-risk implementation",
    ],
    startMonth: m(2016, 10),
    endMonth: m(2018, 7),
  },
  {
    role: "Associate Design Director",
    company: "McKinsey & Company",
    type: "Full-time",
    start: "Jul 2018",
    end: "Aug 2019",
    duration: "1 yr 2 mos",
    location: "San Francisco, CA",
    highlights: [
      "Led cross-functional teams on regulated-industry programs (FSI, healthcare, energy)",
      "Built client-side design capability: research & design ops, training, playbooks",
    ],
    startMonth: m(2018, 7),
    endMonth: m(2019, 8),
  },
  {
    role: "Design Research Consultant",
    company: "Greyt Solutions LLC",
    type: "Contract",
    start: "Aug 2019",
    end: "Oct 2019",
    duration: "3 mos",
    location: "Remote",
    highlights: [
      "Led ethnographic due diligence for healthcare PE firm assessing cannabis testing space",
      "~30 expert interviews across lab ecosystem and supply chain",
    ],
    startMonth: m(2019, 8),
    endMonth: m(2019, 10),
  },
  {
    role: "Lead Experience Designer",
    company: "Workforce Logiq (NetApp)",
    type: "Contract",
    start: "Sep 2019",
    end: "Mar 2020",
    duration: "7 mos",
    location: "Sunnyvale, CA",
    highlights: [
      "Led design team to reimagine purchasing journey for top data storage company",
      "Hired and trained in-house design team for future iterations",
    ],
    startMonth: m(2019, 9),
    endMonth: m(2020, 3),
  },
  {
    role: "Experience Designer",
    company: "Soul In The Horn",
    type: "Freelance",
    start: "Apr 2020",
    end: "Jan 2021",
    duration: "10 mos",
    location: "New York, NY (Remote)",
    highlights: [
      "3D-audio and VR experiences with Mary J. Blige and Prince estate",
      "Redesigned website and Shopify storefront",
    ],
    startMonth: m(2020, 4),
    endMonth: m(2021, 1),
  },
  {
    role: "Visual Artist + Experience Designer",
    company: "Self-employed",
    type: "Self-employed",
    start: "Mar 2021",
    end: "Mar 2023",
    duration: "2 yrs 1 mo",
    location: "Porto, Portugal",
    highlights: [
      "Digital works, websites, and physical exhibitions for local businesses and artists",
      "Sculptures and jewelry from carved wood, shaped metal, and natural materials",
    ],
    startMonth: m(2021, 3),
    endMonth: m(2023, 3),
  },
  {
    role: "Hostel Receptionist",
    company: "Casa Bonjardim Guest House Porto",
    type: "Seasonal",
    start: "Mar 2022",
    end: "Sep 2022",
    duration: "7 mos",
    location: "Porto, Portugal",
    highlights: [
      "Front desk and guest relations at a boutique guesthouse in central Porto",
      "Practiced Portuguese daily; built relationships with local artists and shop owners",
    ],
    startMonth: m(2022, 3),
    endMonth: m(2022, 9),
  },
  {
    role: "Behavioral Health Technician",
    company: "Recovery Unplugged",
    type: "Full-time",
    start: "Jul 2023",
    end: "Sep 2023",
    duration: "3 mos",
    location: "Austin, TX",
    highlights: [
      "Direct patient care in residential addiction treatment",
      "Learned the clinical floor from the ground up — vitals, groups, crisis de-escalation",
    ],
    startMonth: m(2023, 7),
    endMonth: m(2023, 9),
  },
  {
    role: "Lead Behavioral Health Technician",
    company: "Recovery Unplugged",
    type: "Full-time",
    start: "Sep 2023",
    end: "Dec 2023",
    duration: "4 mos",
    location: "Austin, TX",
    highlights: [
      "Supervised BHT team across day/night shifts",
      "Started identifying systemic workflow gaps that would inform later design work",
    ],
    startMonth: m(2023, 9),
    endMonth: m(2023, 12),
  },
  {
    role: "Operations Manager",
    company: "Recovery Unplugged",
    type: "Full-time",
    start: "Dec 2023",
    end: "Oct 2024",
    duration: "11 mos",
    location: "Austin, TX",
    highlights: [
      "Ran day-to-day facility operations — staffing, compliance, vendor management",
      "Redesigned intake and discharge workflows to reduce patient wait times",
    ],
    startMonth: m(2023, 12),
    endMonth: m(2024, 10),
  },
  {
    role: "Virtual Case Manager",
    company: "Recovery Unplugged",
    type: "Full-time",
    start: "Oct 2024",
    end: "Nov 2025",
    duration: "1 yr 2 mos",
    location: "Remote",
    highlights: [
      "Managed caseload of 40+ patients across multiple facilities remotely",
      "Built internal tools to streamline VOB and PFR estimation processes",
    ],
    startMonth: m(2024, 10),
    endMonth: m(2025, 11),
  },
  {
    role: "Experience Designer",
    company: "Recovery Unplugged (Consultant)",
    type: "Contract",
    start: "May 2025",
    end: "Present",
    duration: "1 yr",
    location: "Virtual",
    highlights: [
      "Designing Sudsy — an end-to-end behavioral health EMR concept",
      "Architected Melody, a deterministic LLM chatbot for healthcare admissions",
    ],
    startMonth: m(2025, 5),
    endMonth: m(2026, 4),
  },
  {
    role: "Client Services Manager",
    company: "Recovery Unplugged",
    type: "Full-time",
    start: "Nov 2025",
    end: "Present",
    duration: "6 mos",
    location: "Remote",
    highlights: [
      "Overseeing client services operations across multiple treatment facilities",
      "Bridging clinical and operational teams to improve patient outcomes",
    ],
    startMonth: m(2025, 11),
    endMonth: m(2026, 4),
  },
];

/** Era labels for the gradient line */
/** Generate year ticks starting from 2013 */
function generateEras() {
  const eras: { label: string; year: string; month: number }[] = [];
  for (let y = 2013; y <= 2026; y++) {
    eras.push({ label: String(y), year: String(y), month: m(y, 1) });
  }
  return eras;
}
export const timelineEras = generateEras();

export const TIMELINE_START = m(2013, 1);
export const TIMELINE_END = m(2026, 4);
