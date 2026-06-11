import 'dotenv/config';
import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import sharp from 'sharp';
import { generateTTS, compositeReel } from '../renderers/reel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const OUTPUT_DIR   = resolve(PROJECT_ROOT, 'output/reels');
const WORK_DIR     = '/tmp/simple-reel/france-beauty';
const OUTPUT_PATH  = join(OUTPUT_DIR, 'france-beauty.mp4');

const NARRATION =
  "La France est le plus beau pays du monde. " +
  "Des champs de lavande de Provence aux châteaux majestueux de la Loire, " +
  "chaque région est un chef-d'œuvre à ciel ouvert. " +
  "Un pays qui a offert au monde Versailles, Chanel et la haute cuisine. " +
  "Ce n'est pas seulement une nation — c'est une civilisation. " +
  "Si vous aimez la France, suivez cette page — chaque jour, votre dose de beauté française.";

const IMAGE_PROMPT =
  'Epic aerial cinematic collage of France\'s most iconic landscapes — ' +
  'purple lavender fields of Provence, Loire Valley château at golden hour, ' +
  'Mont Saint-Michel rising from the misty sea, snow-capped Mont Blanc — ' +
  'warm golden light unifying the scene, ultra-realistic photography, 9:16 vertical format';

const ARTICLE = {
  country: 'FR',
  image_headline: 'LA FRANCE EST LA PLUS BELLE',
  criticality: 'standard',
};

async function fetchImage(prompt) {
  const model = process.env.IMAGE_PROVIDER === 'cloudflare' ? null : 'flux';
  if (!model) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const res = await axios.post(url,
      { prompt, num_steps: 8, width: 1080, height: 1920 },
      { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 60000 }
    );
    return Buffer.from(res.data.result.image, 'base64');
  }
  const token = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&model=flux&nologo=true${token}`;
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
  return Buffer.from(res.data);
}

mkdirSync(WORK_DIR, { recursive: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('[simple-reel-fr] TTS...');
const wavPath = await generateTTS(NARRATION, 'FR', WORK_DIR);

console.log('[simple-reel-fr] Image...');
const raw = await fetchImage(IMAGE_PROMPT);
const bgImagePath = join(WORK_DIR, 'bg.png');
const buf = await sharp(raw).resize(1080, 1920, { fit: 'cover', position: 'centre' }).png().toBuffer();
await writeFile(bgImagePath, buf);

const MUSIC_DIR = resolve(PROJECT_ROOT, 'assets/music');
const musicTrack = join(MUSIC_DIR, 'standard.mp3');

console.log('[simple-reel-fr] FFmpeg compose...');
await compositeReel({ article: ARTICLE, bgImagePath, wavPath, srtPath: null, musicTrack, workDir: WORK_DIR, outputPath: OUTPUT_PATH });

console.log(`\n✅ Done: ${OUTPUT_PATH}`);
