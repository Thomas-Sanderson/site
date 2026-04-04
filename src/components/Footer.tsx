"use client";

import { useState } from "react";
import { siteConfig } from "@/data/siteConfig";

export default function Footer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <footer
      id="contact"
      className="px-6 md:px-12 py-16 max-w-[960px] mx-auto w-full"
    >
      <div
        className="border-t pt-12"
        style={{ borderColor: "rgba(45, 42, 38, 0.15)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-2">Get in touch</h2>
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-mono text-sm underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-terracotta)" }}
            >
              {siteConfig.email}
            </a>
          </div>
          <div className="text-right">
            <button
              onClick={() => setExpanded(!expanded)}
              className="font-mono text-xs hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: "var(--color-muted)" }}
            >
              {siteConfig.footer.builtWith}
              <span
                className="inline-block ml-1 transition-transform duration-300"
                style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                &#9660;
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-out"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pt-4 text-left max-w-[360px] ml-auto flex flex-col gap-3">
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    This site was built on a work machine with no admin rights. No global Node install, no sudo, no IT ticket.
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    Node runs from a portable binary in the repo. The entire dev environment fits in a folder.
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    Every push to GitHub auto-deploys to Vercel. The pipeline is: write code, commit, refresh the live URL.
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    Claude Code wrote the code in real-time — from the Gantt chart animations to the D3 map to this accordion you just opened.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
