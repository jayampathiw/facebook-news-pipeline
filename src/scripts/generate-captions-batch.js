import 'dotenv/config';
import { getPendingArticles, updateArticle } from '../services/supabase.js';
import { generateCaption, generateImagePrompt, formatImagePrompt, generateSEOContent } from '../services/claude.js';
import { SOURCES } from '../config/sources.js';

const countryArg = (() => {
  const idx = process.argv.indexOf('--country');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const all = await getPendingArticles(countryArg);
const pending = all.filter(a => a.ai_caption == null);

if (pending.length === 0) {
  console.log('No pending articles without captions.');
  process.exit(0);
}

const grouped = pending.reduce((acc, a) => {
  acc[a.country] = (acc[a.country] || 0) + 1;
  return acc;
}, {});

console.log('Pending articles without ai_caption:');
for (const [country, count] of Object.entries(grouped)) {
  console.log(`  ${country}: ${count}`);
}
console.log(`Total: ${pending.length}\n`);

let processed = 0;
const errors = [];

for (const article of pending) {
  const config = SOURCES[article.country];
  if (!config) {
    errors.push({ id: article.id, title: article.title, error: `Unknown country: ${article.country}` });
    continue;
  }

  try {
    const [caption, imageResult, seoContent] = await Promise.all([
      generateCaption(article, config.captionLanguage, config.pageName, config.pageHashtag),
      generateImagePrompt(article),
      generateSEOContent(article, config.captionLanguage),
    ]);

    await updateArticle(article.id, {
      ai_caption: { text: caption.caption },
      hashtags: caption.hashtags ?? [],
      seed_comment: caption.seed_comment ?? null,
      story_category: caption.story_category ?? null,
      image_headline: imageResult.imageHeadline,
      image_prompt: imageResult.prompt,
      formatted_image_prompt: formatImagePrompt(imageResult.prompt, imageResult.imageHeadline, config.watermarkFile),
      seo_title: seoContent.seo_title,
      seo_description: seoContent.seo_description,
    });

    processed++;
    console.log(`  ✓ [${article.country}] "${article.title.slice(0, 60)}"`);
  } catch (err) {
    errors.push({ id: article.id, title: article.title, error: err.message });
    console.error(`  ✗ [${article.country}] "${article.title.slice(0, 60)}" — ${err.message}`);
  }
}

console.log(`\nGenerated: ${processed}/${pending.length}`);
if (errors.length > 0) {
  console.error(`Errors: ${errors.length}`);
  for (const e of errors) {
    console.error(`  - ${e.id}: "${e.title.slice(0, 60)}" — ${e.error}`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);
