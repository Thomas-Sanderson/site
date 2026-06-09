"use client";

import { usePathname } from "next/navigation";

export default function ContentFade() {
  const pathname = usePathname();
  if (pathname === "/chad") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px))",
        left: 0,
        right: 0,
        height: "80px",
        background: "linear-gradient(to bottom, #F5F0EB 30%, transparent)",
        zIndex: 43,
        pointerEvents: "none",
      }}
    />
  );
}
