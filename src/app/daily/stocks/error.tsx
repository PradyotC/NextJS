"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faRotateRight, faChartLine } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Stocks Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center text-base-content">
      <div className="bg-base-200 p-8 rounded-3xl shadow-sm border border-base-content/5 max-w-md w-full">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faChartLine} className="text-3xl" />
          <div className="absolute -mt-6 -mr-6 bg-base-100 rounded-full p-1">
             <FontAwesomeIcon icon={faTriangleExclamation} className="text-error text-lg" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2">Market Data Unavailable</h3>
        
        <p className="text-base-content/70 mb-8 leading-relaxed">
          {error.message?.includes("Limit") 
            ? "The API rate limit has been reached. Please wait a moment before trying again."
            : "We couldn't fetch the latest stock market data. Please check your connection or try again later."}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => reset()} 
            className="btn btn-primary w-full gap-2 rounded-xl"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Retry Fetch
          </button>
          
          <Link href="/daily" className="btn btn-ghost w-full rounded-xl">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}