import { readFile } from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';

const FB_BASE = 'https://graph.facebook.com/v22.0';

// Countries where boost_eligible=false articles must not be promoted (D3a decision, IT-first)
export const BOOST_ELIGIBLE_ENFORCED = { IT: true, FR: false };

// Posting time slots per country (local CEST time, ±15 min window)
// Weekday: 2 slots for IT (top-performing from Meta Insights)
export const SLOTS = {
  FR: ['07:30', '12:00', '19:00'],
  IT: ['07:30', '19:30'],
};

// Weekend: extra 09:00 slot for ORGOGLIO/PATRIMONIO identity posts when audience is less time-pressured
export const SLOTS_WEEKEND = {
  FR: ['07:30', '12:00', '19:00'],
  IT: ['07:30', '09:00', '19:30'],
};

// E.1 validation window: tracks when the first IT boost_eligible=false post fires.
// Start date is logged here; the 30-day end date is computed externally.
export function logBoostEligibleWindowStart(country, articleId, postedAt) {
  if (country !== 'IT') return;
  console.log(`[E.1 WINDOW] First IT boost_eligible=false post: article=${articleId} posted_at=${postedAt}`);
  console.log(`[E.1 WINDOW] 30-day window closes: ${new Date(new Date(postedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()}`);
  console.log(`[E.1 WINDOW] If zero policy strikes by that date → flip BOOST_ELIGIBLE_ENFORCED.FR to true in src/services/facebook.js`);
}

export async function postToFacebook(article, captionObj, country) {
  const pageId = process.env[`FB_PAGE_ID_${country}`];
  const token  = process.env[`FB_ACCESS_TOKEN_${country}`];

  if (!pageId || !token) {
    throw new Error(`Missing Facebook credentials for country: ${country}`);
  }

  const { intro, question, cta } = captionObj;
  const parts = [intro, question, cta].filter(Boolean);
  const message = parts.join('\n\n');

  const response = await axios.post(`${FB_BASE}/${pageId}/feed`, {
    message,
    link: article.original_url,
    access_token: token,
  });

  return response.data.id;
}

export async function postVideoToFacebook(videoPath, captionObj, article, country) {
  const pageId = process.env[`FB_PAGE_ID_${country}`];
  const token  = process.env[`FB_ACCESS_TOKEN_${country}`];
  if (!pageId || !token) throw new Error(`Missing Facebook credentials for country: ${country}`);

  const { intro, question, cta } = captionObj;
  const caption = [intro, question, cta].filter(Boolean).join('\n\n');

  const videoBuffer = await readFile(videoPath);
  const form = new FormData();
  form.append('video_source', videoBuffer, { filename: 'reel.mp4', contentType: 'video/mp4' });
  form.append('caption', caption);
  form.append('description', article.title || '');
  form.append('access_token', token);

  const res = await axios.post(`${FB_BASE}/${pageId}/videos`, form, {
    headers: form.getHeaders(),
    timeout: 120_000,
  });

  return res.data.id;
}

export async function deletePost(postId, country) {
  const token = process.env[`FB_ACCESS_TOKEN_${country}`];
  if (!token) throw new Error(`Missing Facebook token for country: ${country}`);

  await axios.delete(`${FB_BASE}/${postId}`, {
    params: { access_token: token },
  });
}
