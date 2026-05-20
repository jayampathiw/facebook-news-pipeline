import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { computePublishScore } from '../utils/publishScore.js';
import { SLOTS } from '../services/facebook.js';
import { getPillarWeeklyCounts } from '../services/supabase.js';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`RECOMPUTE-SCORES FAILED: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
  console.log(`[recompute-scores] Starting: ${new Date().toISOString()}`);

  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .in('status', ['pending', 'approved']);

  if (error) {
    console.error('Failed to fetch articles:', error.message);
    process.exit(1);
  }

  if (!articles?.length) {
    console.log('[recompute-scores] No pending/approved articles to recompute');
    return;
  }

  const countriesInBatch = [...new Set(articles.map(a => a.country))];
  const weeklyCountsByCountry = {};
  for (const country of countriesInBatch) {
    weeklyCountsByCountry[country] = await getPillarWeeklyCounts(country);
  }

  let updated = 0;
  const errors = [];

  for (const article of articles) {
    const slots = SLOTS[article.country] ?? [];
    const weeklyCounts = weeklyCountsByCountry[article.country] ?? {};
    const publish_score = computePublishScore(article, weeklyCounts, slots);

    const { error: updateError } = await supabase
      .from('articles')
      .update({ publish_score })
      .eq('id', article.id);

    if (updateError) {
      errors.push({ id: article.id, error: updateError.message });
    } else {
      updated++;
    }
  }

  console.log(`[recompute-scores] Updated ${updated}/${articles.length} articles`);
  if (errors.length > 0) {
    console.error(`[recompute-scores] Errors: ${errors.length}`);
    for (const e of errors) {
      console.error(`  - ${e.id}: ${e.error}`);
    }
  }

  console.log(`[recompute-scores] Done: ${new Date().toISOString()}`);
}

run().catch(err => {
  console.error('RECOMPUTE-SCORES FAILED:', err);
  process.exit(1);
});
