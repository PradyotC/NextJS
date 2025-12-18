import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // We only need to allow our own domain and the proxy service
    // if we ever want Next.js to touch them. Otherwise, leave empty 
    // or very minimal.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;