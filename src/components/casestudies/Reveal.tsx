"use client";

import { useReveal } from "@/lib/useReveal";

/**
 * Scroll-reveal wrapper for case-study sections. Defaults to VISIBLE (see
 * useReveal) so a blocked/failed JS load never leaves a blank page — it only
 * arms the entrance animation once React is alive and the block is below the
 * fold.
 */
export default function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "none" : "translateY(16px)",
        transition: "opacity .6s ease, transform .6s ease",
      }}
    >
      {children}
    </Tag>
  );
}
