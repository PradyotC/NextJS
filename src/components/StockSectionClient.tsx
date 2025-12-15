'use client';

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronUp,
    IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

// --- Props Type (Mirroring the Server Component's structure) ---
export type StockSectionData = {
    secName: string;
    secColor: string;
    secIcon: IconDefinition;
    secSubHeading: string;
    renderedList: React.ReactNode;
    defaultOpen: boolean;
};


export default function StockSectionClient({ item }: { item: StockSectionData }) {
    // State to control visibility on mobile (using the defaultOpen prop)
    const [isOpen, setIsOpen] = useState(item.defaultOpen);

    const { secName, secIcon, secSubHeading, renderedList, secColor } = item;
    const chevronIcon = isOpen ? faChevronUp : faChevronDown;

    const colors: Record<string, string>= {
        green: "success",
        red: "error",
        blue: "info",
    };

    const colorClass = `text-${colors[secColor]}`;


    return (
        <section
            // Padding reset for section wrapper
            className="py-5 px-3 lg:px-1.5 border border-2 border-base-400 bg-base-200/70 rounded-2xl backdrop-blur-sm"
            aria-labelledby={`${secName}-heading`}
        >
            {/* 1. Header Row (Visually changes layout based on screen size) */}
            <div 
                className="flex justify-around cursor-pointer lg:pointer-events-none" 
                // We make the whole div clickable for mobile UX,
                // but only on screens smaller than 'lg'
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 1A. Section Title and Subheading (Alignment controlled by flex parents) */}
                <div 
                    className="flex flex-col items-center w-full" 
                >
                    <h2
                        id={`${secName}-heading`}
                        className={`text-xl font-bold ${colorClass} flex items-center gap-2`}
                    >
                        <FontAwesomeIcon icon={secIcon} className="w-5 h-5" />
                        {secName}
                    </h2>
                    <p className="text-sm text-base-content/60">{secSubHeading}</p>
                </div>
                
                {/* 1B. Clickable Chevron/Button (Only visible on mobile/tablet) */}
                {/* We wrap the chevron in a button for accessibility, but control click via the parent div */}
                <button
                    type="button"
                    className="flex lg:hidden items-center"
                    aria-expanded={isOpen}
                    aria-controls={`${secName}-content`}
                    // The actual click handler is on the parent div for a larger target area
                >
                    <FontAwesomeIcon
                        icon={chevronIcon}
                        className={`w-4 h-4 p-2 mr-2 text-base-content/80 transition-transform duration-300 rounded-full hover:bg-base-content/90`}
                    />
                </button>
            </div>

            {/* 2. Collapsible Content Area */}
            <div
                id={`${secName}-content`}
                // Conditional classes for collapse logic
                className={`transition-all duration-300 ease-in-out overflow-hidden 
                    
                    /* Mobile/Tablet Collapsible State */
                    ${isOpen ? 'h-auto max-h-[2000px]' : 'max-h-0'} 
                    
                    /* Desktop State: Always visible */
                    lg:h-auto lg:max-h-full lg:mt-5`}
            >
                {/* Renders the pre-fetched and pre-rendered list of StockCard components */}
                {renderedList}
            </div>
        </section>
    );
}