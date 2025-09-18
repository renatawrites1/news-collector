import { BaseScraper } from '../base-scraper';
import { ScraperConfig } from '../types';

export class ReutersScraper extends BaseScraper {
    constructor() {
        const config: ScraperConfig = {
            name: 'Reuters',
            baseUrl: 'https://www.reuters.com',
            selectors: {
                articleLinks: 'a[data-testid="Link"]',
                title: 'h1[data-testid="Headline"]',
                summary: '[data-testid="Body"] p',
                content: '[data-testid="Body"]',
                author: '[data-testid="Byline"]',
                publishedAt: 'time[data-testid="Timestamp"]',
                category: '[data-testid="Section"]',
                tags: '[data-testid="Tags"] a'
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
            return 'https://www.reuters.com';
        }
        return `https://www.reuters.com/?page=${pageNumber}`;
    }
}
