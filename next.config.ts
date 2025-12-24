import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lo puedes dejar si lo estás usando
  cacheComponents: true,

  images: {
    // Permite usar quality={95} sin warnings
    qualities: [60, 70, 75, 80, 85, 90, 95, 100],
  },
};

export default nextConfig;
