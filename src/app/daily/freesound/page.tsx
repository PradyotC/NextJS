"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Waveform from "@/components/Waveform";

const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    }).catch(err => {
        if (err.name === 'AbortError') {
            console.log('Audio loading aborted.');
        } else {
            console.error('Other error:', err);
        }
    });

const FreesoundPage: React.FC = () => {
    const [offset, setOffset] = useState<number>(0);
    const limit = 10;
    const fields = "id,name,previews,license,username,duration";

    const endpoint = `/api/freesound/search/text/?query=piano&limit=${limit}&offset=${offset}&fields=${encodeURIComponent(
        fields
    )}`;

    const { data, error, isLoading } = useSWR<any>(endpoint, fetcher);

    // safe access helpers
    const getPreviewUrl = (item: any) => {
        return (
            item?.previews?.["preview-hq-mp3"] ||
            item?.previews?.["preview-lq-mp3"] ||
            item?.previews?.preview ||
            item?.previews?.["preview-hq-ogg"] ||
            ""
        );
    };

    if (error)
        return (
            <div className="p-6">
                <div className="max-w-3xl mx-auto alert alert-error shadow-lg">
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current flex-shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2M12 6v6" />
                        </svg>
                        <span>Failed to load freesound — {error.message}</span>
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
                                <div className="skeleton h-28 rounded-t-lg" />
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

    const results: any[] = Array.isArray(data?.results) ? data.results : [];

    return (
        <div className="p-6 bg-base-100 min-h-[60vh]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Freesound — piano (sample search)</h1>
                        <p className="text-sm text-muted mt-1">Showing {results.length} results • offset: {offset}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOffset((s) => Math.max(0, s - limit))}
                            className="btn btn-sm btn-ghost"
                            disabled={offset === 0 || isLoading}
                            title="Previous 10"
                        >
                            Prev
                        </button>

                        <button onClick={() => setOffset((s) => s + limit)} className="btn btn-sm" disabled={isLoading} title="Next 10">
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

                        <span className="text-xs text-muted">{isLoading ? "Loading…" : `offset: ${offset}`}</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((item, idx) => {
                        const preview = getPreviewUrl(item);
                        const title = item?.name ?? `Sound ${item?.id ?? ""}`;
                        const username = item?.username ?? "unknown";
                        const license = item?.license ?? "unknown";

                        return (
                            <article
                                key={item?.id ?? `fs-${idx}`}
                                className="card card-compact bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-150"
                                aria-labelledby={`fs-${item?.id}-title`}
                            >
                                <div className="p-4">
                                    <Waveform
                                        audioUrl={preview}
                                    />
                                </div>

                                <div className="card-body">
                                    <header>
                                        <h3 id={`fs-${item?.id}-title`} className="card-title truncate" title={title}>
                                            {title}
                                        </h3>
                                        <p className="text-xs text-muted mt-1 line-clamp-1">
                                            by {username} • <span className="font-mono text-xs">{license}</span>
                                        </p>
                                    </header>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-outline">Freesound</span>
                                            <span className="text-xs text-muted">
                                                {item?.duration ? `${Math.round(item.duration)}s` : ""}
                                            </span>
                                        </div>
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
                            <span>No sounds found.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreesoundPage;