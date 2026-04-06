import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Thomas — Design Technologist",
  description:
    "Portfolio of Thomas, a Design Technologist building at the intersection of design, healthcare, and AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* Notch cover — real DOM element because iOS Safari breaks position:fixed on pseudo-elements */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "env(safe-area-inset-top, 0px)",
            backgroundColor: "#F5F0EB",
            zIndex: 9998,
            pointerEvents: "none",
          }}
        />
        {children}
      </body>
    </html>
  );
}
