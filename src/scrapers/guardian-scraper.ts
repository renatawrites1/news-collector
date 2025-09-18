import { BaseScraper } from '../base-scraper';
import { ScraperConfig } from '../types';

export class GuardianScraper extends BaseScraper {
    constructor() {
        const config: ScraperConfig = {
            name: 'The Guardian',
            baseUrl: 'https://www.theguardian.com',
            selectors: {
                articleLinks: 'a[data-link-name="article"]',
                title: 'h1[data-testid="headline"]',
                summary: '[data-testid="summary"]',
                content: '[data-testid="maincontent"]',
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
            return 'https://www.theguardian.com';
        }
        return `https://www.theguardian.com?page=${pageNumber}`;
    }
}
