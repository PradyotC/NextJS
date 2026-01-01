export default function Loading() {
  return (
    <div className="min-h-screen text-base-content p-4 xl:p-8">
      {/* Header skeleton animate-pulse */}
      <header className="text-center mb-10 space-y-4 flex flex-col items-center">
        <div className="skeleton animate-pulse h-10 w-64 md:w-96 rounded-lg bg-base-content/10"></div>
        <div className="skeleton animate-pulse h-5 w-48 md:w-80 rounded bg-base-content/10"></div>
      </header>

      {/* Main Grid skeleton animate-pulse */}
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Create 3 columns (Gainers, Losers, Active) */}
          {[1, 2, 3].map((sectionIdx) => (
            <div
              key={sectionIdx}
              className="bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden flex flex-col h-full"
            >
              {/* Section Header */}
              <div className="p-4 border-b border-base-content/10 flex items-center justify-between bg-base-200/50">
                <div className="flex items-center gap-2">
                  <div className="skeleton animate-pulse h-5 w-5 rounded bg-base-content/10"></div>
                  <div className="skeleton animate-pulse h-6 w-32 rounded bg-base-content/10"></div>
                </div>
                <div className="skeleton animate-pulse h-5 w-5 rounded-full bg-base-content/10"></div>
              </div>

              {/* List of Stock Card Skeletons */}
              <div className="p-2 space-y-3">
                {[1, 2, 3, 4, 5].map((cardIdx) => (
                  <div
                    key={cardIdx}
                    className="p-3 rounded-xl border border-base-content/5 flex items-center justify-between"
                  >
                    {/* Left: Rank + Ticker */}
                    <div className="flex items-center gap-3">
                      <div className="skeleton animate-pulse h-8 w-8 rounded-full bg-base-content/10"></div>
                      <div className="space-y-1">
                        <div className="skeleton animate-pulse h-5 w-16 rounded bg-base-content/10"></div>
                        <div className="skeleton animate-pulse h-3 w-12 rounded bg-base-content/10"></div>
                      </div>
                    </div>

                    {/* Right: Price + Change */}
                    <div className="flex flex-col items-end space-y-1">
                      <div className="skeleton animate-pulse h-5 w-20 rounded bg-base-content/10"></div>
                      <div className="skeleton animate-pulse h-3 w-14 rounded bg-base-content/10"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}