// app/api/tmdb/[...path]/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/server/prismaCache"; 

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_ACCESS_TOKEN;

export const runtime = "nodejs";

// TMDB data is generally safe to cache for longer periods
const CACHE_TTL_SECONDS = 3600; // 1 hour

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const prefix = "/api/tmdb";
    let finalPath = url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length)
      : url.pathname;

    if (!finalPath.startsWith("/")) finalPath = "/" + finalPath;

    // 3. Combine search parameters (auto pass-through)
    const search = url.search ?? "";

    // 4. Unique cache key based on requested TMDB path + search
    const urlId = `${finalPath}${search}`;
    const cacheKey = `tmdb:${urlId}`;

    console.log(`cacheKey: ${cacheKey}`);

    // 5. Try DB cache first
    const cached = await getCached(cacheKey); 
    if (cached) {
      console.log("Cache HIT (DB)");
      return NextResponse.json(cached);
    }
    console.log("Cache MISS (DB)");

    // 6. Build the TMDB API endpoint
    const endpoint = `${TMDB_BASE}${finalPath}${search}`;

    // 7. Make the axios request
    const response = await axios.get(endpoint, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${TMDB_KEY}`,
      },
    });

    const data = response.data;

    // 8. Cache for 1 hour (3600 seconds)
    await setCached(cacheKey, data, CACHE_TTL_SECONDS); 

    // 9. Return the fresh data
    const returnData = NextResponse.json(data);
    console.log(`Returned fresh data for cacheKey: ${cacheKey}`);
    return returnData;
  } catch (error: any) {
    console.error("TMDB error:", error?.message ?? error);

    return NextResponse.json(
      { error: "TMDB fetch failed" },
      { status: 500 }
    );
  }
}