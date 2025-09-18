# News Collector

A powerful TypeScript-based news scraper that collects articles from multiple news websites including CNN, BBC, Reuters, and The Guardian. Built with modern web scraping technologies and designed for reliability and performance.

## Features

- 🚀 **Multiple News Sources**: Support for CNN, BBC, Reuters, and The Guardian
- ⚡ **Concurrent Scraping**: Configurable concurrent scraping for optimal performance
- 🔄 **Retry Logic**: Automatic retry with exponential backoff for failed requests
- 📊 **Rich Data**: Extract titles, summaries, content, authors, publication dates, and more
- 💾 **JSON Output**: Structured data export with timestamps and metadata
- 🛠️ **TypeScript**: Fully typed for better development experience
- 🎯 **CLI Interface**: Easy-to-use command-line interface
- ⚙️ **Configurable**: Customizable delays, limits, and output options

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd news-collector
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Quick Start

### Basic Usage

Scrape news from all available sources:
```bash
npm run scrape
```

### Advanced Usage

Scrape specific sources with custom options:
```bash
npm run scrape -- --sources cnn,bbc --output ./my-data --concurrent 2
```

### Available Commands

```bash
# Scrape all sources
npm run scrape

# Scrape specific sources
npm run scrape -- --sources cnn,bbc,reuters

# Custom output directory
npm run scrape -- --output ./custom-data

# Control concurrency
npm run scrape -- --concurrent 5

# Include full article content
npm run scrape -- --include-content

# Show all options
npm run scrape -- --help

# List available sources
npm run list-sources

# Show project information
npm run info
```

## Configuration

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--output <dir>` | Output directory for scraped data | `./data` |
| `--concurrent <number>` | Maximum concurrent scrapers | `3` |
| `--retry <number>` | Number of retry attempts | `3` |
| `--delay <number>` | Delay between requests (ms) | `1000` |
| `--include-content` | Include full article content | `false` |
| `--sources <sources>` | Comma-separated list of sources | `cnn,bbc,reuters,guardian` |

### Environment Variables

Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

## Output Format

The scraper generates several output files:

- `articles-{timestamp}.json` - All scraped articles
- `results-{timestamp}.json` - Detailed scraping results
- `summary-{timestamp}.json` - Summary statistics
- `articles-latest.json` - Latest articles (always updated)
- `summary-latest.json` - Latest summary (always updated)

### Article Structure

```typescript
interface NewsArticle {
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
```

## Supported News Sources

| Source | Website | Status |
|--------|---------|--------|
| CNN | cnn.com | ✅ Active |
| BBC | bbc.com | ✅ Active |
| Reuters | reuters.com | ✅ Active |
| The Guardian | theguardian.com | ✅ Active |

## Development

### Project Structure

```
src/
├── scrapers/           # Individual news source scrapers
│   ├── cnn-scraper.ts
│   ├── bbc-scraper.ts
│   ├── reuters-scraper.ts
│   ├── guardian-scraper.ts
│   └── index.ts
├── base-scraper.ts     # Base scraper class
├── news-collector.ts   # Main collection orchestrator
├── types.ts           # TypeScript type definitions
└── index.ts           # CLI entry point
```

### Adding New Sources

1. Create a new scraper class extending `BaseScraper`
2. Define the selectors for the target website
3. Implement the `getPageUrl` method
4. Export the scraper from `scrapers/index.ts`
5. Add it to the CLI options

Example:
```typescript
export class NewSourceScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'New Source',
      baseUrl: 'https://example.com',
      selectors: {
        articleLinks: 'a.article-link',
        title: 'h1.title',
        // ... other selectors
      }
    };
    super(config);
  }

  protected getPageUrl(pageNumber: number): string {
    return `https://example.com/page/${pageNumber}`;
  }
}
```

### Building and Testing

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Clean build artifacts
npm run clean
```

## Error Handling

The scraper includes robust error handling:

- **Retry Logic**: Automatic retry with exponential backoff
- **Graceful Degradation**: Continues scraping even if some sources fail
- **Error Reporting**: Detailed error logs in output files
- **Timeout Handling**: Configurable timeouts for requests

## Performance Considerations

- **Concurrency**: Adjust `--concurrent` based on your system and target websites
- **Delays**: Use appropriate delays to avoid being rate-limited
- **Content**: Only enable `--include-content` when needed (slower)
- **Memory**: Monitor memory usage with high concurrency settings

## Legal and Ethical Considerations

- **Respect robots.txt**: Check each website's robots.txt file
- **Rate Limiting**: Use appropriate delays between requests
- **Terms of Service**: Ensure compliance with each website's ToS
- **Data Usage**: Use scraped data responsibly and ethically

## Troubleshooting

### Common Issues

1. **Timeout Errors**: Increase delays or reduce concurrency
2. **No Articles Found**: Check if website structure has changed
3. **Memory Issues**: Reduce concurrency or enable headless mode
4. **Rate Limiting**: Increase delays between requests

### Debug Mode

For debugging, you can modify the scraper to run in non-headless mode:

```typescript
// In base-scraper.ts
this.browser = await puppeteer.launch({
  headless: false, // Change to false for debugging
  // ... other options
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is for educational and research purposes. Users are responsible for ensuring compliance with applicable laws and website terms of service. The authors are not responsible for any misuse of this tool.
