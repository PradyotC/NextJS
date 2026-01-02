import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
    try {
        const { path } = await params; 

        // CASE 2: Movie Routes
        if (path[0] === "movie" && path[1]) {
            const segment = path[1];

            // Check if segment is a number (Movie ID)
            const isId = !isNaN(Number(segment));

            if (isId) {
                // --- FETCH SINGLE MOVIE DETAIL FROM DB ---
                const movieId = parseInt(segment);
                
                // Use Prisma directly instead of the service function
                const movie = await prisma.tmdbMovie.findUnique({
                    where: { id: movieId }
                });

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
                    // Convert BigInt to Number for JSON safety
                    budget: typeof movie.budget === 'bigint' ? Number(movie.budget) : movie.budget,
                    revenue: typeof movie.revenue === 'bigint' ? Number(movie.revenue) : movie.revenue,
                    voteAverage: movie.voteAverage,
                    genres: movie.genres, // Array of strings
                };

                return NextResponse.json(filteredData);
            }
        }
        return NextResponse.json({ error: "Endpoint not supported" }, { status: 404 });

    } catch (error: any) {
        console.error("TMDB Route Error:", error);
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
    }
}