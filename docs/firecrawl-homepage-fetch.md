# Firecrawl Homepage Fetch — Design & Implementation Guide

## Implementation Status

| Item | Status | Notes |
|---|---|---|
| `src/fetchers/firecrawl.js` | ✅ Done | Firecrawl API client + markdown parser |
| `src/scripts/firecrawl-fetch.js` | ✅ Done | Standalone script, mirrors `pipeline.js` flow |
| `src/config/sources.js` | ✅ Done | `firecrawl_homepages` added for FR + IT |
| `.github/workflows/firecrawl.yml` | ✅ Done | 4×/day scheduled workflow |
| `.env.example` | ✅ Done | `FIRECRAWL_KEY` added |
| `FIRECRAWL_KEY` GitHub Secret | ⏳ Pending | Must be added before workflow runs |
| `FIRECRAWL_KEY` local `.env` | ⏳ Pending | Required for local testing |
| Phase 2 — article full-text enrichment | 🔲 Not started | Deferred, see Phase 2 section |

**Branch:** `feature/firecrawl-homepage-fetch`
**Merged to main:** No — pending review

---

## Problem

RSS feeds are the primary article discovery mechanism but have two known gaps:

1. **Volume cap** — most RSS feeds expose only the top 5–20 articles. A news site publishing 50+ articles per day will silently omit the rest from the feed.
2. **Publish lag** — breaking news appears on a site's homepage within seconds of publication. RSS feeds often update on a delay (minutes to tens of minutes), meaning time-sensitive articles miss early posting slots.

The result: articles that are live on a news site's homepage, trending, and relevant to our audience never enter the pipeline.

---

## Solution

A separate, scheduled pipeline that uses **Firecrawl** to scrape news site homepages and extract article links that are not already in the database.

This runs **independently** of the main RSS + NewsAPI pipeline (`pipeline.js`) so the two never interfere with each other. Articles discovered by Firecrawl go through the **exact same** deduplication, validation, and save flow as RSS articles, so no special handling is needed downstream.

---

## Architecture

```
GitHub Actions (firecrawl.yml)
    ↓  4× per day
firecrawl-fetch.js
    ↓
fetchFirecrawlHomepages()          ← calls Firecrawl API for each homepage
    ↓  markdown response
parseArticlesFromMarkdown()        ← extracts [title](url) pairs, filters nav/media links
    ↓  raw articles
deduplicate()                      ← in-batch title similarity dedup (same as pipeline.js)
    ↓
getRecentArticleTitles()           ← cross-DB dedup: drops anything seen in last 3 days
    ↓
validateArticle()                  ← same content policy as pipeline.js
    ↓
saveArticles()                     ← saves to Supabase articles table
```

### What Firecrawl returns

Firecrawl scrapes the homepage URL and returns clean **markdown**. News site homepages render article links in markdown as:

```
[Article title goes here](https://www.lemonde.fr/politique/article/2026/06/02/slug.html)
```

We extract these `[title](url)` pairs with a regex, then filter:

- URL must belong to the scraped site's domain
- Title must be ≥ 25 characters (eliminates nav items like "Politique", "Sport", etc.)
- URL must not be a media file (`.jpg`, `.pdf`, `.mp4`, etc.)
- URL must not be a category/tag/author page

---

## Homepage Sources

Three sources per country, each chosen to fill a different gap:

### France

| Source | Homepage URL | Why this source |
|---|---|---|
| BFM TV | `https://www.bfmtv.com/` | 24/7 rolling news; RSS feed lags behind live homepage by minutes |
| Le Monde | `https://www.lemonde.fr/` | Homepage surfaces more articles than its RSS cap allows |
| France Info | `https://www.francetvinfo.fr/` | Public broadcaster; some articles skip RSS entirely |

### Italy

| Source | Homepage URL | Why this source |
|---|---|---|
| ANSA | `https://www.ansa.it/` | National wire service; publishes breaking news faster than RSS syncs |
| Repubblica | `https://www.repubblica.it/` | Homepage features and regional articles not always in RSS feed |
| Corriere della Sera | `https://www.corriere.it/` | Same pattern — RSS is selective vs. full homepage |

### Adding a new country

Add a `firecrawl_homepages` array to the country block in `src/config/sources.js`:

```javascript
XX: {
  rss: [...],
  newsapi: {...},
  firecrawl_homepages: [
    { name: 'Source One', url: 'https://www.sourceone.xx/' },
    { name: 'Source Two', url: 'https://www.sourcetwo.xx/' },
    { name: 'Source Three', url: 'https://www.sourcethree.xx/' },
  ],
  ...
}
```

No other code changes needed. `firecrawl-fetch.js` iterates all countries automatically.

---

## Schedule

The Firecrawl workflow runs **4 times per day**, timed ~1 hour before each posting slot so fresh articles are available when you open the dashboard to pick and post.

| Run time (UTC) | CEST equivalent | Prepares for slot |
|---|---|---|
| 04:30 | 06:30 | 07:30 morning slot |
| 10:00 | 12:00 | 13:00 midday slot |
| 14:00 | 16:00 | Afternoon coverage |
| 19:00 | 21:00 | 22:00 evening slot |

The main RSS pipeline (`fetch.yml`) continues to run every hour, unchanged.

---

## Credit Budget

**Firecrawl Starter plan: $16/month — 3,000 credits**

Each homepage scrape = 1 credit.

| Countries | Homepages/run | Credits/month | % of 3,000 |
|---|---|---|---|
| 2 (FR + IT) | 6 | 720 | 24% |
| 3 | 9 | 1,080 | 36% |
| 4 | 12 | 1,440 | 48% |
| 5 | 15 | 1,800 | 60% |
| 6 | 18 | 2,160 | 72% |
| 7 | 21 | 2,520 | 84% |
| 8 | 24 | 2,880 | 96% — near ceiling |

**Verdict:** Starter plan covers up to ~7 countries comfortably. At 8+ countries, upgrade to the Hobby plan ($28/month, 6,500 credits) which covers ~18 countries.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FIRECRAWL_KEY` | Yes | API key from firecrawl.dev |
| `SUPABASE_URL` | Yes | Already set |
| `SUPABASE_KEY` | Yes | Already set |

Add `FIRECRAWL_KEY` to:
1. Your local `.env` file
2. GitHub Actions Secrets: Settings → Secrets and variables → Actions → New repository secret

---

## Files Changed

| File | Change |
|---|---|
| `src/fetchers/firecrawl.js` | New — Firecrawl API client + markdown parser |
| `src/scripts/firecrawl-fetch.js` | New — standalone script (mirrors pipeline.js flow) |
| `src/config/sources.js` | Modified — adds `firecrawl_homepages` array per country |
| `.github/workflows/firecrawl.yml` | New — 4×/day scheduled workflow |
| `.env.example` | Modified — adds `FIRECRAWL_KEY` |

---

## Phase 2 (Not built yet)

Once homepage discovery is stable, a natural next step is **article enrichment**: for articles that pass dedup and enter the DB, call Firecrawl to fetch the full article body and store it in a `full_content` column. Claude then has the complete article text (not just title + summary snippet) when generating captions.

This is deferred because:
- It adds ~1 credit per article saved (vs. 1 credit per homepage)
- Full text from paywalled sites (Le Monde, Corriere, Repubblica) will still be truncated
- Caption quality improvement should be validated on free-access sources first

When ready, this would be added to `src/services/claude.js` as an optional enrichment step before `generateCaption()`.
