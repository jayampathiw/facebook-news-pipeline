# Image Generation Provider Decision

**Finalized:** 2026-06-18  
**Status:** Locked — fal.ai is primary, existing free tiers kept as fallbacks.

---

## Decision: fal.ai (primary)

### Models in use

| Use case | Model | Price |
|---|---|---|
| News article editorial images | Recraft V3 | $0.04/image |
| Alternative / lower cost | FLUX.2 Pro | $0.03/image |
| Documentary / reel scenes | Recraft V3 or FLUX.2 Pro | $0.03–0.04/image |
| Budget fallback within fal.ai | FLUX Schnell | $0.003/image |
| Nanobanana (if needed) | Nanobanana Pro | $0.0398/image |

### Why fal.ai

**Recraft V3 is exclusive to fal.ai** among the three platforms evaluated (fal.ai, Together AI, Black Forest Labs direct). It is the best model for editorial illustration style — clean, structured, magazine-cover quality. Not available anywhere else.

**Content policy is permissive for news.** Google Imagen blocks politicians, protests, and news events. fal.ai, Together AI, and BFL all allow editorial news imagery. Content policy is not a differentiator between the three platforms evaluated, but it decisively eliminates Google Imagen for this use case.

**No rate limits on burst.** BFL has a 24 concurrent request hard cap. Together AI has 100 req/min. fal.ai has no hard cap — burst as fast as billing allows. Critical for documentary generation (6 scenes in parallel).

**Same account covers video.** Seedance 2.0, Kling 2.5, WanVideo, and Veo 3 are all available on fal.ai. The video pipeline upgrade (Phase 5) uses the same API key with no new account setup.

**LoRA fine-tuning available.** Train on your best-performing article images → export weights → deploy to RunPod. This is the clean migration path when self-hosting makes sense (Month 4–6).

**Nanobanana pricing.** The Google Flow model (Nanobanana Pro) is available on both fal.ai ($0.0398) and Together AI ($0.134). If you use it, fal.ai is 3.4× cheaper for the same model.

---

## Platforms rejected and why

### Together AI
- No Recraft V3 (the decisive model for editorial style)
- 100 req/min rate cap could bite on bulk generation
- Has $25 free credits — worth creating an account to test models before committing

### Black Forest Labs (BFL direct API)
- No Recraft V3, no Ideogram — only Flux family
- 24 concurrent request hard cap (standard tier) — too tight for bulk documentary generation
- No video generation at all — eliminates future Seedance upgrade
- Polling-based async (submit → poll at 500ms) complicates Deno edge function implementation

### Google Imagen 4
- Blocks news editorial content: politicians, protests, disaster scenes
- Fatal for a news pipeline where images of Macron, Italian PM, and civil events are routine
- Billing must be enabled separately on GCP even if you have Google One AI Premium

---

## Fallback chain (kept as-is)

```
fal.ai (primary — Recraft V3)
    ↓ on HTTP error / timeout
Cloudflare Workers AI — Flux 1 Schnell (free, ~20–30 images/day cap)
    ↓ daily cap hit (HTTP 429)
Google AI Studio — Gemini image models (existing GOOGLE_AI_KEY)
    ↓ all fail
Set image_generation_status = 'failed', skip to manual
```

**No code is removed** from the Cloudflare or Google paths. Both stay active as silent fallbacks. fal.ai is inserted as the first attempt only.

---

## Environment variables

```bash
FAL_KEY=          # fal.ai dashboard → API Keys → Create key
CF_ACCOUNT_ID=    # existing — no change
CF_API_TOKEN=     # existing — no change
GOOGLE_AI_KEY=    # existing — no change
```

`FAL_KEY` must be added to:
1. Local `.env`
2. Supabase secrets: `supabase secrets set FAL_KEY=your_key_here`
3. GitHub Actions secrets (for future CLI scripts)

---

## Cost at scale

| Monthly volume | fal.ai Recraft V3 | fal.ai FLUX.2 Pro | RunPod (future) |
|---|---|---|---|
| 900 images (2 pages, 30/day) | $36 | $27 | $1.80 |
| 2,700 images (6 pages, 30/day) | $108 | $81 | $5.40 |
| 15,000 images (10 pages, 50/day) | $600 | $450 | $30 |

RunPod self-hosting becomes worth the engineering cost beyond ~2,000 images/month. Below that, fal.ai's zero-ops overhead is worth the markup.

---

## RunPod migration path (Month 4–6)

Trigger: image volume exceeds ~2,000/month OR fine-tuning on house style is needed.

1. Train a Flux LoRA on your best-performing article images via fal.ai's LoRA training API
2. Download the trained weights
3. Build a RunPod Serverless worker Docker image running Flux + your LoRA
4. Deploy to RunPod Serverless endpoint
5. Update `packages/ai/image-gen/index.js` to call the RunPod endpoint URL instead of fal.ai

The prompt format, image dimensions, and output pipeline stay identical. It is a URL swap.

Cost after migration: ~$0.002/image (RunPod Serverless, A40 GPU).

---

## Platform comparison reference

Full head-to-head research (model catalogs, pricing, rate limits, content policy) across fal.ai, Together AI, and BFL was conducted on 2026-06-18. Key table:

| Model | fal.ai | Together AI | BFL |
|---|---|---|---|
| Recraft V3 ($0.04) | ✅ exclusive | ❌ | ❌ |
| FLUX.2 Pro ($0.03) | ✅ | ✅ | ✅ |
| FLUX.2 Max ($0.07) | ✅ | ✅ | ✅ only |
| Nanobanana | ✅ $0.04 | ✅ $0.13 | ❌ |
| Video (Seedance/Kling) | ✅ | ✅ | ❌ |
| LoRA training | ✅ | Unconfirmed | ✅ |
| Rate limit | None | 100 req/min | 24 concurrent |
| Free credits | None | $25 | None |
