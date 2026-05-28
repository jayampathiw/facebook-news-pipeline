/**
 * Queue a historical-pride story into the same articles table as news.
 * Usage:
 *   node src/scripts/queue-historical-story.js <country> [topic-id]
 *
 * If topic-id is omitted, picks the next anniversary-matched topic (within
 * 14 days) or falls back to a random evergreen topic that hasn't been queued
 * in the last 365 days.
 *
 * After queuing, the article appears as `pending` in the dashboard. Review,
 * then post with:  node src/scripts/post-article.js <article-id>
 *
 * NOTE: do NOT click the dashboard ✦ Generate button on historical rows —
 * it calls the edge function which doesn't know about the historical lens.
 * Regenerate with this script instead if needed.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateCaption, generateImagePrompt, formatImagePrompt, generateSEOContent } from '../services/claude.js';
import { SOURCES } from '../config/sources.js';
import { HISTORICAL_SOURCE_BY_COUNTRY, getTopicById, getTopicsByCountry } from '../config/historical-stories.js';
import { pickNextTopic, topicToOriginalUrl } from '../utils/historicalTopics.js';
import { getRecentSeedComments, getPillarWeeklyCounts } from '../services/supabase.js';
import { computePublishScore } from '../utils/publishScore.js';
import { SLOTS } from '../services/facebook.js';

const LOOKBACK_DAYS = 365;

function usage() {
  console.error('Usage: node src/scripts/queue-historical-story.js <country> [topic-id]');
  console.error('  <country>  IT | FR');
  console.error('  [topic-id] optional — if omitted, picks next anniversary-matched or random unused topic');
  process.exit(1);
}

const country = (process.argv[2] || '').toUpperCase();
const topicIdArg = process.argv[3];

if (!country || !['IT', 'FR'].includes(country)) usage();
const config = SOURCES[country];
if (!config) { console.error(`Unknown country: ${country}`); process.exit(1); }

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function getQueuedTopicIds(country) {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from('articles')
    .select('historical_topic_id')
    .eq('country', country)
    .eq('source_type', 'historical')
    .gte('created_at', since);
  if (error) throw error;
  return (data || []).map(r => r.historical_topic_id).filter(Boolean);
}

async function resolveTopic() {
  if (topicIdArg) {
    const topic = getTopicById(topicIdArg);
    if (!topic) {
      console.error(`Topic not found: ${topicIdArg}`);
      console.error(`Available topics for ${country}:`);
      for (const t of getTopicsByCountry(country)) console.error(`  ${t.id}  — ${t.title}`);
      process.exit(1);
    }
    if (topic.country !== country) {
      console.error(`Topic ${topicIdArg} is for ${topic.country}, not ${country}`);
      process.exit(1);
    }
    return topic;
  }
  const queued = await getQueuedTopicIds(country);
  const next = pickNextTopic(country, queued);
  if (!next) {
    console.error(`All historical topics for ${country} have been queued in the last ${LOOKBACK_DAYS} days.`);
    console.error('Add more to src/config/historical-stories.js or pass a topic-id to force re-queue.');
    process.exit(1);
  }
  return next;
}

async function run() {
  const topic = await resolveTopic();
  console.log(`[${country}] Topic:    ${topic.id}`);
  console.log(`[${country}] Title:    ${topic.title}`);
  console.log(`[${country}] Mode:     ${topic.forced_mode} | Category: ${topic.category}`);
  if (topic.anniversary_date) console.log(`[${country}] Anniv:    ${topic.anniversary_date}`);

  const articleSeed = {
    country,
    source: HISTORICAL_SOURCE_BY_COUNTRY[country],
    source_type: 'historical',
    historical_topic_id: topic.id,
    title: topic.title,
    summary: topic.brief,
    original_url: topicToOriginalUrl(topic.id),
    published_at: new Date().toISOString(),
    status: 'pending',
    criticality: 'standard',
    boost_eligible: true,
  };

  console.log(`[${country}] Inserting article row…`);
  const { data: inserted, error: insertErr } = await supabase
    .from('articles')
    .insert(articleSeed)
    .select()
    .single();
  if (insertErr) { console.error(`Insert failed: ${insertErr.message}`); process.exit(1); }
  const articleId = inserted.id;
  console.log(`[${country}] Article id: ${articleId}`);

  console.log(`[${country}] Generating caption + image prompt + SEO…`);
  const recentSeedIds = await getRecentSeedComments(country);
  const [caption, imageResult, seoContent] = await Promise.all([
    generateCaption(inserted, config.captionLanguage, config.pageName, config.pageHashtag, recentSeedIds, {
      forcedMode: topic.forced_mode,
      historical: true,
    }),
    generateImagePrompt(inserted, config.captionLanguage),
    generateSEOContent(inserted, config.captionLanguage),
  ]);

  const pillar = caption.content_signals?.pillar_hint ?? null;
  const identityMode = caption.identity_mode || topic.forced_mode;
  const mergedSignals = {
    ...(caption.content_signals ?? {}),
    identity_mode: identityMode,
  };
  const weeklyPillarCounts = await getPillarWeeklyCounts(country);
  const scored = { ...inserted, pillar, content_signals: mergedSignals };
  const publish_score = computePublishScore(scored, weeklyPillarCounts, SLOTS[country] ?? []);

  console.log(`[${country}] Saving generated fields…`);
  const { error: updateErr } = await supabase.from('articles').update({
    ai_caption: { intro: caption.intro, question: caption.question, cta: caption.cta },
    hashtags: caption.hashtags ?? [],
    seed_comment: caption.seed_comment ?? null,
    seed_comment_template_id: caption.seed_comment_template_id ?? null,
    story_category: caption.story_category ?? null,
    content_signals: mergedSignals,
    image_headline: imageResult.imageHeadline,
    image_prompt: imageResult.prompt,
    formatted_image_prompt: formatImagePrompt(imageResult.prompt, imageResult.imageHeadline, config.watermarkFile),
    seo_title: seoContent.seo_title,
    seo_description: seoContent.seo_description,
    pillar,
    publish_score,
  }).eq('id', articleId);
  if (updateErr) { console.error(`Update failed: ${updateErr.message}`); process.exit(1); }

  console.log(`\n✓ Queued historical topic "${topic.id}"`);
  console.log(`  Article ID:  ${articleId}`);
  console.log(`  Mode:        ${identityMode}`);
  console.log(`  Category:    ${caption.story_category}`);
  console.log(`  Pillar:      ${pillar}`);
  console.log(`  SEO title:   ${seoContent.seo_title}`);
  console.log(`  Headline:    ${imageResult.imageHeadline}`);
  console.log(`  Intro:       ${caption.intro?.slice(0, 120)?.replace(/\n/g, ' ')}…`);
  console.log(`\nReview in the dashboard, then post with:`);
  console.log(`  node src/scripts/post-article.js ${articleId}`);
}

run().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
