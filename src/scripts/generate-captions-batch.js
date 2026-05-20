import 'dotenv/config';
import { getPendingArticles, updateArticle, getRecentSeedComments, getPillarWeeklyCounts } from '../services/supabase.js';
import { generateCaption, generateImagePrompt, formatImagePrompt, generateSEOContent } from '../services/claude.js';
import { SOURCES } from '../config/sources.js';
import { computePublishScore } from '../utils/publishScore.js';
import { SLOTS } from '../services/facebook.js';

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
const recentSeedIdsByCountry = {};
const weeklyPillarCountsByCountry = {};

for (const article of pending) {
  const config = SOURCES[article.country];
  if (!config) {
    errors.push({ id: article.id, title: article.title, error: `Unknown country: ${article.country}` });
    continue;
  }

  try {
    if (!recentSeedIdsByCountry[article.country]) {
      recentSeedIdsByCountry[article.country] = await getRecentSeedComments(article.country);
    }
    if (!weeklyPillarCountsByCountry[article.country]) {
      weeklyPillarCountsByCountry[article.country] = await getPillarWeeklyCounts(article.country);
    }
    const recentSeedIds = recentSeedIdsByCountry[article.country];

    const [caption, imageResult, seoContent] = await Promise.all([
      generateCaption(article, config.captionLanguage, config.pageName, config.pageHashtag, recentSeedIds),
      generateImagePrompt(article, config.captionLanguage),
      generateSEOContent(article, config.captionLanguage),
    ]);

    const pillar = caption.content_signals?.pillar_hint ?? null;
    const updatedArticle = { ...article, pillar, content_signals: caption.content_signals ?? {} };
    const publish_score = computePublishScore(updatedArticle, weeklyPillarCountsByCountry[article.country], SLOTS[article.country] ?? []);

    await updateArticle(article.id, {
      ai_caption: { intro: caption.intro, question: caption.question, cta: caption.cta },
      hashtags: caption.hashtags ?? [],
      seed_comment: caption.seed_comment ?? null,
      seed_comment_template_id: caption.seed_comment_template_id ?? null,
      story_category: caption.story_category ?? null,
      content_signals: caption.content_signals ?? {},
      image_headline: imageResult.imageHeadline,
      image_prompt: imageResult.prompt,
      formatted_image_prompt: formatImagePrompt(imageResult.prompt, imageResult.imageHeadline, config.watermarkFile),
      seo_title: seoContent.seo_title,
      seo_description: seoContent.seo_description,
      pillar,
      publish_score,
    });

    if (caption.seed_comment_template_id) {
      recentSeedIdsByCountry[article.country].push(caption.seed_comment_template_id);
    }
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
