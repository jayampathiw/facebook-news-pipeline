# Facebook News Pipeline — Project Guide

## What This Is

Automated multi-country Facebook news curation pipeline. Fetches articles from RSS feeds and NewsAPI, uses Claude AI to generate localized captions and image prompts, stores everything in Supabase, and exposes an Angular dashboard for review before posting to Facebook.

**Active Facebook pages:**
- France: [facebook.com/FranceAujourdhui](https://www.facebook.com/FranceAujourdhui)
- Italy: (page to be created)

**Target countries:** FR, IT (active), expanding to AU, SE, and more.

---

## Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 20, ESM modules (`"type": "module"`) |
| AI | Anthropic Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) |
| Database | Supabase (free tier) |
| Automation | GitHub Actions (public repo — unlimited minutes) |
| Dashboard | Angular 17+ with Angular Material |
| Facebook API | Graph API **v22.0** (not v19 — deprecated) |
| Package manager | npm |

---

## Project Structure

```
src/
├── config/sources.js          ← add new countries here
├── fetchers/rss.js            ← RSS feed parser
├── fetchers/newsapi.js        ← NewsAPI fetcher
├── services/supabase.js       ← DB client, CRUD helpers
├── services/claude.js         ← caption generation + image prompt formatting
├── services/facebook.js       ← post to Facebook, per-country credentials
├── utils/dedup.js             ← title similarity deduplication
└── pipeline.js                ← main orchestrator

dashboard/                     ← Angular app
.claude/commands/              ← Claude Code CLI skills
.github/workflows/fetch.yml    ← cron automation
```

---

## Running the Pipeline

```bash
# Install dependencies (first time)
npm install

# Run the pipeline locally (requires .env)
node src/pipeline.js

# Or use the Claude Code skill
# /fetch-news
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

---

## Key Design Decisions

### Claude model: Haiku 4.5, not Sonnet

Use `claude-haiku-4-5-20251001` for all caption and image prompt generation. It's 70% cheaper and fast enough for this use case. Only use Sonnet if a task genuinely requires stronger reasoning.

### Prompt caching

The system prompt in `claude.js` uses `cache_control: { type: 'ephemeral' }`. This means after the first request in a 5-minute window, subsequent calls pay only 10% of input token cost. Always keep the system prompt long enough (>2048 tokens) to qualify for caching.

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

3. No other code changes needed. The pipeline auto-iterates all keys in `SOURCES`.

---

## Claude Code Skills

Run these from the Claude Code CLI:

- `/fetch-news` — manually trigger the pipeline and see results
- `/review-articles` — review pending articles, approve or reject

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
