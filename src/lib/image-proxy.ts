import { ImageProps } from "next/image";

export function deriveImageParams(props: Partial<ImageProps>) {
    let w = props.width ? Number(props.width) : undefined;
    const h = props.height ? Number(props.height) : undefined;

    // Handle Aspect Ratio logic...
    if (!w && h && props.style?.aspectRatio) {
        const ratioString = String(props.style.aspectRatio);
        let ratio = 1;
        if (ratioString.includes('/')) {
            const [num, den] = ratioString.split('/').map(Number);
            if (den !== 0) ratio = num / den;
        } else {
            ratio = Number(ratioString);
        }
        if (!isNaN(ratio)) w = Math.round(h * ratio);
    }

    if (props.fill && !w) w = 800; // Default fill width
    if (!w) w = 800;

    let q = 75;
    if (props.quality) {
        q = Number(props.quality);
    } else {
        if (w <= 400) q = 90;
        else if (w <= 800) q = 85;
        else if (w <= 1600) q = 80;
        else q = 75;

        if (props.fill && !props.sizes) q = Math.min(q, 70);
    }

    return { w, h, q };
}

export function getProxyUrl(src: string, options: { width?: number; height?: number; quality?: number } = {}) {
    if (!src || src.startsWith('/') || src.startsWith('blob:')) return src;

    const { width, height, quality } = options;
    const params = new URLSearchParams();

    params.append('url', src);

    if (width && width > 0) params.append('w', width.toString());
    if (height && height > 0) params.append('h', height.toString());

    // Important: If both width and height are present, tell wsrv to 'cover' 
    // (crop) instead of stretch
    if (width && height) params.append('fit', 'cover');

    if (quality) params.append('q', quality.toString());

    params.append('output', 'webp');

    return `https://wsrv.nl/?${params.toString()}`;
}