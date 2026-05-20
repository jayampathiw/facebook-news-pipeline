# Implementation Plan — France & Italy Content Gap Closure

**Date:** 2026-05-19
**Source documents analysed:**
- `docs/strategy/fr-content-gap-analysis-2026-05-18.md`
- `docs/strategy/it-content-gap-analysis-2026-05-18.md`

**Strategy resolutions referenced:**
- `docs/strategy/gap-coverage-evaluation-2026-05-18.md` (decision audit)
- `docs/strategy/implementation-questions-2026-05-18.md` (design specs Q1–Q6 + Open Decisions)

**Pipeline state at start of plan:** Nothing from these gap analyses has been shipped to code yet. All work below is open and sequenced by dependency.

---

## Phase 1 — Gap Evaluation Summary

### Every gap, every status, every owner

| # | Gap (origin) | Doc(s) | Resolution status | Implementation status | Phase |
|---|---|---|---|---|---|
| 1 | `intro` / `question` / `cta` NULL on every posted article | FR P0-1, IT P0-2 | ✅ Design locked | ✅ Shipped 2026-05-19 | A — Week 1 |
| 2 | `posted_at` + `fb_post_id` NULL on every posted article (write-back bug) | FR §4.6, IT P0-3 | ✅ Design locked | ✅ Shipped 2026-05-19 | A — Week 1 |
| 3 | English `image_headline` on FR/IT pages | FR P0-2, IT P0-4 | ✅ Design locked | ✅ Shipped 2026-05-19 | A — Week 1 |
| 4 | `seed_comment` template repeats verbatim (8× FR, 5× IT) | FR P0-3, IT P0-5 | ✅ Design locked | ✅ Shipped 2026-05-19 | A — Week 1 |
| 5 | `ADS_POLITICS_01` / `ADS_WEAPONS_01` / `ADS_DRUGS_01` over-blocking | FR P1-5, IT P0-1 | ✅ Decision 2 (2026-05-19): `boost_eligible` flag, **Italy-first**, FR after 30-day window | ✅ Shipped 2026-05-19 | A — Week 1 (IT) / F — Week 5+ (FR) |
| 6 | `FR_LEGAL_01` over-blocking | FR P0/Appendix B | 🟡 Design locked (presumption-language rewrite); external press-law specialist required pre-launch | 🔴 Not started | E — pre-launch gate |
| 7 | Local-France source coverage (0 of 23 are pure domestic) | FR P1-4 | ✅ D3a (2026-05-19): free-RSS only; licensed sources deferred until ROI proven | ✅ Shipped 2026-05-19 | A — Week 1 |
| 8 | Local-Italy regional coverage (Modena miss) | IT P1-7 | ✅ D3b (2026-05-19): center-left center-of-gravity; Phase-1 RSS set deploys | ✅ Shipped 2026-05-19 | A — Week 1 |
| 9 | Criticality scorer not biased to FR/IT place names | FR P1-4, IT P1-7 | ✅ Design locked | ✅ Shipped 2026-05-19 | A — Week 1 |
| 10 | Engagement metrics (likes / comments / shares) not scraped | FR App C, IT App D, R2 | ✅ R2 (2026-05-19): Week 2 — hourly Graph API → `post_metrics` | ✅ Shipped 2026-05-19 | B — Week 2 |
| 11 | Tone: analytical-neutral captions vs identity-loaded market | FR §1, IT §1, Q4 | ✅ Q4 five-change spec locked | ✅ Shipped 2026-05-19 | C — Week 3 |
| 12 | Italian binary framing for crime + foreign-suspect | IT P1-8 | ✅ Q4.5 + Q5 `binary_frame` | ✅ Shipped 2026-05-19 | C — Week 3 |
| 13 | Protagonist-naming requirement | IT P1-8 | ✅ Q4.3 + Q5 `protagonist_named` | ✅ Shipped 2026-05-19 | C — Week 3 |
| 14 | Legal-citation hooks (`art. 595 c.p.`) for Italy | IT P1-8 | ✅ Q4.5 + Italian seed_comment templates | ✅ Shipped 2026-05-19 | C — Week 3 |
| 15 | Front-load FR/IT stake on international stories | FR §3, IT §3 | ✅ Q4.2 | ✅ Shipped 2026-05-19 | C — Week 3 |
| 16 | Binary-close instead of essay prompts | FR §3, IT §3 | ✅ Q4.4 | ✅ Shipped 2026-05-19 | C — Week 3 |
| 17 | `content_signals` classifier (6-field schema extension) | Implied across Q5 | ✅ Q5 spec locked | ✅ Shipped 2026-05-19 | C — Week 3 |
| 18 | Breaking-news cluster detector (Modena miss) | IT P1-6 | ✅ Q6 + extend `dedup.js` | ✅ Shipped 2026-05-19 | C — Week 4 |
| 19 | Cron-blind posting; no slot discipline | FR P2-10, IT P2 | ✅ Q6 fixed slots (3 FR / 4 IT) | ✅ Shipped 2026-05-19 | D — Week 4 |
| 20 | No content-pillar mix enforcement | FR §4.4, IT §4.4 | ✅ Q6 weekly pillar quotas + `pillar_quota_factor` | ✅ Shipped 2026-05-19 | D — Week 4 |
| 21 | No `publish_score` — articles publish in whatever order they appear | Q6 | ✅ Q6 formula locked | ✅ Shipped 2026-05-19 | D — Week 4 |
| 22 | 30-day IT validation window for `boost_eligible` | Decision 2 | ✅ Window defined (Week 5–10) | ✅ Code shipped 2026-05-19; window opens on first IT boost_ineligible post | E — Week 5 onwards |
| 23 | Reels production (0/23 FR, 0/19 IT vs 4/10 market) | FR P1-6, IT P2-10 | ✅ Q1: FFmpeg + Kokoro + Whisper local stack (Open Decision 1 — pending Kokoro multilingual voices download) | 🔴 Not started | F — Month 2 |
| 24 | Binary-poll caption variant + image overlay | FR P2-7 | ✅ Q4.4 + `ai_caption.poll` extension | 🔴 Not started | F — Month 2 |
| 25 | Image carousel renderer (Italy `Capire la legge` pillar) | IT format gaps | ✅ C3 (2026-05-19): Remotion (sibling to Q1 Reel renderer) | 🔴 Not started | F — Month 2 |
| 26 | Day-2+ story arc tracking (Modena Day 2–7) | IT App D | ✅ W1 (2026-05-19): Month 2 — `story_arc_id` + 7-day rolling dedup + R2-driven priority | 🔴 Not started | F — Month 2 |
| 27 | Evergreen story tables (30 entries × 2 countries) | FR P2-8, IT §4.4 | ✅ C1 (2026-05-19): AI-assisted curation (50 candidates → user-reviewed 30) | 🔴 Not started | F — Month 2 |
| 28 | Lifestyle / fierté française sources (Le Bonbon, Dissapore) | FR P2-9, IT §4 | ✅ C4 (2026-05-19): ~2h investigation when triggered | 🔴 Not started | G — Month 2+ |
| 29 | A/B testing of caption variants | FR App C, IT App D, R3 | ✅ R3 (2026-05-19): cross-country natural experiment (NOT formal A/B framework) | 🔴 Not started | F — Month 2 (post-R2) |
| 30 | Italy editorial positioning | IT P2-9 | ✅ D3b implies curatorial-sharp + utility secondary | ✅ Locked in strategy; informs all content work | (cross-cutting) |
| 31 | Italy sister-page strategy | IT P3-12 | ✅ W2 (2026-05-19): single-page; revisit at 10k engaged-follower milestone | 🟡 Milestone-gated | H — milestone trigger |
| 32 | Named editorial voice (Belpietro-class) | IT P3, IT format gaps | ✅ R1 (2026-05-19): accepted as ceiling; Month 6+ revisit gate | 🟡 Time-gated | H — Month 6+ |
| 33 | Citizen-led nationalism content | FR §1, IT §1 | ✅ R1 (2026-05-19): accepted permanent ceiling | ⚪ No action | (closed) |
| 34 | Hyper-local partisan framing (Lega-style) | IT §1 | ✅ R1 (2026-05-19): accepted permanent ceiling (conscious choice via D3b) | ⚪ No action | (closed) |
| 35 | Expert / personality public shaming (Bassetti) | IT §1 | ✅ R1 (2026-05-19): accepted, unblocks with named-editor revisit | ⚪ No action until Month 6+ | (closed for now) |
| 36 | Citizen / raw video footage repackaging | FR §1, IT P1 | ✅ R1 (2026-05-19): accepted permanent ceiling (copyright) | ⚪ No action | (closed) |
| 37 | Opinion-text format (Belpietro-style) | IT format gaps | ✅ C2 (2026-05-19): defer until R2 engagement data + named-editor positioning | 🟡 Conditionally gated | H — Month 6+ |
| 38 | Satirical voice (Le Gorafi-style) | FR P3-11 | ✅ Accepted P3 gap; not pursued | ⚪ No action | (closed) |

### Summary

| Status | Count | Notes |
|---|---|---|
| ✅ Strategy resolved, ready to implement | 31 | Bulk of the work |
| 🟡 Conditionally gated (external review / milestone / time) | 4 | Items 6, 31, 32, 37 |
| ⚪ Closed (accepted ceiling, no action) | 5 | Items 33, 34, 35 (current state), 36, 38 |

**Bottom line:** ~95% of identified gaps are *strategy-ready and implementation-pending*. The plan below covers all 31 implementation-ready gaps in dependency order, plus the conditional checks for the 4 gated items.

---

## Phase 2 — Implementation Plans (in execution order)

Each gap below is a section. Tasks within a gap are ordered for sequential execution. Acceptance criteria are explicit so each task can be marked done without ambiguity.

---

### Phase A — Foundation (Week 1)

Hard prerequisites for measurement, validation, and every downstream improvement. ~3 days of code total.

---

#### Gap A.1 — Repair the caption pipeline (`intro` / `question` / `cta` writing)

**Why it matters:** all 23 FR + 19 IT posted articles have `ai_caption.intro/question/cta = NULL`. The schema, prompt, and dashboard expect these fields — the generator just isn't writing them. Combined with the duplicate seed_comment template, the page reads templated and impersonal. **Doubles caption surface area on completion.**

- [x] **Audit `src/services/claude.js` `generateCaption()`** — confirmed schema was missing `intro`/`question`/`cta`.
- [x] **Updated `CONTENT_SYSTEM_PROMPT`** — response format changed from `{caption}` to `{intro, question, cta}` with updated example. `generateCaption()` parsing updated to match.
- [x] **DB write step fixed** — `generate-caption.js` and `generate-captions-batch.js` now store `ai_caption: { intro, question, cta }`.
- [x] **Mirrored in edge function** — `supabase/functions/generate-caption/index.ts` response format + `generateAllContent()` return updated.
- [ ] **Run on a sample article** locally (`node src/scripts/generate-caption.js <id>`) and confirm DB row has all three fields populated. *(user action)*
- [ ] **Regenerate existing posted articles** (optional legacy backfill). *(user decision)*
- [ ] **Deploy edge function**: `cd supabase && supabase functions deploy generate-caption`. *(user action)*

**Acceptance:** every newly-generated article has non-NULL `intro`, `question`, `cta` in `ai_caption`. Dashboard's Caption tab renders all three fields. A re-run on a regenerated article shows freshly-populated values.

---

#### Gap A.2 — Repair the post write-back (`posted_at` + `fb_post_id`)

**Why it matters:** all 19 IT and all 23 FR posted articles have `posted_at = NULL` and `fb_post_id = NULL`. Without these fields, **none** of the downstream measurement work is possible (R2 engagement scraper has nothing to scrape; D2 validation has nothing to validate; Q5 calibration has no data). This is the single most foundational fix.

- [x] **Verified `post-with-image.js`** — confirmed `postToFacebook` returns `{ id }` from Graph API.
- [x] **Added `posted_at` write-back** — `post-with-image.js` now writes `{ status, fb_post_id, posted_at }` together.
- [x] **Wrapped DB update in try/catch** — transient DB failure no longer surfaces as a failed Facebook post.
- [x] **Created migration `005_add_posted_at.sql`** — `posted_at TIMESTAMPTZ` column.
- [ ] **Apply migration 005 to production** (`supabase/migrations/005_add_posted_at.sql` → SQL editor). *(user action)*
- [ ] **Smoke test** by posting one approved article and confirming `posted_at` and `fb_post_id` are both non-null. *(user action)*
- [ ] **Backfill option (optional):** leave 42 historic articles as pre-instrumentation legacy.

**Acceptance:** the next post that fires writes both fields. A SELECT on `articles WHERE status='posted' AND posted_at IS NULL` returns zero rows for posts published after the fix lands.

---

#### Gap A.3 — Enforce target-language `image_headline` (French only / Italian only)

**Why it matters:** ~6 of 23 FR posts have English overlays (*"Climate crisis acceleration threat"*, *"Hisense Built-in Oven: Smart Deal"*). ~5 of 19 IT posts have English overlays (*"Cinema: Pain and Desire"*, *"Cannes Film Festival Spotlight"*). On a French-/Italian-language page this breaks the page contract instantly.

- [x] **Added hard language rule to `generateImagePrompt()`** — now accepts `captionLanguage` parameter; prompt says "MUST be written in [lang]. NEVER use English." Root cause fixed: language wasn't passed to the image call at all, so Claude was guessing from the article content (often English).
- [x] **Added English-stopword retry loop** — `generateImagePrompt()` checks for `\b(the|and|of|for|has|have...)\b` stopwords and retries up to 2 times, logging each retry to stderr. Retry only fires for `français` / `italiano`.
- [x] **Updated all callers** — `generate-caption.js`, `generate-captions-batch.js`, `generate-image.js` all pass `config.captionLanguage`. Fixed pre-existing bug in `generate-image.js` (was passing the whole return object instead of `.prompt` to `formatImagePrompt`).
- [x] **Mirrored in edge function** — language rule added to image prompt; English-stopword warning log added (retry loop not added to edge function — parallel `Promise.all` pattern makes it impractical; Node path handles it).
- [ ] **Test**: regenerate one Hisense-oven article (FR) and one Cannes article (IT), confirm `image_headline` is in the correct language. *(user action)*
- [ ] **Sanity check**: `SELECT id, country, image_headline FROM articles WHERE country IN ('FR','IT') AND image_headline ~* '\y(the|and|of|for)\y';` — should return 0 rows for newly generated articles. *(user action)*

**Acceptance:** after regeneration, 0 of the next 20 generated articles for FR or IT have an English `image_headline`. The regex retry mechanism logs each retry to stderr so we can monitor false-positive rate.

---

#### Gap A.4 — Rotate `seed_comment` templates

**Why it matters:** the same generic *"💬 Et vous, qu'en pensez-vous ?..."* line appears verbatim on 8 of 23 FR posts. *"💬 E voi, che ne pensate?..."* repeats 5+ times across IT. Audiences notice repetition fast; the page reads bot-templated.

- [x] **Built `SEED_COMMENT_TEMPLATES` constant** in `claude.js` — 10 FR + 10 IT templates, each with `{topic_noun}` placeholder. `voi` register for IT (consistent). Templates exported for re-use by tests or analytics.
- [x] **No-repeat enforcement** — `getRecentSeedComments(country)` queries last 20 `seed_comment_template_id` values per country. `pickEligibleTemplates()` filters them out. If all 10 are recent (batch of 10+), fallback to full pool.
- [x] **Batch cache** — `generate-captions-batch.js` queries once per country, then pushes each new template ID into the in-memory list so articles later in the same run also avoid repeats.
- [x] **Prompt extended** — eligible templates injected into the caption user message; Claude fills `{topic_noun}` and returns `seed_comment_template_id`.
- [x] **`CONTENT_SYSTEM_PROMPT` seed comment section updated** (both `claude.js` and edge function verbatim copy).
- [x] **Migration `006_seed_comment_template_id.sql`** — `seed_comment_template_id TEXT` column.
- [x] **Edge function mirrored** — `SEED_COMMENT_TEMPLATES`, `pickEligibleTemplates()`, DB query for recent IDs, in-loop cache update.
- [ ] **Apply migration 006 to production**. *(user action)*
- [ ] **Deploy edge function**: `supabase functions deploy generate-caption`. *(user action)*

**Acceptance:** over the next 20 newly-generated FR articles, no two adjacent (by `posted_at`) share the same first 30 chars of `seed_comment`. Same for IT. `seed_comment_template_id` is populated.

---

#### Gap A.5 — `boost_eligible` flag (Italy first, France after 30-day window)

**Why it matters:** the single highest-leverage strategic fix. Unblocks ~27 IT articles/month immediately and ~32 FR articles/month after the validation window. Resolves 8+ themes (Italian government beat, judicial scandals, FR street crime, celebrity politics, 2027 campaign signalling, FR local breaking safety).

- [x] **Write migration `007_boost_eligible.sql`** — `boost_eligible boolean NOT NULL DEFAULT true` + index.
- [x] **Updated `src/validators/contentValidator.js`** — `BOOST_INELIGIBLE_RULES` set (`ADS_POLITICS_01`, `ADS_WEAPONS_01`, `ADS_DRUGS_01`); IT articles return `{ valid: true, boostEligible: false }` instead of hard-blocking. FR continues to hard-block. `FR_LEGAL_01` unchanged.
- [x] **Added `BOOST_ELIGIBLE_ENFORCED` constant** in `src/services/facebook.js` — `{ IT: true, FR: false }` documents intent; publishing function reference.
- [x] **Propagated `boost_eligible: false`** in `src/pipeline.js` — spreads into the validated article object when `check.boostEligible === false`.
- [x] **Added `boost_eligible` and `seed_comment_template_id`** to `Article` interface in `dashboard/src/app/core/supabase.service.ts`.
- [ ] **Apply migration 007 to production** (`supabase/migrations/007_boost_eligible.sql` → SQL editor). *(user action)*
- [ ] **Validate**: run `node src/pipeline.js` and check that previously-blocked IT political/weapons/drugs articles now appear in `pending` with `boost_eligible=false`. *(user action)*
- [ ] **Confirm FR is unchanged**: verify FR articles with `ADS_POLITICS_01` matches still go to `blocked`. *(user action)*
- [ ] **Document the 30-day window**: start date = first IT post with `boost_eligible=false` published organically. After +30 days with zero policy strikes on ItaliaOggi → flip `FR: false` to `FR: true` in `BOOST_ELIGIBLE_ENFORCED`. *(user action, Week 5+)*
- [ ] **Do NOT flip FR yet.** FR rollout is Gap E.1 after the window completes.

**Acceptance:** for IT, the next pipeline run produces non-zero pending articles with `boost_eligible=false`. The Facebook publisher posts them organically (no boost). Dashboard shows the column. FR pipeline behavior is unchanged.

---

#### Gap A.6 — Add free-RSS French sources

**Why it matters:** 0 of 23 FR posted articles are pure domestic; D3a resolved 2026-05-19 with free-RSS-only at launch. Adds ~60% local-France coverage with zero legal exposure.

- [x] **Added 20 Minutes, Reporterre, Le Parisien, Actu.fr, Bondy Blog** to `src/config/sources.js` FR block. Each entry marked as "A.6 additions — free-license RSS only (D3a decision)".
- [x] **Documented deferred licensed sources** in a comment block in `sources.js`: AFP wire, Reuters FR, Le Point, L'Express, Courrier International deferred (D3a).
- [ ] **Verify each RSS URL** returns valid XML (`curl` each URL). Bondy Blog and Actu.fr especially need a live check. *(user action)*
- [ ] **Update `supabase/functions/generate-caption/index.ts`** if any new source needs a source-specific override in the WATERMARK_FILES / CAPTION_LANGUAGE / PAGE_NAME mappings (most inherit FR defaults). *(user action)*
- [ ] **Smoke test**: run `node src/pipeline.js` and confirm articles from each new source appear with `country='FR'`. *(user action)*
- [ ] **Verify `robots.txt`** for Bondy Blog and Actu.fr before production deploy. *(user action)*

**Acceptance:** within 24 hours of deploy, ≥10 articles per day flow in from these new FR sources. Domestic-FR content rises from 0% of pipeline to ≥40%.

---

#### Gap A.7 — Add free-RSS Italian sources (center-left positioning)

**Why it matters:** D3b resolved 2026-05-19 with center-left embraced. Phase-1 RSS sources deploy now. Would have caught Modena before national wires.

- [x] **Added Il Resto del Carlino, Il Messaggero, Il Secolo XIX, Corriere Milano, Corriere Roma, La Gazzetta del Mezzogiorno, Vatican News, La Gazzetta dello Sport, Il Fatto Quotidiano** to `src/config/sources.js` IT block. Il Giornale explicitly excluded per D3b.
- [x] **Documented Phase 2 and Phase 3 deferrals** in comment blocks inside `sources.js`: Il Sole 24 Ore, Corriere del Veneto (Phase 2); Dissapore and other vertical feeds (Phase 3).
- [ ] **Verify each RSS URL** returns valid XML before production deploy. *(user action)*
- [ ] **Update `supabase/functions/generate-caption/index.ts`** if any source needs overrides in WATERMARK_FILES / CAPTION_LANGUAGE / PAGE_NAME (most inherit IT defaults). *(user action)*
- [ ] **Smoke test** end-to-end on each new source (RSS fetch → criticality → DB row). *(user action)*
- [ ] **Verify `robots.txt`** for each new source before deploy. *(user action)*

**Acceptance:** within 24 hours of deploy, Italian-domestic content rises from ~10% of pipeline to ≥50%. A SELECT on the Italian articles shows representation from at least 6 of the 8 new sources.

---

#### Gap A.8 — Bias `criticality.js` toward FR/IT place names

**Why it matters:** the criticality scorer currently weights breaking-news keywords (death, arrest, war) but doesn't reward stories with French or Italian geographic markers. This means a 5-line Tchad blurb can outscore a major Marseille story.

- [x] **Added `FR_PLACE_NAMES` regex** in `src/utils/criticality.js` — top 50 French cities + 13 regions (Île-de-France, Auvergne-Rhône-Alpes, Hauts-de-France, Nouvelle-Aquitaine, Occitanie, Grand Est, Normandie, Pays de la Loire, Bretagne, Bourgogne-Franche-Comté, Centre-Val de Loire, Provence-Alpes-Côte d'Azur, Corse) + accent-variant fallbacks.
- [x] **Added `IT_PLACE_NAMES` regex** — top 50 Italian cities + 20 regions + newsworthy provinces (Modena, Bergamo, Brescia, Catania included in cities list).
- [x] **+15 score boost** in `classifyArticle()` — fires when `article.country === 'FR'/'IT'` and the corresponding place regex matches title+summary. Capped at one boost per article (single regex test, no stacking).
- [ ] **Smoke test**: compare "Drone strike in Yemen" (FR article, no place match) vs "Manifestation à Toulouse" (FR article, Toulouse match) — second should score 15 points higher. *(user action)*
- [ ] **Optionally rescore current pending queue** and confirm FR/IT stories rise relative to international stories. *(user action)*

**Acceptance:** the average `criticality_score` for stories with FR/IT place names is ≥15 points higher than for stories without, in a 100-article sample. Top-of-queue articles tilt domestically.

---

### Phase B — Measurement Layer (Week 2)

Hard prerequisite for D2 validation, Q5 calibration, R3 experiments, and W1 story-arc prioritization.

---

#### Gap B.1 — Engagement scraper (R2)

**Why it matters:** Once the write-back fix (A.2) lands, every post has an `fb_post_id`. Without scraping likes / comments / shares / impressions back from the Graph API, the entire learning loop is blind. This is the gateway to all downstream measurement-driven work.

- [x] **Migration `008_post_metrics.sql`** — `post_metrics` table with `article_id uuid FK`, `interval_tag CHECK (+1h/+24h/+7d)`, reactions (total + 6 types), comments, shares, clicks, impressions, engaged_users, raw_response JSONB. UNIQUE on `(article_id, interval_tag)`.
- [x] **Created `src/scrapers/post-metrics.js`** — queries all posts < 8 days old with `fb_post_id`; computes eligible intervals; skips already-recorded intervals; calls Graph API basic endpoint (reactions/comments/shares) + insights endpoint (impressions/engaged_users/clicks); inserts into `post_metrics`; per-country `FB_ACCESS_TOKEN_{country}` credentials; 401/auth errors skip remaining posts of that country; rate-limit errors (codes 4/17/32) trigger exponential backoff with 3 retries; full `raw_response` stored.
- [x] **Created `.github/workflows/scrape-metrics.yml`** — cron `15 * * * *` (offset from fetch at :00); runs `node src/scrapers/post-metrics.js`; secrets `SUPABASE_URL`, `SUPABASE_KEY`, `FB_ACCESS_TOKEN_FR`, `FB_ACCESS_TOKEN_IT`; `workflow_dispatch` for manual trigger.
- [x] **Added `PostMetric` + `ArticleWithMetrics` interfaces** to `dashboard/src/app/core/supabase.service.ts`.
- [x] **Added `getArticlesWithMetrics()`** to `SupabaseService` — joins `articles` with `post_metrics(*)`, last 60 posted articles ordered by `posted_at DESC`.
- [x] **Created `dashboard/src/app/metrics/metrics.component.ts`** — standalone component showing all posted articles with +1h/+24h/+7d snapshot columns (reactions/comments/shares + impressions). Color-coded by engagement total. Consistent with `ink-` design system.
- [x] **Added `/metrics` route** to `app.routes.ts` with `authGuard`.
- [x] **Added "Metrics" nav link** in the article-list navbar (brand-colored, routes to `/metrics`).
- [ ] **Apply migration 008 to production** (`supabase/migrations/008_post_metrics.sql` → SQL editor). *(user action)*
- [ ] **Smoke test locally**: run `node src/scrapers/post-metrics.js` against an existing posted article (must be ≥1h old), confirm a row lands in `post_metrics`. *(user action)*
- [ ] **Push to GitHub** — the `scrape-metrics.yml` cron activates automatically on push; no separate deploy step needed. *(user action)*
- [ ] **Validate after 48h**: `SELECT count(*), interval_tag FROM post_metrics GROUP BY interval_tag` should return rows for both `+1h` and `+24h`. *(user action)*

**Acceptance:** every post that lands on Facebook has at minimum a `+1h` snapshot in `post_metrics` within 2 hours of publishing. Dashboard renders the metrics. R2's downstream consumers (D2 validation, Q5 calibration, W1 arc tracking) now have a real data source.

---

### Phase C — Tone & Content Signals (Week 3)

Quality of caption output. Hardest to measure but largest engagement lever.

---

#### Gap C.1 — Q4 tone rewrite (5 concrete changes to `CONTENT_SYSTEM_PROMPT`)

**Why it matters:** captions currently read analytical-neutral wire-tone ("Tensions frontalières Israël-Liban", "Stallo diplomatico"). Market wins on identity-loaded, named-protagonist, binary-close framings. The five Q4 changes are the most cost-effective lever (one prompt diff = better captions on every future article).

- [x] **Change 1 — analytical → conflict frame.** BLOC 1 rewritten: requires tension/conflict framing ("who fights, who loses, who wins, what choice is forced"). Bad/good examples added (FR + IT).
- [x] **Change 2 — front-load FR/IT stake on international stories.** ENJEUX INTERNATIONAUX rule added after BLOC 4: first sentence of `intro` MUST answer "Qu'est-ce que cela change concrètement pour [pays cible]?" for international articles.
- [x] **Change 3 — active voice, named protagonist.** REGISTRE ET STYLE extended: VOIX ACTIVE OBLIGATOIRE rule + PROTAGONISTE NOMMÉ rule (surname in hook + surname in `image_headline` if single protagonist).
- [x] **Change 4 — binary close instead of essay prompt.** BLOC 5 rewritten: question must be closed (Oui/Non), binary (A ou B?), or triptyque (A, B ou C?). Bad/good examples added (FR + IT).
- [x] **Change 5 — cultural register per country.** SECTION 4 FR expanded: formel-chaleureux, vouvoiement strict, pillar list (france-en-debat / fierte-francaise / le-monde-vu-paris / sondage-du-jour / retour-sur / ma-ville-aujourdhui). SECTION 4 IT expanded: diretto-emotivo, legal citation permission, pillar list (fatto-del-giorno / italia-nel-mondo / capire-la-legge / azzurri / italia-che-funziona / storie-italiane / la-mia-citta / vaticano).
- [x] **`boost_eligible`-aware tone guidance added**: both FR and IT sections include explicit guidance for `boost_eligible=false` articles — reformulate controversy toward factual enjeu, avoid amplifying communautary opposition.
- [x] **All 5 changes mirrored in edge function** (`supabase/functions/generate-caption/index.ts` verbatim copy updated).
- [ ] **Regenerate 5 sample articles per country** and human-review the captions for tone shift. *(user action — after edge function deployed)*
- [ ] **Bulk regenerate the current `pending` queue**: `node src/scripts/generate-captions-batch.js`. *(user action — after migrations 009+010 applied AND edge function deployed)*

**Acceptance:** in a blind 20-article sample, ≥15 captions present a conflict/tension frame in `intro` (vs the baseline of zero). ≥18 captions front-load the FR/IT stake on international stories. The `cta` ends with a binary/trinary choice in ≥18 of 20.

---

#### Gap C.2 — `content_signals` classifier (6-field schema extension)

**Why it matters:** Q5 extension to the existing `generateCaption()` call — adds six signal fields the scheduler reads to make better routing/format decisions. Zero extra API cost (just more fields requested in the same Claude call).

- [x] **Migration `009_content_signals.sql`** (was `008` in plan — renumbered because `008_post_metrics.sql` was created in Phase B): `ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_signals jsonb DEFAULT '{}'::jsonb;`
- [x] **`CONTENT_SYSTEM_PROMPT` extended** with CONTENT_SIGNALS definitions block + `content_signals` field in FORMAT DE RÉPONSE (6 fields: `binary_frame` bool, `poll_fit_score` int 1–5, `protagonist_named` string|null, `best_format` enum post/carousel/reel, `fr_it_stake_first_sentence` bool, `pillar_hint` string|null). Example in the JSON example block updated.
- [x] **`generateCaption()` updated**: max_tokens 1200→1400; boost_eligible awareness in user message; `content_signals` included in JSON schema line; fallback returns `content_signals: {}`.
- [x] **`generate-caption.js`** and **`generate-captions-batch.js`**: `content_signals: caption.content_signals ?? {}` added to `updateArticle()` calls.
- [x] **Edge function mirrored**: prompt updated, caption user message updated, `content_signals: captionData.content_signals ?? {}` in return value.
- [x] **Dashboard `Article` interface** extended: `content_signals` typed with all 6 fields; `cluster_id: number | null` and `cluster_size: number` also added for C.3.
- [x] **Dashboard "Signals" tab** added (index 4) in article detail dialog: 6-field grid (binary_frame, poll_fit_score, protagonist_named, best_format, fr_it_stake_first_sentence, pillar_hint) + cluster info section.
- [ ] **Apply migration 009 to production** (`supabase/migrations/009_content_signals.sql` → SQL editor). *(user action)*
- [ ] **Deploy edge function**: `supabase functions deploy generate-caption`. *(user action)*
- [ ] **Validate with a 20-article sample** — confirm `content_signals` populated; inspect distribution. *(user action)*

**Acceptance:** newly-generated articles have a populated `content_signals` JSON with all six fields. Smoke check: the field-distribution histogram in a 50-article sample looks plausible (`binary_frame` ~20–40%, `protagonist_named` ~50–70% etc.).

---

#### Gap C.3 — Breaking-news cluster detector (`dedup.js` extension)

**Why it matters:** the Modena miss was the headline failure of the original IT analysis. Pipeline currently dedups on title-similarity at single-article level. When 3+ articles arrive on the same incident in a 6-hour window, the cluster should auto-escalate to `criticality='breaking'`.

- [x] **Migration `010_cluster_id.sql`** (was `009` in plan — renumbered): `cluster_id bigint`, `cluster_size int DEFAULT 1`, index on `cluster_id`.
- [x] **`detectAndAnnotateClusters(newArticles, recentDbArticles)`** in `src/utils/dedup.js`: union-find with path compression; O(n²) pairwise similarity check (acceptable for ≤~150 articles per run); similarity ≥ 0.80 → same cluster (deduplicated articles are already above 0.7 so effectively captures 0.80–dedup threshold range); `cluster_id` = stable `titleHash(rootTitle)` (djb2 mod, positive); `cluster_size ≥ 3` → auto-escalate criticality to 'breaking'. Thresholds (0.80/3/6h) documented in code comment for post-R2 re-tuning.
- [x] **`getRecentArticlesForClustering(country, windowHours=6)`** added to `src/services/supabase.js` — queries `id, title, criticality, cluster_id, cluster_size` within the window.
- [x] **`src/pipeline.js` updated**: imports `detectAndAnnotateClusters` + `getRecentArticlesForClustering`; calls cluster detector after validation; logs cluster count.
- [x] **Dashboard `Article` interface**: `cluster_id: number | null`, `cluster_size: number` added.
- [x] **Dashboard article-list**: cluster badge `🔗 ×N` (ib-alert style) shown on rows where `cluster_size >= 3`.
- [ ] **Apply migration 010 to production** (`supabase/migrations/010_cluster_id.sql` → SQL editor). *(user action)*
- [ ] **Smoke test**: inject 3 mock Modena-like articles and confirm they share `cluster_id` and get `criticality='breaking'`. *(user action)*

**Acceptance:** in a synthetic test (3 mock Modena articles), all 3 receive the same `cluster_id`, `cluster_size=3`, and `criticality='breaking'`. Dashboard top-strip displays the cluster.

---

### Phase B+C Go-Live Checklist (all user actions in sequence)

Execute in this exact order — each step unblocks the next.

**Step 1 — Database (SQL editor in Supabase dashboard)**
- [x] Apply `supabase/migrations/008_post_metrics.sql`
- [x] Apply `supabase/migrations/009_content_signals.sql`
- [x] Apply `supabase/migrations/010_cluster_id.sql`

**Step 2 — Edge function**
- [x] `supabase functions deploy generate-caption`

**Step 3 — Smoke test B.1 (metrics scraper)**
- [ ] Run `node src/scrapers/post-metrics.js` manually against a post that is ≥1h old; confirm a row appears in `post_metrics`.

**Step 4 — Push to GitHub**
- [ ] `git push` — activates `scrape-metrics.yml` cron automatically.

**Step 5 — Smoke test C.1+C.2 (tone + signals)**
- [ ] Regenerate 5 sample articles per country: `node src/scripts/generate-caption.js <id1> <id2> <id3> <id4> <id5>`
- [ ] Review captions in the dashboard — confirm conflict framing, binary close questions, and `content_signals` populated in the Signals tab.

**Step 6 — Bulk regenerate pending queue**
- [ ] `node src/scripts/generate-captions-batch.js`

---

### Phase D+E Go-Live Checklist (all user actions in sequence)

Execute after the Phase B+C checklist is complete and all migrations 005–010 are applied.

**Step 1 — Database (SQL editor in Supabase dashboard)**
- [x] Apply `supabase/migrations/011_pillar.sql`
- [x] Apply `supabase/migrations/012_publish_score.sql`

**Step 2 — Add STABILITY_KEY secret to GitHub**
- [ ] Settings → Secrets and variables → Actions → New repository secret → `STABILITY_KEY` (Stability AI API key for AI image generation in publish-slot.js)

**Step 3 — Push to GitHub**
- [ ] `git push` — activates `publish.yml` (every 15 min) and `recompute-scores.yml` (every hour) automatically.

**Step 4 — Validate slot publisher**
- [ ] Approve at least one article with a pillar set. Wait for the next 15-min cron fire near a slot window. Confirm article posts and `posted_at`/`fb_post_id` are written.

**Step 5 — Validate E.1 window tracker**
- [ ] Confirm `logBoostEligibleWindowStart()` fires on the first IT post with `boost_eligible=false`. Check GitHub Actions logs for the window-start message.

---

### Phase D — Scheduling Discipline (Week 4)

Posts publish in the right slot, the right pillar mix, in the right priority order.

---

#### Gap D.1 — Fixed posting time slots per country

**Why it matters:** trending posts cluster 07:00–12:35 CEST (FR) and 07:00–12:35 + 19:00–23:30 CEST (IT). Current pipeline publishes whenever the cron lands. Slot discipline alone is a measurable engagement lever.

- [x] **Add a `SLOTS` constant to `src/services/facebook.js`**:
  ```javascript
  const SLOTS = {
    FR: ['07:30', '12:00', '19:00'],       // 3 slots
    IT: ['07:30', '11:30', '15:30', '19:30'] // 4 slots
  };
  ```
  Times are CEST 24h. The publisher fires only at these times (within a ±15 min window around each slot).
- [x] **Separate `publish.yml` cron** (`*/15 * * * *`) in `.github/workflows/` — runs `publish-slot.js` which gates on ±15 min slot match. Fetching (`fetch.yml`) and publishing are now in separate workflows.
- [x] **Add slot-fingerprint logging**: `publish-slot.js` logs `slot_target`, `actual_fire_time`, `article_id`, `publish_score`, `runner_up_score`.
- [ ] **Update dashboard** to show "Next slot at HH:MM" indicator. *(deferred — needs production data first)*
- [ ] **Smoke test** by running the publisher between slots and confirming it no-ops. Run again at a slot time and confirm it fires. *(user action)*

**Acceptance:** 100% of new posts have a `posted_at` within ±15 min of a defined slot. Dashboard shows the next scheduled slot.

---

#### Gap D.2 — Weekly content-pillar quotas

**Why it matters:** the gap analyses define multi-pillar content mix. Without explicit quotas the pipeline drifts toward whatever scoring-mechanic produces (international + science-heavy, per the existing pattern).

- [x] **Created `src/config/pillars.js`** with `PILLARS`, `SLOT_PILLARS`, and `isPillarBlocked()` exports. All targets, `blocked_until` fields, and slot→pillar mappings defined.
- [x] **Blocked pillars marked with `blocked_until`**: `capire-la-legge` → `'carousel_renderer'`; `storie-italiane` + `retour-sur` → `'evergreen_tables'`. Scheduler skips them with a logged reason.
- [x] **Pillar derived from `content_signals.pillar_hint`** in `pipeline.js`, `generate-caption.js`, and `generate-captions-batch.js`. Written to the `pillar` column.
- [x] **Migration `011_pillar.sql`** — `ALTER TABLE articles ADD COLUMN IF NOT EXISTS pillar text;`
- [x] **`pillar_quota_factor`** computed in `publishScore.js`: under-quota → `+0.5`, over-quota → `-0.5`, normalized to ×20 contribution (±10 points). Reads `getPillarWeeklyCounts()` which counts `status='posted'` rows from the last 7 days.
- [ ] **Surface pillar quota state on the dashboard**: per-pillar progress bar "5/9 this week". *(deferred — needs production data first)*

**Acceptance:** in the next full week of publishing, pillar mix is within ±20% of target for each non-blocked pillar. Dashboard surfaces over/under-quota state.

---

#### Gap D.3 — `publish_score` formula

**Why it matters:** decides WHICH approved article publishes at the next slot. Combines criticality, recency, slot match, pillar deficit. Without it the publisher picks effectively at random.

- [x] **Migration `012_publish_score.sql`**:
  ```sql
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS publish_score numeric;
  CREATE INDEX IF NOT EXISTS articles_publish_score_idx ON articles (publish_score DESC) WHERE status = 'approved';
  ```
- [x] **Created `src/utils/publishScore.js`** with `computePublishScore()` and `nearestSlot()`:
  ```
  publish_score =
      criticality_priority * 40       // 'breaking'=4, 'alert'=3, 'trending'=2, 'standard'=1
    + slot_match_factor    * 30       // 1.0 if pillar suits the current slot, else 0.5
    + pillar_quota_factor  * 20       // +0.5 under-quota, -0.5 over-quota, normalized to ±10 pts
    + recency_factor       * 10       // exp(-ageHours/24) decay
  ```
- [x] **Hourly recompute cron** — `.github/workflows/recompute-scores.yml` runs `node src/scripts/recompute-scores.js` at `:30` every hour.
- [x] **Publisher updated** — `publish-slot.js` calls `getApprovedArticlesSortedByScore()` and picks the top article. Runners-up logged for auditability.
- [x] **Slot-pillar mapping documented** in `src/config/pillars.js` via the `SLOT_PILLARS` export.
- [ ] **Smoke test**: approve 5 articles across different pillars + criticalities, run the publish step at a slot, confirm the highest-scored article wins. *(user action)*

**Acceptance:** in the next week, every published post has the highest `publish_score` among `approved` articles at the moment the slot fires. Logs show the score and the runners-up for auditability.

---

### Phase E — Validation & FR Rollout (Week 5–10)

The 30-day window for `boost_eligible` IT, plus the FR rollout that follows.

---

#### Gap E.1 — `boost_eligible` 30-day IT validation

**Why it matters:** the contract with the user (Decision 2, 2026-05-19) is "ship IT first, validate 30 days, then roll out to FR." This is the validation window.

- [x] **`logBoostEligibleWindowStart()` implemented** in `src/services/facebook.js` — `publish-slot.js` calls it after each IT `boost_eligible=false` post. Logs start date, 30-day end date, and instructions to flip FR enforcement. Fires only on the first such post (idempotent via `getFirstBoostIneligiblePostedIT()` check).
- [ ] **Start date marker**: window opens automatically on the first IT post with `boost_eligible=false`; the log line in `publish-slot.js` records it. *(automatic — triggered by first live post)*
- [ ] **At end of window**, manually check ItaliaOggi's Page Insights for any policy strikes, ad-policy reviews, or community-standards warnings during the window. *(user action — Week 5–10)*
- [ ] **If zero strikes** → flip `BOOST_ELIGIBLE_ENFORCED.FR` from `false` to `true` in `src/services/facebook.js`. *(user action)*
- [ ] **If any strikes** → root-cause first. Do NOT flip FR until the cause is understood and mitigated. Extend IT window by another 14 days minimum. *(user judgment)*
- [ ] **Record the outcome** in a brief "validation result" memo (docs/strategy or memory). *(user action)*
- [ ] **After FR flip**, regenerate any FR articles currently stuck behind ADS_POLITICS/WEAPONS/DRUGS gates. *(user action)*

**Acceptance:** the FR rollout decision is taken with documented evidence. If FR flips, the existing FR backlog is regenerated within 24 hours and the pipeline produces non-zero `boost_eligible=false` FR articles.

---

#### Gap E.2 — `FR_LEGAL_01` editorial-language rewrite (specialist gate)

**Why it matters:** the only remaining 🟡 strategy item. Design is locked but legal review must happen before live posting.

- [ ] **Identify and engage a French press-law specialist** (independent counsel familiar with the French presumption-of-innocence doctrine and *Loi du 29 juillet 1881*). Same engagement could cover both this AND eventual Decision 3a licence negotiations.
- [ ] **Send the specialist a 2-page brief**: (1) the existing `FR_LEGAL_01` gate logic, (2) the proposed regenerate-with-presumption-language rewrite (use *présumé*, *mis en examen*, *selon le parquet*, never *coupable* before verdict), (3) a sample of 5 articles the gate currently blocks.
- [ ] **Receive sign-off** (or revision requests). Iterate the prompt language until the specialist signs off.
- [ ] **Update `CONTENT_SYSTEM_PROMPT`** and the edge-function duplicate with the approved presumption-of-innocence language requirements.
- [ ] **Update `src/validators/contentValidator.js`** so `FR_LEGAL_01` no longer hard-blocks: the validator flags the article for a "regenerate with presumption language" prompt path. After the regenerate, if the article passes a regex check for the presumption phrases, it proceeds to `pending` (still `boost_eligible=false`).
- [ ] **Smoke test** on the 2 historic blocked FR articles (Tunisien terrorisme, Affaire Leprince): regenerate, confirm the new caption includes presumption language, confirm the validator passes them through.

**Acceptance:** specialist sign-off documented. The 2 historic blocked articles regenerate successfully with presumption language and land in `pending`. Future FR_LEGAL_01-tripped articles flow through the regenerate path automatically.

---

### Phase F — Format Expansion (Month 2)

After Phase B has accumulated ~4 weeks of post-R2 engagement data, the smarter format/content work becomes possible.

---

#### Gap F.1 — Reel rendering pipeline (Q1 local stack)

**Why it matters:** Reels are 4/10 of trending FR + 4/10 trending IT. We have zero. Pure format-priority lever.

- [ ] **Resolve Open Decision 1**: confirm the FFmpeg + Kokoro + Whisper local-stack path. (Approved in principle in Q1 design; needs hardware/disk-space sanity check.)
- [ ] **Download Kokoro multilingual voices pack** (`voices-v1.0.bin`) — current install has English-only. Document the target path in `/home/jayam/projects/shared/kokoro/`.
- [ ] **Verify FFmpeg + Whisper** are installed (`ffmpeg -version`, `whisper --help`). Install via package manager if missing.
- [ ] **Listening test**: generate 5 sample voice clips on a French test caption (Kokoro `ff_siwis`) and 5 on Italian (`if_sara`, `im_nicola`). Human-rate naturalness on a 1–5 scale. Iterate voice pick if any score < 3.
- [ ] **Create `src/renderers/reel.js`**:
  - Input: an `article` row + a list of 3–5 source image URLs OR a `formatted_image_prompt`.
  - Step 1: generate the voice-over audio from the article's `intro + question` text using Kokoro.
  - Step 2: assemble a 30-second vertical video (1080×1920) using FFmpeg with the source images, voice-over audio, optional background music.
  - Step 3: generate burned-in subtitles using Whisper transcription of the voice-over.
  - Step 4: write the MP4 to `/tmp/reels/{article_id}.mp4`.
- [ ] **Add a `reel_path` column to `articles`** (migration `012_reel.sql`).
- [ ] **Extend `services/facebook.js`** to publish to Facebook as a Reel when `reel_path` is populated. Use the Graph API endpoint `POST /{page-id}/video_reels` with `upload_phase=start/transfer/finish` flow.
- [ ] **Add a dashboard control**: a "Generate Reel" button on the article detail dialog that invokes `node src/scripts/generate-reel.js <id>`.
- [ ] **Smoke test end-to-end**: generate a Reel for a hand-picked article, preview locally, publish to a test Facebook page, verify it shows up as a Reel (vertical, plays inline).
- [ ] **Target ≥1 Reel per week per country initially**; ramp to 2/week after 4 weeks if the produce-rate holds.

**Acceptance:** the pipeline produces 1 valid MP4 Reel per country per week. The Reel publishes successfully to Facebook with the correct watermark and subtitles. Engagement scraper records its metrics.

---

#### Gap F.2 — Image carousel renderer (C3, Remotion, sibling to Reels)

**Why it matters:** the IT `Capire la legge` pillar needs multi-card explainers (3–5 cards). Q5's `best_format` field labels carousel-suitable stories. Without this renderer, the pillar can't fire.

- [ ] **Set up Remotion** in a sibling directory `renderers/remotion/` (NOT in `src/` since it's a React app):
  - `npx create-remotion@latest`
  - Choose a base template, customise.
- [ ] **Build a carousel template** (`renderers/remotion/Carousel.tsx`) that accepts props `{ cards: [{title, body, image}], country, watermarkPath }` and renders a vertical 1080×1080 carousel.
- [ ] **Add a Node-side wrapper** `src/renderers/carousel.js` that invokes the Remotion CLI to render the carousel given an article's data.
- [ ] **Add a `carousel_paths` column to `articles`** (migration `013_carousel.sql`) — JSONB array of card image paths.
- [ ] **Extend `services/facebook.js`** to publish a carousel using the Graph API multi-image endpoint (`POST /{page-id}/photos` for each card with `published=false`, then attach them all in a single post via `attached_media`).
- [ ] **Smoke test**: produce a 3-card "Capire la legge" carousel for a legal article, preview locally, publish to test page, verify it renders as a swipeable carousel.
- [ ] **Unblock the `Capire la legge` pillar** in `src/config/pillars.js` (remove the `blocked_until` field).

**Acceptance:** the renderer produces a valid 3-card carousel from an article. Facebook publishes it as a multi-image post. The `Capire la legge` pillar now fires its weekly quota.

---

#### Gap F.3 — Binary-poll caption variant + image overlay

**Why it matters:** trending FR Item 7 (Macron authority) was a poll Reel — 1.6K likes, 184 comments. France Info Live's "OUI / NON" overlay drove a 12% comment-to-like ratio (vs our ~1%). Pure mechanic, low cost.

- [ ] **Extend the `ai_caption` JSON schema** to include an optional `poll` sub-object: `{ question: string, optionA: string, optionB: string, suggestedResults: { a: int, b: int } | null }`.
- [ ] **Update `CONTENT_SYSTEM_PROMPT`** to include a poll variant: when `content_signals.poll_fit_score ≥ 7`, the generator also returns a populated `ai_caption.poll`.
- [ ] **Add a poll image renderer** in `src/renderers/poll.js` — uses FFmpeg / sharp to overlay a two-column "OUI | NON"-style image on the source image. Anton font, gold/red highlight per option.
- [ ] **Add a dashboard "Poll preview" tab** showing how the poll image will look.
- [ ] **Slot logic**: only fire poll-variant posts at the FR `12:00` and IT `15:30` slots (poll posts work best mid-day; mornings are breaking-news slots).
- [ ] **Smoke test** with the Macron-authority-style article.
- [ ] **Target ≤1 poll per week per country** initially (per Q4 — sparingly to avoid format fatigue).

**Acceptance:** 1 poll-variant post fires per country per week. Engagement scraper shows comment-to-like ratio on these posts vs non-poll average; should be measurably higher.

---

#### Gap F.4 — Day-2+ story arc tracking (W1)

**Why it matters:** the Modena-class engagement opportunity is multi-day. R2 must have ~4 weeks of post-engagement data before this fires correctly — that's why this is Month 2, not earlier.

- [ ] **Write migration `014_story_arc.sql`**:
  ```sql
  ALTER TABLE articles ADD COLUMN story_arc_id bigint;
  CREATE INDEX articles_story_arc_idx ON articles (story_arc_id);
  ```
- [ ] **Extend `src/utils/dedup.js`** with `detectStoryArcs(article)`:
  - For each new article, search articles in the last 7 days for title-similarity:
    - similarity > 95% → DUPLICATE (existing behavior)
    - similarity 80–95% AND not exact-duplicate → set `story_arc_id` = matched article's `story_arc_id` (or its own ID if it's the first follow-on)
    - similarity < 80% → new arc; `story_arc_id` = own ID
- [ ] **Add a follow-on caption template** in `CONTENT_SYSTEM_PROMPT`: when an article has a non-self `story_arc_id`, prepend *"Aggiornamento sul caso…"* (IT) or *"Suite à l'affaire…"* (FR), or include "Caso X, secondo aggiornamento" (IT) / "Affaire X, point d'étape" (FR).
- [ ] **Add arc-aware prioritization to `publish_score`**: when the article has a non-self `story_arc_id` AND the parent arc's Day-1 post has high engagement (read from `post_metrics`), add `+15` to the score. Low-engagement parent → no boost (skip the follow-on).
- [ ] **Add a dashboard view** showing active arcs (size ≥ 2, last activity < 7 days) with the article list per arc.
- [ ] **Smoke test** with synthetic follow-on articles for a high-engagement Day-1 post: confirm same `story_arc_id`, follow-on caption template fires, scheduler boosts the article.

**Acceptance:** in the week after this ships, any Modena-class story that develops a follow-on the same week is grouped into an arc, captioned with the follow-on template, and prioritized in the schedule.

---

#### Gap F.5 — Evergreen story tables (C1, AI-assisted curation)

**Why it matters:** the `Retour sur…` (FR) and `Storie italiane` (IT) weekend pillars are blocked until these tables exist.

- [ ] **Generate 50 FR evergreen candidates**. Run a Claude call with the following prompt structure:
  ```
  You are curating evergreen heroic / nostalgic / culturally-resonant French stories for a Facebook page that posts one weekend retrospective per week. Produce 50 candidates. Each candidate must include:
  - Story title
  - Year
  - Approximate engagement hook in ≤ 30 words
  - Suggested headline-language for the post
  ```
  Save the output to `docs/research/evergreen-fr-candidates.md`.
- [ ] **User review of FR candidates**: keep 30, drop 20. User edits the file directly or uses a simple dashboard widget.
- [ ] **Generate 50 IT evergreen candidates** with an analogous prompt. Save to `docs/research/evergreen-it-candidates.md`.
- [ ] **User review of IT candidates**: keep 30, drop 20.
- [ ] **Write migration `015_evergreen_stories.sql`**:
  ```sql
  CREATE TABLE evergreen_stories (
    id bigserial PRIMARY KEY,
    country text NOT NULL CHECK (country IN ('FR', 'IT')),
    title text NOT NULL,
    year int,
    angle text,
    last_used_at timestamptz,
    use_count int DEFAULT 0
  );
  CREATE INDEX evergreen_stories_country_idx ON evergreen_stories (country, last_used_at NULLS FIRST);
  ```
- [ ] **Bulk-insert the kept 30 + 30**.
- [ ] **Extend the scheduler**: on weekend slots, when the `Retour sur` / `Storie italiane` pillar is under quota, query `evergreen_stories` ordered by `last_used_at NULLS FIRST` (oldest first; never-used first), pick one, generate a full article through the existing prompt path, and post.
- [ ] **Update `last_used_at` and `use_count`** when an evergreen story posts.
- [ ] **Unblock the `Retour sur` + `Storie italiane` pillars** in `src/config/pillars.js`.

**Acceptance:** weekend slots for both pillars fire from the curated table. Each evergreen story is used at most once every 30 weeks (60 stories ÷ 1/week ÷ 2 = ~30 weeks cycle).

---

#### Gap F.6 — Cross-country natural experiment (R3)

**Why it matters:** R3 chose option 1 (cross-country) over formal A/B framework. The first three planned experiments can run once R2 has ~4 weeks of baseline data.

- [ ] **Document the experiment protocol** in `docs/strategy/experiments-2026.md` (new file):
  - Hypothesis to test
  - Country running the variant
  - Start / end dates
  - Decision threshold: variant must show ≥15% engagement lift over baseline, with ≥20 posts of the variant.
  - If lift achieved → port the variant to the other country.
- [ ] **Run Experiment 1 (IT)**: legal-citation hook in seed_comment for legal/judicial articles. Modify the seed_comment template pool for IT to include `art. 595 c.p.`-style hooks on relevant articles. Run for 2 weeks. Measure via R2.
- [ ] **Run Experiment 2 (FR)**: binary CTA vs open CTA. Vary the `cta` field via a temporary prompt switch. Run for 2 weeks. Measure via R2.
- [ ] **Run Experiment 3 (IT, week 9+)**: image-heavy vs text-heavy lead. Vary `intro` length (long vs short). Run for 2 weeks. Measure.
- [ ] **For each experiment**, write a 1-page result memo to `docs/strategy/experiment-{name}-results.md`. Port the winning variant to the other country if applicable.

**Acceptance:** the three experiments run in sequence over weeks 6–12. Each produces a documented result. Winning variants are ported.

---

### Phase G — Triggered / Conditional Work (Month 2+)

Work that depends on an external action or trigger to start.

---

#### Gap G.1 — Le Bonbon (FR) + Dissapore (IT) source investigation (C4)

**Why it matters:** lifestyle / fierté française and patrimonio pillars are thinly sourced. These two sources would fill the gap.

- [ ] **Le Bonbon RSS check**: visit `https://www.lebonbon.fr/`, check for RSS link in HTML `<link rel="alternate" type="application/rss+xml">`. Try common URLs (`/feed`, `/rss`, `/rss.xml`).
- [ ] **Le Bonbon robots.txt check**: fetch `https://www.lebonbon.fr/robots.txt`. Note any aggregator restrictions.
- [ ] **Le Bonbon sample-content review**: read 5 recent posts. Is the content shareable lifestyle? Is the language consistent with FR page contract?
- [ ] **Dissapore RSS check**: same process for `https://www.dissapore.com/`.
- [ ] **Dissapore robots.txt check + sample-content review**.
- [ ] **Update `docs/research/sources-audit-france.md`** with Le Bonbon findings: status change from `INVESTIGATE` to either `ADD` (with RSS URL) or `SKIP` (with reason).
- [ ] **Update `docs/research/sources-audit-italy.md`** with Dissapore findings similarly.
- [ ] **If `ADD`**: add to `src/config/sources.js`. If `SKIP`: document the explicit Month 2 defer in the audit doc.

**Acceptance:** both sources have a final-status decision logged in their respective audit docs. If `ADD`, they appear in the source config and produce articles within 24 hours.

---

### Phase H — Long-deferred / Milestone-gated (Month 6+ or threshold-triggered)

Decisions that have explicit revisit gates rather than dates.

---

#### Gap H.1 — Named-editor positioning revisit (R1, Month 6+)

**Why it matters:** unlocks both the expert-personality format (Bassetti-class) and named editorial voice (Belpietro-class). Currently accepted as ceilings.

- [ ] **At Month 6 (or when ItaliaOggi has track record + budget)**, re-evaluate the named-editor positioning decision.
- [ ] **Inputs to consider**: 6 months of R2 engagement data, total follower count, content-policy strikes during the period, available editorial budget.
- [ ] **If green light**: scope a named-editor hire / partnership. The decision is a content/business one — beyond the pipeline scope.
- [ ] **If green light**: re-enter Gap C2 (opinion-text format) by building the opinion-text caption pipeline + adapted CONTENT_SYSTEM_PROMPT path.

**Acceptance:** a written go/no-go decision is recorded at the revisit checkpoint.

---

#### Gap H.2 — Italy sister-page strategy revisit (W2, 10k follower milestone)

**Why it matters:** the natural pivot point to spin up the first sister page (likely ItaliaOggi Sport).

- [ ] **Monitor ItaliaOggi engaged-follower count** via R2 + Facebook Page Insights. Add a small dashboard widget if needed.
- [ ] **When threshold is hit**, evaluate spinning up a single sister page. The natural first candidate is *ItaliaOggi Sport* (La Gazzetta dello Sport already integrated; `Azzurri` pillar already defined; lowest editorial-policy risk).
- [ ] **If go**: provision a new Facebook Page; add `FB_PAGE_ID_IT_SPORT` / `FB_ACCESS_TOKEN_IT_SPORT` secrets; add a sister-page entry to `src/config/sources.js` with its own pillar subset.
- [ ] **Do NOT proactively work on sister-page architecture before the threshold is reached.**

**Acceptance:** the revisit happens at the milestone. Decision is recorded.

---

#### Closed gaps — no action required

For completeness, the following gaps are formally closed and require no implementation work:

- [x] **Citizen-led nationalist content** (R1 — permanent ceiling, aggregator can't produce participant content)
- [x] **Hyper-local partisan framing (Lega-style)** (R1 — conscious choice via D3b center-left positioning)
- [x] **Citizen / raw video footage repackaging** (R1 — copyright-blocked permanent ceiling)
- [x] **Satirical voice (Le Gorafi-style)** (P3 accepted gap, not pursued)
- [x] **Italy positioning niche** (implicitly resolved as curatorial-sharp + utility-secondary via D3b)
- [x] **Italy partisan balance** (D3b — center-left embraced, Il Giornale not added)
- [x] **RSS licensing strategy** (D3a — free-RSS only; per-source ROI-gated escalation)
- [x] **Opinion-text format / Belpietro-class** (C2 — defer until R2 + named-editor positioning; re-enters at H.1)

---

## Phase 3 — Sequenced Execution Order (cross-phase summary)

The execution-order checklist below collapses every task above into one linear sequence. Copy-paste this directly into your task tracker. Each line corresponds to a single executable task — no further breakdown needed.

### Week 1 (Foundation)
- [ ] A.1 — Caption pipeline fix: audit `claude.js`
- [ ] A.1 — Caption pipeline fix: update `CONTENT_SYSTEM_PROMPT` for intro/question/cta
- [ ] A.1 — Caption pipeline fix: verify DB-write mapping
- [ ] A.1 — Caption pipeline fix: mirror in edge function
- [ ] A.1 — Caption pipeline fix: add unit test
- [ ] A.1 — Caption pipeline fix: smoke-test on a sample article
- [ ] A.1 — Caption pipeline fix: regenerate 42 historic posted articles (optional)
- [ ] A.1 — Caption pipeline fix: deploy edge function
- [ ] A.2 — Write-back fix: locate Graph API call in `facebook.js`
- [ ] A.2 — Write-back fix: add `updateArticle` post-publish
- [ ] A.2 — Write-back fix: wrap in try/catch
- [ ] A.2 — Write-back fix: add structured error logging
- [ ] A.2 — Write-back fix: verify migration `004_*` applied to prod
- [ ] A.2 — Write-back fix: smoke-test one post
- [ ] A.3 — Image headline language: prompt hard rule
- [ ] A.3 — Image headline language: Node-side regex check + retry
- [ ] A.3 — Image headline language: edge-function regex check
- [ ] A.3 — Image headline language: test regen on offending articles
- [ ] A.3 — Image headline language: sanity-check SELECT
- [ ] A.4 — Seed comment rotation: build 10-template FR pool
- [ ] A.4 — Seed comment rotation: build 10-template IT pool
- [ ] A.4 — Seed comment rotation: no-repeat-within-7-days enforcement
- [ ] A.4 — Seed comment rotation: extend prompt for template-ID selection
- [ ] A.4 — Seed comment rotation: migration `005_seed_comment_template.sql`
- [ ] A.4 — Seed comment rotation: mirror in edge function
- [ ] A.5 — boost_eligible: migration `006_boost_eligible.sql`
- [ ] A.5 — boost_eligible: update `contentValidator.js`
- [ ] A.5 — boost_eligible: add `country_boost_eligible_enforced` constant
- [ ] A.5 — boost_eligible: dashboard `Boost` column
- [ ] A.5 — boost_eligible: validate with hand-picked IT articles
- [ ] A.5 — boost_eligible: document 30-day window start in CLAUDE.md
- [ ] A.6 — Free-RSS FR: add 20 Minutes + city editions
- [ ] A.6 — Free-RSS FR: add Reporterre
- [ ] A.6 — Free-RSS FR: add Le Parisien
- [ ] A.6 — Free-RSS FR: add Actu.fr
- [ ] A.6 — Free-RSS FR: add Bondy Blog
- [ ] A.6 — Free-RSS FR: update edge-function mappings
- [ ] A.6 — Free-RSS FR: smoke test + robots.txt verify
- [ ] A.6 — Free-RSS FR: document deferred-source comment block
- [ ] A.7 — Free-RSS IT: add Il Resto del Carlino
- [ ] A.7 — Free-RSS IT: add Il Messaggero
- [ ] A.7 — Free-RSS IT: add Il Secolo XIX
- [ ] A.7 — Free-RSS IT: add Corriere Milano + Roma
- [ ] A.7 — Free-RSS IT: add La Gazzetta del Mezzogiorno
- [ ] A.7 — Free-RSS IT: add Vatican News
- [ ] A.7 — Free-RSS IT: add La Gazzetta dello Sport
- [ ] A.7 — Free-RSS IT: add Il Fatto Quotidiano
- [ ] A.7 — Free-RSS IT: update edge-function mappings
- [ ] A.7 — Free-RSS IT: smoke test + robots.txt verify
- [ ] A.7 — Free-RSS IT: document Phase-2 deferrals comment block
- [ ] A.8 — Criticality place names: FR_PLACE_NAMES array
- [ ] A.8 — Criticality place names: IT_PLACE_NAMES array
- [ ] A.8 — Criticality place names: +15 boost in `scoreArticle`
- [ ] A.8 — Criticality place names: smoke test
- [ ] A.8 — Criticality place names: re-score current pending queue

### Week 2 (Measurement)
- [ ] B.1 — Engagement scraper: migration `007_post_metrics.sql`
- [ ] B.1 — Engagement scraper: build `src/scrapers/post-metrics.js`
- [ ] B.1 — Engagement scraper: per-country token lookup
- [ ] B.1 — Engagement scraper: error handling
- [ ] B.1 — Engagement scraper: GH Actions `scrape-metrics.yml` hourly cron
- [ ] B.1 — Engagement scraper: verify Supabase secrets
- [ ] B.1 — Engagement scraper: smoke test
- [ ] B.1 — Engagement scraper: dashboard metrics view
- [ ] B.1 — Engagement scraper: 48h-uptime validation

### Week 3 (Tone & Content Signals)
- [ ] C.1 — Q4 tone: change 1 (conflict frame)
- [ ] C.1 — Q4 tone: change 2 (front-load FR/IT stake)
- [ ] C.1 — Q4 tone: change 3 (active voice + named protagonist)
- [ ] C.1 — Q4 tone: change 4 (binary close)
- [ ] C.1 — Q4 tone: change 5 (cultural register tables)
- [ ] C.1 — Q4 tone: boost_eligible-aware tone guidance
- [ ] C.1 — Q4 tone: mirror in edge function
- [ ] C.1 — Q4 tone: bump cache-control version key
- [ ] C.1 — Q4 tone: regenerate 5 samples per country, human-review
- [ ] C.1 — Q4 tone: bulk regenerate pending queue
- [ ] C.2 — content_signals: migration `008_content_signals.sql`
- [ ] C.2 — content_signals: extend `CONTENT_SYSTEM_PROMPT` (6 fields)
- [ ] C.2 — content_signals: parse + write to JSONB
- [ ] C.2 — content_signals: mirror in edge function
- [ ] C.2 — content_signals: add malformed-JSON fallback
- [ ] C.2 — content_signals: 20-article distribution sanity check
- [ ] C.2 — content_signals: dashboard "Signals" tab

### Week 4 (Scheduling)
- [ ] C.3 — Cluster detector: migration `009_cluster_id.sql`
- [ ] C.3 — Cluster detector: extend `dedup.js` with `detectClusters`
- [ ] C.3 — Cluster detector: auto-escalate criticality on cluster_size ≥ 3
- [ ] C.3 — Cluster detector: dashboard top-strip "Breaking now"
- [ ] C.3 — Cluster detector: smoke test with synthetic Modena articles
- [x] D.1 — Slot times: add SLOTS constant in `facebook.js`
- [x] D.1 — Slot times: separate `publish.yml` cron (±15 min gate)
- [x] D.1 — Slot times: slot-fingerprint logging
- [ ] D.1 — Slot times: dashboard next-slot indicator *(deferred)*
- [ ] D.1 — Slot times: smoke test *(user action)*
- [x] D.2 — Pillar quotas: create `src/config/pillars.js`
- [x] D.2 — Pillar quotas: mark blocked pillars with `blocked_until`
- [x] D.2 — Pillar quotas: pillar derivation from `content_signals.pillar_hint`
- [x] D.2 — Pillar quotas: migration `011_pillar.sql`
- [x] D.2 — Pillar quotas: compute `pillar_quota_factor` in scoring
- [ ] D.2 — Pillar quotas: dashboard quota progress bars *(deferred — needs production data)*
- [x] D.3 — publish_score: migration `012_publish_score.sql`
- [x] D.3 — publish_score: build `src/utils/publishScore.js`
- [x] D.3 — publish_score: hourly recompute cron (`recompute-scores.yml`)
- [x] D.3 — publish_score: update publisher to pick highest-scored
- [x] D.3 — publish_score: document slot-pillar mapping (in `pillars.js`)
- [ ] D.3 — publish_score: smoke test *(user action)*

### Week 5–10 (Validation + FR rollout)
- [x] E.1 — boost_eligible IT validation: `logBoostEligibleWindowStart()` implemented (fires on first IT boost_ineligible post)
- [ ] E.1 — boost_eligible IT validation: record start date *(automatic — triggered by first live IT post with boost_eligible=false)*
- [ ] E.1 — boost_eligible IT validation: end-of-window strike check *(user action — Week 5–10)*
- [ ] E.1 — boost_eligible IT validation: flip FR enforcement (if clean) *(user action)*
- [ ] E.1 — boost_eligible IT validation: write validation memo *(user action)*
- [ ] E.1 — boost_eligible IT validation: regenerate FR backlog (if flipped) *(user action)*
- [ ] E.2 — FR_LEGAL_01: engage French press-law specialist
- [ ] E.2 — FR_LEGAL_01: send specialist brief
- [ ] E.2 — FR_LEGAL_01: receive sign-off / iterate
- [ ] E.2 — FR_LEGAL_01: update CONTENT_SYSTEM_PROMPT for presumption language
- [ ] E.2 — FR_LEGAL_01: update validator for regenerate path
- [ ] E.2 — FR_LEGAL_01: smoke test on 2 historic blocked FR articles

### Month 2 (Format expansion)
- [ ] F.1 — Reels: confirm FFmpeg/Kokoro/Whisper stack
- [ ] F.1 — Reels: download Kokoro multilingual voices.bin
- [ ] F.1 — Reels: verify FFmpeg + Whisper installs
- [ ] F.1 — Reels: voice listening test (5 FR + 5 IT samples)
- [ ] F.1 — Reels: build `src/renderers/reel.js`
- [ ] F.1 — Reels: migration `012_reel.sql`
- [ ] F.1 — Reels: extend `facebook.js` for Reels publishing
- [ ] F.1 — Reels: dashboard "Generate Reel" control
- [ ] F.1 — Reels: end-to-end smoke test
- [ ] F.1 — Reels: target 1/week per country
- [ ] F.2 — Carousel: bootstrap Remotion in `renderers/remotion/`
- [ ] F.2 — Carousel: build `Carousel.tsx` template
- [ ] F.2 — Carousel: Node wrapper `src/renderers/carousel.js`
- [ ] F.2 — Carousel: migration `013_carousel.sql`
- [ ] F.2 — Carousel: extend `facebook.js` for carousel publishing
- [ ] F.2 — Carousel: smoke test
- [ ] F.2 — Carousel: unblock `Capire la legge` pillar
- [ ] F.3 — Polls: extend `ai_caption.poll` schema
- [ ] F.3 — Polls: update CONTENT_SYSTEM_PROMPT for poll variant
- [ ] F.3 — Polls: build `src/renderers/poll.js`
- [ ] F.3 — Polls: dashboard poll-preview tab
- [ ] F.3 — Polls: slot logic (FR 12:00, IT 15:30)
- [ ] F.3 — Polls: smoke test
- [ ] F.4 — Story arcs: migration `014_story_arc.sql`
- [ ] F.4 — Story arcs: extend `dedup.js` with `detectStoryArcs`
- [ ] F.4 — Story arcs: follow-on caption template
- [ ] F.4 — Story arcs: arc-aware `publish_score` boost
- [ ] F.4 — Story arcs: dashboard active-arcs view
- [ ] F.4 — Story arcs: smoke test
- [ ] F.5 — Evergreen: generate 50 FR candidates
- [ ] F.5 — Evergreen: user review of FR candidates
- [ ] F.5 — Evergreen: generate 50 IT candidates
- [ ] F.5 — Evergreen: user review of IT candidates
- [ ] F.5 — Evergreen: migration `015_evergreen_stories.sql`
- [ ] F.5 — Evergreen: bulk-insert 30+30
- [ ] F.5 — Evergreen: scheduler weekend integration
- [ ] F.5 — Evergreen: update `last_used_at` on use
- [ ] F.5 — Evergreen: unblock `Retour sur` + `Storie italiane` pillars
- [ ] F.6 — Experiments: document protocol in `experiments-2026.md`
- [ ] F.6 — Experiments: run Experiment 1 (IT legal-citation hook)
- [ ] F.6 — Experiments: run Experiment 2 (FR binary CTA)
- [ ] F.6 — Experiments: run Experiment 3 (IT image-heavy lead)
- [ ] F.6 — Experiments: write result memos + port winners

### Month 2+ (Triggered)
- [ ] G.1 — Le Bonbon RSS + robots + content check
- [ ] G.1 — Dissapore RSS + robots + content check
- [ ] G.1 — Update sources-audit-france.md
- [ ] G.1 — Update sources-audit-italy.md
- [ ] G.1 — Add to sources.js or document Month 2 defer

### Month 6+ / milestone-gated
- [ ] H.1 — Named-editor revisit at Month 6 (or earlier if track record + budget)
- [ ] H.2 — Italy sister-page revisit at 10k engaged-follower milestone

---

## Cross-cutting concerns / non-task notes

These don't fit a single gap but apply across the plan:

- **No new comments in code** beyond what conventions dictate (per `CLAUDE.md` — no comments unless explaining non-obvious constraints).
- **No `console.log` in production paths** — use `console.error` for errors, structured logs for pipeline output.
- **All migration files** numbered sequentially starting from `005_*` (since `001`–`004` are taken). Verify the highest existing migration before naming.
- **Prompt cache discipline**: the `CONTENT_SYSTEM_PROMPT` is the cache anchor. Keep it ≥ 2048 tokens (per CLAUDE.md). When any of A.3 / A.4 / C.1 / C.2 / F.3 / F.4 changes the prompt, bump a version key so the cache invalidates cleanly.
- **Two prompt copies stay in sync**: `src/services/claude.js` (Node) and `supabase/functions/generate-caption/index.ts` (Deno edge function). Every prompt change must update BOTH.
- **All migrations applied to prod via `supabase db push`** — confirm the supabase CLI is linked to project `nnxtvbolhuvihlpwppbj`.
- **Smoke-testing**: each gap has at least one smoke-test step. Treat these as definition-of-done — a task isn't complete without its smoke test passing.
