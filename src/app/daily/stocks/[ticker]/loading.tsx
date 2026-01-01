import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto p-6 text-base-content">
      {/* Back Link skeleton animate-pulse */}
      <div className="inline-flex items-center gap-2 mb-8 text-base-content/60">
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        <div className="skeleton animate-pulse h-4 w-32 rounded bg-base-content/10"></div>
      </div>

      {/* Header skeleton animate-pulse */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-baseline gap-3">
          <div className="skeleton animate-pulse h-10 w-64 md:w-96 rounded-lg bg-base-content/10"></div>
          <div className="skeleton animate-pulse h-8 w-24 rounded bg-base-content/10"></div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton animate-pulse h-6 w-20 rounded-md bg-base-content/10"></div>
          ))}
        </div>
      </header>

      {/* Main Grid skeleton animate-pulse */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column (About + Stats) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Section */}
          <section className="bg-base-200 border border-base-content/5 rounded-2xl p-6">
             <div className="skeleton animate-pulse h-7 w-32 mb-4 bg-base-content/10 rounded"></div>
             <div className="space-y-2">
                 <div className="skeleton animate-pulse h-4 w-full bg-base-content/10 rounded"></div>
                 <div className="skeleton animate-pulse h-4 w-full bg-base-content/10 rounded"></div>
                 <div className="skeleton animate-pulse h-4 w-3/4 bg-base-content/10 rounded"></div>
             </div>
          </section>

          {/* Key Stats Section */}
          <section className="bg-base-200 border border-base-content/5 rounded-2xl p-6">
            <div className="skeleton animate-pulse h-7 w-40 mb-6 bg-base-content/10 rounded"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                        <div className="skeleton animate-pulse h-3 w-16 mb-2 bg-base-content/10 rounded"></div>
                        <div className="skeleton animate-pulse h-6 w-24 bg-base-content/10 rounded"></div>
                    </div>
                ))}
            </div>
          </section>
        </div>

        {/* Right Column (Price Info) */}
        <div className="space-y-6">
            <section className="bg-base-200 border border-base-content/5 rounded-2xl p-6">
                <div className="skeleton animate-pulse h-7 w-32 mb-6 bg-base-content/10 rounded"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between">
                            <div className="skeleton animate-pulse h-4 w-24 bg-base-content/10 rounded"></div>
                            <div className="skeleton animate-pulse h-4 w-16 bg-base-content/10 rounded"></div>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-base-content/10">
                        <div className="skeleton animate-pulse h-3 w-32 mb-2 bg-base-content/10 rounded"></div>
                        <div className="skeleton animate-pulse h-8 w-40 bg-base-content/10 rounded"></div>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}