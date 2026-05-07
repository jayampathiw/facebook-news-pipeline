import 'dotenv/config';
import { getArticleById, updateArticle } from '../services/supabase.js';
import { generateCaption, generateImagePrompt, formatImagePrompt } from '../services/claude.js';
import { SOURCES } from '../config/sources.js';

const articleId = process.argv[2];
if (!articleId) {
  console.error('Usage: node src/scripts/generate-caption.js <article-id>');
  process.exit(1);
}

const article = await getArticleById(articleId);
if (!article) {
  console.error(`Article not found: ${articleId}`);
  process.exit(1);
}

const config = SOURCES[article.country];
if (!config) {
  console.error(`Unknown country for article: ${article.country}`);
  process.exit(1);
}

const [caption, imagePrompt] = await Promise.all([
  generateCaption(article, config.captionLanguage, config.pageName),
  generateImagePrompt(article),
]);

await updateArticle(articleId, {
  ai_caption: caption,
  image_prompt: imagePrompt,
  formatted_image_prompt: formatImagePrompt(imagePrompt, article.title, config.watermarkFile),
});

console.log(`Caption generated for article ${articleId}`);
console.log(JSON.stringify(caption, null, 2));
