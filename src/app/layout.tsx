import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#F5F0EB",
};

export const metadata: Metadata = {
  title: "Thomas — Design Technologist",
  description:
    "Portfolio of Thomas, a Design Technologist building at the intersection of design, healthcare, and AI.",
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
