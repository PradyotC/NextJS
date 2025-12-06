import { toSentenceCase } from "@/lib/util";
import Link from "next/link";
import React from "react";

const NewsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const categories = [
        "general",
        "world",
        "nation",
        "business",
        "technology",
        "entertainment",
        "sports",
        "science",
        "health",
    ];
    return (
        <div className="flex flex-col lg:flex-row">
            <div className="sticky top-16 lg:top-24 lg:h-fit my-4 p-4 lg:m-4 lg:p-6 border-2 border-gray-700 bg-gray-900 rounded-none lg:rounded-lg shadow-xl text-white">
                <ul className="flex flex-row lg:flex-col lg:justify-center space-x-4 lg:space-y-10 overflow-x-scroll no-scrollbar">
                    {categories.map((str, index) => (
                        <li key={index}>
                            <Link href={`/news/${str}`}>
                                {toSentenceCase(str)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col m-0 p-4 lg:m-8 lg:p-6 border-2 border-gray-700 bg-gray-900 rounded-lg shadow-xl">
                {children}
            </div>
        </div>
    );
};

export default NewsLayout;
