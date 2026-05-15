import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import FormData from 'form-data';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, '../../assets');
const FB_BASE = 'https://graph.facebook.com/v22.0';
const STABILITY_API = 'https://api.stability.ai/v2beta/stable-image/generate/core';

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: node src/scripts/post-with-image.js <id1> [id2 ...]');
  process.exit(1);
}

if (!process.env.STABILITY_KEY) {
  console.error('Missing STABILITY_KEY in .env');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const antonFontB64 = readFileSync(resolve(ASSETS_DIR, 'fonts/Anton-Regular.ttf')).toString('base64');

for (const id of ids) {
  try {
    await processArticle(id);
  } catch (err) {
    console.error(`✗ ${id}: ${err.message}`);
  }
}

async function processArticle(id) {
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, ai_caption, image_prompt, image_headline, original_url, country, status')
    .eq('id', id)
    .single();

  if (error || !article) throw new Error(error?.message ?? 'Article not found');
  if (article.status !== 'approved') throw new Error(`Status is '${article.status}', must be 'approved'`);
  if (!article.ai_caption?.text) throw new Error('No ai_caption — run Generate first');
  if (!article.image_prompt) throw new Error('No image_prompt — run Generate first');

  const pageId = process.env[`FB_PAGE_ID_${article.country}`];
  const token  = process.env[`FB_ACCESS_TOKEN_${article.country}`];
  if (!pageId || !token) throw new Error(`Missing FB credentials for country: ${article.country}`);

  console.log(`→ Generating image for: ${id}`);
  const imageBuffer = await generateImage(article.image_prompt);

  console.log(`→ Compositing overlay…`);
  const finalBuffer = await compositeImage(imageBuffer, article.image_headline ?? '', article.country);

  console.log(`→ Uploading to Facebook…`);
  const fbPostId = await uploadToFacebook(finalBuffer, article.ai_caption.text, pageId, token);

  await supabase.from('articles').update({ status: 'posted', fb_post_id: fbPostId }).eq('id', id);
  console.log(`✓ Posted: https://www.facebook.com/${fbPostId}`);
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
