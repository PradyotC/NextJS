"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faRotateRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Stock Detail Error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center text-base-content">
      <div className="bg-base-200 p-8 rounded-3xl shadow-sm border border-base-content/5 max-w-md w-full">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-3xl" />
        </div>

        <h3 className="text-2xl font-bold mb-2">Could Not Load Stock</h3>
        
        <p className="text-base-content/70 mb-8 leading-relaxed">
          {error.message?.includes("Limit") 
             ? "API rate limit reached. Please wait a moment." 
             : "We encountered an error loading this ticker. It might be an invalid symbol or a temporary network issue."}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => reset()} 
            className="btn btn-primary w-full gap-2 rounded-xl"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Try Again
          </button>
          
          <Link href="/daily/stocks" className="btn btn-ghost w-full gap-2 rounded-xl">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}