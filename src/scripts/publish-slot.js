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

// IMAGE_PROVIDER selects the image generation backend.
// Supported: 'cloudflare' (default), 'google', 'pollinations'
// Set IMAGE_PROVIDER as a GitHub Actions variable (not secret) to switch providers.
const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || 'cloudflare';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`PUBLISH-SLOT FAILED: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (IMAGE_PROVIDER === 'cloudflare' && (!process.env.CF_ACCOUNT_ID || !process.env.CF_API_TOKEN)) {
  console.error('Missing CF_ACCOUNT_ID or CF_API_TOKEN for Cloudflare image generation');
  process.exit(1);
}
if (IMAGE_PROVIDER === 'google' && !process.env.GOOGLE_AI_KEY) {
  console.error('Missing GOOGLE_AI_KEY for Google AI image generation');
  process.exit(1);
}
// pollinations needs no key

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

// Dispatcher — routes to the active provider
async function generateImage(prompt) {
  console.log(`[image] Generating via provider: ${IMAGE_PROVIDER}`);
  if (IMAGE_PROVIDER === 'google')       return generateImageGoogle(prompt);
  if (IMAGE_PROVIDER === 'pollinations') return generateImagePollinations(prompt);
  return generateImageCloudflare(prompt); // default
}

// Cloudflare Workers AI — FLUX.1-schnell, ~2000 imgs/day free, resets daily
// Override model via CF_IMAGE_MODEL env var (e.g. @cf/stabilityai/stable-diffusion-xl-base-1.0)
async function generateImageCloudflare(prompt) {
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await axios.post(url,
    { prompt, num_steps: 8 },
    {
      headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
      timeout: 60000,
    }
  );
  return Buffer.from(res.data.result.image, 'base64');
}

// Google AI Studio — Gemini image generation, ~500 imgs/day free
// Override model via GOOGLE_IMAGE_MODEL env var
async function generateImageGoogle(prompt) {
  const model = process.env.GOOGLE_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_KEY}`;
  const res = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
  });
  const parts = res.data.candidates[0].content.parts;
  const imgPart = parts.find(p => p.inlineData);
  if (!imgPart) throw new Error('Google AI returned no image in response');
  return Buffer.from(imgPart.inlineData.data, 'base64');
}

// Pollinations.ai — free, no key required (POLLINATIONS_TOKEN optional, removes rate limits)
// Override model via POLLINATIONS_MODEL env var (e.g. flux-pro, turbo)
async function generateImagePollinations(prompt) {
  const model = process.env.POLLINATIONS_MODEL || 'flux';
  const token = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&model=${model}&nologo=true${token}`;
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
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
