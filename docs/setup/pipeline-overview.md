# Pipeline Overview — How Everything Works

**Last updated:** 2026-05-20 (revised — image pipeline fixes, preview workflow added)

This document explains every workflow in the pipeline with step-by-step diagrams.

---

## 1. System Architecture

How all the components connect.

```mermaid
graph TB
    subgraph SOURCES["📡 Data Sources"]
        RSS["RSS Feeds<br/>FR: 9 sources<br/>IT: 11 sources"]
        NAPI["NewsAPI<br/>FR + IT queries"]
    end

    subgraph GHA["⚙️ GitHub Actions (automated)"]
        FETCH["fetch.yml<br/>🕐 every hour :00"]
        METRICS["scrape-metrics.yml<br/>🕐 every hour :15"]
        RECOMPUTE["recompute-scores.yml<br/>🕐 every hour :30"]
        PUBLISH["publish.yml<br/>⏸️ every 15 min<br/>(currently disabled)"]
    end

    subgraph PIPELINE["🔧 Node.js Pipeline"]
        PIPE["pipeline.js"]
        SLOT["publish-slot.js"]
        SCRAPER["post-metrics.js"]
    end

    subgraph AI["🤖 AI Services"]
        CLAUDE["Claude AI<br/>caption + SEO + image prompt"]
        IMGGEN["Image Generation<br/>Cloudflare FLUX (default)<br/>Google AI / Pollinations"]
    end

    subgraph DB["🗄️ Supabase"]
        ARTICLES[("articles")]
        POST_METRICS[("post_metrics")]
        EDGE["generate-caption<br/>Edge Function"]
    end

    subgraph FB["📘 Facebook"]
        FR["France Aujourd'hui"]
        IT["Italia Oggi"]
    end

    subgraph DASH["📊 Dashboard"]
        APP["Angular App<br/>dashboard-alpha-one-47.vercel.app"]
        YOU["👤 You"]
    end

    RSS -->|fetch| FETCH
    NAPI -->|fetch| FETCH
    FETCH --> PIPE
    PIPE -->|save articles| ARTICLES

    ARTICLES -->|display| APP
    YOU -->|review| APP
    APP -->|generate caption| EDGE
    EDGE --> CLAUDE
    CLAUDE -->|caption + SEO + signals| EDGE
    EDGE -->|update| ARTICLES

    RECOMPUTE -->|compute scores| ARTICLES

    PUBLISH --> SLOT
    SLOT -->|read top-scored| ARTICLES
    SLOT --> IMGGEN
    IMGGEN -->|image buffer| SLOT
    SLOT -->|post photo| FR
    SLOT -->|post photo| IT
    SLOT -->|write back posted_at + fb_post_id| ARTICLES

    METRICS --> SCRAPER
    SCRAPER -->|read engagement| FR
    SCRAPER -->|read engagement| IT
    SCRAPER -->|store +1h/+24h/+7d| POST_METRICS
    POST_METRICS -->|display| APP
```

---

## 2. Article Lifecycle

Every article goes through these status transitions from fetch to posted.

```mermaid
stateDiagram-v2
    direction LR

    [*] --> pending : Pipeline fetches\nand saves article

    pending --> pending : Caption generated\nvia dashboard Generate button\nor batch script

    pending --> approved : You click Approve\nin dashboard

    pending --> rejected : You click Reject\nin dashboard

    approved --> posted : Slot publisher posts\nto Facebook\n(publish.yml)

    approved --> failed : Facebook API error\nduring posting

    failed --> approved : You manually retry\n(change status back)

    rejected --> [*] : Auto-deleted\nafter 7 days

    pending --> [*] : Auto-deleted\nafter 7 days

    posted --> [*] : Kept permanently\nmetrics scraped
```

---

## 3. Fetch Pipeline

Runs every hour at `:00`. Fetches articles, scores them, and saves to Supabase.

```mermaid
flowchart TD
    START(["⏰ fetch.yml fires\nevery hour at :00"])

    RSS["Fetch RSS feeds\nFR: Le Monde, Le Figaro, France Info,\nFrance 24, Libération, L'Obs, BFM TV,\nReporterre, Le Parisien, Bondy Blog\nIT: ANSA, Corriere, Repubblica,\nLa Stampa, AGI, Il Resto del Carlino,\nIl Messaggero, Il Secolo XIX,\nVatican News, Gazzetta Sport,\nIl Fatto Quotidiano"]

    NAPI["Fetch NewsAPI\nFR: France politique actualité\nIT: Italia politica attualità"]

    COMBINE["Combine all articles\n~120 per run"]

    INBATCH{"In-batch dedup\ntitle similarity > 0.7?"}
    DROP1["Drop duplicate"]

    DBCHECK{"Already in DB?\n7-day window check"}
    DROP2["Skip — already saved"]

    CLUSTER["Cluster detection\nGroup articles about same event\nwithin 6h window\ncluster_size ≥ 3 → auto-escalate to breaking"]

    CRIT["Criticality scoring\nbreaking / alert / trending / standard\n+15 pts if FR/IT place name found"]

    VALID{"Content validation\nFR_LEGAL_01\nADS_POLITICS_01\nADS_WEAPONS_01\nADS_DRUGS_01"}

    BLOCKED["⛔ blocked\nnot saved"]

    BOOST{"IT country?\nboosted?"}
    FLAGBOOST["Flag boost_eligible = false\n(article still saves)"]

    SCORE["Compute publish_score\ncriticality × 40\n+ slot_match × 30\n+ pillar_quota × 20\n+ recency_decay × 10"]

    SAVE["💾 Save to Supabase\nstatus = pending\nready for caption generation"]

    END(["✅ Pipeline complete\nlog: X saved, Y blocked"])

    START --> RSS
    START --> NAPI
    RSS --> COMBINE
    NAPI --> COMBINE
    COMBINE --> INBATCH
    INBATCH -->|"yes"| DROP1
    INBATCH -->|"no"| DBCHECK
    DROP1 --> COMBINE
    DBCHECK -->|"yes"| DROP2
    DBCHECK -->|"no"| CLUSTER
    CLUSTER --> CRIT
    CRIT --> VALID
    VALID -->|"FR hard-block"| BLOCKED
    VALID -->|"IT boost issue"| BOOST
    VALID -->|"clean"| SCORE
    BOOST -->|"yes"| FLAGBOOST
    BOOST -->|"no"| SCORE
    FLAGBOOST --> SCORE
    SCORE --> SAVE
    SAVE --> END
    BLOCKED --> END
    DROP2 --> END
```

---

## 4. Caption Generation

Triggered manually from the dashboard (Generate button) or via batch script.

```mermaid
flowchart TD
    START(["▶️ User clicks Generate\nin dashboard\nOR runs generate-captions-batch.js"])

    EDGE["Supabase Edge Function\ngenerate-caption"]

    CACHE{"System prompt\ncached?\n5-min TTL"}
    FULL["Send full prompt\n~2500 tokens\nFR + IT rules, Q4 tone,\ncontent_signals spec"]
    CACHED["Send cached reference\npay only 10% input cost"]

    CLAUDE["Claude AI\nclaude-sonnet-4-6\nvia oneprovider.dev"]

    subgraph GENERATED["Generated fields (single API call)"]
        CAP["Caption\nintro / question / cta\nimage_headline\nseed_comment + template_id"]
        SEO["SEO\nseo_title ≤ 60 chars\nseo_description ≤ 160 chars"]
        SIGNALS["Content signals\nbinary_frame / poll_fit_score\nprotagonist_named / best_format\nfr_it_stake_first_sentence\npillar_hint"]
    end

    IMGPROMPT["Image prompt generation\n(separate call)\nraw cinematic prompt\nformatted [PROMPT]/[TEXT]/[OUTPUT]"]

    LANGCHECK{"image_headline\nin correct language?\nCheck for English stopwords"}
    RETRY["Retry up to 2×\nwith stricter language rule\n'MUST be in français/italiano'"]

    SAVE["💾 Update article in DB\nall fields written at once\nstatus stays pending"]

    DASH["📊 Dashboard refreshes\nCaption / SEO / Image / Signals tabs\npopulated"]

    START --> EDGE
    EDGE --> CACHE
    CACHE -->|"no"| FULL
    CACHE -->|"yes"| CACHED
    FULL --> CLAUDE
    CACHED --> CLAUDE
    CLAUDE --> CAP
    CLAUDE --> SEO
    CLAUDE --> SIGNALS
    CLAUDE --> IMGPROMPT
    IMGPROMPT --> LANGCHECK
    LANGCHECK -->|"English detected"| RETRY
    LANGCHECK -->|"FR/IT OK"| SAVE
    RETRY --> SAVE
    CAP --> SAVE
    SEO --> SAVE
    SIGNALS --> SAVE
    SAVE --> DASH
```

---

## 5. Dashboard Review Flow

How you review, approve, and prepare articles for posting.

```mermaid
flowchart TD
    LOGIN["🔐 Login\ndashboard-alpha-one-47.vercel.app\nSupabase email/password auth"]

    LIST["📋 Article list\nFilter by: status / country\nSort by any column\nStats cards: Breaking / Alert / Trending / Standard"]

    CLICK["Click article row\nto open detail dialog"]

    subgraph TABS["Detail dialog tabs"]
        OV["Overview\narticle ID, source,\ncriticality, pillar"]
        CAP["Caption\nintro / question / cta"]
        SEO2["SEO\nseo_title / seo_description"]
        IMG2["Image Prompt\nformatted prompt ready\nto paste into Midjourney/DALL-E"]
        SIG["Signals\nbinary_frame / poll_fit_score\nbest_format / pillar_hint\ncluster info"]
    end

    NOCAP{"Has caption?"}
    GEN["Click Generate\ncalls edge function\nwaits ~5s"]

    REVIEW["Read caption\ncheck tone, language,\nbinary close question,\nFR/IT stake front-loaded"]

    DECISION{"Your decision"}

    APPROVE["✅ Approve\nstatus → approved\narticle enters publish queue\nranked by publish_score"]

    REJECT["❌ Reject\nstatus → rejected\nauto-deleted after 7 days"]

    BATCH["Batch operations\nSelect multiple rows\nBatch approve / reject / delete"]

    POSTED["Article waits in approved queue\nSlot publisher picks highest-scored\nat next slot window\n(currently disabled)"]

    LOGIN --> LIST
    LIST --> CLICK
    CLICK --> OV
    OV --> CAP
    CAP --> SEO2
    SEO2 --> IMG2
    IMG2 --> SIG
    CAP --> NOCAP
    NOCAP -->|"no"| GEN
    NOCAP -->|"yes"| REVIEW
    GEN --> REVIEW
    REVIEW --> DECISION
    DECISION -->|"good"| APPROVE
    DECISION -->|"not suitable"| REJECT
    LIST --> BATCH
    APPROVE --> POSTED
```

---

## 6. Slot Publisher Flow

Runs every 15 min (currently disabled). Posts the highest-scored approved article at each slot.

```mermaid
flowchart TD
    START(["⏰ publish.yml fires\nevery 15 minutes\n⏸️ CURRENTLY DISABLED"])

    LOOP["Loop: FR then IT"]

    SLOTCHECK{"Within ±15 min\nof a defined slot?"}

    subgraph SLOTS_DEF["Posting slots (CEST)"]
        FR_S["🇫🇷 France\n07:30 / 12:00 / 19:00"]
        IT_S["🇮🇹 Italy\n07:30 / 11:30 / 15:30 / 19:30"]
    end

    NOOP(["⏭️ Not a slot window\nlog next slot time\nmove to next country"])

    ARTICLES["Query approved articles\nORDER BY publish_score DESC"]

    NOART(["📭 No approved articles\nskip country"])

    TOP["Pick article #1\nlog runner-up score"]

    NOCAP{"Has ai_caption\nand image_prompt?"}
    SKIPART(["⚠️ Skip — incomplete\nneeds Generate first"])

    IMGGEN["Generate image\nvia IMAGE_PROVIDER\ndefault: Cloudflare FLUX.1-schnell"]

    COMPOSITE["Composite image\nAnton font headline overlay\ngradient top\nwatermark: SOURCES[country].watermarkFile\nbottom-right 70% opacity"]

    FB["POST to Facebook\nGraph API v22.0\n/{page-id}/photos\nwith caption + image"]

    SUCCESS{"Post successful?"}

    WRITEBACK["💾 Write back to DB\nstatus = posted\nfb_post_id = Graph post ID\nposted_at = now()"]

    FAILED["💾 Mark status = failed"]

    BOOST_IT{"IT article with\nboost_eligible = false?\nFirst time?"}

    WINDOW["📋 Log E.1 window start\nwindow closes in 30 days\nif zero policy strikes → enable FR boost"]

    DONE(["✅ Slot done\nlog: score, runner-up, post URL"])

    START --> LOOP
    LOOP --> SLOTCHECK
    FR_S --> SLOTCHECK
    IT_S --> SLOTCHECK
    SLOTCHECK -->|"no"| NOOP
    SLOTCHECK -->|"yes"| ARTICLES
    ARTICLES -->|"empty"| NOART
    ARTICLES -->|"found"| TOP
    TOP --> NOCAP
    NOCAP -->|"missing"| SKIPART
    NOCAP -->|"ready"| IMGGEN
    IMGGEN --> COMPOSITE
    COMPOSITE --> FB
    FB -->|"200 OK"| WRITEBACK
    FB -->|"error"| FAILED
    WRITEBACK --> BOOST_IT
    BOOST_IT -->|"yes"| WINDOW
    BOOST_IT -->|"no"| DONE
    WINDOW --> DONE
```

---

## 7. Local Preview Workflow (pre-post review)

Before posting, you can generate and inspect images locally without touching Facebook.

```mermaid
flowchart TD
    APPROVE["✅ Articles approved in dashboard"]

    RECOMPUTE["Recompute scores\nnode src/scripts/recompute-scores.js\n~90s for 500 articles"]

    PREVIEW["Generate preview images\nnode src/scripts/preview-images.js <id1> <id2> ..."]

    PROVIDER{"IMAGE_PROVIDER in .env"}
    CF2["☁️ Cloudflare FLUX"]
    GOOGLE2["🔵 Google Gemini"]
    POLL2["🌸 Pollinations"]

    COMPOSITE2["Composite\nheadline overlay + watermark\n(same as production)"]

    SAVE2["💾 Save to\noutput/previews/<id>.png"]

    REVIEW2["Review in file explorer\n\\\\wsl.localhost\\Ubuntu\\home\\jayam\\...\n\\output\\previews\\"]

    OK{"Images look good?"}

    REGEN["Regenerate image prompt\nnode src/scripts/generate-image.js <id>"]

    POST["Post at slot time\nnode src/scripts/publish-slot.js\n(must be within ±15 min of slot)"]

    APPROVE --> RECOMPUTE
    RECOMPUTE --> PREVIEW
    PREVIEW --> PROVIDER
    PROVIDER -->|"cloudflare (default)"| CF2
    PROVIDER -->|"google"| GOOGLE2
    PROVIDER -->|"pollinations"| POLL2
    CF2 --> COMPOSITE2
    GOOGLE2 --> COMPOSITE2
    POLL2 --> COMPOSITE2
    COMPOSITE2 --> SAVE2
    SAVE2 --> REVIEW2
    REVIEW2 --> OK
    OK -->|"no — tweak prompt"| REGEN
    REGEN --> PREVIEW
    OK -->|"yes"| POST
```

**Posting slots (run publish-slot.js within ±15 min of each):**

| Country | Slot 1 | Slot 2 | Slot 3 | Slot 4 |
|---|---|---|---|---|
| 🇫🇷 France | 07:30 CEST | 12:00 CEST | 19:00 CEST | — |
| 🇮🇹 Italy | 07:30 CEST | 11:30 CEST | 15:30 CEST | 19:30 CEST |

**Watermark files (assets/logos/):**

| Country | File |
|---|---|
| FR | `FranceAujourdhui_Logo.png` |
| IT | `vivere_in_italia_banner_logo.png` |

---

## 8. Engagement Metrics Scraper (was §7)

Runs every hour at `:15`. Scrapes post engagement from the Facebook Graph API.

```mermaid
flowchart TD
    START(["⏰ scrape-metrics.yml fires\nevery hour at :15"])

    QUERY["Query Supabase\nstatus = posted\nposted_at within 8 days\nfb_post_id IS NOT NULL"]

    NONE(["📭 No posts to scrape\nexit"])

    LOOP["For each post\nper country"]

    INTERVALS{"Compute eligible\nintervals"}

    I1["⏱️ +1h — if posted ≥ 1h ago\n       and not yet recorded"]
    I2["⏱️ +24h — if posted ≥ 24h ago\n        and not yet recorded"]
    I3["⏱️ +7d — if posted ≥ 7 days ago\n       and not yet recorded"]

    SKIP(["⏭️ All intervals already\nrecorded — skip post"])

    BASIC["Graph API call 1\nGET /{post-id}\n?fields=reactions.summary(total_count),\ncomments.summary(total_count),\nshares,\nreactions.type(LIKE).summary,\nreactions.type(LOVE).summary,\nreactions.type(HAHA).summary,\nreactions.type(WOW).summary,\nreactions.type(SAD).summary,\nreactions.type(ANGRY).summary"]

    INSIGHTS["Graph API call 2\nGET /{post-id}/insights\npost_impressions\npost_engaged_users\npost_clicks"]

    RATE{"Rate limit?\n(codes 4/17/32)"}

    BACKOFF["Exponential backoff\nretry up to 3×\n10s → 30s → 90s"]

    INSERT["💾 INSERT into post_metrics\narticle_id\ninterval_tag (+1h/+24h/+7d)\nall reaction counts\ncomments / shares / clicks\nimpressions / engaged_users\nraw_response JSONB"]

    NEXT["Move to next post"]

    DASH["📊 Dashboard /metrics\ncolour-coded engagement table\n+1h / +24h / +7d columns"]

    START --> QUERY
    QUERY -->|"none"| NONE
    QUERY -->|"found"| LOOP
    LOOP --> INTERVALS
    INTERVALS --> I1
    INTERVALS --> I2
    INTERVALS --> I3
    I1 -->|"not eligible yet\nor already done"| SKIP
    I2 -->|"not eligible yet\nor already done"| SKIP
    I3 -->|"not eligible yet\nor already done"| SKIP
    I1 -->|"eligible"| BASIC
    I2 -->|"eligible"| BASIC
    I3 -->|"eligible"| BASIC
    BASIC --> INSIGHTS
    INSIGHTS --> RATE
    RATE -->|"yes"| BACKOFF
    RATE -->|"no"| INSERT
    BACKOFF --> INSERT
    INSERT --> NEXT
    NEXT --> LOOP
    LOOP -->|"all done"| DASH
```

---

## 9. GitHub Actions Schedule

How the four workflows are staggered across each hour to avoid conflicts.

```mermaid
gantt
    title One hour of GitHub Actions (repeats every hour)
    dateFormat  mm:ss
    axisFormat  :%M

    section :00 — Fetch
    fetch.yml  (article fetch ~60s)         :active,  00:00, 1m

    section :15 — Metrics
    scrape-metrics.yml  (~30s)              :active,  15:00, 30s

    section :30 — Scores
    recompute-scores.yml  (~10s)            :active,  30:00, 10s

    section Every 15 min — Publisher
    publish.yml  (DISABLED ⏸️)              :crit,    00:00, 30s
    publish.yml  (DISABLED ⏸️)              :crit,    15:00, 30s
    publish.yml  (DISABLED ⏸️)              :crit,    30:00, 30s
    publish.yml  (DISABLED ⏸️)              :crit,    45:00, 30s
```

---

## 10. Image Generation Providers

How the multi-provider image generation system works.

```mermaid
flowchart LR
    TRIGGER["publish-slot.js\ncalls generateImage(prompt)"]

    ENV{"IMAGE_PROVIDER\nenv variable"}

    CF["☁️ Cloudflare Workers AI\nDEFAULT\n\nFLUX.1-schnell\nPOST api.cloudflare.com/.../flux-1-schnell\nReturns: base64 PNG\nFree: ~2000 imgs/day\nSecrets: CF_ACCOUNT_ID + CF_API_TOKEN"]

    GOOGLE["🔵 Google AI Studio\n\nGemini 2.0 Flash Image\nPOST generativelanguage.googleapis.com\nReturns: base64 inline\nFree: ~500 imgs/day\nSecret: GOOGLE_AI_KEY"]

    POLL["🌸 Pollinations.ai\n\nFLUX (no key needed)\nGET image.pollinations.ai/prompt/...\nReturns: image binary\nFree: unlimited (rate-limited by IP)\nSecret: none (POLLINATIONS_TOKEN optional)"]

    BUFFER["Image buffer\nPNG bytes in memory"]

    COMPOSITE["compositeImage()\nAdd overlay:\n• Anton font headline (white 80%)\n• Gradient top\n• Watermark bottom-right 70%"]

    RESULT["Final PNG\nready to upload to Facebook"]

    TRIGGER --> ENV
    ENV -->|"cloudflare"| CF
    ENV -->|"google"| GOOGLE
    ENV -->|"pollinations"| POLL
    CF --> BUFFER
    GOOGLE --> BUFFER
    POLL --> BUFFER
    BUFFER --> COMPOSITE
    COMPOSITE --> RESULT
```

**To switch providers:** update the `IMAGE_PROVIDER` variable in GitHub → Settings → Secrets and variables → Actions → Variables tab. No code change or redeployment needed.

---

## 11. Publish Score Formula

How the pipeline decides which approved article to post at each slot.

```mermaid
flowchart TD
    subgraph FORMULA["publish_score formula"]
        A["criticality_priority × 40\nbreaking=4, alert=3, trending=2, standard=1\nMax contribution: 160 pts"]
        B["slot_match_factor × 30\n1.0 if article pillar suits current slot\n0.5 if not matching\nMax contribution: 30 pts"]
        C["pillar_quota_factor × 20\n+0.5 if pillar under weekly quota\n-0.5 if pillar over quota\nMax contribution: ±10 pts"]
        D["recency_factor × 10\ne^(−age_hours / 24) decay\n1.0 if brand new → 0.37 at 24h\nMax contribution: 10 pts"]
    end

    TOTAL["Total publish_score\nMax possible: ~200 pts\nRecomputed every hour by recompute-scores.yml"]

    WINNER["Highest-scored approved article\nwins the slot\nRunner-up logged for audit"]

    A --> TOTAL
    B --> TOTAL
    C --> TOTAL
    D --> TOTAL
    TOTAL --> WINNER
```
