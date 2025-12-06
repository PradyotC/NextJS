import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/server/prismaCache";

const jamendoBaseUrl = process.env.JAMENDO_BASE_URL;
const jamendoClientId = process.env.JAMENDO_CLIENT_ID;

export const runtime = "nodejs";

const ONE_DAY = 3600 * 24;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const prefix = "/api/jamendo";
    let finalPath = url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length)
      : url.pathname;

    if (!finalPath.startsWith("/")) finalPath = "/" + finalPath;

    // --- Build outgoing Jamendo query params ---
    const outgoing = new URLSearchParams(url.search); // copy user queries

    // Required params (inject or override)
    outgoing.set("client_id", jamendoClientId!);
    outgoing.set("format", "jsonpretty");

    // Defaults — user override allowed
    if (!outgoing.has("limit")) outgoing.set("limit", "10");
    if (!outgoing.has("order")) outgoing.set("order", "id_desc");

    // Example: user adds ?offset=20 → gets included automatically

    // Sorted for consistent caching keys
    const sortedQuery = new URLSearchParams(
      Array.from(outgoing.entries()).sort(([a], [b]) => a.localeCompare(b))
    );

    const cacheKey = `jamendo:${finalPath}?${sortedQuery.toString()}`;

    // Try DB cache
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Final Jamendo URL
    const endpoint = `${jamendoBaseUrl}${finalPath}?${sortedQuery.toString()}`;

    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Jamendo responded with status ${response.status}`);
    }

    const data = await response.json();

    // Cache for 1 day
    await setCached(cacheKey, data, ONE_DAY);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Jamendo error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Jamendo fetch failed" },
      { status: 500 }
    );
  }
}
