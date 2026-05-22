# Italy Sources Audit

**Last updated:** 2026-05-21

---

## Current active feeds

See `src/config/sources.js` for the authoritative list. As of A.10 (2026-05-21):

| Source | Type | Notes |
|---|---|---|
| ANSA | RSS | Politics feed |
| Corriere della Sera | RSS | Homepage |
| Repubblica | RSS | Homepage |
| La Stampa | RSS | Homepage |
| AGI | RSS | Homepage |
| Il Resto del Carlino | RSS | A.7 — center-left balance |
| Il Messaggero | RSS | A.7 — center-left balance |
| Il Secolo XIX | RSS | A.7 — center-left balance |
| Corriere.it | RSS | A.7 (replaced Corriere Milano/Roma subdomains) |
| La Gazzetta del Mezzogiorno | RSS | A.7 — southern Italy |
| Vatican News | RSS | Homepage |
| La Gazzetta dello Sport | RSS | Sports |
| Il Fatto Quotidiano | RSS | Homepage |
| Roma Today | RSS | A.10 — audience-alignment (Rome 31%) |
| ANSA Cronaca | RSS | A.10 — audience-alignment (crime/justice) |
| NewsAPI | API | Query: "Italia attualità Roma salute famiglia pensioni" |

---

## Investigated and approved for Phase 2

### Dissapore
**Investigated:** 2026-05-21

**Type:** Italian food journalism — food news, grocery prices, food safety, restaurant industry

**RSS availability:** Confirmed working.
- `https://www.dissapore.com/rss` → HTTP 200 (redirects to `/feed/`)
- Feed is active: 5 articles published on 2026-05-21, updates hourly

**Robots.txt:** `/feed/` (root) is **not blocked**. Only sub-feeds (`/*/feed/`) are disallowed. No barrier to scraping the main feed.

**Sample articles (2026-05-17 to 2026-05-21):**
| Title | Category | IT demographic fit |
|---|---|---|
| L'esempio del governo inglese, che tratta con i supermercati perché abbassino i prezzi | Notizie | ★★★★★ — spesa/prezzi |
| Come è possibile che i cibi ultra processati ci rendano più stupidi | Notizie | ★★★★★ — salute |
| Modena si stringe intorno allo chef investito | Notizie | ★★★★ — named protagonist, community |
| Ferrero e Netflix rilanceranno il marchio Willy Wonka | Notizie | ★★★ — nostalgia/brand |
| Quanto costa una brioscia con gelato, al gelatiere | Gelaterie/Locali | ★★ — price angle, but lifestyle niche |
| La guerra del Ruchè fa male più al Ruchè o chi prende pugni in faccia? | Vino | ★ — wine connoisseur, wrong audience |
| Comunicare lo specialty coffee con leggerezza | Notizie | ★ — trendy/young urbanite |

**Content fit assessment:**

The ItaliaOggi persona (65+ Roman women) resonates strongly with two Dissapore content streams:
1. **Food prices / consumer protection** — "spesa", "prezzi", "rincaro" are top resonance keywords in IT demographic scoring. Articles like the UK supermarket price negotiation story score +20 demographic bonus.
2. **Food safety / health** — "ultra-processed foods make you stupid", food fraud, food quality. Aligns with salute/malattia resonance keywords.

Non-resonant Dissapore content (Vino, Locali, Gelaterie, specialty coffee) will score near baseline (no demographic bonus), so these articles will be naturally deprioritized by the existing scoring system without needing special filtering.

**Attribution:** Dissapore has a public RSS feed, no licensing terms beyond standard RSS attribution. The pipeline already attributes source name in every post.

**Verdict: ADD IN PHASE 2 — feed is live, content partially aligns, scoring system handles natural filtering. No code changes needed beyond adding the feed URL to `sources.js`. Trigger: when IT page hits 1k engaged followers or at Month 2, whichever comes first.**

**Feed URL to add:** `https://www.dissapore.com/feed/`

```js
// To add in sources.js IT block:
{ name: 'Dissapore', url: 'https://www.dissapore.com/feed/' },
```

---

## Investigated and rejected

### Il Giornale
Rejected per Decision D3b (center-left positioning). Right-wing editorial line would create editorial inconsistency with existing feeds.

---

## Deferred — investigate later

### La Nazione
Deferred pending engagement data. Central Italy readership (Tuscany/Umbria). Re-evaluate at Month 2 if audience geography data shows Tuscany engagement.

### Il Mattino
Deferred pending engagement data. Naples readership. Re-evaluate at Month 2 if audience geography data shows Campania engagement.

### Il Sole 24 Ore
Phase 2 gate (10k engaged followers) per `sources.js` comment. Business/financial focus — limited fit for 65+ demographic.

### Corriere del Veneto
Phase 2 gate (10k engaged followers) per `sources.js` comment. Regional — add if Veneto audience engagement emerges.
