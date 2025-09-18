#!/usr/bin/env node

// Simple example script to demonstrate usage
const { execSync } = require('child_process');

console.log('🚀 News Collector Example');
console.log('========================\n');

console.log('This example demonstrates how to use the news collector:');
console.log('');

console.log('1. Install dependencies:');
console.log('   npm install');
console.log('');

console.log('2. Build the project:');
console.log('   npm run build');
console.log('');

console.log('3. Scrape all sources:');
console.log('   npm run scrape');
console.log('');

console.log('4. Scrape specific sources:');
console.log('   npm run scrape -- --sources cnn,bbc');
console.log('');

console.log('5. Custom options:');
console.log('   npm run scrape -- --output ./my-data --concurrent 2 --include-content');
console.log('');

console.log('6. List available sources:');
console.log('   npm run list-sources');
console.log('');

console.log('For more information, see the README.md file.');
