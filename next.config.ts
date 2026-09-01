import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder photography comes from picsum.photos. Optimization is off so the
    // redirect chain to fastly does not need extra remotePatterns config.
    unoptimized: true,
  },
};

export default nextConfig;
