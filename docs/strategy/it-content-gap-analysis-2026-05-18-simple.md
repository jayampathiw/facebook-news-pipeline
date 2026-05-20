# Italy Content Strategy — Plain-English Version

**Page:** [facebook.com/ItaliaOggi](https://www.facebook.com/ItaliaOggi)
**Date:** 2026-05-18
**What we looked at:** All 151 articles we collected for Italy in the last 30 days. Of those: 19 are marked as posted, 105 are still pending, 27 were blocked by our content rules, 0 approved-but-not-posted, 0 rejected.
**What we compared it against:** 10 popular Italian Facebook posts from May 17–18, 2026, given in the brief. **9 out of 10 of them are about the Modena car-ramming attack on May 17.**

> This is a simplified version of `it-content-gap-analysis-2026-05-18.md`. Same facts, same ideas, easier words.

> **Data note.** The 19 Italy articles in our system that say "posted" all have an empty `posted_at` and `fb_post_id`. You confirmed the page is live and the posts were published manually — but the pipeline isn't writing back when that happens. So we can't measure how those posts actually performed on the page. Everything below is based on the market data, not our own audience numbers.

---

## Short Summary

Our Italy page is posting **calm, neutral news with still images**, while the popular Italian Facebook posts on May 17–18 were almost entirely about **one big story (the Modena attack)** told through **political pages, party pages, and personal-brand pages** — not through regular news outlets. Four things are causing the gap:

1. **We missed the biggest Italian story of the day.** 9 of 10 popular posts are about the Modena attack. Our database has 3 related articles — 2 still sitting in "pending", 1 ("Meloni thanks Signorelli") blocked by our politics filter. We published none of them.
2. **Our story mix is too foreign and too Cannes-heavy.** 8 of our 19 posts are about world news or the French film festival. Italian local stories: 0.
3. **Our politics filter is killing us in Italy.** 100% of the 27 blocked articles were killed by the politics filter. Italian news always names politicians (Meloni, Schlein, La Russa, Conte, Tajani, Salvini). Blocking every named politician means blocking nearly all Italian news.
4. **All our posts are still images.** 4 of the 10 popular posts are short videos (Reels) — including the #1 post, the Signorelli interview, with 28,000+ interactions.

There's a fifth thing too: **Italian distribution does not run through traditional news pages.** 7 of the 10 popular posts come from political pages, personal brands, or international outlets. Trying to compete with ANSA and Repubblica on neutral news is the worst possible spot for a new page.

**The single most important decision before the page grows an audience:** stop blocking articles just because they name an Italian politician. Mark them as "do not boost" instead, so they can still be posted for free reach. And build something that catches breaking-news clusters (like Modena) before they slip through pending.

---

## 1. What the Market Has That We Don't

### 1.1 Story types we are missing

| Topic that's working in the market | What we posted in 30 days | Why this is a gap |
|---|---|---|
| **Big national tragedy + hero story** (Modena / Signorelli) | 0 — Modena story stuck in pending, hero story blocked | **We're slow, not strategy** |
| **Government response to crisis** (Meloni rushes to Modena) | 0 — blocked by our politics filter | We're doing this to ourselves |
| **Political scandal around top figures** (La Russa rape trial → Strasbourg) | 0 — similar stories all blocked | We're doing this to ourselves |
| **Opinionated media framing** (Belpietro: terrorism or madness?) | 0 | We don't produce opinion content at all |
| **Hyper-local political pages** (Lega Nonantola) | 0 | A distribution channel we have no plan for |
| **Public shaming of trolls by experts** (Bassetti) | 0 | A whole content format we don't have |
| **Foreign outlets covering Italian stories** (BBC, Al Jazeera, ABC7) | We had the wire stories — never published | Operational miss |
| **Italian politicians' daily moves** (Schlein, Meloni, Toti, Conte) | 0 — all blocked | We're doing this to ourselves |
| **Sport heroes** (Sinner reaching deep into tournaments) | 1 (Sinner-Rublev) | We do this, but only once. Should be a weekly series |
| **Italian pride / food / regional life** | 2 (the Pope, the divers tragedy) | Almost completely missing |

**Where our news comes from.** Our 19 posts come from traditional news wires: AGI, Repubblica, ANSA, La Stampa, Corriere. The popular posts come from political pages with huge followings (Silvia Sardone 1.5M, Maurizio Belpietro 118K, Fratelli d'Italia 831K), expert personal pages (Bassetti 262K), small local Lega pages (Nonantola at 2.6K), and editorial aggregators (Agorà Fanpage.it 1.05M). **Only 1 of 10 popular posts comes from a regular news page.**

**How we write vs how they write.** Our captions sound like a news desk: "Tension in the Middle East", "Diplomatic stalemate in the Strait of Hormuz", "Sleep balance and aging". The popular ones are loud and emotional: "I SHOWED THAT ITALY IS NOT DEAD", "Modena is not alone", "Why do the media call him 'crazy' and not 'terrorist'?", "THE LEFT SAYS 'IT'S RACISM'. FOR THE COPS IT'S A HUNT."

### 1.2 Format gaps

- **Short videos (Reels): 0 of ours, 4 of theirs.** The #1 most popular Italian post (Signorelli interview, 28,400 interactions) is a Reel. The BBC, Al Jazeera, ABC7, and Lega Como posts are also Reels. Reels are the only format Facebook gives a free push to in 2026.
- **Image carousels: 0 of ours, 1 of theirs.** Bassetti's "name and shame the troll" carousel is a uniquely Italian utility format.
- **Opinion text posts: 0 of ours, 1 of theirs.** Belpietro got 442 comments on a text-only post.
- **Yes/no polls: technically 0 in both samples — but** Belpietro's "terrorism or madness?" frame works as a hidden yes/no question. We have nothing in this style.

### 1.3 Our captions are unfinished

Looking at the 19 Italy posts in our database:

- The `intro` field is **empty in all 19**
- The `question` field is **empty in all 19**
- The `cta` field is **empty in all 19**
- Only the image headline, the seed comment, and the hashtags are filled in.
- The same seed comment template ("💬 E voi, che ne pensate? Vi sorprende questa notizia?...") and its tu-form variant appears **5 or more times word-for-word**.

This is the same code bug we found for France. One fix covers both countries.

### 1.4 We can't measure our own page

All 19 "posted" Italy articles in the database have an empty `posted_at` and `fb_post_id`. The page is live and the posts went up manually — but the system didn't record that they did. So we have no way to score which captions worked, which times worked, or which categories converted on Italy. Until this is fixed, every change we make is flying blind.

### 1.5 The right reaction we're not asking for

Italian popular posts use moves we don't:

- **"Terrorism or madness?" binary.** Frame the story as "the media is hiding what this really is". Belpietro's text post got a 48% comment-to-like ratio with just this one move. We never write captions in this register.
- **Italians cite the law in the comments.** They quote *article 595 of the criminal code* (defamation) and similar. Bassetti's troll post turned the comment section into a legal advice thread. This means **explainer/utility content** has a structural advantage in Italy.
- **Italians want a named protagonist.** Signorelli, La Russa, Meloni, even the named troll. Popular Italian posts almost always center one named human. Our captions are abstract: "Mystery over the divers' deaths" instead of naming the diver, "Transition at the top of the Fed" instead of putting Powell front and center.

---

## 2. Why Each Popular Post Worked

| # | Post | Main reason it worked | Backup reason | What it asks of the reader |
|---|---|---|---|---|
| 1 | Sardone — Signorelli hero Reel | National trauma turned into a hero story | Lega framing primes partisan sharing | Pick a side: medal for the hero vs. blame the immigrants |
| 2 | FdI — Meloni cancels Cyprus | Party voice = "the leader shows up for the country" | Starts partisan war in comments | Praise or accuse of opportunism |
| 3 | BBC — Modena Reel | Foreign authority = neutral video everyone can share | Comments turn it into an ethnicity debate | All-day argument seed |
| 4 | Al Jazeera — eyewitness Reel | First-person witness humanises the story | Islamophobia vs mental-health debate | Global outlet brings in the diaspora |
| 5 | Agorà — La Russa Strasbourg | Italians hate elite impunity | Evening post = after-dinner political scrolling | Demand accountability, drive shares |
| 6 | Belpietro — terrorism or madness | "Are the media hiding what this really is?" | Cites France and Germany | Sets the day's TV talk-show agenda |
| 7 | RTL — Meloni travel | Factual update reframed as propaganda by opponents | Sad-looking Meloni photo invites attacks | Hostile comments stack up |
| 8 | Lega Como police video | Police-vs-immigrants framing | Closed-group echo-chamber sharing | Anti-left rage, expel-them calls |
| 9 | ABC7 — surveillance video | Raw CCTV = visceral proof | US outlet posting at 3am hits Italy at breakfast | Speculation about the driver |
| 10 | Bassetti — troll shaming | Personal harassment turned into public shaming | COVID-era abuse fatigue | Legal-advice comment thread |

**Patterns specific to Italy:**

- **One big story dominates the whole cycle.** 9 of 10 Italy posts on May 17 are about Modena. Italian Facebook concentrates around the day's *fatto* much more than French Facebook did in the same kind of sample. **Missing the day's big story = missing 70%+ of available engagement that day.**
- **Partisan identity beats neutral journalism.** The Lega MEP (Sardone, 1.5M) and the party (FdI, 831K) both win on the same Modena story that BBC and Al Jazeera win on. Same facts, three different frames, all win. A neutral version would not win.
- **Tiny pages with huge engagement-per-follower.** Lega Nonantola has 2.6K followers and got **39.8% follower engagement** on Item 8. Italian Facebook rewards small, tight, ideologically-tight communities much more than France does.
- **Visual rule in Italy.** Block-letter Italian text, declarative or accusatory, named human centered in the picture, color signals (red breaking-news, ULTIM'ORA badge). Our image overlays include "Cinema: Pain and Desire", "Cinema History Iconic Moment", "Cannes Film Festival Spotlight" — **English on an Italian page is wrong**.
- **Timing.** Popular posts cluster between 07:00 and 12:35 Rome time (morning + breaking news), with a second push 19:00–23:30 (politics + opinion). Our pipeline posts whenever the cron runs.

---

## 3. What We Should Do (Sorted by Impact vs Effort)

### P0 — Fix these right now

1. **Stop hard-blocking articles that name Italian politicians.** Change the politics filter so it sets a flag like `boost_eligible = false` instead of blocking the article entirely. This way the article still gets posted (free organic reach), we just don't run paid ads on it.
   - Impact: unlocks about 27 articles a month for Italy that we already paid Claude to write — including "Meloni thanks Signorelli", which would have been our Modena angle.

2. **Fix the caption code.** All 19 Italy posts are missing intro, question, and CTA. Same bug as France — one fix covers both.

3. **Fix the post write-back.** When a post goes up on Facebook, the system needs to write `posted_at` and `fb_post_id` back into the database. Right now this isn't happening, so we have no way to measure performance.
   - Impact: essential. Without this, we can't tell what's working.

4. **Force all image overlays to be in Italian.** About 5 of the 19 posts have English text on what should be an Italian page. Fix in `claude.js` and in the edge function.

5. **Stop reusing the same seed comment.** The "E voi, che ne pensate?" template appears 5+ times. Build a pool of 10+ Italian variants and rotate them. Never repeat within 7 days.

### P1 — Operational fixes (this week)

6. **Build a breaking-news cluster detector.** When 3 or more articles about the same event arrive within 6 hours (Modena × Modena × Modena), automatically bump them to `breaking` and put them at the top of the dashboard.
   - Why: this is the one fix that stops us from missing the next Modena. Right now we have only 1 article tagged `breaking` in 30 days — that's clearly wrong.

7. **Re-balance the story mix.** Today: 8 of 19 posts (42%) are world news or Cannes. Target: 50% Italian / 25% world news with an Italian angle / 25% lifestyle / culture / sport / patrimonio.
   - Add regional sources: *Il Resto del Carlino* (would have caught Modena before the national wires), *Corriere della Sera* city editions, *La Nazione*, *Il Mattino*.

8. **Teach the prompt about Italian engagement mechanics.**
   - For crime stories with a foreign suspect, the question should default to a binary like "Terrorism or mental illness?", not an analytical question.
   - When there's one named human in the article, the name should appear in the image headline. "Almodóvar: pain and desire" beats "Cinema: Pain and Desire". "Signorelli, the hero of Modena" beats "Tragedy in Modena".
   - For legal stories, let the seed comment invite legal interpretation ("Article XXX says... and you?").

### P2 — Pick a position (next 2–4 weeks)

9. **Decide what ItaliaOggi *is*.** A neutral generalist page will lose in Italy — only 1 of 10 popular posts comes from one. Pick one of:
   - **Sharp curatorial** (like Agorà Fanpage.it): surface stories no one else does, frame them clearly. Smallest pivot from what we're doing now.
   - **Public-service utility** (like Bassetti, Selvaggia Lucarelli): health, law, money explainers. Lower political risk.
   - **Italian pride / regional** (like apolitical Lega micro-pages): heavy on regional dialects, food, patrimonio, sport. High engagement per follower.
   - **Named editorial voice** (like Belpietro): single columnist persona. Hardest to staff.
   - Recommendation: **sharp curatorial** + utility content as a second pillar. Decide after 30 days of real data (which needs P0 #3 first).

10. **Start posting Reels (at least 1 a week).** Lowest-cost path: repackage source videos with an Italian text overlay and our watermark. The #1 popular Italian post is a Reel made from raw plaza footage — no production needed.

11. **Build content pillars.**
    - **🔴 "Italia oggi: il fatto del giorno"** — daily breaking, prioritised by the cluster detector
    - **🟢 "Italia che funziona"** — weekly positive Italian story (science, hospitals, athletes)
    - **🟡 "Italia nel mondo"** — Italian angle on global news
    - **🔵 "Capire la legge"** — weekly legal/policy explainer (this is the Italian advantage)
    - **⚪ "Storie italiane"** — weekend evergreen (heroes, traditions, UNESCO)
    - **🎾 "Azzurri"** — sport-hero series, especially around Sinner
    - **📍 "La mia città"** — weekly rotating region

### P3 — Bigger experiments (next month)

12. **Sister-page strategy (worth considering).** *ItaliaOggi (Politica)* runs organic-only with politics unblocked. *ItaliaOggi (Salute)* stays ad-eligible with utility content. *ItaliaOggi (Sport)* stays ad-eligible. Three small focused pages cross-linking are safer than one mixed page that triggers ad policy reviews.

13. **Use Italy as the test bed.** Once the write-back fix lands, instrument ItaliaOggi properly and tune engagement on Italy first before rolling changes to France.

14. **Regional micro-pages or Instagram cross-posts.** The 39.8% engagement on Lega Nonantola (2.6K followers) shows there's a structural Italian opportunity in city-tagged content.

---

## 4. Step-by-Step Implementation Guide

### 4.1 Topics to chase, in order of priority

1. Italian breaking news with named people (unblock first — see Rec #1)
2. Italian politics: Meloni, Schlein, La Russa, Tajani, Conte, party scandals (unblock first)
3. Crime + integration debate with binary framing ("terrorism or madness?")
4. Italian sport heroes — Sinner, the *azzurri*, Olympic arcs
5. Vatican / Papa Leone (currently only 1 post; should be weekly)
6. Italian pride + food + regional life (currently zero)
7. Legal and consumer-protection explainers (Italian structural advantage)
8. Judicial-political scandals (Toti yacht-style, La Russa-style) — needs the boost flag
9. Health / science with Italian researchers (currently strong: 5 of 19)
10. Cannes and global culture — but only with an Italian angle (currently over-weighted at 4 of 19)

### 4.2 Visual and formatting rules

| Element | Where we are | Where we should be |
|---|---|---|
| Language on the image | Mixed Italian / English | **Italian only — strict rule** |
| Headline style | Sentence case, neutral, abstract | **Direct, declarative, named person when possible, max 12 words** |
| Color use | Random | **Red = ULTIM'ORA, Blue = explainer/poll, Gold = positive, B&W = retrospective** |
| Format mix per week | 100% still | **60% still / 20% Reels / 15% carousel / 5% text-opinion** |
| Watermark | Anton font, 70% opacity, bottom-right | Keep — already correct |
| Named human in the picture | Sometimes | **Always when there is one** |

### 4.3 Writing changes for Italy

- **Replace "analytical" with "accusatory or sympathetic" frames.** "Mystery over the divers' deaths" → "Three Italian divers, the Maldive sea: what really happened?". "Transition at the top of the Fed" → "Powell leaves the Fed after 8 years: what does this mean for our mortgages?"
- **Always answer: "What does this mean for someone living in Italy?"** Every world-news post needs one sentence on the Italian angle.
- **Binary close on debate stories.** "Terrorism or mental illness? One word in the comments." Don't use slow analytical questions.
- **Use the politician's surname.** Italians think in surnames. "Meloni decides..." beats "The government decides...".
- **Allow legal references.** "Defamation (art. 595 of the criminal code) — what do you think?" is a real Italian engagement hook.
- **Pick "tu" or "voi" and stick with it.** Today the seed comments mix both registers on the same week's posts.

### 4.4 Content pillar plan

- **🔴 "Italy today: the main story"** — every day on breaking days
- **🟡 "Italy in the world"** — 3 times a week — global news with Italian angle first
- **🔵 "Understanding the law"** — 1 a week — legal explainer carousel
- **🎾 "Azzurri"** — 1–2 a week during active sport seasons
- **🟢 "Italy that works"** — 1 a week — positive science/innovation
- **⚪ "Italian stories"** — 1 a week on weekends — patrimonio, heroes, traditions
- **📍 "My city"** — 1 a week — rotating region
- **✝️ "Vatican"** — 1 a week — Papa Leone has consistent reach; treat as a beat

### 4.5 Posting time plan

- **Slot 1 — 07:00–08:00 Rome time:** breaking and outrage (commuter / news-app push window)
- **Slot 2 — 10:30–12:30 Rome time:** breaking-news graphics and Reels (lunchtime push window)
- **Slot 3 — 15:30–17:00 Rome time:** longer-form hero / Reel content (after-school scroll)
- **Slot 4 — 19:00–23:30 Rome time:** politics, scandal, retrospective (after-dinner scroll)
- **Weekend mornings:** evergreen / Vatican / sport-hero content
- **Limit:** maximum 4 posts a day for the first 90 days. Quality builds the seed audience; volume risks ad-policy reviews on a new page.

### 4.6 Things to do this week

```
[ ] Change ADS_POLITICS_01 from "block" to "do not boost" flag (Italy first)
[ ] Fix the caption pipeline so intro/question/cta are filled on every article
[ ] Fix the post write-back so posted_at + fb_post_id are saved when a post goes live
[ ] Force Italian-only image headlines in claude.js and the edge function
[ ] Build 10+ Italian seed-comment templates and rotate them (no repeats inside 7 days)
[ ] Build the breaking-news cluster detector in src/utils/dedup.js
[ ] Add Italian regional sources: Il Resto del Carlino, Corriere city editions, La Nazione, Il Mattino
[ ] Add the "Italian binary" caption variant for crime + foreign-suspect stories
[ ] Force protagonist names in image headlines when there is one named human
[ ] Pick a positioning niche (recommended: sharp curatorial + utility second)
[ ] Schedule posts at 07:30 / 11:30 / 15:30 / 19:30 Rome time instead of "whenever cron runs"
[ ] Try 2 Reels this week — repackaged source clips with an Italian overlay
[ ] Build a starter list of 20 Italian sport heroes / stories
[ ] Create the weekly "Capire la legge" (Understanding the law) slot
```

---

## Appendix A — Our 19 posted articles, sorted

**International / Geopolitics: 5**
Powell at the Fed, Iran-US tensions (×2), Trump-Xi summit, Narges Mohammadi case.

**Cannes / International culture: 4**
Peter Jackson, Almodóvar, Thelma & Louise, Cannes opening night.

**Health / science: 5**
Cancer and age, sleep and aging, neural hearing aid, prevention spending, psilocybin for depression.

**Sport: 1** — Sinner-Rublev at the Rome Internazionali.

**Society / Vatican: 2** — Papa Leone at La Sapienza, divers tragedy in the Maldives.

**Economy / tax: 2** — Italian tax return (730), war-driven inflation.

**Italian local politics, crime, regional life, lifestyle, sport, traditions: 0.**

Same pattern as France — heavy on Cannes + international + science, nothing on Italian local life. Italy's gap is sharper because Italian Facebook is even more locally driven than French.

---

## Appendix B — Blocked articles, by filter

| Filter | Count | What got killed |
|---|---|---|
| Politics filter (ADS_POLITICS_01) | **27** | Every Meloni / Schlein / Conte / Tajani / Crosetto / Salvini / Toti / La Russa story. Also "Meloni thanks Signorelli" — the exact Modena angle that won the day. Also Schlein on same-sex marriage (a major Italian social debate). Also anything mentioning Iran (the regex is too broad). |
| Weapons filter | 0 | (France lost the Nantes shooting to this; Italy is unaffected this month.) |
| Legal filter | 0 | (France-specific.) |
| Drugs filter | 0 | |

**100% of blocks are from a single filter.** That's why this is the highest-impact fix.

---

## Appendix C — Popular posts vs our pipeline

| # | Popular post | Would ItaliaOggi have posted it under our current rules? |
|---|---|---|
| 1 | Sardone — Signorelli hero Reel | No — politics filter + we don't do Reels |
| 2 | Fratelli d'Italia — Meloni cancels Cyprus | No — politics filter |
| 3 | BBC — Modena Reel | The story is in pending, we never published it; also no Reels |
| 4 | Al Jazeera — eyewitness Reel | Same as #3 |
| 5 | Agorà — La Russa Strasbourg | No — politics filter |
| 6 | Belpietro — terrorism or madness | No — opinion-text format we don't generate; politics-adjacent |
| 7 | RTL — Meloni travel | No — politics filter |
| 8 | Lega Como police video | No — politics filter + no Reels |
| 9 | ABC7 — surveillance | The story is in pending, we never published it; also no Reels |
| 10 | Bassetti — troll shaming | No — utility / personal-brand format we don't source |

**Posts we could have published as-is: 0 of 10.**

After P0 #1 (politics-filter softening) and adding Reels: **5–6 of 10** become reachable. That's the size of the prize.

---

## Appendix D — Things we did NOT analyse

- **Engagement on our own ItaliaOggi posts** — `posted_at` and `fb_post_id` are empty in the database. Until that's fixed, this is impossible.
- **Caption A/B testing** — not set up.
- **Day 2 of the Modena story** — this analysis is May 17–18. A second wave (legal proceedings, suspect identity, victim updates) is likely Days 2–7. The pipeline should be ready for it.
- **Paid boost return** — no spend data was given.
- **Comparing actual France page numbers to Italy** — same instrumentation problem as Italy.
