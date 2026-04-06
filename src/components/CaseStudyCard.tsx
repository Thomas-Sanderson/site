"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CaseStudy } from "@/data/caseStudies";

export default function CaseStudyCard({ study }: { study: CaseStudy }) {
  const ref = useRef<HTMLDivElement>(null);
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [modalAlt, setModalAlt] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!modalSrc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalSrc(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [modalSrc]);

  const openModal = useCallback((src: string, alt: string) => {
    setModalSrc(src);
    setModalAlt(alt);
  }, []);

  const fullImages = study.images?.filter((img) => !img.clipped) || [];
  const clippedImages = study.images?.filter((img) => img.clipped) || [];

  return (
    <>
      <div
        ref={ref}
        className={`reveal ${
          study.flagship ? "p-0 sm:p-8 md:p-12 sm:rounded-2xl sm:bg-warm-white sm:ring-1 sm:ring-charcoal/5" : ""
        }`}
      >
        {study.flagship && (
          <span
            className="inline-block font-mono text-xs uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{
              backgroundColor: "rgba(196, 114, 90, 0.1)",
              color: "var(--color-terracotta)",
            }}
          >
            Flagship Project
          </span>
        )}

        <h3 className="font-serif text-3xl md:text-4xl font-bold mb-1">
          {study.title}
        </h3>
        <p
          className="font-mono text-sm mb-8"
          style={{ color: "var(--color-muted)" }}
        >
          {study.subtitle}
        </p>

        <div className="grid gap-8 md:gap-10">
          <Block label="Context" text={study.context} />
          <Block label="Problem" text={study.problem} />
          <Block label="What I Built" text={study.built} />
          <Block label="Why It Matters" text={study.matters} />

          {study.extra && (
            <div
              className="rounded-xl p-6 mt-2"
              style={{ backgroundColor: "rgba(42, 107, 90, 0.06)" }}
            >
              <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-teal)" }}>
                {study.extra.label}
              </p>
              <p className="text-base leading-relaxed">{study.extra.text}</p>
            </div>
          )}

          {/* Videos */}
          {study.videos && study.videos.length > 0 && (
            <div className="grid gap-4">
              {study.videos.map((vid) => (
                <video
                  key={vid.src}
                  src={vid.src}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full border"
                  style={{ borderColor: "rgba(45, 42, 38, 0.08)" }}
                />
              ))}
            </div>
          )}

          {fullImages.length > 0 && (
            <div className="grid gap-4">
              {fullImages.map((img) => (
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  className="w-full border cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ borderColor: "rgba(45, 42, 38, 0.08)" }}
                  onClick={() => openModal(img.src, img.alt)}
                />
              ))}
            </div>
          )}

          {clippedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {clippedImages.map((img) => (
                <div
                  key={img.src}
                  className="border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    borderColor: "rgba(45, 42, 38, 0.08)",
                    aspectRatio: "1",
                  }}
                  onClick={() => openModal(img.src, img.alt)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover object-left-top"
                  />
                </div>
              ))}
            </div>
          )}

          {study.imagePlaceholders.length > 0 && (
            <div className={`grid gap-4 ${study.imagePlaceholders.length > 1 ? "md:grid-cols-2" : ""}`}>
              {study.imagePlaceholders.map((label) => (
                <div
                  key={label}
                  className="rounded-xl border-2 border-dashed flex items-center justify-center min-h-[200px]"
                  style={{ borderColor: "var(--color-muted)" }}
                >
                  <p className="font-mono text-sm text-center px-4" style={{ color: "var(--color-muted)" }}>
                    {label}
                    <br />
                    <span className="text-xs opacity-60">
                      /public/images/{study.slug}/
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={() => setModalSrc(null)}
        >
          <img
            src={modalSrc}
            alt={modalAlt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p
        className="font-mono text-xs uppercase tracking-widest mb-2"
        style={{ color: "var(--color-terracotta)" }}
      >
        {label}
      </p>
      <p className="text-base md:text-lg leading-relaxed">{text}</p>
    </div>
  );
}
