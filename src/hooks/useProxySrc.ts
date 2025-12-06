import { useEffect, useState } from "react";
import { readProxyCache, writeProxyCache } from "@/lib/imageProxyCache";

type UseProxySrcResult = {
  src: string | null;
  loading: boolean;
  error?: string | null;
};

export default function useProxySrc(originalUrl?: string | null, ttlMs?: number): UseProxySrcResult {
  // Start with null to avoid running cache read during SSR
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!originalUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalUrl) {
      setSrc(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Try to read cache only on client
    const cached = readProxyCache(originalUrl);
    if (cached) {
      setSrc(cached.src);
      setLoading(false);
      return;
    }

    let mounted = true;
    async function validateOnce() {
      setLoading(true);
      try {
        const res = await fetch(`/api/image?url=${encodeURIComponent(originalUrl||"")}&mode=validate`);
        if (!res.ok) throw new Error(`Validate fetch failed: ${res.status}`);
        const json = await res.json();
        const candidateSrc = json?.src ?? "/noImage.svg";
        writeProxyCache(originalUrl||"", candidateSrc, ttlMs);
        if (!mounted) return;
        setSrc(candidateSrc);
        setError(null);
      } catch (err: any) {
        console.error("image validate error", err);
        if (!mounted) return;
        setError(String(err?.message ?? err));
        writeProxyCache(originalUrl||"", "/noImage.svg", 60 * 60 * 1000); // short TTL on error (1h)
        setSrc("/noImage.svg");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    validateOnce();
    return () => {
      mounted = false;
    };
  }, [originalUrl, ttlMs]);

  return { src, loading, error };
}
