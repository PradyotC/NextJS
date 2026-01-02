import { prisma } from "@/lib/server/prisma";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faHeadphones } from "@fortawesome/free-solid-svg-icons";
import ImageWithChecks from "@/components/ImageCheck";
import LazyWaveform from "@/components/Waveform"; 

export default async function MusicWidget() {
  // 1. Fetch from DB
  const tracks = await prisma.musicTrack.findMany({
    where: {
      audio: { not: "" }, // FIX: Type 'null' is not assignable to type 'string | NestedStringFilter<"MusicTrack"> | undefined'.
      image: { not: null }
    },
    take: 20, // Fetch a small pool
    orderBy: { cachedAt: 'desc' }
  });

  if (tracks.length === 0) return null;

  // 2. Pick One
  const randomTrack = tracks[Math.floor(Math.abs(Math.sin(tracks.length)) * tracks.length)];

  // Secure Proxy URL
  const proxyUrl = `/api/audio-proxy?id=${randomTrack.id}`;

  return (
    <div className="card bg-base-200 shadow-xl border border-base-400 h-full flex flex-col">
      <div className="card-body p-4 sm:p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-lg text-warning flex gap-2 items-center">
            <FontAwesomeIcon icon={faMusic} />
            Sound Library
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-base-100/50 rounded-xl border border-base-300 overflow-hidden flex flex-col">
            {/* Image Background (Blurred) */}
            <div className="absolute inset-0 opacity-20">
                {randomTrack.image && (
                    <ImageWithChecks 
                        src={randomTrack.image} 
                        alt="bg" 
                        fill 
                        className="object-cover blur-sm" 
                        wrapperClassName="w-full h-full"
                    />
                )}
            </div>
            
            <div className="relative z-10 flex flex-col h-full p-4 justify-between">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md border border-white/10 relative">
                        {randomTrack.image ? (
                            <ImageWithChecks src={randomTrack.image} alt={randomTrack.title} fill className="object-cover" wrapperClassName="w-full h-full" />
                        ) : (
                            <div className="w-full h-full bg-base-300 flex items-center justify-center"><FontAwesomeIcon icon={faHeadphones} /></div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold truncate text-base">{randomTrack.title}</h4>
                        <p className="text-xs opacity-70 truncate">{randomTrack.artist}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <LazyWaveform audioUrl={proxyUrl} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}