# Secrets & Configuration Guide

**Last updated:** 2026-05-20 (image provider secrets added to local .env)

All sensitive credentials are stored as GitHub Actions Secrets (never in code).
Non-sensitive config is stored as GitHub Actions Variables.
The Supabase edge function has its own separate secret store.

---

## GitHub Actions — Secrets

Navigate to: `github.com/jayampathiw/facebook-news-pipeline → Settings → Secrets and variables → Actions → Secrets tab`

### Core pipeline secrets

| Secret | Description | Where to find it |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | `https://nnxtvbolhuvihlpwppbj.supabase.co` (fixed) |
| `SUPABASE_KEY` | Supabase service-role key | Supabase dashboard → Project Settings → API → `service_role` |
| `NEWSAPI_KEY` | NewsAPI.org API key | newsapi.org → your account → API key |

### AI / caption generation secrets

| Secret | Description | Where to find it |
|---|---|---|
| `ANTHROPIC_KEY` | API key for caption generation | Your provider account (e.g. oneprovider.dev → API keys) |
| `ANTHROPIC_BASE_URL` | Custom API base URL (if using a proxy provider) | e.g. `https://api.oneprovider.dev` |
| `ANTHROPIC_MODEL` | Model override | e.g. `claude-sonnet-4-6` |

> If using Anthropic directly (console.anthropic.com), set only `ANTHROPIC_KEY` and leave `ANTHROPIC_BASE_URL` and `ANTHROPIC_MODEL` unset — the code defaults to `claude-haiku-4-5`.

### Facebook page secrets

| Secret | Description | Where to find it |
|---|---|---|
| `FB_PAGE_ID_FR` | France Aujourd'hui Facebook page ID | Facebook page → About → Page ID |
| `FB_ACCESS_TOKEN_FR` | France page access token (permanent) | Meta for Developers → Graph API Explorer → get page token → exchange for permanent |
| `FB_PAGE_ID_IT` | Italia Oggi Facebook page ID | Facebook page → About → Page ID |
| `FB_ACCESS_TOKEN_IT` | Italy page access token (permanent) | Same process as FR |

**Getting a permanent page access token:**
1. Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Select your app → Generate Access Token → grant `pages_manage_posts`, `pages_read_engagement`
3. Click the page token dropdown → select your page
4. Go to [developers.facebook.com/tools/debug/accesstoken](https://developers.facebook.com/tools/debug/accesstoken) → Extend to get a 60-day user token
5. Call `GET /{page-id}?fields=access_token&access_token={60-day-token}` — the returned page token is permanent

### Image generation secrets

The active provider is set via the `IMAGE_PROVIDER` variable (see Variables section).
Add secrets for all providers you want to be able to switch between.

| Secret | Provider | Where to find it |
|---|---|---|
| `CF_ACCOUNT_ID` | Cloudflare (default) | Cloudflare dashboard → Workers & Pages → REST API → Account ID |
| `CF_API_TOKEN` | Cloudflare (default) | Cloudflare → My Profile → API Tokens → Create Token → Workers AI template |
| `GOOGLE_AI_KEY` | Google AI Studio | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| `POLLINATIONS_TOKEN` | Pollinations.ai | [enter.pollinations.ai](https://enter.pollinations.ai) — optional, removes rate limits |

---

## GitHub Actions — Variables

Navigate to: `Settings → Secrets and variables → Actions → Variables tab`

Variables are plain text (not encrypted) — use for non-sensitive config only.

| Variable | Current value | Description |
|---|---|---|
| `IMAGE_PROVIDER` | `cloudflare` | Active image generation provider: `cloudflare` / `google` / `pollinations` |
| `CF_IMAGE_MODEL` | *(blank)* | Cloudflare model override. Default: `@cf/black-forest-labs/flux-1-schnell` |
| `GOOGLE_IMAGE_MODEL` | *(blank)* | Google model override. Default: `gemini-2.0-flash-preview-image-generation` |
| `POLLINATIONS_MODEL` | *(blank)* | Pollinations model override. Default: `flux` |

**To switch image providers:** update `IMAGE_PROVIDER` variable — no code change or redeployment needed.

---

## Supabase Edge Function Secrets

The `generate-caption` edge function runs in Supabase's Deno runtime and cannot read GitHub Secrets. It has its own secret store.

Navigate to: Supabase dashboard → project `nnxtvbolhuvihlpwppbj` → Edge Functions → Manage secrets

| Secret | Description |
|---|---|
| `ANTHROPIC_KEY` | Same key as GitHub secret |
| `ANTHROPIC_BASE_URL` | Same as GitHub secret (if using proxy) |
| `ANTHROPIC_MODEL` | Same as GitHub secret (if using proxy) |

After changing any edge function secret, redeploy the function:
```bash
supabase functions deploy generate-caption
```

---

## Local development — `.env` file

Copy `.env.example` to `.env` and fill in all values. The `.env` file is gitignored and never committed.

```bash
SUPABASE_URL=https://nnxtvbolhuvihlpwppbj.supabase.co
SUPABASE_KEY=your_service_role_key

NEWSAPI_KEY=your_newsapi_key

ANTHROPIC_KEY=your_anthropic_key
ANTHROPIC_BASE_URL=https://api.oneprovider.dev
ANTHROPIC_MODEL=claude-sonnet-4-6

FB_PAGE_ID_FR=your_fr_page_id
FB_ACCESS_TOKEN_FR=your_fr_page_token
FB_PAGE_ID_IT=your_it_page_id
FB_ACCESS_TOKEN_IT=your_it_page_token

# Image generation (set IMAGE_PROVIDER to select active one)
IMAGE_PROVIDER=cloudflare
CF_ACCOUNT_ID=your_cf_account_id
CF_API_TOKEN=your_cf_api_token
GOOGLE_AI_KEY=your_google_ai_key
POLLINATIONS_TOKEN=your_pollinations_token
```

> The image generation secrets (`CF_*`, `GOOGLE_AI_KEY`, `POLLINATIONS_TOKEN`, `IMAGE_PROVIDER`) are required locally to run `preview-images.js` or `publish-slot.js`. They are also configured as GitHub Secrets/Variables for Actions workflows.

---

## Workflows and the secrets they use

| Workflow | Cron | Secrets used |
|---|---|---|
| `fetch.yml` — Fetch News Pipeline | Every hour (`:00`) | `SUPABASE_URL`, `SUPABASE_KEY`, `NEWSAPI_KEY`, `ANTHROPIC_KEY`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, `FB_PAGE_ID_*`, `FB_ACCESS_TOKEN_*` |
| `scrape-metrics.yml` — Engagement Scraper | Every hour (`:15`) | `SUPABASE_URL`, `SUPABASE_KEY`, `FB_ACCESS_TOKEN_FR`, `FB_ACCESS_TOKEN_IT` |
| `recompute-scores.yml` — Score Recompute | Every hour (`:30`) | `SUPABASE_URL`, `SUPABASE_KEY` |
| `publish.yml` — Slot Publisher | Every 15 min | All of the above + image generation secrets |

> `publish.yml` is currently **disabled** (paused via GitHub Actions UI). Re-enable when ready to post automatically.

---

## Security notes

- The repo is public — secrets are never exposed because GitHub encrypts them and only injects them at workflow runtime
- `SUPABASE_KEY` is the `service_role` key (bypasses Row Level Security) — treat it like a root password
- Facebook access tokens are permanent page tokens — if compromised, revoke them in Meta for Developers → Apps → your app → Tools → Revoke Token
- Cloudflare API token is scoped to Workers AI only — it cannot access other Cloudflare services
