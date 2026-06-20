# Content Platform — Master Plan

**Last updated:** 2026-06-20  
**Supabase project:** `nnxtvbolhuvihlpwppbj` (shared across all pipelines)  
**Dashboard:** https://dashboard-alpha-one-47.vercel.app

---

## Vision

One monorepo (`content-platform`), one Supabase project, one AI layer — serving three content types across multiple countries and platforms:

| Content type | Pages active | Platforms |
|---|---|---|
| News articles (text + editorial image) | France Aujourd'hui, Vivere in Italia | Facebook |
| Short-form reels (stock footage) | NaturePulse, NatureFrame | Facebook (manual), IG/YT/TT deferred |
| Short-form reels (AI-generated images) | Same pages + expanding | Facebook + all platforms |
| Infographics / explainer videos | TBD | TBD |

Target: expand to 10+ country pages and 4+ platforms within 6 months.

---

## Status Legend

| Symbol | Status | Meaning |
|---|---|---|
| ✅ | **Completed** | Built, tested, live |
| 🚧 | **In Progress** | Actively being worked on |
| 🔲 | **Ready to Start** | Fully planned, can begin immediately |
| 📋 | **Planning Pending** | Idea captured, design/scoping needed before dev |
| ⏸ | **Deferred** | Waiting on a specific trigger or dependency |

---

## All Tasks

### Infrastructure & Platform

| Task | Status | Effort | Trigger / Notes |
|---|---|---|---|
| fal.ai image generation integration | ✅ Completed | ~2h | First task to execute |
| Monorepo setup (`content-platform`) | ✅ Completed | ~1 day | Skeleton at ~/projects/personal/content-platform. Design: [monorepo-structure.md](platform-consolidation/monorepo-structure.md). Code migration is a separate workstream. |
| Migrate Angular dashboard to monorepo | ✅ Completed | ~1 day | Full dashboard migrated to `content-platform/apps/dashboard/` — Angular 21.x, all 5 routes, Canvas compositing, binary assets |
| RunPod Serverless self-hosting | ⏸ Deferred | ~2–3 days | Trigger: 2,000+ images/month or fine-tuning needed |
| Admin dashboard | 📋 Planning Pending | TBD | Design needed — see [admin-dashboard/plan.md](admin-dashboard/plan.md) |
| Planning the features of our project | 📋 Planning Pending | TBD | |

### Platform Services (Containerised Media Generation)

Upgrade TTS, video composition, and caption generation from local CLI scripts into hosted Docker services with a task queue — enabling on-demand remote triggering and off-peak batch scheduling.

| Service / Task | Status | Effort | Notes |
|---|---|---|---|
| TTS Service (Kokoro → Docker + FastAPI) | 📋 Planning Pending | ~3–4h | Fly.io recommended host; persistent volume for model files |
| Video Compositor Service (FFmpeg → Docker + Express) | 📋 Planning Pending | ~4–5h | Bakes in fonts, watermarks, music assets |
| Caption Generation batch endpoint | 📋 Planning Pending | ~2h | Extend existing Supabase edge function; no new container |
| `processing_jobs` task queue (Supabase table) | 📋 Planning Pending | ~1h | Stores job status, scheduled_at, result URLs |
| Queue worker (poller → calls services → writes results) | 📋 Planning Pending | ~4–5h | Docker container; Supabase Realtime for instant dispatch |
| Off-peak batch scheduler | 📋 Planning Pending | ~1–2h | Nightly cron submits pending jobs with 2–5am window |
| Dashboard Jobs panel (status + controls) | 📋 Planning Pending | ~3–4h | Part of admin dashboard; live Realtime updates |
| Fly.io deployment + persistent volumes | 📋 Planning Pending | ~2–3h | Setup only; prod deploy |
| test task | 📋 Planning Pending | ~1h | |
| **Full platform services MVP** | **📋 Planning Pending** | **~22–28h total** | See [platform-services/plan.md](platform-services/plan.md) |

### News Pipeline (facebook-news-pipeline)

| Task | Status | Effort | Notes |
|---|---|---|---|
| RSS + NewsAPI ingestion — FR, IT | ✅ Completed | — | Live, every 30 min via GitHub Actions |
| Claude caption + SEO + image prompt | ✅ Completed | — | Haiku 4.5, prompt caching |
| Image generation via Cloudflare (free) | ✅ Completed | — | Free tier, ~20–30/day cap |
| Supabase Storage upload + URL save | ✅ Completed | — | |
| Angular dashboard (Vercel) | ✅ Completed | — | https://dashboard-alpha-one-47.vercel.app |
| Dashboard image compositing | ✅ Completed | — | Canvas API, Anton font, watermark |
| Facebook posting — FR + IT | ✅ Completed | — | Graph API v22.0 |
| Documentary renderer — Italy | ✅ Completed | — | Manual post, `output/documentaries/` |
| Historical stories pipeline | ✅ Completed | — | 20 topics (IT + FR), anniversary-aware |
| fal.ai as primary image provider | ✅ Completed | ~2h | See [image-generation/provider-decision.md](image-generation/provider-decision.md) |
| Expand to new country pages | ⏸ Deferred | ~2h/country | After fal.ai integration |

### Video Pipeline (reels-pipeline)

| Task | Status | Effort | Notes |
|---|---|---|---|
| Pexels stock clip ingestion | ✅ Completed | — | |
| Claude narration + script generation | ✅ Completed | — | Haiku 4.5 |
| Kokoro TTS (multilingual) | ✅ Completed | — | `if_sara` (IT), `ff_siwis` (FR), `af_bella` (EN) |
| Whisper subtitles (burned-in) | ✅ Completed | — | `tiny` model |
| FFmpeg render → 9:16 MP4 | ✅ Completed | — | H.264/AAC, 1080×1920 |
| Cloudflare R2 upload | ✅ Completed | — | `reels-rendered` bucket |
| NaturePulse + NatureFrame brand assets | ✅ Completed | — | Logos, watermarks, FB banners |
| Facebook API publish — NaturePulse/NatureFrame | ⏸ Deferred | ~2h | Needs FB pages created first |
| Instagram / YouTube / TikTok publish | ⏸ Deferred | ~1 day | After FB API confirmed working |
| AI-image video mode (fal.ai per scene) | 🔲 Ready to Start | ~1–2 days | After monorepo (needs shared image-gen package) |
| Seedance actual video clips per scene | ⏸ Deferred | ~1 day | Month 2+, after AI-image mode validated |
| Sports / World Cup channel (NaturePulse) | 📋 Planning Pending | TBD | Research done — see reels-pipeline/docs/sports-reels-plan.md |

### New Content Types

| Task | Status | Effort | Notes |
|---|---|---|---|
| Infographics / explainer videos | 📋 Planning Pending | TBD | See [infographics/plan.md](infographics/plan.md) |
| Documentary France | 📋 Planning Pending | ~1 day | Concept in [video-platform/documentary-concept.md](video-platform/documentary-concept.md) — 3 decisions pending |

### Self-Hosting & Cost Optimisation

| Task | Status | Effort | Notes |
|---|---|---|---|
| RunPod Serverless image generation | ⏸ Deferred | ~2–3 days | See [self-hosting/runpod-plan.md](self-hosting/runpod-plan.md) |

---

## Current Repositories

| Repo | Path | Status |
|---|---|---|
| `facebook-news-pipeline` | `~/projects/personal/facebook-news-pipeline` | Active |
| `reels-pipeline` | `~/projects/personal/reels-pipeline` | Active |

These will merge into `content-platform` (Phase 2). Until then, both run independently and share the same Supabase project.

---

## Active Pages

| Page | Country / Niche | Platform | Status |
|---|---|---|---|
| France Aujourd'hui | FR | Facebook | ✅ Posting |
| Vivere in Italia | IT | Facebook | ✅ Posting |
| NaturePulse | Wildlife/EN | Facebook | 🟡 Manual upload |
| NatureFrame | Wildlife/EN | Facebook | 🟡 Manual upload |

---

## Development Phase Order

```
Phase 1 — fal.ai integration (🔲 ~2h)
    │  Rewrite generate-image edge function. Cloudflare stays as fallback.
    ▼
Phase 2 — Monorepo setup (🔲 ~1 day)
    │  Create content-platform/, extract shared packages.
    ▼
Phase 3 — AI-image video mode (🔲 ~1–2 days)
    │  Add fetchers/ai-image.js to video-pipeline.
    ▼
Phase 4 — Activate FB publish for reels (⏸ ~2h)
    │  Create NaturePulse/NatureFrame FB pages, flip enabled: true.
    ▼
Phase 5 — Seedance video clips (⏸ ~1 day, Month 2+)
    │  Replace AI-static-images with actual AI video per scene.
    ▼
Phase 6 — RunPod self-hosting (⏸ ~2–3 days, Month 4–6)
         Trigger: 2,000+ images/month or fine-tuning needed.

Parallel open tasks (📋 planning needed before starting):
    ├── Admin dashboard
    ├── Infographics / explainer videos
    ├── Documentary France
    └── Platform services (containerised TTS + compositor + task queue)
```

---

## Document Index

### Master Plan
- **[master-plan.md](master-plan.md)** ← you are here

### Image Generation
- [Provider Decision](image-generation/provider-decision.md) — fal.ai chosen, why alternatives rejected, fallback chain, RunPod path
- [Image Strategy](image-generation/strategy.md) — style evaluation, prompt engineering rules, test results

### Platform Consolidation
- [Consolidation Plan](platform-consolidation/plan.md) — full plan: current state, decisions, monorepo structure, env vars

### Video Platform
- [Documentary Concept](video-platform/documentary-concept.md) — national-pride format, Italy/France concepts, 3 open decisions
- [Reel Pipeline Technical Reference](video-platform/reel-pipeline.md) — full FFmpeg spec, tuning guide, troubleshooting

### News Pipeline
- [Historical Stories Pipeline](news-pipeline/historical-stories.md) — topic catalog (20 IT+FR), caption differences, dashboard features

### Admin Dashboard *(Planning Pending)*
- [Admin Dashboard Plan](admin-dashboard/plan.md) — scope, open questions, model control, platform management

### Infographics & Explainer Videos *(Planning Pending)*
- [Infographics Plan](infographics/plan.md) — content types, rendering approach, open questions

### Platform Services *(Planning Pending)*
- [Platform Services Plan](platform-services/plan.md) — containerised TTS + compositor, task queue, off-peak scheduling, Fly.io hosting

### Self-Hosting
- [RunPod Serverless Plan](self-hosting/runpod-plan.md) — trigger conditions, worker setup, LoRA training path, cost model

### Research (`research/`)
- France + Italy sources audits, posting time analysis, Grazie Italia engagement analysis, Grok reports

### Strategy (`strategy/`)
- France + Italy content gap analyses, 1000-views strategies, implementation plans

### Setup (`setup/`)
- Pipeline overview, secrets guide

### Archive (`archive/`)
- Pre-reorganisation flat files — for reference only, do not edit

---

## Key Technical Decisions (locked)

| Area | Decision | Reference |
|---|---|---|
| Primary image provider | fal.ai — Recraft V3 | [provider-decision.md](image-generation/provider-decision.md) |
| Image fallback chain | fal.ai → Cloudflare → Google | [provider-decision.md](image-generation/provider-decision.md) |
| RunPod timing | Month 4–6, 2,000 img/month trigger | [runpod-plan.md](self-hosting/runpod-plan.md) |
| Monorepo name | `content-platform`, npm workspaces | [plan.md](platform-consolidation/plan.md) |
| Shared packages | ai/, database/, publishers/, media/, types/ | [plan.md](platform-consolidation/plan.md) |
| Video modes | stock + ai-image + hybrid (future) | [plan.md](platform-consolidation/plan.md) |
| Video AI (Phase 5) | Seedance 2.0 via fal.ai | [plan.md](platform-consolidation/plan.md) |
| Video DB | Cloudflare R2 for MP4s, Supabase for metadata | [plan.md](platform-consolidation/plan.md) |
| Supabase project | Single shared project across all pipelines | [plan.md](platform-consolidation/plan.md) |
| Facebook API version | Graph API v22.0 everywhere | CLAUDE.md |
| AI caption model | Claude Haiku 4.5 with prompt caching | CLAUDE.md |
| Image editorial style | Style B (editorial painterly) for politics/news | [strategy.md](image-generation/strategy.md) |

---

## Environment Variables — Complete Reference

```bash
# Core
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_KEY=

# Image generation — fal.ai (primary, Phase 1+)
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
```

---

## reels-pipeline Docs (merge target — Phase 2)

These documents live in `~/projects/personal/reels-pipeline/docs/` and will move here when the monorepo is set up:

| File | Content |
|---|---|
| `architecture.md` | DB schema, channel pattern, storage rules, status fields |
| `brand-assets-prompts.md` | Logo generation prompts for NaturePulse + NatureFrame |
| `sports-reels-plan.md` | World Cup 2026 content strategy |
| `video-styles.md` | Renderer mode reference (factual/cinematic/listicle/silent) |
| `research/manus/` | World Cup gap analysis |
| `research/perplexity/` | Facebook football fan opportunity maps |
