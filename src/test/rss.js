import { fetchRSSFeeds } from '../fetchers/rss.js';
import { SOURCES } from '../config/sources.js';

console.log('Testing RSS feeds for all countries...\n');

for (const [country, config] of Object.entries(SOURCES)) {
  console.log(`\n=== ${country} ===`);
  const articles = await fetchRSSFeeds(config.rss, country);
  console.log(`Total: ${articles.length} articles`);
  if (articles.length > 0) {
    console.log('Sample:', articles[0].title);
  }
}
