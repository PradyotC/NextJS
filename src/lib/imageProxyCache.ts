// src/lib/imageProxyCache.ts
type CacheEntry = {
  src: string;       // proxy URL or fallback
  expiresAt: number; // ms epoch
};

const CACHE_PREFIX = "imgproxy:";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function getCacheKey(originalUrl: string) {
  return `${CACHE_PREFIX}${originalUrl}`;
}

export function readProxyCache(originalUrl: string): CacheEntry | null {
  try {
    const v = localStorage.getItem(getCacheKey(originalUrl));
    if (!v) return null;
    const parsed: CacheEntry = JSON.parse(v);
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (parsed.expiresAt < Date.now()) {
      // expired
      localStorage.removeItem(getCacheKey(originalUrl));
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn("Failed to read image proxy cache", e);
    return null;
  }
}

export function writeProxyCache(originalUrl: string, src: string, ttlMs = DEFAULT_TTL_MS) {
  try {
    const entry: CacheEntry = { src, expiresAt: Date.now() + ttlMs };
    localStorage.setItem(getCacheKey(originalUrl), JSON.stringify(entry));
  } catch (e) {
    console.warn("Failed to write image proxy cache", e);
  }
}

export function clearProxyCache(originalUrl: string) {
  try {
    localStorage.removeItem(getCacheKey(originalUrl));
  } catch {}
}
