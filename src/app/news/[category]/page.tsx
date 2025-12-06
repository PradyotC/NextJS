// src/app/news/[category]/page.tsx  (SERVER)
import React from "react";
import ImageWithChecks from "@/components/ImageCheck"; // thin client wrapper shown below
import { toSentenceCase } from "@/lib/util";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

type Props = { params: Promise<{ category: string }> };

export default async function NewsCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = category ?? "general";

  // Fetch server-side from your existing API route (this calls your /api/news route)
  // NOTE: relative fetch() works from the server component and resolves to same origin.
  const endpoint = `${SITE_ORIGIN}/api/news/top-headlines?category=${encodeURIComponent(cat)}&lang=en`;

  let data = { articles: [] as any[] };
  try {
    const res = await fetch(endpoint, { cache: "no-store" }); // server fetch; uses your api+db cache
    if (res.ok) {
      data = await res.json();
    } else {
      console.error("Server fetch to /api/news failed:", res.status);
    }
  } catch (err) {
    console.error("Server fetch error:", err);
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
            {/* server-rendered text */}
            <a href={r.url} target="_blank" rel="noreferrer" className="block text-white">
              <h3 className="text-xl font-semibold mb-3 hover:text-blue-300 transition-colors">
                {r.title}
              </h3>
            </a>

            <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4">
              <div className="w-full sm:w-5/12 rounded-2xl overflow-hidden flex-shrink-0 aspect-video bg-gray-800 flex items-center justify-center">
                {/* Suspense boundary: server writes fallback (placeholder) to HTML */}
                <React.Suspense fallback={<div className="w-full h-44 bg-gray-800" aria-hidden="true" />}>
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

              <div className="flex-1 flex flex-col justify-between p-1 sm:p-3">
                <div className="text-gray-300 mb-3 line-clamp-3">
                  {r.description ?? "No description available."}
                </div>

                <div className="w-full text-right text-sm text-gray-400 pt-2 border-t border-gray-700">
                  <span className="font-medium text-blue-400">
                    {r.source && r.source.name ? (
                      <a href={r.source.url} target="_blank" rel="noreferrer">
                        {r.source.name}
                      </a>
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