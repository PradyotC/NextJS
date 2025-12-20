import { prisma } from "./prisma";

const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_KEY = process.env.TMDB_API_ACCESS_TOKEN;

// --- CONFIGURATION ---
const LIST_TTL = 1000 * 60 * 60 * 24; // 1 Day
const MOVIE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 Days
const BATCH_SIZE = 5;

// --- HELPERS ---

function proxyImage(path: string | null, width = 500) {
    if (!path) return null;
    return `https://wsrv.nl/?url=https://image.tmdb.org/t/p/w${width}${path}&output=webp&q=85`;
}

// Extract best date (US/IN Theatrical > Digital > Global)
function getPreferredReleaseDate(movieData: any): Date | null {
    const defaultDate = movieData.release_date ? new Date(movieData.release_date) : null;

    if (movieData.release_dates?.results) {
        const targetRegions = new Set(['US', 'IN']); // HashSet for O(1) lookup

        const regionalReleases = movieData.release_dates.results
            .filter((r: any) => targetRegions.has(r.iso_3166_1))
            .flatMap((r: any) => r.release_dates)
            .filter((d: any) => [3, 2, 4].includes(d.type)); // 3=Theatrical, 2=Limited, 4=Digital

        regionalReleases.sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());

        if (regionalReleases.length > 0) {
            const bestDate = new Date(regionalReleases[0].release_date);
            if (!isNaN(bestDate.getTime())) return bestDate;
        }
    }
    return defaultDate;
}

async function batchRequests<T, R>(items: T[], fn: (item: T) => Promise<R>, batchSize: number): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);
    }
    return results;
}

// --- WORKER: Fetch Single Movie Details ---
async function ensureMovieDetail(id: number) {
    const existing = await prisma.tmdbMovie.findUnique({ where: { id } });

    if (existing && existing.expireAt > new Date()) return;

    console.log(`[TMDB] Fetching full details for ID: ${id}`);
    const res = await fetch(`${TMDB_BASE}/movie/${id}?append_to_response=credits,release_dates`, {
        headers: { Authorization: `Bearer ${TMDB_KEY}` }
    });

    if (!res.ok) {
        console.error(`Failed to fetch movie ${id}: ${res.statusText}`);
        return;
    }

    const m = await res.json();
    const now = new Date();
    const releaseDate = getPreferredReleaseDate(m);

    const movieData = {
        id: m.id,
        title: m.title,
        overview: m.overview || "",
        tagline: m.tagline || "",
        status: m.status || "",
        runtime: m.runtime || 0,
        imdbId: m.imdb_id || "",
        homepage: m.homepage || "",
        budget: m.budget ? BigInt(m.budget) : BigInt(0),
        revenue: m.revenue ? BigInt(m.revenue) : BigInt(0),
        posterPath: proxyImage(m.poster_path, 500),
        backdropPath: proxyImage(m.backdrop_path, 1280),
        mediaType: "movie",
        releaseDate: releaseDate,
        originalLang: m.original_language,
        originalTitle: m.original_title,
        voteAverage: m.vote_average || 0,
        voteCount: m.vote_count || 0,
        popularity: m.popularity || 0,
        genres: m.genres?.map((g: any) => g.name) || [],
        cachedAt: now,
        expireAt: new Date(now.getTime() + MOVIE_TTL),
    };

    await prisma.tmdbMovie.upsert({
        where: { id: m.id },
        update: movieData,
        create: movieData,
    });
}

// --- ORCHESTRATOR ---
export async function getMoviesByCategory(category: string) {
    const now = new Date();
    const cachedList = await prisma.tmdbMovieList.findUnique({ where: { category } });

    const movieIds = new Set<number>(); // HashSet for uniqueness
    const isStale = !cachedList || cachedList.expireAt < now;

    if (!isStale && cachedList) {
        cachedList.movieIds.forEach(id => movieIds.add(id));
    } else {
        console.log(`[TMDB] List '${category}' is stale/missing. Fetching...`);
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        const todayStr = formatDate(now);
        const monthLaterStr = formatDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));

        let endpoint = "";
        switch (category) {
            case "trending": endpoint = `${TMDB_BASE}/trending/movie/week?language=en-US&region=US|IN`; break;
            case "popular": endpoint = `${TMDB_BASE}/movie/popular?language=en-US&region=US|IN`; break;
            case "upcoming": endpoint = `${TMDB_BASE}/discover/movie?language=en-US&region=US|IN&primary_release_date.gte=${todayStr}&primary_release_date.lte=${monthLaterStr}&with_release_type=3|2|4&sort_by=popularity.desc`; break;
            case "now_playing": endpoint = `${TMDB_BASE}/movie/now_playing?language=en-US&region=US|IN`; break;
            case "top_rated": endpoint = `${TMDB_BASE}/movie/top_rated?language=en-US&region=US|IN`; break;
            default: throw new Error(`Unknown category: ${category}`);
        }

        const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${TMDB_KEY}` } });
        if (!res.ok) throw new Error(`TMDB List Failed: ${res.status}`);
        const data = await res.json();

        // Default to a 24h cache window if dates aren't provided by API
        const fallbackMin = todayStr;
        const fallbackMax = formatDate(new Date(now.getTime() + LIST_TTL));

        if (data.results) {
            // Use Set to remove any duplicates from API response instantly
            data.results.forEach((m: any) => movieIds.add(m.id));

            if (movieIds.size < 20) {
                const rem_length = 20 - movieIds.size;
                const movieIdArray = Array.from(movieIds);
                let backfillIds: { id: number }[] = [];

                switch (category) {
                    case "popular":
                        backfillIds = await prisma.tmdbMovie.findMany({
                            where: { id: { notIn: movieIdArray } },
                            select: { id: true },
                            orderBy: { popularity: 'desc' },
                            take: rem_length,
                        });
                        break;

                    case "upcoming":
                        // FIX: Upcoming should be 'asc' (soonest first) and in the future
                        backfillIds = await prisma.tmdbMovie.findMany({
                            where: {
                                id: { notIn: movieIdArray },
                                releaseDate: { gte: now } // Only future movies
                            },
                            select: { id: true },
                            orderBy: { releaseDate: 'asc' }, // Soonest first
                            take: rem_length,
                        });
                        break;

                    case "now_playing":
                        // FIX: Add lower bound so we don't fetch movies from 1990
                        const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
                        const thirtyDaysFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

                        backfillIds = await prisma.tmdbMovie.findMany({
                            where: {
                                id: { notIn: movieIdArray },
                                releaseDate: {
                                    gte: fortyFiveDaysAgo,
                                    lte: thirtyDaysFuture
                                }
                            },
                            select: { id: true },
                            orderBy: { releaseDate: 'desc' },
                            take: rem_length,
                        });
                        break;

                    case "top_rated":
                        backfillIds = await prisma.tmdbMovie.findMany({
                            where: { id: { notIn: movieIdArray }, voteCount: { gte: 200 } },
                            select: { id: true },
                            orderBy: { voteAverage: 'desc' },
                            take: rem_length,
                        });
                        break;
                }

                // Add backfilled IDs to Set
                backfillIds.forEach(m => movieIds.add(m.id));
            }

            // Convert Set back to Array for Prisma Storage
            const uniqueIdArray = Array.from(movieIds);

            await prisma.tmdbMovieList.upsert({
                where: { category },
                update: {
                    movieIds: uniqueIdArray,
                    minDate: data.dates?.minimum || fallbackMin,
                    maxDate: data.dates?.maximum || fallbackMax,
                    expireAt: new Date(now.getTime() + LIST_TTL),
                    cachedAt: now
                },
                create: {
                    category,
                    movieIds: uniqueIdArray,
                    minDate: data.dates?.minimum || fallbackMin,
                    maxDate: data.dates?.maximum || fallbackMax,
                    expireAt: new Date(now.getTime() + LIST_TTL),
                    cachedAt: now
                }
            });
        }
    }

    // Batch process the unique IDs
    await batchRequests(Array.from(movieIds), ensureMovieDetail, BATCH_SIZE);

    const movies = await prisma.tmdbMovie.findMany({
        where: { id: { in: Array.from(movieIds) } }
    });

    // Sort based on the insertion order in the Set
    const sortedMovies = Array.from(movieIds)
        .map(id => movies.find(m => m.id === id))
        .filter(Boolean);

    return { results: sortedMovies };
}

export async function getMovieDetail(id: number) {
    await ensureMovieDetail(id);
    const movie = await prisma.tmdbMovie.findUnique({ where: { id } });

    if (movie) {
        return {
            ...movie,
            budget: Number(movie.budget),
            revenue: Number(movie.revenue)
        };
    }
    return null;
}