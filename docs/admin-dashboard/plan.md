# Admin Dashboard — Planning Document

**Status:** 📋 Planning Pending  
**Created:** 2026-06-18  
**Prerequisite:** Phase 2 (monorepo) — admin dashboard lives alongside the content dashboard in `apps/dashboard/`

---

## What This Is

A separate section of the Angular dashboard for platform operators — not for content review, but for controlling how the platform runs. The existing dashboard is a content workflow tool (review articles, generate captions, post). The admin dashboard is a control panel for the machinery underneath.

---

## Motivation

As the platform expands to more countries, more video channels, and more AI providers, configuration that currently lives in env vars and hardcoded files needs to be manageable without a code deploy. Examples:

- Switch the image generation model from Recraft V3 to FLUX.2 Pro without touching code
- Pause posting for a specific country page without disabling the whole pipeline
- See how many images were generated this month and what they cost
- Enable or disable a platform (Facebook, Instagram, YouTube) per channel
- Adjust posting slot times per country

---

## Scope — What Belongs in Admin Dashboard

### Model Control
Configure which AI models are active and at what settings:

| Setting | Current state | Admin control needed |
|---|---|---|
| Image generation provider | fal.ai (hardcoded) | Dropdown: fal.ai / Cloudflare / Google / RunPod |
| Image generation model | Recraft V3 (hardcoded) | Dropdown: Recraft V3 / FLUX.2 Pro / FLUX Schnell |
| Claude model (captions) | Haiku 4.5 (hardcoded) | Dropdown: Haiku / Sonnet (for quality A/B) |
| TTS voice per country | `if_sara`, `ff_siwis` (hardcoded) | Per-country voice selector |
| Whisper model | `tiny` (hardcoded) | Dropdown: tiny / small / medium |

### Platform Management
Enable/disable pages and platforms without code changes:

| Setting | Current state | Admin control needed |
|---|---|---|
| Country page enabled | All active by default | Toggle per page (FR, IT, etc.) |
| Platform enabled per channel | `enabled: true/false` in channels.js | Toggle: Facebook / Instagram / YouTube / TikTok per channel |
| Posting slots | Hardcoded in publish-slot.js | Editable time slots per country |
| Post format default | `recommended_format` from Claude | Override: image / video / carousel per country |

### Pipeline Controls
Operational controls without SSH access:

| Control | Purpose |
|---|---|
| Pause ingestion per country | Stop fetching new articles for FR or IT temporarily |
| Pause posting per country | Keep fetching but don't post (useful before page audit) |
| Manual pipeline trigger | Run ingestion + scoring now (currently only via GitHub Actions) |
| Flush pending articles | Mark all pending articles older than N days as expired |

### Cost & Usage Monitoring
Visibility into what the platform is spending:

| Metric | Source |
|---|---|
| Images generated this month | Supabase: count of articles with generated_image_url set |
| Estimated image cost | images × model rate (pulled from config) |
| Articles fetched / posted / failed | Existing status columns in Supabase |
| Reels rendered this month | content_items table |
| API call log (last 24h) | Optional: log table in Supabase |

---

## Scope — What Does NOT Belong

- **Content review** — that stays in the existing dashboard (article list, captions, posting)
- **User authentication management** — too niche, Supabase Auth handles this
- **Database migrations** — CLI only, never through a UI
- **Fine-tuning or model training** — too complex for a UI panel, CLI + scripts

---

## Architecture Options

### Option A — New tab/route in existing Angular dashboard (recommended)
Add an `/admin` route to `apps/dashboard/` behind an `admin` role check. Reuses all existing infrastructure (Supabase client, Angular Material components, auth guard).

- **Pro:** Zero new deployment, same auth, shared component library
- **Con:** Admin concerns mixed into the content app bundle
- **Recommended for Phase 1** — simplest, shippable fast

### Option B — Separate Angular app in monorepo (`apps/admin/`)
A dedicated admin app with its own Vercel deployment URL.

- **Pro:** Clean separation, can have different auth rules
- **Con:** New Vercel project, new deployment pipeline, more infra
- **Consider at Phase 2+** if admin needs are significantly different

---

## Open Questions (must answer before dev starts)

1. **Who uses the admin dashboard?** Just you, or multiple operators? If just one person, a simple role check is enough. If multi-user, need role assignment UI.

2. **Where does config live?** Two options:
   - **Supabase `platform_config` table** — config stored in DB, no deploy needed to change it. Admin dashboard reads/writes this table. Pipeline reads it at runtime.
   - **Environment variables** — simpler, but changing requires a Vercel/Supabase redeploy. Not truly "admin panel" territory.
   - Recommendation: Supabase `platform_config` table with a JSON `value` column.

3. **Real-time cost tracking or estimates only?** Accurate cost tracking requires logging every API call with its cost. Estimates just multiply counts by known rates. Estimates are 80% of the value at 10% of the work.

4. **What is the MVP?** Suggest starting with:
   - Model selector (image provider + model)
   - Country page enable/disable toggles
   - Basic stats cards (images this month, articles posted, estimated cost)
   - Everything else deferred to v2

---

## Suggested DB Schema (when ready to plan)

```sql
-- platform_config: key-value store for runtime configuration
CREATE TABLE platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example rows:
-- { key: 'image_provider', value: '"fal"' }
-- { key: 'image_model', value: '"fal-ai/recraft-v3"' }
-- { key: 'pages_enabled', value: '{"FR": true, "IT": true, "NATURE_PULSE": false}' }
-- { key: 'posting_slots_FR', value: '["07:30", "12:00", "19:00"]' }
```

The pipeline reads from this table at startup (or per-run) instead of relying purely on hardcoded constants.

---

## Estimated Effort

| Component | Effort |
|---|---|
| Supabase `platform_config` table + seed data | 1h |
| Pipeline reads config from DB instead of hardcoded | 2–3h |
| Angular `/admin` route + auth guard | 1h |
| Model selector UI | 2h |
| Page enable/disable toggles | 2h |
| Stats cards (images, posts, estimated cost) | 2–3h |
| **MVP total** | **~10–12h** |

---

## Next Step

Answer the 4 open questions above, then this becomes a 🔲 Ready to Start task.
