export default function Loading({ num = 12 }: { num?: number }) {
  return (
    <div className="container mx-auto p-4" aria-hidden>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {Array.from({ length: num }).map((_, idx) => (
          <div key={idx} className="w-full max-w-md">
            <div className="hover-3d w-full">
              <div className="card w-full h-full border border-base-300 shadow-sm bg-base-300/90 flex flex-col overflow-hidden transition-all duration-300 rounded-xl">

                {/* IMAGE + BADGE (matches figure) */}
                <figure className="relative aspect-[4/3] w-full bg-base-200 contrast-50 animate-pulse" />
                <div className="absolute right-3 top-3 md:top-4 md:right-4 h-13 w-13 rounded-full bg-base-200 animate-pulse" />

                {/* BODY */}
                <div className="card-body flex flex-col p-4 space-y-3">

                  {/* TITLE + YEAR BADGE */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-5 w-2/3 rounded-md bg-base-300 contrast-50 animate-pulse" />
                    <div className="h-5 w-12 rounded-full bg-base-300 contrast-50 animate-pulse" />
                  </div>

                  {/* OVERVIEW */}
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded-md bg-base-300 contrast-50 animate-pulse" />
                    <div className="h-4 w-5/6 rounded-md bg-base-300 contrast-50 animate-pulse" />
                    <div className="h-4 w-2/3 rounded-md bg-base-300 contrast-50 animate-pulse" />
                  </div>

                  {/* ACTION / META BADGES */}
                  <div className="flex gap-2 my-2">
                    <div className="h-5 w-20 rounded-full bg-base-300 contrast-50 animate-pulse" />
                    <div className="h-5 w-24 rounded-full bg-base-300 contrast-50 animate-pulse" />
                  </div>

                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
