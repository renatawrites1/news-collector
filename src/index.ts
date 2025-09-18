#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { NewsCollector } from './news-collector';
import { CNNScraper, BBCScraper, ReutersScraper, GuardianScraper } from './scrapers';
import { NewsCollectorOptions } from './types';

const program = new Command();

program
    .name('news-collector')
    .description('A TypeScript-based news scraper for collecting articles from various news websites')
    .version('1.0.0');

program
    .command('scrape')
    .description('Scrape news from all configured sources')
    .option('-o, --output <dir>', 'Output directory for scraped data', './data')
    .option('-c, --concurrent <number>', 'Maximum concurrent scrapers', '3')
    .option('-r, --retry <number>', 'Number of retry attempts', '3')
    .option('-d, --delay <number>', 'Delay between requests in milliseconds', '1000')
    .option('--include-content', 'Include full article content (slower)', false)
    .option('--sources <sources>', 'Comma-separated list of sources to scrape (cnn,bbc,reuters,guardian)', 'cnn,bbc,reuters,guardian')
    .action(async (options: any) => {
        const spinner = ora('Initializing news collector...').start();

        try {
            // Parse sources
            const sources = options.sources.split(',').map((s: string) => s.trim().toLowerCase());

            // Create scrapers based on selected sources
            const scrapers = [];
            if (sources.includes('cnn')) scrapers.push(new CNNScraper());
            if (sources.includes('bbc')) scrapers.push(new BBCScraper());
            if (sources.includes('reuters')) scrapers.push(new ReutersScraper());
            if (sources.includes('guardian')) scrapers.push(new GuardianScraper());

            if (scrapers.length === 0) {
                spinner.fail('No valid sources specified');
                process.exit(1);
            }

            // Configure collector options
            const collectorOptions: NewsCollectorOptions = {
                outputDir: options.output,
                maxConcurrent: parseInt(options.concurrent),
                retryAttempts: parseInt(options.retry),
                delayBetweenRequests: parseInt(options.delay),
                includeContent: options.includeContent
            };

            // Create and run collector
            const collector = new NewsCollector(scrapers, collectorOptions);

            spinner.text = `Scraping news from ${scrapers.length} sources...`;

            const results = await collector.collectAll();

            spinner.succeed(chalk.green(`Successfully collected ${results.totalArticles} articles`));

            if (results.totalErrors > 0) {
                console.log(chalk.yellow(`⚠ ${results.totalErrors} errors occurred during scraping`));
            }

            console.log(chalk.blue(`\nResults saved to: ${options.output}`));
            console.log(chalk.gray(`Execution time: ${(results.executionTime / 1000).toFixed(2)}s`));

        } catch (error) {
            spinner.fail(chalk.red('Failed to collect news'));
            console.error(chalk.red('Error:'), error);
            process.exit(1);
        }
    });

program
    .command('list-sources')
    .description('List available news sources')
    .action(() => {
        console.log(chalk.blue('Available news sources:'));
        console.log(chalk.green('  • cnn - CNN News'));
        console.log(chalk.green('  • bbc - BBC News'));
        console.log(chalk.green('  • reuters - Reuters'));
        console.log(chalk.green('  • guardian - The Guardian'));
    });

program
    .command('info')
    .description('Show information about the news collector')
    .action(() => {
        console.log(chalk.blue.bold('News Collector v1.0.0'));
        console.log(chalk.gray('A TypeScript-based news scraper for collecting articles from various news websites'));
        console.log(chalk.gray('\nFeatures:'));
        console.log(chalk.gray('  • Multiple news source support'));
        console.log(chalk.gray('  • Concurrent scraping'));
        console.log(chalk.gray('  • Retry logic with exponential backoff'));
        console.log(chalk.gray('  • JSON output with timestamps'));
        console.log(chalk.gray('  • Configurable delays and limits'));
        console.log(chalk.gray('\nUsage:'));
        console.log(chalk.gray('  npm run scrape                    # Scrape all sources'));
        console.log(chalk.gray('  npm run scrape -- --sources cnn,bbc  # Scrape specific sources'));
        console.log(chalk.gray('  npm run scrape -- --help         # Show all options'));
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: any) => {
    console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
    process.exit(1);
});

// Parse command line arguments
program.parse();
