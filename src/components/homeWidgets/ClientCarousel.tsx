"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Define supported colors
type WidgetColor = "blue" | "green" | "red" | "orange" | "purple" | "teal";

interface ClientCarouselProps {
  items: React.ReactNode[];
  autoPlayInterval?: number;
  title: string;
  icon?: React.ReactNode;
  color?: WidgetColor; // Renamed from colorClass to color
  href?: string;
}

// Tailwind classes must be full strings, not dynamic concatenations
const COLOR_VARIANTS: Record<WidgetColor, { text: string; bg: string }> = {
  blue:   { text: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-500" },
  green:  { text: "text-green-600 dark:text-green-400", bg: "bg-green-500" },
  red:    { text: "text-red-600 dark:text-red-400",     bg: "bg-red-500" },
  orange: { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500" },
  purple: { text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500" },
  teal:   { text: "text-teal-600 dark:text-teal-400",     bg: "bg-teal-500" },
};

export default function ClientCarousel({ 
  items, 
  autoPlayInterval = 10000, 
  title, 
  icon, 
  color = "blue", // Default color
  href
}: ClientCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Get the specific classes for the selected color
  const styles = COLOR_VARIANTS[color] || COLOR_VARIANTS.blue;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, items.length, autoPlayInterval, nextSlide]);

  if (!items.length) return null;

  return (
    <div 
      className="card bg-base-200 shadow-xl border border-base-400 h-full flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="card-body p-4 sm:p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          {href ? (
             <Link href={href} className={`card-title text-lg ${styles.text} flex gap-2 items-center hover:underline`}>
                {icon}
                {title}
             </Link>
          ) : (
             <h3 className={`card-title text-lg ${styles.text} flex gap-2 items-center`}>
                {icon}
                {title}
             </h3>
          )}

          {items.length > 1 && (
            <div className="flex gap-1">
              <button onClick={prevSlide} className="btn btn-xs btn-ghost btn-square" aria-label="Previous">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button onClick={nextSlide} className="btn btn-xs btn-ghost btn-square" aria-label="Next">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </div>

        {/* Content Window */}
        <div className="flex-1 relative overflow-hidden rounded-xl bg-base-300 border border-base-300">
          <div className="absolute inset-0 flex items-center justify-center p-2">
             {/* Key ensures animation restarts on index change */}
             <div key={activeIndex} className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-300">
                {items[activeIndex]}
             </div>
          </div>
        </div>

        {/* Indicators */}
        {items.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? `w-6 ${styles.bg}` // Use the specific background color
                    : "w-1.5 bg-base-content/20"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}