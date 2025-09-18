import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseScraper } from './base-scraper';
import { NewsArticle, NewsCollectorOptions, ScraperResult } from './types';

export class NewsCollector {
    private scrapers: BaseScraper[];
    private options: Required<NewsCollectorOptions>;

    constructor(scrapers: BaseScraper[], options: NewsCollectorOptions = {}) {
        this.scrapers = scrapers;
        this.options = {
            outputDir: options.outputDir || './data',
            maxConcurrent: options.maxConcurrent || 3,
            retryAttempts: options.retryAttempts || 3,
            delayBetweenRequests: options.delayBetweenRequests || 1000,
            includeContent: options.includeContent || false
        };
    }

    async collectAll(): Promise<{
        allArticles: NewsArticle[];
        results: ScraperResult[];
        totalArticles: number;
        totalErrors: number;
        executionTime: number;
    }> {
        const startTime = Date.now();
        const allArticles: NewsArticle[] = [];
        const results: ScraperResult[] = [];
        let totalErrors = 0;

        console.log(`Starting news collection with ${this.scrapers.length} scrapers...`);
        console.log(`Max concurrent scrapers: ${this.options.maxConcurrent}`);
        console.log(`Output directory: ${this.options.outputDir}`);

        // Ensure output directory exists
        await this.ensureOutputDirectory();

        // Process scrapers in batches to control concurrency
        for (let i = 0; i < this.scrapers.length; i += this.options.maxConcurrent) {
            const batch = this.scrapers.slice(i, i + this.options.maxConcurrent);
            const batchPromises = batch.map(scraper => this.runScraperWithRetry(scraper));

            const batchResults = await Promise.allSettled(batchPromises);

            for (let j = 0; j < batchResults.length; j++) {
                const result = batchResults[j];
                if (result.status === 'fulfilled') {
                    const scraperResult = result.value;
                    results.push(scraperResult);
                    allArticles.push(...scraperResult.articles);
                    totalErrors += scraperResult.errors.length;

                    console.log(`✓ ${scraperResult.articles.length} articles from ${this.getScraperName(scraperResult)}`);
                    if (scraperResult.errors.length > 0) {
                        console.log(`  ⚠ ${scraperResult.errors.length} errors occurred`);
                    }
                } else {
                    console.error(`✗ Failed to run scraper: ${result.reason}`);
                    totalErrors++;
                }
            }

            // Add delay between batches
            if (i + this.options.maxConcurrent < this.scrapers.length) {
                await this.delay(this.options.delayBetweenRequests);
            }
        }

        const executionTime = Date.now() - startTime;

        // Save results
        await this.saveResults(allArticles, results);

        console.log('\n=== Collection Summary ===');
        console.log(`Total articles collected: ${allArticles.length}`);
        console.log(`Total errors: ${totalErrors}`);
        console.log(`Execution time: ${(executionTime / 1000).toFixed(2)}s`);
        console.log(`Results saved to: ${this.options.outputDir}`);

        return {
            allArticles,
            results,
            totalArticles: allArticles.length,
            totalErrors,
            executionTime
        };
    }

    private async runScraperWithRetry(scraper: BaseScraper): Promise<ScraperResult> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
            try {
                console.log(`Running ${this.getScraperNameFromInstance(scraper)} (attempt ${attempt}/${this.options.retryAttempts})`);
                return await scraper.scrape();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                console.warn(`Attempt ${attempt} failed for ${this.getScraperNameFromInstance(scraper)}: ${lastError.message}`);

                if (attempt < this.options.retryAttempts) {
                    const delayTime = attempt * 2000; // Exponential backoff
                    console.log(`Retrying in ${delayTime}ms...`);
                    await this.delay(delayTime);
                }
            }
        }

        // If all retries failed, return empty result with error
        return {
            articles: [],
            totalScraped: 0,
            errors: [lastError?.message || 'Unknown error'],
            executionTime: 0
        };
    }

    private async saveResults(articles: NewsArticle[], results: ScraperResult[]): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Save all articles
        const articlesFile = path.join(this.options.outputDir, `articles-${timestamp}.json`);
        await fs.writeFile(articlesFile, JSON.stringify(articles, null, 2));

        // Save detailed results
        const resultsFile = path.join(this.options.outputDir, `results-${timestamp}.json`);
        await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));

        // Save summary
        const summary = {
            timestamp: new Date().toISOString(),
            totalArticles: articles.length,
            totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
            executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
            sources: results.map(r => ({
                name: this.getScraperName(r),
                articles: r.articles.length,
                errors: r.errors.length,
                executionTime: r.executionTime
            }))
        };

        const summaryFile = path.join(this.options.outputDir, `summary-${timestamp}.json`);
        await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));

        // Update latest files
        await fs.writeFile(path.join(this.options.outputDir, 'articles-latest.json'), JSON.stringify(articles, null, 2));
        await fs.writeFile(path.join(this.options.outputDir, 'summary-latest.json'), JSON.stringify(summary, null, 2));
    }

    private async ensureOutputDirectory(): Promise<void> {
        try {
            await fs.access(this.options.outputDir);
        } catch {
            await fs.mkdir(this.options.outputDir, { recursive: true });
        }
    }

    private getScraperName(result: ScraperResult): string {
        // This is a bit of a hack since we don't store the scraper name in the result
        // In a real implementation, you'd want to include the scraper name in the result
        return 'Unknown';
    }

    private getScraperNameFromInstance(scraper: BaseScraper): string {
        return (scraper as any).config?.name || 'Unknown';
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
