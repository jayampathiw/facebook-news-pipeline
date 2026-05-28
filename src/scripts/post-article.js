/**
 * Post a specific article by ID immediately, bypassing slot window check.
 * Usage: node src/scripts/post-article.js <article-id>
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import FormData from 'form-data';
import { compositeImage } from '../utils/imageComposite.js';

const FB_BASE = 'https://graph.facebook.com/v22.0';
const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || 'cloudflare';

const id = process.argv[2];
if (!id) {
  console.error('Usage: node src/scripts/post-article.js <article-id>');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
  const { data: article, error } = await supabase.from('articles').select('*').eq('id', id).single();
  if (error || !article) { console.error('Article not found:', error?.message); process.exit(1); }

  const country = article.country;
  const pageId  = process.env[`FB_PAGE_ID_${country}`];
  const token   = process.env[`FB_ACCESS_TOKEN_${country}`];
  if (!pageId || !token) { console.error(`Missing FB credentials for ${country}`); process.exit(1); }

  if (!article.ai_caption?.intro) { console.error('No caption — run generate-caption.js first'); process.exit(1); }
  if (!article.image_prompt)      { console.error('No image_prompt — run generate-caption.js first'); process.exit(1); }

  const caption = [article.ai_caption.intro, article.ai_caption.question, article.ai_caption.cta]
    .filter(Boolean).join('\n\n');

  console.log(`[${country}] Posting: ${article.title.slice(0, 70)}`);
  console.log(`[${country}] Mode: ${article.content_signals?.identity_mode ?? 'null'} | Score: ${article.publish_score?.toFixed(1)}`);

  console.log(`[${country}] Generating image via ${IMAGE_PROVIDER}…`);
  const imageBuffer = await generateImage(article.image_prompt);

  console.log(`[${country}] Compositing overlay…`);
  const finalBuffer = await compositeImage(imageBuffer, article.image_headline ?? '', country);

  console.log(`[${country}] Uploading to Facebook…`);
  const fbPostId = await uploadToFacebook(finalBuffer, caption, pageId, token);

  const postedAt = new Date().toISOString();
  await supabase.from('articles').update({ status: 'posted', fb_post_id: fbPostId, posted_at: postedAt }).eq('id', id);

  console.log(`\n✓ Posted: https://www.facebook.com/${fbPostId}`);
  console.log(`  Article ID: ${id}`);
  console.log(`  Posted at:  ${postedAt}`);
}

async function generateImage(prompt) {
  if (IMAGE_PROVIDER === 'pollinations') {
    const model = process.env.POLLINATIONS_MODEL || 'flux';
    const token = process.env.POLLINATIONS_TOKEN ? `&token=${process.env.POLLINATIONS_TOKEN}` : '';
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&model=${model}&nologo=true${token}`;
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
    return Buffer.from(res.data);
  }
  if (IMAGE_PROVIDER === 'google') {
    const model = process.env.GOOGLE_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_KEY}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 60000 });
    const imgPart = res.data.candidates[0].content.parts.find(p => p.inlineData);
    if (!imgPart) throw new Error('Google AI returned no image');
    return Buffer.from(imgPart.inlineData.data, 'base64');
  }
  // Cloudflare (default)
  const model = process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await axios.post(url,
    { prompt, num_steps: 8, width: 1080, height: 1080 },
    { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return Buffer.from(res.data.result.image, 'base64');
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

run().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
