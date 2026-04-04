export const siteConfig = {
  name: "Thomas",
  title: "Design Technologist",
  email: "hello@thomas.dev",
  navItems: [
    { label: "Intro", href: "#intro" },
    { label: "Map", href: "#map" },
    { label: "Work", href: "#era-acceleration" },
    { label: "See", href: "#see" },
    { label: "Contact", href: "#contact" },
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
