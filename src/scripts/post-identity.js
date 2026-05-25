/**
 * Post a standalone identity post to Facebook — no article in the DB.
 * Used for: documentary videos, manual "SE AMI L'ITALIA" style static images,
 * or any hand-crafted identity content that isn't tied to a news article.
 *
 * Usage:
 *   node src/scripts/post-identity.js --country IT --video output/documentaries/l-italia-che-ha-conquistato-il-mondo.mp4
 *   node src/scripts/post-identity.js --country IT --image /path/to/image.jpg
 *   node src/scripts/post-identity.js --country FR --video output/... --caption "Si vous aimez la France..."
 *
 * If --caption is omitted the default caption for that country is used.
 * The post is NOT saved to Supabase — identity posts are standalone.
 */

import 'dotenv/config';
import { readFile, access } from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';

const FB_BASE = 'https://graph.facebook.com/v22.0';

const DEFAULT_CAPTIONS = {
  IT: `🇮🇹 L'Italia non è solo un paese. È una civiltà.

Arte, cucina, storia, sport — da secoli, l'Italia conquista il mondo.

Questo è il nostro patrimonio. Questo siamo noi.

❤️ Se ami l'Italia, condividi questo video con chi tiene all'Italia come te.

👉 Segui Italia Oggi per restare informato sull'attualità italiana — ogni giorno.

#ItaliaOggi #OrgoglioItaliano #Italia #PatrimonioItaliano`,

  FR: `🇫🇷 La France n'est pas juste un pays. C'est une civilisation.

Art, gastronomie, histoire, sport — depuis des siècles, la France a changé le monde.

C'est notre patrimoine. C'est qui nous sommes.

❤️ Si vous aimez la France, partagez cette vidéo avec ceux qui y tiennent autant que vous.

👉 Suivez France Aujourd'hui pour rester informé de l'actualité française — chaque jour.

#FranceAujourdhui #FierteFrancaise #France #PatrimoineFrancais`,
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1] ?? true;
      i++;
    }
  }
  return args;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.country) {
    console.error('Usage: node src/scripts/post-identity.js --country IT|FR --video <path> | --image <path> [--caption "..."]');
    process.exit(1);
  }

  const country = args.country.toUpperCase();
  const pageId = process.env[`FB_PAGE_ID_${country}`];
  const token = process.env[`FB_ACCESS_TOKEN_${country}`];

  if (!pageId || !token) {
    console.error(`Missing FB_PAGE_ID_${country} or FB_ACCESS_TOKEN_${country} in .env`);
    process.exit(1);
  }

  const caption = args.caption || DEFAULT_CAPTIONS[country];
  if (!caption) {
    console.error(`No caption for country ${country}. Pass --caption "..."`);
    process.exit(1);
  }

  if (args.video) {
    await postFile(args.video, 'video', caption, pageId, token, country);
  } else if (args.image) {
    await postFile(args.image, 'image', caption, pageId, token, country);
  } else {
    console.error('Must provide --video <path> or --image <path>');
    process.exit(1);
  }
}

async function postFile(filePath, type, caption, pageId, token, country) {
  try {
    await access(filePath);
  } catch {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const buffer = await readFile(filePath);
  const form = new FormData();
  form.append('access_token', token);
  form.append('caption', caption);

  if (type === 'video') {
    form.append('video_source', buffer, { filename: 'identity.mp4', contentType: 'video/mp4' });
    console.log(`[${country}] Uploading video (${(buffer.length / 1024 / 1024).toFixed(1)}MB)…`);
    const res = await axios.post(`${FB_BASE}/${pageId}/videos`, form, {
      headers: form.getHeaders(),
      timeout: 180_000,
    });
    console.log(`[${country}] Posted video: https://www.facebook.com/${res.data.id}`);
    console.log(`Post ID: ${res.data.id}`);
  } else {
    form.append('source', buffer, { filename: 'identity.jpg', contentType: 'image/jpeg' });
    console.log(`[${country}] Uploading image (${(buffer.length / 1024).toFixed(0)}KB)…`);
    const res = await axios.post(`${FB_BASE}/${pageId}/photos`, form, {
      headers: form.getHeaders(),
      timeout: 60_000,
    });
    console.log(`[${country}] Posted image: https://www.facebook.com/${res.data.id}`);
    console.log(`Post ID: ${res.data.id}`);
  }
}

run().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
