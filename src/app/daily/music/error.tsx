"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Music Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="alert alert-error max-w-lg shadow-lg mb-6">
        <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl" />
        <div className="flex-1 text-left">
          <h3 className="font-bold">Unable to load music</h3>
          <p className="text-sm opacity-90">
            {error.message || "Something went wrong while fetching tracks."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={() => reset()} className="btn btn-primary gap-2">
          <FontAwesomeIcon icon={faRotateRight} />
          Try Again
        </button>
        
        <Link href="/" className="btn btn-ghost">
          Return Home
        </Link>
      </div>
    </div>
  );
}