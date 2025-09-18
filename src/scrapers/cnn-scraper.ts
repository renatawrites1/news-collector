import { BaseScraper } from '../base-scraper';
import { ScraperConfig } from '../types';

export class CNNScraper extends BaseScraper {
    constructor() {
        const config: ScraperConfig = {
            name: 'CNN',
            baseUrl: 'https://www.cnn.com',
            selectors: {
                articleLinks: 'a[data-link-type="article"]',
                title: 'h1[data-module="ArticleHeadline"]',
                summary: '.article__content p',
                content: '.article__content',
                author: '.metadata__byline__author',
                publishedAt: '.update-time',
                category: '.metadata__section',
                tags: '.metadata__tags a'
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
            return 'https://www.cnn.com';
        }
        return `https://www.cnn.com/sitemap.html?page=${pageNumber}`;
    }
}
