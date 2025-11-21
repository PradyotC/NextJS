import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',// This hostname must be image.tmdb.org to serve images
        hostname: 'image.tmdb.org', 
        port: '',// This pathname allows all size variations from TMDB
        pathname: '/t/p/**', 
      },
    ],
  },
};

export default nextConfig;