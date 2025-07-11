import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images:{
    remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
      ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  }

};

export default nextConfig;
