import { getMusicTracks } from "@/lib/server/music-service";
import ImageWithChecks from "@/components/ImageCheck";
import LazyWaveform from "@/components/Waveform"; // Updated import
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones, faMusic } from "@fortawesome/free-solid-svg-icons";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function MusicPage({ params }: PageProps) {
  const { category } = await params;
  const tracks = await getMusicTracks(category);
  const categories = ["lofi", "pop", "rock", "electronic", "jazz", "classical"];

  return (
    <div className="min-h-screen p-6 xl:p-10 text-base-content">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faHeadphones} className="text-primary" />
          <span>Music Feed</span>
        </h1>
        <p className="text-base-content/70">
          Curated tracks from Jamendo. Viewing: <span className="font-bold uppercase text-primary">{category}</span>
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/daily/music/${cat}`}
              className={`btn btn-sm ${cat === category ? "btn-primary" : "btn-ghost"}`}
            >
              {cat.toUpperCase()}
            </Link>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tracks.map((track) => {
          if (!track) return null;
          
          // Secure Proxy URL
          const proxyUrl = `/api/audio-proxy?id=${track.id}`;

          return (
            <article
              key={track.id}
              className="group bg-base-300 border border-base-content/5 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Section */}
              <div className="relative aspect-video bg-base-300 overflow-hidden">
                  {track.image ? (
                     <ImageWithChecks 
                        src={track.image} 
                        alt={track.title} 
                        width={600} 
                        height={400}
                        loading="eager"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                  ) : (
                      <div className="flex items-center justify-center h-full text-base-content/20">
                          <FontAwesomeIcon icon={faMusic} className="text-4xl" />
                      </div>
                  )}
                  <a href={track.shareUrl || "#"} target="_blank" className="absolute inset-0 z-10" aria-label="View on Jamendo" />
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                      <h3 className="text-lg font-bold line-clamp-1" title={track.title}>{track.title}</h3>
                      <p className="text-sm text-primary font-medium">{track.artist}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-base-content/10">
                      {/* Only loads audio when user clicks Play */}
                      <LazyWaveform audioUrl={proxyUrl} />
                      
                      <div className="flex justify-between items-center mt-3 text-xs text-base-content/50 font-mono">
                           <span>{track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : "--:--"}</span>
                           <span>{track.releasedDate || ""}</span>
                      </div>
                  </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}