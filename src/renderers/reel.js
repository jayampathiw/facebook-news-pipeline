import 'dotenv/config';
import { spawn } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { writeFile } from 'fs/promises';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import sharp from 'sharp';
import { SOURCES } from '../config/sources.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const TTS_SCRIPT   = resolve(__dirname, 'tts.py');
const FONT_PATH    = resolve(PROJECT_ROOT, 'dashboard/public/fonts/Anton-Regular.ttf');
const LOGOS_DIR    = resolve(PROJECT_ROOT, 'dashboard/public/logos');
const MUSIC_DIR    = resolve(PROJECT_ROOT, 'assets/music');
const OUTPUT_DIR   = resolve(PROJECT_ROOT, 'output/reels');

// Voice per country
const VOICES = { FR: 'ff_siwis', IT: 'if_sara' };

// Whisper language codes
const LANG_CODES = { FR: 'fr', IT: 'it' };

// Music track per criticality
const MUSIC = {
  breaking: join(MUSIC_DIR, 'breaking.mp3'),
  alert:    join(MUSIC_DIR, 'breaking.mp3'),
  trending: join(MUSIC_DIR, 'standard.mp3'),
  standard: join(MUSIC_DIR, 'standard.mp3'),
};

// ── helpers ──────────────────────────────────────────────────────────────────

function run(cmd, args, label) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    proc.stdout.on('data', d => process.stdout.write(`[${label}] ${d}`));
    proc.stderr.on('data', d => process.stderr.write(`[${label}] ${d}`));
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${label} exited with code ${code}`));
    });
  });
}

async function getAudioDuration(wavPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-i', wavPath,
      '-show_entries', 'format=duration',
      '-v', 'quiet', '-of', 'csv=p=0',
    ]);
    let out = '';
    proc.stdout.on('data', d => { out += d; });
    proc.on('close', () => resolve(parseFloat(out.trim()) || 0));
    proc.on('error', reject);
  });
}

// ── Step 1: TTS ───────────────────────────────────────────────────────────────

export async function generateTTS(text, country, workDir) {
  const voice   = VOICES[country] || VOICES.FR;
  const wavPath = join(workDir, 'voice.wav');
  await run('python3', [TTS_SCRIPT, text, voice, wavPath], 'tts');
  return wavPath;
}

// ── Step 2: Subtitles ─────────────────────────────────────────────────────────

export async function generateSubtitles(wavPath, country, workDir) {
  const lang    = LANG_CODES[country] || 'fr';
  const srtName = 'voice.srt';
  await run('whisper', [
    wavPath,
    '--model', 'tiny',
    '--language', lang,
    '--output_dir', workDir,
    '--output_format', 'srt',
    '--word_timestamps', 'True',
  ], 'whisper');
  return join(workDir, srtName);
}

// ── Step 3: Background image ──────────────────────────────────────────────────

async function fetchImage(prompt) {
  const provider = process.env.IMAGE_PROVIDER || 'cloudflare';
  if (provider === 'google') return fetchImageGoogle(prompt);
  if (provider === 'pollinations') return fetchImagePollinations(prompt);
  return fetchImageCloudflare(prompt);
}

async function fetchImageCloudflare(prompt) {
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url   = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res   = await axios.post(url,
    { prompt, num_steps: 8, width: 1080, height: 1920 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return Buffer.from(res.data.result.image, 'base64');
}

async function fetchImageGoogle(prompt) {
  const model = process.env.GOOGLE_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
  const url   = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_KEY}`;
  const res   = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  }, { timeout: 60000 });
  const imgPart = res.data.candidates[0].content.parts.find(p => p.inlineData);
  if (!imgPart) throw new Error('Google AI returned no image');
  return Buffer.from(imgPart.inlineData.data, 'base64');
}

async function fetchImagePollinations(prompt) {
  const model = process.env.POLLINATIONS_MODEL || 'flux';
  const token = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
  const url   = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&model=${model}&nologo=true${token}`;
  const res   = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
  return Buffer.from(res.data);
}

async function prepareBgImage(article, workDir) {
  const bgPath = join(workDir, 'bg.png');

  if (article.generated_image_url) {
    try {
      const res = await axios.get(article.generated_image_url, { responseType: 'arraybuffer', timeout: 30000 });
      const buf = await sharp(Buffer.from(res.data))
        .resize(1080, 1920, { fit: 'cover', position: 'centre' })
        .png().toBuffer();
      await writeFile(bgPath, buf);
    } catch {
      console.log('  [reel] generated_image_url fetch failed — falling back to image_prompt');
      if (!article.image_prompt) throw new Error('Article has no image_prompt and generated_image_url failed');
      const raw = await fetchImage(article.image_prompt);
      const buf = await sharp(raw)
        .resize(1080, 1920, { fit: 'cover', position: 'centre' })
        .png().toBuffer();
      await writeFile(bgPath, buf);
    }
  } else if (article.image_prompt) {
    const raw = await fetchImage(article.image_prompt);
    const buf = await sharp(raw)
      .resize(1080, 1920, { fit: 'cover', position: 'centre' })
      .png().toBuffer();
    await writeFile(bgPath, buf);
  } else {
    throw new Error('Article has no image_prompt and no generated_image_url');
  }

  return bgPath;
}

// ── Step 4: FFmpeg compose ────────────────────────────────────────────────────

export async function compositeReel({ article, bgImagePath, wavPath, srtPath, musicTrack, workDir, outputPath }) {
  const country    = article.country;
  const logoFile   = SOURCES[country]?.watermarkFile ?? 'FranceAujourdhui_Logo.png';
  const logoPath   = join(LOGOS_DIR, logoFile);
  const headline   = (article.image_headline || article.title || '').replace(/'/g, "\\'").replace(/:/g, '\\:');
  const audioDur   = await getAudioDuration(wavPath);
  const totalDur   = audioDur + 2; // 2s tail after voice ends
  const fadeOutAt  = Math.max(0, totalDur - 2);

  // Escape subtitle path for FFmpeg
  const srtEscaped = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  // Build drawtext filter — headline at top, fades in at 0.5s
  const drawtextFilter = [
    `fontfile=${FONT_PATH}`,
    `text='${headline}'`,
    'fontsize=52',
    'fontcolor=white',
    'x=(w-tw)/2',
    'y=90',
    'borderw=3',
    `bordercolor=black@0.85`,
    `enable='between(t,0.5,${totalDur})'`,
    'alpha=\'if(lt(t,0.5),0,if(lt(t,1),(t-0.5)/0.5,1))\'',
  ].join(':');

  // Subtitle style — FontSize in ASS virtual-pixel units (default PlayRes 384×288 scaled to video)
  const subStyle = 'FontName=Arial,FontSize=13,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,MarginV=80,MarginL=40,MarginR=40';

  const filterComplex = [
    // Video: scale to 1080x1920 + headline text + subtitle burn-in + logo overlay
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,`,
    `drawtext=${drawtextFilter},`,
    `subtitles='${srtEscaped}':force_style='${subStyle}'`,
    `[vtext];`,
    // Scale watermark to 100px wide before overlay
    `[2:v]scale=100:-1[logo];`,
    `[vtext][logo]overlay=x=W-w-24:y=H-h-24:format=auto[vout];`,
    // Audio: voice-over + background music faded
    `[1:a]volume=1.0[voice];`,
    `[3:a]volume=0.15,afade=t=in:st=0:d=1,afade=t=out:st=${fadeOutAt}:d=2[music];`,
    `[voice][music]amix=inputs=2:duration=first[aout]`,
  ].join('');

  const ffmpegArgs = [
    '-y',
    '-loop', '1', '-i', bgImagePath,          // [0:v] static background
    '-i', wavPath,                              // [1:a] voice-over
    '-i', logoPath,                             // [2:v] watermark logo
    '-i', musicTrack,                           // [3:a] background music
    '-filter_complex', filterComplex,
    '-map', '[vout]', '-map', '[aout]',
    '-t', String(totalDur),
    '-r', '30',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    '-pix_fmt', 'yuv420p',
    outputPath,
  ];

  await run('ffmpeg', ffmpegArgs, 'ffmpeg');
  return outputPath;
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

export async function generateReel(article) {
  if (!article.ai_caption) throw new Error(`Article ${article.id} has no ai_caption — generate caption first`);

  const workDir    = `/tmp/reels/${article.id}`;
  const outputPath = join(OUTPUT_DIR, `${article.id}.mp4`);

  mkdirSync(workDir, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  try {
    const { intro, question, text } = article.ai_caption;
    // Support both new {intro,question,cta} format and legacy {text} format
    const narration = [intro, question].filter(Boolean).join(' ') || (text ?? '').split('\n')[0];
    if (!narration.trim()) throw new Error('ai_caption has no usable text for narration');

    console.log(`  [reel] TTS: "${narration.slice(0, 80)}..."`);
    const wavPath = await generateTTS(narration, article.country, workDir);

    console.log('  [reel] Subtitles...');
    const srtPath = await generateSubtitles(wavPath, article.country, workDir);

    console.log('  [reel] Background image...');
    const bgImagePath = await prepareBgImage(article, workDir);

    const criticality = article.criticality || 'standard';
    const musicTrack  = MUSIC[criticality] || MUSIC.standard;
    console.log(`  [reel] Music: ${criticality} → ${musicTrack}`);

    console.log('  [reel] FFmpeg compose...');
    await compositeReel({ article, bgImagePath, wavPath, srtPath, musicTrack, workDir, outputPath });

    const durationSeconds = Math.round(await getAudioDuration(outputPath));
    console.log(`  [reel] Done → ${outputPath} (${durationSeconds}s)`);

    return { outputPath, durationSeconds };
  } finally {
    try { rmSync(workDir, { recursive: true, force: true }); } catch {}
  }
}
