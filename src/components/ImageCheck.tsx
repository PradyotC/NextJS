"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/image-hosts";
import useProxySrc from "@/hooks/useProxySrc";

/** fallback path in /public */
const NO_IMAGE_PUBLIC_PATH = "/noImage.svg";

/** Utility: safely extract hostname from a URL string */
function getHostname(rawUrl?: string | null) {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return null;
  }
}

type ImageWithChecksProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  forceUnoptimized?: boolean;
  wrapperClassName?: string;
  imgClassName?: string;
};

const ImageWithChecks: React.FC<ImageWithChecksProps> = ({
  src,
  alt,
  forceUnoptimized = false,
  wrapperClassName,
  imgClassName,
  ...nextImageProps
}) => {
  const initSrc = src && typeof src === "string" ? src : NO_IMAGE_PUBLIC_PATH;

  // Decide whether the original host is allowed
  const hostname = getHostname(initSrc);
  const hostAllowed = hostname ? ALLOWED_IMAGE_HOSTS.includes(hostname as any) : false;

  // IMPORTANT: call hook at top-level (not conditionally)
  // The hook will attempt to validate/provide a proxy URL for initSrc (it may be cached).
  // We will only *use* the proxy result when hostAllowed === false.
  const proxyResp = useProxySrc(initSrc /*, ttlMs? */);

  // If host is allowed, we can use the original initSrc directly.
  // If host is NOT allowed, we will use the proxyResp.src (which should be a relative /api/image?...) as finalSrc.
  const finalSrc = hostAllowed ? initSrc : (proxyResp.src ?? NO_IMAGE_PUBLIC_PATH);

  // unoptimized should only be forced if the caller asked for it.
  // When using the proxy (same-origin), Next can still optimize. So we only use `forceUnoptimized`.
  const shouldUnopt = forceUnoptimized || !hostAllowed;

  // --- Wrapper Class Logic ---
  const usingFill = Boolean(nextImageProps.fill);
  const defaultWrapperClass = usingFill ? "relative w-full h-44" : "";
  const wrapperCls = [defaultWrapperClass, wrapperClassName].filter(Boolean).join(" ");

  // LOADING state: only relevant when we need proxy and that proxy is still loading
  if (!hostAllowed) {
    if (proxyResp.loading || !proxyResp.src) {
      return <div className={wrapperCls} aria-label="Loading image..." />;
    }
  }

  // // Optional logging (keeps your previous debug logs)
  // console.log("hostname: ", hostname);
  // console.log("hostAllowed: ", hostAllowed);
  // console.log("finalSrc: ", {"finalSrc":finalSrc});
  // console.log("shouldUnopt", shouldUnopt);

  return (
    <div className={wrapperCls}>
      <Image
        src={finalSrc}
        alt={alt}
        {...nextImageProps}
        unoptimized={shouldUnopt}
        className={imgClassName}
      />
    </div>
  );
};

export default ImageWithChecks;
