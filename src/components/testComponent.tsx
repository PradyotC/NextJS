"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import TmdbSearchSWR from "./TmdbSearchSWR";

interface TestProps {
    title: string;
    children?: React.ReactNode;
}

export const TestComponent: React.FC<TestProps> = ({
    title,
    children = null,
}) => {
    const [count, setCount] = useState(0);
    const router = useRouter();
    const handleRoute = (routeCount: number) => {
        router.push(`/test/${routeCount}`)
    }
    return (
        <div className="flex flex-col items-center justify-center p-25">
            <h3>{title}</h3>
            <br />
            <br />
            <button className="btn-primary" onClick={() => setCount(count + 1)}>
                {count}
            </button>
            <br />
            <br />
            <button className="btn-primary" onClick={() => handleRoute(count)}>Route Button</button>
            <br />
            <br />
            {children && <div>{children}</div>}
            <br />
            <br />
            <TmdbSearchSWR path="movie/popular"/>
        </div>
    );
};
