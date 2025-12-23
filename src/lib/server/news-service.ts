// src/lib/server/news-service.ts
import { prisma } from "./prisma";

// --- CONFIGURATION ---
const LIST_TTL = 1000 * 60 * 60 * 12; // 12 Hours
const ARTICLE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 Days

const BASE_URL = process.env.NEWS_API_BASE_URL || "https://gnews.io/api/v4";
const API_KEY = process.env.NEWS_API_ACCESSKEY;
const header = API_KEY ? { "X-Api-Key": API_KEY } : undefined;

function proxyImage(path: string | null, width = 500) {
    if (!path) return null;
    return `https://wsrv.nl/?url=${encodeURIComponent(
        path
    )}&w=${width}&output=webp&q=85`;
}

/* ================= HASHING & NORMALIZATION ================= */

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase62(num: number): string {
    let result = "";
    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result || "0";
}

function fnv1aHash(str: string): string {
    let hash = 0x811c9dc5 >>> 0;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    }
    return toBase62(hash);
}

function normalizeText(text: string): string {
    return (text || "")
        .toString()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function articleHashKey(item: any): string {
    const title = normalizeText(item.title || "");
    const content = normalizeText(item.content || "").slice(0, 20);
    return `${title}|${content}`;
}

/* ================= TYPES ================= */

type NewsArticleItem = {
    id: string;
    url: string;
    title: string;
    description: string | null;
    content: string | null;
    source: any;
    author: string | null;
    imageUrl: string | null;
    publishedAt: Date;
    categories: string[];
    cachedAt: Date;
    expireAt: Date;
};

interface NewsResult {
    articles: NewsArticleItem[];
    source: "db" | "api" | "fallback";
}

/* ================= API HELPER ================= */

async function fetchFromApi(category: string) {
    if (!API_KEY) throw new Error("NEWS_API_ACCESSKEY is missing");

    const endpoint = `${BASE_URL}/top-headlines?category=${encodeURIComponent(
        category
    )}&lang=en`;

    console.log(`[NewsService] Fetching external data for: ${category}`);
    const res = await fetch(endpoint, {
        method: "GET",
        redirect: "follow",
        headers: header,
        next: { revalidate: 0 },
    });
    if (!res.ok) {
        throw new Error(`News API failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

/* ================= MAIN SERVICE ================= */

export async function getNewsByCategory(category: string): Promise<NewsResult> {
    const now = new Date();

    // 1) Try cached list
    const cachedList = await prisma.newsArticleList.findUnique({
        where: { category },
    });

    const isListFresh = !!cachedList && cachedList.expireAt > now;
    if (isListFresh) {
        const articles = await prisma.newsArticle.findMany({
            where: { id: { in: cachedList.articleIds } },
        });

        // Keep original order from list
        const sorted = cachedList.articleIds
            .map((id) => articles.find((a) => a.id === id))
            .filter((a): a is any => !!a);

        if (sorted.length > 0) {
            return { articles: sorted as NewsArticleItem[], source: "db" };
        }
    }

    // If we reach here, we need to call API and refresh
    const articleSet = new Set<string>();

    try {
        const data = await fetchFromApi(category);

        if (data.articles && Array.isArray(data.articles)) {
            const apiArticles = data.articles as any[];
            const BATCH = 6;

            for (let i = 0; i < apiArticles.length; i += BATCH) {
                const batch = apiArticles.slice(i, i + BATCH);

                await Promise.all(
                    batch.map(async (item) => {
                        // 1. Generate the standard Hash ID
                        const key = articleHashKey(item);
                        const generatedId = fnv1aHash(key);

                        // 2. Prepare Match Conditions (Robust Duplicate Check)
                        const contentSnippet = item.content ? item.content.slice(0, 40) : "";
                        
                        const orConditions: any[] = [
                            { id: generatedId }, // Match by Hash
                            { url: item.url }    // Match by URL (Unique)
                        ];

                        // Match by Title (if present)
                        if (item.title) {
                            orConditions.push({ title: item.title });
                        }

                        // Match by Content Start (if substantial)
                        if (contentSnippet.length >= 20) {
                            orConditions.push({ content: { startsWith: contentSnippet } });
                        }

                        // 3. Check DB for ANY match
                        const existing = await prisma.newsArticle.findFirst({
                            where: { OR: orConditions }
                        });

                        // 4. Decide which ID to use
                        // If we found an existing record (even with a different ID), we use THAT ID.
                        const finalId = existing ? existing.id : generatedId;
                        articleSet.add(finalId);

                        // Prepare data fields
                        const publishedAt = item.publishedAt ? new Date(item.publishedAt) : now;
                        const cleanedSource = item.source ?? {};
                        const author = item.author ?? null;
                        const imageUrl = proxyImage(item.image ?? item.imageUrl ?? null);
                        
                        // Helper to perform update
                        const performUpdate = async (idToUpdate: string, existingData: any) => {
                            const existingCategories = existingData.categories ?? [];
                            const merged = Array.from(new Set([...existingCategories, category]));

                            await prisma.newsArticle.update({
                                where: { id: idToUpdate },
                                data: {
                                    // Update metadata
                                    categories: merged,
                                    cachedAt: now,
                                    expireAt: new Date(now.getTime() + ARTICLE_TTL),
                                    // Optionally update mutable fields if they are better/newer, 
                                    // but we definitely preserve the ID.
                                    url: existingData.url, // Keep original URL to avoid unique constraint errors
                                },
                            });
                        };

                        if (existing) {
                            // UPDATE existing record
                            await performUpdate(finalId, existing);
                        } else {
                            // CREATE new record
                            try {
                                await prisma.newsArticle.create({
                                    data: {
                                        id: finalId,
                                        url: item.url,
                                        title: item.title || "",
                                        description: item.description || "",
                                        content: item.content || "",
                                        source: cleanedSource,
                                        author,
                                        imageUrl,
                                        publishedAt,
                                        categories: [category],
                                        cachedAt: now,
                                        expireAt: new Date(now.getTime() + ARTICLE_TTL),
                                    },
                                });
                            } catch (err: any) {
                                // Handle Race Condition (e.g. created by another request in the split second between findFirst and create)
                                if (err.code === 'P2002') {
                                    const fresh = await prisma.newsArticle.findFirst({ 
                                        where: { OR: orConditions } 
                                    });
                                    if (fresh) {
                                        await performUpdate(fresh.id, fresh);
                                    }
                                } else {
                                    throw err;
                                }
                            }
                        }
                    })
                );
            }

            // Top up if too few results
            const MIN_COUNT = 10;
            const articleIds = Array.from(articleSet);
            if (articleIds.length < MIN_COUNT) {
                const rem = MIN_COUNT - articleIds.length;
                const extra = await prisma.newsArticle.findMany({
                    where: {
                        id: { notIn: articleIds.length ? articleIds : ["__none__"] },
                        categories: { has: category },
                        expireAt: { gt: now },
                    },
                    select: { id: true },
                    orderBy: { publishedAt: "desc" },
                    take: rem,
                });
                for (const e of extra) articleSet.add(e.id);
            }

            // Persist List
            const finalArticleIds = Array.from(articleSet);
            await prisma.newsArticleList.upsert({
                where: { category },
                update: {
                    articleIds: finalArticleIds,
                    cachedAt: now,
                    expireAt: new Date(now.getTime() + LIST_TTL),
                },
                create: {
                    category,
                    articleIds: finalArticleIds,
                    cachedAt: now,
                    expireAt: new Date(now.getTime() + LIST_TTL),
                },
            });

            // Return sorted results
            const fresh = await prisma.newsArticle.findMany({
                where: { id: { in: Array.from(articleSet) } },
            });

            const ordered = Array.from(articleSet)
                .map((id) => fresh.find((a) => a.id === id))
                .filter((a): a is any => !!a);

            return { articles: ordered as NewsArticleItem[], source: "api" };
        }
    } catch (err) {
        console.error(`[NewsService] API Fetch failed for ${category}:`, err);
    }

    // Fallback
    console.log(`[NewsService] Using fallback data for: ${category}`);
    const fallbackArticles = await prisma.newsArticle.findMany({
        where: {
            categories: { has: category },
            expireAt: { gt: now },
        },
        orderBy: { publishedAt: "desc" },
        take: 10,
    });

    return { articles: fallbackArticles as NewsArticleItem[], source: "fallback" };
}