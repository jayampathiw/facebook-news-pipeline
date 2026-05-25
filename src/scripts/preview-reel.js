import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateReel } from '../renderers/reel.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: node src/scripts/preview-reel.js <id1> <id2> ...');
  console.error('Renders reels locally to output/reels/ without updating the database.');
  process.exit(1);
}

const { data: articles, error } = await supabase
  .from('articles')
  .select('id, title, country, criticality, ai_caption, image_prompt, image_headline, generated_image_url')
  .in('id', ids);

if (error) { console.error('DB error:', error.message); process.exit(1); }

console.log(`[preview-reel] Output: output/reels/\n`);

for (const article of articles) {
  console.log(`[${article.id}] "${article.title?.slice(0, 70)}"`);
  try {
    const { outputPath, durationSeconds } = await generateReel(article);
    console.log(`  ✓ Saved: ${outputPath} (${durationSeconds}s) — DB not updated`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
  console.log('');
}

console.log('[preview-reel] Done — open output/reels/ to review.');
