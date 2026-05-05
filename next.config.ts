import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
