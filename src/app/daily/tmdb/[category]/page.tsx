import React from "react";
import MovieModalTrigger from "@/components/MovieModalTrigger";
import ImageWithChecks from "@/components/ImageCheck";
import { getMoviesByCategory } from "@/lib/server/tmdb-service";

export const runtime = "nodejs";

// Define the shape that matches our Prisma Model + Injected Fields
interface DbMovie {
	id: number;
	title: string;
	posterPath: string | null;
	voteAverage: number;
	releaseDate: Date | null;
	overview: string | null;
	popularity: number;
	genres: string[];
}

type movieRespResult = ({
	id: number;
	title: string;
	overview: string | null;
	posterPath: string | null;
	backdropPath: string | null;
	mediaType: string;
	releaseDate: Date | null;
	originalLang: string | null;
	originalTitle: string | null;
	tagline: string | null;
	runtime: number | null;
	status: string | null;
	imdbId: string | null;
	homepage: string | null;
	budget: bigint | null;
	revenue: bigint | null;
	voteAverage: number;
	voteCount: number;
	popularity: number;
	genres: string[];
	cachedAt: Date;
	expireAt: Date;
} | undefined);

function TmdbItem({ item }: { item: DbMovie }) {
	const ratingScore = item.voteAverage ? Math.round(item.voteAverage) : 0;
	const releaseDate = item.releaseDate
		? new Date(item.releaseDate).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		}) : "N/A";

	return (
		<MovieModalTrigger movieId={item.id}>
			<div className="hover-3d w-full max-w-md group">
				<div className="card w-full h-full border border-base-300 shadow-sm bg-base-300/90 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
					<figure className="relative aspect-[4/3] w-full overflow-hidden">
						{item.posterPath ? (
							<React.Suspense fallback={<div className="h-full w-full bg-base-300 animate-pulse" />}>
								<ImageWithChecks
									wrapperClassName="w-full h-full"
									src={item.posterPath}
									alt={`${item.title} Poster`}
									fill
									loading="eager"
									sizes="(max-width: 768px) 100vw, 33vw"
									className="object-cover transition-transform duration-500 group-hover:scale-110"
									forceUnoptimized={true}
								/>
							</React.Suspense>
						) : (
							<div className="h-full w-full bg-base-300 flex items-center justify-center text-base-content/50">
								No Image
							</div>
						)}
					</figure>

					{item.voteAverage > 0 && (
						<div className="absolute z-10 right-3 top-3 md:top-4 md:right-4 bg-base-100/90 backdrop-blur-sm p-1 rounded-full shadow-md">
							<div
								className={`radial-progress font-extrabold text-xs md:text-sm`}
								style={{
									"--value": Math.round(item.voteAverage * 10),
									"--size": "3rem",
									"--thickness": "4px",
									color: ratingScore >= 7 ? "#22c55e" : ratingScore >= 4 ? "#eab308" : "#ef4444"
								} as React.CSSProperties}
							>
								{Math.round(item.voteAverage * 10)}%
							</div>
						</div>
					)}

					<div className="card-body flex flex-col p-4">
						<h2 className="card-title text-base-content flex items-center justify-between">
							<span className="truncate pr-2">{item.title}</span>
							<span className="badge badge-info text-info-content flex-shrink-0">
								{releaseDate}
							</span>
						</h2>

						<p className="text-base-content/70 mt-2 overflow-hidden text-sm text-start line-clamp-3">
							{item.overview || "No overview available."}
						</p>

						<div className="card-actions flex flex-wrap items-center gap-2 my-2 mt-auto pt-2">
							{item.popularity > 0 && (
								<div className="badge badge-warning text-warning-content gap-1">
									🔥 {Math.round(item.popularity)}
								</div>
							)}
							{item.genres.length > 0 && (
								<div className="badge badge-outline text-xs capitalize">
									{item.genres[0].replace(/_/g, " ")}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</MovieModalTrigger>
	);
};

type Props = { params: Promise<{ category?: string }> };

export default async function TmdbCategoryPage({ params }: Props) {
	const paramsFetch = await params;
	const slug = paramsFetch.category || "now-playing";

	const apiCategory = slug === "trending" ? "trending" : slug.replace(/-/g, "_");



	let res: DbMovie[] = [];

	try {
		const { results } = await getMoviesByCategory(apiCategory);

		// --- FIX IS HERE ---
		if (results) {
			res = results.map((m: movieRespResult) => ({
				...m,
				// 1. Serialize BigInts to Numbers
				id: Number(m?.id),
				title: String(m?.title),
				posterPath: String(m?.posterPath),
				voteAverage: Number(m?.voteAverage || 0),
				releaseDate: m?.releaseDate ? new Date(m.releaseDate) : null,
				popularity: Number(m?.popularity || 0),
				overview: String(m?.overview),
				genres: m?.genres || [],
				// 2. Inject the current category (since it's missing from the DB model now)

				categories: [(apiCategory ?? 'now-playing')]
			})
			);
		}

	} catch (err) {
		console.error("Page fetch error:", err);
		return <div className="m-5 p-3 text-error">Unable to load data right now.</div>;
	}

	if (!res || res.length === 0) {
		return <div className="m-5 p-3 text-center opacity-50">No movies found.</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
				{res.map((item) => (
					<TmdbItem
						item={item}
						key={item.id}
					/>
				))}
			</div>
		</div>
	);
}