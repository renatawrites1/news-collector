import { BaseScraper } from '../base-scraper';
import { ScraperConfig } from '../types';

export class BBCScraper extends BaseScraper {
    constructor() {
        const config: ScraperConfig = {
            name: 'BBC',
            baseUrl: 'https://www.bbc.com',
            selectors: {
                articleLinks: 'a[data-testid="internal-link"]',
                title: 'h1[data-testid="headline"]',
                summary: '[data-testid="summary"]',
                content: '[data-testid="main-content"]',
                author: '[data-testid="byline"]',
                publishedAt: 'time[data-testid="timestamp"]',
                category: '[data-testid="section"]',
                tags: '[data-testid="tags"] a'
            },
            pagination: {
                enabled: true,
                maxPages: 3
            },
            delay: 2000
        };
        super(config);
    }

    protected getPageUrl(pageNumber: number): string {
        if (pageNumber === 1) {
            return 'https://www.bbc.com/news';
        }
        return `https://www.bbc.com/news?page=${pageNumber}`;
    }
}
