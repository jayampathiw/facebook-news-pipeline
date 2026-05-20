# Implementation Questions — Answers and Decisions

**Date:** 2026-05-18
**Context:** Follow-up questions from the France and Italy gap analyses. This document captures the answers, recommendations, and trade-offs for five implementation areas. **No code changes yet — this is a decision-support document.**

**Related docs:**
- `fr-content-gap-analysis-2026-05-18.md`
- `it-content-gap-analysis-2026-05-18.md`
- `fr-content-gap-analysis-2026-05-18-simple.md`
- `it-content-gap-analysis-2026-05-18-simple.md`
- **`docs/research/sources-audit-france.md`** (forensic audit, 19 sources, completed 2026-05-18)
- **`docs/research/sources-audit-italy.md`** (forensic audit, 24 sources, completed 2026-05-18)
- `docs/research/grok_report_fr.pdf`, `docs/research/grok_report_italy.pdf` (independent second opinions; more permissive than the forensic audit on licensing — flagged below)

---

## TL;DR — Decisions Needed

| # | Question | Recommendation | Decision needed from user |
|---|---|---|---|
| 1 | How do we generate Reels? | FFmpeg + local Kokoro TTS + local Whisper subtitles. Zero per-Reel cost. Remotion later if we need multi-card explainers. Requires downloading the Kokoro multilingual voices pack | Approve the local-stack path + multilingual voices download |
| 2 | Can we post politics / weapons / legal / drugs safely? | Yes for 3 of 4 (politics, weapons, drugs) — they are ad policies, not bans. `FR_LEGAL_01` is French law and needs editorial-language fix, not a block | ✓ **Resolved 2026-05-19** — `boost_eligible=false` approved, Italy-first rollout (FR after 30-day IT validation). FR_LEGAL_01 still needs external press-law specialist before go-live. |
| 3 | Where do we get local French / Italian news? | **Audit completed.** France: 9 sources approved, 2 require licensing negotiation (Ouest-France, Brut), 1 SKIP (La Voix du Nord — hard paywall), 4 need verification. Italy: 13 sources approved with 7 in Phase-1 RSS-ready set, 2 (Fanpage.it, Will Media) need social-API partnership, not RSS | ✓ **Resolved 2026-05-19** — 3a: free-RSS only at launch (Ouest-France/Brut/EBRA/Rossel deferred until per-source ROI justifies negotiation). 3b: embrace center-left positioning. |
| 4 | How do we improve tone? | Five concrete prompt edits in `CONTENT_SYSTEM_PROMPT` | Approve the prompt rewrite |
| 5 | Add a format-classifier feature? | Yes — extend existing `generateCaption()` call to return six format-signal fields. Zero extra API cost | Approve the schema addition |
| 6 | How do we decide WHEN and WHAT to publish? | Fixed clock slots per country (3 for France, 4 for Italy) + per-article `publish_score` that combines criticality, recency, slot match, pillar-quota deficit. Quota counts only when `status='posted'` AND `posted_at IS NOT NULL` — never at Top News click | Approve the slot times, pillar quotas, and scheduler design |

---

## Question 1 — How are we going to generate videos? Remotion or other options?

### Recommendation

**Use a fully local stack: FFmpeg + Kokoro TTS + Whisper Transcriber.** All three are already on disk at `/home/jayam/projects/shared/` and all are commercial-safe (Kokoro Apache 2.0, Whisper MIT). Per-Reel cost is **$0** — no API spend at all. Remotion is reserved for the multi-card explainer format later.

Our trending-post research shows the highest-engagement Italian Reel (Sardone's Signorelli interview, 28K interactions) is raw plaza footage with burned-in subtitles — not produced motion graphics. The format we need is structurally simple: still image → Ken Burns pan/zoom → French/Italian text overlay → TTS voiceover → burned-in subtitles → watermark → 9:16 export.

### Local-stack pipeline (recommended)

```
1. Pipeline generates Italian / French caption text (existing claude.js output)
2. Kokoro TTS reads the caption → audio.wav
   (multilingual voice: if_sara for Italian, ff_siwis for French)
3. Whisper transcribes audio.wav → subtitles.srt (timestamped, word-level)
4. FFmpeg composites:
     still image (Ken Burns pan/zoom)
   + audio track
   + burned-in SRT subtitles
   + Anton-font watermark bottom-right
   → reel.mp4 (9:16 vertical, 1080×1920)
```

All four steps run on local hardware or GitHub Actions runners. No API calls outside the existing Claude caption generation.

### IMPORTANT — local Kokoro voices file is English-only

The local Kokoro install at `/home/jayam/projects/shared/kokoro-tts/voices-v1.0.bin` contains **28 voices, all American or British English**:

```
Voice IDs present locally:
  am_adam, am_echo, am_eric, am_fenrir, am_liam, am_michael, am_onyx, am_puck, am_santa,
  af_alloy, af_aoede, af_bella, af_heart, af_jessica, af_kore, af_nicole, af_nova,
  af_river, af_sarah, af_sky,
  bm_daniel, bm_fable, bm_george, bm_lewis,
  bf_alice, bf_emma, bf_isabella, bf_lily
```

**No French (`ff_*`) or Italian (`if_*` / `im_*`) voices are present.** Reading French/Italian text with an English voice produces unusable pronunciation — *"Meloni"* becomes "muh-LOH-nee", *"présumé"* becomes garbage.

The Kokoro v1.0 model itself (`kokoro-v1.0.onnx`, already on disk) **does** support those languages — what's missing is the multilingual voices pack.

**Prerequisite for shipping Reels:**

1. Download the multilingual `voices-v1.0.bin` from `huggingface.co/hexgrad/Kokoro-82M` (adds `ff_siwis`, `if_sara`, `im_nicola`, plus voices for ES, JA, ZH, HI, PT).
2. Replace `/home/jayam/projects/shared/kokoro-tts/voices-v1.0.bin` (back up the English-only one first if it's used by other projects).
3. Extend `VOICE_PRESETS` in `lib/config.js` to expose `'french-female'`, `'italian-female'`, `'italian-male'` aliases. About 20 lines of code.

The wrapper accepts direct voice IDs already (`voice: 'if_sara'`), so step 3 is cosmetic — step 1 is the blocker.

### Option ladder (for comparison)

| Tool | Stack fit | Cost | When it makes sense |
|---|---|---|---|
| **FFmpeg + Kokoro + Whisper (all local)** | Native — already on disk | **$0** per Reel | **Recommended.** Single-scene Reels with pan/zoom, voiceover, burned subtitles. Covers ~80% of our use cases. |
| **Remotion** | Good — React/Node, programmable | Free OSS; paid render farm at scale | Multi-scene explainers (intro card → headline → CTA). Heavier setup. Worth it for "Capire la legge" pillar later. |
| **Creatomate / Shotstack / JSON2Video** | API-based | $0.05–$0.20 per render | If we want zero infrastructure. Now redundant with the local stack. |
| **HeyGen / Synthesia / D-ID** | API | $0.30–$1.00 / minute | Only for an AI-presenter face. Not what trending Italian/French Reels look like. Skip. |
| **ElevenLabs + FFmpeg** | API + native | ~$0.10/min | Was the original recommendation. Superseded by local Kokoro — same quality range, zero cost, no rate limits. |

### Concrete first build (estimated 2–3 days of work)

1. **Download multilingual Kokoro voices pack** (prerequisite, see above).
2. **Verify French + Italian output quality.** Generate 5 sample Reels per language. Listen end-to-end. Reject if pronunciation of named entities (Meloni, Signorelli, Macron, Cannes) is wrong.
3. **Build the FFmpeg compositor script.** Inputs: image path, audio path, SRT path, headline text, watermark path. Output: 9:16 MP4. The Ken Burns effect is one filter: `zoompan=z='zoom+0.0015':d=...`.
4. **Wire the trigger.** Auto-render when `content_signals.reel_fit_score > 70` (see Question 5), plus a "Generate Reel" button in the Angular dashboard for manual selection.
5. **Render budget.** A 30-second Reel renders in 10–30 seconds on a desktop CPU. GitHub Actions runners handle this fine without GPU.

### Important caveats to flag

- **Copyright on source video.** Repackaging BBC / Al Jazeera / ABC7 footage is the highest-engagement pattern in our data — but it requires licensing, fair-use commentary framing, or substantial transformation. Our default Reel format generates visuals from scratch, not repackaging protected footage.
- **Music rights.** Use only Meta's music library (built into Reels composer) or licensed beds. Don't drop in commercial music tracks. For most news Reels, voiceover-only with no music bed is the cleanest option.
- **Subtitles always.** 85%+ of Facebook video views are silent. The Whisper-generated SRT burned into the video covers this; the Anton-font overlay for the main headline stays as a top banner.
- **Voice consistency.** Pick one voice per page and stick with it for 30 days. Switching voices mid-cycle confuses audience recognition. Suggested: `if_sara` for ItaliaOggi, `ff_siwis` for FranceAujourdhui.

### When to revisit Remotion

When we want to build the "Capire la legge" carousel-explainer format (3–4 cards, transitions, animated highlights). FFmpeg can technically do it, but Remotion's React-based scene model pays off when the format has multiple cards.

---

## Question 2 — Can we post politics / weapons / legal / drugs without violating Facebook policy or getting banned?

### Short answer

**Yes for 3 of the 4 categories. The current gates conflate two very different rule sets.**

The blockers in our pipeline (`ADS_POLITICS_01`, `ADS_WEAPONS_01`, `ADS_DRUGS_01`) are named correctly — they are **ad policies**, restricting **paid boosting**, not organic posting. Meta's community standards (which govern organic content) are much narrower.

### Per-gate analysis

| Gate | Real rule | Organic posting allowed? | What actually gets you banned |
|---|---|---|---|
| **`ADS_POLITICS_01`** (24 FR blocked, 27 IT blocked) | EU TTPA (Transparency and Targeting of Political Advertising) + Meta political-ad transparency | **Yes — organic is fine.** ANSA, Repubblica, Le Monde, BFM post named-politician content dozens of times daily without consequence | Running paid ads on political content without going through Meta Ad Library disclosure and verification |
| **`ADS_WEAPONS_01`** (7 FR blocked) | Meta Weapons Ads Policy + Restricted Goods | **Yes for news reporting.** BBC, Le Monde report on knife attacks and shootings daily | Selling/promoting weapons, glorifying violence, calls to violence, graphic gore imagery |
| **`ADS_DRUGS_01`** (1 FR blocked) | Meta Restricted Goods (Drugs) | **Yes for news reporting.** Coverage of a fatal drug case is straightforward news | Promoting/selling drugs, posting recipes, sharing dealer contact info |
| **`FR_LEGAL_01`** (2 FR blocked) | **French law** — Loi du 29 juillet 1881 art. 35 ter + secret de l'instruction | **Maybe — needs editorial care.** This is criminal liability under French law, *not* a Facebook rule | Identifying suspects as guilty before trial, publishing leaked investigation material, presenting *présumé* as *coupable* |

### What this means in numbers

**32 of the 34 France blocks and all 27 Italy blocks could be safely posted organically with correct framing.** The only ones that carry real legal/ban risk are the 2 `FR_LEGAL_01` cases, and even those can be fixed with editorial-language changes — not by killing the post entirely.

### Safety rules for organic posting on these topics

- **Never** post content that calls for violence against a person or protected group
- **Never** name minors involved in crimes
- **Weapons stories:** no glamorisation of the weapon, no how-to detail, no celebration of the act, no graphic gore
- **Drug stories:** report the case, never the substance recipe or where to buy
- **Political content:** post the news, **do not run paid boost** on it (the `boost_eligible=false` flag enforces this)
- **Legal cases:** use presumption-of-innocence language — *"présumé"*, *"mis en examen"*, *"selon le parquet"* — never *"le coupable"* before a verdict; no leaked photos or wiretap content
- **All sensitive topics:** stick to verified-source reporting (BBC, Reuters, Le Monde, ANSA, AFP) and credit them in the post

### What actually gets pages banned

- Repeated community-standards violations: hate speech against protected categories, graphic violence imagery, calls for harm
- Running undisclosed paid political ads in the EU (the TTPA risk our current gate protects against)
- Coordinated inauthentic behaviour
- Repeated copyright complaints

**None of our 34 blocked France stories or 27 blocked Italy stories were close to those lines.** The gate is overcorrecting by ~94%.

### Recommended pipeline change

Replace hard block with a `boost_eligible: bool` column on `articles`:

- `boost_eligible = true` (default) — clean for organic AND paid
- `boost_eligible = false` — clean for organic only; the publisher skips paid boost
- `FR_LEGAL_01` keeps its block, but is rephrased to require presumption-language fixes (most cases can pass after one prompt regeneration)

This is the single highest-impact change in both gap analyses.

---

## Question 3 — What sources are we going to collect local French and Italian news from?

### Status: AUDIT COMPLETED (2026-05-18)

Both research prompts were executed. Deliverables now in `docs/research/`:

- `sources-audit-france.md` — forensic audit of 19 candidates, with cited ToS language and RSS URLs
- `sources-audit-italy.md` — forensic audit of 24 candidates, with partisan tilt and engagement-format mapping
- `grok_report_fr.pdf` + `grok_report_italy.pdf` — independent second-opinion reports

**The original research prompts (preserved for re-use on future markets) are in the appendix at the bottom of this section.**

### Critical findings that change the original recommendations

**1. RSS commercial licensing is a real blocker — bigger than expected.**

The forensic audit found explicit ToS language requiring **paid commercial licensing** for RSS aggregation on the highest-value French sources:

- **Ouest-France**: *"Toute exploitation des flux RSS du groupe SIPA Ouest-France est soumise à accord préalable et à redevance"* — explicit, enforceable, group-wide policy.
- **Brut**: *"L'utilisation des flux RSS du site Brut.media est exclusivement réservée à un usage personnel. Toute autre utilisation nécessite une autorisation spécifique."*
- The Rossel Group (*La Voix du Nord*) and EBRA group (*Le Progrès*, *DNA*, *L'Est Républicain*) almost certainly have similar terms — the audit didn't confirm but recommends assuming they do.

The Grok report is more permissive on this — it characterises the licensing risk as a soft "should respect crawl delays" issue. **The forensic audit is the more legally defensible read.** Where the two reports disagree, this doc follows the forensic audit.

**2. La Voix du Nord moves from "investigate" to SKIP.**

Hard paywall confirmed by French Reddit discussions: *"c'est mort... le serveur ne t'enverra jamais le texte"*. Even with RSS access, articles require subscription to read. Skip.

**3. 20 Minutes moves from likely-skip to immediate priority.**

Original assumption (echoed by the Grok report) was that 20 Minutes is mostly national wire repackaging and should be skipped. **The forensic audit reverses this:** robots.txt explicitly allows aggregators, multiple city editions (Paris, Lyon, Marseille, Bordeaux, Toulouse, Strasbourg, Lille, Nantes), 100% free, very high update frequency. Estimated 45% local-France content via city editions. **Add as Tier 1 immediate-deploy.**

**4. France Bleu was rebranded to "ici" in January 2025.**

44 regional radio stations now under the "ici" brand. RSS fragmentation makes single-source integration impossible. Phased approach: start with 3–5 largest stations (*ici Paris*, *ici Provence*, *ici Bretagne*), expand if engagement justifies the per-station integration cost.

**5. Italy: Fanpage.it and Will Media don't have traditional RSS.**

Both audits agree these are *the* social-distribution layer ItaliaOggi needs to tap — but their content lives in Instagram/TikTok/YouTube APIs and proprietary site structures, not RSS feeds. Integration requires **partnership outreach or social-media API access**, not the standard `fetchers/rss.js` path. Treat as a separate workstream.

**6. All recommended Italy sources skew center-to-center-left.**

The Italy audit flags this as a **positioning decision the team must make**:

> *Recommended sources skew center to center-left. ItaliaOggi must decide: (1) Embrace center-left positioning (matches Fanpage/Will Media youth engagement model) or (2) Add Il Giornale + center-right sources for partisan balance (broader audience reach).*

~~This is now an Open Decision (see bottom of doc).~~ **Resolved 2026-05-19: embrace center-left positioning (Option 1).** See Open Decisions section.

**7. Six new sources surfaced during the audit that weren't in the original prompts.**

| Source | Country | Why |
|---|---|---|
| *Actu.fr* | France | ~100-city hyperlocal network (Publihebdos Group) — fills city-level gap regional dailies miss |
| *Bondy Blog* | France | Banlieue perspective, founded after 2005 riots, absent from mainstream coverage |
| *Vatican News* | Italy | Official Holy See portal, multilingual RSS confirmed, perfect Vatican-beat source |
| *La Gazzetta dello Sport* | Italy | Italy's most-read daily, perfect for Sinner/azzurri sport-hero pillar, RSS confirmed |
| *Il Fatto Quotidiano* | Italy | Left-leaning judicial/investigative — strong for "Capire la legge" pillar |
| *Il Giornale* | Italy | Center-right; only option for partisan balance if team takes that path |

### France — validated source plan

| Source | Status | RSS | Paywall | Local % | Notes |
|---|---|---|---|---|---|
| **20 Minutes** | **ADD Tier 1 (immediate)** | ✓ Multiple feeds confirmed | 100% free | ~45% | robots.txt aggregator-friendly. Multiple city editions. Ready now. |
| **Reporterre** | **ADD Tier 1 (immediate)** | ✓ `reporterre.net/spip.php?page=backend-simple` | 100% free | ~70% FR-environmental | Non-profit, open licence. Unique ecology vertical. Ready now. |
| **Le Parisien** | **ADD Tier 1 (immediate)** | ✓ Podcast confirmed; article RSS likely | Metered (13/mo) | ~70% Île-de-France | robots.txt permissive. LVMH-owned. |
| **Ouest-France** | **NEGOTIATE** | ✓ — but **commercial license required** | Freemium (~20–30% free) | ~60% | Highest-circulation regional. License negotiation before deploy. |
| **Le Progrès (Lyon)** | **ADD Tier 1 (after EBRA licence check)** | ✓ Dynamic RSS — append `/rss` to any URL | Freemium (~20–40% free) | ~75% Lyon-Rhône | EBRA Group; likely shares licensing posture with DNA + L'Est Républicain. |
| **La Dépêche du Midi** | **ADD Tier 1** | ✓ `ladepeche.fr/rss.xml` confirmed | Soft (~40–50% free) | ~70% Occitanie | Aerospace + Toulouse vertical. |
| **Sud Ouest** | **ADD Tier 1** | Likely (needs verification) | Metered (~30–40% free) | ~65% southwest | Verify RSS + robots.txt before deploy. |
| **Nice-Matin** | **ADD Tier 2** | Listed in directories — needs URL confirm | Unknown | ~65% Riviera | Cannes/Monaco coverage. |
| **DNA (Alsace)** | **ADD Tier 2** | Listed in directories — needs URL confirm | Unknown | ~70% Alsace | Cross-border + EU Parliament beat. EBRA group. |
| **L'Est Républicain** | **ADD Tier 2** | Listed — needs URL confirm | Unknown | ~70% Grand Est | EBRA group; cross-border Luxembourg coverage. |
| **La Montagne** | **ADD Tier 2** | Likely (Centre France group) | Unknown | ~75% Auvergne | Critical rural-France coverage gap. |
| **France Bleu (ici)** | **ADD Tier 2 (phased)** | ✓ per-station; fragmented across 44 stations | 100% free (public broadcasting) | ~85% hyperlocal | Start with `ici Paris`, `ici Provence`, `ici Bretagne`. Highest hyperlocal density of any source. |
| **La Provence** | **INVESTIGATE** (20 min) | Mentioned in directories, no URL confirmed | Unknown | ~70% PACA | Critical Marseille coverage missing — worth the time. |
| **La Voix du Nord** | **SKIP** | Partial | **Hard paywall** | (unreadable) | Skip until partnership available. |
| **TimeOut Paris** | **SKIP** | 3rd-party RSS only | Free | ~5% news | Tourism listings, not news. |
| **Demotivateur** | **SKIP** | Unknown | Free | ~5% news | Viral filler — would dilute brand. |
| **Le Bonbon** | **ADD Tier 2** | Unknown — needs custom integration | Free | Lifestyle | Multi-city food/culture. Reel-source potential. |
| **Konbini** | **ADD Tier 2** | Limited; needs RSS-bridge tool | Free | Youth angle | Video-heavy; integration fragility. |
| **Brut** | **NEGOTIATE** | ✓ — but **personal-use only RSS** | Free | ~60% FR | Video-only; commercial licence required + video-aggregation challenge. |

**France new candidates surfaced by the audit (worth integrating as Phase 2):**

| Source | Status | Why |
|---|---|---|
| **Actu.fr** | **INVESTIGATE — high priority** | ~100 French cities, hyperlocal beyond regional dailies. Potential game-changer. |
| **Bondy Blog** | **INVESTIGATE** | Banlieue perspective, non-profit, free. Unique social-issue coverage. |
| **Terre-net / Web-agri** | **INVESTIGATE** | Agricultural press — fills rural sector gap. |
| **Midi Libre** | **INVESTIGATE** | Mediterranean Occitanie (Montpellier) complementing La Dépêche's Toulouse focus. |
| **L'Équipe** | **INVESTIGATE** | Regional football + rugby coverage. Sport drives FB engagement. |

### Italy — validated source plan

**Phase 1 — RSS-confirmed, deploy immediately:**

| Source | Region | RSS | Partisan tilt | Notes |
|---|---|---|---|---|
| **Il Resto del Carlino** | Emilia-Romagna (Bologna HQ, Modena edition) | ✓ Monrif Group | Center | **Would have caught Modena before national wires.** Critical priority. |
| **Il Messaggero** | Roma + Lazio | ✓ Confirmed | Center | Vatican-adjacent; Rome politics. |
| **Il Secolo XIX** | Liguria (Genova) | ✓ Confirmed | Center | Port news, Liguria. |
| **Corriere Milano** | Lombardia | ✓ `corriere.it/rss/` | Center, slight right | Financial capital. |
| **Corriere Roma** | Lazio | ✓ `corriere.it/rss/` | Center, slight right | Political capital. Alternative to Il Messaggero. |
| **La Gazzetta del Mezzogiorno** | Puglia + Southern Italy | ✓ Confirmed | Center | Migration coverage. |
| **Vatican News** | Holy See (Italy + global) | ✓ Multilingual | N/A institutional | Perfect Vatican beat. **New from audit.** |
| **La Gazzetta dello Sport** | National sport | ✓ `gazzetta.it/rss/` | N/A | Sinner / azzurri pillar. **New from audit.** |

**Phase 2 — RSS likely available, verify before deploy:**

| Source | Region | Partisan tilt | Notes |
|---|---|---|---|
| **La Nazione** | Toscana (Firenze) | Center | Monrif Group, same infra as Il Resto del Carlino. |
| **Il Mattino** | Campania (Napoli) | Center | Naples + Pompeii patrimonio. |
| **Il Gazzettino** | Veneto | Center-right | Venice flooding visual content. Lega heartland. |
| **L'Eco di Bergamo** | Lombardia (Bergamo) | Center (Catholic) | Atalanta calcio coverage. |

**Phase 3 — Custom integration / partnership required (NOT RSS):**

| Source | Why it's not RSS | Approach |
|---|---|---|
| **Fanpage.it** | Social-first model, RSS not exposed | **Partnership outreach** or custom scraping. Critical for "distribution-through-micro-pages" gap. |
| **Will Media** | Instagram/TikTok/YouTube-native; no website RSS | **Social media API** access or content partnership. Reaches millions of young Italians. |
| **Giornale di Sicilia** (Palermo) | RSS unconfirmed | Custom integration if RSS audit fails. |
| **L'Unione Sarda** (Cagliari) | RSS unconfirmed | Custom integration if RSS audit fails. |

**Italy new candidates surfaced by the audit:**

| Source | Status | Why |
|---|---|---|
| **Il Fatto Quotidiano** | **ADD Tier 2** | Left-leaning judicial/investigative — "Capire la legge" pillar. |
| **Il Giornale** | **ADD Tier 2 (if center-right balance desired)** | Berlusconi family, center-right. Only option for partisan balance. |
| **Dissapore** | **INVESTIGATE** | Italian food/regional cuisine — patrimonio pillar via gastronomy. |
| **Open.online** | **ADD Tier 2** | Mentana's fact-checking site. Complements Il Post. |
| **Linkiesta** | **ADD Tier 2** | Center-reformist; European-politics analysis. |

**Sources confirmed SKIP / not viable as direct integration:**

| Source | Why |
|---|---|
| *Selvaggia Lucarelli* | Podcast/personality, not a structured news outlet. Monitor for viral commentary, don't integrate directly. |

### Two critical decisions that emerged from the audit

**A. RSS licensing strategy.** The forensic audit confirms that the highest-value French regionals (Ouest-France, Brut, likely Rossel/EBRA groups) require commercial RSS licensing. Options:

| Path | Cost | Risk | Coverage impact |
|---|---|---|---|
| **Negotiate group licences** | High (est. €€€/month per group) | Low (legally clean) | Best — unlocks Ouest-France, EBRA, Rossel families simultaneously |
| **Use only "free RSS" sources** | $0 | Low | Reduced — limits us to 20 Minutes, Reporterre, Le Parisien, Vatican News, Gazzetta dello Sport + verified phase-2 sources |
| **NewsAPI as fallback for licensed-only sources** | NewsAPI subscription cost | Low (NewsAPI handles licensing) | Partial — many French regionals not indexed in NewsAPI |
| **Headline+link only (fair-use stance)** | $0 | **Medium-high — needs legal review** | Full but legally fragile |
| **Direct content partnerships** | Time + relationship cost | Low | Best long-term but slow |

The audit recommends *"consult French media law specialist"* before choosing. **Resolved 2026-05-19: free-RSS sources only at launch; licence negotiation reserved for sources that prove engagement ROI post-launch. French media-law specialist consultation deferred until a specific source's engagement justifies negotiation.** See Open Decisions section for full path.

**B. Italian partisan balance.** Every Italy source the audit recommends skews center or center-left. The team must decide:

| Path | Source mix consequence | Audience implication |
|---|---|---|
| **Embrace center-left positioning** | Fanpage.it, Will Media, Open.online, Il Post, Il Fatto Quotidiano dominate | Matches youth/social engagement model (Fanpage 1M+ followers) — narrower but more engaged audience |
| **Partisan balance** | Add Il Giornale (center-right) and similar | Broader audience reach — risks editorial inconsistency on contested stories |
| **Strict neutrality** | Lean on regional dailies (Il Resto del Carlino, Il Messaggero, etc.), avoid editorially-charged Tier 2 sources | Lowest engagement but safest brand positioning |

The Italy gap analysis already flagged this as a positioning decision (curatorial-sharp vs utility vs regional pride). **Resolved 2026-05-19: embrace center-left positioning, which implies the curatorial-sharp niche.** Il Giornale not added.

### Updated deliverables — what's done vs pending

| Task | Status |
|---|---|
| Forensic source audits (France + Italy) | ✓ Done (`docs/research/`) |
| Independent second-opinion reports (Grok) | ✓ Done (`docs/research/grok_report_*.pdf`) |
| Resolve disagreements between Grok and forensic audits | ✓ Done (followed forensic audit; documented above) |
| RSS-URL verification for Phase-2 sources | **Pending — ~2h work** (La Provence, Nice-Matin, DNA, L'Est Républicain, La Montagne, La Nazione, Il Mattino, Il Gazzettino, L'Eco di Bergamo) |
| robots.txt verification for unverified sources | **Pending — ~1h work** |
| Sample-20-articles content-quality test | **Pending — ~2h work, per priority source** |
| RSS licensing strategy decision (Decision 3a) | ✓ **Resolved 2026-05-19 — free-RSS only at launch; per-source ROI-gated escalation** |
| Italy partisan-balance decision (Decision 3b) | ✓ **Resolved 2026-05-19 — embrace center-left positioning** |
| French media-law specialist consultation | **Deferred — engage only when a specific deployed FR source's engagement justifies opening licence negotiation. Same engagement should cover FR_LEGAL_01 editorial review.** |
| Partnership outreach: Fanpage.it, Will Media, Brut | **Pending — separate workstream** |
| PR updating `src/config/sources.js` with approved additions | **Unblocked. Free-RSS set ready: 20 Minutes, Reporterre, Le Parisien, Actu.fr, Bondy Blog (FR); Il Resto del Carlino, Il Messaggero, Il Secolo XIX, Corriere Milano/Roma, La Gazzetta del Mezzogiorno, Vatican News, La Gazzetta dello Sport, Il Fatto Quotidiano (IT).** RSS-URL verification still required for unverified entries. |
| `src/utils/criticality.js` updates for French/Italian place names | **Pending — small task after sources.js lands** |

### Original research prompts (preserved for re-use on future markets)

The two prompts below produced the audits in `docs/research/`. Preserved here for re-use when expanding to AU, SE, or other markets named in the CLAUDE.md roadmap. They are deliberately asymmetric — France and Italy have different engagement structures.

#### France research prompt

```
You are auditing candidate news sources for FranceAujourdhui, an automated
French-language Facebook news page targeting French residents. The page
already pulls from BFM TV, Le Monde, Le Figaro, France 24, France Info,
Libération, L'Obs, and Slate.fr (national outlets only). The gap analysis
showed near-zero local-France coverage — the page is too foreign-news heavy.

GOAL
Build a one-page audit (markdown) for each of the following candidate
sources. The team will use this audit to decide which sources to add to
src/config/sources.js.

CANDIDATE SOURCES TO INVESTIGATE
Tier 1 — Regional dailies:
  - Ouest-France
  - Le Parisien
  - Sud Ouest
  - La Voix du Nord
  - La Dépêche du Midi
  - La Provence
  - Nice-Matin
  - Le Progrès (Lyon)
  - Dernières Nouvelles d'Alsace
  - L'Est Républicain
  - La Montagne
  - 20 Minutes
  - France Bleu (regional radio chain)

Tier 2 — Lifestyle / fierté française / Reel-source:
  - Le Bonbon (Paris, Lyon, Marseille, Bordeaux editions)
  - TimeOut Paris
  - Demotivateur
  - Konbini
  - Brut
  - Reporterre

FOR EACH SOURCE, REPORT:

1. RSS availability
   - Direct RSS feed URL(s), if any
   - Whether feeds are full-content or teaser-only
   - Update frequency (estimate based on the last 24h of items)

2. NewsAPI coverage
   - Whether newsapi.org indexes this source (check
     https://newsapi.org/sources)
   - Source ID if indexed

3. Geographic / topic focus
   - Primary region(s) covered
   - Strongest topic verticals (e.g. local crime, agriculture, culture)
   - One-paragraph description of editorial slant if any (neutral / center-
     left / center-right / regional-pride / lifestyle)

4. Image rights
   - What does the source's terms-of-use say about open-graph image reuse?
   - Is there a press-attribution clause that would let us use og:image
     with credit, or must we generate our own image?
   - Are there visible Getty/AFP watermarks on most images?

5. Paywall status
   - Free / metered / hard paywall
   - If metered, what fraction of articles are reachable?

6. Politeness and rate limits
   - Does robots.txt allow news aggregators?
   - Any visible API rate-limit signal?

7. Content quality signal
   - Pull the last 20 article titles. Count how many are:
     (a) genuinely local-France stories
     (b) wire repackaging of national news
     (c) lifestyle/listicle filler
   - Report the ratio.

8. Recommendation
   - ADD as Tier 1 (primary recommended source)
   - ADD as Tier 2 (supplementary, niche use)
   - SKIP, with reason
   - INVESTIGATE FURTHER, with what's missing

ALSO INVESTIGATE
Suggest up to 5 additional French sources we have not listed that would
strengthen any of these niches:
  - Hyper-local breaking-news (city-level)
  - Agricultural / rural-France stories
  - Banlieue / urban-social stories (Bondy Blog level of relevance)
  - Sport: football and rugby at regional level
  - Pop-culture French: cinema, food, traditions

OUTPUT FORMAT
One markdown file: docs/sources-audit-france.md
Top of file: a summary table (source | tier | RSS | NewsAPI | recommend)
Below: one section per source with the eight fields above.
End: a short "5 sources to investigate further" section.

OUT OF SCOPE
- Do not commit code or modify src/config/sources.js. Audit only.
- Do not pull article content, only metadata, RSS URLs, and the last 20
  titles per source.
- Do not test pipeline integration. That's a separate task.

TIMEBOX
Six hours of investigation. If a source takes more than 20 minutes to
characterise, note "needs further investigation" and move on.
```

#### Italy research prompt

```
You are auditing candidate news sources for ItaliaOggi, an automated
Italian-language Facebook news page targeting Italian residents. The page
already pulls from AGI, ANSA, Repubblica, La Stampa, Corriere, Lavoce.info,
and Il Sole 24 Ore (national outlets only). The gap analysis showed two
critical issues:

  1. Near-zero local-Italy regional coverage (Modena attack was missed
     because no regional source caught it before the national wires did).
  2. Distribution in Italy runs through partisan, expert, and regional
     micro-pages, not legacy news. We need sources that surface that
     content layer.

GOAL
Build a one-page audit (markdown) for each candidate source. The team will
use this audit to decide which sources to add to src/config/sources.js.

CANDIDATE SOURCES TO INVESTIGATE

Tier 1 — Regional dailies:
  - Il Resto del Carlino (would have caught Modena before AGI)
  - Corriere della Sera — Roma edition
  - Corriere della Sera — Milano edition
  - La Nazione (Firenze + Toscana)
  - Il Mattino (Napoli + Campania)
  - Il Messaggero (Roma)
  - Il Gazzettino (Veneto)
  - La Gazzetta del Mezzogiorno (Bari + Puglia)
  - L'Eco di Bergamo
  - Il Secolo XIX (Genova)
  - Giornale di Sicilia (Palermo)
  - L'Unione Sarda (Cagliari)

Tier 2 — Editorial / utility / Reel-source:
  - Agorà Fanpage.it (already trending in our market sample)
  - Open.online
  - Selvaggia Lucarelli's site
  - Linkiesta
  - Il Post (utility / explainer slot)
  - Will Media (youth-explainer)
  - Lavoce.info already in pipeline — note current usage frequency

FOR EACH SOURCE, REPORT:

1. RSS availability
   - Direct RSS feed URL(s), if any
   - Full-content vs teaser
   - Update frequency in last 24h

2. NewsAPI coverage
   - Indexed on newsapi.org? Source ID if so.

3. Geographic / topic focus
   - Primary region(s)
   - Strongest topic verticals
   - Editorial register: neutral / center-left / center-right / partisan /
     lifestyle. Note explicitly because Italian engagement is partisan-
     driven and we need to understand each source's frame.

4. Image rights
   - Open-graph image reuse terms
   - Visible ANSA/AGI/Reuters watermarks?
   - Need-to-generate-own-image verdict

5. Paywall status
   - Free / metered / hard

6. Politeness and rate limits
   - robots.txt for aggregators
   - Visible rate-limit signal

7. Content quality signal
   - Pull the last 20 article titles. Count how many are:
     (a) genuinely local Italian stories (named Italian places/people)
     (b) wire repackaging of national news
     (c) lifestyle/listicle filler
     (d) International news (no Italian angle)
   - Report the ratio.

8. Engagement-format fit
   - Does this source produce content that maps cleanly to any of:
     - Breaking-news graphic (still + headline)
     - Reel-able raw footage / CCTV / eyewitness video
     - Carousel-explainer (Capire la legge slot)
     - Sport-hero series (Sinner, azzurri)
     - Vatican beat
     - Regional pride / patrimonio
   - Mark which formats it serves and which it doesn't.

9. Recommendation
   - ADD as Tier 1 (primary)
   - ADD as Tier 2 (supplementary)
   - SKIP, with reason
   - INVESTIGATE FURTHER

ALSO INVESTIGATE
Suggest up to 5 additional Italian sources we have not listed that would
strengthen any of these niches:
  - City-level breaking news (especially Emilia-Romagna, Lazio, Lombardia)
  - Legal/judicial explainer (for the Capire la legge pillar)
  - Sport — calcio + tennis at a national level
  - Vatican beat (one named, reliable source)
  - Italian patrimonio / regional food / regional dialects

PARTISAN-MAPPING NOTE
Italian Facebook engagement is partisan-driven. For each Tier 2 source,
indicate whether it skews center-left, center-right, or neutral. This is
not an editorial recommendation — it's a routing signal. ItaliaOggi will
pick its niche (curatorial-sharp / utility / regional pride / editorial
voice) and the source mix needs to fit that niche.

OUTPUT FORMAT
One markdown file: docs/sources-audit-italy.md
Top of file: a summary table (source | tier | RSS | NewsAPI | partisan-tilt
| recommend)
Below: one section per source with the nine fields above.
End: a short "5 sources to investigate further" section.

OUT OF SCOPE
- Do not commit code or modify src/config/sources.js.
- Do not pull article content, only metadata, RSS URLs, last 20 titles.
- Do not test pipeline integration.

TIMEBOX
Six hours of investigation. If a source takes more than 20 minutes to
characterise, mark "needs further investigation" and move on.
```

### Why the two prompts are intentionally not symmetric

- **Italy version asks for partisan-tilt mapping.** Italian engagement is partisan-driven (per the Italy gap analysis); France's reach mix doesn't show the same structural pattern. Confirmed in audit findings — Italy sources cluster center-to-center-left, which became Decision 3b.
- **Italy version asks for engagement-format fit.** We identified seven concrete content pillars for Italy (Capire la legge, Azzurri, Vaticano, etc.) that need source feeds. France's pillars are looser and less format-specific.
- **Italy version's source list is heavier on city editions.** The Modena miss showed regional papers catch breaking stories hours before national wires; France's regional-paper list is broader but less specifically time-sensitive.

### Lessons for re-running these prompts on future markets

The audits surfaced two limitations of the original prompts that should be fixed before running them on AU / SE / other markets:

1. **The original prompts didn't probe RSS commercial licensing.** Add an explicit field to the per-source report: *"If the publisher's ToS or RSS endpoint includes language about commercial vs personal use, quote it verbatim."*
2. **The original prompts didn't probe social-API distribution as a substitute for RSS.** Fanpage.it and Will Media are not RSS sources but are the most engagement-relevant. Add: *"If RSS is unavailable, does the publisher distribute primarily through Instagram / TikTok / YouTube / Facebook Pages? Are platform APIs available?"*

---

## Question 4 — How can we improve our writing tone?

### Five concrete prompt-level changes (ordered by impact)

**4.1 Open with conflict or stake, not summary.**

| Bad (current) | Good |
|---|---|
| *"Le directeur de la CIA a rencontré de hauts responsables cubains à La Havane"* | *"Washington ouvre un canal secret avec La Havane. Geste fort ou aveu de faiblesse ?"* |
| *"Tensione nucleare nel Medio Oriente"* | *"L'Iran avverte gli Stati Uniti: 'pronti a dare una lezione'. È un bluff?"* |
| *"Diplomatie de façade sino-américaine"* | *"Trump et Xi sourient pour la photo. Mais sur Taïwan, rien n'avance."* |

**4.2 Front-load the French/Italian stake on every international post.**

Every world-news post needs one sentence answering *"Cosa cambia per chi vive in Italia ?"* / *"Qu'est-ce que ça change pour quelqu'un qui vit en France ?"* — within the first 100 characters of the caption.

Example: An Iran-US tension story shouldn't open with the diplomatic detail. It should open with *"Carburants, gaz, électricité : ce que la crise iranienne va coûter aux ménages français."*

**4.3 Use short, active, named sentences.**

- **Maximum 15 words per sentence.**
- **Active voice.** *"Une frappe tue six personnes"* not *"Six morts dans une frappe"*.
- **Name the protagonist in the first line.** *"Almodóvar à Cannes : 'le cinéma, c'est la douleur'"* beats *"Pedro Almodóvar parle de cinéma"*. *"Signorelli, l'eroe di Modena"* beats *"Tragedia a Modena"*.

**4.4 Binary close instead of essay prompts.**

| Bad | Good |
|---|---|
| *"Quale aspetto vi preoccupa di più in questo momento?"* | *"Terrorismo o disagio psichico? Una parola in commento."* |
| *"Pensez-vous que cette médiation peut aboutir ?"* | *"Crédible ou théâtre ? Votre verdict en commentaire."* |
| *"Quel type d'aide humanitaire vous semble le plus urgent ?"* | *"Aide humanitaire ou cessez-le-feu d'abord ? Un mot."* |

**4.5 Cultural register per country.**

| Country | Register | Allowed | Forbidden |
|---|---|---|---|
| **France** | Formal-but-warm, ironic | *"On vous explique pourquoi…"*, mild satire, rhetorical questions, *"présumé"* on legal cases | ALL-CAPS shouting, tabloid moralism, foreign-flag emoji |
| **Italy** | Direct, emotional, openly partisan-curious | ALL-CAPS overlays, *"perché i media non lo dicono?"*, *"art. XXX c.p."* legal hooks, named protagonist always | Detached neutral wire-tone, English overlays, generic *"E voi, che ne pensate?"* |

### Implementation

These are five additions to `CONTENT_SYSTEM_PROMPT` in `src/services/claude.js`, plus the parallel block in `supabase/functions/generate-caption/index.ts`. Validate by regenerating 5 articles per country and reading the diff.

### Two ongoing enforcements

1. **No English on a French / Italian page.** Hard rule in the prompt + a post-generation regex check that rejects any `image_headline` with >3 consecutive English-only words. Reject and regenerate.
2. **No duplicate seed comments within 7 days.** Either build a 10-template rotation pool with parametric substitution from the article body, or generate a fresh seed comment per article from the article's actual debate angle.

---

## Question 5 — New analytical feature to classify local drama / Reels / polls / emotional stories

### Recommendation

**Yes — build it. This is the missing routing layer between "we have an article" and "we know how to package it."** The current pipeline treats every article the same: still image + neutral headline + generic seed comment. It should differentiate based on what each article actually is.

### Proposed feature: per-article content-signals classifier

Add a `content_signals` JSONB column (or six discrete columns) to the `articles` table:

```jsonc
content_signals = {
  "local_drama_score":  0–100,   // identity-conflict, named local, polarisable
  "reel_fit_score":     0–100,   // has CCTV/eyewitness/strong-visual subject
  "poll_fit_score":     0–100,   // has a clean binary (yes/no, hero/villain)
  "emotional_charge":   0–100,   // pulls strong reaction in either direction
  "primary_emotion":    "outrage|pride|fear|hope|anger|nostalgia|curiosity|grief",
  "protagonist_named":  true|false,
  "binary_frame":       "terrorismo o pazzia" | null,
  "best_format":        "reel|poll|carousel|static|text_opinion|evergreen",
  "best_slot":          "morning_breaking|lunch_breaking|afternoon_reel|evening_politics|weekend_evergreen"
}
```

### How it integrates

1. **Cheapest implementation: extend the existing `generateCaption()` Claude call.** Return these scores as part of the same JSON response. Zero extra API spend — same prompt, same cache, extra output fields. ~200 extra system-prompt tokens, no meaningful output-token increase.
2. **Dashboard surfacing.** Article rows show a "Reel-fit: 87" badge. Sort and filter by score. Surface a "Top 3 Reel candidates today" card on the dashboard top-strip.
3. **Pipeline routing.**
   - `reel_fit_score > 70` AND Reel pipeline enabled → auto-suggest Reel format
   - `poll_fit_score > 70` → populate the `poll: {question, optionA, optionB}` field
   - `emotional_charge > 80` AND `primary_emotion = grief` → route to evergreen / sympathy template
   - `local_drama_score > 75` → escalate criticality and pin to top of dashboard
4. **Time-slot routing.** Combine `best_slot` with the slot-discipline P1 from both gap analyses so morning-breaking articles don't go out at 14:00.

### Why this is worth doing now

- Replaces the current single `criticality` field (`breaking / alert / trending / standard`) with a richer signal set that maps directly to format choices and the four engagement mechanics in the gap analyses.
- Where the France and Italy strategies converge: both need to differentiate *local-drama-with-Reel-potential* from *international-wire-news-with-static-image*. The current pipeline cannot.
- Costs almost nothing because we already pay for one Claude call per article.

### Risks to flag

1. **Score validation needs real engagement data.** Without `posted_at + fb_post_id + likes/comments/shares` (the write-back bug from the Italy doc), we cannot tell whether Claude's `reel_fit_score: 87` correlated with strong Reel performance. The post-write-back fix is a hard prerequisite for tuning the classifier.
2. **Don't over-engineer the schema.** Six fields is the right number to start. Fifteen fields is a research project that won't ship. If the first six prove valuable, extend.
3. **Calibration drift.** Claude's 0–100 scores may not be self-consistent across articles. Within the first 30 days, sample 50 scored articles and have a human re-score them to validate.

---

## Question 6 — How do we decide WHEN to publish and WHAT mix to publish?

### The problem

Today the pipeline fires every 30 minutes via cron and publishes whatever's `approved`. That's a non-decision — we publish things in the order they happened to be approved. The gap analyses recommended slot-discipline (07:30 / 12:00 / 19:00) and a content mix (50% local-France, etc.) but did not specify the algorithm. This section answers it.

Two coupled problems:

- **When** — at what clock times do posts go live, and which slot fits each article?
- **What** — given multiple eligible articles for a slot, how do we pick the one that keeps the content mix balanced?

### Recommendation: `publish_score` evaluated at fixed slot times

For every article in `status='approved'`, at the moment a publishing slot fires, compute:

```
publish_score =
    criticality_weight        (breaking=100, alert=60, trending=40, standard=20)
  × recency_decay             (1.0 at 0h old, 0.5 at 12h, 0.2 at 24h, 0 at 48h)
  × slot_match                (1.0 if article's best_slot == current_slot, else 0.5)
  × pillar_quota_factor       (boost pillars that are under-quota this week)
  × content_signal_boost      (1.0 + (emotional_charge / 200), so 0–50% lift)
  − duplicate_penalty         (subtract 30 if a similar story posted in last 72h)
```

The slot fires → score every eligible article → publish the top one if its score clears a minimum threshold (e.g., 30) → otherwise skip the slot. **One post per slot, max 4 slots per day.** Empty is better than off-brand.

### Slot definitions per country

From the gap-analysis market data:

**FranceAujourdhui — 3 slots/day (4 on breaking days)**

| Slot | Time CEST | Best for |
|---|---|---|
| `morning_breaking` | 07:30 | Breaking news + outrage stories |
| `lunch_news` | 12:00 | Breaking-news graphics, mid-day updates |
| `evening_engagement` | 19:00 | Politics, Reels, longer reads |
| (`weekend_evergreen` | 09:30 Sat/Sun | Throwback / pride content) |

**ItaliaOggi — 4 slots/day**

| Slot | Time CEST | Best for |
|---|---|---|
| `morning_breaking` | 07:30 | Breaking + outrage |
| `lunch_breaking` | 11:30 | Breaking graphics + Reels |
| `afternoon_reel` | 15:30 | Hero / Reel content |
| `evening_politics` | 19:30 | Politics, scandal, retrospective |

Italy gets 4 slots because Italian Facebook concentrates harder on the day's *fatto* — there are more high-traffic windows. France gets 3 because spreading thin on a new page risks ad-policy review.

### Pillar quotas (the "70% local" question)

Each article belongs to one content pillar (set by the `content_signals.best_pillar` field from Question 5, or by `story_category`). Weekly targets:

**FranceAujourdhui — 21 posts/week (3/day × 7)**

| Pillar | Weekly target | Share |
|---|---|---|
| France en débat (local conflict / politics) | 9 | 43% |
| Fierté française (food, institutions, evergreen) | 4 | 19% |
| Le monde vu de Paris (international with FR angle) | 4 | 19% |
| Sondage du jour (binary poll) | 1 | 5% |
| Retour sur... (weekend evergreen) | 1 | 5% |
| Ma ville aujourd'hui (regional) | 1 | 5% |
| **Local-France share total** | **~70%** | (débat + fierté + ville) |

**ItaliaOggi — 28 posts/week (4/day × 7)**

| Pillar | Weekly target | Share |
|---|---|---|
| Italia oggi: il fatto del giorno | 7 | 25% |
| Italia nel mondo (international with IT angle) | 6 | 21% |
| Capire la legge (legal explainer) | 2 | 7% |
| Azzurri (sport) | 3 | 11% |
| Italia che funziona (positive science/innovation) | 2 | 7% |
| Storie italiane (weekend evergreen) | 2 | 7% |
| La mia città (regional) | 2 | 7% |
| Vaticano | 1 | 4% |
| Flex slot (whatever's hottest) | 3 | 11% |
| **Local-Italy share total** | **~64%** | |

### How `pillar_quota_factor` self-corrects the mix

Each pillar starts the week at `quota_deficit = 0`. When a post goes live, its pillar's deficit drops by 1. When a slot fires:

```
pillar_quota_factor = 1.0 + (deficit / target_remaining)
```

A pillar that's behind schedule gets a score boost; one that's hit its quota gets a score penalty. **The system self-corrects** — if Monday was all international news, Tuesday will favour local stories until the mix rebalances. This avoids the brittle alternative ("Tuesday MUST be local") which would block a Modena-class breaking story.

### When the quota deficit is evaluated (the Top News question)

**Quota counts only when `status='posted'` AND `posted_at IS NOT NULL`. Never at Top News click.**

Top News is a *selection surface* — clicking an article opens it for review. Counting at click would mean an editor browsing 10 articles falsely depletes 10 quotas. Only the actual publish moves the counter.

The quota count is **never stored** — it's always derived from `posted` rows. That way it can't get out of sync, and if a post is deleted or status changes, the counter self-corrects on the next read:

```sql
SELECT pillar, COUNT(*)
FROM articles
WHERE country = $1
  AND status = 'posted'
  AND posted_at >= date_trunc('week', now())
GROUP BY pillar;
```

### Two different uses of pillar data

This is the subtlety that matters:

| Use | When recomputed | What it counts |
|---|---|---|
| **Actual quota** (drives the scheduler) | Every slot fire | Only `status='posted'` AND `posted_at IS NOT NULL` in the lookback window |
| **Ranking in Top News** (drives editor view) | Every Top News load | Same formula, displayed live to the editor |

The counter is **never written** — it's always a query. The trigger that moves it is `posted_at` getting written, nothing else.

### What does NOT count toward quota

- `pending` articles — not approved yet
- `approved` but `posted_at IS NULL` — sitting in the queue
- `blocked` articles — never going out
- Articles in the `publish_schedule` table with `status='planned'` — scheduled but not fired yet
- Articles with `status='posted'` but `posted_at IS NULL` (the current data-integrity bug — see below)

### What Top News *should* do

Top News is the editor's view of "what's eligible right now." It should:

1. Pull all `approved` articles (plus high-criticality `pending` ones if useful).
2. Compute the same `publish_score` the scheduler uses, with the live quota deficit baked in.
3. Sort by score, top-down.
4. Show the editor's running quota for the week at the top: *"This week: 4/9 France en débat, 1/4 Fierté française, 3/4 Le monde vu de Paris..."*
5. Clicking an article opens it for review — **no quota effect.**
6. Only when the editor hits "Publish" (or the scheduler fires automatically) does the count change, because that's when `posted_at` is written.

### The "scheduled but not fired" gap

If the scheduler pre-fills `publish_schedule` for the day (07:30, 12:00, 19:00 each pinned to specific articles), there's a window where those articles are planned but not yet posted. Rules:

- **For the actual weekly quota: they do NOT count** (only `posted` counts).
- **For the day's ranking: they DO count** as "scheduled load" — otherwise the scheduler could pick two articles from the same pillar in the same day because the morning slot's pick "hasn't published yet."

```
ranking_pillar_load_today = posted_count_today + scheduled_count_today
```

This keeps the day balanced without polluting the persistent weekly quota.

### Breaking-news bypass

Two overrides on top of the normal scoring:

1. **`criticality='breaking'` bypasses slot_match** (`slot_match` always = 1.0). A Modena-class attack at 14:00 doesn't wait for the 15:30 slot — it triggers an out-of-band publish if no post fired in the last 2 hours.
2. **A breaking-news cluster** (3+ similar articles in 6h, per the dedup detector from the Italy doc) **bypasses the daily cap of 4.** Major events justify a 5th post.

### Hard caps (non-negotiable)

- Max **4 posts/day** per page for the first 90 days (avoid ad-policy review on new pages).
- Min **2-hour gap** between any two posts on the same page.
- Skip the slot if no article scores above the threshold (e.g., 30). Empty is better than off-brand.
- Auto-skip articles older than 48h regardless of score. News has shelf-life.

### Hard prerequisite — the write-back bug must be fixed first

None of this works until the `posted_at` + `fb_post_id` write-back is fixed. Right now both FranceAujourdhui (23 rows) and ItaliaOggi (19 rows) have `posted_at = NULL` on every `status='posted'` row. The scheduler would read "0 posts this week" forever and over-publish everything.

Fix order is therefore strict:

1. Write-back fix (`posted_at` + `fb_post_id` after each successful Facebook publish)
2. Add `pillar` column (or use `content_signals.best_pillar` from Question 5)
3. Build `services/scheduler.js` with the score formula
4. Wire Top News to use the same scoring
5. Pre-fill `publish_schedule` for the day

### Where this lives in the codebase

- **New table `publish_schedule`** — planned slot fires with `country`, `slot_name`, `fires_at`, `article_id`, `status` (planned / fired / skipped). A daily background job pre-fills the next 24h.
- **`pipeline.js`** stays on its 30-minute cron but now only fires the *score-and-publish* step for slots that are due. It doesn't publish blindly.
- **New `services/scheduler.js`** — pure functions: score formula, pillar quotas, slot definitions. Easy to unit test.
- **Dashboard addition** — "Today's slate" strip showing what's scheduled per slot, what fired, what was skipped (with reason). One-click editor override to pin a different article to a slot.
- **`content_signals.best_pillar`** added to the JSONB schema from Question 5.

### Open decisions specific to scheduler

- **Are the slot times right?** Defaults are from the gap-analysis market data. They should be A/B-tested once write-back is fixed and per-slot engagement is measurable.
- **Are the pillar quotas right?** 43% *France en débat* is aggressive given the politics-gate situation — only achievable after the `boost_eligible` flag lands.
- **Should the editor have manual override?** Recommended yes. The dashboard should let a human pin an article to a slot and bypass the scheduler. The scheduler is a *default*, not a lock.
- **Does the score threshold (30) need tuning?** Probably — start at 30, raise/lower based on how often slots get skipped in the first 2 weeks.

---

## Implementation Order (Proposed)

Items in this order so each unlocks the next:

```
Week 1 — Foundations
  [ ] Fix ai_caption write-back (intro/question/cta NULL bug)            — both countries
  [ ] Fix post-write-back (posted_at + fb_post_id NULL bug)              — both countries
  [ ] Soften ADS_POLITICS_01 → boost_eligible flag                       — Italy first, then France
  [ ] Apply five tone changes to CONTENT_SYSTEM_PROMPT                    — both countries
  [ ] Force French-only / Italian-only image_headline                     — both countries
  [ ] Rotate seed_comment templates (10+ per language)                    — both countries

Week 2 — New sources + classifier
  [x] Conduct sources research (done — see docs/research/)                — both countries
  [ ] Resolve RSS licensing strategy (Decision 3a)                        — both countries
  [ ] Resolve Italy partisan-balance positioning (Decision 3b)            — Italy
  [ ] Verify RSS URLs for Phase-2 sources (~2h work)                      — both countries
  [ ] Add "free RSS" Phase-1 sources to sources.js (no licensing needed)  — 20 Minutes, Reporterre, Le Parisien (France); Il Resto del Carlino, Il Messaggero, Il Secolo XIX, Corriere Milano/Roma, La Gazzetta del Mezzogiorno, Vatican News, La Gazzetta dello Sport (Italy)
  [ ] Add content_signals classifier to generateCaption()                 — both countries
  [ ] Update dashboard to surface content_signals                         — Angular work
  [ ] Build breaking-news cluster detector in dedup.js                    — both countries
  [ ] Initiate partnership outreach (Fanpage.it, Will Media, Brut)        — separate workstream
  [ ] Consult French media-law specialist on RSS licensing                — external

Week 3 — Video
  [ ] Download Kokoro multilingual voices-v1.0.bin (HuggingFace hexgrad/Kokoro-82M)  — prerequisite
  [ ] Verify French + Italian Kokoro output quality on 5 sample captions    — both countries
  [ ] FFmpeg + Kokoro + Whisper Reel renderer                              — start with Italy (single new feature, single test bed)
  [ ] Generate 2 Reels per week manually triggered                        — Italy first
  [ ] Add reel_fit_score-driven auto-suggest on dashboard                 — Italy
  [ ] Pilot ItaliaOggi Reels for 2 weeks, measure engagement              — Italy

Week 4 — Scheduler + roll forward
  [ ] Add pillar column (or content_signals.best_pillar) to articles      — both countries
  [ ] Build services/scheduler.js with publish_score formula              — both countries
  [ ] Create publish_schedule table + daily pre-fill job                  — both countries
  [ ] Wire Top News in dashboard to use publish_score                     — Angular work
  [ ] Surface weekly quota counters in Top News header                    — Angular work
  [ ] Apply Reel pipeline to France                                       — France
  [ ] Apply boost_eligible model to France                                — France
  [ ] First content_signals calibration sample (50 articles)              — both
  [ ] Decision: positioning niche for ItaliaOggi (curatorial-sharp recommended) — Italy

Week 5 — Tune scheduler
  [ ] Tune score threshold and pillar quotas based on first 2 weeks live  — both countries
  [ ] A/B test slot times if engagement data is available                 — both countries
```

---

## Open Decisions

Status as of 2026-05-19: Decisions 2, 3a, and 3b resolved by user. Decisions 1, 4, 5, 6, 7 still pending.

1. **Reel rendering path.** Approve the fully local FFmpeg + Kokoro + Whisper stack as the first build? (Requires downloading the Kokoro multilingual voices pack — current voices.bin is English-only.) — **PENDING**
2. **Ad-policy gate softening.** ✅ **RESOLVED 2026-05-19.** `boost_eligible=false` flag approved. **Italy ships Week 1; France joins after a 30-day measurement window** on Italian organic-only posts in politics/weapons/drugs/judicial categories.
3. **Sources audit is complete.** Two follow-on decisions:
   - **3a. RSS licensing strategy.** ✅ **RESOLVED 2026-05-19.** **Free-RSS sources only at launch** — deploy 20 Minutes, Reporterre, Le Parisien, Actu.fr, Bondy Blog. Ouest-France, Brut, EBRA group (Le Progrès, DNA, L'Est Républicain), Rossel group (La Voix du Nord) are **deferred** — escalation to licence negotiation reserved for sources that prove engagement worth the legal/financial commitment post-launch. No upfront media-law specialist engagement; consult specialist only when a specific source's ROI justifies opening negotiations.
   - **3b. Italian partisan balance.** ✅ **RESOLVED 2026-05-19.** **Embrace center-left positioning** (Fanpage / Will Media / Il Post / Il Fatto Quotidiano model). Il Giornale **NOT** added. Implies the curatorial-sharp positioning niche.
4. **Tone rewrite.** Approve the five `CONTENT_SYSTEM_PROMPT` changes? — **PENDING**
5. **Classifier feature.** Approve the six-field `content_signals` schema addition? — **PENDING**
6. **Scheduler design.** Approve the `publish_score` formula, slot times (3 for France, 4 for Italy), and weekly pillar quotas? Confirm that quota is evaluated only when `posted_at` is written (not at Top News click). — **PENDING**
7. **Implementation order.** Confirm the five-week plan, or rearrange? — **PENDING**

Also still open (pre-launch external dependency, not in-session decision):

- **FR_LEGAL_01 editorial-language rewrite.** Design (regenerate with *présumé* / *mis en examen* / *selon le parquet*) is approved. Awaits French press-law specialist review before going live. Does **not** block Week 1 code work.

None of these are urgent in isolation, but the write-back bug (`posted_at` + `fb_post_id` NULL) is the hard prerequisite for both #2 (boost-flag measurement) and #6 (scheduler operation). Every day without it is another day of unmeasurable posts and another day where the scheduler — if built today — would over-publish because it reads "0 posts this week" forever.

---

## What This Document Does NOT Cover

- Specific code diffs — those come in the implementation PRs
- Quality benchmark of Kokoro's French (`ff_siwis`) and Italian (`if_sara`, `im_nicola`) voices on news content — needs the multilingual voices pack downloaded first, then a 5-sample listening test
- Storage / disk-space impact of the multilingual voices pack on `/home/jayam/projects/shared/`
- Legal review of `FR_LEGAL_01` editorial-language rewrite — should be reviewed by someone with French press-law familiarity before going live
- Legal review of RSS commercial-licensing strategy (Decision 3a) — also needs a French media-law specialist; same engagement could cover both
- Cost estimate for negotiating group RSS licences with SIPA (Ouest-France), EBRA (Le Progrès, DNA, L'Est Républicain), and Rossel (La Voix du Nord, 20 Minutes co-owner) — depends on negotiation outcome
- Performance baselines on ItaliaOggi or FranceAujourdhui — blocked on the write-back fix
- Sister-page strategy for Italy (Politica / Salute / Sport) — flagged in the Italy doc as P3
- Phase-3 partnership outreach plans for Fanpage.it, Will Media, Brut — separate workstream, not yet scoped
