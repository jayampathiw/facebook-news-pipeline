# Posting Time Optimization — Data-Driven Schedule

**Created:** 2026-05-28
**Pages analyzed:** Vivere in Italia (IT) + France Aujourd'hui (FR)
**Data window:** May 1–27, 2026 (~27 days)
**Methodology:** External research consensus from 3 AI tools + Meta Insights CSV analysis
**Status:** Recommendations drafted; awaiting deployment + A/B tests

## ⏰ Time Zone Reference (read this first)

**Every time in this document is local Europe/Paris time (CET / CEST)** — same zone as Rome.
- Winter (late Oct – late Mar): **CET = UTC+1**
- Summer (late Mar – late Oct): **CEST = UTC+2**

For other locations:

| Time zone | Offset from CEST (summer) | "22:00 CEST" becomes… |
|---|---|---|
| UTC | −2h | 20:00 UTC |
| Sri Lanka (IST) | +3.5h | **01:30 IST next day** |
| US Eastern (EDT) | −6h | 16:00 EDT |
| Australia Eastern (AEST) | +8h | 06:00 AEST next day |

The `publish-slot.js` cron resolves slot times in `Europe/Paris` via `toLocaleString({ timeZone: 'Europe/Paris' })`, so the server timezone is irrelevant — slots always fire at the right Italian/French local moment.

---

## 1. Executive Summary

Five findings that should shape posting strategy. Both pages independently confirm the first four — strong signal.

1. **Sunday is the #1 day for both pages.** IT Sun avg 26.5 imp vs Wed 10.8. FR Sun avg 19.7 vs Mon 6.7. External research said Wed/Thu — contradicted by data.
2. **22:00 is the #1 hour for FR; 11:00 is the #1 hour for IT.** Late evening (21–23) dominates evening engagement on both pages. The current 19:30 slot is statistically weak.
3. **France Aujourd'hui is over-posting.** 5.3 posts/day at 11.5 avg impressions vs IT's 3.8/day at 15.5 — same audience attention divided across too many posts.
4. **The "Sunday mass blackout" advice is wrong for these pages.** IT's top post by impressions was Sunday 11:30 (90 imp); current actual followers aren't yet the 65+ Catholic Roman persona that advice assumes.
5. **Format data is missing.** Both pages are 100% Photo. Reel performance is unknown — requires explicit testing.

---

## 2. Data Sources

| Page | CSV File | Posts | Date Range | Mean imp/post |
|---|---|---|---|---|
| Vivere in Italia (IT) | `pages/Feb-27-2026_May-27-2026_Content_Publish time_Summary_958693207061400.csv` | 102 | May 1–27 | 15.5 |
| France Aujourd'hui (FR) | `pages/Feb-27-2026_May-27-2026_Content_Publish time_Summary_2532665090522626.csv` | 144 | May 1–27 | 11.5 |

**Note on date range:** Filenames say "Feb-27 to May-27" but actual data is May 1+ — pages launched May 1.

### Research inputs (qualitative)

Three independent AI tools were run against a structured research prompt (`/home/jayam/projects/personal/facebook-news-pipeline/docs/research/grazie-italia-analysis.md` contains related audience context). Each produced different slot recommendations:

- **Output 1:** Buffer/Sprout-grounded — recommended Wed/Thu peaks, pre-news evening (19:15)
- **Output 2:** Simplified single-pattern (07:45 / 12:45 / 19:15 every weekday)
- **Output 3:** Cultural-rhythm-grounded — recommended post-news evening (21:15+), skip FR midday

Validation against actual Meta Insights data: **Output 3 was the most accurate**. Outputs 1 & 2 were anchored in US-Gen-Z benchmarks that don't apply.

---

## 3. Top Findings

### 3.1 Day-of-week performance

| Day | IT avg imp | IT posts | FR avg imp | FR posts |
|---|---|---|---|---|
| Mon | 18.0 | 4 | 6.7 | 7 |
| Tue | 13.4 | 7 | 10.8 | 17 |
| Wed | 10.8 | 19 | 8.5 | 29 |
| Thu | 15.5 | 26 | 10.6 | 40 |
| Fri | 12.4 | 14 | 8.8 | 15 |
| Sat | 13.2 | 16 | **15.1** | 19 |
| **Sun** | **26.5** | 16 | **19.7** | 17 |

**Takeaways:**
- Sunday is #1 for BOTH pages, independently
- Wednesday is the weakest day for IT and second-worst for FR — yet receives the most post volume (29 FR / 19 IT posts). Volume is being wasted on the worst day.
- Mon n=4 for IT is too small to interpret reliably
- FR Sat is second-best — Sun + Sat are FR's clear weekend lift

### 3.2 Hour-band performance

| Hour band | IT avg imp | IT posts | FR avg imp | FR posts |
|---|---|---|---|---|
| 00–06 | 12.9 | 38 | 9.2 | 45 |
| 06–09 | 9.9 | 15 | 10.1 | 30 |
| 09–12 | **21.8** | 17 | 9.9 | 24 |
| 12–14 | 20.5 | 4 | 12.4 | 7 |
| 14–17 | 18.0 | 1 | 13.5 | 2 |
| 17–19 | — | 0 | 1.5 | 2 |
| 19–21 | 11.3 | 6 | 13.8 | 6 |
| **21–23** | **20.1** | 14 | **18.6** | 18 |
| 23–24 | 17.4 | 7 | 16.3 | 10 |

**Takeaways:**
- IT spikes mid-morning (09–12) AND late-evening (21–23) — bimodal pattern
- FR is overwhelmingly nocturnal — only 21–23 and 23–24 bands clearly beat 11.5 baseline
- 17–19 is a dead zone for FR (n=2, avg 1.5)
- 06–09 is weak for both — current 07:30 slot is in a soft zone

### 3.3 Best single hours (where n≥4)

**ITALY:** `11:00 (28.8) → 09:00 (25.4) → 22:00 (20.6) → 21:00 (19.3) → 23:00 (17.4)`

**FRANCE:** `22:00 (20.8) → 23:00 (16.3) → 21:00 (15.9) → 20:00 (15.0) → 07:00 (14.7) → 09:00 (12.9)`

### 3.4 Top posts qualitative

**ITALY — Top 5 (5 of 12 top posts fell on Sunday):**

| Date/time | Imp | Content |
|---|---|---|
| Sun 05-10 11:30 | 90 | Italian debt vs Greece |
| Sat 05-23 09:22 | 72 | Flotilla controversy |
| Sun 05-10 10:30 | 49 | Scooter law |
| Fri 05-08 01:30 | 48 | Nordio/press freedom |
| Sun 05-24 23:30 | 43 | Activist tension |

**FRANCE — Top 5 (weekend evening dominant):**

| Date/time | Imp | Content |
|---|---|---|
| Sun 05-10 22:30 | 88 | Édouard Philippe candidacy |
| Sat 05-09 23:30 | 79 | Gendarme death (also the 1 share) |
| Thu 05-07 07:30 | 49 | PSG arrests |
| Sat 05-09 22:30 | 45 | Putin/Ukraine |
| Sun 05-10 21:30 | 34 | Iran/France threat |

**FR Sun 22:00 = 49 avg imp** — single hottest day×hour cell across both pages.

### 3.5 Format and shares signal

- Both pages: **100% Photo**. Reel/Video/Link unknown.
- IT shares: 1 across 102 posts (1%)
- FR shares: 3 across 144 posts (2%)
- Engagement signal is extremely thin — both pages are still in algorithm discovery phase

---

## 4. Comparison: External Research vs Actual Data

| Claim | Source | Verdict |
|---|---|---|
| "Wed/Thu are best days" | Output 1, 2 | ❌ WRONG — Sunday is #1 both pages |
| "Skip Sunday 10–11:30 for Italian mass" | Output 1, 2 | ❌ WRONG — IT's top post was Sun 11:30 |
| "Post pre-news at 19:15" | Output 1, 2 | ❌ WRONG — 22:00 beats 19:30 cleanly |
| "Post post-news at 21:15+" | Output 3 | ✅ RIGHT — 22:00 is even slightly better |
| "Skip FR midday entirely" | Output 3 | ⚠️ TOO AGGRESSIVE — FR 12:00 = 12.0 imp (decent) |
| "Italian riposo 13–16 strong" | Output 3 | ✅ DIRECTIONALLY RIGHT (IT 12–14 = 20.5 imp, small n) |
| "Reels > Photos" | All outputs | 🤷 UNTESTABLE — both pages 100% Photo |

**Conclusion:** External research based on generic FB benchmarks (Buffer, Sprout, US data) is unreliable for mature Mediterranean audiences. Cultural-rhythm-based reasoning (Output 3) was closer but still over-aggressive. Internal data trumps both.

---

## 5. Recommended Schedule

### 5.1 Italy (Vivere in Italia)

| Day | Slot 1 | Slot 2 | Slot 3 | Confidence | Reasoning |
|---|---|---|---|---|---|
| Mon | 07:30 | 13:00 | **22:00** | Med | Standard + data-winning evening |
| Tue | 07:30 | 13:00 | **22:00** | Med | Same |
| Wed | 07:30 | 13:00 | **22:00** | Med | Weakest day — maintain rhythm, lower expectations |
| Thu | 07:30 | 13:00 | **22:00** | Med | Highest volume day in current data |
| Fri | 07:30 | 13:00 | **22:00** | Med | Standard |
| Sat | 09:00 | — | **22:00** | Med | Drop midday (weekend midday is thin); 2 slots |
| **Sun** | **11:00** | 13:00 | **22:00** | **High** | **Sun = #1 day. 11:00 = #1 hour. 22:00 = strongest cell** |

**Total IT posts/week:** 20 (was 19 — unchanged volume, redistributed)

### 5.2 France (France Aujourd'hui)

| Day | Slot 1 | Slot 2 | Slot 3 | Confidence | Reasoning |
|---|---|---|---|---|---|
| Mon | 07:30 | — | **22:00** | Med | Weakest day (avg 6.7); 2 slots |
| Tue | 07:30 | 13:00 | **22:00** | Med | Standard |
| Wed | 07:30 | 13:00 | **22:00** | Med | Standard |
| Thu | **07:30** | 13:00 | **22:00** | Med-High | Thu 07:30 produced a 49-imp top-5 post |
| Fri | 07:30 | — | **22:00** | Med | Weak day; 2 slots |
| Sat | 09:00 | — | **22:00** | High | Sat = 2nd best day; Sat 22:00 in top cells |
| **Sun** | 09:30 | — | **22:00** | **High** | **Sun 22:00 = 49 imp single cell; THE killer slot** |

**Total FR posts/week:** 17 (was 21 — **−19% volume**, intentional cadence cut)

### 5.3 Diff from current config

| Page | Currently | Proposed | Net effect |
|---|---|---|---|
| IT weekdays | `07:30 + 19:30` | `07:30 + 13:00 + 22:00` | +1 slot, evening shifted late |
| IT Sat | `07:30 + 09:00 + 19:30` | `09:00 + 22:00` | −1 slot, evening late |
| IT Sun | `07:30 + 09:00 + 19:30` | `11:00 + 13:00 + 22:00` | Complete rework — data-driven |
| FR weekdays | `07:30 + 12:00 + 19:00` | Mixed — see table above | Cadence cut on weak days |
| FR weekend | varies | `09:00–09:30 + 22:00` | Late-evening focus |

---

## 6. Cadence Question — FR Is Over-Posting

5.3 posts/day at 11.5 avg impressions = the algorithm is dividing FR audience attention across too many posts. Classic over-posting signal.

**Recommendation:** Cut FR to ~3/day weekday max (2 on Mon/Fri) until consistent 50+ imp/post. Invest the freed volume into quality: better captions, Reels test, identity-mode mix.

**Cadence revisit triggers:**
- 1,000 followers reached
- Consistent 50+ avg imp/post for 4 consecutive weeks
- Reel format validated (see A/B Test #4)

---

## 7. A/B Test Plan (Weeks 1–4)

Each test resolves a remaining uncertainty. Run in order; don't overlap conflicting tests.

| # | Test | Variant A | Variant B | Schedule | Question |
|---|---|---|---|---|---|
| 1 | IT evening time | 21:00 | 22:00 | Alt Tue/Thu × 2w | Which late-evening hour wins? |
| 2 | IT Sun morning | 11:00 | 13:00 | Alt Sundays × 4w | Confirm 11:00 as Sun morning slot |
| 3 | FR midday slot | 07:30 + 22:00 (no midday) | 07:30 + 13:00 + 22:00 | Alt weeks × 2w | Is midday worth keeping for FR? |
| 4 | Reel format | All Photo (control) | ≥1 Reel/week | Weeks 3–4 | Does Reel outperform Photo? |
| 5 | FR cadence | 5/day (current) | 3/day (proposed) | First 2w of new schedule | Does less = more? |

**Success metric:** Average impressions/post in the variant window vs control window. Track in a simple spreadsheet (Meta Business Suite → Posts → filter by date).

---

## 8. Implementation

### 8.1 Code locations

- **Slot config:** `src/services/facebook.js` exports `SLOTS` (weekday) and `SLOTS_WEEKEND` (weekend) — both keyed by country
- **Slot selector:** `src/scripts/publish-slot.js` uses day-of-week detection to pick which constant to apply
- **Schedule check:** `src/utils/publishScore.js → nearestSlot()` enforces ±15 min window around each slot

### 8.2 Recommended config shape

```js
// src/services/facebook.js
export const SLOTS = {
  IT: ['07:30', '13:00', '22:00'],          // Mon–Fri
  FR: ['07:30', '13:00', '22:00'],          // Tue–Thu
};

export const SLOTS_LIGHT = {                 // Mon, Fri for FR (2-slot cadence cut)
  FR: ['07:30', '22:00'],
};

export const SLOTS_WEEKEND = {
  IT: {
    saturday: ['09:00', '22:00'],
    sunday:   ['11:00', '13:00', '22:00'],
  },
  FR: {
    saturday: ['09:00', '22:00'],
    sunday:   ['09:30', '22:00'],
  },
};
```

The current code uses simpler `SLOTS_WEEKEND` keyed by country (not by day). Implementing the per-day shape requires a small refactor in `publish-slot.js` — see "Open work" below.

### 8.3 Deployment sequence (staged)

1. **Week 1:** Update IT weekday slots (`07:30 + 13:00 + 22:00`). Keep IT weekend as-is. Keep FR as-is. Observe IT weekday delta.
2. **Week 2:** Update IT Sunday (`11:00 + 13:00 + 22:00`). Test #2 starts here.
3. **Week 3:** Update FR weekday slots. Start Test #1 (IT evening) and Test #3 (FR midday).
4. **Week 4:** Update FR weekend. Begin Test #4 (Reel format) — schedule 1 Reel per week per page.

---

## 9. Critical Caveats

1. **Sample size.** ~100–150 posts per page over 27 days. Patterns are suggestive, not definitive. Sunday signal is the most robust because it shows independently in both pages.
2. **Page age.** ~27 days = still in Facebook's discovery phase. The "real" audience profile is still forming. Re-analyze in 60 days.
3. **No format diversity.** Every post is Photo. Cannot validate any Reel/Video claim — must explicitly test.
4. **No demographic split.** Age × hour breakdown not exported. Cohort overlap assumptions (65+ × 35–60) remain inferred.
5. **Posting at "01:30" appears in top posts** — likely a cron-firing artifact, not deliberate audience choice. Discount these from interpretation.
6. **Single share signal.** 4 shares across 246 posts means engagement quality metrics are too thin to act on individually. Focus on impressions as primary metric for now.

---

## 10. Re-Analysis Triggers

Re-run this analysis when ANY of the following happens:

- 60 days have passed since 2026-05-28 (so: 2026-07-27)
- Either page hits 1,000 followers
- Either page averages 50+ imp/post for 4 consecutive weeks
- Reel format introduced (need new format-level baseline)
- Major audience inflection point (organic viral post, paid boost, partnership)
- Schedule changes more than once (test results should drive iterations)

When re-running:

1. Export fresh CSVs from Meta Business Suite (Content → Publish time → Summary)
2. Run analysis with: `python3 docs/research/posting-time-analysis-runner.py` (TODO — create as a reproducible script)
3. Compare new patterns to this baseline
4. Update the recommended schedule section
5. Note which earlier predictions held vs failed

---

## 11. Open Work

- [ ] Implement per-day weekend slot config in `src/services/facebook.js` and update `publish-slot.js` to read `SLOTS_WEEKEND[country][dayName]`
- [ ] Create reproducible Python analysis script `docs/research/posting-time-analysis-runner.py` so future re-analyses are one command
- [ ] A/B Test #1 — IT evening 21:00 vs 22:00 (2 weeks)
- [ ] A/B Test #2 — IT Sun morning 11:00 vs 13:00 (4 weeks)
- [ ] A/B Test #3 — FR midday on/off (2 weeks)
- [ ] A/B Test #4 — Reel format test (2 weeks)
- [ ] A/B Test #5 — FR cadence cut measurement
- [ ] Pull Meta Business Suite demographic breakdown (age × hour) to validate cohort overlap assumptions
- [ ] Decide cadence escalation triggers (when to add 4th slot back; when to add more days)

---

## 12. Special Days Appendix

All three external research outputs agreed on these. Treat as overrides on top of the standard weekly schedule.

### Italy

| Date / Rule | Action | Rationale | Content mode |
|---|---|---|---|
| Every Sun 10:00–11:30 | **Do NOT post** (after we validate this against more data) | Catholic mass attendance — pending confirmation; current data contradicts this for our specific audience | — |
| 20 May – 2 June (annual) | Ramp identity content; boost morning + evening slots | Festa della Repubblica lead-up; national pride spike | ORGOGLIO |
| 2 June (Festa della Repubblica) | Add 4th slot at 10:00; ORGOGLIO content | Republic Day | ORGOGLIO |
| 10–20 August (Ferragosto window) | Reduce to 1 slot/day (22:00 only) or pause | National vacation; cities emptied | PATRIMONIO (if posting) |
| 24 Dec – 6 Jan | Reduce to 2 slots/day; skip Dec 25–26 | Family holiday window | PATRIMONIO + RESILIENZA |
| 25 April (Liberation Day) | Single morning slot at 10:00; skip evening | National commemoration | ORGOGLIO |
| Easter Sunday + Pasquetta | Light cadence (12:30 + 22:00 only) | Family meal day | PATRIMONIO |
| Azzurri match nights | Skip 20:00–22:30 slot on match days | Attention drain to TV broadcast | — |

### France

| Date / Rule | Action | Rationale | Content mode |
|---|---|---|---|
| 14 July (Fête Nationale) | Add 4th slot at 10:00; FIERTÉ content | Bastille Day | FIERTÉ |
| Les ponts (May 1, May 8, Ascension, Pentecôte) | Skip Fri before pont; reduce Thu evening | Mass weekend exodus | PATRIMOINE (light) |
| 10–20 August (Assomption window) | Reduce to 1 slot/day (22:00) or pause | PACA coast at peak tourism saturation | PATRIMOINE |
| 24 Dec – 6 Jan | Reduce to 2 slots/day | Family holiday | PATRIMOINE |
| 1 November (Toussaint) | Single afternoon slot (15:00); skip evening | All Saints' Day, somber | RÉSISTANCE |
| OM home matches Sun 20:45 | Skip 20:30–22:15 on match days | Marseille audience (23% of base) attention collapses during OM | — |
| Les Bleus fixtures | Skip 90 min around kickoff | National team draws TV | FIERTÉ pre/post only |

---

## Appendix A — Reproducible Analysis Methodology

The Python script used to generate this analysis (inline, single-file):

```python
import csv
from collections import defaultdict
from datetime import datetime

PAGES = {
    'IT': 'pages/Feb-27-2026_May-27-2026_Content_Publish time_Summary_958693207061400.csv',
    'FR': 'pages/Feb-27-2026_May-27-2026_Content_Publish time_Summary_2532665090522626.csv',
}

def parse_csv(path):
    posts = []
    with open(path, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            try:
                pt = datetime.strptime(row['Publish time'][:19], '%m/%d/%Y %H:%M')
            except (ValueError, KeyError):
                continue
            posts.append({
                'pt': pt,
                'hour': pt.hour,
                'dow': pt.weekday(),
                'type': row.get('Post type', ''),
                'imp': int(row.get('Impressions', '0') or 0),
                'inter': int(row.get('Interactions', '0') or 0),
                'shares': int(row.get('Shares', '0') or 0),
                'comments': int(row.get('Comments', '0') or 0),
            })
    return posts

# For each page, compute:
# - day-of-week buckets (avg impressions, count)
# - hour-band buckets (avg impressions, count)
# - top-N hour winners (require n>=4 for noise control)
# - top posts by impressions
# - post-type breakdown
# - day-by-hour heatmap
```

The full version of this script with all output formatting lives in the conversation transcript that produced this document. TODO: extract to `docs/research/posting-time-analysis-runner.py` for reproducibility.

---

*Document version: 1.0 (2026-05-28)*
*Next scheduled review: 2026-07-27 (60 days)*
