import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { NewsArticle, ScraperConfig, ScraperResult } from './types';

export abstract class BaseScraper {
    protected browser: Browser | null = null;
    protected config: ScraperConfig;

    constructor(config: ScraperConfig) {
        this.config = config;
    }

    async initialize(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
    }

    async cleanup(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async scrape(): Promise<ScraperResult> {
        const startTime = Date.now();
        const errors: string[] = [];
        let articles: NewsArticle[] = [];

        try {
            await this.initialize();
            articles = await this.scrapeArticles();
        } catch (error) {
            errors.push(`Failed to scrape ${this.config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            await this.cleanup();
        }

        const executionTime = Date.now() - startTime;

        return {
            articles,
            totalScraped: articles.length,
            errors,
            executionTime
        };
    }

    protected async scrapeArticles(): Promise<NewsArticle[]> {
        if (!this.browser) {
            throw new Error('Browser not initialized');
        }

        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const articles: NewsArticle[] = [];
        let currentPage = 1;
        const maxPages = this.config.pagination?.maxPages || 1;

        try {
            while (currentPage <= maxPages) {
                const pageUrl = this.getPageUrl(currentPage);
                console.log(`Scraping ${this.config.name} - Page ${currentPage}: ${pageUrl}`);

                await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });

                // Wait for content to load
                await page.waitForTimeout(this.config.delay || 1000);

                const html = await page.content();
                const $ = cheerio.load(html);

                const articleLinks = this.extractArticleLinks($);
                console.log(`Found ${articleLinks.length} article links on page ${currentPage}`);

                for (const link of articleLinks) {
                    try {
                        const article = await this.scrapeArticle(page, link);
                        if (article) {
                            articles.push(article);
                        }
                    } catch (error) {
                        console.error(`Error scraping article ${link}:`, error);
                    }
                }

                // Check if there's a next page
                if (this.config.pagination?.enabled && currentPage < maxPages) {
                    const hasNextPage = await this.hasNextPage(page, $);
                    if (!hasNextPage) {
                        break;
                    }
                }

                currentPage++;

                // Add delay between pages
                if (currentPage <= maxPages) {
                    await page.waitForTimeout(this.config.delay || 2000);
                }
            }
        } finally {
            await page.close();
        }

        return articles;
    }

    protected async scrapeArticle(page: Page, articleUrl: string): Promise<NewsArticle | null> {
        try {
            await page.goto(articleUrl, { waitUntil: 'networkidle2', timeout: 15000 });
            await page.waitForTimeout(500);

            const html = await page.content();
            const $ = cheerio.load(html);

            const title = this.extractText($, this.config.selectors.title);
            if (!title) {
                return null;
            }

            const article: NewsArticle = {
                title,
                url: articleUrl,
                source: this.config.name,
                publishedAt: this.extractPublishedDate($),
                summary: this.extractText($, this.config.selectors.summary),
                content: this.config.selectors.content ? this.extractText($, this.config.selectors.content) : undefined,
                author: this.extractText($, this.config.selectors.author),
                category: this.extractText($, this.config.selectors.category),
                tags: this.extractTags($),
                imageUrl: this.extractImageUrl($)
            };

            return article;
        } catch (error) {
            console.error(`Error scraping article ${articleUrl}:`, error);
            return null;
        }
    }

    protected extractArticleLinks($: cheerio.CheerioAPI): string[] {
        const links: string[] = [];
        $(this.config.selectors.articleLinks).each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                const fullUrl = href.startsWith('http') ? href : new URL(href, this.config.baseUrl).href;
                links.push(fullUrl);
            }
        });
        return links;
    }

    protected extractText($: cheerio.CheerioAPI, selector?: string): string | undefined {
        if (!selector) return undefined;
        return $(selector).first().text().trim();
    }

    protected extractPublishedDate($: cheerio.CheerioAPI): Date {
        const dateText = this.extractText($, this.config.selectors.publishedAt);
        if (dateText) {
            const date = new Date(dateText);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        return new Date(); // Fallback to current date
    }

    protected extractTags($: cheerio.CheerioAPI): string[] {
        if (!this.config.selectors.tags) return [];
        const tags: string[] = [];
        $(this.config.selectors.tags).each((_, element) => {
            const tag = $(element).text().trim();
            if (tag) tags.push(tag);
        });
        return tags;
    }

    protected extractImageUrl($: cheerio.CheerioAPI): string | undefined {
        if (!this.config.selectors.imageUrl) return undefined;
        const imgSrc = $(this.config.selectors.imageUrl).first().attr('src');
        return imgSrc ? (imgSrc.startsWith('http') ? imgSrc : new URL(imgSrc, this.config.baseUrl).href) : undefined;
    }

    protected async hasNextPage(page: Page, $: cheerio.CheerioAPI): Promise<boolean> {
        if (!this.config.pagination?.nextPageSelector) return false;
        return $(this.config.pagination.nextPageSelector).length > 0;
    }

    protected abstract getPageUrl(pageNumber: number): string;
}
