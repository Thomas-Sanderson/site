"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import Footer from "./Footer";

/**
 * Site-wide chrome: persistent header on top, contact footer at the bottom,
 * wrapping every page's content. Skipped entirely on /chad (the full-screen
 * game). `children` are passed through untouched, so Server Components inside
 * stay server-rendered.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/chad" || pathname === "/curate") return <>{children}</>;

  return (
    <>
      <SiteHeader />
      {children}
      <Footer />
    </>
  );
}
