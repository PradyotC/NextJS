"use client";
import { useState, useEffect } from "react";
import {
    faCalendar,
    faPlayCircle,
    faStar,
    IconDefinition,
} from "@fortawesome/free-regular-svg-icons";
import { faArrowTrendUp, faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import React from "react";
import useSWR from "swr";
import TmdbModalContents from "./TmdbModalContentsComponent";

type ComponentProp = { path: string; onOpenItem?: (item: any) => void };

type TabInfo = {
    label: string;
    path: string;
    default: boolean;
    icon: IconDefinition;
};

const TmdbImageBaseUrl = process.env.NEXT_PUBLIC_TMDBIMAGEBASEURL;

const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

const SkeletonGrid: React.FC<{ num: number }> = ({ num }) => {
    return (
        <div className="container mx-auto px-4" aria-hidden>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {Array.from({ length: num }).map((_, idx) => (
                    <div
                        key={idx}
                        className="w-xl max-w-sm bg-base-100 rounded-xl shadow-sm p-8 flex flex-col"
                    >
                        <div className="w-full aspect-[4/3] rounded-xl bg-base-300 animate-pulse"></div>
                        <div className="mt-4 space-y-3">
                            <div className="h-4 w-1/2 rounded-full bg-base-300 animate-pulse"></div>
                            <div className="h-4 w-full rounded-full bg-base-300 animate-pulse"></div>
                            <div className="h-4 w-4/5 rounded-full bg-base-300 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TmdbComponent: React.FC = () => {
    const tabs: TabInfo[] = [
        { label: "Now Playing", path: "movie/now_playing", default: true, icon: faPlayCircle },
        { label: "Popular", path: "movie/popular", default: false, icon: faFire },
        { label: "Trending", path: "trending/movie/week?language=en-US", default: false, icon: faArrowTrendUp },
        { label: "Top Rated", path: "movie/top_rated", default: false, icon: faStar },
        { label: "Upcoming", path: "movie/upcoming", default: false, icon: faCalendar },
    ];

    const groupName = `tmdb-tabs`;
    const initial = tabs.find((t) => t.default)?.path ?? tabs[0].path;
    const [mounted, setMounted] = useState<Set<string>>(new Set([initial]));
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
             document.body.style.overflow = 'unset';
        };
    }, [selectedItem]);

    const handleActivate = (path: string) => {
        setMounted((prev) => {
            if (prev.has(path)) return prev;
            const next = new Set(prev);
            next.add(path);
            return next;
        });
    };

    const openItemModal = (item: any) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    return (
        <div className="py-10 px-1 lg:px-10">
            <div className="tabs tabs-lift">
                {tabs.map((tab) => {
                    const safeId = tab.path.replace(/[^a-zA-Z0-9_-]/g, "-");
                    const inputId = `tab-input-${safeId}`;

                    return (
                        <React.Fragment key={tab.path}>
                            <label className="tab flex items-center gap-2" htmlFor={inputId}>
                                <input
                                    id={inputId}
                                    type="radio"
                                    name={groupName}
                                    defaultChecked={!!tab.default}
                                    className="hidden"
                                    onChange={() => handleActivate(tab.path)}
                                />
                                <span className="inline-flex items-center justify-center w-5 h-5 flex-shrink-0">
                                    <FontAwesomeIcon icon={tab.icon} style={{ width: 16, height: 16 }} />
                                </span>
                                <span>{tab.label}</span>
                            </label>

                            <div className="tab-content bg-base-100 border-base-300 py-12">
                                {mounted.has(tab.path) ? (
                                    <TmdbSWR path={tab.path} onOpenItem={openItemModal} />
                                ) : (
                                    <div className="flex items-center justify-center text-sm text-base-content/70 max-w-full py-8">
                                        <span className="loading loading-spinner text-primary mr-2"></span>
                                        <span>Tab content will load when selected</span>
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Custom Modal Render Logic */}
            {selectedItem && (
                <TmdbModalContents id={selectedItem.id} closeModal={closeModal} />
            )}
        </div>
    );
};

// ... (TmdbSWR and TmdbItem components remain exactly the same as previous steps) ...
// Copy TmdbSWR and TmdbItem from previous turn or existing code
const TmdbSWR: React.FC<ComponentProp> = ({ path, onOpenItem }) => {
    const cleanedPath = path.startsWith("/") ? path : `/${path}`;
    const finalUrl = `/api/tmdb${cleanedPath}`;

    const { data, error, isLoading } = useSWR(finalUrl, fetcher, {
        refreshInterval: 15 * 60 * 1000,
        revalidateOnFocus: true,
        dedupingInterval: 60_000,
    });
    if (isLoading) return <SkeletonGrid num={12} />;
    if (error) return <div className="text-error">Error loading data</div>;
    if (!data) return <div>No Data</div>;

    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {data?.results?.map((item: any) => (
                    <TmdbItem
                        item={item}
                        key={item.id}
                        onOpen={() => onOpenItem?.(item)}
                    />
                ))}
            </div>
        </div>
    );
};

const TmdbItem: React.FC<{ item: any; onOpen?: () => void }> = ({
    item,
    onOpen,
}) => {
    const ratingScore = item.vote_average ? Math.round(item.vote_average) : 0;
    return (
        <div className="hover-3d w-full max-w-md">
            <div
                className="card w-full h-full border border-base-300 shadow-sm bg-base-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg"
                role="button"
                tabIndex={0}
                aria-pressed="false"
                onClick={onOpen}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpen?.();
                    }
                }}
            >
                <figure className="relative" style={{ aspectRatio: "4 / 3" }}>
                    {item.poster_path ? (
                        <Image
                            src={`${TmdbImageBaseUrl}${item.poster_path}`}
                            alt={`${item.title} Poster`}
                            loading="eager"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                        />
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
                            style={
                                {
                                    "--value": Math.round(item.vote_average * 10),
                                    "--size": "3rem",
                                    "--thickness": "4px",
                                } as React.CSSProperties
                            }
                            aria-valuenow={Math.round(item.vote_average * 10)}
                            role="progressbar"
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
                        className="text-base-content/70 mt-2 overflow-hidden text-sm"
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
    );
};

export default TmdbComponent;