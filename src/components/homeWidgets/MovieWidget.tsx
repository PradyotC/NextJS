import { prisma } from "@/lib/server/prisma";
import ClientCarousel from "./ClientCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faStar } from "@fortawesome/free-solid-svg-icons";
import ImageWithChecks from "@/components/ImageCheck";
import Link from "next/link";

export default async function MovieWidget() {
  // 1. Fetch from DB
  const movies = await prisma.tmdbMovie.findMany({
    where: {
      OR: [
        { backdropPath: { not: null } },
        { posterPath: { not: null } }
      ]
    },
    take: 50, // Fetch a pool to randomize from
    orderBy: { popularity: 'desc' }
  });

  if (movies.length === 0) return null;

  // 2. Randomize
  const randomMovies = movies
    .sort((a) => 0.5 - Math.sin(new Date(a.cachedAt).getTime()))
    .slice(0, 5);

  // 3. Render Items
  const items = randomMovies.map((movie) => (
    <Link 
      href="/daily/tmdb" 
      key={movie.id} 
      className="h-full w-full relative group block"
    >
        {/* Background Image */}
        <div className="absolute inset-0">
            {movie.backdropPath || movie.posterPath ? (
                <ImageWithChecks
                    src={movie.backdropPath || movie.posterPath}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    wrapperClassName="w-full h-full"
                />
            ) : (
                <div className="w-full h-full bg-neutral flex items-center justify-center">No Image</div>
            )}
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-base-300 via-transparent to-transparent opacity-90" />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 p-4 w-full">
            <div className="flex justify-between items-end">
                <div className="flex-1 mr-2">
                    <h4 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {movie.title}
                    </h4>
                    <div className="flex gap-2 text-xs opacity-70 mt-1">
                        <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}</span>
                        <span>•</span>
                        <span>{movie.originalLang?.toUpperCase()}</span>
                    </div>
                </div>
                <div className="badge badge-warning gap-1 font-bold">
                    <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                    {movie.voteAverage.toFixed(1)}
                </div>
            </div>
        </div>
    </Link>
  ));

  return (
    <ClientCarousel 
      items={items} 
      title="Movies" 
      icon={<FontAwesomeIcon icon={faFilm} />} 
      color="purple"
      href="/daily/tmdb"
    />
  );
}