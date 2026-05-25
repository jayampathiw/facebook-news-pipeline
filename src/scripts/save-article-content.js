import 'dotenv/config';
import { readFileSync } from 'fs';
import { updateArticle } from '../services/supabase.js';
import { formatImagePrompt } from '../services/claude.js';
import { SOURCES } from '../config/sources.js';

// Pure DB writer — no Anthropic API calls.
// Called by Claude Code skills after in-context generation.
// Direct CLI / Dashboard use: use generate-caption.js instead (calls Anthropic API).

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node src/scripts/save-article-content.js <json-file>');
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(readFileSync(filePath, 'utf8'));
} catch (err) {
  console.error(`Failed to read or parse ${filePath}: ${err.message}`);
  process.exit(1);
}

const { id, country, ai_caption, seo_title, seo_description, image_prompt } = payload;

if (!id || !country || !ai_caption || !image_prompt) {
  console.error('JSON must include: id, country, ai_caption, image_prompt');
  process.exit(1);
}

const config = SOURCES[country];
if (!config) {
  console.error(`Unknown country: ${country}`);
  process.exit(1);
}

const formatted_image_prompt = formatImagePrompt(
  image_prompt,
  ai_caption.image_headline || seo_title || '',
  config.watermarkFile
);

await updateArticle(id, {
  ai_caption,
  image_headline: ai_caption.image_headline || null,
  seo_title,
  seo_description,
  image_prompt,
  formatted_image_prompt,
});

console.log(`✓ Saved: ${id}`);
