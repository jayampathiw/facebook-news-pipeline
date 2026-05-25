# Facebook News Pipeline — Project Guide

## What This Is

Automated multi-country Facebook news curation pipeline. Fetches articles from RSS feeds and NewsAPI, uses Claude AI to generate localized captions, SEO content, and image prompts, stores everything in Supabase, and exposes an Angular dashboard for review before posting to Facebook.

**Active Facebook pages:**
- France: [facebook.com/FranceAujourdhui](https://www.facebook.com/FranceAujourdhui)
- Italy: [facebook.com/ItaliaOggi](https://www.facebook.com/ItaliaOggi)

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
├── renderers/
│   ├── reel.js                      ← single-scene news reel renderer (TTS → image → FFmpeg)
│   ├── documentary.js               ← multi-scene documentary renderer (6 scenes, concat)
│   └── tts.py                       ← Kokoro TTS wrapper (called by both renderers)
├── scripts/
│   ├── generate-caption.js          ← CLI: generate all fields for 1+ article IDs
│   ├── generate-documentary.js      ← CLI: render Italy documentary video
│   ├── generate-image.js            ← image-only regeneration for 1+ IDs
│   ├── generate-reel.js             ← CLI: render news reel for 1+ article IDs
│   ├── preview-images.js            ← generate + save composited images locally (no posting)
│   ├── preview-reel.js              ← preview reel without posting
│   ├── publish-slot.js              ← post highest-scored pending article at slot time (cron parked)
│   ├── recompute-scores.js          ← recompute publish_score for all articles
│   └── save-article-content.js      ← DB writer (used by Claude Code skills)
└── pipeline.js                      ← main orchestrator

assets/
└── music/
    ├── breaking.mp3                 ← news reel music (breaking criticality)
    ├── positive.mp3                 ← news reel music (positive)
    ├── standard.mp3                 ← news reel music (standard/trending)
    └── documentary_cinematic.mp3    ← Kevin MacLeod "Strength of the Titans" CC BY (documentary)

output/
├── previews/                        ← composited preview images (preview-images.js)
├── reels/                           ← rendered news reel MP4s
└── documentaries/                   ← rendered documentary MP4s

docs/
├── documentary-video-concept.md     ← concept notes, script decisions, France outline
└── video-reel-pipeline.md

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

# (Batch caption generation is no longer a CLI script — use the ✦ Generate button in the dashboard,
#  which calls the Deno edge function. The cron job at xx:30 only recomputes scores + tags.)

# Regenerate image prompt only
node src/scripts/generate-image.js <id1> <id2> ...

# Generate and save preview images locally (no Facebook post)
node src/scripts/preview-images.js <id1> <id2> ...
# → saves to output/previews/<id>.png

# Post highest-scored pending article at the current slot window (auto-cron is disabled)
node src/scripts/publish-slot.js
# Must run within ±15 min of a slot: FR 07:30/12:00/19:00, IT 07:30/11:30/15:30/19:30 CEST

# Recompute publish_score for all articles
node src/scripts/recompute-scores.js

# Render Italy documentary video (~2 min, reuses cached TTS/images on retry)
node src/scripts/generate-documentary.js
# → output/documentaries/l-italia-che-ha-conquistato-il-mondo.mp4

# Render a news reel for specific articles
node src/scripts/generate-reel.js <id1> <id2> ...
# → output/reels/<id>.mp4

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
- Article list with filtering by status (pending / posted / failed / blocked / manual_review) and country
- Default sort = `publish_score` DESC. Cohort-fit articles surface at the top.
- Row tint encodes criticality (red=breaking, orange=alert, blue=trending, white=standard). Rows tagged `off_target` are dimmed to 55% opacity.
- Up to 3 ranked tag chips per row (`+N` chip if more): off_target / patriotic / health / justice / prices / region / sport / social.
- Stats cards: Pending / Posted / Blocked / Failed — clickable to filter.
- Row actions: **Generate** (calls edge function to create AI content), **Delete**.
- Article detail dialog tabs: Overview, Caption, SEO, Image, Signals.
  - Overview shows ID with copy, Priority Score, Post format dropdown (Claude-suggested, human-editable), all tags (no cap).
  - Caption tab shows intro / question / CTA.
  - SEO tab shows seo_title and seo_description.
  - Image tab shows formatted_image_prompt ready for Midjourney/DALL-E.
- Footer actions: ✦ Generate, 📤 Post to Facebook (enabled only when `status==='pending' && ai_caption != null`), ✓ Mark Posted, Close. **No Approve/Reject** — pending → posted directly.
- Batch operations: select multiple rows → batch Generate, Post, Mark Posted, Delete.

**Deploy:** `cd dashboard && vercel --prod`

---

## Documentary Video Pipeline

Standalone national-pride documentary reels for Facebook, separate from the news article pipeline. These are ~2-minute emotional montage videos following the formula: *achievements + proud narration + cinematic music + "Follow if you love [country]" CTA.*

**Reference:** Géomythe-style France reel — culture, luxury, history, sports in one emotional package.

**Why:** Two posts using "SE AMI L'ITALIA / SI VOUS AIMEZ LA FRANCE" drove outsized engagement (152+ likes, deep emotional comments). The documentary format is designed to replicate that emotion at scale.

### Current videos

| Video | Status | File |
|---|---|---|
| Italy — *"L'Italia che ha conquistato il mondo"* | ✅ Rendered | `output/documentaries/l-italia-che-ha-conquistato-il-mondo.mp4` |
| France — *"La France qui a changé le monde"* | Planned (after Italy result) | — |

### How it works (`src/renderers/documentary.js`)

1. **TTS** — each scene's narration rendered via Kokoro `if_sara` (IT) or `ff_siwis` (FR) at 0.85× speed for emotional delivery. WAVs cached — re-runs skip existing files.
2. **Audio concat** — all scene WAVs joined into a single `voice.wav`.
3. **Whisper subtitles** — tiny model, word-level timestamps, burned in via FFmpeg `subtitles=` filter.
4. **Images** — one AI-generated image per scene (Cloudflare Flux by default, Pollinations as free fallback). PNGs cached — re-runs skip existing.
5. **FFmpeg compose** — hard-cut concat of 6 scene clips → subtitles → watermark → CTA overlay → music mix.
6. **Music** — `documentary_cinematic.mp3` (Kevin MacLeod "Strength of the Titans", CC BY 4.0) looped via `-stream_loop -1`, fades out in last 3s.
7. **CTA** — two-line Anton font overlay (`SE AMI L'ITALIA` / `Segui Vivere in Italia`) appears when voice ends, stays for 3s tail.

### Italy script structure (6 scenes, ~1:55 total)

| # | Theme | Duration |
|---|---|---|
| 1 | Opening hook — Italy's global mark | ~16s |
| 2 | Art & Renaissance — da Vinci, Michelangelo, Galileo | ~19s |
| 3 | Fashion & Design — Armani, Gucci, Ferrari | ~20s |
| 4 | Food — pizza, pasta, espresso, gelato | ~20s |
| 5 | Sports — Azzurri, Scuderia Ferrari, Valentino Rossi | ~19s |
| 6 | Closing — "Non è solo un paese. È una civiltà." | ~18s |

### Re-running / retrying

The renderer caches all intermediate files in `/tmp/documentary/<slug>/`. If FFmpeg fails, fix the issue and re-run — TTS and images are skipped automatically. To force a full regeneration, delete the `/tmp/documentary/` directory.

```bash
# Force full regeneration
rm -rf /tmp/documentary/
node src/scripts/generate-documentary.js
```

### Adding a new documentary (e.g. France)

1. Copy the `DOCUMENTARY_IT` object in `generate-documentary.js` and create `generate-documentary-fr.js`.
2. Set `country: 'FR'` — the renderer automatically uses `ff_siwis` voice and `FranceAujourdhui_Logo.png`.
3. Write 6 scenes with narration (French) and imagePrompt (English, for AI generation).
4. Set `cta.line1` to `"SI VOUS AIMEZ LA FRANCE"` and `cta.line2` to `"Suivez France Aujourd'hui"`.
5. The France outline is pre-planned in `docs/documentary-video-concept.md`.

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
| `pending` | Fetched and awaiting review/posting. Generate captions via ✦ in the dashboard, then Post directly. |
| `posted` | Published to Facebook |
| `failed` | Posting to Facebook failed |
| `blocked` | Validator blocked the article (content policy) |
| `manual_review` | Validator flagged the article for human review |
| `approved` / `rejected` | **Legacy** — these enum values still exist in the DB for historical rows but are no longer produced by the pipeline or dashboard. |

Articles older than 7 days with status `pending` are automatically deleted by the `delete_old_articles()` SQL function.

---

## DB Fields Generated per Article

| Field | Description |
|---|---|
| `ai_caption` | `{intro, question, cta, image_headline}` — Facebook post body |
| `seo_title` | ≤60 chars, keyword-first, in article's target language |
| `seo_description` | ≤160 chars, with CTA, in article's target language |
| `image_prompt` | Raw cinematic prompt from Claude |
| `formatted_image_prompt` | `[PROMPT]/[TEXT OVERLAY]/[OUTPUT]` — paste into Midjourney/DALL-E |
| `recommended_format` | Claude's suggestion: `image` / `video` / `poll` / `carousel`. Read-only. |
| `post_format` | Human-confirmed format (defaults to `recommended_format`, editable in dashboard). |
| `tags` | Array of auto-applied tags from `src/utils/tagArticle.js`: off_target, patriotic, health, justice, prices, region, sport, social. |

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
