export const siteConfig = {
  name: "Thomas",
  title: "Design Technologist",
  email: "holler@thomasdesigns.xyz",
  navItems: [
    { label: "Story", href: "/" },
    { label: "Case Studies", href: "/work" },
    { label: "Resume", href: "/resume" },
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
