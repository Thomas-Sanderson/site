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
      <body className="min-h-full flex flex-col">
        {/* Reset scroll before React hydrates — prevents Chrome iOS from
            restoring a stale scroll position that collapses the Gantt */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(history.scrollRestoration)history.scrollRestoration='manual';window.scrollTo(0,0);",
          }}
        />
        {/* Notch cover — opaque cream behind the status bar on notch devices.
            theme-color only tints the static bar; this blocks content bleed during scroll. */}
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
