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
		<ul className="space-y-6">
			{data.articles.map((r: any) => (
				<li
					key={r.id ?? r.url}
					className="
						p-5
						bg-base-300
						border border-base-400
						rounded-xl
						transition-all duration-300 ease-in-out
						hover:border-base-500
						hover:shadow-base-500
					"
				>
					<a
						href={r.url}
						target="_blank"
						rel="noreferrer"
						className="block"
					>
						<h3 className="text-xl font-semibold mb-3 text-base-content transition-colors hover:text-base-500">
							{r.title}
						</h3>
					</a>

					<div className="flex flex-col sm:flex-row gap-4">
						<div className="w-full sm:w-5/12 rounded-2xl overflow-hidden flex-shrink-0 aspect-video bg-base-400 flex items-center justify-center">
							<React.Suspense
								fallback={<div className="w-full h-full bg-base-400" />}
							>
								<ImageWithChecks
									src={r.image ?? ""}
									alt={r.title ?? "news image"}
									loading="eager"
									width={800}
									height={450}
									className="w-full h-full object-cover"
									wrapperClassName="w-full h-full"
								/>
							</React.Suspense>
						</div>

						<div className="flex-1 flex flex-col justify-between px-1 sm:px-3">
							<div className="text-base-content/70 mb-3 line-clamp-3">
								{r.description ?? "No description available."}
							</div>

							<div className="pt-3 border-t border-base-500 text-sm text-right text-base-content/70">
								<span className="font-extrabold text-base-500">
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
										? new Date(r.publishedAt).toLocaleDateString(undefined, {
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

	);
}