# Platform Consolidation Plan

**Finalized:** 2026-06-18  
**Status:** Ready for development — all decisions locked, implementation can start at any point.

---

## Vision

Consolidate `facebook-news-pipeline` and `reels-pipeline` into a single monorepo: a multi-channel content publishing platform that covers news articles, short-form video (stock footage), and AI-generated image video. All three content types share one Supabase project, one AI layer, one publisher layer, and one dashboard.

---

## Current State (what exists, what works)

### facebook-news-pipeline (`~/projects/personal/facebook-news-pipeline`)

| Component | Status |
|---|---|
| RSS + NewsAPI ingestion (FR, IT) | ✅ Working |
| Claude caption + SEO + image prompt generation | ✅ Working |
| Image generation via Cloudflare Flux Schnell | ✅ Working (free tier, ~20–30 images/day cap) |
| Supabase storage upload + DB URL save | ✅ Working |
| Angular dashboard (Vercel) | ✅ Working |
| Dashboard image compositing (Canvas API, watermark + Anton font) | ✅ Working |
| Facebook posting (FR + IT, Graph API v22.0) | ✅ Working |
| Documentary video renderer (Italy) | ✅ Rendered, manual post |
| GitHub Actions cron (every 30 min) | ✅ Working |
| Google AI Studio image generation | ❌ Blocked (billing not enabled on GCP) |

### reels-pipeline (`~/projects/personal/reels-pipeline`)

| Component | Status |
|---|---|
| Pexels stock clip ingestion | ✅ Working |
| Claude narration + script generation (Haiku 4.5) | ✅ Working |
| Kokoro TTS (multilingual) | ✅ Working |
| Whisper subtitles (burned-in captions) | ✅ Working |
| FFmpeg render → 9:16 MP4 | ✅ Working |
| Cloudflare R2 upload | ✅ Working |
| NaturePulse + NatureFrame brand assets | ✅ Complete |
| Facebook API publish | ⏸ Deferred (manual upload workflow active) |
| Instagram / YouTube / TikTok publish | ⏸ Deferred |
| AI-generated image video mode | ❌ Not built |

---

## Decision 1 — Image Generation Architecture

### Primary: fal.ai

**Why chosen over alternatives:**
- Recraft V3 is exclusive to fal.ai and is the best model for editorial news illustration
- No content policy blocks on editorial news imagery (politicians, protests, events) — Google Imagen refuses these
- Native async queue — unlimited concurrent requests, no 24-request cap (BFL has this)
- Single account covers image generation AND video generation (Seedance, Kling) for future video upgrades
- LoRA fine-tuning available — exports weights portable to RunPod self-hosting later
- Nanobanana model available at $0.0398 (vs $0.134 on Together AI — same model, 3.4× cheaper)

**Models to use:**
| Use case | Model | Cost |
|---|---|---|
| News article editorial images (primary) | Recraft V3 | $0.04/image |
| News article editorial images (alternative) | FLUX.2 Pro | $0.03/image |
| Documentary / reel scene images (AI mode) | Recraft V3 or FLUX.2 Pro | $0.03–0.04/image |
| Budget fallback within fal.ai | FLUX Schnell | $0.003/image |

**Async queue approach for bulk generation:**
- Submit all image requests in parallel (`Promise.all`)
- fal.ai queues them server-side, no 429s
- For documentary (6 scenes): fire all 6, collect in ~15s total instead of sequential 3 minutes

### Free Fallback Chain (kept as-is, no code changes needed)

```
fal.ai (primary)
    ↓ on failure / timeout
Cloudflare Workers AI — Flux 1 Schnell (free tier, ~20–30 images/day)
    ↓ daily cap hit
Google AI Studio — Gemini image models (free tier, needs billing enabled for Imagen 4)
    ↓ all fail
Flag article: image_generation_status = 'failed', skip to manual
```

The Cloudflare and Google paths remain in the codebase unchanged. fal.ai gets wired as the first attempt.

### Future: RunPod Self-Hosting (Month 4–6)

Trigger: volume reaches ~2,000+ images/month OR fine-tuning on house editorial style needed.

Path:
1. Train a LoRA on your best-performing article images via fal.ai's LoRA training API
2. Export weights
3. Deploy to RunPod Serverless worker running Flux + LoRA
4. Swap the fal.ai endpoint URL in the image generation module — everything else unchanged

RunPod Serverless eliminates cold starts vs a persistent pod. Cost drops to ~$0.002/image.

### Cost Estimate at Scale

| Scale | fal.ai Recraft V3 | RunPod Schnell |
|---|---|---|
| 2 pages, 30 img/day | $36/month | $3.60/month |
| 6 pages, 30 img/day | $108/month | $10.80/month |
| 10 pages, 50 img/day | $600/month | $30/month |

RunPod becomes meaningfully cheaper beyond ~2,000 images/month. Below that, fal.ai's zero-ops cost is worth the markup.

### Environment Variables Required

```bash
# fal.ai
FAL_KEY=                          # from fal.ai dashboard

# Keep existing (no changes)
CF_ACCOUNT_ID=                    # Cloudflare (existing)
CF_API_TOKEN=                     # Cloudflare (existing)
GOOGLE_AI_KEY=                    # Google AI Studio (existing, in .env)
```

---

## Decision 2 — Monorepo Consolidation

### Repository name (suggested): `content-platform`

Path: `~/projects/personal/content-platform`

Replaces both `facebook-news-pipeline` and `reels-pipeline`. The Supabase project (`nnxtvbolhuvihlpwppbj`) is already shared — no migration needed there.

### Proposed structure

```
content-platform/
├── apps/
│   ├── news-pipeline/            ← ex facebook-news-pipeline/src/
│   │   ├── config/sources.js
│   │   ├── fetchers/
│   │   ├── pipeline.js
│   │   └── scripts/
│   ├── video-pipeline/           ← ex reels-pipeline/src/
│   │   ├── config/channels.js
│   │   ├── fetchers/
│   │   ├── renderers/
│   │   ├── pipeline.js
│   │   └── scripts/
│   └── dashboard/                ← ex facebook-news-pipeline/dashboard/ (Angular)
│
├── packages/
│   ├── ai/
│   │   ├── claude.js             ← caption + script + SEO generation (shared system prompt pattern)
│   │   ├── image-gen/
│   │   │   ├── index.js          ← provider router: fal.ai → Cloudflare → Google
│   │   │   ├── fal.js            ← fal.ai REST client (primary)
│   │   │   ├── cloudflare.js     ← existing Cloudflare Flux call (moved here)
│   │   │   └── google.js         ← Google AI Studio call (moved here)
│   │   └── tts.py                ← Kokoro TTS wrapper (shared)
│   │
│   ├── database/
│   │   ├── supabase.js           ← shared Supabase client
│   │   ├── articles.js           ← news article CRUD (from news-pipeline)
│   │   └── content-items.js      ← reel content item CRUD (from video-pipeline)
│   │
│   ├── publishers/
│   │   ├── index.js              ← fanout router
│   │   ├── facebook.js           ← Graph API v22.0 (merged — currently duplicated in both repos)
│   │   ├── instagram.js
│   │   ├── youtube.js
│   │   └── tiktok.js
│   │
│   ├── media/
│   │   ├── ffmpeg.js             ← FFmpeg orchestration helpers
│   │   ├── composite.js          ← image compositing (watermark + font overlays)
│   │   └── storage.js            ← Cloudflare R2 adapter (from reels-pipeline)
│   │
│   └── types/
│       ├── article.js            ← Article shape (news pipeline)
│       └── content-item.js       ← ContentItem shape (video pipeline)
│
├── supabase/
│   ├── functions/
│   │   ├── generate-caption/     ← existing Deno edge function
│   │   └── generate-image/       ← updated: fal.ai primary
│   └── migrations/               ← merged from both projects
│
├── assets/
│   ├── music/                    ← all tracks from both projects
│   └── logos/                    ← all watermark PNGs from both projects
│
├── docs/
│   └── ...                       ← this document + existing docs
│
├── .github/
│   └── workflows/
│       ├── fetch-news.yml        ← ex fetch.yml (every 30 min, news pipeline)
│       └── fetch-reels.yml       ← reel ingestion cron (when ready)
│
├── package.json                  ← npm workspaces root
└── .env.example                  ← all env vars from both projects merged
```

### Package manager: npm workspaces

Both projects currently use npm. Use npm workspaces (built-in, no Turborepo needed at this stage). Add Turborepo later if build caching becomes valuable.

**Root `package.json`:**
```json
{
  "name": "content-platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

Each app and package gets its own `package.json` with a `name` field (`@content-platform/ai`, `@content-platform/database`, etc.).

### What gets shared vs what stays per-app

| Currently duplicated | Move to package |
|---|---|
| Supabase client setup | `packages/database/supabase.js` |
| Facebook Graph API client | `packages/publishers/facebook.js` |
| Claude API call pattern + caching | `packages/ai/claude.js` |
| Kokoro TTS wrapper | `packages/ai/tts.py` |
| Image generation | `packages/ai/image-gen/` |

| Stays per-app | Why |
|---|---|
| `config/sources.js` (news countries) | news-pipeline concern only |
| `config/channels.js` (video channels) | video-pipeline concern only |
| `renderers/` | render logic is fundamentally different per content type |
| `scripts/` | separate CLI entrypoints |
| `pipeline.js` | separate orchestration per pipeline |

### Migration steps (when ready to consolidate)

1. Create `content-platform/` repo with the structure above
2. Copy `facebook-news-pipeline/src/` → `apps/news-pipeline/`
3. Copy `reels-pipeline/src/` → `apps/video-pipeline/`
4. Copy `facebook-news-pipeline/dashboard/` → `apps/dashboard/`
5. Extract duplicated code into `packages/`
6. Update import paths (`../../packages/ai` etc.)
7. Merge `.env.example` files
8. Merge `supabase/` directories
9. Archive both old repos (don't delete — keep as reference for 30 days)
10. Update Vercel project to point to `apps/dashboard/`
11. Update GitHub Actions secrets on new repo

**This migration is non-urgent.** The image generation upgrade (fal.ai) can be done in the existing repo first. Migration is a separate workstream.

---

## Decision 3 — Unified Video Generation Platform

### Two video modes under one pipeline

The reels-pipeline will support two scene source modes — controlled by the channel config:

| Mode | Scene source | How |
|---|---|---|
| `stock` | Pexels / Pixabay video clips | Existing fetcher, unchanged |
| `ai-image` | fal.ai generated image per scene | New fetcher: `fetchers/ai-image.js` |
| `hybrid` (future) | Mix of stock clips + AI images | Renderer picks source type per scene |

**Channel config change (example):**
```javascript
// Current (stock mode)
fetchers: [{ type: 'pexels', query: 'wildlife animals', perPage: 15 }],

// New (AI image mode)
fetchers: [{ type: 'ai-image', promptTemplate: 'cinematic wildlife photography, {subject}, golden hour, 9:16' }],

// Future (hybrid)
fetchers: [
  { type: 'pexels', query: 'wildlife animals', weight: 0.4 },
  { type: 'ai-image', promptTemplate: '...', weight: 0.6 },
],
```

The renderer (`renderers/reel.js`) already applies Ken Burns effect (zoom/pan via FFmpeg `zoompan` filter) on static images for the documentary mode. That same approach applies to AI-generated images — one image per scene, animated with Ken Burns, stitched into the final reel.

### AI-image fetcher design (`fetchers/ai-image.js`)

```
For each scene in channel config:
  1. Generate image_prompt from Claude (topic-aware, cinematic style)
  2. Call packages/ai/image-gen/index.js (fal.ai → fallback chain)
  3. Receive base64 PNG
  4. Save to /tmp/<content_id>/scene_<n>.png
  5. Return { localPath, width: 1080, height: 1920, source: 'ai-image' }
  
Renderer then treats these paths identically to Pexels clip paths.
```

### What this unlocks

| Content type | Platform | Status after build |
|---|---|---|
| News article (text + static image) | Facebook FR/IT | ✅ Existing |
| Short-form reel (stock video clips) | Facebook/IG/YT/TT | ✅ Existing (manual publish) |
| Short-form reel (AI-generated images) | Facebook/IG/YT/TT | 🔲 To build |
| Documentary (AI images + narration) | Facebook FR/IT | ✅ Existing (manual) |
| Hybrid reel (stock + AI mix) | All platforms | 🔲 Future |

### Video generation with Seedance (future upgrade)

Once the AI-image mode is working, the next upgrade is replacing static images with actual AI video clips:
- Submit scene narration text → Seedance 2.0 → 3–5s video clip per scene
- No Ken Burns needed — real motion
- Cost: ~$0.24–0.30 per 10-second clip (Seedance 2.0 Standard on fal.ai)
- For a 45s reel (7 scenes × ~6s each): ~$1.70–2.10/reel

This is a significant quality jump. Implement after AI-image mode is validated.

---

## Phase Plan

### Phase 1 — fal.ai integration (immediate, ~2 hours)

Scope: `facebook-news-pipeline` repo only. Existing codebase, no migration.

1. **Add `FAL_KEY` to `.env` and Supabase secrets**
   ```bash
   supabase secrets set FAL_KEY=your_key_here
   ```

2. **Rewrite `supabase/functions/generate-image/index.ts`**
   - Replace the Cloudflare Flux block with a fal.ai REST call to Recraft V3
   - Keep Cloudflare as the first fallback (same code, demoted to `catch` path)
   - Everything after the image bytes (Supabase Storage upload, DB URL save) stays identical

3. **Add `FAL_KEY` to GitHub Actions secrets** (for any future CLI scripts that call fal.ai directly)

4. **Test**: click Generate Image in dashboard → verify Recraft V3 image appears

**Deliverable:** Dashboard "Generate Image" button produces Recraft V3 quality images. No other changes.

---

### Phase 2 — Monorepo setup (~1 day, separate workstream)

Scope: Create `content-platform/` repo. Migrate both existing repos into it.

Do this when:
- fal.ai integration is stable (Phase 1 done)
- You want to start working on the AI-image video mode (needs shared packages)

Steps are documented in "Migration steps" section above.

---

### Phase 3 — AI-image video mode (~1–2 days)

Scope: Add `fetchers/ai-image.js` to video-pipeline. Wire fal.ai image generation into the reel renderer.

Prerequisites: Phase 2 (monorepo), so `packages/ai/image-gen/` is available as a shared import.

1. Build `fetchers/ai-image.js` — calls Claude for scene image prompts, then image-gen package
2. Extend `channels.js` to support `{ type: 'ai-image' }` fetcher config
3. Update `renderers/reel.js` to handle static image input path (most code already exists from documentary renderer)
4. Test: run `node src/scripts/generate-reel.js` on an AI-image channel, verify output MP4

---

### Phase 4 — Activate Facebook publish for reels (~2 hours)

Scope: Create Facebook pages for NaturePulse and NatureFrame. Flip on API publishing.

Prerequisites: Phase 3 complete (something worth posting).

1. Create NaturePulse + NatureFrame Facebook pages via FB web UI
2. Add page IDs + access tokens to `.env` and GitHub Secrets
3. Set `facebook: { enabled: true }` in `channels.js`
4. Test: `node src/scripts/publish.js <content_id>`

---

### Phase 5 — Seedance video clips (~1 day)

Scope: Replace AI-generated static images with actual short video clips per scene.

Prerequisites: Phase 3 stable and generating good output for several weeks.

1. Add `fetchers/seedance.js` — takes scene narration text → Seedance 2.0 API → downloads MP4 clip
2. Add `{ type: 'seedance' }` fetcher option to channel config
3. Update renderer to handle MP4 clips in the source position (already works for Pexels clips)
4. Monitor cost: ~$1.70–2.10/reel, validate against engagement uplift

---

### Phase 6 — RunPod self-hosting (Month 4–6)

Trigger when: monthly image volume exceeds ~2,000 images OR you want a fine-tuned house style.

1. Train Flux LoRA on best-performing article images via fal.ai training API
2. Export weights, build RunPod worker Docker image
3. Deploy as RunPod Serverless endpoint
4. Swap endpoint URL in `packages/ai/image-gen/fal.js` → `packages/ai/image-gen/runpod.js`
5. Cost drops from ~$0.03–0.04/image to ~$0.002/image

---

## Environment Variables — Full Reference

All variables across both pipelines, for the future merged `.env`:

```bash
# Core
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_KEY=

# Image generation — fal.ai (Phase 1+)
FAL_KEY=

# Image generation — Cloudflare fallback (existing)
CF_ACCOUNT_ID=
CF_API_TOKEN=

# Image generation — Google fallback (existing)
GOOGLE_AI_KEY=

# Video storage — Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_RENDERED=reels-rendered
R2_BUCKET_INBOX=reels-inbox
R2_PUBLIC_BASE_URL=

# Stock footage APIs
PEXELS_API_KEY=
PIXABAY_API_KEY=
NEWSAPI_KEY=

# Facebook — news pages
FB_PAGE_ID_FR=
FB_ACCESS_TOKEN_FR=
FB_PAGE_ID_IT=
FB_ACCESS_TOKEN_IT=

# Facebook — video pages
FB_PAGE_ID_NATURE_PULSE=
FB_ACCESS_TOKEN_NATURE_PULSE=
FB_PAGE_ID_NATURE_FRAME=
FB_ACCESS_TOKEN_NATURE_FRAME=

# Instagram / YouTube / TikTok (deferred, add when activating those platforms)
# IG_ACCESS_TOKEN_NATURE_PULSE=
# YT_CLIENT_ID=
# TT_ACCESS_TOKEN=
```

---

## Key Design Decisions (locked)

| Decision | Choice | Reason |
|---|---|---|
| Primary image provider | fal.ai | Recraft V3 exclusive, no editorial content blocks, best async queue, covers video too |
| Image fallback chain | fal.ai → Cloudflare → Google | Keep free tiers available during transition, handle fal.ai outages |
| RunPod timing | Month 4–6, volume-gated | Engineering cost not justified before ~2,000 images/month |
| Monorepo tooling | npm workspaces (no Turborepo yet) | Both projects already on npm, workspaces is sufficient for now |
| Package extraction strategy | Extract only genuinely shared code | Don't force abstraction — only extract when same logic is actually needed in both apps |
| Video DB | Cloudflare R2 for MP4s, Supabase for metadata | Supabase Storage not suitable for large binaries |
| Supabase project | Keep single shared project | Both pipelines already share `nnxtvbolhuvihlpwppbj` — no benefit to splitting |
| Facebook API version | Graph API v22.0 everywhere | v19 deprecated May 2026 |
| AI model for captions/scripts | Claude Haiku 4.5 with prompt caching | 70% cheaper than Sonnet, fast enough, caching cuts cost further |
| Video AI model | Seedance 2.0 via fal.ai (Phase 5) | Best cost/quality at ~$0.24/sec, ByteDance quality, same fal.ai account |
