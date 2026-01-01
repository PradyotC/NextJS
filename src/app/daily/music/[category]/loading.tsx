import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";

export default function Loading() {
  return (
    <div className="min-h-screen p-6 xl:p-10 text-base-content">
      {/* Header skeleton animate-pulse */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <FontAwesomeIcon icon={faHeadphones} className="text-base-content/20 text-4xl" />
           <div className="skeleton animate-pulse h-10 w-48 rounded-lg bg-base-content/10"></div>
        </div>
        <div className="skeleton animate-pulse h-5 w-64 rounded bg-base-content/10 mt-2"></div>

        {/* Category Tabs skeleton animate-pulse */}
        <div className="flex flex-wrap gap-2 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton animate-pulse h-8 w-16 rounded-lg bg-base-content/10"></div>
          ))}
        </div>
      </header>

      {/* Grid skeleton animate-pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="card bg-base-200 border border-base-content/5 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Image Placeholder */}
            <div className="aspect-video w-full skeleton animate-pulse bg-base-content/10" />

            {/* Content Body */}
            <div className="p-5 flex flex-col flex-1 gap-4">
              <div>
                <div className="skeleton animate-pulse h-6 w-3/4 mb-2 bg-base-content/10 rounded"></div>
                <div className="skeleton animate-pulse h-4 w-1/2 bg-base-content/10 rounded"></div>
              </div>

              {/* Player Placeholder (Bottom) */}
              <div className="mt-auto pt-4 border-t border-base-content/10 flex items-center gap-4">
                 {/* Play Button Circle */}
                 <div className="skeleton animate-pulse h-8 w-8 rounded-full bg-base-content/10 flex-shrink-0"></div>
                 {/* Waveform Lines */}
                 <div className="flex-1 flex items-end gap-1 h-8 opacity-30">
                     <div className="skeleton animate-pulse w-1 h-full bg-base-content/20 rounded-full"></div>
                     <div className="skeleton animate-pulse w-1 h-2/3 bg-base-content/20 rounded-full"></div>
                     <div className="skeleton animate-pulse w-1 h-1/2 bg-base-content/20 rounded-full"></div>
                     <div className="skeleton animate-pulse w-1 h-3/4 bg-base-content/20 rounded-full"></div>
                     <div className="skeleton animate-pulse w-full h-2 bg-base-content/10 rounded-full"></div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}