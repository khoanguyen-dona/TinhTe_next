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
  },
  typescript: {  
    ignoreBuildErrors: true,
  },

};

export default nextConfig;
