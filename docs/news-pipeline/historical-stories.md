# Historical Stories Pipeline

A separate evergreen content stream that publishes curated national-pride posts alongside the daily news feed. Articles are drawn from a hardcoded backlog of historical milestones, routed through the same Claude caption + image + SEO flow as news, and appear in the dashboard like any other pending article.

---

## What makes it different from news

| Dimension | News pipeline | Historical pipeline |
|---|---|---|
| Source | RSS feeds / NewsAPI | Hardcoded backlog in `src/config/historical-stories.js` |
| Trigger | GitHub Actions cron (every 30 min) | Manual: `node src/scripts/queue-historical-story.js` |
| Identity mode | Claude chooses | Locked by `forced_mode` on the topic |
| Caption hook | Tension / conflict with named actor | Celebratory — date + place + iconic moment, never conflict |
| Post structure | News wire framing | Historical context + Heritage paragraph |
| Source attribution | RSS feed name / NewsAPI | `Storia d'Italia` (IT) · `Histoire de France` (FR) |
| `original_url` | Real article URL | `historical://<topic-id>` (synthetic, for dedup) |
| `source_type` in DB | `news` | `historical` |
| Dashboard row | Criticality tint | Warm amber tint + 🏛️ STORIA / 🏛️ HISTOIRE badge |
| Dashboard filter | — | "🏛️ Historical" option in Source filter |

---

## End-to-end flow

```
node src/scripts/queue-historical-story.js <IT|FR> [topic-id]
         │
         ▼
① Resolve topic
   ├── topic-id supplied → use it directly
   └── omitted → auto-pick (see selection logic below)
         │
         ▼
② Insert article row into Supabase `articles` table
   Fields set at insert:
     country, title, summary (= topic brief), source_type = 'historical'
     historical_topic_id, original_url = 'historical://<topic-id>'
     source = 'Storia d'Italia' | 'Histoire de France'
     status = 'pending', criticality = 'standard', boost_eligible = true
         │
         ▼
③ Generate AI content in parallel (same Claude functions as news)
   ├── generateCaption()      — with forcedMode + historical:true flags
   ├── generateImagePrompt()
   └── generateSEOContent()
         │
         ▼
④ Compute publish_score (same scoring as news)
         │
         ▼
⑤ Update article row with all generated fields
         │
         ▼
⑥ Article appears in dashboard as `pending`
   Review → post with: node src/scripts/post-article.js <article-id>
```

---

## Topic selection logic

File: `src/utils/historicalTopics.js`

When no `topic-id` is passed, `pickNextTopic()` runs this priority chain:

```
1. Anniversary within 14 days?
   → pick the topic whose anniversary_date is closest to today (UTC)

2. No upcoming anniversary?
   → pick a random evergreen topic (anniversary_date = null)

3. No evergreens unused?
   → pick whichever anniversary topic is next chronologically

4. All topics for this country queued in the last 365 days?
   → error: "Add more to historical-stories.js or force re-queue"
```

The lookback window is **365 days** — a topic won't repeat within a year unless you pass its ID explicitly.

---

## How the caption prompt changes for historical articles

`generateCaption()` in `src/services/claude.js` accepts `options.historical = true` and `options.forcedMode`.

### Forced identity mode
For news, Claude chooses the identity mode (ORGOGLIO / RESILIENZA / DIBATTITO / PATRIMONIO for IT; FIERTÉ / RÉSISTANCE / DÉBAT / PATRIMOINE for FR). For historical articles the mode is **locked** — Claude is instructed not to reclassify it.

### Hook instruction
- News: *"tension/conflict central with named actor"*
- Historical: *"celebratory opening — date + place + iconic moment. NEVER tension or conflict"*

### Post structure (7 blocks in order)

| Block | News | Historical |
|---|---|---|
| 1 | Hook — tension/conflict | Hook — celebratory date + place + moment |
| 2 | Context — who/what/where/when | Historical context — 2-3 sentences, date, place, protagonists |
| 3 | Details — 3-5 bullets | Details — 3-5 bullets, key facts and names |
| 4 | Stakes — concrete impact on reader | Heritage — what this moment means for Italians/French today |
| 5 | Engagement question | Engagement question (mode-driven, same as news) |
| 6 | Source attribution | Source attribution |
| 7 | CTA + hashtags | CTA + hashtags (identity hashtags only) |

---

## Fields written to the database

| Field | Description |
|---|---|
| `ai_caption` | `{intro, question, cta}` — celebratory structure |
| `hashtags` | Identity-only (e.g. `#OrgoglioItaliano`, `#PatrimonioItaliano`, `#HistoireDeFrance`) |
| `seed_comment` | Engagement seed comment |
| `story_category` | e.g. `Sport`, `Culture` |
| `content_signals` | Includes `identity_mode` locked to the forced value |
| `image_headline` | Short headline for image overlay |
| `image_prompt` | Raw cinematic prompt |
| `formatted_image_prompt` | Ready-to-paste Midjourney/DALL-E prompt |
| `seo_title` | ≤60 chars, keyword-first |
| `seo_description` | ≤160 chars with CTA |
| `publish_score` | Same composite score as news articles |

---

## Topic catalog

### Italy (10 topics)

| ID | Title | Category | Mode | Anniversary |
|---|---|---|---|---|
| `it-2006-mondiale-berlino` | Berlino 2006: l'Italia campione del mondo | sport | ORGOGLIO | 07-09 |
| `it-ferrari-prima-vittoria-f1-1951` | Silverstone 1951: la prima vittoria della Ferrari in F1 | sport | ORGOGLIO | 07-14 |
| `it-marco-polo-ritorno-1295` | Il ritorno di Marco Polo | exploration | PATRIMONIO | — (evergreen) |
| `it-marconi-segnale-transatlantico-1901` | 12 dicembre 1901: Marconi attraversa l'Atlantico | science | ORGOGLIO | 12-12 |
| `it-galileo-telescopio-1609` | 25 agosto 1609: Galileo presenta il telescopio | science | PATRIMONIO | 08-25 |
| `it-pizza-margherita-1889` | Napoli 1889: nasce la pizza Margherita | food | PATRIMONIO | 06-11 |
| `it-espresso-bezzera-1901` | 1901: a Milano nasce l'espresso italiano | food | PATRIMONIO | 09-19 |
| `it-cappella-sistina-1512` | 31 ottobre 1512: Michelangelo finisce la Cappella Sistina | art | PATRIMONIO | 10-31 |
| `it-ultima-cena-leonardo-1498` | Milano 1498: Leonardo termina L'Ultima Cena | art | PATRIMONIO | — (evergreen) |
| `it-vespa-piaggio-1946` | 23 aprile 1946: nasce la Vespa | culture | PATRIMONIO | 04-23 |

### France (10 topics)

| ID | Title | Category | Mode | Anniversary |
|---|---|---|---|---|
| `fr-coupe-monde-1998-zidane` | 12 juillet 1998: la France championne du monde | sport | FIERTÉ | 07-12 |
| `fr-premier-tour-de-france-1903` | 1er juillet 1903: le premier Tour de France | sport | PATRIMOINE | 07-01 |
| `fr-pasteur-vaccin-rage-1885` | 6 juillet 1885: Pasteur sauve le premier enfant de la rage | science | FIERTÉ | 07-06 |
| `fr-marie-curie-nobel-1903` | 10 décembre 1903: Marie Curie, première femme Prix Nobel | science | FIERTÉ | 12-10 |
| `fr-lumiere-premier-cinema-1895` | 28 décembre 1895: les frères Lumière inventent le cinéma | culture | PATRIMOINE | 12-28 |
| `fr-tour-eiffel-1889` | 31 mars 1889: la Tour Eiffel s'élève sur Paris | culture | PATRIMOINE | 03-31 |
| `fr-chanel-numero-5-1921` | 5 mai 1921: Coco Chanel lance le N°5 | culture | PATRIMOINE | 05-05 |
| `fr-premiere-exposition-impressionniste-1874` | 15 avril 1874: la première exposition impressionniste | art | PATRIMOINE | 04-15 |
| `fr-guide-michelin-1900` | 1900: le premier Guide Michelin paraît | food | PATRIMOINE | — (evergreen) |
| `fr-festival-cannes-1946` | 20 septembre 1946: la première édition du Festival de Cannes | culture | PATRIMOINE | 09-20 |

---

## Dashboard features

- **Background tint**: warm amber (`rgba(180, 120, 40, 0.07)`) instead of the criticality colour
- **Badge**: `🏛️ STORIA` (IT) or `🏛️ HISTOIRE` (FR) chip inline next to the criticality badge
- **Source filter**: "🏛️ Historical" option in the filter toolbar

---

## Running the script

```bash
# Auto-pick: anniversary-first, then evergreen, then closest upcoming
node src/scripts/queue-historical-story.js IT
node src/scripts/queue-historical-story.js FR

# Force a specific topic by ID
node src/scripts/queue-historical-story.js IT it-2006-mondiale-berlino

# After reviewing in dashboard, post it
node src/scripts/post-article.js <article-id>
```

---

## Important caveats

### Do NOT use the ✦ Generate button in the dashboard
The dashboard's Generate button calls the Supabase edge function (`generate-caption`), which does not know about `forcedMode` or the historical post structure. Clicking it on a historical row will overwrite the caption with a plain news-style caption. If you need to regenerate, re-run the queue script with the explicit topic ID instead.

### Topic content rules
- ✅ Sport, science, art, food, exploration, culture
- ❌ Political figures, living-memory leaders, religion/war framing

### `original_url` is synthetic
Historical articles use `historical://<topic-id>` as their `original_url`. This serves as the dedup key. Do not replace it with a Wikipedia link or any real URL.

---

## Adding new topics

1. Open `src/config/historical-stories.js`.
2. Add an object to `HISTORICAL_STORIES`:

```js
{
  id: 'it-your-slug',           // kebab-case, country prefix
  country: 'IT',                // IT | FR
  title: '...',                 // Italian/French title shown in the dashboard
  brief: '...',                 // 3-5 sentence brief fed to Claude as the article summary
  category: 'sport',           // sport | science | art | food | exploration | culture
  forced_mode: 'ORGOGLIO',     // IT: ORGOGLIO | PATRIMONIO  FR: FIERTÉ | PATRIMOINE
  anniversary_date: '07-09',   // 'MM-DD' or null for evergreen
}
```

No other changes needed.

---

## File map

| File | Role |
|---|---|
| `src/config/historical-stories.js` | Topic backlog — titles, briefs, modes, anniversary dates |
| `src/scripts/queue-historical-story.js` | CLI entry point — resolves topic, inserts row, generates content |
| `src/utils/historicalTopics.js` | `pickNextTopic()` selection logic |
| `src/services/claude.js` | `generateCaption()` — `historical:true` changes hook and structure |
| `dashboard/src/app/articles/article-list.component.ts` | Amber tint, 🏛️ badge, Source filter dropdown |
