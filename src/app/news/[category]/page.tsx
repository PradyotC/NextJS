// src/app/news/[category]/page.tsx  (SERVER)
import React from "react";
import ImageWithChecks from "@/components/ImageCheck"; // thin client wrapper shown below
import { toSentenceCase } from "@/lib/util";
import { getNewsData } from "@/app/api/news/[...path]/route";

export const runtime = "nodejs";

type Props = { params: Promise<{ category?: string }> };

export default async function NewsCategoryPage({ params }: Props) {
	const paramsFetch = await params;
	const cat = paramsFetch.category ?? "general";

	const endpoint = `/api/news/top-headlines?category=${encodeURIComponent(cat)}&lang=en`;

	let data = { articles: [] as any[] };
	try {
		// getNewsData returns parsed JSON (or throws) — not a Response
		const json = await getNewsData(endpoint);
		// Defensive: ensure shape we expect
		if (json && Array.isArray(json.articles)) {
			data = json;
		} else {
			console.warn("Unexpected news payload shape", json);
		}
	} catch (err) {
		console.error("Server fetch error:", err);
		return <div className="m-5 p-3">Unable to load news data right now.</div>;
	}

	return (
		<>
			<h2 className="text-2xl font-bold mb-6 text-white">
				Top {data.articles.length} Articles in {toSentenceCase(cat)}
			</h2>

			<ul className="space-y-6">
				{data.articles.map((r: any) => (
					<li
						key={r.id ?? r.url}
						className="p-4 bg-gray-700 border border-gray-600 rounded-xl transition duration-300 ease-in-out hover:shadow-blue-500/50 hover:shadow-2xl hover:border-blue-400"
					>
						<a href={r.url} target="_blank" rel="noreferrer" className="block text-white">
							<h3 className="text-xl font-semibold mb-3 hover:text-blue-300 transition-colors">
								{r.title}
							</h3>
						</a>

						<div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4">
							<div className="w-full sm:w-5/12 rounded-2xl overflow-hidden flex-shrink-0 aspect-video bg-gray-800 flex items-center justify-center">
								<React.Suspense fallback={<div className="w-full h-44 bg-gray-800" aria-hidden="true" />}>
									<ImageWithChecks
										src={r.image ?? ""}
										alt={r.title ?? "news image"}
										// consider using lazy loading for non-critical images
										loading="eager"
										width={800}
										height={450}
										className="w-full h-full object-cover"
										wrapperClassName="w-full h-full"
									/>
								</React.Suspense>
							</div>

							<div className="flex-1 flex flex-col justify-between p-1 sm:p-3">
								<div className="text-gray-300 mb-3 line-clamp-3">
									{r.description ?? "No description available."}
								</div>

								<div className="w-full text-right text-sm text-gray-400 pt-2 border-t border-gray-700">
									<span className="font-medium text-blue-400">
										{r.source?.name ? (
											r.source?.url ? (
												<a href={r.source.url} target="_blank" rel="noreferrer">
													{r.source.name}
												</a>
											) : (
												r.source.name
											)
										) : (
											"Unknown"
										)}
									</span>
									{" • "}
									<span>
										{r.publishedAt
											? new Date(r.publishedAt).toLocaleString(undefined, {
												year: "numeric",
												month: "short",
												day: "numeric",
											})
											: "unknown"}
									</span>
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
		</>
	);
}