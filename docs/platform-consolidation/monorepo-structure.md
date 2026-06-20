# content-platform — Monorepo Structure & Architecture

**Status:** ✅ Completed — skeleton scaffolded at `~/projects/personal/content-platform` (2026-06-20)
**Created:** 2026-06-20
**Supersedes the structure sketch in:** [plan.md](plan.md) (Decision 2). All other decisions in that doc still hold.

---

## 1. Goals this structure must satisfy

| # | Requirement | How the structure answers it |
|---|---|---|
| 1 | One repo for **all** automation pipelines (news, video, future content) | `apps/*` per content domain, `packages/*` for shared logic |
| 2 | Houses **both** video engines — FFmpeg+Kokoro+Whisper **and** Remotion — under a clean, non-tool-named layout | Engines live behind a render *contract* in `packages/render/{core,ffmpeg,remotion}`; apps never name a tool |
| 3 | Runs in Claude Code without dependency issues | npm workspaces (no exotic tooling), ESM everywhere except Angular/Remotion (TS), `.claude/` native discovery |
| 4 | MCPs placed strategically — project-wide + subgroup | Root `.mcp.json` (infra) + per-app `.mcp.json` (domain tools like Higgsfield) |
| 5 | Skills, commands, scripts, hooks as first-class assets | `.claude/{agents,skills,commands,hooks}` at root + per-app |
| 6 | External media providers (fal.ai, Higgsfield) integrated | fal.ai = programmatic REST in `packages/ai`; Higgsfield = MCP scoped to `apps/video` |
| 7 | Claude API integration matching current code | `packages/ai/claude.js` — configurable `ANTHROPIC_BASE_URL`/`ANTHROPIC_MODEL`, prompt caching |
| 8 | Scales to new content types without refactor | New content type = new `apps/<x>` + reuse packages; new render engine = new `packages/render/<x>` implementing the contract |

---

## 2. The two organising principles

This monorepo overlays **two** structures that serve different audiences:

**A. The software structure** (`apps/` + `packages/`) — for the *runtime*. Standard, professional monorepo: deployable apps consume shared libraries.

**B. The AI-asset structure** (`prompts/ · data/ · agents/ · evals/`) — for *Claude and you*. This is your reference 4-pillar pattern, applied **project-level + per-app** (your choice).

The mapping of the 4 pillars onto a Claude Code monorepo:

| Pillar (from your pattern) | Where it lives | Why |
|---|---|---|
| **prompts/** | literal `prompts/` folder, root + per-app | Versioned prompt files as assets, loaded by `packages/ai` |
| **data/** | literal `data/` folder, root + per-app | Inputs the AI reads (source catalogs, reference docs, fixtures) |
| **agents/** | realised as **`.claude/`** (agents, skills, commands, hooks) | `.claude/` is Claude Code's *native, executable* home for agents/skills/commands — using it (instead of a generic `agents/`) is what satisfies Goal #3. We treat `.claude/` as the "agents" pillar. |
| **evals/** | literal `evals/` folder, root + per-app | Proof the AI works — eval cases, traces, scorecards |

> Why `.claude/` instead of a plain `agents/` folder: a generic `agents/` directory is inert — Claude Code won't discover skills/commands/subagents/hooks from it. `.claude/` *is* the runnable form of the agents pillar. We keep the conceptual pillar, but bind it to the convention that actually executes.

---

## 3. Full directory tree

```
content-platform/
│
├── apps/                              # ── Runnable / deployable surfaces ──
│   │
│   ├── news/                          # News article pipeline (ex facebook-news-pipeline/src)
│   │   ├── src/
│   │   │   ├── config/sources.js      # countries: FR, IT, … (domain-only config)
│   │   │   ├── ingestion/             # rss.js, newsapi.js
│   │   │   ├── enrich/                # dedup, criticality, tagArticle, validators
│   │   │   ├── pipeline.js            # orchestrator
│   │   │   └── scripts/               # CLI entrypoints (generate-caption, publish-slot, …)
│   │   ├── prompts/                   # news-specific task prompts (caption, SEO, image)
│   │   ├── data/                      # news fixtures / reference (optional)
│   │   ├── evals/                     # caption-quality eval cases for news
│   │   ├── resources/                 # ★ domain-specific resources (see §4b)
│   │   │   ├── brand/                 #   page logos, watermarks, banners (FR/IT pages)
│   │   │   ├── research/              #   source audits, audience/gap analyses, Grok reports
│   │   │   └── docs/                  #   news-only strategy & reference docs
│   │   ├── .claude/                   # news-scoped skills/commands
│   │   │   ├── skills/                # fetch-news, review-articles, generate-post, …
│   │   │   └── commands/
│   │   ├── .mcp.json                  # news-scoped MCP (lean; usually inherits root)
│   │   ├── package.json               # @content-platform/news
│   │   └── README.md
│   │
│   ├── video/                         # Unified video pipeline (reels + documentary)
│   │   ├── src/
│   │   │   ├── config/channels.js     # per-channel: { engine, mode, voice, brand }
│   │   │   ├── ingestion/             # stock.js (pexels/pixabay), ai-image.js (fal),
│   │   │   │                          #   ai-video.js (seedance/higgsfield)
│   │   │   ├── script/                # scene script + narration generation (calls packages/ai)
│   │   │   ├── pipeline.js            # ingest → narrate → render(engine) → publish
│   │   │   └── scripts/               # CLI: generate-reel, generate-documentary, preview-reel
│   │   ├── prompts/                   # scene/script/narration prompts
│   │   ├── data/
│   │   ├── evals/
│   │   ├── resources/                 # ★ domain-specific resources (see §4b)
│   │   │   ├── brand/                 #   NaturePulse/NatureFrame logos, watermarks, banners
│   │   │   ├── research/              #   sports/World Cup gap analysis, fan opportunity maps
│   │   │   └── docs/                  #   video-styles, render reference, channel playbooks
│   │   ├── .claude/
│   │   │   ├── skills/                # render-reel, preview-reel, …
│   │   │   └── commands/
│   │   ├── .mcp.json                  # video-scoped MCP (reserved for future niche servers)
│   │   ├── package.json               # @content-platform/video
│   │   └── README.md
│   │
│   └── dashboard/                     # Angular review dashboard (Vercel) — unchanged stack
│       ├── src/
│       ├── package.json               # @content-platform/dashboard
│       └── ...
│
├── packages/                          # ── Shared libraries (importable, no side effects) ──
│   │
│   ├── ai/                            # Claude + image-gen + prompt loading
│   │   ├── claude.js                  # configurable baseURL/model client (see §6)
│   │   ├── prompts.js                 # loads versioned files from prompts/ + caches
│   │   ├── image-gen/
│   │   │   ├── index.js               # provider router: fal → cloudflare → google
│   │   │   ├── fal.js                 # ★ fal.ai REST (primary) — Recraft V3 / FLUX
│   │   │   ├── cloudflare.js          # fallback
│   │   │   └── google.js              # fallback
│   │   └── package.json               # @content-platform/ai
│   │
│   ├── render/                        # ── Video rendering behind ONE contract ──
│   │   ├── core/                      # @content-platform/render-core
│   │   │   ├── timeline.js            # Scene/Timeline data model (engine-agnostic)
│   │   │   ├── engine.js              # RenderEngine interface + registry
│   │   │   └── index.js              # render(timeline, { engine }) → routes to impl
│   │   ├── ffmpeg/                    # @content-platform/render-ffmpeg
│   │   │   ├── index.js               # implements RenderEngine via FFmpeg
│   │   │   ├── kenburns.js            # zoompan for static images
│   │   │   └── concat.js
│   │   └── remotion/                  # @content-platform/render-remotion (TS/React)
│   │       ├── src/Root.tsx           # registerRoot — Remotion entrypoint
│   │       ├── src/compositions/      # <NewsCard/>, <DocumentaryScene/>, <Reel/>
│   │       ├── src/render.ts          # implements RenderEngine via @remotion/renderer
│   │       ├── remotion.config.ts
│   │       └── tsconfig.json
│   │
│   ├── media/                         # @content-platform/media
│   │   ├── tts.py                     # Kokoro wrapper (shared by ffmpeg engine)
│   │   ├── subtitles.js               # Whisper word-timestamps → burn-in / SRT
│   │   ├── composite.js               # Canvas image compositing (watermark + Anton font)
│   │   └── storage.js                 # Cloudflare R2 + Supabase Storage adapters
│   │
│   ├── database/                      # @content-platform/database
│   │   ├── supabase.js                # shared client
│   │   ├── articles.js                # news CRUD
│   │   └── content-items.js           # video CRUD
│   │
│   ├── publishers/                    # @content-platform/publishers
│   │   ├── index.js                   # fanout router
│   │   ├── facebook.js                # Graph API v22.0 (merged, was duplicated)
│   │   ├── instagram.js  youtube.js  tiktok.js
│   │
│   ├── config/                        # @content-platform/config  ── portability core ──
│   │   ├── env.js                     # loads root .env, validates required keys, typed getters
│   │   └── schema.js                  # declared env contract (per app + shared)
│   │
│   └── types/                         # @content-platform/types — shared JSDoc typedefs
│       ├── article.js   content-item.js   timeline.js
│
├── prompts/                           # ── PILLAR 1: shared prompt assets ──
│   ├── system/                        # content-system.v3.md (the big shared system prompt)
│   ├── tasks/                         # cross-app task prompts
│   └── tools/                         # tool/JSON-schema prompt fragments
│
├── data/                              # ── PILLAR 2: shared inputs / reference ──
│   ├── inputs/                        # raw inputs the pipeline reads
│   └── reference/                     # brand voice, country style guides, taxonomies
│
├── evals/                             # ── PILLAR 4: cross-app eval harness ──
│   ├── cases/                         # golden inputs + expected shape, per app subfolder
│   ├── traces/                        # recorded model runs
│   ├── scorecards/                    # pass/fail summaries
│   └── run.js                         # eval runner (node evals/run.js news)
│
├── .claude/                           # ── PILLAR 3 (agents) — project-wide, native ──
│   ├── agents/                        # subagent definitions (e.g. content-reviewer.md)
│   ├── skills/                        # cross-cutting skills
│   ├── commands/                      # /plan (master plan manager) + cross-cutting commands
│   ├── hooks/                         # hook scripts (env-check, secret-guard, prompt-lint)
│   └── settings.json                  # hook wiring + permission allowlist
│
├── .mcp.json                          # ── project-wide MCP servers (see §5) ──
│
├── supabase/
│   ├── functions/                     # generate-caption, generate-image (Deno edge)
│   └── migrations/                    # merged from both projects
│
├── assets/                            # SHARED media used by >1 app (per-page brand → apps/*/resources/brand)
│   ├── music/                         # all tracks
│   ├── logos/                         # shared/platform logos
│   └── fonts/                         # Anton, etc. (served to dashboard + render)
│
├── scripts/                           # repo-level dev/ops (not app CLIs): bootstrap, lint, ci
├── docs/                              # platform docs (this tree)
│   ├── research/                      # cross-cutting research (multi-country, platform-wide)
│   └── strategy/                      # cross-cutting strategy
│       # NOTE: domain-specific research/docs/brand live in apps/<x>/resources/ (see §4b)
├── .github/workflows/                 # fetch-news.yml, fetch-reels.yml, ci.yml
│
├── package.json                       # npm workspaces root
├── .env.example                       # all vars, merged (see §6)
├── .gitignore                         # ignores .env, output/, /tmp render caches
└── README.md
```

---

## 4. Why the video layout is engine-agnostic (your key concern)

You rejected a `video-pipeline/` (FFmpeg) vs `video-remotion/` (Remotion) split — correctly, because that names folders after *tools* and forces a hard fork. Instead:

- **`apps/video`** is the single domain app. It knows about *channels, scenes, narration, publishing* — never about FFmpeg or Remotion.
- **`packages/render/core`** defines a `RenderEngine` contract and a `Timeline` model. Everything upstream produces a `Timeline`.
- **`packages/render/ffmpeg`** and **`packages/render/remotion`** are two interchangeable *implementations* of that contract.
- The engine is selected **per channel in config**, not by directory:

```js
// apps/video/src/config/channels.js
export const channels = {
  naturePulse:  { engine: 'ffmpeg',   mode: 'stock',    voice: 'af_bella' },
  viviInItalia: { engine: 'remotion', mode: 'ai-image', brand: 'italia'   },
};
```

```js
// apps/video/src/pipeline.js
import { render } from '@content-platform/render-core';
const timeline = await buildTimeline(channel, scenes);
const mp4 = await render(timeline, { engine: channel.engine });   // routes internally
```

**Adding a 3rd engine later** (e.g. cloud render, AE-template) = add `packages/render/<new>` implementing `RenderEngine`, register it, reference it in a channel. Zero changes to `apps/video`. That is the no-refactor scalability you asked for.

> FFmpeg-specific helpers (Kokoro TTS, Whisper) live in `packages/media` because they're useful to *any* engine that wants narration/subtitles, not just FFmpeg.

---

## 4b. Where domain resources live (research, docs, logos)

The previous two repos had no consistent home for non-code domain material — brand logos, audience research, gap analyses, page playbooks ended up scattered. The fix is a **`resources/` folder inside each app**, plus a clear shared/specific split:

| Material | Shared (used by >1 app) | Domain-specific (one app) |
|---|---|---|
| Logos / watermarks / banners | `assets/logos`, `assets/fonts` | `apps/<x>/resources/brand/` |
| Music | `assets/music` | — |
| Research (audits, gap analyses, competitor maps) | `docs/research/` | `apps/<x>/resources/research/` |
| Strategy / playbooks / reference docs | `docs/strategy/`, `docs/` | `apps/<x>/resources/docs/` |
| AI inputs / fixtures / taxonomies | `data/` | `apps/<x>/data/` |

Rule of thumb: **if only one app cares about it, it belongs in that app's `resources/`; if two or more do, it's shared at root.** This keeps each app self-contained (you can reason about `apps/news` without the rest of the repo) while avoiding duplication of genuinely shared assets.

---

## 5. MCP placement & scope

Claude Code discovers MCP servers from the `.mcp.json` at the directory you launch it from (the session's project root), plus your user/global config. We exploit that for **scoping**:

### Project-wide — root `.mcp.json`
Always-on servers, relevant across *every* app and used on multiple pages:

| Server | Purpose |
|---|---|
| `supabase` | DB, edge functions, migrations, queries |
| `github` | repos, PRs, issues, Actions |
| `context7` | library/docs context |
| `sequential-thinking` | complex reasoning |
| `filesystem` | scoped file access |
| `memory` | cross-session persistence |
| `higgsfield` | ★ image / video / audio generation, virality predictor, upscale, reframe — **root-level** because you use it across multiple pages (news images, video scenes, audio), not video-only |

### Subgroup — per-app `.mcp.json`
The per-app `.mcp.json` files stay in the tree but are kept **lean** — reserved for servers that are genuinely relevant to only one domain and heavy enough to be worth excluding elsewhere. None are required at launch (Higgsfield graduated to root). They're the extension point for future niche tools (e.g. a sports-stats MCP scoped to `apps/video`).

### Deliberately **not** an MCP: fal.ai
fal.ai is wired as a **programmatic REST client** in `packages/ai/image-gen/fal.js` because it runs *inside the automated pipeline* (cron, batch, `Promise.all` fan-out) — it must work without a human/agent in the loop. Higgsfield is exposed as an MCP because it's used **interactively/agentically** (you or Claude generating/iterating on media by hand). This is the clean rule:

> **Programmatic, in-pipeline provider → package. Interactive, agent-driven provider → MCP.**

### Pre-approving MCP tools
`.claude/settings.json` (root and per-app) lists permission allowlists so common MCP/Bash calls don't prompt — e.g. allow `supabase` read tools project-wide, allow `higgsfield` generate tools only in `apps/video`.

---

## 6. Configuration & environment portability

### Single source of truth
One root `.env` (gitignored) + committed `.env.example`. All apps load it through `packages/config/env.js` — no app reads `process.env` directly for required keys.

```js
// packages/config/env.js  (sketch)
import 'dotenv/config';               // resolves to repo-root .env via workspace
import { schema } from './schema.js';

export const env = validate(process.env, schema);  // throws on missing required keys at startup
```

This gives portability + fail-fast: a misconfigured Fly.io / GitHub Action / local shell errors loudly instead of producing half-generated content.

### Claude integration point — `packages/ai/claude.js`
Matches your **current** code (already in `src/services/claude.js`), promoted to a package:

```js
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@content-platform/config';

const client = new Anthropic({
  apiKey: env.ANTHROPIC_KEY,
  ...(env.ANTHROPIC_BASE_URL && { baseURL: env.ANTHROPIC_BASE_URL }), // proxy when set
});
const MODEL = env.ANTHROPIC_MODEL || 'claude-haiku-4-5';

// oneprovider.dev double-encodes responses as a JSON string — normalise.
const parse = (r) => (typeof r === 'string' ? JSON.parse(r) : r);
```

- **Default:** direct Anthropic + Haiku 4.5 (cheap, cached).
- **Proxy mode:** set `ANTHROPIC_BASE_URL=https://api.oneprovider.dev` + `ANTHROPIC_MODEL=claude-sonnet-4-6` and the same code routes through the proxy. The `parse()` shim handles oneprovider's double-encoding.
- System prompt is loaded from `prompts/system/content-system.v3.md` via `packages/ai/prompts.js`, with `cache_control: { type: 'ephemeral' }` preserved so caption + SEO share one cache entry (and the Deno edge function keeps its verbatim copy).

### fal.ai integration point — `packages/ai/image-gen/fal.js`
```js
import { env } from '@content-platform/config';
// REST call to fal.ai queue; key from env.FAL_KEY; model Recraft V3 (editorial) by default.
// index.js wraps it in the router: fal → cloudflare → google, returns image bytes.
```

### Env reference (merged)
Full list already enumerated in [plan.md §Environment Variables](plan.md). New additions for this design:

```bash
# Claude routing (proxy-capable)
ANTHROPIC_KEY=
ANTHROPIC_BASE_URL=          # optional; unset = direct api.anthropic.com
ANTHROPIC_MODEL=             # optional; unset = claude-haiku-4-5

# Media providers
FAL_KEY=                     # fal.ai (programmatic, packages/ai)
# Higgsfield is OAuth via its MCP — no key in .env
```

---

## 7. File naming & module conventions

| Concern | Convention |
|---|---|
| Workspace package names | `@content-platform/<name>` (e.g. `@content-platform/render-core`) |
| Folders | lowercase-kebab (`image-gen`, `render-core`) |
| Node source | **ESM only** (`import`/`export`), plain JS — matches current repo rule |
| TypeScript | only where the framework demands it: `apps/dashboard` (Angular), `packages/render/remotion` (Remotion). Each isolated with its own `tsconfig.json` |
| Python | `packages/media/tts.py` only (Kokoro); invoked as subprocess, not imported |
| Prompt files | versioned, content-addressable names: `content-system.v3.md`, `scene-script.v1.md` |
| Eval cases | `evals/cases/<app>/<name>.json` |
| CLI entrypoints | `apps/<x>/src/scripts/<verb>-<noun>.js` |
| No comments | unless documenting a non-obvious constraint (current rule kept) |

---

## 8. Why this scales (sustainability rationale)

| Future need | What you add | What you DON'T touch |
|---|---|---|
| New content type (e.g. infographics) | `apps/infographics/` + reuse `packages/ai,media,database,publishers` | existing apps |
| New render engine (cloud / AE) | `packages/render/<engine>` implementing `RenderEngine` | `apps/video` |
| New country page | row in `apps/news/src/config/sources.js` + env keys | code |
| New platform (IG/YT/TT) | `packages/publishers/<platform>.js` | pipelines |
| New AI provider (programmatic) | file in `packages/ai/image-gen/` + router entry | callers |
| New AI provider (interactive) | entry in the relevant `.mcp.json` | code |
| Build caching when slow | add Turborepo over npm workspaces | structure |

The invariant: **apps orchestrate, packages implement, contracts decouple them, `.claude/` + `.mcp.json` + the 4 pillars make the whole thing legible to Claude.**

---

## 9. Decisions (resolved 2026-06-20)

1. **Repo location** — ✅ Fresh repo `~/projects/personal/content-platform`. Migrate code in, archive the old two repos for 30 days (don't delete).
2. **Remotion default scope** — ✅ Start with one composition (`<NewsCard/>`) to prove the `RenderEngine` contract before porting other formats.
3. **Dashboard** — ✅ Keep Angular as-is in `apps/dashboard`. Out of scope now (separate plan owns any rebuild).

### Runtime modes (architectural note)

The platform is designed to run in two complementary modes — this is *why* the MCP-vs-package split matters:

| Mode | Where | How AI/media is reached |
|---|---|---|
| **Interactive (web)** | claude.ai / Claude Code | **MCP servers** (Higgsfield, Supabase, GitHub…) — agent-driven, human in the loop |
| **Automated (local WSL / cron)** | pipeline runs on WSL + GitHub Actions | **Direct API calls** (`packages/ai`, fal.ai REST) **+ Supabase edge functions** — unattended |

The same business logic (`packages/*`) serves both. MCPs add an interactive surface on top; they're never a dependency of the automated path. This is the rule from §5 (programmatic→package, interactive→MCP) viewed from the runtime angle.

---

## 10. Next step

Review this structure. On approval I will scaffold the skeleton (empty/stub packages, `package.json` workspace wiring, root + per-app `.mcp.json`, `.claude/` dirs, `.env.example`, READMEs) — **no business-logic migration yet**; that stays a separate workstream per [plan.md migration steps](plan.md).

Run `/plan start monorepo` is already in progress (status set to 🚧). When the skeleton is scaffolded and verified, run `/plan update monorepo done` after migration completes.
```

