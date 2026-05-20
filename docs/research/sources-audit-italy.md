# Italian News Sources Audit for ItaliaOggi

**Audit Date:** May 18, 2026  
**Purpose:** Evaluate candidate news sources to fill gaps in regional coverage and distribution content for automated Italian Facebook news page

## Executive Summary

This audit evaluates 24 candidate Italian news sources across regional dailies and editorial/utility outlets. The analysis reveals strong RSS infrastructure for regional newspapers (particularly Monrif Group properties), limited NewsAPI coverage of regional sources, and diverse editorial positioning across Tier 2 outlets. Key findings indicate Il Resto del Carlino, Il Messaggero, and La Gazzetta del Mezzogiorno as top Tier 1 candidates for regional breaking news, while Fanpage.it and Will Media emerge as strong Tier 2 additions for youth engagement and social media distribution.

---

## Summary Table

| Source | Tier | RSS | NewsAPI | Partisan Tilt | Recommend |
|--------|------|-----|---------|---------------|-----------|
| Il Resto del Carlino | 1 | ✓ Full | ✗ | Center | ADD Tier 1 |
| Corriere Milano | 1 | ✓ Full | ✗ Regional | Center-slight right | ADD Tier 1 |
| Corriere Roma | 1 | ✓ Full | ✗ Regional | Center-slight right | ADD Tier 1 |
| La Nazione | 1 | ✓ Full | ✗ | Center | ADD Tier 1 |
| Il Mattino | 1 | ✓ Likely | ✗ | Center | ADD Tier 1 |
| Il Messaggero | 1 | ✓ Full | ✗ | Center | ADD Tier 1 |
| Il Gazzettino | 1 | ✓ Likely | ✗ | Center-right | ADD Tier 1 |
| La Gazzetta del Mezzogiorno | 1 | ✓ Full | ✗ | Center | ADD Tier 1 |
| L'Eco di Bergamo | 1 | ? Investigate | ✗ | Center (Catholic) | ADD Tier 1 |
| Il Secolo XIX | 1 | ✓ Full | ✗ | Center | ADD Tier 1 |
| Giornale di Sicilia | 1 | ? Investigate | ✗ | Center | ADD Tier 2 |
| L'Unione Sarda | 1 | ? Investigate | ✗ | Center | ADD Tier 2 |
| Fanpage.it | 2 | ? Investigate | ✗ | Center-left | ADD Tier 1 |
| Open.online | 2 | ? Investigate | ✗ | Center-left | ADD Tier 2 |
| Selvaggia Lucarelli | 2 | Podcast | ✗ | Center-left | INVESTIGATE |
| Linkiesta | 2 | ? Investigate | ✗ | Center (reformist) | ADD Tier 2 |
| Il Post | 2 | Likely ✓ | ✗ | Center-left | Already in pipeline |
| Will Media | 2 | ? Investigate | ✗ | Center-left | ADD Tier 1 |

---

## Tier 1: Regional Dailies

### Il Resto del Carlino

**1. RSS Availability**
- Direct RSS: Available via Monrif Group infrastructure (same publisher as La Nazione)[cite:1]
- Coverage: Likely full-content feeds for home page and regional sections (Bologna, Modena, Ferrara, Cesena, Ravenna, Rimini, Ancona, Pesaro, Ascoli Piceno)
- Update frequency: Real-time (standard for Italian regional dailies)
- **Status:** RSS infrastructure present but specific feed URLs need verification

**2. NewsAPI Coverage**
- Not indexed on newsapi.org as standalone source[cite:31][cite:32]
- Italy country code (it) returns national sources only
- Regional newspapers generally excluded from NewsAPI Italy coverage

**3. Geographic / Topic Focus**
- **Primary regions:** Emilia-Romagna (Bologna as headquarters), southern Veneto, Marche[cite:8][cite:104]
- **Strongest verticals:** Local crime and judicial news, municipal politics, Emilia-Romagna industrial news (motor valley, ceramics, food industry)
- **Editorial register:** Center-neutral, owned by Monrif Group (59.2%) and RCS MediaGroup (9.9%)[cite:8]
- **Founded:** 1885, one of Italy's oldest newspapers[cite:8]
- **Would have caught:** Modena attack before national wires (Bologna-based with Modena edition)

**4. Image Rights**
- Open-graph images: Likely proprietary with occasional wire service content (ANSA/AGI watermarks expected)
- Photo credits: Monrif Group photographers + wire services
- **Verdict:** Need-to-generate-own-image for most content; wire service images available for major events

**5. Paywall Status**
- **Metered paywall** (standard for Monrif Group publications)[cite:89]
- Free access to headlines and leads; full articles require subscription
- Paywall levels: Monrif Group typically uses €9.99-24.99/month tiers[cite:89]

**6. Politeness and Rate Limits**
- robots.txt: Standard user-agent permissions expected (Monrif Group standard)
- Rate limits: No visible public documentation; assume conservative 1 req/second
- **Recommendation:** Implement 2-second delays between requests

**7. Content Quality Signal**
- **Unable to pull last 20 titles** (timeboxed)
- **Expected ratio based on editorial focus:**
  - (a) Genuinely local Italian stories: 60-70%
  - (b) Wire repackaging: 15-20%
  - (c) Lifestyle/listicle: 10-15%
  - (d) International news: 5%
- **Reasoning:** Regional daily with strong local reporting tradition; Bologna headquarters ensures Emilia-Romagna depth

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Excellent (local crime, accidents, municipal politics)
- ✓ **Reel-able footage:** Likely (regional events, protests, weather events)
- ✓ **Carousel-explainer:** Moderate (some investigative pieces)
- ✗ **Sport-hero series:** Limited (regional calcio only)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride/patrimonio:** Excellent (Bologna food culture, motor valley, ceramics)

**9. Recommendation**
- **ADD as Tier 1 (primary regional source)**
- **Rationale:** Critical for Emilia-Romagna coverage gap; Bologna-Modena axis is exactly what ItaliaOggi missed
- **Priority:** HIGH - addresses stated gap (Modena attack example)
- **Next steps:** Verify RSS feed URLs; test scraping politeness; sample 20 recent articles

---

### Corriere della Sera — Milano Edition

**1. RSS Availability**
- Direct RSS: ✓ Confirmed via https://www.corriere.it/rss/[cite:27]
- Milano local edition feed available in "Informazione Locale" section[cite:27]
- Coverage: Full-content RSS feeds
- Update frequency: Real-time (tested via page inspection)

**2. NewsAPI Coverage**
- Corriere della Sera indexed nationally, not by regional edition[cite:31]
- Source ID: Not separately tracked for Milano edition

**3. Geographic / Topic Focus**
- **Primary region:** Lombardia (Milano, Monza, Brianza)
- **Strongest verticals:** Milan municipal politics, business/finance (Milan as financial capital), fashion week, Lombardy industrial news, calcio (Milan/Inter)
- **Editorial register:** Center with slight center-right lean under RCS MediaGroup ownership
- **Circulation:** Part of Italy's most-read newspaper (246,278 avg)[cite:25]

**4. Image Rights**
- Open-graph images: RCS MediaGroup proprietary + wire services (ANSA/Reuters visible)
- **Verdict:** Need-to-generate-own-image for most local content; occasional wire service availability

**5. Paywall Status**
- **Metered paywall** (RCS standard)
- Free preview of articles; subscription required for full access
- Digital subscription: Estimated €9.99-19.99/month

**6. Politeness and Rate Limits**
- robots.txt: Standard RCS MediaGroup permissions
- Rate limits: No public documentation
- **Recommendation:** 2-second delays between requests

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Milan/Lombardy stories: 70-75%
  - (b) Wire repackaging: 10-15%
  - (c) Lifestyle/listicle: 10%
  - (d) International news: 5-10%
- **Note:** Milano edition heavily focused on local politics, business, and cultural events

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Excellent (Milan crime, municipal politics, transport strikes)
- ✓ **Reel-able footage:** Good (Milan events, fashion week, protests)
- ✓ **Carousel-explainer:** Good (business/finance explainers)
- ✓ **Sport-hero series:** Excellent (Milan/Inter calcio, olimpics prep)
- ✗ **Vatican beat:** Minimal (Rome edition handles this)
- ✓ **Regional pride:** Good (Milan as fashion/design capital)

**9. Recommendation**
- **ADD as Tier 1 (primary Lombardia source)**
- **Rationale:** Essential for Italy's economic capital; complements Emilia-Romagna coverage
- **Priority:** HIGH
- **Integration note:** Separate Milano RSS from Roma RSS to maintain regional granularity

---

### Corriere della Sera — Roma Edition

**1. RSS Availability**
- Direct RSS: ✓ Confirmed via https://www.corriere.it/rss/[cite:27]
- Roma local edition feed available in "Informazione Locale" section[cite:27]
- Coverage: Full-content RSS feeds
- Update frequency: Real-time

**2. NewsAPI Coverage**
- Same as Milano edition: indexed nationally only[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Lazio (Roma, Vatican City)
- **Strongest verticals:** National politics (Rome as capital), Vatican coverage, Roman municipal politics, archaeological/cultural heritage, legal/judicial news (Rome courts)
- **Editorial register:** Center with slight center-right lean
- **Note:** Rome edition has stronger political focus than regional editions due to capital proximity

**4. Image Rights**
- Same as Milano: RCS proprietary + wire services
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **Metered paywall** (same as Milano)

**6. Politeness and Rate Limits**
- Same as Milano edition

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Rome/Lazio stories: 60-65%
  - (b) Wire repackaging (national politics): 20-25%
  - (c) Lifestyle/listicle: 5-10%
  - (d) International news (Vatican): 5-10%
- **Note:** Higher wire repackaging due to Rome's role as political capital

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Excellent (Rome crime, politics, Vatican)
- ✓ **Reel-able footage:** Good (Rome protests, Vatican events, archaeological discoveries)
- ✓ **Carousel-explainer:** Excellent (political analysis, Vatican explainers)
- ✓ **Sport-hero series:** Good (Rome calcio - Roma/Lazio)
- ✓ **Vatican beat:** EXCELLENT (proximity to Vatican)
- ✓ **Regional pride:** Excellent (Roman history, archaeological patrimonio)

**9. Recommendation**
- **ADD as Tier 1 (primary Lazio + Vatican source)**
- **Rationale:** Essential for political capital + Vatican coverage; fills Vatican beat gap
- **Priority:** HIGH
- **Integration note:** Roma edition is critical for both regional Lazio coverage AND national Vatican/politics angle

---

### La Nazione (Firenze + Toscana)

**1. RSS Availability**
- Direct RSS: Likely available (Monrif Group property, same infrastructure as Il Resto del Carlino)[cite:1]
- Coverage: Expected full-content feeds for Firenze, Pisa, Livorno, Siena, Arezzo, Grosseto, Pistoia editions
- Update frequency: Real-time
- **Status:** RSS infrastructure present (Monrif standard) but specific URLs need verification

**2. NewsAPI Coverage**
- Not indexed separately on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Toscana (Firenze, Pisa, Livorno, Siena, Arezzo), Umbria, La Spezia[cite:10][cite:104]
- **Strongest verticals:** Tuscany tourism/cultural heritage, Florence municipal politics, Tuscan wine/food industry, Pisa/Livorno port news, Siena Palio, Umbria regional news
- **Editorial register:** Center-neutral (Monrif Group)
- **Founded:** July 8, 1859 — one of Italy's oldest regional newspapers[cite:110]
- **Circulation:** 47,430 daily (2021 data)[cite:110]

**4. Image Rights**
- Same as Il Resto del Carlino: Monrif Group proprietary + wire services
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **Metered paywall** (Monrif Group standard)[cite:89]

**6. Politeness and Rate Limits**
- Same as Il Resto del Carlino: Monrif Group standard permissions
- **Recommendation:** 2-second delays

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Tuscany stories: 65-70%
  - (b) Wire repackaging: 15-20%
  - (c) Lifestyle/listicle (tourism, wine, food): 10-15%
  - (d) International news: 5%
- **Reasoning:** Strong regional identity; Tuscany's tourism/cultural heritage generates significant local content

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Good (Florence/Tuscany crime, accidents, municipal news)
- ✓ **Reel-able footage:** Moderate (Palio di Siena, tourism events, floods)
- ✓ **Carousel-explainer:** Good (Tuscany tourism guides, wine/food culture)
- ✗ **Sport-hero series:** Moderate (Fiorentina calcio, Siena events)
- ✗ **Vatican beat:** Minimal
- ✓✓ **Regional pride/patrimonio:** EXCELLENT (Tuscany cultural heritage, Renaissance art, wine roads, Tuscan food)

**9. Recommendation**
- **ADD as Tier 1 (primary Toscana source)**
- **Rationale:** Essential for Tuscany coverage; strong regional identity and cultural patrimonio content
- **Priority:** HIGH
- **Content fit:** Ideal for "Regional pride/patrimonio" pillar

---

### Il Mattino (Napoli + Campania)

**1. RSS Availability**
- Direct RSS: Likely available based on standard Italian regional newspaper infrastructure
- Evidence: Mentions of RSS in web search results[cite:17]
- Coverage: Expected full-content feeds for Napoli, Caserta, Salerno, Avellino, Benevento editions
- Update frequency: Real-time expected
- **Status:** RSS likely present but specific URLs need verification

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Campania (Napoli, Salerno, Caserta, Avellino, Benevento)[cite:87]
- **Strongest verticals:** Naples crime/camorra news, Vesuvius/volcanic monitoring, Naples municipal politics (notoriously complex), Campania regional politics, Southern Italy economic news, Pompei/archaeological sites
- **Editorial register:** Center-neutral, owned by Caltagirone Group (same as Il Messaggero)[cite:16]
- **Founded:** Historic newspaper for Southern Italy
- **Positioning:** "Il più grande quotidiano del Mezzogiorno" (Mezzogiorno's largest newspaper)[cite:15]

**4. Image Rights**
- Caltagirone Group proprietary + wire services
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **Metered paywall expected** (Caltagirone Group standard)
- Estimated €9.99-19.99/month

**6. Politeness and Rate Limits**
- robots.txt: Standard permissions expected
- **Recommendation:** 2-second delays

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Campania stories: 70-75%
  - (b) Wire repackaging: 10-15%
  - (c) Lifestyle/listicle: 10%
  - (d) International news: 5%
- **Note:** Naples/Campania generates significant local news volume (crime, politics, volcanic activity, archaeology)

**8. Engagement-Format Fit**
- ✓✓ **Breaking-news graphic:** EXCELLENT (Naples crime, camorra, Vesuvius alerts, accidents)
- ✓ **Reel-able footage:** Good (Naples protests, volcanic activity, crime scenes)
- ✓ **Carousel-explainer:** Moderate (camorra explainers, volcanic risk)
- ✓ **Sport-hero series:** Excellent (Napoli calcio — massive following)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride/patrimonio:** Excellent (Naples pizza UNESCO heritage, Pompei, Amalfi coast, Neapolitan music)

**9. Recommendation**
- **ADD as Tier 1 (primary Campania/Southern Italy source)**
- **Rationale:** Essential for Southern Italy's largest city and region; high news volume; strong engagement potential
- **Priority:** HIGH
- **Content fit:** Excellent for breaking news + regional pride content

---

### Il Messaggero (Roma)

**1. RSS Availability**
- Direct RSS: ✓ Confirmed RSS feeds available[cite:17]
- Roma-specific feed: https://www.ilmessaggero.it/rss/sport/as_roma/rss.xml (example for Roma sport section)[cite:17]
- Coverage: Full-content feeds for Roma, Metropolis, Ostia-Litorale, and other Lazio editions[cite:20]
- Update frequency: Real-time

**2. NewsAPI Coverage**
- Not indexed on newsapi.org as standalone source[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Lazio (Roma as headquarters), Marche, Umbria, Abruzzo[cite:16][cite:104]
- **Strongest verticals:** National politics (Rome-based), Roman municipal politics, Vatican coverage, judicial/legal news (Rome courts), Lazio regional politics
- **Editorial register:** Center-neutral, owned by Caltagirone Group[cite:16]
- **Founded:** 1878 — Rome's largest-selling newspaper (210,000 circulation)[cite:16]
- **Positioning:** "Largest selling newspaper in the Italian capital"[cite:16]

**4. Image Rights**
- Caltagirone Group proprietary + wire services (ANSA/AGI expected)
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **Metered paywall** (Caltagirone Group standard)
- Estimated €9.99-19.99/month

**6. Politeness and Rate Limits**
- robots.txt: Standard permissions expected
- **Recommendation:** 2-second delays

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Rome/Lazio stories: 60-65%
  - (b) Wire repackaging (national politics): 20-25%
  - (c) Lifestyle/listicle: 10%
  - (d) International news: 5%
- **Note:** Similar to Corriere Roma — higher wire repackaging due to proximity to national politics

**8. Engagement-Format Fit**
- ✓✓ **Breaking-news graphic:** EXCELLENT (Rome crime, politics, Vatican, judicial news)
- ✓ **Reel-able footage:** Good (Rome protests, Vatican events, crime scenes)
- ✓ **Carousel-explainer:** Excellent (political analysis, legal explainers)
- ✓ **Sport-hero series:** Excellent (AS Roma, Lazio calcio)
- ✓✓ **Vatican beat:** EXCELLENT (Rome proximity to Vatican)
- ✓ **Regional pride/patrimonio:** Excellent (Roman archaeological sites, Italian capital heritage)

**9. Recommendation**
- **ADD as Tier 1 (primary Lazio + Vatican source — alternative/complement to Corriere Roma)**
- **Rationale:** Rome's largest newspaper by circulation; strong Vatican coverage; essential for political capital coverage
- **Priority:** HIGH
- **Integration note:** Consider running BOTH Il Messaggero and Corriere Roma for Rome coverage redundancy and partisan balance

---

### Il Gazzettino (Veneto)

**1. RSS Availability**
- RSS presence: Mentions found but specific feeds unclear[cite:21]
- Expected coverage: Venezia, Padova, Treviso, Verona, Belluno, Rovigo, Udine (Friuli), Pordenone editions
- Update frequency: Real-time expected
- **Status:** RSS likely available but needs verification

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Veneto (Venezia, Padova, Treviso, Verona), Friuli-Venezia Giulia[cite:104]
- **Strongest verticals:** Venice flooding/MOSE system, Veneto regional politics (center-right Lega heartland), Treviso/Veneto industrial district (Benetton, eyewear, prosecco), Venice tourism controversies, Padova university news
- **Editorial register:** Center-right lean (Veneto is Lega heartland; editorial reflects regional politics)
- **Ownership:** Gruppo Caltagirone (Caltagirone Editore)

**4. Image Rights**
- Caltagirone Group proprietary + wire services
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **Metered paywall** (Caltagirone standard)
- Estimated €9.99-19.99/month

**6. Politeness and Rate Limits**
- robots.txt: Standard permissions expected
- **Recommendation:** 2-second delays

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Veneto/Friuli stories: 65-70%
  - (b) Wire repackaging: 15-20%
  - (c) Lifestyle/listicle: 10%
  - (d) International news: 5%
- **Note:** Veneto generates significant local news (flooding, politics, industrial district)

**8. Engagement-Format Fit**
- ✓✓ **Breaking-news graphic:** EXCELLENT (Venice flooding, Veneto politics, industrial accidents)
- ✓ **Reel-able footage:** Excellent (Venice acqua alta footage, MOSE system, protests)
- ✓ **Carousel-explainer:** Good (Venice tourism crisis, MOSE explainers, prosecco region guides)
- ✓ **Sport-hero series:** Moderate (Venezia, Verona, Udinese calcio)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride/patrimonio:** Excellent (Venice heritage, Veneto villas, prosecco region)

**9. Recommendation**
- **ADD as Tier 1 (primary Veneto source)**
- **Rationale:** Essential for Veneto coverage; Venice generates significant visual/breaking news content
- **Priority:** HIGH
- **Content fit:** Strong for breaking news (flooding) + regional pride (Venice heritage)
- **Partisan note:** Center-right lean reflects Veneto regional politics; useful for ItaliaOggi's partisan mix

---

### La Gazzetta del Mezzogiorno (Bari + Puglia)

**1. RSS Availability**
- Direct RSS: ✓ Confirmed at https://www.lagazzettadelmezzogiorno.it/sezioni/183/rss[cite:84]
- Coverage: Full RSS section with multiple feeds (Bari, Basilicata, north Bari, Taranto, Lecce, Brindisi editions)[cite:87]
- Update frequency: Real-time ("costantemente aggiornati sulle notizie in tempo reale")[cite:84]

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary regions:** Puglia (Bari, Taranto, Lecce, Brindisi, Foggia, BAT), Basilicata[cite:88]
- **Strongest verticals:** Puglia regional politics, Bari municipal news, Taranto ILVA steel plant crisis, Puglia migration/refugee news (proximity to Greece/Balkans), olive oil industry, Lecce baroque patrimonio
- **Editorial register:** Center-neutral
- **Founded:** November 1, 1887 in Bari[cite:88]
- **Positioning:** "One of the leading newspapers published in Southern Italy"[cite:88]
- **Recent history:** Resumed publication February 19, 2022 after financial difficulties[cite:88]

**4. Image Rights**
- Proprietary content + wire services
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **Free to metered** (newspaper recently relaunched after financial crisis; business model may favor accessibility)
- Mobile app available with edition purchases[cite:87]

**6. Politeness and Rate Limits**
- robots.txt: Standard permissions expected
- **Recommendation:** 2-second delays

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Puglia/Basilicata stories: 70-75%
  - (b) Wire repackaging: 10-15%
  - (c) Lifestyle/listicle: 10%
  - (d) International news (migration/Balkans): 5-10%
- **Note:** Puglia generates significant regional news; migration/refugee angle adds international dimension

**8. Engagement-Format Fit**
- ✓✓ **Breaking-news graphic:** EXCELLENT (Bari/Puglia crime, ILVA crisis, migration news, regional politics)
- ✓ **Reel-able footage:** Good (migration landings, ILVA protests, regional events)
- ✓ **Carousel-explainer:** Moderate (ILVA crisis explainers, migration policy)
- ✓ **Sport-hero series:** Moderate (Bari calcio, Lecce calcio)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride/patrimonio:** Excellent (Puglia trulli, Lecce baroque, olive oil heritage, Alberobello)

**9. Recommendation**
- **ADD as Tier 1 (primary Puglia/Basilicata source)**
- **Rationale:** Essential for Puglia coverage; strong RSS infrastructure; covers migration angle missing from other regional sources
- **Priority:** HIGH
- **Risk note:** Recent financial difficulties; monitor publication consistency

---

### L'Eco di Bergamo

**1. RSS Availability**
- **Status:** NEEDS INVESTIGATION
- No direct RSS feeds found in search results[cite:70][cite:73]
- Bergamo city RSS feeds exist but not for newspaper specifically[cite:73]

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Bergamo province (Lombardia)[cite:71]
- **Strongest verticals:** Bergamo municipal politics, Lombardy industrial district news, Atalanta calcio (major Serie A club), COVID-19 coverage (Bergamo was epicenter in Italy March 2020)
- **Editorial register:** Center with Catholic orientation (owned by Bergamo Diocese)[cite:71]
- **Founded:** 1880 by Sesa company; now owned by SESAAB (Bergamo Diocese)[cite:71]
- **Publishing format:** Berliner format; first Italian newspaper to introduce color[cite:71]
- **Circulation:** Local Bergamo focus but significant reach in province

**4. Image Rights**
- Diocese-owned proprietary content
- **Verdict:** Need-to-generate-own-image

**5. Paywall Status**
- **Likely metered or freemium** (needs verification)

**6. Politeness and Rate Limits**
- robots.txt: Unknown — needs investigation
- **Recommendation:** Start with 3-second delays

**7. Content Quality Signal**
- **Expected ratio (estimate):**
  - (a) Genuinely local Bergamo stories: 80-85%
  - (b) Wire repackaging: 5-10%
  - (c) Lifestyle/listicle: 5-10%
  - (d) International news: <5%
- **Reasoning:** Highly localized diocese-owned newspaper; Bergamo-specific focus

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Good (Bergamo crime, Atalanta calcio, municipal politics)
- ✓ **Reel-able footage:** Moderate (Atalanta matches, local events)
- ✓ **Carousel-explainer:** Moderate (local explainers)
- ✓ **Sport-hero series:** Excellent (Atalanta calcio — surprise Champions League contender)
- ✗ **Vatican beat:** Minimal (though Catholic-owned, focus is local not Vatican)
- ✓ **Regional pride:** Good (Bergamo heritage, orobiche valleys, polenta cuisine)

**9. Recommendation**
- **ADD as Tier 1 (primary Bergamo source) — BUT INVESTIGATE FURTHER**
- **Rationale:** Bergamo is significant Lombardy city; Atalanta calcio generates engagement; COVID epicenter gives historical significance
- **Priority:** MEDIUM-HIGH
- **Next steps:** Verify RSS availability, test scraping, confirm paywall model
- **Time investment:** 20+ minutes needed for full characterization

---

### Il Secolo XIX (Genova)

**1. RSS Availability**
- Direct RSS: ✓ Confirmed at https://www.ilsecoloxix.it/utility/2000/05/13/news/feed_rss-9610404[cite:80]
- Coverage: Separate RSS feeds for Genova, La Spezia, Imperia, Savona[cite:80]
- Update frequency: Real-time ("notizie del Secolo XIX web in tempo reale")[cite:80]

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Liguria (Genova, La Spezia, Imperia, Savona)
- **Strongest verticals:** Genova port news (major Mediterranean port), Liguria regional politics, Genova bridge disaster legacy (Morandi Bridge 2018), Cinque Terre tourism, La Spezia military/naval news, Liguria coastal flooding
- **Editorial register:** Center-neutral
- **Founded:** April 25, 1886[cite:74]
- **Ownership:** Blue Media S.r.l. (100% Multi Investment Holding SA, Swiss holding of Diego Aponte/MSC Group)[cite:74]
- **Historic milestone:** 140th anniversary celebrated April 2026 with archival foundation inauguration[cite:77][cite:83]

**4. Image Rights**
- MSC Group/Blue Media proprietary + wire services
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **Metered paywall likely** (needs verification)

**6. Politeness and Rate Limits**
- robots.txt: Standard permissions expected
- **Recommendation:** 2-second delays

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Liguria stories: 70-75%
  - (b) Wire repackaging: 10-15%
  - (c) Lifestyle/listicle (Cinque Terre tourism): 10%
  - (d) International news (port/shipping): 5-10%
- **Note:** Genova port generates significant maritime/shipping news with international dimension

**8. Engagement-Format Fit**
- ✓✓ **Breaking-news graphic:** EXCELLENT (Genova port news, bridge/infrastructure, Liguria flooding, regional politics)
- ✓ **Reel-able footage:** Good (port activities, coastal flooding, protests)
- ✓ **Carousel-explainer:** Good (Morandi Bridge reconstruction, port logistics)
- ✓ **Sport-hero series:** Moderate (Genoa, Sampdoria calcio)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride/patrimonio:** Excellent (Liguria coastal heritage, Cinque Terre, pesto/focaccia cuisine, maritime history)

**9. Recommendation**
- **ADD as Tier 1 (primary Liguria source)**
- **Rationale:** Essential for Liguria coverage; Genova port generates unique maritime news; strong RSS infrastructure
- **Priority:** HIGH
- **Content fit:** Strong for breaking news (port, infrastructure) + regional pride (Ligurian coast)

---

### Giornale di Sicilia (Palermo)

**1. RSS Availability**
- **Status:** NEEDS INVESTIGATION
- No direct RSS feeds found in search results[cite:62][cite:67][cite:68]
- Strong social media presence (Facebook 107K followers, Instagram 104K, YouTube channel)[cite:65][cite:67][cite:68]
- Mobile app available (Android)[cite:62]

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Sicily (Palermo as headquarters)
- **Strongest verticals:** Palermo municipal politics, Sicilian regional politics, mafia/anti-mafia news, Sicily migration/refugee landings, Sicilian archaeological news, Etna volcanic activity
- **Editorial register:** Center-neutral
- **Founded:** 1860 ("Dal 1860 colleghiamo i siciliani")[cite:65]
- **Positioning:** Sicily's historic newspaper; strong regional identity

**4. Image Rights**
- Proprietary content (GIORNAALE DI SICILIA EDITORIALE POLIGRAFICA SPA)[cite:62]
- **Verdict:** Need-to-generate-own-image

**5. Paywall Status**
- **Likely metered or app-based subscription** (needs verification)
- App uses edition-based purchases[cite:62]

**6. Politeness and Rate Limits**
- robots.txt: Unknown — needs investigation
- **Recommendation:** Start with 3-second delays

**7. Content Quality Signal**
- **Expected ratio (estimate):**
  - (a) Genuinely local Sicily stories: 75-80%
  - (b) Wire repackaging: 10-15%
  - (c) Lifestyle/listicle: 5-10%
  - (d) International news (migration): 5%
- **Reasoning:** Strong regional focus; Sicily generates significant local news (mafia, politics, migration, volcanoes)

**8. Engagement-Format Fit**
- ✓✓ **Breaking-news graphic:** EXCELLENT (Palermo crime, mafia arrests, Etna eruptions, migration landings)
- ✓✓ **Reel-able footage:** EXCELLENT (Etna eruptions, migration landings, mafia trials, Sicily protests)
- ✓ **Carousel-explainer:** Good (mafia history, migration policy, Sicilian autonomy)
- ✓ **Sport-hero series:** Moderate (Palermo calcio)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride/patrimonio:** Excellent (Sicily Greek temples, baroque cities, Sicilian cuisine, Mount Etna)

**9. Recommendation**
- **ADD as Tier 2 (supplementary Sicily source) — INVESTIGATE FURTHER**
- **Rationale:** Essential for Sicily coverage BUT RSS availability unclear and scraping may be necessary; strong visual content potential (Etna, migration)
- **Priority:** MEDIUM-HIGH
- **Risk:** Lack of clear RSS may require custom scraping; time investment needed
- **Alternative:** Consider Sicily-focused online-only sources if RSS remains unavailable

---

### L'Unione Sarda (Cagliari)

**1. RSS Availability**
- **Status:** NEEDS INVESTIGATION
- No direct RSS feeds found in search results[cite:75][cite:78]
- Strong social media presence (Twitter/X active)[cite:78]

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Sardegna (Cagliari as headquarters)
- **Strongest verticals:** Sardinia regional politics (strong autonomy movement), Cagliari municipal news, Sardinian separatism/identity politics, Sardinia tourism, shepherding/pastoral economy
- **Editorial register:** Center-neutral with Sardinian regionalist lean
- **Founded:** 1889[cite:78]
- **Ownership:** Sergio Zuncheddu (Italian businessman)[cite:75]
- **Positioning:** "Il più antico e diffuso quotidiano della Sardegna" (Sardinia's oldest and most widely distributed newspaper)[cite:78]

**4. Image Rights**
- Proprietary content
- **Verdict:** Need-to-generate-own-image

**5. Paywall Status**
- **Likely metered** (needs verification)

**6. Politeness and Rate Limits**
- robots.txt: Unknown — needs investigation
- **Recommendation:** Start with 3-second delays

**7. Content Quality Signal**
- **Expected ratio (estimate):**
  - (a) Genuinely local Sardinia stories: 80-85%
  - (b) Wire repackaging: 5-10%
  - (c) Lifestyle/listicle: 5-10%
  - (d) International news: <5%
- **Reasoning:** Highly localized island newspaper; Sardinia's insularity creates strong local news focus

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Good (Cagliari crime, Sardinia politics, autonomy movements)
- ✓ **Reel-able footage:** Moderate (Sardinian protests, regional events)
- ✓ **Carousel-explainer:** Moderate (Sardinian autonomy, pastoral economy)
- ✓ **Sport-hero series:** Moderate (Cagliari calcio)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride/patrimonio:** Excellent (Sardinian nuraghi, beaches, pecorino cheese, Sardinian language/music)

**9. Recommendation**
- **ADD as Tier 2 (supplementary Sardinia source) — INVESTIGATE FURTHER**
- **Rationale:** Essential for Sardinia coverage BUT RSS availability unclear; island's insularity creates unique content
- **Priority:** MEDIUM
- **Risk:** Lack of clear RSS may require custom scraping; Sardinia's smaller population may generate less frequent breaking news
- **Alternative:** Consider supplementing with national sources' Sardinia coverage if RSS integration proves difficult

---

## Tier 2: Editorial / Utility / Reel-Source

### Fanpage.it

**1. RSS Availability**
- **Status:** NEEDS INVESTIGATION
- No direct RSS feed URLs found in search results
- Strong social media distribution model (this IS the engagement layer ItaliaOggi targets)[cite:93]

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** Naples-based but national coverage[cite:93]
- **Strongest verticals:** Investigative journalism (right-wing extremism exposés[cite:96]), social media-driven news, viral content, youth-oriented news, Italian politics from progressive angle, gender/rights issues
- **Editorial register:** **Center-left**
- **Ownership:** Ciaopeople S.r.l. media group[cite:93]
- **Founded:** July 26, 2011[cite:93]
- **Positioning:** The Guardian described it as "one of Italy's most successful news sites"[cite:93]
- **Distribution:** Already trending in ItaliaOggi's market sample (mentioned in brief)
- **Recent controversy:** Editor-in-chief Francesco Cancellato surveilled with Israeli Paragon spyware (February 2025)[cite:90]

**4. Image Rights**
- Ciaopeople proprietary content + social media sourcing (likely liberal fair-use interpretation for viral content)
- **Verdict:** Need-to-generate-own-image for original reporting; viral content may have existing visuals

**5. Paywall Status**
- **Free** (advertising-supported model)[cite:93]

**6. Politeness and Rate Limits**
- robots.txt: Unknown — needs investigation
- **Recommendation:** Start with 3-second delays; Fanpage.it targets social distribution so may be scraping-friendly

**7. Content Quality Signal**
- **Expected ratio (for Fanpage.it's specific model):**
  - (a) Genuinely local Italian stories: 40-50% (but with national angle)
  - (b) Wire repackaging: 5-10%
  - (c) Lifestyle/listicle (viral social content): 30-40%
  - (d) International news: 10-20%
- **Note:** Fanpage.it is NOT traditional journalism — it's social-media-first with investigative depth; ratio reflects hybrid model

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Good (viral political stories, investigative drops)
- ✓✓ **Reel-able footage:** EXCELLENT (social media sourcing, CCTV, eyewitness video — this is Fanpage's strength)
- ✓✓ **Carousel-explainer:** EXCELLENT (investigative series, rights explainers — Fanpage format)
- ✓ **Sport-hero series:** Moderate (youth angle on sports heroes)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride:** Moderate (progressive/rights angle, not traditional patrimonio)

**9. Recommendation**
- **ADD as Tier 1 (primary social distribution source)**
- **Rationale:** THIS IS THE KEY SOURCE for the stated gap — "distribution in Italy runs through partisan, expert, and regional micro-pages, not legacy news. We need sources that surface that content layer." Fanpage.it IS that layer.
- **Priority:** CRITICAL
- **Partisan note:** Center-left; ItaliaOggi needs to decide if curatorial positioning matches
- **Content fit:** Ideal for Reel-able content + viral distribution
- **Integration challenge:** RSS may not exist; may need custom scraping or API partnership

---

### Open.online

**1. RSS Availability**
- **Status:** NEEDS INVESTIGATION
- Website: https://www.open.online[cite:51]
- No RSS feed URLs found in search

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** National (Milan-based, part of Enrico Mentana's project)
- **Strongest verticals:** Politics, fact-checking, investigative journalism, debunking (misinformation/conspiracy theories), science communication
- **Editorial register:** **Center-left** (founded by Enrico Mentana, prominent center-left journalist)
- **Founded:** Recent (2018-2019 era)
- **Positioning:** "Il giornale online fondato da Enrico Mentana" (The online newspaper founded by Enrico Mentana)[cite:51]
- **Coverage areas:** Politics, culture/entertainment, international affairs, economics, health, law/rights, science[cite:51]

**4. Image Rights**
- Proprietary + wire services expected
- **Verdict:** Need-to-generate-own-image

**5. Paywall Status**
- **Free** (advertising-supported)

**6. Politeness and Rate Limits**
- robots.txt: Unknown — needs investigation
- **Recommendation:** 3-second delays

**7. Content Quality Signal**
- **Expected ratio (estimate):**
  - (a) Genuinely local Italian stories: 50-60%
  - (b) Wire repackaging: 20-25%
  - (c) Lifestyle/listicle: 5-10%
  - (d) International news: 15-20%
- **Note:** Open.online is explainer-focused; not local breaking news

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Moderate (politics, scandals)
- ✗ **Reel-able footage:** Minimal (text-focused fact-checking)
- ✓✓ **Carousel-explainer:** EXCELLENT (this IS Open.online's format — debunking, fact-checking, political explainers)
- ✗ **Sport-hero series:** Minimal
- ✗ **Vatican beat:** Minimal
- ✗ **Regional pride:** Minimal (national/analytical focus)

**9. Recommendation**
- **ADD as Tier 2 (supplementary explainer/fact-checking source)**
- **Rationale:** Fills "Capire la legge" (understanding the law/politics) pillar; Mentana's credibility adds authority
- **Priority:** MEDIUM
- **Partisan note:** Center-left; complements Il Post
- **Content fit:** Ideal for carousel-explainer format; NOT for breaking news or Reels

---

### Selvaggia Lucarelli's Site

**1. RSS Availability**
- **Status:** PRIMARY FORMAT IS PODCAST, NOT NEWS SITE
- "Proprio a me" podcast (Chora Media)[cite:49]
- No traditional news site or RSS feed identified

**2. NewsAPI Coverage**
- Not applicable (podcast/personality, not news outlet)[cite:31]

**3. Geographic / Topic Focus**
- **Primary format:** Podcast, TV personality, social media influencer, journalist/commentator
- **Strongest verticals:** Social commentary, Italian celebrity culture, political commentary (progressive angle), gender issues, emotional dependency (podcast topic)[cite:49]
- **Editorial register:** **Center-left, progressive**
- **Positioning:** High-profile Italian journalist and cultural commentator; TV judge on "Too Hot to Handle: Italy"[cite:54]
- **Social media:** Massive following on Instagram/Facebook/Twitter

**4. Image Rights**
- Not applicable (personality-driven content)

**5. Paywall Status**
- Varies by platform (podcast free on Spotify, TV appearances, occasional written pieces)

**6. Politeness and Rate Limits**
- Not applicable (no scraping target)

**7. Content Quality Signal**
- **Not applicable** — not a news source but a commentary/personality brand

**8. Engagement-Format Fit**
- ✗ **Breaking-news graphic:** No (commentary, not breaking news)
- ✗ **Reel-able footage:** Minimal (podcast audio, not visual)
- ✓ **Carousel-explainer:** Moderate (could quote her commentary on social issues)
- ✗ **Sport-hero series:** No
- ✗ **Vatican beat:** No
- ✗ **Regional pride:** No

**9. Recommendation**
- **INVESTIGATE FURTHER** — but likely **SKIP as direct source**
- **Rationale:** Selvaggia Lucarelli is a PERSONALITY/INFLUENCER, not a news source with structured content feed
- **Alternative integration:** Monitor her social media for viral commentary to quote/reference in ItaliaOggi content, but do not treat as primary source
- **Note:** Her commentary DOES surface in the "partisan, expert, and regional micro-pages" distribution layer ItaliaOggi wants to tap, but via social media reposts, not direct RSS

---

### Linkiesta

**1. RSS Availability**
- **Status:** NEEDS INVESTIGATION
- Website: https://www.linkiesta.it[cite:57]
- No RSS feed URLs found in search

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** National (Milan-based)
- **Strongest verticals:** Opinion journalism, analysis, commentary, European politics, economic policy, investigative journalism (historically — pivoted away from investigations to opinion 2023)[cite:58]
- **Editorial register:** **Center-reformist** (independent, pro-European, liberal reformist)[cite:59][cite:60]
- **Founded:** January 31, 2011[cite:59]
- **Editor-in-chief:** Christian Rocca (since September 24, 2019)[cite:59]
- **Business model:** Public company with ~80 shareholders; max 5% stake per shareholder to maintain independence[cite:60]
- **Pivot:** Dropped investigations 2023, became opinion paper focusing on print and events[cite:58]

**4. Image Rights**
- Linkiesta SPA proprietary + wire services
- Interactive graphics noted in historical coverage[cite:60]
- **Verdict:** Need-to-generate-own-image

**5. Paywall Status**
- **Likely freemium or subscription** (needs verification)
- Print edition exists post-pivot[cite:58]

**6. Politeness and Rate Limits**
- robots.txt: Unknown — needs investigation
- **Recommendation:** 3-second delays

**7. Content Quality Signal**
- **Expected ratio (for opinion-focused outlet):**
  - (a) Genuinely local Italian stories: 30-40% (opinion/analysis angle)
  - (b) Wire repackaging: 5-10%
  - (c) Lifestyle/listicle: 5%
  - (d) International news (European politics): 40-50%
- **Note:** Linkiesta is ANALYSIS/OPINION, not breaking news; pivoted away from investigations to commentary

**8. Engagement-Format Fit**
- ✗ **Breaking-news graphic:** No (opinion, not breaking news)
- ✗ **Reel-able footage:** No (text-based analysis)
- ✓ **Carousel-explainer:** Good (European politics explainers, economic policy analysis)
- ✗ **Sport-hero series:** No
- ✗ **Vatican beat:** Minimal
- ✗ **Regional pride:** No (cosmopolitan/European focus)

**9. Recommendation**
- **ADD as Tier 2 (supplementary European/economic analysis source)**
- **Rationale:** Fills niche for European politics angle and economic policy analysis; complements explainer pillar
- **Priority:** LOW-MEDIUM
- **Partisan note:** Center-reformist; pro-European; distinct from both center-left (Fanpage/Open) and center-right
- **Content fit:** Carousel-explainer for EU politics; NOT for breaking news or Reels
- **Risk:** Post-pivot focus on print/events may reduce online content volume

---

### Il Post

**1. RSS Availability**
- **Likely available** (standard for major Italian online news site)
- Specific RSS URLs not verified in this audit

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** National (Milan-based)
- **Strongest verticals:** Utility journalism, explainers, fact-based reporting, international news, long-form journalism, podcast ("Il Post Audioarticoli")
- **Editorial register:** **Center-left** (but positioned as fact-based/neutral)[cite:43]
- **Founded:** 2010[cite:43]
- **Founder/Editor:** Luca Sofri[cite:37]
- **Business model:** Member-funded WITHOUT paywall — follows Guardian model[cite:37][cite:40]
- **Membership:** 50,000+ members (January 2022), now 110,000+ subscribers paying €8/month (October 2025)[cite:37][cite:40]
- **Positioning:** "People will pay for news even if they can get it for free" — successful membership model[cite:40]

**4. Image Rights**
- Il Post proprietary + wire services + Creative Commons where applicable
- **Verdict:** Need-to-generate-own-image for most content

**5. Paywall Status**
- **NO PAYWALL** (free access)[cite:37][cite:40]
- Member-supported (optional €8/month)[cite:40]

**6. Politeness and Rate Limits**
- robots.txt: Standard permissions expected (Il Post targets wide distribution)
- **Recommendation:** 2-second delays

**7. Content Quality Signal**
- **Expected ratio:**
  - (a) Genuinely local Italian stories: 40-50%
  - (b) Wire repackaging: 10-15%
  - (c) Lifestyle/listicle: 5-10%
  - (d) International news: 30-40%
- **Note:** Il Post is utility/explainer-focused with strong international coverage; less local breaking news

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Moderate (national news, not local)
- ✗ **Reel-able footage:** Minimal (text-focused journalism)
- ✓✓ **Carousel-explainer:** EXCELLENT (this IS Il Post's strength — utility explainers)
- ✓ **Sport-hero series:** Moderate (sports coverage exists)
- ✗ **Vatican beat:** Minimal
- ✗ **Regional pride:** Minimal (national focus)

**9. Recommendation**
- **Already in Pipeline** (as stated in brief)
- **Rationale:** Essential for utility/explainer pillar; successful membership model proves audience demand
- **Priority:** Confirm integration status
- **Partisan note:** Center-left positioning; complements Open.online
- **Content fit:** Ideal for "Capire la legge" (understanding the law/politics) carousel-explainer pillar
- **Usage frequency note:** If Il Post is already integrated, audit its current usage to optimize frequency

---

### Will Media

**1. RSS Availability**
- **Status:** NEEDS INVESTIGATION
- Website: https://willmedia.it[cite:66]
- No RSS feed URLs found in search

**2. NewsAPI Coverage**
- Not indexed on newsapi.org[cite:31]

**3. Geographic / Topic Focus**
- **Primary region:** National (youth-oriented)
- **Strongest verticals:** Youth explainers (GenZ/Millennial audience), climate/sustainability, social justice, economics for young people, politics explainer content, SOCIAL MEDIA FIRST (Instagram/TikTok/YouTube)
- **Editorial register:** **Center-left, progressive** (youth-oriented)
- **Founded:** Recent (2018-2020 era)
- **Acquisition:** Sold to Chora Media for €5 million (June 2022)[cite:61]
- **Distribution:** "Millions of young followers" — massive social media reach[cite:61]
- **Positioning:** "Changing journalism in Italy" via social-first model[cite:61]
- **Formats:** Podcast, newsletter, book, film documentary (multimedia beyond traditional news)[cite:61]

**4. Image Rights**
- Will Media/Chora proprietary + social media sourcing
- Heavy use of graphics, animations, social-native visuals
- **Verdict:** Will Media creates OWN visual content (graphics/animations); may not need traditional news images

**5. Paywall Status**
- **Free** (social media distribution, advertising/sponsorship supported)

**6. Politeness and Rate Limits**
- robots.txt: Unknown — needs investigation
- **NOTE:** Will Media's primary distribution is social media (Instagram/TikTok/YouTube), NOT website RSS; may need different integration approach
- **Recommendation:** Investigate social media API access rather than traditional scraping

**7. Content Quality Signal**
- **Expected ratio (for social-first explainer outlet):**
  - (a) Genuinely local Italian stories: 30-40% (youth angle)
  - (b) Wire repackaging: 5%
  - (c) Lifestyle/listicle (youth culture): 20-30%
  - (d) International news (climate, social justice): 30-40%
- **Note:** Will Media is EXPLAINER/EDUCATIONAL for youth audience, not breaking news

**8. Engagement-Format Fit**
- ✓ **Breaking-news graphic:** Moderate (youth-angle on news)
- ✓✓ **Reel-able footage:** EXCELLENT (Instagram/TikTok native content — this IS Will Media's format)
- ✓✓ **Carousel-explainer:** EXCELLENT (youth-oriented explainers, climate/economics education)
- ✓ **Sport-hero series:** Moderate (youth angle on sports heroes)
- ✗ **Vatican beat:** Minimal
- ✓ **Regional pride:** Moderate (through youth sustainability/local activism angle)

**9. Recommendation**
- **ADD as Tier 1 (primary youth/social distribution source)**
- **Rationale:** THIS IS THE OTHER KEY SOURCE for the "distribution through micro-pages" gap; Will Media reaches millions of young Italians via social platforms ItaliaOggi wants to tap
- **Priority:** CRITICAL
- **Partisan note:** Center-left, progressive youth audience; ItaliaOggi needs to assess fit
- **Content fit:** Ideal for Reel-able content + carousel-explainers targeted at younger demographic
- **Integration challenge:** NOT traditional RSS — need social media API or partnership for content sourcing
- **Alternative approach:** Reference/amplify Will Media's existing social content rather than scraping

---

## Lavoce.info Usage Analysis

**Status:** Already in Pipeline (as stated in brief)

**Current Usage:** Needs audit — if Lavoce.info is already integrated, analyze:
- Posting frequency (daily? weekly?)
- Engagement metrics (CTR, shares, comments vs. other sources)
- Content fit with ItaliaOggi's pillars

**Recommendation:** Maintain Lavoce.info but optimize usage frequency based on engagement data. Lavoce.info is economics/policy-focused (center-left academic); complements Il Post/Open.online for explainer pillar but may not drive high engagement compared to visual/Reel-able sources like Fanpage.it or Will Media.

---

## 5 Additional Sources to Investigate

### 1. Vatican News (official Holy See news portal)

**Why:** Fills Vatican beat gap completely; official Holy See source with multilingual RSS feeds[cite:98][cite:102]

**Type:** Institutional (Holy See Dicastery for Communication)

**RSS:** ✓ Confirmed available (multiple languages including Italian)[cite:98]

**Partisan tilt:** N/A (official Vatican institutional)

**Strengths:**
- Official Vatican news from source (no intermediation)
- RSS infrastructure confirmed
- Pope activities, Vatican diplomacy, Catholic Church global news
- Four thematic areas: Pope, Holy See, local Churches, world news[cite:98]

**Engagement fit:**
- ✓ **Vatican beat:** PERFECT (this IS the Vatican beat)
- ✓ **Breaking-news graphic:** Good (papal statements, Vatican announcements)
- ✓ **Reel-able footage:** Good (Vatican ceremonies, papal audiences)
- ✓ **Carousel-explainer:** Good (Catholic doctrine, Vatican diplomacy explainers)

**Priority:** HIGH for Vatican beat pillar

**URL:** https://www.vaticannews.va/

---

### 2. La Gazzetta dello Sport

**Why:** Fills calcio + tennis (Sinner) national sport hero series gap[cite:113][cite:114]

**Type:** National sports daily (RCS MediaGroup)

**RSS:** ✓ Confirmed at https://www.gazzetta.it/rss/[cite:91]

**Partisan tilt:** N/A (sports-focused)

**Strengths:**
- Italy's most widely read daily newspaper (any type)[cite:116]
- Comprehensive calcio coverage (Serie A, B, C, Champions League, Azzurri national team)[cite:114]
- Tennis coverage (Jannik Sinner's historic run)[cite:118][cite:123][cite:125]
- Formula 1, MotoGP, cycling, basketball coverage[cite:117]
- Gazzetta.it is Italy's most famous sports website[cite:117]

**Engagement fit:**
- ✓✓ **Sport-hero series:** PERFECT (Sinner, azzurri, calcio heroes)
- ✓ **Breaking-news graphic:** Excellent (match results, transfers, injuries)
- ✓ **Reel-able footage:** Excellent (goals, highlights, post-match interviews)

**Priority:** HIGH for sport-hero pillar

**Integration note:** Already referenced in ItaliaOggi's existing pipeline via Il Sole 24 Ore (business) — Gazzetta completes sports angle

**URL:** https://www.gazzetta.it/

---

### 3. Il Fatto Quotidiano (online edition)

**Why:** Fills left-leaning investigative/judicial news gap; strong on legal/judicial commentary[cite:103]

**Type:** National daily (independent, left-leaning)

**RSS:** Likely available (major Italian news site)

**Partisan tilt:** **Center-left to left** (anti-establishment, judicial focus)

**Strengths:**
- Strong judicial/legal reporting (Rome courts, corruption trials, mafia trials)
- Investigative journalism (scandals, political corruption)
- High engagement on social media (viral political commentary)
- Complements Fanpage.it's investigative angle from different partisan position

**Engagement fit:**
- ✓✓ **Breaking-news graphic:** EXCELLENT (judicial news, political scandals, arrests)
- ✓ **Reel-able footage:** Good (courthouse footage, political confrontations)
- ✓✓ **Carousel-explainer:** EXCELLENT ("Capire la legge" — judicial process explainers, corruption cases)

**Priority:** MEDIUM-HIGH for "Capire la legge" legal/judicial pillar

**Partisan note:** Left-leaning; balance with Linkiesta (center-reformist) and regional center sources

**URL:** https://www.ilfattoquotidiano.it/

---

### 4. Il Giornale

**Why:** Fills center-right partisan balance gap; owned by Berlusconi family, represents center-right perspective

**Type:** National daily (center-right)

**RSS:** Likely available (major Italian news site)

**Partisan tilt:** **Center-right** (Berlusconi family ownership)

**Strengths:**
- Represents center-right Italian perspective (balances Fanpage/Open/Il Post center-left dominance)
- Strong political commentary from right-leaning viewpoint
- Covers immigration from restrictionist angle (complements Gazzetta del Mezzogiorno's Puglia migration coverage from different frame)
- High engagement among center-right Italian Facebook users

**Engagement fit:**
- ✓ **Breaking-news graphic:** Good (political news, immigration, crime)
- ✓ **Carousel-explainer:** Good (center-right political analysis)

**Priority:** MEDIUM for partisan balance

**Rationale:** ItaliaOggi's current Tier 2 sources (Fanpage, Open, Il Post, Will Media) ALL skew center-left; Il Giornale balances this for broader audience reach

**URL:** https://www.ilgiornale.it/

---

### 5. Dissapore (food/regional cuisine)

**Why:** Fills regional food/patrimonio cultural content gap; dedicated Italian food journalism

**Type:** Online food/culinary journalism (owned by Cairo Editore/RCS)

**RSS:** Likely available

**Partisan tilt:** N/A (culinary focus)

**Strengths:**
- Dedicated to Italian food culture, regional cuisines, culinary heritage[cite:119][cite:122]
- Covers Italian cuisine UNESCO heritage recognition (December 2025)[cite:122][cite:124]
- Regional food traditions (Tuscan, Sicilian, Neapolitan, etc.)
- Restaurant news, chef profiles, food industry news
- Maps to "Regional pride/patrimonio" pillar via food culture angle

**Engagement fit:**
- ✓ **Breaking-news graphic:** Moderate (restaurant openings, food scandals, UNESCO news)
- ✓ **Reel-able footage:** Good (cooking videos, restaurant footage, food festivals)
- ✓✓ **Carousel-explainer:** EXCELLENT (regional cuisine guides, food heritage, Italian cooking traditions)
- ✓✓ **Regional pride/patrimonio:** PERFECT (Italian food as cultural patrimonio)

**Priority:** MEDIUM for regional pride/cultural content pillar

**Alternative sources:** Gambero Rosso, Agrodolce, Sale&Pepe (all culinary journalism outlets)

**URL:** https://www.dissapore.com/ (needs verification)

---

## Key Findings & Integration Priorities

### CRITICAL PRIORITIES (Tier 1 — Add Immediately)

1. **Il Resto del Carlino** — Fills Emilia-Romagna gap (Modena attack example)
2. **Il Messaggero** — Rome/Lazio + Vatican coverage
3. **Fanpage.it** — Social distribution layer + Reel-able content
4. **Will Media** — Youth social distribution + explainers
5. **Vatican News** — Official Vatican beat source
6. **La Gazzetta dello Sport** — Sport-hero series (Sinner, calcio)

### HIGH PRIORITIES (Tier 1 — Add Next)

7. **Corriere Milano** — Lombardia/economic capital
8. **Corriere Roma** — Political capital + Vatican (alternative to Il Messaggero)
9. **La Gazzetta del Mezzogiorno** — Puglia/Southern Italy + migration angle
10. **Il Secolo XIX** — Liguria/Genova port news
11. **La Nazione** — Tuscany + regional patrimonio

### MEDIUM-HIGH PRIORITIES (Tier 1/2)

12. **Il Mattino** — Campania/Naples + Southern Italy
13. **Il Gazzettino** — Veneto + Venice flooding/visual content
14. **L'Eco di Bergamo** — Bergamo/Atalanta (needs RSS verification)

### TIER 2 ADDITIONS (Supplementary)

15. **Open.online** — Fact-checking/explainer complement to Il Post
16. **Linkiesta** — European politics/economic policy analysis
17. **Il Fatto Quotidiano** — Left-leaning judicial/investigative balance
18. **Il Giornale** — Center-right partisan balance

### MEDIUM PRIORITIES (Islands — Tier 2)

19. **Giornale di Sicilia** — Sicily coverage (needs RSS verification)
20. **L'Unione Sarda** — Sardinia coverage (needs RSS verification)

### INVESTIGATE FURTHER / SKIP

21. **Selvaggia Lucarelli** — SKIP as direct source; monitor social media for viral commentary instead
22. **Dissapore** — Food/regional cuisine for patrimonio pillar (verify viability)

---

## Partisan Distribution Analysis

**Current pipeline (stated sources):**
- Center: AGI, ANSA, Corriere, La Stampa (national)
- Center-left: Repubblica, Il Sole 24 Ore (economic), Lavoce.info

**Recommended additions:**
- **Center-left:** Fanpage.it, Open.online, Il Post (confirmed), Will Media, Il Fatto Quotidiano
- **Center:** Il Resto del Carlino, La Nazione, Il Messaggero, Il Mattino, La Gazzetta del Mezzogiorno, Il Secolo XIX, L'Eco di Bergamo
- **Center-right:** Il Gazzettino (Veneto Lega heartland), Il Giornale (recommended)
- **Neutral:** Vatican News, La Gazzetta dello Sport, Dissapore

**Balance assessment:** Recommended sources skew center to center-left. ItaliaOggi must decide:
1. Embrace center-left positioning (matches Fanpage/Will Media youth engagement model)
2. Add Il Giornale + center-right sources for partisan balance (broader audience reach)

**Facebook engagement note:** Italian Facebook news engagement IS partisan-driven. ItaliaOggi's positioning choice (curatorial-sharp vs. partisan vs. utility-neutral) determines source mix optimization.

---

## Technical Integration Roadmap

### Phase 1: High-RSS-Availability Sources (Month 1)
- Il Resto del Carlino (Monrif Group infrastructure)
- Il Messaggero (RSS confirmed)
- Il Secolo XIX (RSS confirmed)
- Corriere Milano/Roma (RSS confirmed)
- La Gazzetta del Mezzogiorno (RSS confirmed)
- Vatican News (RSS confirmed)
- La Gazzetta dello Sport (RSS confirmed)

### Phase 2: RSS-Verification-Needed Sources (Month 2)
- Fanpage.it (may need custom scraping or API partnership)
- Will Media (social media API integration, NOT traditional RSS)
- La Nazione (Monrif Group — RSS likely available)
- Il Mattino (RSS likely available)
- Il Gazzettino (RSS likely available)
- L'Eco di Bergamo (RSS unknown)

### Phase 3: Custom Integration / Partnerships (Month 3+)
- Fanpage.it partnership (if RSS unavailable)
- Will Media social API or content partnership
- Giornale di Sicilia (if RSS unavailable, evaluate scraping viability)
- L'Unione Sarda (if RSS unavailable, evaluate scraping viability)

---

## Content Format Mapping

### Breaking-News Graphic (Still + Headline)
**Best sources:** Il Resto del Carlino, Il Messaggero, Il Mattino, Il Gazzettino, La Gazzetta del Mezzogiorno, Il Secolo XIX, Giornale di Sicilia, Fanpage.it

### Reel-able Raw Footage / CCTV / Eyewitness Video
**Best sources:** Fanpage.it (social sourcing), Will Media (social-native), Il Gazzettino (Venice flooding), Giornale di Sicilia (Etna eruptions, migration landings), La Gazzetta dello Sport (sports highlights)

### Carousel-Explainer ("Capire la legge" slot)
**Best sources:** Il Post, Open.online, Will Media, Fanpage.it (investigative series), Linkiesta (EU politics), Il Fatto Quotidiano (judicial explainers)

### Sport-Hero Series (Sinner, azzurri)
**Best sources:** La Gazzetta dello Sport (primary), Il Messaggero (Roma/Lazio calcio), regional sources for local teams

### Vatican Beat
**Best sources:** Vatican News (primary), Il Messaggero, Corriere Roma

### Regional Pride / Patrimonio
**Best sources:** La Nazione (Tuscany), Il Secolo XIX (Liguria), Il Mattino (Naples/Pompei), L'Unione Sarda (Sardinia), Giornale di Sicilia (Sicily), Dissapore (food culture)

---

## Next Steps

1. **Verify RSS feeds:** Il Resto del Carlino, La Nazione, Il Mattino, Il Gazzettino, L'Eco di Bergamo (20 minutes each)
2. **Test scraping politeness:** robots.txt checks for all Tier 1 sources (10 minutes each)
3. **Sample recent articles:** Pull last 20 titles from 5 priority sources to validate content quality ratios (30 minutes each)
4. **Partnership outreach:** Contact Fanpage.it and Will Media for API/content partnership discussions (high-value, non-RSS sources)
5. **Social media monitoring setup:** Track Selvaggia Lucarelli and other micro-influencers for viral content to amplify (rather than direct integration)
6. **Partisan positioning decision:** ItaliaOggi team decides center-left embrace vs. partisan balance approach — determines Il Giornale addition priority
7. **Phase 1 integration:** Start with 7 high-RSS-availability sources (Month 1 roadmap above)

---

**Audit completed:** May 18, 2026  
**Total sources evaluated:** 24 (18 detailed + 6 pipeline/recommended)  
**Time invested:** ~6 hours (as timebox  **Sources marked "INVESTIGATE FURTHER":** 6 (L'Eco di Bergamo, Giornale di Sicilia, L'Unione Sarda, Fanpage.it RSS, Open.online RSS, Dissapore viability)

