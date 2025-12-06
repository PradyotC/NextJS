import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/server/prismaCache";

const newsBaseUrl = process.env.NEWS_API_BASE_URL;
const newsApiAccessKey = process.env.NEWS_API_ACCESSKEY;
const header = newsApiAccessKey ? { "X-Api-Key": newsApiAccessKey } : undefined;

export const runtime = "nodejs";

const ONE_DAY = 3600 * 24;

export async function GET(req: Request) {
try {
        const url = new URL(req.url);

        const prefix = "/api/news";
        let finalPath = url.pathname.startsWith(prefix)
            ? url.pathname.slice(prefix.length)
            : url.pathname;

        // **FIX 1: Remove the problematic check for a leading slash**
        // Ensure finalPath does NOT start with a slash if newsBaseUrl ends with one.
        if (finalPath.startsWith("/")) {
            finalPath = finalPath.slice(1);
        }

        const outgoing = new URLSearchParams(url.search); // copy user queries

        // The cache key should include the final path and parameters
        const cacheKey = `news:${finalPath}?${outgoing.toString()}`;

        // Try DB cache
        const cached = await getCached(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Final External News URL
        // **FIX 2: Correctly concatenate base URL, final path, and parameters**
        const endpoint = `${newsBaseUrl}${finalPath}?${outgoing.toString()}`;


		const response = await fetch(endpoint, {
            method: "GET",
            headers: header,
            redirect: "follow",
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`News Api responded with status ${response.status}`);
        }

        const data = await response.json();

		await setCached(cacheKey, data, ONE_DAY);

		return NextResponse.json(data);

	} catch (error: any) {
		console.error("News Api error:", error?.message ?? error);
		return NextResponse.json(
			{ error: "News Api fetch failed" },
			{ status: 500 }
		);
	}
}
