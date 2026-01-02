import { prisma } from "@/lib/server/prisma";
import ClientCarousel from "./ClientCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";
import ImageWithChecks from "@/components/ImageCheck";

export default async function NewsWidget() {
  // 1. Fetch from DB (Only with Images)
  const articles = await prisma.newsArticle.findMany({
    where: {
      imageUrl: { not: null },
      title: { not: "" }
    },
    take: 50,
    orderBy: { publishedAt: 'desc' }
  });

  if (articles.length === 0) return null;

  // 2. Randomize
  const randomNews = articles
    .sort((a) => 0.5 - Math.sin(new Date(a.publishedAt).getTime()))
    .slice(0, 5);

  // 3. Render Items
  const items = randomNews.map((article) => {
    // Parse source safely
    let sourceName = "News";
    try {
        if (article.source && typeof article.source === 'object' && !Array.isArray(article.source)) {
             sourceName = (article.source as any).name || "News";
        }
    } catch (e) {
        console.error("Error parsing source:", e);
    }

    return (
      <a 
        key={article.id} 
        href={article.url} 
        target="_blank" 
        rel="noreferrer" 
        className="group block h-full w-full relative overflow-hidden"
      >
          {/* Background Image with Gradient */}
          <div className="absolute inset-0">
              {article.imageUrl ? (
                  <ImageWithChecks 
                      src={article.imageUrl} 
                      alt={article.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      wrapperClassName="w-full h-full"
                  />
              ) : (
                  <div className="w-full h-full bg-base-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="badge badge-xs badge-info mb-2">{sourceName}</div>
              <h4 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-md group-hover:text-info transition-colors">
                  {article.title}
              </h4>
              <p className="text-xs text-gray-300 mt-1 line-clamp-1 opacity-80">
                  {new Date(article.publishedAt).toLocaleDateString()}
              </p>
          </div>
      </a>
    );
  });

  return (
    <ClientCarousel 
      items={items} 
      title="Daily Briefing" 
      icon={<FontAwesomeIcon icon={faNewspaper} />} 
      color="blue"
      href="/daily/news/"
    />
  );
}