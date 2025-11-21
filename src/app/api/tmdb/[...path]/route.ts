// app/api/tmdb/[...path]/route.ts
import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/server/prismaCache";

const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_KEY = process.env.TMDB_API_ACCESS_TOKEN;

export const runtime = "nodejs";

// TTL preset constants (seconds)
const ONE_HOUR = 3600;
const TEN_MINUTES = 600;
const ONE_YEAR = 31536000;

// Map of regex (string) => ttl seconds
// Order matters: first match wins.
const endpointTtlRules: { pattern: RegExp; ttl: number; description?: string }[] = [
  // Single-entity details -> long cache (1 year)
  { pattern: /^\/?movie\/\d+$/i, ttl: ONE_YEAR, description: "movie detail (long)" },
  { pattern: /^\/?tv\/\d+$/i, ttl: ONE_YEAR, description: "tv detail (long)" },
  { pattern: /^\/?person\/\d+$/i, ttl: ONE_YEAR, description: "person detail (long)" },

  // Lists / popular / top rated / trending -> short (1 hour)
  { pattern: /^\/?movie\/(popular|top_rated|now_playing|upcoming)$/i, ttl: ONE_HOUR, description: "movie lists" },
  { pattern: /^\/?trending\//i, ttl: ONE_HOUR, description: "trending lists" },

  // Search & discover endpoints -> shorter (10 minutes)
  { pattern: /^\/?search\//i, ttl: TEN_MINUTES, description: "search" },
  { pattern: /^\/?discover\//i, ttl: TEN_MINUTES, description: "discover" },

  // Fallback
  { pattern: /^.*$/, ttl: ONE_HOUR, description: "fallback" },
];

function getTtlForPath(path: string): number {
  // Normalize -> remove repeated leading slashes and trailing slash optionally (we want consistent matching)
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, ""); // e.g. "movie/123" or "trending/movie/week?..." (we will strip search later)
  // Test each rule against the normalized path
  for (const rule of endpointTtlRules) {
    if (rule.pattern.test("/" + normalized)) {
      return rule.ttl;
    }
  }
  // Default fallback
  return ONE_HOUR;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const prefix = "/api/tmdb";
    let finalPath = url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length)
      : url.pathname;

    if (!finalPath.startsWith("/")) finalPath = "/" + finalPath;

    // Keep the search string for the actual TMDB request & cache key
    const search = url.search ?? "";

    // For regex matching we only care about the path portion (no leading / normalization)
    const pathForMatching = finalPath; // e.g. "/movie/123" or "/movie/popular"

    // Unique cache key: path + search (so a query changes the key)
    const urlId = `${finalPath}${search}`;
    const cacheKey = `tmdb:${urlId}`;

    // Try DB cache first
    const cached = await getCached(cacheKey);
    if (cached) {
      // You can optionally log that cache hit occurred and when that cached record will expire,
      // but do not reveal TTL to client in response body.
      // (example logging omitted here)
      return NextResponse.json(cached);
    }

    // Determine TTL based on the TMDB path (server-side only)
    const chosenTtlSeconds = getTtlForPath(pathForMatching);

    // Build the TMDB API endpoint
    const endpoint = `${TMDB_BASE}${finalPath}${search}`;

    // Make the native FETCH request
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${TMDB_KEY}`,
      },
      cache: "no-store", // ensure server fetch isn't itself cached by Next/fetch
    });

    if (!response.ok) {
      throw new Error(`TMDB responded with status ${response.status}`);
    }

    const data = await response.json();

    // Save into DB cache with chosen TTL
    await setCached(cacheKey, data, chosenTtlSeconds);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("TMDB error:", error?.message ?? error);
    return NextResponse.json({ error: "TMDB fetch failed" }, { status: 500 });
  }
}