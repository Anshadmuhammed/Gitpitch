import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
