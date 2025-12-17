// src/app/news/[category]/loading.tsx

export default function Loading() {
  // Create an array to map over for multiple skeleton items
  const skeletons = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {skeletons.map((_, index) => (
        <div
          key={index}
          className="
            p-5
            bg-base-300
            border border-base-400
            rounded-xl
          "
        >
          {/* Title Skeleton */}
          <div className="h-7 bg-base-400 rounded w-3/4 mb-4 animate-pulse" />

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Image Skeleton - Matches aspect-video and width of real image */}
            <div className="w-full sm:w-5/12 rounded-2xl aspect-video bg-base-400 animate-pulse flex-shrink-0" />

            {/* Content Side */}
            <div className="flex-1 flex flex-col justify-between px-1 sm:px-3">
              {/* Description Lines */}
              <div className="space-y-3 mt-2 sm:mt-0">
                <div className="h-4 bg-base-400 rounded w-full animate-pulse" />
                <div className="h-4 bg-base-400 rounded w-11/12 animate-pulse" />
                <div className="h-4 bg-base-400 rounded w-4/5 animate-pulse" />
              </div>

              {/* Footer (Source & Date) */}
              <div className="pt-3 border-t border-base-500 mt-4 flex justify-end">
                <div className="h-4 bg-base-400 rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}