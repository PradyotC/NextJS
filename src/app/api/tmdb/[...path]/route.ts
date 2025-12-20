import { NextResponse } from "next/server";
import { getMoviesByCategory, getMovieDetail } from "@/lib/server/tmdb-service";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
    try {
        const { path } = await params; 
        // path is an array: e.g., ["movie", "popular"] or ["movie", "550"] or ["trending"]

        // CASE 1: Trending
        if (path[0] === "trending") {
            const data = await getMoviesByCategory("trending");
            return NextResponse.json(data);
        }

        // CASE 2: Movie Routes
        if (path[0] === "movie" && path[1]) {
            const segment = path[1];

            // Check if segment is a number (Movie ID) or a string (Category)
            const isId = !isNaN(Number(segment));

            if (isId) {
                // --- FETCH SINGLE MOVIE DETAIL ---
                const movieId = parseInt(segment);
                const movie = await getMovieDetail(movieId);

                if (!movie) {
                    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
                }

                // FILTER: Only return necessary fields to Client to reduce payload
                const filteredData = {
                    id: movie.id,
                    title: movie.title,
                    overview: movie.overview,
                    tagline: movie.tagline,
                    status: movie.status,
                    runtime: movie.runtime,
                    imdbId: movie.imdbId,
                    homepage: movie.homepage,
                    posterPath: movie.posterPath,
                    backdropPath: movie.backdropPath,
                    releaseDate: movie.releaseDate,
                    originalLang: movie.originalLang,
                    originalTitle: movie.originalTitle,
                    budget: movie.budget,
                    revenue: movie.revenue,
                    voteAverage: movie.voteAverage,
                    genres: movie.genres, // Array of strings
                };

                return NextResponse.json(filteredData);
            } 
            else {
                // --- FETCH MOVIE LIST (popular, upcoming, etc) ---
                const data = await getMoviesByCategory(segment);
                return NextResponse.json(data);
            }
        }

        return NextResponse.json({ error: "Endpoint not supported" }, { status: 404 });

    } catch (error: any) {
        console.error("TMDB Route Error:", error);
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
    }
}