// src/app/api/freesound/[...path]/route.ts
import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/server/prismaCache";

const FREESOUND_BASE = process.env.FREESOUND_BASE_URL; // e.g. "https://freesound.org/apiv2"
const FREESOUND_TOKEN = process.env.FREESOUND_API_KEY;
export const runtime = "nodejs";

// TTLs (seconds)
const TTLS = {
  search: 60 * 10, // 10 minutes
  soundDetail: 60 * 60 * 24, // 24 hours
  default: 60 * 60, // 1 hour
};

// Helper: stable cache key
function buildCacheKey(path: string, params: URLSearchParams, opts?: { licenseFilter?: string }) {
  const sorted = new URLSearchParams(Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)));
  const lf = opts?.licenseFilter ? `|licenseFilter=${opts.licenseFilter}` : "";
  return `freesound:${path}?${sorted.toString()}${lf}`;
}

// Choose TTL based on freesound path
function chooseTTL(freesoundPath: string) {
  const p = freesoundPath.toLowerCase();
  if (/^\/sounds\/\d+\/?$/.test(p)) return TTLS.soundDetail;
  if (p.startsWith("/search/") || p.startsWith("/search")) return TTLS.search;
  return TTLS.default;
}

// Robust permissive license detection (matches Freesound license URLs and strings)
function isPermissiveLicense(licenseStr?: string) {
  if (!licenseStr) return false;
  const lower = licenseStr.toLowerCase();

  // Explicitly reject obvious non-commercial forms
  if (lower.includes("/licenses/by-nc/") || lower.includes("-nc") || lower.includes("noncommercial") || lower.includes("non-commercial")) {
    return false;
  }

  // Public domain / CC0
  if (
    lower.includes("/licenses/zero/") ||
    lower.includes("/publicdomain/") ||
    lower.includes("creativecommons.org/publicdomain") ||
    lower.includes("zero/1.0") ||
    lower.includes("cc0")
  ) {
    return true;
  }

  // CC-BY family (attribution required but permissive)
  if (lower.includes("/licenses/by/") || lower.includes("/licenses/cc-by") || lower.includes("creativecommons.org/licenses/by")) {
    return true;
  }

  // Conservative default: not permissive
  return false;
}

export async function GET(req: Request) {
  try {
    // Validate envs early
    if (!FREESOUND_BASE || !FREESOUND_TOKEN) {
      console.error("FREESOUND_BASE_URL or FREESOUND_API_KEY is not set");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }
    const base = FREESOUND_BASE.trim();
    const token = FREESOUND_TOKEN.trim();

    // Validate base is a URL
    try {
      new URL(base);
    } catch (e) {
      console.error(e,"\nFREESOUND_BASE_URL is not a valid URL:", base);
      return NextResponse.json({ error: "Server misconfigured: FREESOUND_BASE_URL invalid" }, { status: 500 });
    }

    // Ensure token is byte-safe
    if (/[^\x00-\xFF]/.test(token)) {
      console.error("FREESOUND_API_KEY contains non-byte characters");
      return NextResponse.json({ error: "Server misconfigured: FREESOUND_API_KEY contains invalid characters" }, { status: 500 });
    }

    const url = new URL(req.url);

    const prefix = "/api/freesound";
    let finalPath = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : url.pathname;
    if (!finalPath.startsWith("/")) finalPath = "/" + finalPath;

    // default to search/text if no path provided
    const freesoundPath = finalPath === "/" ? "/search/text/" : finalPath;

    // client query params (copy)
    const clientParams = new URLSearchParams(url.search);

    // Optional client-side license filter (comma-separated tokens like: cc0,by)
    const clientLicenseFilter = clientParams.get("license") ?? "";
    if (clientLicenseFilter) clientParams.delete("license");

    // Build cache key
    const cacheKey = buildCacheKey(freesoundPath, clientParams, { licenseFilter: clientLicenseFilter });

    // Try cached filtered response
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Build upstream URL
    const upstreamUrl = `${base}${freesoundPath}${clientParams.toString() ? "?" + clientParams.toString() : ""}`;

    // Fetch upstream (consume body once)
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        Accept: "application/json",
      },
      redirect: "follow",
      cache: "no-store",
    };

    const res = await fetch(upstreamUrl, fetchOptions);

    // Read body text once (useful for debugging & robust parsing)
    const bodyText = await res.text().catch(() => "");

    if (!res.ok) {
      console.error("Freesound upstream error", res.status, bodyText.slice(0, 1000));
      return NextResponse.json(
        { error: "Freesound fetch failed", status: res.status, bodyPreview: bodyText.slice(0, 1000) },
        { status: 502 }
      );
    }

    // Parse JSON
    let data: any;
    try {
      data = bodyText ? JSON.parse(bodyText) : {};
    } catch (parseErr) {
      console.error("Failed to parse freesound response JSON:", parseErr);
      return NextResponse.json({ error: "Invalid JSON from freesound upstream" }, { status: 502 });
    }

    // Decide TTL
    const ttl = chooseTTL(freesoundPath);

    // Enforce license rules:
    // - single sound detail (/sounds/{id}/) -> require permissive (else 403)
    // - search results -> filter to permissive (and optional client filter)
    const isSoundDetail = /^\/sounds\/\d+\/?$/.test(freesoundPath);

    if (isSoundDetail) {
      // data is a single sound object
      const licenseStr = (data?.license || "") as string;
      const clientAllowed = clientLicenseFilter
        ? clientLicenseFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        : null;

      let clientLicenseMatch = true;
      if (clientAllowed && clientAllowed.length > 0) {
        clientLicenseMatch = clientAllowed.some((tok) => licenseStr.toLowerCase().includes(tok));
      }

      if (!isPermissiveLicense(licenseStr) || !clientLicenseMatch) {
        return NextResponse.json({ error: "sound_license_not_allowed", license: licenseStr }, { status: 403 });
      }

      // allowed -> cache & return
      await setCached(cacheKey, data, ttl);
      return NextResponse.json(data);
    }

    // If search results -> filter
    if (Array.isArray(data?.results)) {
      const clientAllowed = clientLicenseFilter
        ? clientLicenseFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        : null;

      // enrich with permissive flag then filter
      const enriched = data.results.map((r: any) => {
        const lic = (r.license || "").toString();
        const permissive = isPermissiveLicense(lic);
        const clientMatch = clientAllowed && clientAllowed.length > 0 ? clientAllowed.some((tok) => lic.toLowerCase().includes(tok)) : true;
        return { ...r, _permissive: permissive, _clientMatch: clientMatch };
      });

      const filteredResults = enriched.filter((r: any) => r._permissive && r._clientMatch);

      const finalData = {
        ...data,
        results: filteredResults,
        meta: {
          ...data.meta,
          original_count: Array.isArray(data.results) ? data.results.length : undefined,
          filtered_count: filteredResults.length,
        },
      };

      // Cache filtered results
      await setCached(cacheKey, finalData, ttl);
      return NextResponse.json(finalData);
    }

    // Fallback: cache & return original data
    await setCached(cacheKey, data, ttl);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Freesound proxy error:", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

