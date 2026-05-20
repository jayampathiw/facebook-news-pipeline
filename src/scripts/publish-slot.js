import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import FormData from 'form-data';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { SLOTS, logBoostEligibleWindowStart } from '../services/facebook.js';
import { getApprovedArticlesSortedByScore, getFirstBoostIneligiblePostedIT } from '../services/supabase.js';
import { nearestSlot } from '../utils/publishScore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, '../../assets');
const FB_BASE = 'https://graph.facebook.com/v22.0';
const STABILITY_API = 'https://api.stability.ai/v2beta/stable-image/generate/core';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`PUBLISH-SLOT FAILED: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (!process.env.STABILITY_KEY) {
  console.error('Missing STABILITY_KEY — image generation unavailable');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const antonFontB64 = readFileSync(resolve(ASSETS_DIR, 'fonts/Anton-Regular.ttf')).toString('base64');

async function run() {
  console.log(`[publish-slot] Starting: ${new Date().toISOString()}`);

  for (const [country, slots] of Object.entries(SLOTS)) {
    const { inWindow, closest } = nearestSlot(country, slots);
    if (!inWindow) {
      console.log(`[${country}] Not in slot window (nearest: ${closest})`);
      continue;
    }
    console.log(`[${country}] In slot window for ${closest} CEST`);
    await publishForCountry(country, closest);
  }

  console.log(`[publish-slot] Done: ${new Date().toISOString()}`);
}

async function publishForCountry(country, slotTarget) {
  const articles = await getApprovedArticlesSortedByScore(country);
  if (!articles.length) {
    console.log(`[${country}] No approved articles`);
    return;
  }

  const article = articles[0];
  const runnerUp = articles[1];
  console.log(`[${country}] slot=${slotTarget} article=${article.id} score=${article.publish_score?.toFixed(1)} runner_up_score=${runnerUp?.publish_score?.toFixed(1) ?? 'none'}`);

  if (!article.ai_caption?.intro && !article.ai_caption?.text) {
    console.error(`[${country}] Article ${article.id} has no ai_caption — skipping`);
    return;
  }
  if (!article.image_prompt) {
    console.error(`[${country}] Article ${article.id} has no image_prompt — skipping`);
    return;
  }

  const pageId = process.env[`FB_PAGE_ID_${country}`];
  const token  = process.env[`FB_ACCESS_TOKEN_${country}`];
  if (!pageId || !token) {
    console.error(`[${country}] Missing FB credentials — skipping`);
    return;
  }

  try {
    console.log(`[${country}] Generating image for article ${article.id}…`);
    const imageBuffer = await generateImage(article.image_prompt);

    console.log(`[${country}] Compositing overlay…`);
    const finalBuffer = await compositeImage(imageBuffer, article.image_headline ?? '', country);

    const captionText = [article.ai_caption.intro, article.ai_caption.question, article.ai_caption.cta]
      .filter(Boolean).join('\n\n') || article.ai_caption.text || '';

    console.log(`[${country}] Uploading to Facebook…`);
    const fbPostId = await uploadToFacebook(finalBuffer, captionText, pageId, token);

    const postedAt = new Date().toISOString();
    const { error: dbError } = await supabase.from('articles').update({
      status: 'posted',
      fb_post_id: fbPostId,
      posted_at: postedAt,
    }).eq('id', article.id);

    if (dbError) {
      console.error(`[${country}] DB write-back failed for ${article.id}: ${dbError.message}`);
    }

    console.log(`[${country}] SLOT_POST slot_target=${slotTarget} actual_fire_time=${postedAt} article_id=${article.id} publish_score=${article.publish_score?.toFixed(1)} runner_up=${runnerUp?.id ?? 'none'} runner_up_score=${runnerUp?.publish_score?.toFixed(1) ?? 'none'}`);
    console.log(`[${country}] Posted: https://www.facebook.com/${fbPostId}`);

    if (country === 'IT' && article.boost_eligible === false) {
      const existing = await getFirstBoostIneligiblePostedIT();
      if (!existing || existing.id === article.id) {
        logBoostEligibleWindowStart(country, article.id, postedAt);
      }
    }
  } catch (err) {
    console.error(`[${country}] Failed to post article ${article.id}: ${err.message}`);

    await supabase.from('articles').update({ status: 'failed' }).eq('id', article.id);
  }
}

async function generateImage(prompt) {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('aspect_ratio', '1:1');
  form.append('output_format', 'png');

  const res = await axios.post(STABILITY_API, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STABILITY_KEY}`,
      Accept: 'image/*',
    },
    responseType: 'arraybuffer',
    timeout: 60000,
  });

  return Buffer.from(res.data);
}

async function compositeImage(imageBuffer, headline, country) {
  const meta = await sharp(imageBuffer).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  const gradientSvg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="black" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="black" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${Math.round(h * 0.35)}" fill="url(#g)"/>
    </svg>`
  );

  const safeHeadline = (headline || '').replace(/[<>&"']/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] ?? c)
  );
  const fontSize = Math.round(w * 0.065);
  const textY = Math.round(h * 0.14);

  const textSvg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: 'Anton';
            src: url('data:font/ttf;base64,${antonFontB64}');
          }
        </style>
      </defs>
      <text x="50%" y="${textY}" font-family="Anton" font-size="${fontSize}"
            fill="white" fill-opacity="0.8" text-anchor="middle" dominant-baseline="middle">
        ${safeHeadline}
      </text>
    </svg>`
  );

  const logoPath = resolve(ASSETS_DIR, `logos/${country}_Logo.png`);
  let logoBuffer = null;
  try {
    const logoRaw = await sharp(logoPath)
      .resize(Math.round(w * 0.15))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { data, info } = logoRaw;
    for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * 0.7);
    logoBuffer = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    }).png().toBuffer();
  } catch {
    console.warn(`  No logo found at ${logoPath} — skipping watermark`);
  }

  const composites = [
    { input: gradientSvg, top: 0, left: 0 },
    { input: textSvg, top: 0, left: 0 },
  ];
  if (logoBuffer) {
    composites.push({ input: logoBuffer, gravity: 'southeast', blend: 'over' });
  }

  return sharp(imageBuffer)
    .composite(composites)
    .png()
    .toBuffer();
}

async function uploadToFacebook(imageBuffer, caption, pageId, token) {
  const form = new FormData();
  form.append('caption', caption);
  form.append('access_token', token);
  form.append('source', imageBuffer, { filename: 'post.png', contentType: 'image/png' });

  const res = await axios.post(`${FB_BASE}/${pageId}/photos`, form, {
    headers: form.getHeaders(),
    timeout: 60000,
  });

  return res.data.id;
}

run().catch(err => {
  console.error('PUBLISH-SLOT FAILED:', err);
  process.exit(1);
});
