/**
 * Queue "On This Day" multi-photo posts for IT or FR.
 *
 * Usage:
 *   node src/scripts/queue-on-this-day.js IT                          # today
 *   node src/scripts/queue-on-this-day.js IT 2026-06-11               # specific date
 *   node src/scripts/queue-on-this-day.js IT 2026-06-11 2026-06-12    # multiple dates
 *   node src/scripts/queue-on-this-day.js IT --next 7                 # next 7 days
 *
 * For each date the script:
 *   1. Fetches Wikipedia "On This Day" events
 *   2. Asks Claude to pick 3-5 significant IT/FR events and write the post
 *   3. Generates one AI image per event (1080x1080 square, Cloudflare Flux)
 *   4. Uploads images to Supabase Storage
 *   5. Inserts a row into on_this_day_posts with status=pending
 *
 * Dates already in the DB are skipped automatically.
 * After reviewing in the dashboard, post with:
 *   node src/scripts/post-on-this-day.js <post-id>
 */
import 'dotenv/config';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { SOURCES } from '../config/sources.js';
import { fetchOnThisDay } from '../services/wikipedia.js';
import { filterAndWriteOnThisDayEvents } from '../services/claude.js';

// ─── Argument parsing ────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const country = (args[0] || '').toUpperCase();

if (!country || !['IT', 'FR'].includes(country)) {
  console.error('Usage: node src/scripts/queue-on-this-day.js <IT|FR> [dates...] [--next N]');
  console.error('  IT                        → today');
  console.error('  IT 2026-06-11             → specific date');
  console.error('  IT 2026-06-11 2026-06-12  → multiple dates');
  console.error('  IT --next 7               → next 7 days from today');
  process.exit(1);
}

const config = SOURCES[country];
if (!config) { console.error(`Unknown country: ${country}`); process.exit(1); }

let datesToProcess = [];
const nextIdx = args.indexOf('--next');

if (nextIdx !== -1) {
  const n = parseInt(args[nextIdx + 1]) || 7;
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + i);
    datesToProcess.push(d.toISOString().slice(0, 10));
  }
} else if (args.length > 1) {
  datesToProcess = args.slice(1).filter(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
  if (!datesToProcess.length) {
    console.error('Date arguments must be in YYYY-MM-DD format');
    process.exit(1);
  }
} else {
  datesToProcess = [new Date().toISOString().slice(0, 10)];
}

// ─── Image generation ─────────────────────────────────────────────────────────

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

function generateImage(prompt) {
  return process.env.IMAGE_PROVIDER === 'pollinations'
    ? generateViaPollinations(prompt)
    : generateViaCloudflare(prompt);
}

async function uploadImage(postId, index, buf) {
  const path = `on-this-day/${postId}/event-${index}.png`;
  const { error } = await supabase.storage
    .from('article-images')
    .upload(path, buf, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/article-images/${path}`;
}

// ─── Core: queue one date ─────────────────────────────────────────────────────

async function queueDate(postDate) {
  console.log(`\n[${country}] ── ${postDate} ──────────────────────────`);

  const { data: existing } = await supabase
    .from('on_this_day_posts')
    .select('id')
    .eq('country', country)
    .eq('post_date', postDate)
    .single();

  if (existing) {
    console.log(`[${country}] Already queued (id: ${existing.id}) — skipping`);
    return { skipped: true, postDate, postId: existing.id };
  }

  const targetDate = new Date(postDate + 'T00:00:00Z');

  console.log(`[${country}] Fetching Wikipedia events…`);
  const rawEvents = await fetchOnThisDay(country, targetDate);
  console.log(`[${country}] ${rawEvents.length} events from Wikipedia`);

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
  console.log(`[${country}] ${events.length} events selected`);

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

  if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);
  const postId = inserted.id;
  console.log(`[${country}] Row inserted: ${postId}`);

  const updatedEvents = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    console.log(`[${country}] Image ${i + 1}/${events.length}: ${ev.title}`);
    try {
      const buf      = await generateImage(ev.image_prompt);
      const imageUrl = await uploadImage(postId, i + 1, buf);
      updatedEvents.push({ ...ev, image_url: imageUrl });
      console.log(`  ✓ ${imageUrl}`);
    } catch (err) {
      console.error(`  ✗ Image ${i + 1} failed: ${err.message}`);
      updatedEvents.push({ ...ev, image_url: null });
    }
  }

  await supabase.from('on_this_day_posts').update({ events: updatedEvents }).eq('id', postId);

  const ok = updatedEvents.filter(e => e.image_url).length;
  console.log(`[${country}] ✓ Done — ${events.length} events, ${ok} images`);
  events.forEach(e => console.log(`  🏛️  [${e.year}] ${e.title}`));

  return { skipped: false, postDate, postId, eventsCount: events.length, imagesOk: ok };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n[${country}] Queuing ${datesToProcess.length} date(s): ${datesToProcess.join(', ')}`);

  const summary = [];
  for (const date of datesToProcess) {
    try {
      const r = await queueDate(date);
      summary.push(r);
    } catch (err) {
      console.error(`[${country}] FAILED ${date}: ${err.message}`);
      summary.push({ postDate: date, error: err.message });
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`[${country}] Summary (${datesToProcess.length} date(s)):`);
  for (const r of summary) {
    if (r.error)   console.log(`  ✗ ${r.postDate}  ERROR: ${r.error}`);
    else if (r.skipped) console.log(`  ↩ ${r.postDate}  already queued (${r.postId})`);
    else           console.log(`  ✓ ${r.postDate}  ${r.eventsCount} events, ${r.imagesOk} images — id: ${r.postId}`);
  }
  console.log(`\nReview in the dashboard → On This Day tab.`);
}

run().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
