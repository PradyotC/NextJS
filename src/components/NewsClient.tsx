"use client";

import ImageWithChecks from "@/components/ImageCheck";
import { toSentenceCase } from "@/lib/util";
import { NewsApiResponse, NewsArticle } from "@/types/news-api";
import useSWR from "swr";

const NewsClient: React.FC<{ category: string }> = ({ category }) => {
	const endpoint: string = `/api/news/top-headlines?category=${category}&lang=en`;

	const { data, error, isLoading } = useSWR<NewsApiResponse>(
		endpoint,
		async (url: string): Promise<NewsApiResponse> => {
			const res = await fetch(url);
			if (!res.ok) {
				const errorData = await res
					.json()
					.catch(() => ({ message: "Unknown fetch error" }));
				throw new Error(
					`Failed to fetch news: ${errorData.message || res.statusText}`
				);
			}
			return res.json();
		},
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			refreshInterval: 300000,
		}
	);

	if (error)
		return (
			<div className="p-4 text-red-500">
				Error loading news... {error.message}
			</div>
		);
	if (isLoading || !data) return <div className="p-4">Loading...</div>;

	return (
		<>
			<h2 className="text-2xl font-bold mb-6 text-white">
				Top {data.articles.length} Articles in {toSentenceCase(category)}
			</h2>
			<ul className="space-y-6">
				{data.articles.map((r: NewsArticle) => (
					<li
						key={r.id ?? r.url}
						className="p-4 bg-gray-700 border border-gray-600 rounded-xl transition duration-300 ease-in-out hover:shadow-blue-500/50 hover:shadow-2xl hover:border-blue-400"
					>
						<a
							href={r.url}
							target="_blank"
							rel="noreferrer"
							className="block text-white"
						>
							<h3 className="text-xl font-semibold mb-3 hover:text-blue-300 transition-colors">
								{r.title}
							</h3>
						</a>

						<div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4">
							{/* Image wrapper: use valid Tailwind width fractions */}
							<div className="w-full sm:w-5/12 rounded-2xl overflow-hidden flex-shrink-0 aspect-video bg-gray-800 flex items-center justify-center">
								<ImageWithChecks
									src={r.image ?? ""}
									alt={r.title ?? "news image"}
									loading="eager"
									width={800}
									height={450}
									className="w-full h-full object-cover"
									wrapperClassName="w-full h-full"
								/>
							</div>

							<div className="flex-1 flex flex-col justify-between p-1 sm:p-3">
								<div className="text-gray-300 mb-3 line-clamp-3">
									{r.description ?? "No description available."}
								</div>

								<div className="w-full text-right text-sm text-gray-400 pt-2 border-t border-gray-700">
									<span className="font-medium text-blue-400">
										{r.source && (<a href={r.source.url} target="_blank" rel="noreferrer">{r.source.name}</a>)}
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
};

export default NewsClient;
