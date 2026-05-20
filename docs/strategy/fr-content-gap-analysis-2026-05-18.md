# France Content Strategy — Gap Analysis vs Market Trending Posts

**Page analysed:** [facebook.com/FranceAujourdhui](https://www.facebook.com/FranceAujourdhui)
**Date:** 2026-05-18
**Our sample:** All 248 FR articles in Supabase from the last 30 days — 23 posted, 191 pending, 34 blocked by compliance gates, 0 approved-but-unposted, 0 rejected.
**Market sample:** 10 high-engagement FR Facebook posts (May 17–18, 2026), provided in the brief.

---

## Executive Summary

The France page is publishing **wire-service geopolitics with neutral captions and static images**, while the French Facebook market is rewarding **local identity drama, Reels, polls, and emotionally polarised storytelling**. Three structural choices are the root cause:

1. **Source mix is too foreign-policy heavy.** 70%+ of our 23 posts are Middle East / Ukraine / US-China. Trending posts are 80% domestic — gens du voyage, knife attacks in Rennes, Place de la République, Macron's authority, French buffets.
2. **Format mix is zero-variance.** 100% static images. 40% of the trending sample are Reels.
3. **The compliance gate is filtering out the engagement layer.** 34 articles were blocked by `ADS_POLITICS_01` (24), `ADS_WEAPONS_01` (7), `FR_LEGAL_01` (2), `ADS_DRUGS_01` (1) — i.e. precisely the political and crime stories that drive viral threads on French FB (Nantes fusillade, Sarkozy procès, RN/Glucksmann, Macron, Ruffin 2027). We are optimising for ad-boost eligibility while the market wins on organic.

The single highest-leverage decision is **separating "boost-eligible" from "organic-only" tracks** so we stop self-censoring domestic news that we cannot legally boost but can absolutely post.

---

## 1. Gap Analysis — What the Market Has That We Don't

### 1.1 Story-type gaps

| Trending theme (in market) | Our posted output last 30d | Gap |
|---|---|---|
| **Local rural / identity conflict** (farmer vs caravans) | 0 | Major — we have zero "France drama" content |
| **Citizen-led nationalism / symbolic acts** (Place de la République flag) | 0 | Major — we publish *about* nationalism abroad, never *embody* it locally |
| **French street crime + self-defence debate** (BFMTV car-theft death, Rennes knife attack) | 0 (7 stories blocked by `ADS_WEAPONS_01`) | **Self-inflicted** — blocked by our own gate |
| **Food / French institutions / value-shock lifestyle** (€60 lobster buffet) | 0 | Major — page has zero "fierté française" content |
| **Celebrity political stance** (Camille Cottin et al. vs RN) | 0 (multiple Cannes pieces blocked or in pending) | Self-inflicted via `ADS_POLITICS_01` |
| **Domestic political poll / binary question** (Macron authority) | 0 | Major — no poll mechanic, no Reel mechanic |
| **Tech-politics crossover** (Musk France probe) | Posted Trump-Xi but not Musk-France | Partial — we cover global politics but miss the *French angle* |
| **2027 presidential campaign signalling** (Mélenchon) | 0 (Attal, Ruffin, Glucksmann all blocked) | Self-inflicted via `ADS_POLITICS_01` |
| **Local breaking safety news** (Rennes knife) | 0 | Self-inflicted via `ADS_WEAPONS_01` (Nantes fusillade blocked) |
| **Evergreen hero / nostalgia / pride** (Gassama rescue) | 0 | Major — we only publish breaking news, never resurfaced classics |

**Source diversity gap.** Our 23 posted articles draw from 7 legacy outlets (BFM, France 24, Libé, Le Monde, Le Figaro, L'Obs, France Info). The trending sample includes satirical aggregators (*Le monde part en cacahuète*, 566K), partisan pages (*Patriot One News*, *Erwan Ckissa*), lifestyle/food creators (*eatingwithtod*), and regional papers (*Ouest-France Rennes*). We are missing satirical-tone framing and regional/community-paper voice entirely.

**Tone gap.** Our captions are analytical-neutral ("Tensions frontalières Israël-Liban", "Diplomatie de façade sino-américaine"). The trending posts are absurd-visual, identity-loaded, or value-shock ("UN AGRICULTEUR LES ASPERGE DE PURIN", "how do they make money?", "EMMANUEL MACRON A-T-IL AFFAIBLI L'AUTORITÉ DE L'ÉTAT?").

### 1.2 Format gaps

- **Reels: 0/23 (us) vs 4/10 (market).** Items 2, 4, 7, 8 in the trending sample are Reels — the only format with native algorithmic priority on Facebook in 2026.
- **Polls / binary CTAs: 0/23 vs 1/10.** France Info Live's "OUI / NON" overlay generated 184 comments at 1.6K likes — a ~12% comment-to-like ratio.
- **Carousel / multi-image: 0/23 vs 0/10.** Not a gap, but a missed differentiation opportunity for explainers.
- **Citizen / raw footage: 0/23 vs 1/10.** Authenticity beats production value in polarised cycles (Item 2, the flag swap).

### 1.3 Caption-structure gap

Inspecting our `ai_caption` JSON across all 23 posted articles:

- `intro`: **null in 23/23**
- `question`: **null in 23/23**
- `cta`: **null in 23/23**
- Only `image_headline` + `seed_comment` + `hashtags` are populated.
- The `seed_comment` template `"💬 Et vous, qu'en pensez-vous ? Est-ce que cette nouvelle vous surprend ? Répondez en commentaire — on lit tout. 👇"` appears **verbatim on 8 of 23 posts**.

This is a pipeline-level issue, not a strategy one — the schema supports `intro/question/cta` but they aren't being written. Combined with the duplicate seed comment, the page reads as templated and impersonal.

### 1.4 Engagement mechanic gap

Trending posts engineer **one specific reaction per post**:
- Outrage → "Bravo, il a bien raison" vs "harcèlement" (Item 1)
- Vote → 67/33 binary (Item 7)
- Tag a friend → buffet location (Item 4)
- Identity signal → flag, banner (Items 2, 8)
- Counter-narrative → Gassama as immigration response (Item 10)

Our posts ask the same flavour of analytical question every time ("La médiation actuelle peut-elle aboutir à un accord concret ?"). That asks for an essay, not a one-tap reaction. Comment-rate suffers.

---

## 2. Performance Drivers — Why Each Trending Post Won

| # | Post | Primary driver | Secondary driver | Mechanic |
|---|---|---|---|---|
| 1 | Farmer vs caravans | Live property-rights vs gens du voyage debate | Absurd meme-able visual (manure tanker) | Outrage split — pro/contre in comments |
| 2 | République flag swap | Pure nationalist symbolism | Raw citizen Reel = authenticity | Identity signalling, conspiracy thread |
| 3 | BFMTV car-theft death | Self-defence / "justice laxiste" debate | Red-alert breaking visual | Comments-as-referendum (2,400+) |
| 4 | €60 lobster buffet | Value-shock + food porn | French institution localisation | Tag-a-friend, location confirmation |
| 5 | Artists vs RN | Pre-election cultural anxiety | Celebrity recognition (Cottin) | High comment-to-like ratio (72%) — argument |
| 6 | Musk France probe | Cross-border tech-politics, both camps engaged | "Criminal suspect" framing = urgency | Click + polarised comment |
| 7 | Macron authority poll | Binary vote in caption | Visual chaos (flames, "COLÈRE") | Instant comment-vote |
| 8 | Mélenchon 2027 | Early campaign signalling to loyal base | Quotable speech clip | Activist-group shares |
| 9 | Rennes knife attack | Local safety panic ("fourth this week") | Regional-paper community trust | Residents share experiences |
| 10 | Gassama rescue | Evergreen positive counter-narrative | Nostalgia + national pride | Weekend low-argument likes |

**Cross-cutting patterns:**

- **"Conflict frame" beats "information frame."** 7/10 posts present a dispute, not a fact. Our captions present facts ("Le directeur de la CIA a rencontré de hauts responsables cubains").
- **Local proximity beats global stakes.** Even Item 6 (Musk) wins by Frenchifying a foreign actor. We do the opposite — we cover global stories with no French anchor.
- **Visual rule of thumb:** one strong subject, one declarative French overlay in capitals, color used to signal urgency (red) or value (food). Our `image_headline` outputs sometimes drift into English ("Climate crisis acceleration threat", "Family acceptance, parental love journey", "Hisense Built-in Oven: Smart Deal") — **breaks the French-page contract**.
- **Timing:** 7/10 trending posts hit between 07:00 and 12:35 CEST (morning commuter window). We have no posting-time discipline visible from the data.

---

## 3. Strategic Recommendations (Ranked by Impact × Feasibility)

### P0 — Fix immediately, no policy debate required

1. **Repair the caption pipeline.** All 23 posted articles have `intro/question/cta = null`. The schema, the prompts, and the dashboard expect them. Posts are currently going out as headline + generic seed comment only.
   - Owner: pipeline.
   - Impact: high. Doubles caption surface area, kills the templated feel.

2. **Force `image_headline` to French.** ~6 of 23 posts have English overlays on the FranceAujourdhui page. Enforce in `claude.js` and in the edge function.
   - Owner: prompt change.
   - Impact: high, near-zero cost.

3. **De-duplicate `seed_comment` per post.** The "💬 Et vous, qu'en pensez-vous ?..." line repeats verbatim 8 times. Either generate per article from the article's actual debate, or rotate a pool of 10+ templates with the article's noun substituted in.
   - Impact: medium-high. Audiences notice repetition fast.

### P1 — Reframe what we publish (this week)

4. **Add a "Local France" track.** Today our story mix is 70%+ International. Target: 50% Local France / 25% Geopolitics-with-French-angle / 25% Lifestyle-Culture-Nostalgia.
   - Concretely: add domestic-news sources to `src/config/sources.js` → *Ouest-France*, *La Dépêche*, *20 Minutes*, *Le Parisien*. Bias the criticality scorer in `src/utils/criticality.js` toward stories with French place names.
   - Impact: very high. This is the single biggest gap.

5. **Audit the compliance gates against the page's actual goal.** `ADS_POLITICS_01` and `ADS_WEAPONS_01` blocked 31 of 34 blocked articles — including all 2027 campaign content, Sarkozy procès, Macron decisions, Nantes fusillade. If we are not running paid boost on this page, these blocks cost us our highest-engagement stories.
   - Decision needed: do we boost? If not, downgrade these gates from `blocked` to `organic_only` and publish without ad spend. Add a `boost_eligible: bool` column instead of removing posts entirely.
   - Impact: very high. Unlocks ~31 stories/month we already paid Claude to write.

6. **Introduce Reels (1–2 per week to start).** Pick story types that work in vertical video without original filming: poll Reels (image stack + voice-over question), explainer Reels (3 cards in 30s), and source-attributed citizen-footage repacks where rights allow. The trending Place de la République Reel was raw user footage — no production budget required, only sourcing discipline.
   - Impact: high. Reels still get format priority in 2026.

### P2 — Build new mechanics (next 2–4 weeks)

7. **Add a binary-poll caption variant.** Extend `ai_caption` schema with optional `poll: {question, optionA, optionB, suggestedResults?}`. Render as image overlay (Anton font, two columns). Use sparingly — 1 per 5 posts.

8. **Add an "Evergreen" content pillar.** Once-a-week resurfaced positive French story (heroes, scientific discoveries, sports comebacks, regional traditions). Gassama performed in 2026 because it was *re-told*, not because it was new. Build a curated table of 30–50 evergreen stories and rotate.

9. **Add a "Lifestyle / fierté française" pillar.** Food, regional institutions, value-shock items, "you didn't know this existed in France." Low political risk, high share rate. Source: add *Le Bonbon*, *TimeOut Paris*, *Demotivateur* RSS or NewsAPI queries.

10. **Posting-time discipline.** Trending posts cluster 07:00–12:35 CEST. The pipeline currently fires every 30 minutes via cron — add a posting-time window in `services/facebook.js` so approved posts publish at 07:30, 12:00, and 19:00 CEST rather than whenever cron lands. Track `posted_at` properly (it is NULL on all 23 posted rows — likely another bug).

### P3 — Differentiation bets (next month)

11. **Add satirical-aggregator-style framing for 1 post/week.** Don't compete with *Le monde part en cacahuète* on tone — but learn from it: one absurd visual + capitalised tabloid headline + neutral source attribution.

12. **Build a regional-paper voice.** Trending Item 9 (*Ouest-France Rennes*) wins on community trust. We could add city-tagged posts ("Lille aujourd'hui", "Marseille aujourd'hui") inside the same page — geo-relevant stories surface to local audiences.

---

## 4. Actionable Insights — Concrete Implementation Guide

### 4.1 Content themes and topics to pursue (in priority order)

1. **Local crime + self-defence debate stories** — unblock after compliance audit (Rec #5)
2. **Domestic political beat: 2027 candidates, Macron, RN, LFI** — unblock after compliance audit
3. **Rural / regional identity conflicts** (farmer protests, gens du voyage, agricultural news, water disputes)
4. **French institutions + value shock** (buffets, train tickets, hospital costs, university rankings)
5. **Celebrity political stances** (actors, musicians, sports figures)
6. **Tech-meets-France** (Musk, Tesla, Starlink, Apple stores, foreign tech in French courts)
7. **Evergreen heroes** (Gassama-type retrospectives, weekly)
8. **2027 campaign signalling** (rallies, polls, programme details)
9. **Regional safety / local breaking** (Ouest-France style)
10. **Climate + extreme weather with French place names** (we have one climate post; needs French stakes)

### 4.2 Visual & formatting conventions to adopt

| Element | Current | Target |
|---|---|---|
| Image overlay text language | Mixed FR/EN | French only — hard rule |
| Overlay headline style | Sentence case, neutral | UPPERCASE, declarative, max 12 words |
| Color use | Generic | Red = breaking/alert, Blue = poll, Gold = positive/heroic, Black-and-white = retrospective |
| Format mix per week | 100% static | 60% static / 20% Reels / 15% poll-overlay / 5% carousel |
| Watermark | Anton, 70% opacity bottom-right | Keep — already correct per `CLAUDE.md` |
| Citizen / raw footage | None | Allowed for Reels when rights are clear |

### 4.3 Messaging & tone adjustments

- **Replace "analytical" intros with "conflict" intros.** "Le directeur de la CIA a rencontré..." → "Washington tente un canal secret avec La Havane. Discrétion ou faiblesse ?"
- **Front-load the local stake.** Every International post needs one sentence answering "What does this mean for someone in France?"
- **Reduce dependent clauses.** Trending captions are ≤2 short sentences. Our `image_headline`s already do this; transfer the discipline to `ai_caption.intro` once the pipeline is fixed.
- **End every post with a one-tap CTA, not an essay prompt.**
  - Bad (current): "Le dialogue politique peut-il encore éviter une aggravation des tensions au Tchad ?"
  - Good: "Dialogue, réforme, ou fermeté ? Un mot en commentaire."
- **Rotate seed_comment templates.** Build a pool of at least 10 variants in `claude.js`, parameterised by story_category and criticality. Never reuse verbatim within 7 days.

### 4.4 Content pillars / series ideas

- **🔴 "France en débat"** (3×/week) — domestic conflict stories with binary CTA
- **🟢 "Fierté française"** (2×/week) — food, institutions, evergreen heroes, science
- **🟡 "Le monde vu de Paris"** (2×/week) — international stories framed for French stakes only
- **🔵 "Sondage du jour"** (1×/week) — binary poll Reel or image
- **⚪ "Retour sur..."** (1×/week) — evergreen / nostalgia, posted weekend
- **📍 "Ma ville aujourd'hui"** (1×/week) — regional story with city tag

### 4.5 Posting patterns / timing

- **Window 1 — 07:00–08:00 CEST:** breaking + outrage stories (commuter scroll, all-day argument). Trending Items 1, 4, 5 hit here.
- **Window 2 — 11:30–12:30 CEST:** breaking news graphics (lunchtime). Trending Items 3, 9 hit here.
- **Window 3 — 17:00–20:00 CEST:** Reels + political content (after-work scroll). Trending Items 2, 8, 10 hit here.
- **Weekend mornings:** evergreen / pride content. Trending Item 10 (Gassama) hit Sunday evening.
- **Cap:** max 4 posts/day. Quality > volume on a 0-followers-baseline page.

### 4.6 Immediate implementation checklist

```
[ ] Fix ai_caption pipeline — populate intro/question/cta on every generation
[ ] Enforce French-only image_headline in claude.js and edge function
[ ] Rotate seed_comment templates (≥10 variants, no verbatim repeats within 7 days)
[ ] Decision: are we boosting or organic-only? If organic, downgrade ADS_* gates to boost_eligible flag
[ ] Add domestic sources to src/config/sources.js: Ouest-France, Le Parisien, 20 Minutes, La Dépêche
[ ] Add lifestyle sources: Le Bonbon, TimeOut Paris, Demotivateur
[ ] Add posted_at write-back — currently NULL on all 23 posted rows (separate bug)
[ ] Schedule posts to 07:30 / 12:00 / 19:00 CEST windows instead of cron-when-ready
[ ] Pilot 2 Reels this week — repackaged source clips with French overlay
[ ] Build evergreen story table (30 entries to start)
```

---

## Appendix A — Our 23 posted articles, categorised

**International / Middle East / Geopolitics: 16**
Iran-Lebanon-Israel coverage (10), Trump-Xi (1), Tchad (1), Cuba-CIA (1), Ukraine (1), Pakistan-Iran (1), France-UK Ormuz (1).

**Culture (Cannes): 2**
*Gentle Monster* review, Eye Haïdara ceremony.

**Société / Économie / Santé / Environnement: 5**
Hisense oven deal, fuel app, LGBT parent testimony, fuel-price tracker, hantavirus ship, climate, China inflation.

**Domestic French politics, crime, lifestyle, sport, regional: 0.**

---

## Appendix B — Blocked articles by gate

- `ADS_POLITICS_01`: 24 (Macron, Attal, Ruffin, Glucksmann, Sarkozy, Chikirou, Africa Forward, RN, Cannes politics, telework decree, Charles III, Yale, etc.)
- `ADS_WEAPONS_01`: 7 (Nantes fusillade × 3 framings, Rennes-style stories)
- `FR_LEGAL_01`: 2 (Tunisien terrorisme, Affaire Leprince)
- `ADS_DRUGS_01`: 1 (protoxyde d'azote homicide routier)

**Of the 10 market-trending posts, our pipeline would have blocked at least 4–5** under current gates (Items 1 partially, 3 weapons, 5 politics, 7 politics, 8 politics, 9 weapons). This is the core strategic contradiction.

---

## Appendix C — What I did *not* analyse

- **Engagement metrics on our own posted articles** — not in Supabase. To close the loop, scrape `likes/comments/shares` from each `fb_post_id` and store them; without this we are reasoning from market data only, not from our own response curve.
- **A/B testing of caption variants** — not currently instrumented.
- **Cross-page learnings from Italy** — Italy page not yet active per CLAUDE.md.
- **Paid boost ROI** — no spend data was provided.
