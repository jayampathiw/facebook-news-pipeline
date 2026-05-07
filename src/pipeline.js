import 'dotenv/config';
import { SOURCES } from './config/sources.js';
import { fetchRSSFeeds } from './fetchers/rss.js';
import { fetchNewsAPI } from './fetchers/newsapi.js';
import { saveArticles, getRecentArticleTitles } from './services/supabase.js';
import { deduplicate, similarity } from './utils/dedup.js';
import { validateArticle } from './validators/contentValidator.js';
import { classifyArticle } from './utils/criticality.js';

process.on('unhandledRejection', (err) => {
  console.error('PIPELINE FAILED:', err);
  process.exit(1);
});

async function processCountry(country, config) {
  console.log(`\n📰 Processing: ${country} (${config.pageName})`);

  const [rssArticles, apiArticles] = await Promise.all([
    fetchRSSFeeds(config.rss, country),
    fetchNewsAPI(config.newsapi.query, config.newsapi.language, country),
  ]);

  const raw = deduplicate([...rssArticles, ...apiArticles]);
  console.log(`  Fetched: ${rssArticles.length + apiArticles.length} total → ${raw.length} after in-batch dedup`);

  // Cross-DB dedup: drop articles too similar to anything saved in the last 3 days
  const recentTitles = await getRecentArticleTitles(country);
  const unique = raw.filter(article => {
    const tooSimilar = recentTitles.some(t => similarity(article.title, t) > 0.7);
    if (tooSimilar) console.log(`  ↩ Already in DB: "${article.title}"`);
    return !tooSimilar;
  });
  console.log(`  After DB dedup: ${unique.length} new articles`);

  const validated = [];
  const blocked   = [];

  for (const article of unique) {
    const check = validateArticle(article);

    if (check.valid) {
      const { criticality, priority_score } = classifyArticle(article);
      validated.push({
        ...article,
        criticality,
        priority_score,
        ...(check.boostWarning && { boost_warning: true }),
      });
    } else if (check.severity === 'absolute') {
      console.log(`  ⛔ Dropped (absolute): "${article.title}"`);
    } else {
      const status = check.severity === 'manual_review' ? 'manual_review' : 'blocked';
      const { criticality, priority_score } = classifyArticle(article);
      blocked.push({ ...article, status, blocked_reason: check.reason, criticality, priority_score });
      console.log(`  ⛔ ${status}: "${article.title}" — ${check.reason}`);
    }
  }

  const saved = await saveArticles(validated);
  console.log(`  Saved: ${saved} new articles (duplicates skipped silently)`);

  if (blocked.length > 0) {
    await saveArticles(blocked);
    console.log(`  Blocked/review: ${blocked.length} articles`);
  }
}

async function run() {
  console.log('🚀 Pipeline started:', new Date().toISOString());

  for (const [country, config] of Object.entries(SOURCES)) {
    await processCountry(country, config);
  }

  console.log('\n✅ Pipeline complete:', new Date().toISOString());
}

run();
