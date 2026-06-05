import 'dotenv/config';
import { spawn } from 'child_process';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import sharp from 'sharp';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const ROOT       = resolve(__dirname, '../..');
const TTS_SCRIPT = resolve(__dirname, 'tts.py');
const FONT       = resolve(ROOT, 'dashboard/public/fonts/Anton-Regular.ttf');
const LOGOS_DIR  = resolve(ROOT, 'dashboard/public/logos');
const MUSIC_DIR  = resolve(ROOT, 'assets/music');
const OUTPUT_DIR = resolve(ROOT, 'output/documentaries');

const VOICES     = { FR: 'ff_siwis', IT: 'if_sara' };
const LANG_CODES = { FR: 'fr', IT: 'it' };
const LOGO_FILES = { FR: 'FranceAujourdhui_Logo.png', IT: 'vivere_in_italia_banner_logo.png' };

const TTS_SPEED = 0.85; // slower for emotional documentary delivery
const TAIL      = 3;    // extra seconds after voice ends (for CTA display)

function run(cmd, args, label) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    p.stdout.on('data', d => process.stdout.write(`[${label}] ${d}`));
    p.stderr.on('data', d => process.stderr.write(`[${label}] ${d}`));
    p.on('close', code => code === 0 ? res() : rej(new Error(`${label} exited with code ${code}`)));
  });
}

async function getAudioDuration(filePath) {
  return new Promise((res, rej) => {
    const p = spawn('ffprobe', [
      '-i', filePath,
      '-show_entries', 'format=duration',
      '-v', 'quiet', '-of', 'csv=p=0',
    ]);
    let out = '';
    p.stdout.on('data', d => { out += d; });
    p.on('close', () => res(parseFloat(out.trim()) || 0));
    p.on('error', rej);
  });
}

async function ttsScene(text, country, outPath) {
  const voice = VOICES[country] || VOICES.IT;
  await run('python3', [TTS_SCRIPT, text, voice, outPath, String(TTS_SPEED)], 'tts');
  return outPath;
}

async function concatWavs(wavPaths, outPath) {
  const inputs = wavPaths.flatMap(p => ['-i', p]);
  const filter = wavPaths.map((_, i) => `[${i}:a]`).join('') +
    `concat=n=${wavPaths.length}:v=0:a=1[aout]`;
  await run('ffmpeg', ['-y', ...inputs, '-filter_complex', filter, '-map', '[aout]', outPath], 'concat-audio');
}

async function fetchImageOnce(prompt) {
  const provider = process.env.IMAGE_PROVIDER || 'cloudflare';

  if (provider === 'huggingface') {
    const model = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell';
    const url   = `https://router.huggingface.co/hf-inference/models/${model}`;
    const res   = await axios.post(url,
      { inputs: prompt, parameters: { width: 1080, height: 1920, num_inference_steps: 4 } },
      { headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, 'Content-Type': 'application/json' }, responseType: 'arraybuffer', timeout: 120000 }
    );
    return Buffer.from(res.data);
  }

  if (provider === 'pollinations') {
    const model = process.env.POLLINATIONS_MODEL || 'flux';
    const token = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
    const url   = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&model=${model}&nologo=true${token}`;
    const res   = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
    return Buffer.from(res.data);
  }

  if (provider === 'google') {
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

  // cloudflare (default)
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url   = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res   = await axios.post(url,
    { prompt, num_steps: 8, width: 1080, height: 1920 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return Buffer.from(res.data.result.image, 'base64');
}

async function fetchImage(prompt, retries = 4) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchImageOnce(prompt);
    } catch (err) {
      const status = err.response?.status;
      const isRetryable = status === 429 || status === 503 || status === 500 || !status;
      if (!isRetryable || attempt === retries - 1) throw err;
      const delay = Math.min(8000, 2000 * Math.pow(2, attempt));
      console.warn(`[doc] Image fetch attempt ${attempt + 1} failed (${status ?? err.code}) — retrying in ${delay / 1000}s`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

function escapeText(s) {
  // Unquoted-mode escaping: backslash-escape chars that are special to FFmpeg's
  // filter option parser. No outer '...' wrapping — that causes premature close
  // when text contains an apostrophe followed by \' (FFmpeg 4.x behaviour).
  return (s || '')
    .replace(/\\/g, '\\\\') // backslash must come first
    .replace(/'/g, "\\'")   // ASCII apostrophe (U+0027)
    .replace(/:/g, '\\:');  // colon
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateDocumentary(doc) {
  const { country, title, scenes, cta } = doc;
  const musicFile = doc.musicFile ?? join(MUSIC_DIR, 'documentary_cinematic.mp3');
  const logoPath  = join(LOGOS_DIR, LOGO_FILES[country] || LOGO_FILES.IT);
  const slug      = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const workDir   = `/tmp/documentary/${slug}`;
  const outPath   = join(OUTPUT_DIR, `${slug}.mp4`);
  const n         = scenes.length;

  mkdirSync(workDir, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // ── TTS per scene (skips if WAV already exists) ──────────────────────────────
  const wavPaths  = [];
  const durations = [];
  for (let i = 0; i < n; i++) {
    const p = join(workDir, `scene_${i}.wav`);
    if (existsSync(p)) {
      console.log(`[doc] TTS scene ${i + 1}/${n} — reusing existing WAV`);
    } else {
      console.log(`[doc] TTS scene ${i + 1}/${n}...`);
      await ttsScene(scenes[i].narration, country, p);
    }
    const d = await getAudioDuration(p);
    wavPaths.push(p);
    durations.push(d);
    console.log(`  → ${d.toFixed(1)}s`);
  }

  const voiceDur = durations.reduce((s, d) => s + d, 0);
  const totalDur = voiceDur + TAIL;
  console.log(`[doc] Total duration: ${voiceDur.toFixed(1)}s voice + ${TAIL}s tail = ${totalDur.toFixed(1)}s`);

  // ── Concatenate all scene WAVs into one voice track ───────────────────────────
  const voicePath = join(workDir, 'voice.wav');
  if (existsSync(voicePath)) {
    console.log('[doc] Concatenated audio — reusing existing voice.wav');
  } else {
    console.log('[doc] Concatenating audio...');
    await concatWavs(wavPaths, voicePath);
  }

  // ── Whisper subtitles from the full voice track ───────────────────────────────
  const srtPath = join(workDir, 'voice.srt');
  if (existsSync(srtPath)) {
    console.log('[doc] Subtitles — reusing existing voice.srt');
  } else {
    console.log('[doc] Subtitles...');
    await run('whisper', [
      voicePath,
      '--model', 'tiny',
      '--language', LANG_CODES[country] || 'it',
      '--output_dir', workDir,
      '--output_format', 'srt',
      '--word_timestamps', 'True',
    ], 'whisper');
  }
  const srtEsc = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  // ── Generate one image per scene (skips if PNG already exists) ───────────────
  const imgPaths = [];
  for (let i = 0; i < n; i++) {
    const p = join(workDir, `scene_${i}.png`);
    if (existsSync(p)) {
      console.log(`[doc] Image scene ${i + 1}/${n} — reusing existing PNG`);
    } else {
      console.log(`[doc] Image scene ${i + 1}/${n}...`);
      const raw = await fetchImage(scenes[i].imagePrompt);
      const buf = await sharp(raw)
        .resize(1080, 1920, { fit: 'cover', position: 'centre' })
        .png()
        .toBuffer();
      await writeFile(p, buf);
    }
    imgPaths.push(p);
  }

  // ── FFmpeg compose ────────────────────────────────────────────────────────────

  // Each image is looped for its scene duration; last scene gets extra TAIL seconds
  const ffInputs = [];
  for (let i = 0; i < n; i++) {
    const loopDur = i === n - 1 ? durations[i] + TAIL : durations[i];
    ffInputs.push('-loop', '1', '-t', String(loopDur), '-i', imgPaths[i]);
  }
  const voiceIdx = n;
  const logoIdx  = n + 1;
  const musicIdx = n + 2;
  ffInputs.push('-i', voicePath);
  ffInputs.push('-i', logoPath);
  ffInputs.push('-stream_loop', '-1', '-i', musicFile); // loop music for full video duration

  const fadeOutAt = Math.max(0, totalDur - 3);
  const subStyle  = 'FontName=Arial,FontSize=13,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,MarginV=80,MarginL=40,MarginR=40';

  // FFmpeg 4.x eval has no binary > / < operators — only functions gt()/lt().
  // Commas in function calls are level-2 filter-chain separators, but \, (backslash-comma)
  // in an unquoted option value is a level-1 escape → literal comma for the eval.
  const ctaEnable = `gt(t\\,${voiceDur.toFixed(2)})`;
  const ctaAlpha  = '1'; // instant pop-in; no fade needed for V1

  const cta1 = escapeText(cta.line1);
  const cta2 = escapeText(cta.line2);

  const f = [];

  // Scale each image to 1080x1920
  for (let i = 0; i < n; i++) {
    f.push(`[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[vr${i}]`);
  }

  // Hard-cut concatenation of all scene clips
  const concatInputs = Array.from({ length: n }, (_, i) => `[vr${i}]`).join('');
  f.push(`${concatInputs}concat=n=${n}:v=1:a=0[vconcat]`);

  // Burn in subtitles
  f.push(`[vconcat]subtitles='${srtEsc}':force_style='${subStyle}'[vsub]`);

  // Watermark logo (bottom-right, 100px wide)
  f.push(`[${logoIdx}:v]scale=100:-1[logo]`);
  f.push(`[vsub][logo]overlay=x=W-w-24:y=H-h-24:format=auto[vwm]`);

  // CTA text overlay — fades in when voice ends, stays until video ends
  // text= uses unquoted mode (no '...' wrapper) so apostrophes don't close the
  // parser's quote context; spaces are not special in FFmpeg unquoted mode.
  f.push(
    `[vwm]drawtext=fontfile=${FONT}:text=${cta1}:fontsize=64:fontcolor=white` +
    `:x=(w-tw)/2:y=(h/2)-60:borderw=3:bordercolor=black@0.8` +
    `:alpha=${ctaAlpha}:enable=${ctaEnable}[vc1]`
  );
  f.push(
    `[vc1]drawtext=fontfile=${FONT}:text=${cta2}:fontsize=44:fontcolor=white` +
    `:x=(w-tw)/2:y=(h/2)+20:borderw=3:bordercolor=black@0.8` +
    `:alpha=${ctaAlpha}:enable=${ctaEnable}[vout]`
  );

  // Audio: pad voice with TAIL seconds of silence, mix with music underneath
  f.push(`[${voiceIdx}:a]apad=pad_dur=${TAIL}[vpad]`);
  f.push(`[${musicIdx}:a]volume=0.12,afade=t=in:st=0:d=2,afade=t=out:st=${fadeOutAt.toFixed(2)}:d=3[music]`);
  f.push(`[vpad][music]amix=inputs=2:duration=first[aout]`);

  console.log('[doc] FFmpeg compositing...');
  await run('ffmpeg', [
    '-y',
    ...ffInputs,
    '-filter_complex', f.join(';'),
    '-map', '[vout]', '-map', '[aout]',
    '-t', String(totalDur + 0.5),
    '-r', '30',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
    '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    '-pix_fmt', 'yuv420p',
    outPath,
  ], 'ffmpeg');

  const finalDur = Math.round(await getAudioDuration(outPath));
  console.log(`[doc] Done → ${outPath} (${finalDur}s)`);

  try { rmSync(workDir, { recursive: true, force: true }); } catch {}
  return { outputPath: outPath, durationSeconds: finalDur };
}
