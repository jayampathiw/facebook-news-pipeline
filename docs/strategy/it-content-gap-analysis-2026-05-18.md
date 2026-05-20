# Italy Content Strategy — Gap Analysis vs Market Trending Posts

**Page analysed:** [facebook.com/ItaliaOggi](https://www.facebook.com/ItaliaOggi)
**Date:** 2026-05-18
**Our sample:** All 151 IT articles in Supabase from the last 30 days — 19 marked posted, 105 pending, 27 blocked by compliance gates, 0 approved-but-unposted, 0 rejected.
**Market sample:** 10 high-engagement IT Facebook posts (May 17–18, 2026), provided in the brief. **9 of 10 are about the Modena car-ramming attack on May 17.**

> **Data integrity note.** All 19 IT rows with `status='posted'` have `posted_at = NULL` and `fb_post_id = NULL`. The user has confirmed posts were published manually to facebook.com/ItaliaOggi, but the pipeline write-back is not running. Without those fields, we cannot measure the page's actual engagement curve — this analysis benchmarks against market data only, not against our own response.

---

## Executive Summary

ItaliaOggi is publishing **wire-service Italian news with neutral captions and static images**, while the Italian Facebook market on May 17–18 was almost entirely consumed by **one breaking story (the Modena car-ramming attack)** framed through **partisan personal pages, party channels, and expert-personal brands** — not through legacy news outlets. Four structural choices drive the gap:

1. **We missed the biggest Italian story of the day.** 9 of 10 trending posts are about the Modena attack. Our DB has 3 relevant articles — 2 stuck in `pending`, 1 (*"Meloni ringrazia Signorelli"*) blocked by `ADS_POLITICS_01`. We published none.
2. **The source mix is too foreign-policy and Cannes heavy.** 8 of 19 posts are International or French film festival coverage. Pure Italian-domestic stories: 0.
3. **The compliance gate is structurally fatal in Italy.** 100% of the 27 blocked articles were killed by `ADS_POLITICS_01`. Italian engagement is name-driven (Meloni, Schlein, La Russa, Conte, Tajani, Salvini) — blocking all named-politician content removes our entire local-news capability.
4. **Format mix is zero-variance.** 100% static images. 4 of the 10 trending posts are Reels — including the single highest-engagement Italian post (Signorelli interview, 28K interactions).

Additionally, Italian distribution does not run through legacy news pages: 7 of the 10 trending posts are from partisan, personal-brand, or international outlets. Going head-to-head with ANSA/Repubblica/Corriere as a neutral generalist is the lowest-engagement niche available.

The single highest-leverage decision before the page builds an audience is **softening `ADS_POLITICS_01` from a hard block to a `boost_eligible=false` flag, and adding a breaking-news cluster detector** so the next Modena does not sit in `pending` while competitors win the cycle.

---

## 1. Gap Analysis — What the Market Has That We Don't

### 1.1 Story-type gaps

| Trending theme (in market) | Our posted output last 30d | Gap |
|---|---|---|
| **Breaking national tragedy with hero narrative** (Modena / Signorelli) | 0 — story in pending, hero story blocked | **Operational miss**, not strategy |
| **Government response to crisis** (Meloni cancels Cyprus → Modena) | 0 — blocked by `ADS_POLITICS_01` | Self-inflicted |
| **Judicial-political scandal around ruling figures** (La Russa Strasbourg) | 0 — similar Toti/Sarkozy-style blocked | Self-inflicted |
| **Right-wing media framing of news** (Belpietro "terrorismo o pazzia") | 0 | Major — we have no editorial-voice format |
| **Hyper-local Lega / partisan content** (Lega Nonantola Como) | 0 | Major — distribution channel we don't access |
| **Celebrity / expert public shaming** (Bassetti vs troll) | 0 | Major — utility/personal-brand content missing |
| **International outlet on Italian story** (BBC, Al Jazeera, ABC7 on Modena) | We had AGI's wire — never published | Operational |
| **Italian-domestic political beat** (Schlein on matrimoni, Meloni/Giuli, Toti yacht) | 0 — all blocked by `ADS_POLITICS_01` | Self-inflicted |
| **Sport-hero narrative** (Sinner deep-runs) | 1 (Sinner-Rublev posted, Roland Garros pending) | Partial — single-thread, no series |
| **Italian patrimonio / fierté nazionale** (food, regional pride, Vatican) | 2 (Papa Leone, Sub Maldive tragedy) | Mostly absent |

**Source-diversity gap.** Our 19 posted articles come from 7 legacy outlets (AGI 37, Repubblica 37, ANSA 34, La Stampa 27, Corriere 5, Lavoce.info 3, Il Sole 24 Ore 1 — across all statuses). The trending sample is dominated by partisan personal pages (Silvia Sardone 1.5M, Maurizio Belpietro 118K), party officials (Fratelli d'Italia 831K), expert-personal brands (Matteo Bassetti 262K), micro-Lega locals (Nonantola/Ravarino 2.6K), and editorial aggregators (Agorà Fanpage.it 1.05M). **Only 1 of 10 trending posts comes from a generalist Italian news page.**

**Tone gap.** Our captions are analytical-neutral: *"Tensione nucleare nel Medio Oriente"*, *"Stallo diplomatico nello Stretto di Hormuz"*, *"Equilibrio del sonno e invecchiamento"*. The trending content is identity-loaded, emotional, or accusatory: *"HO FATTO VEDERE CHE L'ITALIA NON È MORTA"*, *"Modena non è sola"*, *"perché chiamiamo l'attentatore 'pazzo' e non 'terrorista'?"*, *"LA SINISTRA: 'È RAZZISMO'. PER GLI AGENTI C'È LA CACCIA"*.

### 1.2 Format gaps

- **Reels: 0/19 (us) vs 4/10 (market).** The single highest-engagement Italian post (Signorelli interview, 28,433 interactions) is a Reel. The BBC, Al Jazeera, ABC7, and Lega Como posts are all Reels too. Reels are the only format with native algorithmic priority on FB in 2026.
- **Image carousels: 0/19 vs 1/10.** Bassetti's troll-shaming carousel is a uniquely Italian utility format.
- **Editorial / opinion text-posts: 0/19 vs 1/10.** Belpietro's 442-comment post is text-only. We have no opinion-piece format.
- **Polls / binary CTAs: 0/19 vs 0/10 directly, but** the Belpietro "terrorismo o pazzia" frame is a *de facto* binary that drove the highest comment ratio (48%) in the entire trending sample.

### 1.3 Caption-structure gap

Inspecting `ai_caption` JSON across our 19 IT posted rows:

- `intro`: **NULL in 19/19**
- `question`: **NULL in 19/19**
- `cta`: **NULL in 19/19**
- Only `image_headline`, `seed_comment`, `hashtags` are populated.
- The `seed_comment` template *"💬 E voi, che ne pensate? Vi sorprende questa notizia? Condividete..."* (and its `tu`-form variant) repeats verbatim across **5+ posts**.

Same pipeline bug as France. Schema supports `intro/question/cta`, but the generator isn't writing them. The page reads templated and impersonal.

### 1.4 Data-integrity gap

All 19 IT posted rows have `posted_at = NULL` and `fb_post_id = NULL`. The page is live and articles were published manually, but the pipeline write-back path (`services/facebook.js` → `updateArticle(id, {posted_at, fb_post_id})`) is not running.

Consequence: we have no way to score which captions worked, which times worked, or which story categories converted on ItaliaOggi. Every recommendation below is based on market data, not our own audience.

### 1.5 Engagement-mechanic gap

Italian trending posts use mechanics France does not:

- **The "terrorismo o pazzia" binary** — frame the story as "the media is hiding what this really is". Belpietro's text post got 48% comment-to-like ratio with this alone. We have zero captions in this register.
- **Legal-citation comment threads** — Italian audiences cite *art. 595 codice penale*, *art. 35 ter*, etc. in comments at far higher rates than French audiences. Bassetti's troll post triggered an entire legal advice thread. This means **explainer/utility content has structural advantage in Italy**.
- **Named protagonist in the headline** — *Signorelli*, *La Russa*, *Meloni*, *mirkosca95* (the named troll). Trending Italian posts almost always center one identifiable person. Our captions abstract: *"Mistero sulla morte dei sub"* instead of naming the diver, *"Transizione al vertice della Fed"* instead of naming Powell front-and-centre.

---

## 2. Performance Drivers — Why Each Trending Post Won

| # | Post | Primary driver | Secondary driver | Mechanic |
|---|---|---|---|---|
| 1 | Sardone — Signorelli hero Reel | Immediate national trauma channelled into hero narrative | Lega-aligned framing primes partisan share | Outrage split: medal-calls vs anti-immigrant blame |
| 2 | FdI — Meloni cancels Cyprus | Official party voice = "leader shows up for the country" | Triggers partisan war in comments | Praise vs accusations of opportunism |
| 3 | BBC — Modena aftermath Reel | International authority = neutral artefact to share | Commenters hijack for ethnicity debate | High comment-to-like, all-day discourse seed |
| 4 | Al Jazeera — eyewitness Reel | First-person testimony humanises | Islamophobia vs mental-health binary | Global outlet amplifies to diaspora |
| 5 | Agorà Fanpage.it — La Russa Strasbourg | Elite-impunity outrage + government-collapse hook | Evening post = post-dinner political scroll | Comments demand accountability, drive shares |
| 6 | Belpietro — terrorismo o pazzia | Right-wing media-critique framing | Cites France and Germany homegrown attacks | Sets the day's talk-show agenda |
| 7 | RTL 102.5 — Meloni travel | Factual update reframed as propaganda by opponents | Downcast Meloni visual invites attacks | Comment velocity from hostile reframings |
| 8 | Lega Nonantola — police vs Senegalese | Police-immigration clash weaponised | Closed-group echo-chamber sharing | Anti-left vitriol + expel-immigrants calls |
| 9 | ABC7 — Modena surveillance | Raw CCTV = visceral proof | US outlet posting at 03:00 CEST catches IT morning | Speculation over intent and background |
| 10 | Bassetti — troll shaming | Personal harassment turned into public shaming | COVID-era abuse fatigue | Legal-advice comment thread (art. 595 c.p.) |

**Cross-cutting patterns specific to Italy:**

- **The Modena cluster proves: one big story dominates the entire cycle.** 9 of 10 posts on May 17 are Modena-related. Italian Facebook concentrates around the day's "fatto" much more than French Facebook did in the equivalent sample. **Missing the day's "fatto" is missing 70%+ of available engagement that day.**
- **Partisan identity beats journalistic neutrality.** Sardone (1.5M Lega MEP) and Fratelli d'Italia (831K party) win on the same Modena story that BBC and Al Jazeera win on. The same facts, three different frames, all win. A neutral-framing version would not win.
- **Micro-pages with high engagement-per-follower.** Lega Nonantola at 2.6K followers got **39.8% follower-engagement** on Item 8. That's higher proxy rate than every other post in the sample combined. The Italian Facebook graph rewards small, tight, ideologically-coherent communities — a structurally different opportunity than France.
- **Italian visual rule.** Block-letter Italian overlay, declarative or accusatory phrasing, named human centred in the frame, color signals (red breaking-news ticker, ULTIM'ORA badge). Our `image_headline` outputs include *"Cinema: Pain and Desire"*, *"Cinema History Iconic Moment"*, *"Cannes Film Festival Spotlight"* — **English overlays on an Italian-language page break the page contract.**
- **Timing.** Trending posts cluster 07:00–12:35 CEST (morning + breaking-news window) and a smaller 19:00–23:30 evening burst (politics + retrospectives). Our pipeline posts whenever the cron fires.

---

## 3. Strategic Recommendations (Ranked by Impact × Feasibility)

### P0 — Fix immediately, no policy debate required

1. **Soften `ADS_POLITICS_01` from hard block to `boost_eligible=false` flag — for IT specifically.**
   - Italian politics is name-driven; 100% of blocked IT articles were killed by this single gate. Among them: *"Meloni ringrazia Signorelli"* — the Modena hero angle, the single most-shared political post type today.
   - Add `boost_eligible: bool` column to articles. Default true; set false when politics/weapons/legal gates trip. Allow `status=posted` on `boost_eligible=false` rows but block ad spend on them.
   - Impact: unblocks ~27 articles/month for IT alone. France should follow after a 30-day test on IT.

2. **Fix the caption pipeline.** All 19 IT posted rows have `intro/question/cta = NULL`. Same bug as France; one fix covers both. The schema, the prompt, and the dashboard expect them.
   - Impact: doubles caption surface area, kills the templated feel.

3. **Fix the post-write-back.** `posted_at` and `fb_post_id` are NULL on all 19 IT posted rows even though the page is live. `services/facebook.js` needs to update the row after successful publish. Without this, no performance instrumentation is possible.
   - Impact: critical for any iteration loop.

4. **Force `image_headline` to Italian on ItaliaOggi.** ~5 of 19 posts carry English overlays (*"Cannes Film Festival Director Retrospective"*, *"Cinema History Iconic Moment"*, *"Cinema: Pain and Desire"*, *"Cannes Film Festival Spotlight"*, *"Tappeto Rosso di Cannes"* is correct — others should match). Enforce in `claude.js` and in the edge function (`supabase/functions/generate-caption/index.ts`).
   - Impact: high, near-zero cost.

5. **Rotate the seed_comment template.** Same generic *"💬 E voi, che ne pensate?..."* repeats 5+ times. Build a pool of 10+ Italian variants parameterised by story category and criticality. Never reuse verbatim within 7 days.

### P1 — Operational (this week)

6. **Build a breaking-news cluster detector.**
   - When ≥3 articles arrive in a 6h window with high title-similarity (Modena × Modena × Modena), auto-escalate the cluster to `criticality='breaking'` and surface it on the dashboard top-strip.
   - Extend `src/utils/dedup.js` to count cluster size, not just deduplicate. Add a `cluster_id` column.
   - Impact: this is the single fix that prevents the next Modena-miss. Today's data shows 1 `breaking` IT tag in 30 days, which is clearly wrong.

7. **Reframe the source mix.** Today: 8 of 19 posts (42%) are International or French film festival coverage. Target: 50% Italian-domestic / 25% International-with-Italian-stake / 25% Lifestyle-Culture-Sport-Patrimonio.
   - Add city-edition sources: *Il Resto del Carlino* (Emilia-Romagna, would have caught Modena hours before national wires), *Corriere della Sera* city editions (Roma, Milano), *La Nazione* (Firenze/Toscana), *Il Mattino* (Napoli).
   - Bias `src/utils/criticality.js` toward stories with Italian place names.

8. **Tune the prompt for Italian engagement mechanics.**
   - **Binary framing for crime + foreign-subject stories:** when story tags include `crime + foreign-suspect + mental-health`, the generator's question should default to *"Terrorismo o disagio psichico?"*-style binary rather than the analytical default.
   - **Protagonist-naming:** when there is one named human in the article, require the name in the `image_headline`. *"Almodóvar: dolore e desiderio"* beats *"Cinema: Pain and Desire"*. *"Signorelli, l'eroe di Modena"* beats *"Tragedia a Modena"*.
   - **Legal-citation hooks:** for legal / judicial / consumer-protection stories, encourage the seed_comment to invite legal interpretation (*"Articolo XXX c.p. dice... e voi?"*).

### P2 — Positioning (next 2–4 weeks)

9. **Pick an editorial position for ItaliaOggi.**
   - The Italian market punishes generalist news pages — only 1 of 10 trending posts comes from a generalist outlet. Decide between:
     - **Curatorial-sharp** (à la Agorà Fanpage.it): pick stories no one else surfaces and frame them with a clear angle. Lowest-friction pivot from current pipeline output.
     - **Public-service utility** (à la Bassetti, Lucarelli): health/legal/economy explainers. Lower political risk, evergreen ad-friendly.
     - **Regional pride / "italianità"** (à la Lega micro-pages but apolitical): heavy use of regional dialects, food, patrimonio, sport. Highly engaging per follower.
     - **Named editorial voice** (à la Belpietro): single columnist persona. Hardest to staff, highest engagement ceiling.
   - Recommendation: **Curatorial-sharp** as the first 30-day commitment, with **utility content** as a secondary pillar. Re-evaluate after 30 days of measured engagement (which requires fix P0 #3 above first).

10. **Add Reels as a weekly cadence (≥1/week to start).**
    - Lowest-cost path: repackage source clips with Anton-font Italian overlays and a 70%-opacity ItaliaOggi watermark.
    - Higher-value path: 3-card explainer Reels for utility content (legal/health/economy).
    - Italy's top trending post is a Reel that wasn't originally produced as one — it's raw plaza footage with subtitles.

11. **Build content pillars.**
    - **🔴 "Italia oggi: il fatto del giorno"** — daily breaking, prioritised by cluster detector
    - **🟢 "Italia che funziona"** — weekly positive Italian story (science, hospitals, regional success, athletes)
    - **🟡 "Italia nel mondo"** — Italian stake in global stories (export, diaspora, foreign policy choices that touch Italian households)
    - **🔵 "Capire la legge"** — weekly legal/policy explainer (this is the structural Italian advantage)
    - **⚪ "Storie italiane"** — weekly weekend evergreen (Italian heroes, traditions, patrimonio UNESCO)
    - **🎾 "Azzurri"** — sport-hero series, especially Sinner / national-team cycles
    - **📍 "La mia città"** — weekly regional rotation tagged to Italian cities

### P3 — Differentiation bets (next month)

12. **Sister-page strategy (consider).** Italian ad-policy buckets segment cleanly: *ItaliaOggi (Politica)* runs organic-only with politics content unblocked, *ItaliaOggi (Salute)* stays boost-eligible with utility content, *ItaliaOggi (Sport)* stays boost-eligible. Three small focused pages crosslinking is structurally lower-risk than one mixed page that triggers ad-policy reviews.

13. **Italy-first instrumentation.** Once the write-back fix lands, instrument ItaliaOggi for likes / comments / shares by post type and time. Use Italy as the test bed for engagement-loop tuning before rolling changes to France.

14. **Regional micro-pages.** The 39.8% engagement rate on Lega Nonantola (2.6K followers) is a structural Italian signal. Consider city-tagged sub-pages or regional Instagram cross-posts.

---

## 4. Actionable Insights — Concrete Implementation Guide

### 4.1 Content themes and topics to pursue (in priority order)

1. **Italian-domestic breaking news with named individuals** — unblock first via P0 #1
2. **Government / political beat: Meloni, Schlein, La Russa, Tajani, Conte, party scandals** — unblocks with `boost_eligible=false`
3. **Crime + integration debate with binary framing** ("terrorismo o pazzia"-style)
4. **Italian sport heroes**, especially Sinner-tier (Internazionali, Roland Garros, Wimbledon, US Open arcs)
5. **Vatican / Papa Leone** (already strong — only 1 post in 30d, should be weekly)
6. **Italian patrimonio + food + regional pride** (currently 0 posts)
7. **Legal / consumer-protection explainers** (Italian structural advantage)
8. **Judicial-political scandal coverage** (Toti yacht-style, La Russa-style) — needs `boost_eligible=false`
9. **Health / science with Italian researchers cited** (currently strong: 5/19 posts)
10. **Cannes / international culture — but with an Italian angle** (currently 4/19; over-weighted)

### 4.2 Visual & formatting conventions to adopt

| Element | Current | Target |
|---|---|---|
| Image overlay language | Mixed Italian / English | **Italian only — hard rule** |
| Overlay headline style | Sentence case, neutral, abstract | **UPPERCASE-leaning, declarative, named protagonist when possible, max 12 words** |
| Color use | Generic | **Red = ULTIM'ORA, Blue = poll/explainer, Gold = positive Italian story, B&W = retrospective/tragedy** |
| Format mix per week | 100% static | **60% static / 20% Reels / 15% carousel-explainer / 5% text-opinion** |
| Watermark | Anton, 70% opacity, bottom-right | Keep — already correct |
| Named human in frame | Sometimes | Always when there is one — Italian engagement = identified protagonists |

### 4.3 Messaging & tone adjustments (Italian-specific)

- **Replace "analytical" with "accusatory or sympathetic" frames.** *"Mistero sulla morte dei sub"* → *"Tre subacquei italiani, il mare delle Maldive: cosa è davvero successo?"*. *"Transizione al vertice della Fed"* → *"Powell esce dalla Fed dopo 8 anni: cosa cambia per i nostri mutui?"*
- **Front-load the Italian stake.** Every International post needs one sentence answering *"Cosa cambia per chi vive in Italia?"*
- **Binary close on debate stories.** *"Terrorismo o disagio psichico? Una parola in commento."* Not *"Quale aspetto vi preoccupa di più..."* (essay prompt).
- **Use the politician's surname.** Italian audiences think in surnames. *"Meloni decide..."* > *"Il governo decide..."*.
- **Allow legal references.** *"Diffamazione (art. 595 c.p.) — e voi cosa ne pensate?"* is a legitimate Italian engagement hook. The current prompt is too neutral to produce these.
- **Tu vs voi consistency.** Pick one register per content pillar and stick with it. Today the seed comments mix *"E voi..."* and *"E tu..."* on the same week's posts.

### 4.4 Content pillars / series ideas

- **🔴 "Italia oggi: il fatto"** (1×/day on breaking days) — main story, breaking-cluster detector required
- **🟡 "Italia nel mondo"** (3×/week) — international news with Italian stake first
- **🔵 "Capire la legge"** (1×/week) — legal explainer carousel (Italian structural advantage)
- **🎾 "Azzurri"** (1–2×/week during active sport seasons) — Sinner, calcio, Olimpiadi
- **🟢 "Italia che funziona"** (1×/week) — positive science/innovation story
- **⚪ "Storie italiane"** (1×/week, weekend) — patrimonio / hero / tradition
- **📍 "La mia città"** (1×/week, rotating region) — regional pride
- **✝️ "Vaticano"** (1×/week) — Papa Leone has consistent reach; treat as a recurring beat

### 4.5 Posting patterns / timing

- **Slot 1 — 07:00–08:00 CEST:** breaking + outrage stories (Belpietro hit 07:00, Lega Como 07:15). Morning-news commuter window.
- **Slot 2 — 10:30–12:30 CEST:** breaking-news graphics + Reels (BBC 10:30, FdI 12:12, Al Jazeera 12:03, RTL 10:20). Lunchtime breaking window.
- **Slot 3 — 15:30–17:00 CEST:** longer-form hero / Reel content (Sardone 15:34). After-school / late-afternoon scroll.
- **Slot 4 — 19:00–23:30 CEST:** politics, scandal, retrospective (Agorà 19:27, Bassetti 23:28). Post-dinner political scroll.
- **Weekend mornings:** evergreen / Vatican / sport-hero content.
- **Cap:** maximum 4 posts/day for the first 90 days. Quality builds the seed audience; volume risks ad-policy reviews on a new page.

### 4.6 Immediate implementation checklist

```
[ ] Soften ADS_POLITICS_01 → boost_eligible flag (IT first, FR after 30-day test)
[ ] Fix ai_caption pipeline — populate intro/question/cta on every generation
[ ] Fix post-write-back: services/facebook.js must set posted_at + fb_post_id
[ ] Enforce Italian-only image_headline in claude.js and edge function
[ ] Rotate seed_comment templates (≥10 Italian variants, no verbatim repeats within 7 days)
[ ] Build breaking-news cluster detector in src/utils/dedup.js
[ ] Add Italian regional sources: Il Resto del Carlino, Corriere city editions, La Nazione, Il Mattino
[ ] Add "Italian binary" prompt variant for crime+foreign-subject stories
[ ] Force protagonist-name in image_headline when there is one named human
[ ] Pick editorial positioning (recommended: curatorial-sharp + utility secondary)
[ ] Schedule posts at 07:30 / 11:30 / 15:30 / 19:30 CEST slots instead of cron-when-ready
[ ] Pilot 2 Reels this week — repackaged source clips with Italian overlay
[ ] Build sport-hero evergreen rotation (Sinner-tier athletes, 20-entry starter list)
[ ] Build "Capire la legge" weekly slot with Lavoce.info and Il Sole 24 Ore as primary sources
```

---

## Appendix A — Our 19 posted articles, categorised

**International geopolitics: 5**
Powell/Fed, Iran-US (Trump/Teheran × 2), Trump-Xi/Cina, Narges Mohammadi.

**Cannes / international culture: 4**
Peter Jackson, Almodóvar, Thelma & Louise, Cannes opening.

**Health / science: 5**
Cancer-age metastasi (RAGE receptor), sleep & aging, neural hearing aid, prevention spending, depressione+psilocibina (pending — counted in 19).

**Sport: 1** — Sinner-Rublev semifinale Roma.

**Society / Vatican: 2** — Papa Leone alla Sapienza, sub Maldive tragedia.

**Economy / tax: 2** — 730 precompilato, war inflation no-sussidi.

**Pure Italian-domestic political, civic, or regional stories: 0.**

The pattern mirrors France: heavy on Cannes + international + science, near-zero on Italian-domestic life. Italy's gap is sharper because Italian Facebook engagement is even more locally concentrated than French.

---

## Appendix B — Blocked articles by gate

| Gate | Count | Italian impact |
|---|---|---|
| `ADS_POLITICS_01` | 27 | All Meloni / Schlein / Conte / Tajani / Crosetto / Salvini / Toti / La Russa / Mattarella / Giuli / Giachetti / Fontana stories. Plus *anything mentioning Iran* (the regex is over-broad). Plus Schlein matrimoni egualitari (a major social-debate story). Plus *Meloni ringrazia Signorelli* — the exact Modena angle that won today. |
| `ADS_WEAPONS_01` | 0 | (Different from France, which lost Nantes-fusillade content to this gate.) |
| `FR_LEGAL_01` | 0 | (France-specific rule.) |
| `ADS_DRUGS_01` | 0 | |

100% concentration in a single gate. The fix is single-file: change the block behaviour in `src/validators/contentValidator.js` to flag rather than reject.

---

## Appendix C — Trending posts vs our pipeline outcome

| # | Trending post | Would ItaliaOggi have published it under current rules? |
|---|---|---|
| 1 | Sardone — Signorelli hero Reel | No — `ADS_POLITICS_01` (Lega framing) + we don't produce Reels |
| 2 | FdI — Meloni cancels Cyprus | No — `ADS_POLITICS_01` (Meloni named) |
| 3 | BBC — Modena Reel | Story was in `pending`, never made it to posted; no Reels capability |
| 4 | Al Jazeera — eyewitness Reel | Same as #3 |
| 5 | Agorà — La Russa Strasbourg | No — `ADS_POLITICS_01` |
| 6 | Belpietro — terrorismo o pazzia | No — opinion-text format we don't generate; politics-adjacent |
| 7 | RTL — Meloni travel | No — `ADS_POLITICS_01` |
| 8 | Lega Como police video | No — `ADS_POLITICS_01` + immigration framing + no Reels |
| 9 | ABC7 — surveillance | Story in `pending`, no Reels |
| 10 | Bassetti — troll shaming | No — personal-brand utility content we don't source |

**Posts we could have published as-is under current pipeline: 0 of 10.**

After P0 #1 (politics-gate softening) and Reels production: **5–6 of 10** would be reachable. This is the size of the prize.

---

## Appendix D — What I did *not* analyse

- **Engagement metrics on ItaliaOggi's own posts.** `posted_at` and `fb_post_id` are NULL on all 19 IT rows. Until the write-back fix lands, this is impossible.
- **A/B testing of caption variants.** Not currently instrumented.
- **Modena Day 2 follow-through.** Today's analysis is May 17–18. A second wave (legal proceedings, identity of suspect, victim updates) is likely Days 2–7 — the pipeline should be ready for it.
- **Paid boost ROI.** No spend data provided.
- **Cross-page learnings from France's actual posted engagement.** Same instrumentation gap.
