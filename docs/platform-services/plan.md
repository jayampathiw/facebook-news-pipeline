# Platform Services — Containerised Media Generation

**Status:** 📋 Planning Pending  
**Created:** 2026-06-18  
**Prerequisite:** Phase 2 (monorepo) — shared packages must exist before services are extracted

---

## Problem Statement

Currently all media generation runs on a single local machine (i7-4770, WSL2):

- TTS synthesis (Kokoro) — CPU-bound, ~10s per article on i7
- Video composition (FFmpeg) — CPU + disk I/O bound, ~60–90s per reel
- Caption generation (Claude API) — fast, but blocks the local process
- Image generation — already offloaded to fal.ai

This creates three problems:

1. **Scale ceiling** — the local machine can't handle batch generation for 10 pages × 30 articles/day
2. **No off-peak scheduling** — generating 50 reels blocks the machine for hours; no way to queue them for 2am
3. **No on-demand remote triggering** — all generation requires SSH + manual CLI commands; the dashboard can't trigger video or TTS remotely

The fix: extract each compute service into its own Docker container, host it remotely, and wire them to a task queue that supports both on-demand calling and scheduled off-peak batch runs.

---

## Services to Containerise

### Service 1 — TTS Service

**What it does:** Accepts text + voice config → returns synthesised audio (WAV/MP3)

**Current implementation:** `src/renderers/tts.py` — Kokoro ONNX model, runs locally

**Container:**
```
Image size: ~1.5GB (Python 3.10 + kokoro-onnx + model files)
CPU: 2 vCPUs sufficient (Kokoro is ONNX-optimised)
Memory: 2GB RAM
```

**REST API shape:**
```
POST /synthesize
{
  "text": "Bonjour, ceci est un test.",
  "voice": "ff_siwis",
  "speed": 1.0,
  "format": "wav"           // wav | mp3
}
→ 200 { "audio_url": "https://..." }   // uploaded to R2
  or
→ 200 { "audio_b64": "..." }           // inline base64 for small clips
```

**Why containerise:** Kokoro model files (340MB) + Python deps create a fragile local environment. A Docker image pins everything. Multiple workers can run in parallel.

---

### Service 2 — Video Compositor Service

**What it does:** Accepts a job spec (audio URL, image URLs, subtitle file, watermark, music) → runs FFmpeg → returns MP4 URL

**Current implementation:** `src/renderers/reel.js` + `src/renderers/documentary.js` — runs locally, requires FFmpeg 4.4.2+

**Container:**
```
Image size: ~800MB (FFmpeg + Node.js + fonts + music tracks + watermark assets baked in)
CPU: 2–4 vCPUs (FFmpeg is multi-threaded)
Memory: 1GB RAM
```

**REST API shape:**
```
POST /compose
{
  "type": "reel" | "documentary" | "explainer",
  "audio_url": "https://r2.../voice.wav",
  "image_urls": ["https://...", ...],       // one per scene
  "subtitle_url": "https://r2.../subs.srt",
  "music": "standard",                      // breaking | standard | positive | cinematic
  "watermark": "FR",                        // country key → picks logo from baked-in assets
  "headline": "Mon titre ici",
  "output_format": { "width": 1080, "height": 1920, "fps": 30 }
}
→ 200 { "video_url": "https://r2.../output.mp4", "duration_sec": 47 }
```

**Why containerise:** Pins FFmpeg version, bakes in fonts/watermarks/music assets, makes the compositor callable from the dashboard or any other service without SSH.

---

### Service 3 — Caption Generation Service

**What it does:** Accepts an article (title, summary, country) → returns structured caption + SEO fields + image prompt

**Current implementation:** Supabase edge function `generate-caption` — already deployed and working

**Decision: Do NOT containerise separately.** The Supabase edge function already handles this well. Re-implementing as a Docker container adds complexity for no benefit — Deno edge functions have global CDN distribution and zero cold start for Claude API calls.

**Enhancement instead:** Add batch endpoint to the existing edge function so the admin dashboard can trigger caption generation for 20 articles at once, not just one at a time.

---

### Service 4 — Image Generation Service

**Decision: Already solved by fal.ai.** fal.ai IS the hosted image generation service with its own async queue. No container needed until RunPod self-hosting (Phase 6).

---

## Task Queue Architecture

A task queue sits between the dashboard/pipeline and the compute services. It handles:
- Job submission (on-demand from dashboard click or API)
- Job scheduling (off-peak batch runs at configured times)
- Sequential execution (prevents resource contention — one heavy job at a time per worker)
- Status tracking (dashboard shows job progress)
- Retry on failure

### Implementation: Supabase-based queue (recommended)

Use a `processing_jobs` table in the existing Supabase project. No new infrastructure needed.

```sql
CREATE TABLE processing_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL,        -- 'tts' | 'compose_reel' | 'compose_documentary' | 'generate_caption_batch'
  payload       JSONB NOT NULL,       -- job-specific input params
  status        TEXT NOT NULL DEFAULT 'pending',
                                      -- pending | queued | running | completed | failed | cancelled
  priority      INTEGER DEFAULT 5,   -- 1 = highest, 10 = lowest
  scheduled_at  TIMESTAMPTZ,          -- NULL = run ASAP; set for off-peak scheduling
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  result        JSONB,                -- output URLs, duration, etc.
  error         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  article_id    UUID REFERENCES articles(id),
  content_id    UUID REFERENCES content_items(id)
);

CREATE INDEX ON processing_jobs (status, scheduled_at, priority);
```

**Worker:** A lightweight Node.js process running in Docker that:
1. Polls `processing_jobs` for `status = 'pending'` and `scheduled_at <= NOW()`
2. Claims one job at a time (atomic UPDATE with row lock)
3. Calls the appropriate service (TTS, Compositor)
4. Writes result back to the row
5. Notifies the dashboard via Supabase Realtime

**Off-peak scheduling:** Jobs submitted from the dashboard with `scheduled_at = '03:00 UTC'` are skipped by the worker until that time. A nightly batch script submits all pending reels with a 2–5am schedule window, sequentially spaced.

### Alternative: Supabase Queues (native)

Supabase now has a native Queues product. Evaluate when building — may remove the need for the custom `processing_jobs` table.

---

## Hosting Options

### Option A — Fly.io (recommended for TTS + Compositor)

| Property | Value |
|---|---|
| Free tier | 3 shared-CPU VMs free |
| Scale to zero | Yes — machines pause after 5min idle |
| Cold start | ~3–8s (container resume, not rebuild) |
| Persistent volumes | Yes — for model files (avoid re-downloading on every start) |
| Pricing (active) | ~$0.0000224/second of CPU, ~$0.0000035/second of memory |

**Why Fly.io:** The TTS container needs to persist the 340MB Kokoro model file between requests. Fly.io's persistent volumes (3GB free) handle this without re-downloading on every cold start. Machines pause when idle so you pay only when generating.

```toml
# fly.toml (TTS service)
app = "content-platform-tts"
[build]
  dockerfile = "services/tts/Dockerfile"
[[mounts]]
  source = "kokoro_models"
  destination = "/models"
[http_service]
  internal_port = 8000
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

### Option B — Railway

Simpler than Fly.io, good developer experience, but no persistent volumes on free tier — model files re-download on each cold start (~30s delay). Acceptable if the delay is tolerable.

### Option C — DigitalOcean Droplet (always-on)

A $12/month 2vCPU/2GB droplet running both containers permanently.
- No cold start
- Simpler networking
- Always-on cost even at zero usage
- Good for high-volume sustained generation

### Option D — Self-hosted on existing machine (WSL2)

Keep services local but wrap them in Docker for reproducibility. Add a simple Express server as the API wrapper. Workers poll Supabase queue.
- Zero hosting cost
- Requires machine to be on
- Not scalable beyond one machine

**Recommendation: Fly.io for remote hosting, with a fallback local mode for development.**

---

## Proposed Folder Structure (in monorepo)

```
content-platform/
├── services/
│   ├── tts/
│   │   ├── Dockerfile
│   │   ├── server.py          ← FastAPI wrapper around tts.py
│   │   ├── tts.py             ← existing Kokoro wrapper (unchanged)
│   │   └── requirements.txt
│   ├── compositor/
│   │   ├── Dockerfile
│   │   ├── server.js          ← Express wrapper around reel.js / documentary.js
│   │   ├── reel.js            ← existing renderer (unchanged)
│   │   └── package.json
│   └── worker/
│       ├── Dockerfile
│       ├── worker.js          ← queue poller — claims jobs, calls services, writes results
│       └── package.json
├── packages/
│   └── queue/
│       ├── submit.js          ← submitJob(type, payload, options)
│       └── status.js          ← getJobStatus(id), listJobs(filters)
└── ...
```

---

## Off-Peak Batch Scheduling

A scheduled job (GitHub Actions cron or Supabase Cron) runs nightly at midnight:

```javascript
// scripts/schedule-nightly-batch.js
// Runs at 00:00 UTC — submits all pending reels to queue with staggered off-peak times

const pending = await supabase
  .from('articles')
  .select('id')
  .eq('status', 'pending')
  .not('ai_caption', 'is', null)
  .is('reel_path', null);

let offsetMinutes = 120; // start at 02:00 UTC
for (const article of pending.data) {
  await submitJob('compose_reel', { article_id: article.id }, {
    scheduled_at: new Date(Date.now() + offsetMinutes * 60_000),
    priority: 5,
  });
  offsetMinutes += 3; // space jobs 3 minutes apart
}
```

**Result:** 50 pending articles get reels generated between 2am–4:30am. No resource contention with daytime dashboard use. Each job is sequential so the compositor isn't overloaded.

---

## Dashboard Integration

The Angular dashboard gains a **Jobs** panel in the admin section:

| Feature | Implementation |
|---|---|
| "Generate Reel" button | Submits a `compose_reel` job to the queue, shows "Queued" status |
| "Generate All Reels Tonight" button | Submits all pending articles as off-peak batch |
| Job status list | Supabase Realtime subscription on `processing_jobs` — live updates |
| Job progress | `status` field: pending → running → completed / failed |
| Cancel job | UPDATE status = 'cancelled' where status = 'pending' |

---

## Open Questions (must answer before dev starts)

1. **Hosting choice:** Fly.io vs Railway vs always-on VPS? Depends on volume and acceptable cold start latency. Fly.io is the recommendation but needs a credit card for persistent volumes.

2. **TTS API: return audio bytes or upload to R2?** For short clips (<60s): return bytes directly in response. For longer documentary narration: upload to R2, return URL. The compositor service then fetches from R2. Avoids payload size limits.

3. **Worker polling interval:** 5s is responsive but noisy on Supabase. 30s is quiet but adds latency to on-demand jobs. A Supabase Realtime subscription on the jobs table is better than polling — triggers instantly on INSERT.

4. **Sequential vs parallel workers:** One worker at a time prevents resource contention on small hosts. But if you have 2 Fly.io machines, two workers can run simultaneously. What's the right concurrency limit?

5. **Compositor: monolithic or split into TTS-then-compose?** Option A: the queue has separate `tts` and `compose_reel` job types, and compose_reel is submitted automatically when TTS completes (a two-stage pipeline). Option B: the compositor service calls the TTS service internally and the queue only has a single `compose_reel` job. Option B is simpler.

6. **Dev/local mode:** When developing locally, do services run as Docker containers (docker-compose) or as plain Node/Python processes? Recommendation: `docker-compose.dev.yml` that starts all services locally with hot reload.

---

## Estimated Effort

| Component | Effort |
|---|---|
| TTS service Dockerfile + FastAPI server | 3–4h |
| Video compositor Dockerfile + Express server | 4–5h |
| `processing_jobs` Supabase table + indexes | 1h |
| Queue worker (poller + job executor) | 4–5h |
| `packages/queue` submit/status helpers | 2h |
| Off-peak batch scheduler script | 1–2h |
| Dashboard Jobs panel (status list + buttons) | 3–4h |
| Fly.io deployment + persistent volume setup | 2–3h |
| End-to-end test (submit → queue → TTS → compose → dashboard) | 2h |
| **Total** | **~22–28h** |

---

## Next Step

Answer the 6 open questions above. The most important decision is hosting choice (Q1) and API return format (Q2) — those shape everything else. Then this becomes 🔲 Ready to Start.
