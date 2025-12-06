export type NewsSource = {
    id: string;
    name: string;
    url: string;
    country: string;
};

export type NewsArticle = {
    id: string;
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    lang: string;
    source: NewsSource;
}

export type NewsApiResponse = {
    totalArticles: number;
    articles: NewsArticle[];
}