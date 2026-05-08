import 'dotenv/config';
import { getArticleById, updateArticle } from '../services/supabase.js';
import { generateCaption, generateImagePrompt, formatImagePrompt, generateSEOContent } from '../services/claude.js';
import { SOURCES } from '../config/sources.js';

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error('Usage: node src/scripts/generate-caption.js <id1> <id2> ...');
  process.exit(1);
}

let processed = 0;
let firstResult = null;

for (const id of ids) {
  try {
    const article = await getArticleById(id);
    if (!article) {
      console.error(`Article not found: ${id}`);
      continue;
    }

    const config = SOURCES[article.country];
    if (!config) {
      console.error(`Unknown country for article ${id}: ${article.country}`);
      continue;
    }

    const [caption, imageResult, seoContent] = await Promise.all([
      generateCaption(article, config.captionLanguage, config.pageName),
      generateImagePrompt(article),
      generateSEOContent(article, config.captionLanguage),
    ]);

    await updateArticle(id, {
      ai_caption: { ...caption, image_headline: imageResult.imageHeadline },
      image_prompt: imageResult.prompt,
      formatted_image_prompt: formatImagePrompt(imageResult.prompt, imageResult.imageHeadline, config.watermarkFile),
      seo_title: seoContent.seo_title,
      seo_description: seoContent.seo_description,
    });

    processed++;
    if (!firstResult) firstResult = { id, caption, imageResult, seoContent };
    console.log(`  ✓ ${id}: "${article.title.slice(0, 60)}"`);
  } catch (err) {
    console.error(`  ✗ ${id}: ${err.message}`);
  }
}

console.log(`\nGenerated for ${processed}/${ids.length} articles`);

if (firstResult) {
  console.log('\nSample result:');
  console.log(`  seo_title: ${firstResult.seoContent.seo_title}`);
  console.log(`  image_headline: ${firstResult.imageResult.imageHeadline}`);
  console.log(`  intro: ${firstResult.caption.intro?.slice(0, 100)}...`);
}
