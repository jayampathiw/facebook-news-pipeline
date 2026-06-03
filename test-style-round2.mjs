import 'dotenv/config';
import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.resolve('output/style-tests/round2');

// ─── Cloudflare ───────────────────────────────────────────────────────────────
const CF_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const CF_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;

async function genCloudflare(prompt) {
  return genCFJsonBase64(prompt, CF_MODEL, 8);
}

// NOTE: Pollinations removed — their free tier IP queue (max 1 per IP) is
// unreliable on shared WSL NAT. Using Cloudflare's richer model catalog instead.

const PHOTO_PREFIX = 'DSLR photograph, photorealistic, tack sharp, ultra detailed, high resolution, 8K UHD, f/8 maximum clarity, high micro-contrast, crisp edges — ';

// ─── Prompts: FIXED versions of the 5 weak Round 1 images ────────────────────
// Fix 1: removed "New York Times" style anchor (caused text to leak)
// Fix 2: removed literal text content from interface descriptions
// Fix 3: added "lower 60% / upper 40%" composition rule throughout

const PROMPTS = [
  {
    name: '1-meloni-styleB-editorial',
    prompt: `Sophisticated editorial illustration in painterly high-end political op-ed style, Italian female prime minister with shoulder-length blonde hair and dark blazer standing at an official podium during a victory speech, hand raised in gesture, expressive face mid-speech, loose textured brushwork with visible canvas grain, restrained palette of burnt sienna, deep navy, cream, and muted gold, abstract suggested crowd as warm colour blocks below, simplified classical Italian architecture in background, soft afternoon light, subject in lower 60% of frame, upper 40% reserved as warm cream gradient negative space for headline overlay, high-end editorial illustration, painterly op-ed art.`,
  },
  {
    name: '2-meloni-styleC-3d',
    prompt: `3D rendered editorial illustration with soft realism, Italian female prime minister with shoulder-length blonde hair and dark blazer at podium giving victory speech, slightly stylised character design polished but not cartoonish, soft subsurface skin shading, hand raised mid-gesture, low-poly crowd of supporters in blurred background, cinematic lighting with warm rim light from upper right, modern Italian civic architecture, glossy podium surface, depth of field, subject in lower 60% of frame, upper 40% reserved as clean atmospheric sky gradient for headline overlay, polished 3D editorial style.`,
  },
  {
    name: '4-macron-styleC-3d',
    prompt: `3D rendered editorial illustration with semi-stylised soft realism, French president in navy suit at official podium, slightly stylised character design, soft subsurface skin shading, hand mid-gesture, serious focused expression, blurred journalists with cameras in foreground, suggested official palace interior with simplified moulded walls, cinematic warm key light and cool ambient fill, polished podium with glossy microphones, depth of field, subject in lower 60% of frame, upper 40% reserved as clean gradient negative space for headline overlay, polished 3D editorial style.`,
  },
  {
    name: '7-meta-hack-styleB-editorial',
    prompt: `Painterly editorial illustration in high-end tech-section style, large modern smartphone in three-quarter view held by a stylised faceless hand, screen shows a stylised AI chat interface with two message bubbles — query above, response below — and a glimpse of a colourful gradient social media profile interface, loose textured brushwork, restrained palette of midnight blue, electric coral, soft pink, and warm cream, abstract digital glitch motifs and subtle padlock symbol floating in background, dramatic angled composition, subject in lower 60% of frame, upper 40% reserved as deep navy gradient negative space for headline overlay, painterly editorial illustration style.`,
  },
  {
    name: '8-meta-hack-styleC-3d',
    prompt: `3D rendered editorial illustration with polished modern aesthetic, large sleek smartphone floating in three-quarter view at dramatic angle, screen displays a clean AI chat interface with two rounded message bubbles and a colourful gradient social media feed interface below, glossy glass surface with realistic reflections, soft subsurface glow from screen, abstract floating padlock symbol with broken chain, cinematic studio lighting with cool blue key light and warm coral accent, deep navy background with subtle particle effects, phone in lower 60% of frame, upper 40% reserved as deep navy gradient for headline overlay, polished 3D editorial style.`,
  },
];

// ─── Cloudflare multi-model helpers ──────────────────────────────────────────

// Flux 1 Schnell: JSON body, returns { result: { image: base64 } }
async function genCFJsonBase64(prompt, model, steps = 8) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await axios.post(url,
    { prompt, num_steps: steps, width: 1080, height: 1920 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 120000 }
  );
  return Buffer.from(res.data.result.image, 'base64');
}

// Flux 2 Dev / Klein: multipart/form-data body, returns { result: { image: base64 } }
async function genCFMultipart(prompt, model, steps = 20) {
  const { default: FormData } = await import('form-data');
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('num_steps', String(steps));
  form.append('width', '1080');
  form.append('height', '1920');
  const res = await axios.post(url, form, {
    headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, ...form.getHeaders() },
    timeout: 120000,
  });
  // Some models return binary directly, others return base64 JSON
  if (res.data?.result?.image) return Buffer.from(res.data.result.image, 'base64');
  return Buffer.from(res.data);
}

// SDXL Lightning: JSON body, returns raw binary image
async function genCFSdxl(prompt, model) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await axios.post(url,
    { prompt, width: 1024, height: 1024 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, responseType: 'arraybuffer', timeout: 120000 }
  );
  return Buffer.from(res.data);
}

// ─── Models to test ───────────────────────────────────────────────────────────
// Pollinations flux-pro is currently blocked (IP queue limit on shared WSL NAT).
// Replacing with Cloudflare's higher-quality models which work reliably.

const MODELS = [
  {
    key: 'cf-flux2-dev-editorial',
    label: 'CF Flux 2 Dev — editorial style (best CF quality)',
    fn: (prompt) => genCFMultipart(prompt, '@cf/black-forest-labs/flux-2-dev', 28),
  },
  {
    key: 'cf-flux2-klein9b-editorial',
    label: 'CF Flux 2 Klein 9B — editorial style',
    fn: (prompt) => genCFMultipart(prompt, '@cf/black-forest-labs/flux-2-klein-9b', 20),
  },
  {
    key: 'cf-sdxl-lightning-editorial',
    label: 'CF SDXL Lightning — editorial style (square, 1024×1024)',
    fn: (prompt) => genCFSdxl(prompt, '@cf/bytedance/stable-diffusion-xl-lightning'),
  },
  {
    key: 'cf-flux2-dev-photoreal',
    label: 'CF Flux 2 Dev — ultrarealistic photoreal (production baseline equivalent)',
    fn: (prompt) => genCFMultipart(`${PHOTO_PREFIX}${prompt}`, '@cf/black-forest-labs/flux-2-dev', 28),
  },
  {
    key: 'cf-schnell-editorial',
    label: 'CF Flux 1 Schnell — editorial style (Round 1 baseline)',
    fn: (prompt) => genCloudflare(prompt),
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
await fs.mkdir(OUT_DIR, { recursive: true });

console.log(`\nRound 2 Multi-Model Test`);
console.log(`Output: ${OUT_DIR}\n`);
console.log(`Testing ${PROMPTS.length} images × ${MODELS.length} models = ${PROMPTS.length * MODELS.length} renders\n`);

for (const { name, prompt } of PROMPTS) {
  console.log(`\n── ${name} ──`);
  for (const { key, label, fn } of MODELS) {
    const filename = `${name}--${key}.png`;
    const outPath = path.join(OUT_DIR, filename);

    // Skip if already generated (allows partial re-runs)
    try {
      await fs.access(outPath);
      console.log(`  ⏭  Already exists: ${filename}`);
      continue;
    } catch { /* not found — generate */ }

    process.stdout.write(`  Generating [${label}]... `);
    try {
      const buf = await fn(prompt);
      await fs.writeFile(outPath, buf);
      console.log(`✓`);
    } catch (err) {
      const detail = err.response?.status
        ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)?.slice(0, 120)}`
        : err.message;
      console.log(`✗ ${detail}`);
    }
  }
}

console.log('\n\nDone. Images in', OUT_DIR);
console.log('Naming pattern: <image-name>--<model-key>.png');
console.log('\nModel keys:');
for (const { key, label } of MODELS) {
  console.log(`  ${key.padEnd(30)} ${label}`);
}
