export interface NewsArticle {
    title: string;
    url: string;
    summary?: string;
    content?: string;
    author?: string;
    publishedAt: Date;
    source: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
}

export interface ScraperConfig {
    name: string;
    baseUrl: string;
    selectors: {
        articleLinks: string;
        title: string;
        summary?: string;
        content?: string;
        author?: string;
        publishedAt?: string;
        category?: string;
        tags?: string;
        imageUrl?: string;
    };
    pagination?: {
        enabled: boolean;
        nextPageSelector?: string;
        maxPages?: number;
    };
    delay?: number; // Delay between requests in milliseconds
}

export interface ScraperResult {
    articles: NewsArticle[];
    totalScraped: number;
    errors: string[];
    executionTime: number;
}

export interface NewsCollectorOptions {
    outputDir?: string;
    maxConcurrent?: number;
    retryAttempts?: number;
    delayBetweenRequests?: number;
    includeContent?: boolean;
}
