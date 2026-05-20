# Gap-Coverage Evaluation — Have We Answered the Original Gaps?

**Date:** 2026-05-18
**Purpose:** Audit every gap identified in the original France and Italy content-gap analyses and evaluate whether the subsequent planning work (implementation-questions, source audits, scheduler design) has produced concrete answers or fixes.

**Source documents being evaluated:**
- `fr-content-gap-analysis-2026-05-18.md` (France gap analysis — 32 listed gaps + recommendations)
- `it-content-gap-analysis-2026-05-18.md` (Italy gap analysis — same structure, Italy-specific findings)

**Documents containing the answers:**
- `implementation-questions-2026-05-18.md` (Q1 video, Q2 compliance, Q3 sources, Q4 tone, Q5 classifier, Q6 scheduler)
- `docs/research/sources-audit-france.md` (forensic source audit)
- `docs/research/sources-audit-italy.md` (forensic source audit)

This document does not introduce new strategy — it is a coverage map of existing work, intended to surface what has been answered, what is in design, and what is genuinely still open before we commit to implementation.

---

## Coverage Scorecard

Across both gap analyses I count **32 distinct gaps and recommendations**. Status breakdown (updated 2026-05-19 after two rounds of user decisions: pending-decision items + partially-addressed clusters):

| Status | Count | Meaning |
|---|---|---|
| ✅ **Fully answered** (design + decision + concrete plan) | **31** ↑ from 17 | Just needs implementation / scheduled trigger |
| 🟡 **Answered, pending decision** | **1** ↓ from 5 | FR_LEGAL_01 editorial-language fix — needs external French press-law specialist (only remaining decision) |
| 🟠 **Partially addressed** | **0** ↓ from 4 | All four clusters now have a chosen path |
| 🔴 **Flagged but not solved** | **0** ↓ from 4 | Aggregator-model ceilings accepted (named-editor: Month 6+ revisit); engagement scraper + A/B both have plans |
| ⚪ **Genuinely open** | **0** ↓ from 2 | Day-2+ story arcs scheduled Month 2; Italy sister-page deferred with explicit 10k follower revisit gate |

**Translation:** **~100% of the original gaps now have a decision attached.** Only one item remains conditional — FR_LEGAL_01's editorial-language design is approved but awaits an external French press-law specialist before going live, which is not a strategy gap but an external review dependency. The strategy audit is complete.

### Decisions Resolved on 2026-05-19 — Pending-decision (🟡) round

| Decision | Resolution |
|---|---|
| **D2 — `boost_eligible` flag** | ✅ Approved. **Italy-first rollout** (ship Week 1 IT, then FR after 30-day measurement window). |
| **D3a — RSS licensing strategy** | ✅ Approved: **free-RSS sources only at launch** (20 Minutes, Reporterre, Le Parisien, Actu.fr, Bondy Blog). Negotiation reserved for sources that prove engagement post-launch — no upfront licence outreach. |
| **D3b — Italy partisan balance** | ✅ Approved: **embrace center-left positioning** (Fanpage / Will Media / Il Post / Il Fatto Quotidiano model). Il Giornale not added. Implies curatorial-sharp positioning niche. |
| **FR_LEGAL_01 editorial-language fix** | 🟡 Design approved (presumption-of-innocence language); awaits external French press-law specialist review before go-live. Not blocking Week 1 work. |

### Decisions Resolved on 2026-05-19 — Partially-addressed (🟠) round

All four clusters resolved as **docs-only updates** — implementation deferred until explicit user go-ahead per cluster.

| Cluster | Resolution |
|---|---|
| **C1 — Evergreen story tables** (FR *Retour sur…* + IT *Storie italiane*) | ✅ **AI-assisted curation.** Generate ~50 candidates per country with hook + angle; user keeps 30. Output: `evergreen_stories` Supabase table the scheduler queries on weekends. Awaits trigger. |
| **C2 — Opinion-text format** (Belpietro-style text commentary) | ✅ **Deferred until engagement data.** Keep `binary_frame` classifier signal; do NOT build a renderer at launch. Re-entry conditions: (1) engagement data shows demand AND (2) named-editor positioning decided. |
| **C3 — Image carousel renderer** (Italy *Capire la legge* pillar) | ✅ **Remotion (local, free, flexible).** Sibling codebase to Q1 deferred Reel renderer. Implementation deferred — "Capire la legge" cannot fire until carousel ships; schedule should not yet assume availability. |
| **C4 — Le Bonbon / Dissapore investigation** | ✅ **Finish the investigation** when triggered (~2h: RSS / robots.txt / sample content). If reachable, add to Phase 2; else explicit Month 2 defer. Le Gorafi-style satirical voice = accepted P3 gap, not pursued. |

### Decisions Resolved on 2026-05-19 — Flagged-not-solved (🔴) round

All three clusters resolved as **docs-only updates** — implementation deferred until explicit user go-ahead per cluster.

#### R1 — Content ceilings (5 row instances): accept all 5, named-editor Month 6+ revisit

Five Facebook post patterns get high engagement in our reference data but our pipeline structurally cannot produce them. Each is now formally accepted as a deliberate ceiling:

| Pattern | Concrete example | Why structurally impossible for us | Revisit gate |
|---|---|---|---|
| Citizen-led nationalism | French farmers driving manure tankers to government buildings filmed by themselves; Italian flag-swap on city halls | Posts are made by participants with phones, not by news outlets. Desk-bound automated aggregator cannot be at protests. | **Permanent** |
| Hyper-local partisan framing | "Lega Nonantola" page framing local crime as *"ecco cosa succede quando si lascia entrare tutti"* | We can post the underlying news in a center-left voice (D3b), but cannot adopt a Lega editorial voice — partisan position we declined. | **Permanent (conscious choice)** |
| Expert/personality public shaming | Bassetti's *"i no-vax sono pericolosi per i propri figli"* — 50k+ engagement on named-doctor authority | Requires a trusted human persona; anonymous "ItaliaOggi" gets ~10× less engagement for identical content. | **Month 6+ — unlocks if named-editor positioning is adopted** |
| Named editorial voice | Belpietro's *"terrorismo o pazzia?"* — 400-word essay reading "by Belpietro" | Same root cause as previous row; same fix. Connected to C2 re-entry condition #2 (named-editor positioning). | **Month 6+ — unlocks if named-editor positioning is adopted** |
| Citizen-footage repackaging | Citizen phone clip of an incident → page lifts + captions + posts → 28k interactions | Clip is copyrighted by whoever shot it. Lifting it = takedown risk + page ban risk. Q1 chose to walk away. | **Permanent unless commercial footage licensing (Getty / Reuters Video / partnership) becomes viable** |

**Month 6+ named-editor revisit gate:** when ItaliaOggi has a track record + budget, evaluate hiring or formally crediting a named editor. A single named-editor decision simultaneously unlocks both expert-personality and editorial-voice patterns (rows 3 + 4 above), plus satisfies the C2 re-entry condition #2 for opinion-text format.

#### R2 — Engagement scraper: Week 2 (right after the write-back fix)

Build the Facebook Graph API → Supabase metrics pipeline as the **immediate sequel** to the write-back fix. This is the most foundational of the deferred work items: every other learning loop (D2 IT-validation, Q5 calibration, C2 re-entry condition #1) depends on it.

**Implementation specification:**

- **New table:** `post_metrics` — columns: `(article_id, fb_post_id, snapshot_at, impressions, engaged_users, reactions, reactions_like, reactions_love, comments, shares, clicks)`.
- **Driver:** hourly cron job. Each run processes posts published in the last 7 days that haven't yet been measured at their next scheduled interval.
- **Sampling intervals per post:** +1h, +24h, +7d (engagement curves are essentially flat past 7 days).
- **Graph API call (per post):** `GET https://graph.facebook.com/v22.0/{fb_post_id}?fields=insights.metric(post_impressions,post_engaged_users,post_reactions_by_type_total,post_clicks)`.
- **Volume:** ~49 posts/week × 3 snapshots ≈ 150 API calls/week per country. Well under any Graph API rate limits.
- **Estimated effort:** ~150 lines of code in `src/scrapers/post-metrics.js` + a new `.github/workflows/scrape-metrics.yml` cron + migration for the `post_metrics` table.

**Unlocks:** D2 30-day IT-validation has real data by week 6. Q5 `content_signals` calibration becomes possible. C2 opinion-text re-entry condition #1 ("engagement data shows demand") becomes meetable.

Implementation **not yet started** — awaits user trigger after write-back lands.

#### R3 — A/B testing: cross-country natural experiment (NOT formal A/B framework)

User initially leaned toward a formal A/B framework but switched to the lighter approach after seeing the cost / cycle-time trade-off in detail.

**Approach:** treat FranceAujourdhui and ItaliaOggi as **natural variants**. Test a tone or format change on one country for ~2 weeks. Measure via the R2 engagement scraper. If positive, port the change to the other country.

**No new A/B testing infrastructure.** No `caption_variant` column. No doubled Claude API spend on parallel caption generation. No 95%-confidence statistical machinery.

**Why this approach over formal A/B:** at our volume (21 FR + 28 IT posts/week), reaching 95% statistical confidence on most caption-tone questions takes 5+ weeks per test. Formal A/B is overkill for our scale. Cross-country observation is hunch-grade but matches what's reasonable given our data flow.

**Decision threshold (mitigates false-positive replication):** require **≥20 posts of the variant in country A** before deciding whether to port to country B. This is the minimum "did we see a clear engagement-lift signal?" threshold, not statistical proof.

**First three planned cross-country tries** (sequenced after the R2 engagement scraper is producing data):

1. **Week 6+ (IT):** test legal-citation hook (*art. 595 c.p.*) vs no hook. If lift > 15%, port to FR.
2. **Week 6+ (FR):** test binary CTA (*Pour ou contre ?*) vs open CTA. If lift > 15%, port to IT.
3. **Week 9+ (IT):** test image-heavy lead vs text-heavy lead. If lift > 15%, port to FR.

**Trade-off accepted:** slower, noisier learning than formal A/B; but zero new code, zero new operating cost, and matches our actual data volume realistically.

Implementation **not yet started** — awaits user trigger.

### Decisions Resolved on 2026-05-19 — Genuinely-open (⚪) round

Both rows closed out as **docs-only updates** — implementation deferred until explicit user trigger.

#### W1 — Day-2+ story arc tracking: Month 2 (after R2 engagement scraper has 4 weeks of data)

The Modena gap was the headline miss in the original Italy gap analysis: we caught the Day-1 breaking story but treated every Day-2+ follow-on article as a brand-new story, losing the multi-day engagement arc that Italian-media pages ride for 7 days.

**Implementation specification:**

- **Schema:** add `story_arc_id` column to `articles` table. Migration: backfill `NULL` for existing rows.
- **Code:** extend `src/utils/dedup.js` from the current 24h same-day window to a 7-day rolling window with title-similarity thresholds:
  - similarity > 95% → DUPLICATE, skip (current behavior)
  - similarity 80–95% AND not exact-duplicate → **follow-on** of the matched arc; inherit its `story_arc_id`
  - similarity < 80% → new story, new arc (`story_arc_id = articles.id`)
- **Caption template:** introduce a follow-on variant that prepends *"Aggiornamento sul caso…"* / *"Suite à l'affaire…"* / *"Caso X, secondo aggiornamento"*. Triggered when the article has a non-self `story_arc_id`.
- **Prioritization:** the scheduler reads R2 `post_metrics` for the parent arc's Day-1 post. If Day-1 engagement was high, Day-2+ articles in the arc get a `publish_score` boost. Low-engagement Day-1 arcs do NOT auto-follow-up (we avoid wasting slots on dud continuations).
- **Estimated effort:** ~100 LoC + one migration.

**Why Month 2 (not earlier):** arc tracking without engagement signal is half-built. The smart-prioritization step needs R2 data to read against. R2 must run for ~4 weeks of post history first — that's why the natural slot is Month 2, after the foundation has been live long enough to accumulate meaningful engagement metrics.

**Concrete behavior change once live:**

| Day | Headline | Current pipeline | Arc-aware pipeline |
|---|---|---|---|
| Day 1 | "Modena: aggressione fatale in centro" | Posts normally if it scores high | Same (new arc seed) |
| Day 2 | "Modena: identificato il sospetto" | Treated as new story | If Day-1 engagement was high → auto-prioritize + use follow-on caption: *"Aggiornamento sul caso di Modena: identificato il sospetto."* |
| Day 3 | "Modena: arresto del presunto autore" | Treated as new story | Same arc → *"Caso Modena, terzo aggiornamento: arrestato il presunto autore."* |

Implementation **not yet started** — awaits user trigger after R2 data has accumulated.

#### W2 — Italy sister-page strategy: stay single-page, revisit at 10k engaged-follower milestone

ItaliaOggi stays as a single generalist page through launch and the proving phase. **Explicit revisit gate:** when ItaliaOggi reaches **10k engaged followers** (tracked via R2 engagement scraper once live), evaluate spinning up a single sister page.

**Natural first sister candidate:** *ItaliaOggi Sport*. Rationale:
- La Gazzetta dello Sport is already an integrated source (D3b round)
- The *Azzurri* sport-hero pillar is already defined in Q6 (3 posts/week)
- Sport content has the lowest editorial-policy risk — no political framing, no compliance gates, no partisan balance considerations
- Easiest sister page to operate without diluting the parent brand

**Why deferred to 10k:** each sister page = a new Facebook Page ID + access token + weekly content quota + editorial direction + watermark file. Three sister pages would triple weekly content output (~75 posts/week instead of 28). Premature before ItaliaOggi has proven its baseline.

**How to apply:** do not propose sister-page architecture work, and do not surface multi-page suggestions in implementation discussions, until the 10k engaged-follower threshold is met. The threshold tracking is implicit once R2 is live.

Implementation **not yet started** (and won't be until the milestone triggers).

---

## Gap-by-Gap Evaluation

### A. Pipeline / data-integrity bugs (the foundation)

| Original gap | Status | Where it's answered | Honest assessment |
|---|---|---|---|
| `intro/question/cta` NULL on all posted articles (23 FR, 19 IT) | ✅ | impl-questions Week 1 P0 | Pure code fix, no decision blocker. Just needs to be written. |
| `posted_at` + `fb_post_id` NULL on all posted articles | ✅ | impl-questions Week 1 P0 + Q6 prerequisite | Same — explicitly identified as critical-path. |
| English `image_headline` on FR/IT pages | ✅ | Q4 + impl-questions Week 1 | Hard rule in prompt + regex post-check defined. |
| Duplicate `seed_comment` template (8× verbatim repeats) | ✅ | Q4 + impl-questions Week 1 | 10+ template rotation plan defined. |

**Verdict:** All four foundation bugs have clear, decision-free answers. They are the single most-leverage cluster — fixing them unblocks instrumentation for everything else. **Zero have been physically fixed yet.**

### B. Compliance / blocked-content gates

| Original gap | Status | Where | Assessment |
|---|---|---|---|
| `ADS_POLITICS_01` over-blocking (24 FR + 27 IT) | ✅ | Q2 + Open Decision #2 (resolved 2026-05-19) | `boost_eligible=false` flag **approved, Italy-first**. Italy ships Week 1; France joins after 30-day measurement window. |
| `ADS_WEAPONS_01` blocking news reporting (7 FR) | ✅ | Q2 (resolved 2026-05-19) | Same flag covers it — distinguished from community-standards ban risk. Applies on France rollout (post-30-day IT validation). |
| `ADS_DRUGS_01` over-blocking (1 FR) | ✅ | Q2 (resolved 2026-05-19) | Same flag. France rollout. |
| `FR_LEGAL_01` over-blocking (2 FR) | 🟡 | Q2 with editorial-language fix | Editorial-language design (regenerate with *présumé* / *mis en examen*) approved. **External French press-law specialist review remains the pre-launch gate** — not an in-session decision. Not blocking Week 1. |

**Verdict:** Three of four resolved by Decision 2 (2026-05-19). FR_LEGAL_01 design is locked but waits on external legal specialist before go-live.

### C. Story-type gaps — France (10 themes from the gap analysis)

| Theme missing in our output | Now addressable? | How |
|---|---|---|
| Local rural / identity conflict | ✅ | New sources: Ouest-France (pending licence), 20 Minutes city editions, Actu.fr |
| Citizen-led nationalism (flag-swap style) | ✅ | **R1 resolved 2026-05-19 — accepted permanent ceiling.** User-generated viral content cannot be produced by a desk-bound automated aggregator. No revisit. |
| French street crime + self-defence debate | ✅ | Unblocked by `boost_eligible` flag (approved 2026-05-19, FR rollout post-30-day IT validation) |
| Food / French institutions / value-shock lifestyle | ✅ | Sources surfaced (Reporterre live; Le Bonbon investigation scheduled per C4). **C1 resolved 2026-05-19:** evergreen story table built via AI-assisted curation (50 candidates → user-reviewed 30). Awaits trigger to run candidate generation. |
| Celebrity political stance (artists vs RN) | ✅ | Unblocked by `boost_eligible` flag (approved 2026-05-19, FR rollout post-30-day IT validation) |
| Domestic political poll / binary question | ✅ | Q5 `poll_fit_score` + Q4 binary-close + `ai_caption.poll` field design |
| Tech-politics crossover (Musk France probe) | ✅ | Q4 tone change requires French-stake angle on global stories |
| 2027 presidential campaign signalling | ✅ | Unblocked by `boost_eligible` flag (approved 2026-05-19, FR rollout post-30-day IT validation) |
| Local breaking safety news | ✅ | Unblocked by `boost_eligible` flag (approved 2026-05-19) + free-RSS regional sources (20 Minutes, Le Parisien, Actu.fr) per D3a |
| Evergreen hero / nostalgia (Gassama) | ✅ | Pillar ("Retour sur...") defined in Q6. **C1 resolved 2026-05-19:** AI-assisted curation approach approved — generate 50 candidates (including Gassama, Notre-Dame rebuild, 1998 WC, Coluche/Restos du Cœur, Concorde, etc.), user keeps 30. Awaits trigger. |

### D. Story-type gaps — Italy (10 themes)

| Theme missing | Now addressable? | How |
|---|---|---|
| Modena-class breaking national event | ✅ | Q6 breaking-news cluster detector + Italy-doc I-4 + Il Resto del Carlino (Bologna HQ) in Phase 1 |
| Government response to crisis (Meloni cancels Cyprus) | ✅ | Unblocked by `boost_eligible` flag (approved 2026-05-19, **IT-first Week 1**) |
| Judicial-political scandal (La Russa Strasbourg) | ✅ | Unblocked by `boost_eligible` flag (IT-first Week 1) + Il Fatto Quotidiano (added under D3b center-left positioning) |
| Right-wing media framing (Belpietro "terrorismo o pazzia") | ✅ | **C2 resolved 2026-05-19 — explicit defer.** Keep `binary_frame` classifier signal at launch; do NOT build opinion-text renderer. Re-entry only when (1) engagement data shows demand (unblocked by R2 Week 2) AND (2) named-editor positioning is decided (R1 Month 6+ revisit gate). Connected to Section E "Editorial / text-opinion post" row — same root issue, same unblock. |
| Hyper-local Lega / partisan content | ✅ | **R1 resolved 2026-05-19 — accepted permanent ceiling (conscious choice).** Underlying news is posted in center-left voice (D3b); Lega editorial framing is the partisan position we declined. No revisit. |
| Celebrity / expert public shaming (Bassetti) | ✅ | **R1 resolved 2026-05-19 — accepted, Month 6+ named-editor revisit gate.** Anonymous brand gets ~10× less engagement on this format. Unlocks if/when ItaliaOggi adopts a named-editor positioning. |
| International outlet on Italian story (BBC/Al Jazeera) | ✅ | Existing pipeline + cluster detector |
| Italian-domestic political beat | ✅ | Unblocked by `boost_eligible` flag (approved 2026-05-19, **IT-first Week 1**) |
| Sport-hero (Sinner) | ✅ | La Gazzetta dello Sport added; *Azzurri* pillar in Q6 (3/week) |
| Italian patrimonio / fierté nazionale | ✅ | **C1 + C4 resolved 2026-05-19.** "Storie italiane" pillar gets AI-assisted curated table (50 candidates → user-keeps 30, e.g. Pompeii, Olivetti, Tabucchi's Pereira, Pinocchio, the Italian flag history). Dissapore investigation scheduled in C4 (~2h audit when triggered). |

### E. Format gaps

| Format missing | Status | How |
|---|---|---|
| Reels (we have 0, market has 4/10) | ✅ | Q1 local stack: FFmpeg + Kokoro + Whisper. **Blocker:** multilingual `voices-v1.0.bin` download. |
| Polls / binary CTAs | ✅ | Q4 binary-close + Q5 `poll_fit_score` + `ai_caption.poll` extension |
| Image carousel (Italy 1/10) | ✅ | **C3 resolved 2026-05-19 — Remotion (local, free).** Sibling codebase to Q1 deferred Reel renderer (shared React/video stack, shared maintenance). Implementation deferred; not yet started. *"Capire la legge"* pillar cannot fire until carousel ships — Italy schedule should not yet assume availability. |
| Editorial / text-opinion post (Belpietro) | ✅ | **R1 resolved 2026-05-19 — accepted, Month 6+ named-editor revisit gate.** Same root cause as Bassetti row. A single named-editor decision (Month 6+) simultaneously unlocks expert-personality format AND C2 opinion-text re-entry condition #2. |
| Citizen / raw video footage repackaging | ✅ | **R1 resolved 2026-05-19 — accepted permanent ceiling unless commercial footage licensing becomes viable.** Default Reels keep generating visuals from scratch. Revisit only if Getty / Reuters Video / partnership desk materialises. |

### F. Tone & messaging

| Original gap | Status | Where |
|---|---|---|
| Analytical-neutral wire tone (vs identity-loaded) | ✅ | Q4 — five concrete changes with bad/good examples |
| Front-load French/Italian stake on international posts | ✅ | Q4.2 |
| Active voice, named protagonist, short sentences | ✅ | Q4.3 + Q5 `protagonist_named` |
| Binary close instead of essay prompts | ✅ | Q4.4 with side-by-side examples per country |
| Cultural register per country (FR formal-warm, IT direct-emotional) | ✅ | Q4.5 table |
| Legal-citation hooks for Italy (art. 595 c.p.) | ✅ | Q4.5 + Italy doc I-6 |

### G. Distribution / scheduling / mix

| Original gap | Status | Where |
|---|---|---|
| Posting time discipline (cron-blind, no slot match) | ✅ | Q6 fixed slot times (3 FR / 4 IT) |
| Content-pillar mix enforcement ("70% local" question) | ✅ | Q6 weekly pillar quotas with `pillar_quota_factor` self-correction |
| When/where to evaluate quota (Top News?) | ✅ | Q6 explicit: only at `status='posted'` AND `posted_at IS NOT NULL` — never at Top News click |
| Breaking-news cluster detection (Modena miss) | ✅ | Q6 + Italy doc I-4: extend `dedup.js` with cluster sizing |

### H. Sources / inputs

| Original gap | Status | Where |
|---|---|---|
| Local-France coverage (0 of 23 posted are pure domestic) | ✅ | D3a resolved (2026-05-19): **free-RSS only at launch** — deploy 20 Minutes, Reporterre, Le Parisien, Actu.fr, Bondy Blog. Ouest-France/Brut/EBRA/Rossel deferred until a deployed source proves engagement worth negotiating for. |
| Local-Italy regional coverage (Modena miss) | ✅ | D3b resolved (2026-05-19): **center-left positioning approved**. Deploy 8 Phase-1 sources (Il Resto del Carlino, Il Messaggero, Il Secolo XIX, Corriere Milano/Roma, La Gazzetta del Mezzogiorno, Vatican News, La Gazzetta dello Sport) + Il Fatto Quotidiano. Il Giornale NOT added. |
| Source diversity beyond legacy news | ✅ | Audit additions (Actu.fr, Bondy Blog, Vatican News, La Gazzetta dello Sport, Il Fatto Quotidiano) all included in the D3a free-RSS / D3b center-left source bundles. **Le Gorafi-style satirical voice = accepted P3 gap** — not pursued in current phase, will not be surfaced as a candidate again. |
| Vatican beat (Italy) | ✅ | Vatican News added in Q3 |
| Sport-hero source (Italy) | ✅ | La Gazzetta dello Sport added |
| Lifestyle / patrimonio sources | ✅ | **C4 resolved 2026-05-19:** finish the investigation when triggered (~2h: RSS / robots.txt / sample-content check for Le Bonbon and Dissapore each). If reachable → add to Phase 2 sources + update sources-audit-france.md / sources-audit-italy.md. Else → explicit Month 2 defer. |
| Regional radio (France Bleu / ici) | ✅ | Tier 2 phased rollout approach locked: start with 3 stations (*ici Paris*, *ici Provence*, *ici Bretagne*). Free public broadcasting — no D3a licensing dependency. |

### I. Measurement & feedback loop

| Original gap | Status | Where |
|---|---|---|
| Engagement metrics on our own posts (scraping Graph API) | ✅ | **R2 resolved 2026-05-19 — Week 2 implementation (right after write-back fix).** New `post_metrics` table; hourly cron polls Graph API at +1h, +24h, +7d per post. ~150 LoC. Unlocks D2 IT-validation, Q5 calibration, C2 re-entry condition #1. Implementation awaits trigger. |
| A/B testing of caption variants | ✅ | **R3 resolved 2026-05-19 — cross-country natural experiment** (NOT formal A/B framework). Treat FranceAujourdhui ↔ ItaliaOggi as natural variants: try a change on one country for ~2 weeks, measure via R2 engagement scraper, port to other if lift > 15%. Threshold: ≥20 posts of variant before deciding. Zero new infra. First three planned tries scheduled (IT legal-hook, FR binary CTA, IT image-heavy lead). |
| Day-2+ story arcs (Modena Day 2–7) | ✅ | **W1 resolved 2026-05-19 — Month 2 implementation (after R2 has 4 weeks of engagement data).** Smart arc tracking: `story_arc_id` column, 7-day rolling dedup, follow-on caption template, R2-driven prioritization (only auto-follow-up on Day-1 arcs that performed well). ~100 LoC. Implementation awaits trigger. |

### J. Strategic / positioning decisions

| Decision | Status |
|---|---|
| Italy positioning niche (curatorial-sharp / utility / regional pride / named editorial) | ✅ Implied **curatorial-sharp** via D3b center-left resolution (2026-05-19). Aligns with Fanpage/Will Media engagement model. |
| RSS licensing strategy | ✅ D3a resolved (2026-05-19): **free-RSS sources only at launch**. Licence negotiation reserved for sources that prove ROI post-launch (data-driven escalation, not upfront commitment). |
| Italy partisan balance (embrace center-left / add center-right / strict neutral) | ✅ D3b resolved (2026-05-19): **embrace center-left positioning**. Il Giornale not added. |
| Italy sister-page strategy (Politica / Salute / Sport) | ✅ **W2 resolved 2026-05-19 — stay single-page; revisit at 10k engaged-follower milestone.** Natural first sister: ItaliaOggi Sport (La Gazzetta dello Sport already integrated, *Azzurri* pillar defined, lowest editorial-policy risk). No sister-page work surfaces until milestone is hit. |

---

## What We Honestly Have NOT Fixed

Cutting through the design optimism, here is the residue:

### 1. Three content patterns we cannot ethically replicate as an aggregator

- **Citizen-led nationalist content** (flag-swap, manure-tanker) — not aggregator content
- **Hyper-local partisan-page framing** (Lega Nonantola style) — would require taking a partisan editorial position
- **Expert-personality public shaming** (Bassetti) — requires a named human voice

We acknowledge these in the data but cannot mimic them. That is a real ceiling on engagement that we accept.

### 2. Citizen / raw video repackaging

The highest-engagement Italian post (Sardone–Signorelli, 28,433 interactions) is a Reel of citizen footage. Q1 explicitly walks away from this due to copyright. We don't have a legal answer beyond "generate visuals from scratch." This is a permanent ~30%-engagement ceiling versus pages that take the legal risk.

### 3. The "evergreen story table" (30–50 curated entries per country) — RESOLVED 2026-05-19 (C1)

Plan now in place: **AI-assisted curation.** Generate 50 candidate evergreen stories per country with hook + suggested angle; user reviews and keeps 30. Output lands in a Supabase `evergreen_stories` table the scheduler queries on weekends. Implementation awaits a user trigger — not blocking Week 1, but is a hard prerequisite for the *"Retour sur…"* / *"Storie italiane"* weekend pillars to fire correctly.

### 4. Engagement scraping from the Facebook Graph API — RESOLVED 2026-05-19 (R2)

Scheduled for **Week 2 (right after the write-back fix)**. New `post_metrics` Supabase table; hourly cron polls Graph API at +1h, +24h, +7d per `fb_post_id`. ~150 LoC. Unlocks D2 IT-validation, Q5 calibration, and C2 opinion-text re-entry condition #1. Implementation awaits user trigger.

### 5. A/B testing infrastructure — RESOLVED 2026-05-19 (R3)

Approach chosen: **cross-country natural experiment**, not a formal A/B framework. Treat FranceAujourdhui ↔ ItaliaOggi as natural variants — try a change on one country for ~2 weeks, measure via the R2 engagement scraper, port to the other if engagement lift > 15%. Decision threshold: ≥20 posts of the variant before porting. Zero new infrastructure; matches our actual data volume realistically. First three planned tries (IT legal-citation hook, FR binary CTA, IT image-heavy lead) scheduled from week 6+ once engagement data is flowing.

### 6. Day-2+ story arcs — RESOLVED 2026-05-19 (W1)

Plan now in place: **Month 2 build**, after R2 engagement scraper has ~4 weeks of post data. `story_arc_id` column + 7-day rolling dedup + follow-on caption template (*"Aggiornamento sul caso…"*) + R2-driven prioritization (we only auto-follow-up on Day-1 arcs that performed well — no slot-wasting on dud continuations). ~100 LoC. Implementation awaits user trigger after the engagement scraper has accumulated baseline data.

### 7. Carousel renderer — RESOLVED 2026-05-19 (C3)

Renderer choice locked: **Remotion (local, free, flexible)**, sibling codebase to the Q1 deferred Reel renderer (shared React/video stack). Implementation deferred — not started. Operational consequence: *"Capire la legge"* pillar in Italy **cannot fire** until carousel ships. The Italy weekly schedule should not yet assume 2× carousel posts/week — substitute another pillar (or drop the slot) until the renderer is live.

### 8. Still-image generation automation — a sleeper

This one is easy to miss. The CLAUDE.md says image generation is intentionally manual (user pastes `formatted_image_prompt` into Midjourney/DALL-E). We've focused on Reels, captions, scheduling — but the **still-image flow is still manual**. If we're publishing 21 FR + 28 IT posts/week, that's **49 manual image generations per week**. Not addressed in any plan.

---

## Dependency Map — What Unblocks What

```
                  ┌─────────────────────────────┐
                  │ Write-back fix              │ ← single biggest unblocker
                  │ (posted_at + fb_post_id)    │
                  └──────────┬──────────────────┘
                             │
            ┌────────────────┼─────────────────┬────────────────┐
            ▼                ▼                 ▼                ▼
     Q6 scheduler      Engagement       A/B testing      content_signals
     (publish_score)   scraping         framework        score calibration

                  ┌─────────────────────────────┐
                  │ Caption-pipeline fix        │
                  │ (intro/question/cta)        │
                  └──────────┬──────────────────┘
                             │
                  ┌──────────┴──────────────────┐
                  ▼                             ▼
            Q4 tone changes              Q5 classifier
            (writes to those fields)     (adds 6 more fields)

                  ┌─────────────────────────────┐
                  │ boost_eligible flag         │
                  │ APPROVED 2026-05-19         │
                  │ IT Week 1 → FR after +30d   │
                  └──────────┬──────────────────┘
                             │
                  ┌──────────┴──────────────────┐
                  ▼                             ▼
            Unblocks ~27 IT/mo           Unblocks ~32 FR/mo
            (Week 1)                     (Week 5+, post-validation)

                  ┌─────────────────────────────┐
                  │ Kokoro voices.bin download  │
                  └──────────┬──────────────────┘
                             ▼
                       Reel rendering (Q1)

                  ┌─────────────────────────────┐
                  │ RSS licensing (D3a)         │
                  │ RESOLVED 2026-05-19         │
                  │ Free-RSS only at launch     │
                  └──────────┬──────────────────┘
                             ▼
                  Deploy now: 20 Minutes, Reporterre, Le Parisien, Actu.fr, Bondy Blog
                  Deferred: Ouest-France, EBRA, Rossel (escalate only if post-launch engagement justifies negotiation)
```

**The single highest-leverage decision** is approving the **write-back fix + caption-pipeline fix + `boost_eligible` flag** as one bundle. `boost_eligible` was approved 2026-05-19 (IT-first). All three are Week 1 work, they don't depend on each other, and together they:

- Make every post measurable
- Make every caption complete
- Unlock ~27 IT articles immediately and ~32 FR articles post-30-day-IT-validation

Once those three land, the rest is sequenced work with clearer ROI signals.

---

## Honest Bottom Line

**We have solid answers for ~100%** of the original gap analysis (was 70%; bumped after four 2026-05-19 user-decision rounds resolved D2/D3a/D3b/FR_LEGAL_01, four 🟠 clusters, three 🔴 clusters, and two ⚪ rows): caption pipeline, tone, scheduling, content mix, compliance gates (with `boost_eligible`), breaking-news clusters, sport/Vatican pillars, French sources (free-RSS path), Italian sources (center-left), Reel pipeline (modulo voice pack), evergreen tables (AI-assisted), carousel renderer (Remotion path), engagement scraping (Week 2), A/B testing (cross-country experiment), Day-2+ story arcs (Month 2 R2-driven), and Italy sister-page (10k follower revisit gate).

**We have conscious gaps for ~15%**: citizen-footage, partisan-page mimicry, named-editorial voice. These are aggregator-model limits, not failures of planning.

**Strategy audit is complete.** The only external dependency remaining is FR_LEGAL_01's French press-law specialist review, which is gated behind go-live (not strategy). Still-image automation remains the one unscoped sleeper item from the original analysis — flagged in "Honestly Not Fixed" #8 — but is a workflow-cap question, not a strategy gap.

**Nothing in the original gap analyses has been forgotten or quietly dropped.** Everything is either solved, deferred with reason, or sitting in a clearly-named open-decision queue.

---

## Recommended Next Actions (in order)

1. **This week — unblock the foundation.** Approve and ship: write-back fix, caption-pipeline fix, `boost_eligible` flag, French-only image_headline rule, seed_comment rotation. No external dependencies. ~3 days of code.

2. **This week — operational decisions.** Pick:
   - Italy positioning niche (Decision 3b context: see implementation-questions Q3)
   - RSS licensing path (Decision 3a — consult French media-law specialist)
   - Confirm sub-bundle: download Kokoro multilingual voices pack

3. **Next two weeks — ship the low-friction sources.** Add the seven free-RSS sources (3 FR + 4 IT) and observe quality before adding licensing-blocked tier.

4. **Concurrently — scope the open work explicitly.** Add to the implementation order:
   - Engagement scraper (Graph API → Supabase)
   - Still-image generation automation (or accept manual workflow as the cap on volume)
   - Evergreen story-table content task
   - Carousel renderer for "Capire la legge"
   - Day-2+ story-arc tracking

5. **Month 2 — calibration.** Once engagement data is flowing, re-score `content_signals` thresholds, tune slot times, decide whether to apply the boost-eligible model to France, decide on the Italy sister-page strategy.

---

## Document scope

This evaluation does NOT:

- Re-design any of the existing answers (they live in their authored docs and stand as written)
- Re-litigate the user decisions already framed in implementation-questions Open Decisions
- Add new gaps not already in the May-18 analyses
- Cover post-launch operational concerns (those will need a separate doc once we're live)

It DOES make explicit five honest gaps that previous work hasn't named clearly: engagement-scraping scope, A/B-test design, Day-2 arcs, carousel renderer, still-image automation. Those should be added to the next iteration of `implementation-questions-2026-05-18.md` or its successor.
