"use client";

import React from "react";
import useSWR from "swr";

type ComponentProp = {
    path: string;
}

const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

const TmdbSearchSWR: React.FC<ComponentProp> = ({path}) => {
    // Always ensure path starts with "/"
    const cleanedPath = path.startsWith("/") ? path : `/${path}`;

    // Final API route that hits your proxy
    const finalUrl = `/api/tmdb${cleanedPath}`;
    const { data, error, isLoading } = useSWR(finalUrl, fetcher);

    if (isLoading) return <div>Loading…</div>;
    if (error) return <div className="text-red-600">Error loading data</div>;
    if (!data) return <div>No Data</div>;

    return (
        <div>
            {data?.results?.map((item: any) => (
                <div key={item.id}>{item.title || item.name}</div>
            ))}
        </div>
    );
}

export default TmdbSearchSWR;
