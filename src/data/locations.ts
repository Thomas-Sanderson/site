export type LocationCategory =
  | "work"
  | "art"
  | "volunteer"
  | "travel"
  | "want-to-visit";

export interface Location {
  city: string;
  country: string;
  lat: number;
  lng: number;
  category: LocationCategory;
  industries?: string[];
  dateRange?: string;
  description?: string;
}

export const categoryMeta: Record<
  LocationCategory,
  { label: string; color: string }
> = {
  work: { label: "Work", color: "#C4725A" },
  art: { label: "Make", color: "#7B5EA7" },
  volunteer: { label: "Volunteer", color: "#2A6B5A" },
  travel: { label: "Travel", color: "#5A8FC4" },
  "want-to-visit": { label: "Want to Visit", color: "#A89F95" },
};

export const locations: Location[] = [
  // EDUCATION
  {
    city: "New York City",
    country: "USA",
    lat: 40.8075,
    lng: -73.9626,
    category: "work",
    dateRange: "2010–2014",
    industries: ["Education"],
    description: "Columbia University — B.A. Sustainable Development, Biology concentration",
  },

  // WORK — McKinsey travel (2013–2019)
  {
    city: "San Francisco",
    country: "USA",
    lat: 37.7749,
    lng: -122.4194,
    category: "work",
    dateRange: "2014–2019",
    industries: ["Consumer Banking", "Utilities", "Healthcare"],
    description: "McKinsey — enterprise consulting across banking, utilities, and health systems",
  },
  {
    city: "New York City",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    category: "work",
    dateRange: "2013–2014",
    industries: ["Investment Banking", "Entertainment", "Venture Capital"],
    description: "McKinsey — investment banking platforms, entertainment, and venture capital",
  },
  {
    city: "Antwerp",
    country: "Belgium",
    lat: 51.2194,
    lng: 4.4025,
    category: "work",
    dateRange: "2017",
    industries: ["Lean Management"],
    description: "McKinsey — lean management transformation for European operations",
  },
  {
    city: "São Paulo",
    country: "Brazil",
    lat: -23.5505,
    lng: -46.6333,
    category: "work",
    dateRange: "2015",
    industries: ["Consumer Banking"],
    description: "McKinsey — consumer banking experience design",
  },
  {
    city: "Boulder",
    country: "USA",
    lat: 40.015,
    lng: -105.2705,
    category: "work",
    dateRange: "2016",
    industries: ["Agriculture"],
    description: "McKinsey — agricultural technology and operations",
  },
  {
    city: "Toronto",
    country: "Canada",
    lat: 43.6532,
    lng: -79.3832,
    category: "work",
    dateRange: "2015",
    industries: ["Consumer Banking"],
    description: "McKinsey — consumer banking for Canadian financial institutions",
  },
  {
    city: "Bangalore",
    country: "India",
    lat: 12.9716,
    lng: 77.5946,
    category: "work",
    dateRange: "2018",
    industries: ["Lean Management"],
    description: "McKinsey — lean management consulting",
  },
  {
    city: "Little Rock",
    country: "USA",
    lat: 34.7465,
    lng: -92.2896,
    category: "work",
    dateRange: "2016",
    industries: ["Agriculture"],
    description: "McKinsey — agricultural industry technology",
  },
  {
    city: "Indianapolis",
    country: "USA",
    lat: 39.7684,
    lng: -86.1581,
    category: "work",
    dateRange: "2017",
    industries: ["Lean Management"],
    description: "McKinsey — lean management for Midwest operations",
  },
  {
    city: "Minneapolis",
    country: "USA",
    lat: 44.9778,
    lng: -93.265,
    category: "work",
    dateRange: "2016",
    industries: ["Life Insurance", "Credit Unions"],
    description: "McKinsey — life insurance and credit union product design",
  },
  {
    city: "Atlanta",
    country: "USA",
    lat: 33.749,
    lng: -84.388,
    category: "work",
    dateRange: "2018",
    industries: ["Home Services"],
    description: "McKinsey — home services marketplace design",
  },
  {
    city: "Stamford",
    country: "USA",
    lat: 41.0534,
    lng: -73.5387,
    category: "work",
    dateRange: "2015",
    industries: ["Banking"],
    description: "McKinsey — banking technology consulting",
  },

  // WORK — Post-McKinsey
  {
    city: "Sunnyvale",
    country: "USA",
    lat: 37.3688,
    lng: -122.0363,
    category: "work",
    dateRange: "2019–2020",
    industries: ["Data Management"],
    description: "Workforce Logiq (NetApp) — enterprise data management platforms",
  },
  {
    city: "Austin",
    country: "USA",
    lat: 30.2672,
    lng: -97.7431,
    category: "work",
    dateRange: "2023–2024",
    industries: ["Behavioral Health"],
    description: "Recovery Unplugged — clinical operations and facility management",
  },
  {
    city: "Fort Lauderdale",
    country: "USA",
    lat: 26.1224,
    lng: -80.1373,
    category: "work",
    dateRange: "2025–present",
    industries: ["Behavioral Health", "LLM Chatbots"],
    description: "Recovery Unplugged — EMR design and LLM chatbot architecture for admissions",
  },

  // ART
  {
    city: "Porto",
    country: "Portugal",
    lat: 41.1579,
    lng: -8.6291,
    category: "art",
    dateRange: "2021–2023",
    description: "Two years of independent art practice and guest house work",
  },
  {
    city: "Barcelona",
    country: "Spain",
    lat: 41.3874,
    lng: 2.1686,
    category: "art",
    dateRange: "2014",
    description: "Brand and digital strategy for Tipic i Catala wine shop",
  },

  // VOLUNTEER
  {
    city: "Panama City",
    country: "Panama",
    lat: 8.9824,
    lng: -79.5199,
    category: "volunteer",
    dateRange: "2012",
    industries: ["Environmental"],
    description: "Environmental conservation volunteer work",
  },

  // TRAVEL
  {
    city: "Belize City",
    country: "Belize",
    lat: 17.4986,
    lng: -88.1886,
    category: "travel",
    dateRange: "2013",
  },
  {
    city: "Mexico City",
    country: "Mexico",
    lat: 19.4326,
    lng: -99.1332,
    category: "travel",
    dateRange: "2019",
  },
  {
    city: "Marrakech",
    country: "Morocco",
    lat: 31.6295,
    lng: -7.9811,
    category: "travel",
    dateRange: "2022",
  },
  {
    city: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    category: "travel",
    dateRange: "2022",
  },
  {
    city: "Edinburgh",
    country: "Scotland",
    lat: 55.9533,
    lng: -3.1883,
    category: "travel",
    dateRange: "2022",
  },
  {
    city: "Copenhagen",
    country: "Denmark",
    lat: 55.6761,
    lng: 12.5683,
    category: "travel",
    dateRange: "2022",
  },
  {
    city: "Stockholm",
    country: "Sweden",
    lat: 59.3293,
    lng: 18.0686,
    category: "travel",
    dateRange: "2022",
  },
  {
    city: "Havana",
    country: "Cuba",
    lat: 23.1136,
    lng: -82.3666,
    category: "travel",
    dateRange: "2016",
  },
  {
    city: "Basseterre",
    country: "St. Kitts",
    lat: 17.3026,
    lng: -62.7177,
    category: "travel",
    dateRange: "2015",
  },
];
