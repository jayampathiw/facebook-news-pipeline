# Facebook News Pipeline — Full Implementation Plan

## Context

Automated multi-country Facebook news curation pipeline for lifestyle/news pages. Fetches from RSS feeds and NewsAPI, uses Claude to generate localized captions + image prompts, stores in Supabase, and exposes an Angular review dashboard before posting to Facebook.

- Facebook page live: [facebook.com/FranceAujourdhui](https://www.facebook.com/FranceAujourdhui)
- Repo: `/home/jayam/projects/personal/facebook-news-pipeline` (blank slate — only README.md)
- Countries: FR + IT active, expanding to 4-6 total (AU, SE, etc.)
- Language: Node.js ESM modules throughout

---

## Critical Fixes vs. the Original Plan

| Issue | Original Plan | Correct Approach |
|---|---|---|
| Claude model | `claude-sonnet-4-6` | `claude-haiku-4-5-20251001` (70% cheaper, faster) |
| Prompt caching | Not implemented | `cache_control: { type: 'ephemeral' }` on system prompt |
| FB Graph API | v19.0 (deprecated May 2026) | **v22.0** (stable, current) |
| FB credentials | Single set of env vars | Per-country: `FB_PAGE_ID_FR`, `FB_PAGE_ID_IT`, etc. |
| Caption storage | `text` (stringified JSON) | `jsonb` column in Supabase |
| Deduplication | URL uniqueness only | Title-similarity check + URL uniqueness |
| GitHub Actions | No schedule consideration | Public repo = unlimited minutes |
| Image prompts | Raw prompt stored | Production-ready prompt with Anton font + gradient + watermark baked in |

---

## Architecture

```
[RSS Sources]  ──┐
[NewsAPI]      ──┤──→ rss.js / newsapi.js
                 │
                 ↓
          [dedup.js]         ← title similarity filter
                 │
                 ↓
       [pipeline.js]         ← per-country orchestrator
          │         │
          ↓         ↓
    [claude.js]  [supabase.js]
    Haiku 4.5     save articles + status
    + caching     image_prompt (raw)
    captions      formatted_image_prompt (production)
                    │
                    ↓
            [Supabase DB]
                    │
          ┌─────────┴──────────┐
          ↓                    ↓
   [Angular Dashboard]   [GitHub Actions]
   review queue            cron every 30min
   caption editor          workflow_dispatch
   image prompt copy-box
   Claude AI sidebar       ← embedded assistant
          │
          ↓
   [facebook.js v22.0]
   per-country credentials
          │
          ↓
   [Claude Code Skills]
   /fetch-news  /review-articles
```

---

## Database Schema

Run in Supabase SQL Editor once:

```sql
create table articles (
  id                    uuid primary key default gen_random_uuid(),
  country               text not null,
  source                text not null,
  title                 text not null,
  original_url          text not null unique,
  published_at          timestamptz,
  summary               text,
  ai_caption            jsonb,     -- { intro, question, cta }
  image_prompt          text,      -- raw base prompt from Claude
  formatted_image_prompt text,     -- production-ready with Anton/gradient/watermark
  post_image            text,      -- URL after manual upload
  priority_score        int default 5,
  status                text default 'pending',
  fb_post_id            text,
  posted_at             timestamptz,
  created_at            timestamptz default now()
);

-- status: pending | ready | approved | rejected | posted | failed

create index idx_articles_status  on articles(status);
create index idx_articles_country on articles(country);
create index idx_articles_created on articles(created_at desc);

create or replace function delete_old_articles()
returns void language sql as $$
  delete from articles
  where created_at < now() - interval '7 days'
  and status in ('pending', 'rejected');
$$;
```

---

## File Structure

```
facebook-news-pipeline/
├── src/
│   ├── config/
│   │   └── sources.js              ← country config (RSS, NewsAPI, language, watermark)
│   ├── fetchers/
│   │   ├── rss.js                  ← RSS parser
│   │   └── newsapi.js              ← NewsAPI fetcher
│   ├── services/
│   │   ├── supabase.js             ← DB client + CRUD
│   │   ├── claude.js               ← Haiku + prompt caching + formatImagePrompt()
│   │   └── facebook.js             ← Graph API v22.0, multi-page
│   ├── utils/
│   │   └── dedup.js                ← title similarity filter
│   └── pipeline.js                 ← main orchestrator
├── dashboard/                      ← Angular app (Phase 6)
│   ├── src/app/
│   │   ├── pages/
│   │   │   ├── review/
│   │   │   ├── approved/
│   │   │   ├── posted/
│   │   │   └── settings/
│   │   ├── components/
│   │   │   ├── article-card/
│   │   │   ├── caption-editor/
│   │   │   ├── image-prompt-panel/  ← copy-to-clipboard formatted prompt
│   │   │   └── country-filter/
│   │   └── services/
│   │       ├── supabase.service.ts
│   │       └── claude.service.ts    ← dashboard AI assistant
├── .claude/
│   └── commands/
│       ├── fetch-news.md            ← /fetch-news skill
│       └── review-articles.md       ← /review-articles skill
├── .github/
│   └── workflows/
│       └── fetch.yml
├── CLAUDE.md                        ← project instructions for Claude Code
├── .env.example
├── .gitignore
└── package.json
```

---

## Key Implementation Details

### `src/config/sources.js`

Each country block:
- `rss[]` — verified RSS URLs
- `newsapi` — `{ query, language }`
- `captionLanguage` — passed to Claude ("français", "italiano", "English")
- `fbPageEnvKey` — env var suffix (FR → `FB_PAGE_ID_FR`)
- `pageName` — Facebook page display name
- `watermarkFile` — logo filename for the image prompt template

```javascript
export const SOURCES = {
  FR: {
    rss: [
      { name: 'Le Monde',    url: 'https://www.lemonde.fr/rss/une.xml' },
      { name: 'Le Figaro',   url: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
      { name: 'France Info', url: 'https://www.francetvinfo.fr/titres.rss' },
      { name: 'France 24',   url: 'https://www.france24.com/fr/rss' },
      { name: 'RFI',         url: 'https://www.rfi.fr/fr/rss-fr.xml' },
      { name: 'Libération',  url: 'https://www.liberation.fr/rss/' },
      { name: 'Marianne',    url: 'https://www.marianne.net/rss.xml' },
    ],
    newsapi: { query: 'France politique actualité', language: 'fr' },
    captionLanguage: 'français',
    fbPageEnvKey: 'FR',
    pageName: "France Aujourd'hui",
    watermarkFile: 'FranceAujourdhui_Logo_v2.png',
  },
  IT: {
    rss: [
      { name: 'ANSA',        url: 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml' },
      { name: 'Corriere',    url: 'https://xml2.corriereobjects.it/rss/homepage.xml' },
      { name: 'Repubblica',  url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml' },
      { name: 'La Stampa',   url: 'https://www.lastampa.it/rss/copertina.xml' },
      { name: 'Il Post',     url: 'https://www.ilpost.it/feed/' },
    ],
    newsapi: { query: 'Italia politica attualità', language: 'it' },
    captionLanguage: 'italiano',
    fbPageEnvKey: 'IT',
    pageName: 'Italia Oggi',
    watermarkFile: 'ItaliaOggi_Logo.png',
  },
};
// Add AU, SE etc. here — pipeline auto-picks up all keys
```

### `src/services/claude.js` — Key patterns

**Caption generation with Haiku + prompt caching:**
```javascript
const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 400,
  system: [{
    type: 'text',
    text: LONG_SYSTEM_PROMPT,           // > 2048 tokens for cache eligibility
    cache_control: { type: 'ephemeral' } // 10% cost on cache hits
  }],
  messages: [{ role: 'user', content: articleContent }]
});
```

**`formatImagePrompt(basePrompt, overlayText, watermarkFile)` — pure utility, no API call:**

Produces the standard production template the user pastes into Midjourney/DALL-E:
```
[ORIGINAL PROMPT]
{basePrompt}

[TEXT OVERLAY]
Content: "{overlayText}"
Position: upper
Opacity: 80%

[OUTPUT]
No flags, no people visible.
Add a subtle gradient overlay beneath the text for legibility.
Overlay the text above in large white Anton font at the upper position,
semi-transparent at 80% opacity, integrated with {lighting context}.
Add {watermarkFile} watermark, bottom-right, small, 70% opacity.
```

The lighting context is extracted via regex from the base prompt (matches "golden hour", "fluorescent lighting", "fire glow", etc.); falls back to "the lighting of the scene".

### `src/services/facebook.js`

```javascript
const FB_BASE = 'https://graph.facebook.com/v22.0'; // NOT v19.0

export async function postToFacebook(article, captionObj, country) {
  const pageId = process.env[`FB_PAGE_ID_${country}`];
  const token  = process.env[`FB_ACCESS_TOKEN_${country}`];
  // POST to /{pageId}/feed with message + link + access_token
}
```

---

## Environment Variables

`.env` (never commit) / `.env.example` (commit):

```bash
SUPABASE_URL=
SUPABASE_KEY=
NEWSAPI_KEY=
ANTHROPIC_KEY=

FB_PAGE_ID_FR=
FB_ACCESS_TOKEN_FR=
FB_PAGE_ID_IT=
FB_ACCESS_TOKEN_IT=

# Add per country as you expand:
# FB_PAGE_ID_AU=
# FB_ACCESS_TOKEN_AU=
```

---

## GitHub Actions

```yaml
# .github/workflows/fetch.yml
name: Fetch News Pipeline
on:
  schedule:
    - cron: '*/30 * * * *'   # every 30 min
  workflow_dispatch:           # manual trigger from GitHub UI
jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: node src/pipeline.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          NEWSAPI_KEY:  ${{ secrets.NEWSAPI_KEY }}
          ANTHROPIC_KEY: ${{ secrets.ANTHROPIC_KEY }}
          FB_PAGE_ID_FR: ${{ secrets.FB_PAGE_ID_FR }}
          FB_ACCESS_TOKEN_FR: ${{ secrets.FB_ACCESS_TOKEN_FR }}
          FB_PAGE_ID_IT: ${{ secrets.FB_PAGE_ID_IT }}
          FB_ACCESS_TOKEN_IT: ${{ secrets.FB_ACCESS_TOKEN_IT }}
```

Public repo = unlimited GitHub Actions minutes.

---

## Claude Code Skills

**`.claude/commands/fetch-news.md`**
```
Trigger the news pipeline manually.
Run: node src/pipeline.js
Then report: articles fetched and saved per country, any errors.
```

**`.claude/commands/review-articles.md`**
```
Query Supabase for articles where status='pending', ordered by priority_score desc.
For each article display: country, title, source, priority_score, ai_caption.
Ask which to approve (status → 'approved') or reject (status → 'rejected').
Update Supabase accordingly.
```

---

## Cost Estimate

| Item | Cost |
|---|---|
| Supabase free tier | $0 |
| GitHub Actions (public repo) | $0 |
| NewsAPI developer plan | $0 |
| Claude Haiku + prompt caching — caption + image generation | ~$0.50–1/month |
| Claude Haiku — dashboard AI assistant (interactive use) | ~$1–2/month |
| **Total** | **~$2–3/month** |

---

## Expansion to 4-6 Countries

To add any new country:
1. Add one block to `src/config/sources.js`
2. Add `FB_PAGE_ID_XX` and `FB_ACCESS_TOKEN_XX` to `.env` and GitHub Secrets
3. No other code changes — pipeline iterates all keys in `SOURCES`

---

## Verification Checklist (Week 8)

```
□ node src/pipeline.js — runs locally without errors
□ Articles appear in Supabase with correct country tag
□ ai_caption is valid JSON in Supabase jsonb column
□ image_prompt (raw) and formatted_image_prompt (with overlay template) both populated
□ Paste a formatted_image_prompt into Midjourney — confirm Anton text + watermark position
□ GitHub Actions workflow_dispatch runs successfully
□ GitHub Actions cron triggers on schedule
□ Dashboard shows pending articles with captions and image prompt copy-box
□ Edit caption → saves to Supabase
□ Approve article → status = 'approved'
□ Test Facebook post via API with a real article
□ Delete test post from Facebook
□ Both FR and IT pipelines run correctly
```

---

## Task List

### Phase 1 — Project Foundation

- [ ] `npm init` with `"type": "module"`, create `package.json`
- [ ] `npm install @anthropic-ai/sdk @supabase/supabase-js axios dotenv rss-parser`
- [ ] Create `.gitignore` (`node_modules/`, `.env`, `dist/`)
- [ ] Create `.env.example` with all required keys
- [ ] Create `.env` with real values (do not commit)
- [ ] Create Supabase project at supabase.com → save URL + anon key
- [ ] Run the SQL schema in Supabase SQL Editor
- [ ] Verify table `articles` created with all columns including `formatted_image_prompt`

### Phase 2 — Sources & Fetchers

- [ ] Create `src/config/sources.js` with FR and IT blocks (including `watermarkFile`)
- [ ] Create `src/fetchers/rss.js` — parse top 5 per source, graceful error handling
- [ ] Test RSS fetcher locally: `node -e "import('./src/fetchers/rss.js')..."`
- [ ] Create `src/fetchers/newsapi.js` — axios call with query/language params
- [ ] Test NewsAPI fetcher locally with FR config
- [ ] Create `src/utils/dedup.js` — title similarity filter (>70% word overlap = duplicate)

### Phase 3 — AI Services

- [ ] Create `src/services/supabase.js` — `saveArticles()`, `getPendingArticles()`, `updateArticle()`
- [ ] Create `src/services/claude.js`:
  - [ ] `generateCaption(article, captionLanguage, pageName)` — Haiku + prompt caching
  - [ ] `generateImagePrompt(article)` — raw base prompt
  - [ ] `formatImagePrompt(basePrompt, overlayText, watermarkFile)` — pure utility, no API call
- [ ] Test caption generation locally with one French article
- [ ] Test `formatImagePrompt()` output — verify Anton/gradient/watermark lines are present

### Phase 4 — Pipeline Orchestrator

- [ ] Create `src/pipeline.js`:
  - [ ] Loop over `Object.entries(SOURCES)`
  - [ ] Per country: fetch RSS + NewsAPI in parallel
  - [ ] Deduplicate via `dedup.js`
  - [ ] Save raw articles to Supabase
  - [ ] Generate `ai_caption`, `image_prompt`, `formatted_image_prompt` per article sequentially
  - [ ] Update articles in Supabase with AI fields
  - [ ] Error handling: article fails → log and continue, never crash pipeline
- [ ] Run `node src/pipeline.js` — verify FR and IT articles appear in Supabase
- [ ] Check `formatted_image_prompt` column is populated correctly

### Phase 5 — Automation

- [ ] Create `.github/workflows/fetch.yml` (every 30 min + workflow_dispatch)
- [ ] Push repo to GitHub (public)
- [ ] Add all GitHub Secrets (SUPABASE_URL, SUPABASE_KEY, NEWSAPI_KEY, ANTHROPIC_KEY, FB_PAGE_ID_FR, FB_ACCESS_TOKEN_FR, FB_PAGE_ID_IT, FB_ACCESS_TOKEN_IT)
- [ ] Trigger workflow manually from GitHub Actions UI
- [ ] Confirm pipeline runs successfully in CI logs
- [ ] Wait for cron trigger — confirm it fires on schedule

### Phase 6 — Claude Code Skills

- [ ] Create `.claude/commands/fetch-news.md`
- [ ] Create `.claude/commands/review-articles.md`
- [ ] Test `/fetch-news` skill in Claude Code CLI
- [ ] Test `/review-articles` skill — approve/reject an article

### Phase 7 — Angular Dashboard

- [ ] `ng new dashboard --routing --style=scss` inside project root
- [ ] `ng add @angular/material`
- [ ] `npm install @supabase/supabase-js @anthropic-ai/sdk`
- [ ] Create `supabase.service.ts` — query articles, update status
- [ ] Create `claude.service.ts` — Haiku calls for dashboard AI assistant
- [ ] Build `/review` page with article cards
- [ ] Build `caption-editor` component — inline edit + AI regenerate button
- [ ] Build `image-prompt-panel` component — read-only text box with one-click copy-to-clipboard
- [ ] Build `country-filter` component — FR / IT switcher
- [ ] Build Claude AI sidebar panel — chat interface for caption help and policy checks
- [ ] Build `/approved`, `/posted`, `/settings` pages
- [ ] Run dashboard locally and test full review flow

### Phase 8 — Facebook Integration

- [ ] Create `src/services/facebook.js` with Graph API v22.0
- [ ] Per-country credential lookup: `process.env[FB_PAGE_ID_${country}]`
- [ ] Add "Post to Facebook" button in dashboard → calls API → updates `status` to `posted`, stores `fb_post_id`
- [ ] Test with a real article: post → verify on Facebook page → delete test post

### Phase 9 — Testing & Launch

- [ ] Run full end-to-end: pipeline → dashboard review → Facebook post
- [ ] Add `process.on('unhandledRejection')` handler in pipeline.js so GitHub Actions marks failed runs
- [ ] Verify GitHub sends failure email when pipeline errors
- [ ] Add IT as second active country — verify both pipelines work
- [ ] Document any RSS feeds that returned 404 and update sources.js

---

## Expanding to a New Country (Template)

```javascript
// In src/config/sources.js, add:
XX: {
  rss: [
    { name: 'Source Name', url: 'https://...' },
  ],
  newsapi: { query: '...', language: 'xx' },
  captionLanguage: '...',
  fbPageEnvKey: 'XX',
  pageName: '...',
  watermarkFile: 'XX_Logo.png',
},
```

Then add to `.env` and GitHub Secrets:
```
FB_PAGE_ID_XX=
FB_ACCESS_TOKEN_XX=
```

No other changes needed.
