"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { deriveImageParams, getProxyUrl } from "@/lib/image-proxy";

const NO_IMAGE_PUBLIC_PATH = "/noImage.svg";

type ImageWithChecksProps = Omit<ImageProps, "src"> & {
    src?: string | null;
    wrapperClassName?: string;
    imgClassName?: string;
    forceUnoptimized?: boolean; // <--- ADDED: Allow manual bypass
};

const ImageWithChecks: React.FC<ImageWithChecksProps> = ({
    src,
    alt,
    wrapperClassName,
    imgClassName,
    className,
    forceUnoptimized = false, // <--- Default false
    ...nextImageProps
}) => {
    const initialSrc = src && src.trim() !== "" ? src : NO_IMAGE_PUBLIC_PATH;
    const [imgSrc, setImgSrc] = useState(initialSrc);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const placeholderTimeout = setTimeout(() => {
            setImgSrc(initialSrc);
            setHasError(false);
        }, 0);
        return () => clearTimeout(placeholderTimeout);
    }, [src, initialSrc]);

    const isExternal = initialSrc.startsWith("http");
    let finalSrc = imgSrc;

    // FIX: Only proxy if external, no error, and NOT forced unoptimized
    if (isExternal && !hasError && !forceUnoptimized) {
        const { w, h, q } = deriveImageParams(nextImageProps);
        finalSrc = getProxyUrl(initialSrc, { width: w, height: h, quality: q });
    }

    const usingFill = Boolean(nextImageProps.fill);
    const finalImgClass = [imgClassName, className].filter(Boolean).join(" ");
    const wrapperCls = [usingFill ? "relative w-full h-full" : "", wrapperClassName].filter(Boolean).join(" ");

    return (
        <div className={wrapperCls}>
            <Image
                {...nextImageProps}
                src={finalSrc}
                alt={alt}
                className={finalImgClass}
                // We use unoptimized if it's external (handled by wsrv) OR if forced
                unoptimized={forceUnoptimized || (isExternal && !hasError)}
                onError={() => {
                    if (!hasError) {
                        setHasError(true);
                        setImgSrc(NO_IMAGE_PUBLIC_PATH);
                    }
                }}
            />
        </div>
    );
};

export default ImageWithChecks;