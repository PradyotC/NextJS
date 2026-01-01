// src/app/api/audio-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

// Prevent Vercel from caching this route too aggressively if needed, 
// though for audio proxying, default is usually fine.
export const dynamic = "force-dynamic"; 

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("id");

    if (!trackId) {
        return NextResponse.json({ error: "Missing track ID" }, { status: 400 });
    }

    try {
        // 1. Verify ID in DB
        const track = await prisma.musicTrack.findUnique({
            where: { id: trackId },
            select: { audio: true }
        });

        if (!track || !track.audio) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        // 2. Fetch from Jamendo with Browser Headers
        // Many CDNs block requests with no User-Agent
        const response = await fetch(track.audio, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "*/*"
            }
            // Optional: Increase timeout if your network is slow (Next.js default is usually sufficient)
        });

        if (!response.ok) {
            console.error(`[AudioProxy] Upstream Error: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: "Upstream audio fetch failed" }, { status: 502 });
        }

        // 3. Forward the stream
        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "audio/mpeg");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Content-Length", response.headers.get("Content-Length") || "");

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error("Audio Proxy Error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            details: error.message 
        }, { status: 500 });
    }
}