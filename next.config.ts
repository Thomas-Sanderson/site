import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading dev resources (JS chunks / HMR) when the dev server is
  // accessed from a LAN device (e.g. testing on a phone at http://10.0.0.81:3000).
  // Next 16 blocks cross-origin dev requests by default. Dev-only; no prod effect.
  allowedDevOrigins: ["10.0.0.81", "machine.local"],
  // A single rewrites() owns every clean-URL mapping. (Two separate rewrites()
  // methods in this object would silently clobber each other — the second wins.)
  async rewrites() {
    return {
      beforeFiles: [
        // Serve the self-contained interactive study at a clean /work/going-train
        // URL (matching the other case studies) instead of exposing
        // /going-train/index.html. beforeFiles runs ahead of the /work/[slug]
        // dynamic route, so this wins; the generated [slug] page stays as a
        // graceful fallback if the rewrite ever misses.
        { source: "/work/going-train", destination: "/going-train/index.html" },
      ],
      afterFiles: [
        // Hidden page: serve the static amok hero at a clean URL (not linked anywhere).
        { source: "/amok", destination: "/amok/index.html" },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/amok",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // Couve was previously "Sudsy" — keep the old case-study URL working.
  async redirects() {
    return [
      { source: "/work/sudsy", destination: "/work/couve", permanent: true },
    ];
  },
};

export default nextConfig;
