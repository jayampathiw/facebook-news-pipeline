import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateReel } from '../renderers/reel.js';
import { updateArticle } from '../services/supabase.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: node src/scripts/generate-reel.js <id1> <id2> ...');
  process.exit(1);
}

const { data: articles, error } = await supabase
  .from('articles')
  .select('id, title, country, criticality, ai_caption, image_prompt, image_headline, generated_image_url')
  .in('id', ids);

if (error) { console.error('DB error:', error.message); process.exit(1); }

for (const article of articles) {
  console.log(`\n[${article.id}] "${article.title?.slice(0, 70)}"`);
  try {
    const { outputPath, durationSeconds } = await generateReel(article);
    await updateArticle(article.id, { reel_path: outputPath, reel_duration: durationSeconds });
    console.log(`  ✓ Saved: ${outputPath} (${durationSeconds}s) — DB updated`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
}
