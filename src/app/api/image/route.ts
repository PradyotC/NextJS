// src/app/api/image/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const FALLBACK_PUBLIC_PATH = "/noImage.svg";

/**
 * Small helper: sleep ms
 */
function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Attempt to fetch the target URL with timeout and headers.
 * Retries `retries` times on network errors.
 */
async function fetchWithTimeoutAndRetries(
  url: string,
  { timeout = 10000, retries = 2 } = {}
): Promise<Response> {
  let attempt = 0;
  let lastErr: any = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      // Some hosts reject requests without a UA header - provide a simple one.
      const res = await fetch(url, {
        method: "GET",
        // safe headers to improve compatibility with some hosts
        headers: {
          "User-Agent": "NextImageProxy/1.0 (+https://your-site.example)",
          Accept: "image/*,*/*;q=0.8",
        },
        signal: controller.signal,
        // do not cache here - rely on downstream cache headers we set
      });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      lastErr = err;
      // If abort (timeout), or network error like ECONNRESET, we wait a bit and retry
      // For non-network errors (HTTP 4xx/5xx) fetch does not throw, so we won't be here.
      attempt += 1;
      // small backoff
      await wait(200 * attempt);
    }
  }
  // All attempts failed — throw last error for the caller to handle
  throw lastErr;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providedUrl = searchParams.get("url");
    const mode = searchParams.get("mode"); // 'validate' used by client

    if (!providedUrl) {
      if (mode === "validate") {
        return NextResponse.json({ src: FALLBACK_PUBLIC_PATH }, { status: 200 });
      }
      return new NextResponse("URL parameter missing", { status: 400 });
    }

    // For validate responses, we return the proxy URL (so client uses it via next/image)
    // Create proxyUrl relative to this route so it will hit this same handler without mode
    const base = new URL(req.url);
    const proxyUrl = `${base.origin}/api/image?url=${encodeURIComponent(providedUrl)}`;

    // Try to fetch the external resource with timeout + retries
    try {
      const res = await fetchWithTimeoutAndRetries(providedUrl, { timeout: 10000, retries: 2 });

      // Validation mode: just inform client whether proxy will be usable (respond with JSON)
      if (mode === "validate") {
        if (res.ok) {
          return NextResponse.json({ src: proxyUrl }, { status: 200 });
        }
        return NextResponse.json(
          { src: FALLBACK_PUBLIC_PATH, error: `Status: ${res.status}` },
          { status: 200 }
        );
      }

      // Proxy mode: stream bytes through if res.ok
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "image/jpeg";
        // Forward caching headers for real images (you can tune these)
        return new NextResponse(res.body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      // If we received a non-OK status, return a 404-like proxy response
      // For user-facing stability, redirect to fallback image so next/image/browsers get something.
      const fallbackUrl = `${base.origin}${FALLBACK_PUBLIC_PATH}`;
      return NextResponse.redirect(fallbackUrl);

    } catch (fetchError) {
      // Network error or all retries failed
      console.log("Image verification/proxy failed:", fetchError);

      if (mode === "validate") {
        // Keep validate always returning 200 JSON, so the client code can proceed safely
        return NextResponse.json({ src: FALLBACK_PUBLIC_PATH, error: "Network error" }, { status: 200 });
      }

      // For proxy mode, redirect the client to the static fallback image.
      // Redirecting avoids returning a 5xx body that next/image or the browser may choke on.
      const base = new URL(req.url);
      const fallbackUrl = `${base.origin}${FALLBACK_PUBLIC_PATH}`;
      return NextResponse.redirect(fallbackUrl);
    }
  } catch (err) {
    console.error("Unexpected image proxy error:", err);
    return NextResponse.json({ error: `Internal Server Error: ${String(err)}` }, { status: 500 });
  }
}
