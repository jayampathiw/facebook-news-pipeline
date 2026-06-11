/**
 * Queue an "On This Day" multi-photo post for IT or FR.
 *
 * Usage:
 *   node src/scripts/queue-on-this-day.js IT [YYYY-MM-DD]
 *   node src/scripts/queue-on-this-day.js FR [YYYY-MM-DD]
 *
 * Date defaults to today (UTC). The script:
 *   1. Fetches Wikipedia "On This Day" events for the date
 *   2. Asks Claude to pick 3-5 significant IT/FR events and write the post
 *   3. Generates one AI image per event (1080x1080 square, Cloudflare Flux)
 *   4. Uploads images to Supabase Storage
 *   5. Inserts a row into on_this_day_posts with status=pending
 *
 * After reviewing in the dashboard, post with:
 *   node src/scripts/post-on-this-day.js <post-id>
 */
import 'dotenv/config';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { SOURCES } from '../config/sources.js';
import { fetchOnThisDay } from '../services/wikipedia.js';
import { filterAndWriteOnThisDayEvents } from '../services/claude.js';

const country   = (process.argv[2] || '').toUpperCase();
const dateArg   = process.argv[3];

if (!country || !['IT', 'FR'].includes(country)) {
  console.error('Usage: node src/scripts/queue-on-this-day.js <IT|FR> [YYYY-MM-DD]');
  process.exit(1);
}

const config = SOURCES[country];
if (!config) { console.error(`Unknown country: ${country}`); process.exit(1); }

const targetDate = dateArg ? new Date(dateArg + 'T00:00:00Z') : new Date();
const postDate   = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function generateViaCloudflare(prompt) {
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url   = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res   = await axios.post(
    url,
    { prompt, num_steps: 8, width: 1080, height: 1080 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 90_000 },
  );
  return Buffer.from(res.data.result.image, 'base64');
}

async function generateViaPollinations(prompt) {
  const model    = process.env.POLLINATIONS_MODEL || 'flux-pro';
  const token    = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
  const negative = 'text,watermark,logo,low quality,blurry,deformed';
  const url      = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&model=${model}&nologo=true&enhance=true&steps=35&negative=${encodeURIComponent(negative)}${token}`;
  const res      = await axios.get(url, { responseType: 'arraybuffer', timeout: 150_000 });
  return Buffer.from(res.data);
}

async function generateImage(prompt) {
  const provider = process.env.IMAGE_PROVIDER || 'cloudflare';
  if (provider === 'pollinations') return generateViaPollinations(prompt);
  return generateViaCloudflare(prompt);
}

async function uploadImage(postId, index, buf) {
  const path = `on-this-day/${postId}/event-${index}.png`;
  const { error } = await supabase.storage
    .from('article-images')
    .upload(path, buf, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/article-images/${path}`;
}

async function run() {
  console.log(`\n[${country}] Queuing "On This Day" for ${postDate}`);

  const { data: existing } = await supabase
    .from('on_this_day_posts')
    .select('id')
    .eq('country', country)
    .eq('post_date', postDate)
    .single();

  if (existing) {
    console.error(`Already queued for ${country} on ${postDate} (id: ${existing.id}). Delete it first to re-queue.`);
    process.exit(1);
  }

  console.log(`[${country}] Fetching Wikipedia events…`);
  const rawEvents = await fetchOnThisDay(country, targetDate);
  console.log(`[${country}] ${rawEvents.length} events found on Wikipedia`);

  console.log(`[${country}] Asking Claude to select & write…`);
  const result = await filterAndWriteOnThisDayEvents(
    rawEvents,
    country,
    config.captionLanguage,
    config.pageName,
    config.pageHashtag ?? `#${config.pageName.replace(/\s+/g, '')}`,
    targetDate,
  );

  const events = result.events || [];
  console.log(`[${country}] ${events.length} events selected by Claude`);

  // Insert row early so we have an ID for storage paths
  const title = country === 'IT'
    ? `Accadde oggi in Italia — ${targetDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', timeZone: 'UTC' })}`
    : `Il était une fois en France — ${targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}`;

  const { data: inserted, error: insertErr } = await supabase
    .from('on_this_day_posts')
    .insert({
      country,
      post_date: postDate,
      title,
      events: events.map(e => ({ year: e.year, title: e.title, summary: e.summary, image_prompt: e.image_prompt })),
      ai_caption: { intro: result.intro, question: result.question, cta: result.cta },
      hashtags: result.hashtags ?? [],
      status: 'pending',
    })
    .select()
    .single();

  if (insertErr) { console.error(`Insert failed: ${insertErr.message}`); process.exit(1); }
  const postId = inserted.id;
  console.log(`[${country}] Row inserted: ${postId}`);

  // Generate images sequentially to avoid rate limits
  const updatedEvents = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    console.log(`[${country}] Generating image ${i + 1}/${events.length}: ${ev.title}`);
    try {
      const buf = await generateImage(ev.image_prompt);
      const imageUrl = await uploadImage(postId, i + 1, buf);
      updatedEvents.push({ ...ev, image_url: imageUrl });
      console.log(`  ✓ ${imageUrl}`);
    } catch (err) {
      console.error(`  ✗ Image ${i + 1} failed: ${err.message}`);
      updatedEvents.push({ ...ev, image_url: null });
    }
  }

  await supabase
    .from('on_this_day_posts')
    .update({ events: updatedEvents })
    .eq('id', postId);

  const successCount = updatedEvents.filter(e => e.image_url).length;
  console.log(`\n✓ Queued "On This Day" post for ${country} — ${postDate}`);
  console.log(`  Post ID:   ${postId}`);
  console.log(`  Events:    ${events.length} (${successCount} with images)`);
  console.log(`  Title:     ${title}`);
  events.forEach(e => console.log(`  🏛️  [${e.year}] ${e.title}`));
  console.log(`\nReview in the dashboard → On This Day tab, then post with:`);
  console.log(`  node src/scripts/post-on-this-day.js ${postId}`);
}

run().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
