// src/app/api/stocks/[...path]/route.ts
import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/server/prismaCache";

export const runtime = "nodejs";

const baseurl = process.env.ALPHAVANTAGE_BASE_URL!;
const api_key = process.env.ALPHAVANTAGE_API_KEY!;
const ONE_HOUR = 3600;

function buildEndpoint(finalPath: string, params: URLSearchParams) {
    // ensure finalPath has a leading slash
    if (!finalPath.startsWith("/")) finalPath = "/" + finalPath;
    const qs = params.toString();
    return `${baseurl}${finalPath}?${qs}${qs ? "&" : ""}apikey=${api_key}`;
}

// Exported function: returns plain parsed data (object)
export async function getStocksData(reqUrl: string) {
    const baseForRelative =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_VERCEL_URL ||
        "http://localhost";

    let url: URL;
    try {
        url = reqUrl.startsWith("http") ? new URL(reqUrl) : new URL(reqUrl, baseForRelative);
    } catch (err) {
        console.log(err)
        url = new URL(reqUrl, "http://localhost");
    }

    const prefix = "/api/stocks";
    let finalPath = url.pathname.startsWith(prefix)
        ? url.pathname.slice(prefix.length)
        : url.pathname;

    if (!finalPath) finalPath = "/query"; // fallback

    const paramsObj: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (paramsObj[k] = v));
    const outgoing = new URLSearchParams(paramsObj);

    const cacheKey = `stocks:${finalPath}?${outgoing.toString()}`;
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const endpoint = buildEndpoint(finalPath, outgoing);

    const response = await fetch(endpoint, {
        method: "GET",
        redirect: "follow",
        next: { revalidate: ONE_HOUR },
    });

    if (!response.ok) {
        throw new Error(`Upstream responded with status ${response.status}`);
    }

    const data = await response.json();
    await setCached(cacheKey, data, ONE_HOUR);
    return data;
}


// API route handler — still works for external HTTP callers
export async function GET(req: Request) {
    try {
        const data = await getStocksData(req.url);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API route error:", error?.message ?? error);
        return NextResponse.json({ error: "stocks fetch failed" }, { status: 500 });
    }
}