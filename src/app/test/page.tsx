"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import React from "react";

interface TestProps {
    title: string;
    children?: React.ReactNode;
}

const TestComponent: React.FC<TestProps> = ({
    title = null,
    children = null,
}) => {
    const [count, setCount] = useState(0);
    const router = useRouter();
    const handleRoute = (routeCount: number) => {
        router.push(`/test/${routeCount}`)
    }
    return (
        <div className="flex flex-col items-center justify-center p-2 md:p-15">
            <h3>{title}</h3>
            <br />
            <br />
            <button className="btn bg-color-base-content text-white" onClick={() => setCount(count + 1)}>
                {count}
            </button>
            <br />
            <br />
            <button className="btn bg-color-base-content text-white" onClick={() => handleRoute(count)}>Route Button</button>
            {children && <div><br /><br />{children}<br /><br /></div>}
        </div>
    );
};


const TestPage = () => {
    return <TestComponent title="Hi this is Test">This is Child</TestComponent>;
}

export default TestPage