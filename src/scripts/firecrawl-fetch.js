import 'dotenv/config';
import { SOURCES } from '../config/sources.js';
import { fetchFirecrawlHomepages } from '../fetchers/firecrawl.js';
import { saveArticles, getRecentArticleTitles, getRecentArticlesForClustering } from '../services/supabase.js';
import { deduplicate, similarity, detectAndAnnotateClusters } from '../utils/dedup.js';
import { validateArticle } from '../validators/contentValidator.js';

if (!process.env.FIRECRAWL_KEY) {
  console.error('FIRECRAWL FETCH FAILED: FIRECRAWL_KEY not set');
  process.exit(1);
}

process.on('unhandledRejection', (err) => {
  console.error('FIRECRAWL FETCH FAILED:', err);
  process.exit(1);
});

async function processCountry(country, config) {
  if (!config.firecrawl_homepages?.length) return;

  console.log(`\n🔥 Firecrawl: ${country} (${config.pageName})`);

  const raw = deduplicate(await fetchFirecrawlHomepages(config.firecrawl_homepages, country));
  console.log(`  Found: ${raw.length} unique articles after in-batch dedup`);

  const recentTitles = await getRecentArticleTitles(country);
  const unique = raw.filter(article => {
    const tooSimilar = recentTitles.some(t => similarity(article.title, t) > 0.7);
    if (tooSimilar) console.log(`  ↩ Already in DB: "${article.title}"`);
    return !tooSimilar;
  });
  console.log(`  After DB dedup: ${unique.length} genuinely new articles`);

  const validated = [];
  const blocked = [];

  for (const article of unique) {
    const check = validateArticle(article);
    if (check.valid) {
      validated.push({
        ...article,
        ...(check.boostWarning && { boost_warning: true }),
        ...(check.boostEligible === false && { boost_eligible: false }),
      });
    } else if (check.severity === 'absolute') {
      console.log(`  ⛔ Dropped (absolute): "${article.title}"`);
    } else {
      const status = check.severity === 'manual_review' ? 'manual_review' : 'blocked';
      blocked.push({ ...article, status, blocked_reason: check.reason });
      console.log(`  ⛔ ${status}: "${article.title}" — ${check.reason}`);
    }
  }

  const recentForClustering = await getRecentArticlesForClustering(country);
  detectAndAnnotateClusters(validated, recentForClustering);

  const saved = await saveArticles(validated);
  console.log(`  Saved: ${saved} new articles`);

  if (blocked.length > 0) {
    await saveArticles(blocked);
    console.log(`  Blocked/review: ${blocked.length} articles`);
  }
}

async function run() {
  console.log('🚀 Firecrawl fetch started:', new Date().toISOString());

  for (const [country, config] of Object.entries(SOURCES)) {
    await processCountry(country, config);
  }

  console.log('\n✅ Firecrawl fetch complete:', new Date().toISOString());
}

run();
