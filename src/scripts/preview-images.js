import 'dotenv/config';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { compositeImage } from '../utils/imageComposite.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '../../output/previews');
const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || 'cloudflare';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

mkdirSync(OUTPUT_DIR, { recursive: true });

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: node src/scripts/preview-images.js <id1> <id2> ...');
  process.exit(1);
}

async function run() {
  console.log(`[preview] Provider: ${IMAGE_PROVIDER}`);
  console.log(`[preview] Output: ${OUTPUT_DIR}\n`);

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, country, image_prompt, image_headline')
    .in('id', ids);

  if (error) { console.error('DB error:', error.message); process.exit(1); }

  for (const article of articles) {
    if (!article.image_prompt) {
      console.warn(`[${article.id}] No image_prompt — skipping`);
      continue;
    }

    console.log(`[${article.id}] Generating: "${article.title?.slice(0, 60)}"`);

    try {
      const imageBuffer = await generateImage(article.image_prompt);
      const finalBuffer = await compositeImage(imageBuffer, article.image_headline ?? '', article.country);

      const outPath = resolve(OUTPUT_DIR, `${article.id}.png`);
      await sharp(finalBuffer).toFile(outPath);
      console.log(`  ✓ Saved: ${outPath}`);
      console.log(`  Headline: "${article.image_headline}"`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }

    console.log('');
  }

  console.log('[preview] Done — open the output/previews/ folder to review images.');
}

async function generateImage(prompt) {
  if (IMAGE_PROVIDER === 'google')       return generateImageGoogle(prompt);
  if (IMAGE_PROVIDER === 'pollinations') return generateImagePollinations(prompt);
  return generateImageCloudflare(prompt);
}

async function generateImageCloudflare(prompt) {
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await axios.post(url,
    { prompt, num_steps: 8, width: 1080, height: 1080 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return Buffer.from(res.data.result.image, 'base64');
}

async function generateImageGoogle(prompt) {
  const model = process.env.GOOGLE_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_KEY}`;
  const res = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  }, { headers: { 'Content-Type': 'application/json' }, timeout: 60000 });
  const parts = res.data.candidates[0].content.parts;
  const imgPart = parts.find(p => p.inlineData);
  if (!imgPart) throw new Error('Google AI returned no image');
  return Buffer.from(imgPart.inlineData.data, 'base64');
}

async function generateImagePollinations(prompt) {
  const model = process.env.POLLINATIONS_MODEL || 'flux';
  const token = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&model=${model}&nologo=true${token}`;
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
  return Buffer.from(res.data);
}


run().catch(err => {
  console.error('PREVIEW FAILED:', err);
  process.exit(1);
});
