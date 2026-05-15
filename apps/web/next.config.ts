import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "beranang.kpm.edu.my",
      },
    ],
  },
};

export default nextConfig;
