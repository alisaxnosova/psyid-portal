import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/start', destination: '/reno', permanent: true },
      { source: '/test',  destination: '/reno', permanent: true },
    ];
  },
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
