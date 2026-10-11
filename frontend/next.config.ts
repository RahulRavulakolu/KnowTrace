import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/neural.html',
      },
    ];
  },
};

export default nextConfig;
