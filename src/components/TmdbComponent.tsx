"use client";
import { useState, useRef } from "react";
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
						{/* Image skeleton */}
						<div className="w-full aspect-[4/3] rounded-xl bg-base-300 animate-pulse"></div>

						{/* Text skeleton rows */}
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
		{
			label: "Now Playing",
			path: "movie/now_playing",
			default: true,
			icon: faPlayCircle,
		},
		{ label: "Popular", path: "movie/popular", default: false, icon: faFire },
		{
			label: "Trending",
			path: "trending/movie/week?language=en-US",
			default: false,
			icon: faArrowTrendUp,
		},
		{
			label: "Top Rated",
			path: "movie/top_rated",
			default: false,
			icon: faStar,
		},
		{
			label: "Upcoming",
			path: "movie/upcoming",
			default: false,
			icon: faCalendar,
		},
	];

	const groupName = `tmdb-tabs`;
	const initial = tabs.find((t) => t.default)?.path ?? tabs[0].path;
	const [mounted, setMounted] = useState<Set<string>>(new Set([initial]));
	const [selectedItem, setSelectedItem] = useState<any | null>(null);
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	const handleActivate = (path: string) => {
		setMounted((prev) => {
			if (prev.has(path)) return prev;
			const next = new Set(prev);
			next.add(path);
			return next;
		});
	};

	const openItemModal = (item: any) => {
		setTimeout(() => {
			setSelectedItem(item);
			if (dialogRef.current) {
				if (!dialogRef.current.open) {
					dialogRef.current.showModal();
				}
			};
		}, 200)
	};

	const closeModal = () => {
		setTimeout(() => {
			if (dialogRef.current) dialogRef.current.close();
			setSelectedItem(null)
		}, 200);
	};

	return (
		<React.Fragment>
			<div className="tabs tabs-lift">
				{tabs.map((tab) => {
					const safeId = tab.path.replace(/[^a-zA-Z0-9_-]/g, "-");
					const inputId = `tab-input-${safeId}`;

					return (
						<React.Fragment key={tab.path}>
							{/* Label wraps the radio input (DaisyUI expects input BEFORE content) */}
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
									<FontAwesomeIcon
										icon={tab.icon}
										style={{ width: 16, height: 16 }}
									/>
								</span>

								<span>{tab.label}</span>
							</label>

							<div className="tab-content bg-base-100 border-base-300 py-12">
								{mounted.has(tab.path) ? (
									<TmdbSWR path={tab.path} onOpenItem={openItemModal} />
								) : (
									<div className="flex items-center justify-center text-sm text-muted max-w-full py-8">
										<svg
											className="animate-spin mr-2 h-5 w-5 text-gray-400"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
												fill="none"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
											/>
										</svg>
										<span>Tab content will load when selected</span>
									</div>
								)}
							</div>
						</React.Fragment>
					);
				})}
			</div>



			{/* Shared modal (native dialog) */}
			<dialog id="tmdb_item_modal" ref={dialogRef} className="modal">
				{selectedItem ? (
					<TmdbModalContents id={selectedItem.id} closeModal={closeModal}/>
				) : (
					<div>
						<h3 className="font-bold text-lg">No item selected</h3>
					</div>
				)}
			</dialog>
		</React.Fragment>
	);
};

const TmdbSWR: React.FC<ComponentProp> = ({ path, onOpenItem }) => {
	const cleanedPath = path.startsWith("/") ? path : `/${path}`;
	const finalUrl = `/api/tmdb${cleanedPath}`;

	const { data, error, isLoading } = useSWR(finalUrl, fetcher, {
		refreshInterval: 15 * 60 * 1000,
		revalidateOnFocus: true,
		dedupingInterval: 60_000,
	});
	if (isLoading) return <SkeletonGrid num={12} />;
	if (error) return <div className="text-red-600">Error loading data</div>;
	if (!data) return <div>No Data</div>;

	return (
		// outer grid container: centers content and creates responsive columns
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
	return (
		<div className="hover-3d">
			<div
				className="card w-full max-w-md border border-white shadow-sm bg-neutral flex flex-col overflow-hidden"
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
				{/* poster: positioned parent for Image fill */}
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
						<div className="h-full w-full bg-gray-700" />
					)}
				</figure>

				{item.vote_average !== undefined && (
					<div className="absolute z-50 right-3 top-3 md:top-4 md:right-4 bg-black/50 backdrop-blur-lg p-1 rounded-full">
						<div
							className={`radial-progress font-extrabold text-rating-gradient-${Math.round(
								item.vote_average
							)}`}
							style={
								{
									"--value": Math.round(item.vote_average * 10),
									"--size": "3rem",
									"--thickness": "7px",
								} as React.CSSProperties
							}
							aria-valuenow={Math.round(item.vote_average * 10)}
							role="progressbar"
						>
							{Math.round(item.vote_average * 10)}
						</div>
					</div>
				)}

				<div className="card-body flex flex-col p-4">
					<h2 className="card-title text-white flex items-center justify-between">
						<span className="truncate">{item.title}</span>
						<span className="badge badge-info ml-2">
							{/* {item.release_date ? item.release_date : 'N/A'} */}
							{item.release_date
								? new Date(item.release_date).getFullYear()
								: "N/A"}
						</span>
					</h2>

					<p
						className="text-white opacity-90 mt-2 overflow-hidden"
						style={{ maxHeight: "4.5em", textOverflow: "ellipsis" }}
					>
						{item.overview || "No overview available."}
					</p>

					<div className="card-actions flex flex-wrap items-center gap-2 my-2">

						{item.popularity !== undefined && (
							<div className="badge badge-warning gap-2">
								🔥 {Math.round(item.popularity)}
							</div>
						)}

						{item.genre_ids?.length > 0 && (
							<div className="badge badge-outline">
								Genre ID: {item.genre_ids[0]}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TmdbComponent;
