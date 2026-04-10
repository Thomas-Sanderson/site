export const siteConfig = {
  name: "Thomas",
  title: "Design Technologist",
  email: "holler@thomasdesigns.xyz",
  navItems: [
    { label: "Employment", href: "#gantt-sentinel" },
    { label: "World", href: "#map" },
    { label: "Eras", href: "#era-consulting" },
    { label: "Case Studies", href: "#case-studies" },
    { label: "Resume", href: "#resume" },
  ],
  colors: {
    cream: "#F5F0EB",
    charcoal: "#2D2A26",
    terracotta: "#C4725A",
    teal: "#2A6B5A",
    muted: "#A89F95",
  },
  footer: {
    builtWith: "Built in a weekend with Claude Code",
  },
} as const;
