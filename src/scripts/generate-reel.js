import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateReel } from '../renderers/reel.js';
import { updateArticle } from '../services/supabase.js';
import { SOURCES } from '../config/sources.js';
import { hashTopic, isDuplicate, logReel } from '../utils/reelsLog.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: node src/scripts/generate-reel.js <id1> <id2> ...');
  process.exit(1);
}

const { data: articles, error } = await supabase
  .from('articles')
  .select('id, title, country, criticality, ai_caption, image_prompt, image_headline, generated_image_url, reel_path, tags')
  .in('id', ids);

if (error) { console.error('DB error:', error.message); process.exit(1); }

for (const article of articles) {
  console.log(`\n[${article.id}] "${article.title?.slice(0, 70)}"`);

  // Skip if reel already exists for this article
  if (article.reel_path) {
    console.log(`  ⚠ Reel already exists: ${article.reel_path} — skipping`);
    continue;
  }

  const config = SOURCES[article.country];
  if (!config) {
    console.error(`  ✗ Unknown country: ${article.country}`);
    continue;
  }

  const channel = config.pageName;
  // Derive niche from tags: sport tag → 'sport', else default 'news'
  const niche = article.tags?.includes('sport') ? 'sport' : 'news';
  const topicHash = hashTopic(article.title);

  try {
    // Dedup check: skip if same topic was already posted to this channel recently
    if (await isDuplicate(topicHash, channel, niche)) continue;

    const { outputPath, durationSeconds } = await generateReel(article);

    await updateArticle(article.id, { reel_path: outputPath, reel_duration: durationSeconds });

    await logReel({
      topicHash,
      topicTitle: article.title,
      channel,
      niche,
      country:  article.country,
      sourceId: article.id,
      reelPath: outputPath,
    });

    console.log(`  ✓ Saved: ${outputPath} (${durationSeconds}s) — DB updated, reels_log written`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
}
