"use client";

import ImageWithChecks from "@/components/ImageCheck";
import Waveform from "@/components/Waveform";
import React, { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

const FeedList: React.FC = () => {
    const [offset, setOffset] = useState<number>(0);


    // use tracks endpoint — namesearch example (lofi), mp32 audio, boost popularity_total
    const endpoint = `/api/jamendo/tracks?limit=12&offset=${offset}&boost=listens_total&datebetween=2020-01-01_2025-11-20&fuzzytags=pop&groupby=artist_id`;
    const { data, error, isLoading } = useSWR<any>(endpoint, fetcher);

    if (error)
        return (
            <div className="p-6">
                <div className="max-w-3xl mx-auto alert alert-error shadow-lg">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2M12 6v6" />
                        </svg>
                        <span>Failed to load tracks — {error.message}</span>
                    </div>
                </div>
            </div>
        );

    if (!data)
        return (
            <div className="p-6">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="skeleton h-6 w-1/3 rounded" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card w-full bg-base-200 shadow-sm">
                                <div className="skeleton h-40 rounded-t-lg" />
                                <div className="card-body">
                                    <div className="skeleton h-4 w-3/4 mb-2" />
                                    <div className="skeleton h-3 w-full mb-2" />
                                    <div className="skeleton h-3 w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );

    // data.results is the array of tracks
    const results: any[] = Array.isArray(data?.results) ? data.results : [];

    return (
        <div className="p-6 min-h-[60vh]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Jamendo Tracks (lofi)</h1>
                        <p className="text-sm text-muted mt-1">
                            {data?.headers?.results_count ?? results.length} items
                            {data?.headers?.next ? " • more available" : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOffset((s) => Math.max(0, s - 10))}
                            className="btn btn-sm btn-ghost"
                            disabled={offset === 0 || isLoading}
                            title="Previous 10"
                        >
                            Prev
                        </button>

                        <button
                            onClick={() => setOffset((s) => s + 10)}
                            className="btn btn-sm"
                            disabled={isLoading}
                            title="Next 10"
                        >
                            Next
                        </button>

                        <button
                            onClick={() => setOffset(0)}
                            className="btn btn-sm btn-ghost"
                            disabled={offset === 0 || isLoading}
                            title="Reset to first page"
                        >
                            Reset
                        </button>

                        <span className="text-xs text-muted">{isLoading ? "Refreshing…" : `offset: ${offset}`}</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((track) => {
                        // jamendo tracks: name, artist_name, album_image, audio, shareurl, releasedate
                        const title = track?.name ?? `Untitled (${track?.id})`;
                        const artist = track?.artist_name ?? "";
                        const textShort = `${artist} • ${track?.releasedate ?? ""}`;
                        const image = track?.album_image ?? ""; // album_image provided by API
                        const audio = track?.audio ?? "";
                        const external = track?.shareurl ?? track?.shorturl ?? "#";

                        return (
                            <article
                                key={track?.id ?? Math.random}
                                className="card card-compact bg-base-300 shadow-md hover:shadow-md transition-shadow duration-150"
                                aria-labelledby={`track-${track?.id}-title`}
                            >
                                <figure>
                                    <ImageWithChecks
										src={image ?? ""}
										alt={title ?? "song image"}
										loading="eager"
										width={800}
										height={450}
										className="w-full h-full object-cover"
										wrapperClassName="w-full h-full"
									/>
                                </figure>

                                <div className="card-body">
                                    <header>
                                        <h3 id={`track-${track?.id}-title`} className="card-title truncate" title={title}>
                                            {title}
                                        </h3>
                                        {artist && (
                                            <p className="text-xs text-muted mt-1 line-clamp-1">{artist}</p>
                                        )}
                                    </header>

                                    <p className="text-sm text-base-content/70 flex-1 leading-relaxed">{textShort}</p>



                                    {/* audio player */}
                                    <Waveform audioUrl={audio} />

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-outline">{track?.license_ccurl ? "CC" : "unknown"}</span>
                                            <time className="text-xs text-muted">{track?.releasedate ?? ""}</time>
                                        </div>

                                        <a href={external} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost border border-white">
                                            Open
                                        </a>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* empty */}
                {results.length === 0 && (
                    <div className="mt-6 alert alert-warning">
                        <div>
                            <span>No tracks found.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedList;
