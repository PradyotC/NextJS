import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/image-hosts";
import { RemotePattern } from "next/dist/shared/lib/image-config";

const remotePatterns:RemotePattern[] = ALLOWED_IMAGE_HOSTS.map((hostname) => ({
  protocol: "https",
  hostname,
  // optional pathname: allow everything by default or narrow as needed:
  pathname: "/**",
}));

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns,
  },
};

export default nextConfig;