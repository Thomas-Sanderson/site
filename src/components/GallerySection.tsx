"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import galleryData from "@/data/gallery.json";

interface GalleryImage {
  slug: string;
  cropped: string;
  width: number;
  height: number;
  location?: string;
  date?: string;
}

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const images = galleryData as GalleryImage[];

  return (
    <section
      id="see"
      ref={sectionRef}
      className="reveal px-6 md:px-12 py-24 max-w-[1200px] mx-auto"
    >
      <p
        className="font-mono text-sm tracking-widest uppercase mb-16"
        style={{ color: "var(--color-terracotta)" }}
      >
        See
      </p>

      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {images.map((img) => (
          <div
            key={img.slug}
            className="break-inside-avoid group relative overflow-hidden rounded-lg"
          >
            <Image
              src={`/images/gallery/${img.cropped}`}
              alt={img.slug.replace(/-/g, " ")}
              width={img.width}
              height={img.height}
              className={`w-full h-auto transition-all duration-700 ${
                loaded.has(img.slug)
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-[1.02]"
              } group-hover:scale-[1.03]`}
              onLoad={() =>
                setLoaded((prev) => new Set(prev).add(img.slug))
              }
            />
            {img.location && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-mono text-xs text-white/90">
                  {img.location}
                </p>
                {img.date && (
                  <p className="font-mono text-[10px] text-white/60">
                    {img.date}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
