# France Sources Audit

**Last updated:** 2026-05-21

---

## Current active feeds

See `src/config/sources.js` for the authoritative list. As of A.9 (2026-05-21):

| Source | Type | Notes |
|---|---|---|
| Le Monde | RSS | General |
| Le Figaro | RSS | General |
| France Info | RSS | General |
| France 24 | RSS | General |
| Libération | RSS | General |
| L'Obs | RSS | General |
| BFM TV | RSS | General |
| Reporterre | RSS | A.6 |
| Le Parisien | RSS | A.6 |
| Bondy Blog | RSS | A.6 |
| La Provence | RSS | A.8 — PACA/Occitanie |
| Nice-Matin | RSS | A.8 — PACA/Occitanie |
| Midi Libre | RSS | A.8 — PACA/Occitanie |
| L'Équipe | RSS | A.9 — sports Layer 4 |
| NewsAPI | API | Query: "France actualité région Provence Méditerranée" |

---

## Investigated and rejected

### Le Bonbon
**Investigated:** 2026-05-21

**Type:** Paris-centric lifestyle (bars, restaurants, addresses, events)

**RSS availability:** None. All candidate paths return HTTP 404:
- `https://www.lebonbon.fr/feed/` → 404
- `https://www.lebonbon.fr/rss` → 404
- `https://www.lebonbon.fr/rss.xml` → 404
- `https://www.lebonbon.fr/feed.xml` → 404
- `/sitemap.xml` → 200 (pagination sitemaps only, not a feed)

**Site architecture:** Next.js headless app backed by `new-api.lebonbon.fr`. The API requires a bearer token; the token embedded in the page source is an expired JWT (issued 2020, expired 2020). No public feed endpoint exists.

**Robots.txt:** `Disallow: *?*` — blocks all parameterized URLs for general crawlers.

**Content fit:** Low for PACA/Occitanie retiree audience. Le Bonbon's content is Paris-specific nightlife and address guides targeting 25–40 urban professionals. No overlap with Section 5 persona (Marseille, Avignon, Hyères, regional identity, cost of living).

**Verdict: CANNOT ADD — no RSS feed. Not worth revisiting unless they launch a public feed.**

---

## Deferred — investigate later

### TimeOut France
Deferred per Decision D3a (free-RSS-only policy). TimeOut content requires a licensing arrangement. Re-evaluate at Month 6+ when licensing budget is considered.

### Démotivateur
Deferred per Decision D3a. Content is viral-first, not news-driven. Re-evaluate with engagement data once the page has 10k engaged followers.

### AFP wire
Deferred per Decision D3a. Requires paid syndication licence. Re-evaluate if budget allows.

---

## Phase 2 candidates (10k engaged-follower gate)

- **Le Point** — paywall API, deferred
- **L'Express** — paywall API, deferred
- **Courrier International** — licensed content, deferred
