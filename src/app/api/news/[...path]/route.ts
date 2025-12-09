import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/server/prismaCache";

const baseurl = process.env.NEWS_API_BASE_URL!;
const newsApiAccessKey = process.env.NEWS_API_ACCESSKEY || "";
const header = newsApiAccessKey ? { "X-Api-Key": newsApiAccessKey } : undefined;

export const runtime = "nodejs";
const ONE_DAY = 3600 * 24;

function buildEndpoint(finalPath: string, params: URLSearchParams) {
    if (!finalPath.startsWith("/")) finalPath = "/" + finalPath;
    return `${baseurl}${finalPath}?${params.toString()}`;
}

// Exported function: returns plain parsed data (object)
export async function getNewsData(reqUrl: string) {
    const baseForRelative =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_VERCEL_URL ||
        "http://localhost";

    let url: URL;
    try {
        url = reqUrl.startsWith("http") ? new URL(reqUrl) : new URL(reqUrl, baseForRelative);
    } catch (err) {
        console.warn(err)
        url = new URL(reqUrl, "http://localhost");
    }

    const prefix = "/api/news";
    const finalPath = url.pathname.startsWith(prefix)
        ? url.pathname.slice(prefix.length)
        : url.pathname;

    const outgoing = new URLSearchParams(url.search); // copy user queries

    // The cache key should include the final path and parameters
    const cacheKey = `news:${finalPath}?${outgoing.toString()}`;

    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const endpoint = buildEndpoint(finalPath, outgoing);

    const response = await fetch(endpoint, {
        method: "GET",
        redirect: "follow",
        headers: header,
        next: { revalidate: 86400 },
    });

    if (!response.ok) {
        throw new Error(`News Api responded with status ${response.status}`);
    }

    const data = await response.json();
    await setCached(cacheKey, data, ONE_DAY);
    return data;
}


// API route handler — still works for external HTTP callers
export async function GET(req: Request) {
    try {
        const data = await getNewsData(req.url);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API route error:", error?.message ?? error);
        return NextResponse.json({ error: "news fetch failed" }, { status: 500 });
    }
}