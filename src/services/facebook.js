import { readFile } from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';

const FB_BASE = 'https://graph.facebook.com/v22.0';

// Countries where boost_eligible=false articles must not be promoted (D3a decision, IT-first)
export const BOOST_ELIGIBLE_ENFORCED = { IT: true, FR: false };

// Posting time slots per country (local CEST time, ±15 min window).
// Per-day structure derived from May 1-27 2026 Meta Insights analysis of both pages.
// Full rationale: docs/research/posting-time-analysis.md
//
// Data-backed signals that shaped this config:
//   - Sunday is the #1 day for BOTH pages (IT avg 26.5 imp, FR avg 19.7 imp)
//   - 22:00 is the #1 evening hour for both (FR avg 20.8, IT avg 20.6)
//   - IT 11:00 is the #1 single hour (Sunday 11:30 was the top IT post at 90 imp)
//   - FR is over-posting at 5.3/day; weak days (Mon, Fri) cut to 2 slots
//   - 19:30 is statistically weak — shifted to 22:00 across the board
export const SLOTS_BY_DAY = {
  IT: {
    monday:    ['07:30', '13:00', '22:00'],  // standard cadence
    tuesday:   ['07:30', '13:00', '22:00'],
    wednesday: ['07:30', '13:00', '22:00'],  // weakest day in data (avg 10.8) but maintain rhythm
    thursday:  ['07:30', '13:00', '22:00'],
    friday:    ['07:30', '13:00', '22:00'],
    saturday:  ['09:00',          '22:00'],  // 2 slots — weekend midday data is thin
    sunday:    ['11:00', '13:00', '22:00'],  // 11:00 = data-winning hour (top post: Sun 11:30, 90 imp)
  },
  FR: {
    monday:    ['07:30',          '22:00'],  // 2 slots — Mon is weakest (avg 6.7)
    tuesday:   ['07:30', '13:00', '22:00'],
    wednesday: ['07:30', '13:00', '22:00'],
    thursday:  ['07:30', '13:00', '22:00'],  // Thu 07:30 produced a 49-imp top-5 post
    friday:    ['07:30',          '22:00'],  // 2 slots — Fri weak (avg 8.8)
    saturday:  ['09:00',          '22:00'],  // Sat is 2nd best FR day; evening 22:00 dominant
    sunday:    ['09:30',          '22:00'],  // Sun 22:00 = 49 imp single cell (FR's killer slot)
  },
};

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Returns the slot list for a country on a given date (defaults to today).
// Uses Europe/Paris time zone for day-of-week calculation since both pages
// publish in CET/CEST.
export function getSlotsForDate(country, date = new Date()) {
  const parisDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const dayName = DAY_NAMES[parisDate.getDay()];
  return SLOTS_BY_DAY[country]?.[dayName] ?? [];
}

// Backward-compat exports — representative slot lists for callers that need
// a single weekday/weekend slot set (e.g., publish_score computation which
// just needs ANY slot list to compute timing bonuses).
// New code should prefer getSlotsForDate(country) instead.
export const SLOTS = {
  IT: SLOTS_BY_DAY.IT.tuesday,
  FR: SLOTS_BY_DAY.FR.tuesday,
};

export const SLOTS_WEEKEND = {
  IT: SLOTS_BY_DAY.IT.sunday,
  FR: SLOTS_BY_DAY.FR.sunday,
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

// Posts multiple images as a single Facebook multi-photo post.
// imageUrls: array of public URLs already stored in Supabase Storage.
// Each image is first registered as an unpublished photo, then all are
// attached to a single feed post in one call.
export async function postMultiPhotoToFacebook(imageUrls, captionObj, country) {
  const pageId = process.env[`FB_PAGE_ID_${country}`];
  const token  = process.env[`FB_ACCESS_TOKEN_${country}`];
  if (!pageId || !token) throw new Error(`Missing Facebook credentials for country: ${country}`);

  const { intro, question, cta } = captionObj;
  const message = [intro, question, cta].filter(Boolean).join('\n\n');

  const photoIds = [];
  for (const url of imageUrls) {
    const res = await axios.post(`${FB_BASE}/${pageId}/photos`, null, {
      params: { url, published: false, access_token: token },
    });
    photoIds.push(res.data.id);
  }

  const feedRes = await axios.post(`${FB_BASE}/${pageId}/feed`, {
    message,
    attached_media: photoIds.map(id => ({ media_fbid: id })),
    access_token: token,
  });

  return feedRes.data.id;
}

export async function deletePost(postId, country) {
  const token = process.env[`FB_ACCESS_TOKEN_${country}`];
  if (!token) throw new Error(`Missing Facebook token for country: ${country}`);

  await axios.delete(`${FB_BASE}/${postId}`, {
    params: { access_token: token },
  });
}
