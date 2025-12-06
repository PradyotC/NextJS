// lib/image-hosts.ts
export const ALLOWED_IMAGE_HOSTS = [
  "image.tmdb.org",
  "usercontent.jamendo.com",
  // add any other hosts you want to allow optimized handling for
] as const;

export type AllowedImageHost = (typeof ALLOWED_IMAGE_HOSTS)[number];