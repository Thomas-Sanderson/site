import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading dev resources (JS chunks / HMR) when the dev server is
  // accessed from a LAN device (e.g. testing on a phone at http://10.0.0.81:3000).
  // Next 16 blocks cross-origin dev requests by default. Dev-only; no prod effect.
  allowedDevOrigins: ["10.0.0.81", "machine.local"],
  // Couve was previously "Sudsy" — keep the old case-study URL working.
  async redirects() {
    return [
      { source: "/work/sudsy", destination: "/work/couve", permanent: true },
    ];
  },
};

export default nextConfig;
