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
const WORK_DIR     = '/tmp/simple-reel/italy-beauty';
const OUTPUT_PATH  = join(OUTPUT_DIR, 'italy-beauty.mp4');

const NARRATION =
  "L'Italia è il Paese più bello del mondo. " +
  "Dalle cime delle Dolomiti alle spiagge dorate del Mediterraneo, " +
  "ogni angolo racconta secoli di arte, storia e bellezza senza paragoni. " +
  "Un Paese che ha regalato al mondo Leonardo da Vinci, Ferrari e la pizza. " +
  "Non è solo una nazione — è un capolavoro. " +
  "Se ami l'Italia, segui questa pagina — ogni giorno, la tua dose di bellezza italiana.";

const IMAGE_PROMPT =
  'Breathtaking aerial cinematic collage of Italy\'s most iconic landscapes — ' +
  'snow-capped Dolomite spires, rolling golden Tuscan hills with cypress trees, ' +
  'crystal-blue Amalfi Coast cliffs, ancient Rome Colosseum at sunset — ' +
  'warm golden hour light, ultra-realistic photography, 9:16 vertical format';

const ARTICLE = {
  country: 'IT',
  image_headline: 'ITALIA, LA PIU BELLA DEL MONDO',
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

console.log('[simple-reel-it] TTS...');
const wavPath = await generateTTS(NARRATION, 'IT', WORK_DIR);

console.log('[simple-reel-it] Image...');
const raw = await fetchImage(IMAGE_PROMPT);
const bgImagePath = join(WORK_DIR, 'bg.png');
const buf = await sharp(raw).resize(1080, 1920, { fit: 'cover', position: 'centre' }).png().toBuffer();
await writeFile(bgImagePath, buf);

const MUSIC_DIR = resolve(PROJECT_ROOT, 'assets/music');
const musicTrack = join(MUSIC_DIR, 'standard.mp3');

console.log('[simple-reel-it] FFmpeg compose...');
await compositeReel({ article: ARTICLE, bgImagePath, wavPath, srtPath: null, musicTrack, workDir: WORK_DIR, outputPath: OUTPUT_PATH });

console.log(`\n✅ Done: ${OUTPUT_PATH}`);
