import 'dotenv/config';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { compositeImage } from '../utils/imageComposite.js';
import sharp from 'sharp';

const IDS = process.argv.slice(2);
if (!IDS.length) {
  console.error('Usage: node src/scripts/generate-and-store-images.js <id1> <id2> ...');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function generateViaCloudflare(prompt) {
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await axios.post(
    url,
    { prompt, num_steps: 8, width: 1080, height: 1920 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 90000 }
  );
  return Buffer.from(res.data.result.image, 'base64');
}

async function generateViaPollinations(prompt) {
  const model = process.env.POLLINATIONS_MODEL || 'flux-pro';
  const token = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
  const negative = 'photorealistic photograph,DSLR photo,low quality,blurry,noise,jpeg artifacts,deformed limbs,extra fingers,anatomical errors,missing limbs';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&model=${model}&nologo=true&enhance=true&steps=35&negative=${encodeURIComponent(negative)}${token}`;
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 150000 });
  return Buffer.from(res.data);
}

async function generate(prompt) {
  const provider = process.env.IMAGE_PROVIDER || 'cloudflare';
  if (provider === 'pollinations') return generateViaPollinations(prompt);
  return generateViaCloudflare(prompt);
}

async function sharpen(buf) {
  return sharp(buf).sharpen({ sigma: 1.2, m1: 0.5, m2: 3.5 }).toBuffer();
}

async function uploadToStorage(id, buf) {
  const path = `${id}.png`;
  const { error } = await supabase.storage
    .from('article-images')
    .upload(path, buf, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/article-images/${path}`;
}

async function run() {
  const provider = process.env.IMAGE_PROVIDER || 'cloudflare';
  console.log(`\n🖼  Image generation — provider: ${provider}`);
  console.log(`   Articles: ${IDS.length}\n`);

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, country, image_prompt, image_headline')
    .in('id', IDS);

  if (error) { console.error('DB fetch failed:', error.message); process.exit(1); }

  let ok = 0, fail = 0;

  for (const art of articles) {
    if (!art.image_prompt) {
      console.warn(`  ⚠ ${art.id}: no image_prompt — skipping`);
      fail++;
      continue;
    }
    const label = art.title?.slice(0, 55) + '…';
    console.log(`  ⏳ [${art.country}] ${label}`);
    try {
      const raw       = await generate(art.image_prompt);
      const sharpened = await sharpen(raw);
      const composited = await compositeImage(sharpened, art.image_headline ?? '', art.country);
      const url       = await uploadToStorage(art.id, composited);

      await supabase.from('articles').update({ generated_image_url: url }).eq('id', art.id);

      console.log(`  ✓ Saved → ${url}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${art.id}: ${err.message}`);
      fail++;
    }
    console.log('');
  }

  console.log(`\n✅ Done — ${ok} generated, ${fail} failed`);
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
