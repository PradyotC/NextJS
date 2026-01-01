// src/lib/server/music-service.ts
import { prisma } from "./prisma";

const BASE_URL = process.env.JAMENDO_BASE_URL;
const CLIENT_ID = process.env.JAMENDO_CLIENT_ID;
const LIST_TTL = 1000 * 60 * 60 * 24; // 24 Hours

export async function getMusicTracks(category: string = "lofi") {
    const now = new Date();
    const safeCategory = category.toLowerCase();

    // 1. Check DB Cache
    const cachedList = await prisma.musicList.findUnique({
        where: { category: safeCategory }
    });

    if (cachedList && cachedList.expireAt > now) {
        const tracks = await prisma.musicTrack.findMany({
            where: { id: { in: cachedList.trackIds } }
        });

        // Sort tracks to match the list order
        const trackMap = new Map(tracks.map(t => [t.id, t]));
        return cachedList.trackIds.map(id => trackMap.get(id)).filter(Boolean);
    }

    // 2. Fetch from API
    // We boost by popularity to get high quality results
    const url = `${BASE_URL}/tracks/?client_id=${CLIENT_ID}&format=jsonpretty&limit=20&tags=${safeCategory}&boost=popularity_month&imagesize=600`;
    
    console.log(`[MusicService] Fetching fresh tracks for: ${safeCategory}`);
    const res = await fetch(url, { next: { revalidate: 0 } });
    
    if (!res.ok) throw new Error(`Jamendo API Failed: ${res.status}`);
    
    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) return [];

    // 3. Store/Update in DB
    const trackIds: string[] = [];

    for (const item of results) {
        const id = item.id;
        trackIds.push(id);

        await prisma.musicTrack.upsert({
            where: { id },
            update: {
                title: item.name,
                artist: item.artist_name,
                image: item.album_image,
                audio: item.audio,
                duration: item.duration,
                shareUrl: item.shareurl,
                license: item.license_ccurl,
                releasedDate: item.releasedate,
                cachedAt: now
            },
            create: {
                id,
                title: item.name,
                artist: item.artist_name,
                image: item.album_image,
                audio: item.audio,
                duration: item.duration,
                shareUrl: item.shareurl,
                license: item.license_ccurl,
                releasedDate: item.releasedate,
                cachedAt: now
            }
        });
    }

    // Update List Cache
    await prisma.musicList.upsert({
        where: { category: safeCategory },
        update: {
            trackIds,
            cachedAt: now,
            expireAt: new Date(now.getTime() + LIST_TTL)
        },
        create: {
            category: safeCategory,
            trackIds,
            cachedAt: now,
            expireAt: new Date(now.getTime() + LIST_TTL)
        }
    });

    // Return objects
    const newTracks = await prisma.musicTrack.findMany({
        where: { id: { in: trackIds } }
    });

    const trackMap = new Map(newTracks.map(t => [t.id, t]));
    return trackIds.map(id => trackMap.get(id)).filter(Boolean);
}