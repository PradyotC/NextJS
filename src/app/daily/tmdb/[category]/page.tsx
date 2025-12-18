import React from "react";
import { getTmdbData } from "@/app/api/tmdb/[...path]/route";
import MovieModalTrigger from "@/components/MovieModalTrigger";
import { faArrowTrendUp, faCalendar, faFire, faPlayCircle, faStar, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import ImageWithChecks from "@/components/ImageCheck";
import { urlStringToSentenceCase } from "@/lib/nav-util";


type TabData = {
	path: string;
	icon: IconDefinition;
};

type TabInfo = {
	[key: string]: TabData
}

const tabsInfo: TabInfo = {
	"Now Playing": { path: "movie/now_playing", icon: faPlayCircle },
	"Popular": { path: "movie/popular", icon: faFire },
	"Trending": { path: "trending/movie/week?language=en-US", icon: faArrowTrendUp },
	"Top Rated": { path: "movie/top_rated", icon: faStar },
	"Upcoming": { path: "movie/upcoming", icon: faCalendar }
};


export const runtime = "nodejs";

export interface Movie {
	id: number;
	title: string;
	poster_path: string | null;
	backdrop_path: string | null;
	vote_average: number;
	release_date: string;
	overview: string;
	popularity: number;
	genre_ids: number[];
}

const TmdbImageBaseUrl = process.env.NEXT_PUBLIC_TMDBIMAGEBASEURL;

function TmdbItem({ item }: { item: Movie }) {
	const ratingScore = item.vote_average ? Math.round(item.vote_average) : 0;
	return (
		<MovieModalTrigger movieId={item.id}>
			<div className="hover-3d w-full max-w-md">
				<div className="card w-full h-full border border-base-300 shadow-sm bg-base-300/90 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
					<figure className="relative aspect-[4/3] w-full">
						{item.poster_path ? (
							<React.Suspense fallback={<div className="h-full w-full bg-base-300 flex items-center justify-center text-base-content/50">No Image</div>}>
								<ImageWithChecks
									wrapperClassName="w-full h-full"
									src={`${TmdbImageBaseUrl}${item.poster_path}`}
									alt={`${item.title} Poster`}
									fill
									loading="eager"
									sizes="(max-width: 768px) 100vw, 33vw"
									className="object-cover"
									unoptimized
								/>
							</React.Suspense>
						) : (
							<div className="h-full w-full bg-base-300 flex items-center justify-center text-base-content/50">
								No Image
							</div>
						)}
					</figure>

					{item.vote_average !== undefined && (
						<div className="absolute z-10 right-3 top-3 md:top-4 md:right-4 bg-base-100/90 backdrop-blur-sm p-1 rounded-full shadow-md">
							<div
								className={`radial-progress font-extrabold text-xs md:text-sm text-rating-gradient-${ratingScore}`}
								style={{ "--value": Math.round(item.vote_average * 10), "--size": "3rem", "--thickness": "4px" } as React.CSSProperties}
							>
								{Math.round(item.vote_average * 10)}%
							</div>
						</div>
					)}

					<div className="card-body flex flex-col p-4">
						<h2 className="card-title text-base-content flex items-center justify-between">
							<span className="truncate">{item.title}</span>
							<span className="badge badge-info text-info-content ml-2">
								{item.release_date
									? new Date(item.release_date).getFullYear()
									: "N/A"}
							</span>
						</h2>

						<p
							className="text-base-content/70 mt-2 overflow-hidden text-sm text-start"
							style={{ maxHeight: "4.5em", textOverflow: "ellipsis" }}
						>
							{item.overview || "No overview available."}
						</p>

						<div className="card-actions flex flex-wrap items-center gap-2 my-2">
							{item.popularity !== undefined && (
								<div className="badge badge-warning text-warning-content gap-2">
									🔥 {Math.round(item.popularity)}
								</div>
							)}
							{item.genre_ids?.length > 0 && (
								<div className="badge badge-outline text-xs">
									Genre: {item.genre_ids[0]}
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
	const cat = urlStringToSentenceCase(paramsFetch.category || "now-playing");
	const path = tabsInfo[cat]?.path ?? "movie/now_playing";
	const cleanedPath = path.startsWith("/") ? path : `/${path}`;
	const finalUrl = `/api/tmdb${cleanedPath}`;
	try {
		const data = await getTmdbData(finalUrl);
		return (
			<div className="container mx-auto p-4">
				<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
					{data?.results?.map((item: any) => (
						<TmdbItem
							item={item}
							key={item.id}
						/>
					))}
				</div>
			</div>
		);
	} catch (err) {
		console.error("Server fetch error:", err);
		return <div className="m-5 p-3">Unable to load data right now.</div>;
	}
}