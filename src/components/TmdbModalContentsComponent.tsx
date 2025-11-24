import { useEffect, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImdb } from "@fortawesome/free-brands-svg-icons";
import React from "react";


type TmdbModalContentsProps = {
    id: number;
    closeModal: () => void;
}

const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

const TmdbModalContents: React.FC<TmdbModalContentsProps> = ({ id, closeModal }) => {
    const TmdbImageBaseUrl = process.env.NEXT_PUBLIC_TMDBIMAGEBASEURL;
    const TmdbBackdropBaseUrl = process.env.NEXT_PUBLIC_TMDBBACKDROPBASEURL;
    const ImdbUrl  = process.env.NEXT_PUBLIC_IMDBURL;

    // Hooks must run unconditionally
    const { data, error } = useSWR(`/api/tmdb/movie/${id}`, fetcher, {
        refreshInterval: 15 * 60 * 1000,
        revalidateOnFocus: true,
        dedupingInterval: 60_000,
    });

    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // safe effect — depends on data?.poster_path and exits early if missing
    useEffect(() => {
        if (!data?.poster_path) {
            // ensure we don't try to preload if there's no poster
            return;
        }

        let mounted = true;
        const img = new window.Image();
        img.src = `${TmdbImageBaseUrl}${data.poster_path}`;
        img.onload = () => mounted && setIsImageLoaded(true);
        img.onerror = () => mounted && setIsImageLoaded(true);

        return () => {
            mounted = false;
        };
    }, [TmdbImageBaseUrl, data.poster_path]);

    // Guard: do not render UI that touches data fields until data is available.
    if (!data && !error) {
        return (
            <div className="p-6 text-center">
                <span className="loading text-white text-extrabold loading-spinner loading-xl"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-error">
                Failed to load data.
            </div>
        );
    }

    const formatRuntime = (mins?: number) => {
        if (mins === undefined || mins === null) return "—";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatDate = (iso?: string) => {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return iso;
        }
    };

    const genreList = (arr?: any[]) =>
        arr && arr.length ? arr.map((g) => g.name).join(", ") : "—";

    return (
        <React.Fragment>
            <div className="modal-box bg-black/0  max-w-4xl p-0">
                <form method="dialog">
                    <button
                        className="btn btn-lg btn-circle btn-ghost bg-black/50 absolute right-4 top-4 z-30"
                        onClick={() => {
                            closeModal();
                        }}
                    >
                        ✕
                    </button>
                </form>
                <div className="w-full max-w-4xl mx-auto">
                    <div className="card bg-base-100 rounded-lg shadow-lg">
                        {/* Backdrop */}
                        <div className="rounded-lg overflow-hidden mb-4 shadow-md">
                            {data.backdrop_path ? (
                                <div className="relative h-44 md:h-64 w-full bg-base-200">
                                    <Image
                                        src={`${TmdbBackdropBaseUrl}${data.backdrop_path}`}
                                        alt={`${data.title} Backdrop`}
                                        fill
                                        className="object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-base-100/90" />
                                    <div className="absolute left-4 bottom-4">
                                        <h1 className="text-2xl md:text-3xl font-bold">
                                            {data.title}
                                        </h1>
                                        {data.tagline && (
                                            <p className="text-sm opacity-80">{data.tagline}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-44 md:h-64 bg-base-200 flex items-center justify-center">
                                    <h1 className="text-2xl">{data.title}</h1>
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="card-body p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Poster */}
                                <div className="sm:w-1/4 w-0 md:w-1/3 flex items-center">
                                    <div className="rounded-lg overflow-hidden shadow">
                                        {!isImageLoaded ? (
                                            <div className="h-56 md:h-80 w-full bg-base-300 animate-pulse" />
                                        ) : data.poster_path ? (
                                            <Image
                                                src={`${TmdbImageBaseUrl}${data.poster_path}`}
                                                alt={`${data.title} Poster`}
                                                width={300}
                                                height={300}
                                                className="object-cover"
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
                                    <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between py-3">
                                        <div className="text-sm flex items-center opacity-80">{genreList(data.genres)}</div>
                                        <div className="flex gap-3 whitespace-nowrap">
                                            <div className="badge badge-outline px-3">
                                                {formatDate(data.release_date)}
                                            </div>
                                            <div className="badge badge-outline px-3">
                                                {formatRuntime(data.runtime)}
                                            </div>
                                            <div className="badge badge-outline px-3">
                                                {data.original_language?.toUpperCase() ?? "—"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <h3 className="text-xl font-extrabold mb-2">Overview</h3>
                                        <p className="text-sm">{data.overview}</p>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs opacity-70">Status</p>
                                            <p className="font-medium">{data.status}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-70">Original Title</p>
                                            <p className="font-medium">{data.original_title}</p>
                                        </div>
                                    </div>

                                    <div className="my-5 flex justify-end gap-3">
                                        {data.homepage && (
                                            <a
                                                href={data.homepage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-md"
                                            >
                                                Watch
                                            </a>
                                        )}
                                        {data.imdb_id && (
                                            <a
                                                href={`${ImdbUrl}${data.imdb_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline btn-md rounded-full"
                                            >
                                                <FontAwesomeIcon icon={faImdb} />
                                                IMDB
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default TmdbModalContents;