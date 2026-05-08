# Facebook News Pipeline — Project Guide

## What This Is

Automated multi-country Facebook news curation pipeline. Fetches articles from RSS feeds and NewsAPI, uses Claude AI to generate localized captions, SEO content, and image prompts, stores everything in Supabase, and exposes an Angular dashboard for review before posting to Facebook.

**Active Facebook pages:**
- France: [facebook.com/FranceAujourdhui](https://www.facebook.com/FranceAujourdhui)
- Italy: (page to be created)

**Target countries:** FR, IT (active), expanding to AU, SE, and more.

**Live dashboard:** https://dashboard-alpha-one-47.vercel.app

---

## Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 20, ESM modules (`"type": "module"`) |
| AI | Anthropic Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) |
| Database | Supabase (free tier, project ref: `nnxtvbolhuvihlpwppbj`) |
| Automation | GitHub Actions (public repo — unlimited minutes) |
| Dashboard | Angular 17+ with Angular Material, deployed on Vercel |
| Edge Function | Supabase Deno edge function (`generate-caption`) |
| Facebook API | Graph API **v22.0** (not v19 — deprecated) |
| Package manager | npm |

---

## Project Structure

```
src/
├── config/sources.js                ← add new countries here
├── fetchers/rss.js                  ← RSS feed parser
├── fetchers/newsapi.js              ← NewsAPI fetcher
├── services/supabase.js             ← DB client, CRUD helpers
├── services/claude.js               ← caption + SEO + image prompt generation
├── services/facebook.js             ← post to Facebook, per-country credentials
├── utils/dedup.js                   ← title similarity deduplication
├── utils/criticality.js             ← keyword-based criticality scorer
├── validators/contentValidator.js   ← multi-language content policy
├── scripts/
│   ├── generate-caption.js          ← CLI: generate all fields for 1+ article IDs
│   ├── generate-captions-batch.js   ← batch: all pending without captions
│   ├── generate-image.js            ← image-only regeneration for 1+ IDs
│   └── save-article-content.js      ← DB writer (used by Claude Code skills)
└── pipeline.js                      ← main orchestrator

dashboard/                           ← Angular app (deployed to Vercel)
supabase/
├── functions/generate-caption/      ← Deno edge function (deployed)
└── migrations/001_add_seo_fields.sql
.claude/commands/                    ← Claude Code CLI skills
.github/workflows/fetch.yml          ← cron automation (every 30 min)
```

---

## Running the Pipeline

```bash
# Install dependencies (first time)
npm install

# Run the pipeline locally (requires .env)
node src/pipeline.js

# Generate AI content for specific articles (by ID)
node src/scripts/generate-caption.js <id1> <id2> ...

# Batch generate for all pending articles without captions
node src/scripts/generate-captions-batch.js [--country FR|IT]

# Regenerate image prompt only
node src/scripts/generate-image.js <id1> <id2> ...

# Or use Claude Code skills (see below)
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values. Never commit `.env`.

```bash
SUPABASE_URL=
SUPABASE_KEY=
NEWSAPI_KEY=
ANTHROPIC_KEY=

# Per-country Facebook Page credentials
FB_PAGE_ID_FR=
FB_ACCESS_TOKEN_FR=
FB_PAGE_ID_IT=
FB_ACCESS_TOKEN_IT=
```

For GitHub Actions, all these are stored as repository Secrets (Settings → Secrets and variables → Actions).

For the Supabase edge function, `ANTHROPIC_KEY` is stored as a Supabase secret (already set on project `nnxtvbolhuvihlpwppbj`).

---

## Angular Dashboard

**URL:** https://dashboard-alpha-one-47.vercel.app

**Auth:** Supabase email/password login (protected by `auth.guard.ts`).

**Features:**
- Article list with filtering by status (pending/approved/rejected/posted/failed) and country
- Sort by any column header (Level sorts by numeric criticality priority)
- Stats cards (Breaking / Alert / Trending / Standard counts) — clickable to filter
- Row actions: **Generate** (calls edge function to create AI content), **Delete**
- Article detail dialog with four tabs: Overview, Caption, SEO, Image Prompt
  - Overview tab shows article ID with one-click copy
  - Caption tab shows intro / question / CTA
  - SEO tab shows seo_title and seo_description
  - Image Prompt tab shows formatted_image_prompt ready to paste into Midjourney/DALL-E
- Approve / Reject buttons in the dialog
- Batch operations: select multiple rows → batch approve, reject, or delete

**Deploy:** `cd dashboard && vercel --prod`

---

## Key Design Decisions

### Claude model: Haiku 4.5, not Sonnet

Use `claude-haiku-4-5-20251001` for all caption and image prompt generation. It's 70% cheaper and fast enough for this use case. Only use Sonnet if a task genuinely requires stronger reasoning.

### Prompt caching

`CONTENT_SYSTEM_PROMPT` in `claude.js` uses `cache_control: { type: 'ephemeral' }`. After the first request in a 5-minute window, subsequent calls pay only 10% of input token cost. Always keep the system prompt long enough (>2048 tokens) to qualify for caching. Both `generateCaption()` and `generateSEOContent()` reference this same constant so they share one cache entry.

### Combined CONTENT_SYSTEM_PROMPT

The system prompt covers two roles: Facebook caption writer and SEO specialist. The same prompt block is used for caption generation and SEO title/description generation so both share the Anthropic prompt cache. The Deno edge function (`supabase/functions/generate-caption/index.ts`) duplicates this prompt verbatim because it cannot import Node.js modules.

### Facebook Graph API: v22.0

The pipeline uses `https://graph.facebook.com/v22.0`. Do not change this to v19 or any older version — v19 was deprecated in May 2026.

### Per-country Facebook credentials

Each Facebook page has its own Page ID and access token. These are stored as `FB_PAGE_ID_FR`, `FB_ACCESS_TOKEN_FR`, `FB_PAGE_ID_IT`, etc. The country key from `sources.js` maps directly to the env var suffix.

### Image prompt formatting

The pipeline generates two fields per article:
- `image_prompt` — raw descriptive prompt from Claude
- `formatted_image_prompt` — production-ready template the user pastes into Midjourney/DALL-E

The formatted prompt always uses: **Anton font, white, 80% opacity, upper position, gradient overlay, 70% opacity watermark bottom-right**. These constants are locked and should not change.

### Public GitHub repository

Keep the repo public. This gives unlimited GitHub Actions minutes. API keys are in GitHub Secrets — they are never exposed in the repo.

### No automatic image generation

Images are generated manually. The pipeline stores the formatted prompt so the user can copy it directly from the dashboard and paste it into Midjourney or DALL-E.

---

## Adding a New Country

1. Add a block to `src/config/sources.js`:

```javascript
XX: {
  rss: [{ name: 'Source Name', url: 'https://feed.url/rss.xml' }],
  newsapi: { query: 'query string', language: 'xx' },
  captionLanguage: 'language name',
  fbPageEnvKey: 'XX',
  pageName: 'Page Display Name',
  watermarkFile: 'XX_Logo.png',
},
```

2. Add to `.env` and GitHub Secrets:
```
FB_PAGE_ID_XX=
FB_ACCESS_TOKEN_XX=
```

3. Add the country mapping to `supabase/functions/generate-caption/index.ts` (`WATERMARK_FILES`, `CAPTION_LANGUAGE`, `PAGE_NAME`).

4. No other code changes needed. The pipeline auto-iterates all keys in `SOURCES`.

---

## Claude Code Skills

Run these from the Claude Code CLI:

- `/fetch-news` — manually trigger the pipeline and see results
- `/review-articles` — review pending articles, approve or reject
- `/generate-post` — generate all AI fields for one or more articles (interactive or direct IDs)
- `/generate-image-description` — regenerate image prompt only for one or more articles

---

## Database Status Values

Articles in Supabase can have these `status` values:

| Status | Meaning |
|---|---|
| `pending` | Fetched, AI caption generated, awaiting review |
| `approved` | Reviewed and approved, ready to post |
| `rejected` | Not selected for posting |
| `posted` | Published to Facebook |
| `failed` | Posting to Facebook failed |

Articles older than 7 days with status `pending` or `rejected` are automatically deleted by the `delete_old_articles()` SQL function.

---

## DB Fields Generated per Article

| Field | Description |
|---|---|
| `ai_caption` | `{intro, question, cta, image_headline}` — Facebook post body |
| `seo_title` | ≤60 chars, keyword-first, in article's target language |
| `seo_description` | ≤160 chars, with CTA, in article's target language |
| `image_prompt` | Raw cinematic prompt from Claude |
| `formatted_image_prompt` | `[PROMPT]/[TEXT OVERLAY]/[OUTPUT]` — paste into Midjourney/DALL-E |

---

## Content Policy Rules

When reviewing articles or generating captions:

- **Never post:** content involving minors in harmful contexts, or sexual violence cases
- **Never post:** religion + law + exclusion combinations on a new page (risk of Facebook flag)
- **Organic only, never boost:** articles mentioning drugs, weapons, or substances
- **Always safe:** economic news, health news, culture, environment, elections (factual)
- **Attribution required:** always include source name in every post caption

---

## Codebase Conventions

- All source files use ESM (`import`/`export`), not CommonJS (`require`)
- No TypeScript in `src/` — plain JavaScript only
- Dashboard (`dashboard/`) uses TypeScript (Angular default)
- No comments unless explaining a non-obvious constraint
- No `console.log` in production paths — use `console.error` for errors and structured logs for pipeline output
