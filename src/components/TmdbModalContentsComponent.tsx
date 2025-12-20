"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImdb } from "@fortawesome/free-brands-svg-icons";
import React from "react";
import ImageWithChecks from "./ImageCheck";

type TmdbModalContentsProps = {
    id: number;
    closeModal: () => void;
};



// Interface for the API response
interface MovieDetails {
    id: number;
    title: string;
    overview: string | null;
    tagline: string | null;
    status: string;
    runtime: number | null;
    imdbId: string | null;
    homepage: string | null;
    budget: bigint;
    revenue: bigint;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string | null;
    originalLang: string | null;
    originalTitle: string | null;
    voteAverage: number;
    genres: string[];
}
const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
});

const TmdbModalContents: React.FC<TmdbModalContentsProps> = ({
    id,
    closeModal,
}) => {
    const ImdbUrl = process.env.NEXT_PUBLIC_IMDBURL || "https://www.imdb.com/title/";

    const { data, error, isLoading } = useSWR<MovieDetails>(
        id ? `/api/tmdb/movie/${id}` : null, 
        fetcher,
        {
            revalidateOnFocus: false, // Don't refetch when clicking back to tab
            dedupingInterval: 60000, // Cache for 1 minute in SWR
        }
    );
    const [isImageLoaded, setIsImageLoaded] = useState(false);


    // Scroll Lock
    useEffect(() => {
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY);
        };
    }, []);

    // Preload Image
    useEffect(() => {
        if (!data?.posterPath) return;
        let mounted = true;
        const img = new window.Image();
        img.src = data.posterPath;
        img.onload = () => mounted && setIsImageLoaded(true);
        img.onerror = () => mounted && setIsImageLoaded(true);
        return () => { mounted = false; };
    }, [data?.posterPath]);

    // Handle Escape Key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal]);

    // --- Helpers ---
    const formatRuntime = (mins?: number | null) => {
        if (!mins) return "—";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatDate = (iso?: string | null) => {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "—";
        }
    };

    const genreList = (arr?: string[]) => arr && arr.length ? arr.join(", ") : "—";

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="p-3 rounded-lg bg-base-100 text-base-content text-center">
                    <span className="loading text-base-content loading-spinner loading-xl"></span>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (error || !data) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="text-center text-error bg-base-100 p-6 rounded-lg shadow-xl border border-error/20">
                    <p className="font-bold">Failed to load data.</p>
                    <button className="btn btn-sm btn-ghost mt-4" onClick={closeModal}>Close</button>
                </div>
            </div>
        );
    }

    // Ensure data exists before rendering main content
    if (!data) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-20"
            onClick={closeModal}
        >
            {/* MODAL CARD */}
            {/* 1. bg-base-100: Uses Theme Color (White in Light, Dark in Dark). REMOVED data-theme="dark". */}
            {/* 2. rounded-t-2xl sm:rounded-xl: Rounded top on mobile, fully rounded on desktop. */}
            {/* 3. max-h-[90vh]: Ensures it fits on screen. */}
            <div

                className="relative w-full sm:max-w-4xl bg-base-100 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto flex flex-col rounded-t-2xl rounded-b-none sm:rounded-xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}


                {/* HEADER IMAGE (Backdrop) */}
                <div
                    data-theme="dark"
                    className="relative w-full shrink-0">
                    {data.backdropPath ? (
                        // Height adapted for mobile (h-44) vs desktop (h-64)
                        <div className="relative h-44 md:h-64 w-full bg-base-200">
                            <ImageWithChecks
                                wrapperClassName="w-full h-full"                                 
                                src={data.backdropPath}
                                alt={`${data.title} Backdrop`}
                                fill
                                className="object-cover opacity-90" // Increased opacity for vibrancy
                            />
                            {/* Gradient to blend into the card background (base-100) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent" />

                            <div className="absolute left-4 bottom-4 pr-16">
                                {/* Title adapts to theme via base-content, OR force visibility if over image */}
                                {/* Using text-white/base-content mix depending on contrast needs */}
                                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                                    {data.title}
                                </h1>
                                {data.tagline && (
                                    <p className="text-sm opacity-90 text-gray-200 italic drop-shadow-sm">{data.tagline}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-44 md:h-64 bg-base-200 flex items-center justify-center">
                            <h1 className="text-2xl font-bold text-base-content">{data.title}</h1>
                        </div>
                    )}
                    <button
                        className="btn btn-md btn-circle btn-ghost bg-black/30 hover:bg-black/50 absolute right-4 top-4 z-50 text-white border-none"
                        onClick={closeModal}
                    >
                        ✕
                    </button>
                </div>

                {/* CONTENT BODY */}
                <div className="card-body p-4 md:p-6 bg-base-100 text-base-content">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Poster */}
                        <div className="hidden sm:flex sm:w-1/4 md:w-1/3 items-center">
                            <div className="overflow-hidden shadow">
                                {!isImageLoaded ? (
                                    <div className="rounded-lg h-56 md:h-80 w-full bg-base-300 animate-pulse" />
                                ) : data.posterPath ? (
                                    <ImageWithChecks
                                        wrapperClassName="w-full h-auto"
                                        src={data.posterPath}
                                        alt={`${data.title} Poster`}
                                        width={300}
                                        height={450}
                                        className="rounded-lg border border-base-content/70 h-auto"
                                    />
                                ) : (
                                    <div className="h-56 md:h-80 w-full bg-gray-700 flex items-center justify-center text-white">
                                        No Poster
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="w-full sm:w-3/4 md:w-2/3 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between pt-2 flex-col-reverse">
                                    <h3 className="flex items-center text-xl font-extrabold mt-1 sm:mt-0">Overview</h3>

                                    <div className="flex w-full sm:w-auto justify-between gap-2 mb-1 sm:mb-0 items-center">

                                        {/* LEFT GROUP: Date & Language */}
                                        <div className="flex gap-2">
                                            {data.releaseDate && <div className="badge badge-outline px-3 font-mono">
                                                {formatDate(data.releaseDate)}
                                            </div>}
                                            <div className="badge badge-outline px-3 uppercase">
                                                {data.originalLang ?? "EN"}
                                            </div>
                                        </div>

                                        {/* RIGHT GROUP: Runtime */}
                                        {/* On mobile, this gets pushed to the far right. On desktop, it sits next to the others. */}
                                        <div className="badge badge-outline px-3 font-mono">
                                            {formatRuntime(data.runtime)}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-2 mb-4 text-sm">{data.overview || "No synopsis available."}</p>
                            </div>

                            <div className="flex flex-col gap-4 text-sm mt-2 p-3 bg-base-200 rounded-lg">
                                <div>
                                    <p className="text-xs uppercase opacity-60 font-semibold tracking-wide">Genres</p>
                                    <p className="font-medium">{genreList(data.genres)}</p>
                                </div>
                                <div className="grid grid-cols-2 space-y-3">
                                    <div>
                                        <p className="text-xs uppercase opacity-60 font-semibold tracking-wide">Status</p>
                                        <p className="font-medium">{data.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase opacity-60 font-semibold tracking-wide">Original Title</p>
                                        <p className="truncate font-medium">{data.originalTitle??data.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase opacity-60 font-semibold tracking-wide">Budget</p>
                                        <p className="font-medium">{data.budget.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase opacity-60 font-semibold tracking-wide">Revenue</p>
                                        <p className="truncate font-medium">{data.revenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="my-5 flex justify-end gap-3">
                                {data.homepage && (
                                    <a
                                        href={data.homepage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm md:btn-md"
                                    >
                                        Watch Now
                                    </a>
                                )}
                                {data.imdbId && (
                                    <a
                                        href={`${ImdbUrl}${data.imdbId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline btn-sm md:btn-md gap-2"
                                    >
                                        <FontAwesomeIcon icon={faImdb} className="text-xl" />
                                        IMDb
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TmdbModalContents;