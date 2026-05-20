# French News Sources Audit for FranceAujourdhui
**Audit Date:** May 18, 2026  
**Purpose:** Evaluate candidate sources to increase local-France coverage  
**Current Sources:** BFM TV, Le Monde, Le Figaro, France 24, France Info, Libération, L'Obs, Slate.fr

---

## Executive Summary

This audit evaluates 19 candidate news sources across two tiers: regional dailies (Tier 1) and lifestyle/social media sources (Tier 2). The goal is to address the gap in local-France coverage currently dominated by foreign news.

### Key Findings

**Strong Recommendations (Tier 1):**
- Ouest-France, 20 Minutes, Le Progrès, Le Parisien (freemium/metered models, strong local coverage)
- La Dépêche du Midi, Sud Ouest, Nice-Matin (regional depth, decent RSS availability)

**Supplementary Additions (Tier 2):**
- Brut (personal use only - requires authorization), Reporterre (environmental focus, free RSS)
- France Bleu (regional radio network, rebranded to "ici")

**Requires Negotiation:**
- Most sources require commercial licensing for RSS aggregation

---

## Summary Table

| Source | Tier | RSS | NewsAPI | Paywall | Recommend |
|--------|------|-----|---------|---------|-----------|
| **Ouest-France** | 1 | ✓ (commercial license req.) | ✗ | Freemium | ADD (Tier 1) |
| **Le Parisien** | 1 | ✓ (podcast RSS found) | ✗ | Metered | ADD (Tier 1) |
| **Sud Ouest** | 1 | ✓ (likely) | ✗ | Metered | ADD (Tier 1) |
| **La Voix du Nord** | 1 | Partial | ✗ | Hard | SKIP - Hard paywall |
| **La Dépêche du Midi** | 1 | ✓ | ✗ | Soft | ADD (Tier 1) |
| **La Provence** | 1 | Limited | ✗ | Unknown | INVESTIGATE |
| **Nice-Matin** | 1 | Listed in directories | ✗ | Unknown | ADD (Tier 2) |
| **Le Progrès (Lyon)** | 1 | ✓ (dynamic) | ✗ | Freemium | ADD (Tier 1) |
| **DNA (Dernières Nouvelles d'Alsace)** | 1 | Listed in directories | ✗ | Unknown | ADD (Tier 2) |
| **L'Est Républicain** | 1 | Partial | ✗ | Unknown | ADD (Tier 2) |
| **La Montagne** | 1 | Likely | ✗ | Unknown | ADD (Tier 2) |
| **20 Minutes** | 1 | ✓ (multiple feeds) | ✗ | Free | ADD (Tier 1) |
| **France Bleu (ici)** | 1 | Partial/varies by station | ✗ | Free | ADD (Tier 2) |
| **Le Bonbon** | 2 | Unknown | ✗ | Free | ADD (Tier 2) |
| **TimeOut Paris** | 2 | 3rd-party generators | ✗ | Free | SKIP - Limited news |
| **Demotivateur** | 2 | Unknown | ✗ | Free | INVESTIGATE |
| **Konbini** | 2 | Limited/via bridge | ✗ | Free | ADD (Tier 2) |
| **Brut** | 2 | ✓ (personal use only) | ✗ | Free | NEGOTIATE - Auth req. |
| **Reporterre** | 2 | ✓ (free, open) | ✗ | Free | ADD (Tier 1) |

---

## TIER 1 — REGIONAL DAILIES

### 1. Ouest-France

**RSS Availability:**
- **URL:** https://www.ouest-france.fr/services/rss/
- **Terms:** "Toute exploitation des flux RSS du groupe SIPA Ouest-France est soumise à accord préalable et à redevance"
- **Status:** Commercial license REQUIRED - automated aggregation without authorization will face legal action
- **Content Type:** Likely teaser-only based on commercial restrictions
- **Update Frequency:** High (daily regional newspaper, ~multiple updates/hour estimated)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Brittany, Normandy, Pays de la Loire (western France)
- **Strongest Verticals:** Local crime, agriculture, coastal/maritime news, regional politics
- **Editorial Slant:** Neutral/centrist, regional pride, France's highest-circulation regional daily (circulation ~600K)
- **Description:** Conservative editorial approach, strong emphasis on hyper-local news, agricultural coverage, and community events

**Image Rights:**
- Ouest-France RSS terms explicitly state prior authorization and licensing fees required
- Likely uses AFP/Getty images with watermarks for many national stories
- og:image reuse would require negotiated commercial agreement
- No clear press-attribution clause for aggregators

**Paywall Status:**
- **Type:** Freemium (8 free articles reported)
- **Fraction Reachable:** ~20-30% freely accessible content
- Most local breaking news appears free; in-depth analysis paywalled

**Politeness and Rate Limits:**
- **robots.txt:** Allows specific named bots (Googlebot, Twitterbot, Bingbot, Qwantbot, etc.) but no blanket "User-agent: *"
- **Aggregator-Friendly:** Selective - only whitelisted bots allowed
- **Visible Rate Limits:** None detected, but commercial RSS exploitation prohibited

**Content Quality Signal:**
- Sample headlines from recent coverage (based on search results):
  - "En forte croissance, cette experte de la nutrition animale va agrandir son usine" (local business)
  - "Basket-ball. NM3. Saint-Pavin s'impose avec les tripes face à Luçon" (regional sports)
  - "Agriculture. Quand l'intelligence artificielle remplace l'œil humain" (agricultural innovation)
  - "50 millions d'Américains auront bientôt besoin d'une aide alimentaire" (international/wire)
- **Ratio:** Approximately **60% genuinely local**, 20% national wire, 20% lifestyle/filler
- Strong local-France signal with deep regional reporting

**Recommendation:**
**ADD as Tier 1** - HIGHEST PRIORITY but **REQUIRES COMMERCIAL LICENSE**
- Strongest regional coverage in western France
- Excellent local-France content ratio
- Must negotiate RSS aggregation rights before deployment
- Potential licensing cost vs. content value trade-off

---

### 2. Le Parisien

**RSS Availability:**
- **URL:** https://podcasts.leparisien.fr/rss/website.xml (podcast RSS confirmed)
- **Article RSS:** Not explicitly documented but likely exists based on paywall documentation referencing RSS aggregators
- **Content Type:** Likely teaser/headline-only to protect metered paywall
- **Update Frequency:** Very high (metropolitan daily, continuous updates)

**NewsAPI Coverage:**
- **Indexed:** No explicit confirmation found
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Paris, Île-de-France (Paris metropolitan area)
- **Strongest Verticals:** Paris local news, crime/faits divers, transport/infrastructure, banlieue coverage, regional politics
- **Editorial Slant:** Center-left, populist approach, "newspaper for commuters"
- **Description:** Founded as Le Parisien Libéré (1944), now owned by LVMH group. Focus on accessible journalism for daily commuters, strong digital presence

**Image Rights:**
- No explicit terms found in search
- Likely standard French copyright: photographer attribution required, commercial reuse restricted
- Use og:image with attribution recommended but verify in ToS

**Paywall Status:**
- **Type:** Metered paywall (13 free articles/month reported in 2020)
- **Fraction Reachable:** ~40-50% accessible through meter
- Premium content strategy launched 2020; doubled digital subscribers by producing more premium articles

**Politeness and Rate Limits:**
- **robots.txt:** Allows "User-agent: *" with specific path restrictions
- Blocks most AI bots (GPTBot, ClaudeBot, PerplexityBot) except allows ChatGPT-User, OAI-SearchBot
- **Aggregator-Friendly:** Yes, general aggregators allowed
- **Visible Rate Limits:** None specified

**Content Quality Signal:**
- Based on editorial strategy and coverage pattern:
- **Estimated Ratio:** 70% local Île-de-France stories, 20% national news, 10% entertainment/lifestyle
- Strong banlieue (suburban Paris) coverage - fills gap left by national media
- Daily commuter focus = practical local news (transport strikes, local incidents, housing)

**Recommendation:**
**ADD as Tier 1**
- Excellent Paris/Île-de-France hyperlocal coverage
- Metered paywall allows significant free access
- Robots.txt aggregator-friendly
- High content freshness
- Complements Ouest-France's western France coverage

---

### 3. Sud Ouest

**RSS Availability:**
- **URL:** Likely at sudouest.fr domain (referenced in multiple RSS directories)
- **Content Type:** Unknown (requires verification)
- **Update Frequency:** Daily regional, likely multiple updates per day

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Nouvelle-Aquitaine (southwest France: Bordeaux, Toulouse area periphery, Atlantic coast)
- **Strongest Verticals:** Wine/viticulture, surf/coastal sports, Basque country, regional rugby, local governance
- **Editorial Slant:** Neutral/regional pride, focus on quality of life and cultural identity
- **Description:** Major southwestern daily, covers Aquitaine extensively with focus on lifestyle and regional culture

**Image Rights:**
- No specific information found
- Assume standard French copyright requirements apply
- Likely requires attribution for image reuse

**Paywall Status:**
- **Type:** Metered paywall (confirmed in bypass tools research)
- **Fraction Reachable:** Estimated 30-40% freely accessible
- Breaking news and some local coverage free; analysis paywalled

**Politeness and Rate Limits:**
- **robots.txt:** Not verified in this audit
- **Aggregator-Friendly:** Unknown - requires verification
- **Visible Rate Limits:** None identified

**Content Quality Signal:**
- Based on geographic focus and editorial pattern:
- **Estimated Ratio:** 65% local southwest stories, 25% national/wire, 10% lifestyle/wine/gastronomy
- Strong regional identity coverage
- Wine industry and coastal tourism prominent

**Recommendation:**
**ADD as Tier 1**
- Strong southwestern France coverage (fills geographic gap)
- Metered paywall provides access to breaking news
- Good local-content ratio
- REQUIRES verification of RSS feeds and robots.txt before integration

---

### 4. La Voix du Nord

**RSS Availability:**
- **Evidence:** Mentioned in RSS directories and podcast platforms but no direct RSS URL found
- **Content Type:** Unknown
- **Update Frequency:** Daily regional

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Hauts-de-France (Nord-Pas-de-Calais: Lille, northern France, Belgian border region)
- **Strongest Verticals:** Cross-border news (France-Belgium), industrial/mining heritage, local football, social issues
- **Editorial Slant:** Neutral, working-class/industrial focus, founded in WWII Resistance
- **Description:** Part of Belgian Groupe Rossel, strong local identity despite Belgian ownership, covers former industrial heartland

**Image Rights:**
- No specific information found
- Standard French copyright assumed

**Paywall Status:**
- **Type:** Hard paywall (confirmed in French Reddit discussions - "c'est mort")
- **Fraction Reachable:** Very low (<10%), strict subscriber-only access
- French users report paywall bypass tools ineffective ("le serveur ne t'enverra jamais le texte")

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None identified

**Content Quality Signal:**
- Based on northern France focus:
- **Estimated Ratio:** 75% local northern France, 15% national, 10% cross-border Belgium
- Deep local coverage but behind hard paywall

**Recommendation:**
**SKIP**
- **Reason:** Hard paywall makes content largely inaccessible for aggregation
- Even if RSS available, articles require subscription to read full content
- Alternative: Focus on other northern France sources or negotiate direct API access

---

### 5. La Dépêche du Midi

**RSS Availability:**
- **URL:** https://www.ladepeche.fr/rss.xml (confirmed in RSS feed directories)
- **Content Type:** Likely teaser/headline based on paywall presence
- **Update Frequency:** Daily regional, multiple updates

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Occitanie (Toulouse, Midi-Pyrénées region, southern France)
- **Strongest Verticals:** Aerospace (Toulouse Airbus hub), rugby, southwest gastronomy, Pyrenees tourism, regional politics
- **Editorial Slant:** Neutral/regional pride, "journal depuis 1870"
- **Description:** Historic southern daily based in Toulouse, strong aerospace industry coverage, rugby-focused sports section

**Image Rights:**
- No specific terms found
- Assume standard French copyright and attribution requirements

**Paywall Status:**
- **Type:** Soft paywall (Groupe La Dépêche implements paywall per bypass tools documentation)
- **Fraction Reachable:** Estimated 40-50% accessible
- Local breaking news typically free; premium analysis paywalled

**Politeness and Rate Limits:**
- **robots.txt:** Not verified in this audit
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None identified

**Content Quality Signal:**
- Based on Toulouse/Occitanie focus:
- **Estimated Ratio:** 70% local Occitanie stories (Toulouse metro, Pyrenees, aerospace), 20% national wire, 10% lifestyle/gastronomy
- Strong aerospace/tech vertical - unique among regional dailies
- Deep rugby coverage at club level

**Recommendation:**
**ADD as Tier 1**
- Excellent Occitanie/Toulouse coverage (fills southern France gap)
- Confirmed RSS feed available
- Aerospace industry vertical unique value
- Soft paywall allows good content access
- VERIFY robots.txt and RSS content format before deployment

---

### 6. La Provence

**RSS Availability:**
- **Evidence:** Mentioned in RSS directories (Atlas flux, PACA regional feeds) but no direct URL confirmed
- **Content Type:** Unknown
- **Update Frequency:** Daily regional

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Provence-Alpes-Côte d'Azur (PACA: Marseille, Aix-en-Provence, Côte d'Azur)
- **Strongest Verticals:** Marseille crime/faits divers, Mediterranean news, tourism, OM (Olympique de Marseille) football, regional culture
- **Editorial Slant:** Neutral, Marseille-centric worldview
- **Description:** PACA region's major daily, Marseille headquarters, strong local identity

**Image Rights:**
- No information found
- Standard French copyright assumed

**Paywall Status:**
- **Type:** Unknown - requires investigation
- **Fraction Reachable:** Unknown

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None identified

**Content Quality Signal:**
- Based on Marseille/PACA geography:
- **Estimated Ratio:** 70% PACA regional (Marseille-heavy), 20% national, 10% Mediterranean/Corsica
- High faits divers (crime) coverage - Marseille known for this
- OM football obsession = significant sports vertical

**Recommendation:**
**INVESTIGATE FURTHER**
- **What's Missing:**
  - Confirmed RSS feed URL
  - Paywall status
  - robots.txt verification
  - Sample article quality assessment
- **Potential Value:** High - fills critical Marseille/PACA gap
- **Next Steps:** Allocate 20 minutes to locate RSS, test access, sample headlines

---

### 7. Nice-Matin

**RSS Availability:**
- **Evidence:** Listed in Atlas flux RSS directories for Nice-Matin and PACA region
- **URL:** Likely at nicematin.com domain but not confirmed
- **Content Type:** Unknown
- **Update Frequency:** Daily regional

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Alpes-Maritimes (Nice, Côte d'Azur, French Riviera, Monaco border)
- **Strongest Verticals:** Tourism, Côte d'Azur lifestyle, Monaco/Monte Carlo spillover news, crime, seasonal events (Cannes Film Festival, Nice Carnival)
- **Editorial Slant:** Neutral, tourism-positive, affluent region perspective
- **Description:** Focuses on French Riviera, daily coverage of Nice metropolitan area, strong cultural events calendar

**Image Rights:**
- No information found
- Standard French copyright assumed

**Paywall Status:**
- **Type:** Unknown
- **Fraction Reachable:** Unknown

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on Côte d'Azur focus:
- **Estimated Ratio:** 65% Alpes-Maritimes local (Nice, Cannes, Antibes), 25% tourism/lifestyle, 10% national wire
- High seasonal variation (summer tourism spike)
- Monaco spillover coverage
- Wealthy-region perspective (real estate, luxury retail)

**Recommendation:**
**ADD as Tier 2**
- Fills Côte d'Azur geographic niche
- Tourism vertical valuable for lifestyle content
- Complements La Provence's Marseille focus
- REQUIRES RSS feed confirmation and content testing

---

### 8. Le Progrès (Lyon)

**RSS Availability:**
- **URL:** http://www.leprogres.fr/[section]/rss (dynamic RSS: add /rss to any page URL)
- **Example:** http://www.leprogres.fr/haute-loire/aurec-sur-loire/rss
- **Content Type:** Likely full or substantial excerpts based on flexible RSS architecture
- **Update Frequency:** High (daily regional with continuous updates)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Auvergne-Rhône-Alpes (Lyon metro, Rhône department, Saint-Étienne, regional coverage)
- **Strongest Verticals:** Lyon city news, OL (Olympique Lyonnais) football, Rhône Valley wine, pharmaceutical/biotech (Lyon hub), Auvergne rural news
- **Editorial Slant:** Neutral/centrist, Lyon-centric, part of Centre France group
- **Description:** Major Lyon daily, strong local identity, covers France's third-largest metro area extensively

**Image Rights:**
- No specific terms found
- Standard French copyright assumed

**Paywall Status:**
- **Type:** Freemium (confirmed in Reuters paywall study: "2 free articles" model)
- **Fraction Reachable:** Estimated 20-40% accessible
- Breaking local news often free; analysis and archives paywalled

**Politeness and Rate Limits:**
- **robots.txt:** Not verified in this audit
- **Aggregator-Friendly:** Unknown but dynamic RSS suggests some openness
- **Visible Rate Limits:** None identified

**Content Quality Signal:**
- Based on Lyon/Rhône-Alpes coverage and flexible RSS:
- **Estimated Ratio:** 75% Lyon-Rhône local stories, 15% Auvergne/regional, 10% national wire
- Very strong hyperlocal signal with commune-level RSS feeds
- Deep Lyon metro coverage (200K+ metro population)

**Recommendation:**
**ADD as Tier 1** - HIGH PRIORITY
- Excellent Lyon/Rhône-Alpes coverage (major metro area)
- Dynamic RSS system allows granular content sourcing
- Strong local-France signal
- Fills eastern-central France geographic gap
- VERIFY robots.txt before deployment

---

### 9. Dernières Nouvelles d'Alsace (DNA)

**RSS Availability:**
- **Evidence:** Listed extensively in Atlas flux RSS directories for Alsace
- **URL:** Likely at dna.fr domain but not directly confirmed
- **Content Type:** Unknown
- **Update Frequency:** Daily regional

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Alsace (Strasbourg, Mulhouse, Colmar, Rhine border region)
- **Strongest Verticals:** Franco-German border news, European Parliament (Strasbourg), Alsatian culture/language, wine, cross-border commuter issues
- **Editorial Slant:** Neutral, regional pride, bilingual cultural heritage
- **Description:** Alsace's major daily, founded 1877, German name (Straßburger Neueste Nachrichten) until WWI, strong European/cross-border focus

**Image Rights:**
- No information found
- Standard French copyright assumed

**Paywall Status:**
- **Type:** Unknown
- **Fraction Reachable:** Unknown

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on Alsace/European focus:
- **Estimated Ratio:** 70% Alsace local (Strasbourg metro, Rhine border), 20% European institutions/cross-border, 10% national
- Unique European Parliament coverage (Strasbourg sessions)
- Franco-German bilingual content possible
- Cross-border commuter news (Basel, Germany)

**Recommendation:**
**ADD as Tier 2**
- Fills critical eastern France (Alsace) geographic gap
- Unique European institutions vertical
- Franco-German cross-border coverage valuable
- REQUIRES RSS confirmation and paywall/robots.txt verification

---

### 10. L'Est Républicain

**RSS Availability:**
- **Evidence:** Mentioned in RSS directories, affiliated with Le Républicain Lorrain
- **URL:** https://www.estrepublicain.fr/[section] structure likely
- **Content Type:** Unknown
- **Update Frequency:** Daily regional

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Grand Est (Lorraine, Franche-Comté: Nancy, Metz, Besançon, Luxembourg border)
- **Strongest Verticals:** Cross-border (Luxembourg, Germany), industrial/steel heritage, military (numerous bases), Vosges tourism
- **Editorial Slant:** Neutral, industrial working-class heritage
- **Description:** Part of EBRA group, covers former industrial heartland, shares content with regional sister papers

**Image Rights:**
- No specific information
- Standard French copyright assumed

**Paywall Status:**
- **Type:** Unknown
- **Fraction Reachable:** Unknown

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on Lorraine/Franche-Comté focus:
- **Estimated Ratio:** 70% Grand Est local, 20% cross-border (Luxembourg), 10% national
- Strong industrial heritage coverage
- Military base news (numerous NATO/French bases)
- Cross-border worker news (Luxembourg financial sector)

**Recommendation:**
**ADD as Tier 2**
- Fills Grand Est (Lorraine) geographic gap
- Cross-border Luxembourg coverage unique
- Complements DNA's Alsace focus
- REQUIRES RSS feed URL confirmation and content testing

---

### 11. La Montagne

**RSS Availability:**
- **Evidence:** Mentioned in RSS directories, Centre France group publication
- **URL:** Likely exists but not confirmed
- **Content Type:** Unknown
- **Update Frequency:** Daily regional

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Auvergne-Limousin (Clermont-Ferrand, Massif Central, Limoges)
- **Strongest Verticals:** Rural/agricultural news, Massif Central tourism, Michelin (Clermont-Ferrand), Vulcania science park, volcanic Auvergne
- **Editorial Slant:** Center-left (socialist founding by Alexandre Varenne 1919), rural perspective
- **Description:** Covers Auvergne extensively, rural France voice, volcanic terrain/tourism focus, Centre France group flagship

**Image Rights:**
- No information found
- Standard French copyright assumed

**Paywall Status:**
- **Type:** Unknown
- **Fraction Reachable:** Unknown

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on Auvergne/Massif Central geography:
- **Estimated Ratio:** 75% Auvergne-Limousin local (Clermont-Ferrand, rural communes), 15% agricultural/rural France, 10% national
- Very strong rural France coverage (rare among dailies)
- Agricultural sector deeply covered
- Volcanic tourism vertical (Puy-de-Dôme, Vulcania)

**Recommendation:**
**ADD as Tier 2**
- Critical rural France coverage - fills major content gap
- Agricultural news vertical valuable
- Auvergne geographic coverage
- STRONG rural-France signal missing from other sources
- REQUIRES RSS confirmation and testing

---

### 12. 20 Minutes

**RSS Availability:**
- **URL:** Multiple RSS feeds available (confirmed in RSS directories)
- **Dynamic RSS:** https://partner-feeds.20min.ch/rss/20minutes/[section] format (Swiss but shared infrastructure)
- **French feeds:** https://www.20minutes.fr/[section] structure likely
- **Content Type:** Likely full headlines with teasers (free commuter model)
- **Update Frequency:** Very high (continuous free news model, optimized for mobile/commuters)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** National with local editions (Paris, Lyon, Marseille, Bordeaux, Toulouse, Strasbourg, Lille, Nantes)
- **Strongest Verticals:** Faits divers (crime/oddities), lifestyle, entertainment, quick-read news, social media viral content
- **Editorial Slant:** Neutral/populist, "news snacking" approach, commuter-optimized
- **Description:** Free daily newspaper (print+digital), aimed at commuters, part of Tamedia group, rapid-fire short articles, very mobile-friendly

**Image Rights:**
- No specific terms found
- Likely uses wire service images (AFP) with watermarks
- og:image likely usable with attribution

**Paywall Status:**
- **Type:** Free (ad-supported model)
- **Fraction Reachable:** 100% - entirely free access
- Monetization via advertising, not subscriptions

**Politeness and Rate Limits:**
- **robots.txt:** Allows "User-agent: *" with specific path exclusions
- Blocks AI indexing bots (GPTBot, ClaudeBot, PerplexityBot, anthropic-ai) but allows ChatGPT-User for search
- **Aggregator-Friendly:** Yes - general aggregators explicitly allowed
- **Visible Rate Limits:** Crawl-delay: 2 seconds for grapeshot bot

**Content Quality Signal:**
- Based on free commuter model and "news snacking" approach:
- **Estimated Ratio:** 45% local-France stories (city editions), 30% national viral/social media, 25% lifestyle/entertainment filler
- Moderate local-France signal but high volume compensates
- "Quick read" format = short articles (200-400 words typical)
- Strong faits divers coverage across all local editions

**Recommendation:**
**ADD as Tier 1** - HIGH PRIORITY
- Free access (no paywall friction)
- Robots.txt explicitly aggregator-friendly
- Multiple local city editions increase local-France coverage
- Very high update frequency (continuous news)
- Good balance of local + viral content (Facebook engagement potential)
- Short article format ideal for social media sharing
- READY FOR IMMEDIATE INTEGRATION

---

### 13. France Bleu (ici)

**RSS Availability:**
- **Status:** Partial/varies by individual station
- **Network:** 44 regional radio stations across France, recently rebranded to "ici" (January 2025)
- **Content Type:** Radio transcripts, text articles on regional websites
- **Update Frequency:** Continuous (radio + web updates)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** All French regions (44 stations: ici Paris Île-de-France, ici Bretagne, ici Provence, etc.)
- **Strongest Verticals:** Hyperlocal breaking news, weather, traffic, local sports (football, rugby at club level), culture, community events
- **Editorial Slant:** Neutral, public service mission, hyperlocal focus, community-oriented
- **Description:** Public radio network (Radio France), rebranded January 2025 to "ici" (meaning "here"), collaborates with France 3 TV on regional news, hyperlocal mission

**Image Rights:**
- Public broadcasting content
- Likely more permissive than commercial press
- May have Creative Commons or open license for some content
- Requires verification of specific terms

**Paywall Status:**
- **Type:** Free (public service broadcasting)
- **Fraction Reachable:** 100%

**Politeness and Rate Limits:**
- **robots.txt:** Not verified (likely aggregator-friendly as public service)
- **Aggregator-Friendly:** Likely yes
- **Visible Rate Limits:** None expected

**Content Quality Signal:**
- Based on hyperlocal public radio mission:
- **Estimated Ratio:** 85% hyperlocal France (département/city level), 10% regional news, 5% national context
- HIGHEST local-France signal of any source reviewed
- Breaking news alerts at commune level
- Weather, traffic, school closures, local sports results
- Community calendar events

**Recommendation:**
**ADD as Tier 2** - HIGH VALUE but TECHNICAL CHALLENGES
- **Pros:**
  - Highest hyperlocal signal available
  - Free public service content
  - 44 regional stations = comprehensive France coverage
  - Breaking local news strength
- **Cons:**
  - RSS availability fragmentary (44 separate stations)
  - Recently rebranded (ici) - infrastructure may be in flux
  - Radio content requires text conversion/transcription
  - Requires individual integration per station (high setup cost)
- **Recommendation:** Start with 3-5 largest stations (ici Paris, ici Provence, ici Bretagne) to test model, expand if successful

---

## TIER 2 — LIFESTYLE / FIERTÉ FRANÇAISE / REEL-SOURCE

### 14. Le Bonbon

**RSS Availability:**
- **Status:** Unknown - not found in research
- **Content Type:** Likely social media-first (Instagram/TikTok native)
- **Update Frequency:** High (digital-native "good vibes" media)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Paris, Lyon, Marseille, Bordeaux editions (13 European cities total)
- **Strongest Verticals:** Food/restaurants, culture (concerts, exhibits), nightlife, shopping, "bons plans" (deals), local discoveries
- **Editorial Slant:** Positive/"good vibes", lifestyle-optimized, millennial/Gen Z target
- **Description:** "Média good vibes ultra-local" - digital lifestyle media focusing on local discoveries, food, culture, and events in French cities

**Image Rights:**
- Unknown - likely uses own photography and user-generated content
- May be more flexible than traditional press

**Paywall Status:**
- **Type:** Free (ad-supported)
- **Fraction Reachable:** 100%

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on lifestyle focus:
- **Estimated Ratio:** 10% genuine local news, 20% local business/restaurant coverage, 70% lifestyle listicles ("top 10 brunch spots")
- Low hard-news signal but high "fierté française" (local pride) content
- Reel-source potential: short video content, Instagram-native
- Restaurant/food vertical very strong

**Recommendation:**
**ADD as Tier 2** - LIFESTYLE/REEL SUPPLEMENT
- Good for lifestyle balance (food, culture, local pride)
- Multiple city editions add local flavor
- Strong Reel/short-video potential
- Low hard-news value but high engagement potential
- REQUIRES RSS discovery or alternative integration method (API, scraping)

---

### 15. TimeOut Paris

**RSS Availability:**
- **Status:** No native RSS; third-party RSS generators available (rss.app, FeedSpot)
- **Content Type:** Listings, event guides, restaurant reviews
- **Update Frequency:** Moderate (weekly event guides + daily updates)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** Paris exclusively (TimeOut has other French cities but Paris is primary)
- **Strongest Verticals:** Restaurants, theatre, events, nightlife, tourism, "things to do," cultural calendar
- **Editorial Slant:** Neutral, consumer/tourism-oriented, English-language brand (French edition exists)
- **Description:** International listings magazine, Paris edition focuses on events/culture/dining, tourism perspective, affluent audience

**Image Rights:**
- Commercial entity (Lagardère partnership)
- Likely restrictive - commercial photography
- Probably NOT open for aggregation without licensing

**Paywall Status:**
- **Type:** Free (ad + affiliate revenue model)
- **Fraction Reachable:** 100%

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown, likely restrictive given commercial nature
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on listings/events focus:
- **Estimated Ratio:** 5% news, 30% event listings/calendar, 65% evergreen content (guides, "best of" lists)
- Very low local-news signal
- High tourism/lifestyle content
- Mostly evergreen, not time-sensitive

**Recommendation:**
**SKIP**
- **Reasons:**
  - Minimal local-news value (event listings ≠ news)
  - Requires third-party RSS generator (fragile)
  - English-language bias
  - Tourism perspective, not local-France perspective
  - Better alternatives: Le Bonbon (French, more local), Sortir à Paris platforms
- **Alternative:** If lifestyle calendar needed, integrate dedicated event APIs (e.g., SortiraParis, OfficeDuTourisme)

---

### 16. Demotivateur

**RSS Availability:**
- **Status:** Unknown - not confirmed in research
- **Content Type:** Likely social media-first (Facebook, Instagram native)
- **Update Frequency:** Very high (viral content mill)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** France-wide but not geographically focused
- **Strongest Verticals:** Viral content, food/recipes (Demotivateur Food), feel-good stories, listicles, memes, social issues (viral angle)
- **Editorial Slant:** Populist, feel-good/uplifting, social media optimized
- **Description:** French viral content media (4M+ Facebook likes for Demotivateur Food alone), focuses on shareable, emotional content, recipes, and positive/quirky stories

**Image Rights:**
- Likely uses mix of own content and aggregated social media content
- Terms unknown

**Paywall Status:**
- **Type:** Free (ad-supported social media business model)
- **Fraction Reachable:** 100%

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on viral content focus:
- **Estimated Ratio:** 5% local-France news, 15% social issue stories (viral angle), 80% lifestyle/food/listicle/feel-good filler
- Very low hard-news signal
- High "fierté française" content (French culture, traditions, food pride)
- Recipe/food content very strong (separate Demotivateur Food brand)

**Recommendation:**
**INVESTIGATE FURTHER**
- **Potential Value:**
  - High engagement/shareability (proven social media success)
  - Food/recipe vertical strong (French gastronomy = fierté)
  - Feel-good content balances hard news
- **Concerns:**
  - Very low news value (mostly viral fluff)
  - May dilute serious news brand
  - RSS availability unclear
- **Decision Point:** If FranceAujourdhui wants viral/engagement content, ADD as Tier 2. If focus is news integrity, SKIP.

---

### 17. Konbini

**RSS Availability:**
- **Status:** Limited - Reddit mentions RSS bridge tools required (https://github.com/RSS-Bridge/rss-bridge)
- **Content Type:** Multimedia (video-heavy), articles, social media posts
- **Update Frequency:** Very high (digital-native, continuous content)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** France (Paris HQ) with international editions (London, NYC, Mexico, Lagos)
- **Strongest Verticals:** Youth culture, music, fashion, social issues (youth angle), viral videos, pop culture, climate activism
- **Editorial Slant:** Progressive/left, youth-oriented (millennials/Gen Z), diversity focus, Snapchat Discover partner
- **Description:** Founded 2008, multimedia digital publisher, 60M unique visitors/year, ~100 staff, focuses on "news, culture, entertainment" for young global audience, strong video content

**Image Rights:**
- Likely own content + licensed/user-generated
- Commercial entity - terms likely restrictive

**Paywall Status:**
- **Type:** Free (ad-supported, branded content partnerships)
- **Fraction Reachable:** 100%

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** Unknown, likely restrictive given commercial video content
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on youth culture focus and Snapchat pivot:
- **Estimated Ratio (2019+):** 50% hard news (youth angle: climate, protests, social issues), 30% pop culture, 20% lifestyle/entertainment
- Shifted from pure pop culture to more news post-2019 (Snapchat Discover strategy)
- Strong video/visual storytelling
- Youth perspective on serious issues (Algerian protests, Mosul tour, climate demos)

**Recommendation:**
**ADD as Tier 2** - YOUTH ENGAGEMENT
- **Pros:**
  - Youth demographic engagement
  - Social issues covered from millennial/Gen Z angle
  - Strong video/Reel content
  - International perspective with French base
  - Climate activism and protest coverage (fills gap)
- **Cons:**
  - RSS requires bridge tool (technical fragility)
  - Video-heavy (may not translate to text-based aggregation)
  - International focus dilutes local-France content
- **Use Case:** Add for social issues, youth protest coverage, and video content IF technical integration viable via RSS bridge

---

### 18. Brut

**RSS Availability:**
- **URL:** https://www.brut.media/fr/flux-rss (CONFIRMED multiple RSS feeds by topic)
- **Feeds:** France politique & société, International, Environnement, Santé, Sport, Technologie, Économie
- **Terms:** "L'utilisation des flux RSS du site Brut.media est exclusivement réservée à un usage personnel. Toute autre utilisation nécessite une autorisation spécifique."
- **Content Type:** Video + article metadata (Brut is 100% video media)
- **Update Frequency:** Very high (continuous video publication)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** France (100% French content) with some international coverage
- **Strongest Verticals:** Politics, society, environment, social issues, explainer videos, investigative shorts, "stories without filters"
- **Editorial Slant:** Progressive/left, activist-friendly, diversity focus, video journalism
- **Description:** "Le média 100% vidéo" - entirely video-based news media (no text articles), founded for social media platforms (Facebook, Instagram, Snapchat), focuses on short-form explanatory and investigative video journalism, acquired by CMA Media (CMA CGM shipping group) 2025

**Image Rights:**
- Brut owns its video content
- RSS is personal use only - commercial aggregation REQUIRES authorization
- Thumbnails/og:image likely restricted

**Paywall Status:**
- **Type:** Free (ad-supported, social media native)
- **Fraction Reachable:** 100%

**Politeness and Rate Limits:**
- **robots.txt:** Not verified
- **Aggregator-Friendly:** NO - RSS personal use only, commercial use requires authorization
- **Visible Rate Limits:** None specified

**Content Quality Signal:**
- Based on video journalism focus and topic categories:
- **Estimated Ratio:** 60% French politics/society, 30% international/environment, 10% lifestyle/sport
- Strong investigative video shorts
- Social issue deep dives
- Explainer format (educational)
- **Challenge:** 100% video = difficult to aggregate as text-based news

**Recommendation:**
**NEGOTIATE - Authorization Required**
- **Pros:**
  - Excellent French politics/society coverage
  - High engagement video format (Reel-friendly)
  - Strong investigative journalism
  - Free content, well-produced
  - RSS feeds available and categorized
- **Cons:**
  - RSS personal use only - MUST negotiate commercial license
  - 100% video = aggregation requires video embedding (not text excerpts)
  - May not fit text-heavy Facebook page format
- **Decision:** IF FranceAujourdhui wants to include video posts and can negotiate commercial RSS license, ADD as Tier 1 video source. Otherwise, SKIP until licensing resolved.

---

### 19. Reporterre

**RSS Availability:**
- **URL:** https://reporterre.net/spip.php?page=backend-simple (CONFIRMED open RSS)
- **Terms:** Free, open access (independent non-profit journalism)
- **Content Type:** Full articles or substantial excerpts
- **Update Frequency:** Daily (independent media, smaller team)

**NewsAPI Coverage:**
- **Indexed:** No
- **Source ID:** N/A

**Geographic / Topic Focus:**
- **Primary Region:** France-wide (Paris-based but covers national environmental issues)
- **Strongest Verticals:** ECOLOGY - climate, biodiversity, pollution, agriculture, environmental activism, social-ecology, anti-nuclear, renewable energy, environmental justice
- **Editorial Slant:** Progressive/left, pro-environment, activist journalism, independent
- **Description:** "Independent non-profit media organisation dedicated to ecology in all its forms" - specialist environmental journalism, professional team, covers climate/ecology from activist-adjacent perspective, well-respected in French environmental circles

**Image Rights:**
- Independent non-profit
- Likely more permissive than commercial press
- May use Creative Commons or allow attribution-based reuse
- Requires verification but historically aggregator-friendly

**Paywall Status:**
- **Type:** Free (donation-supported independent journalism)
- **Fraction Reachable:** 100%

**Politeness and Rate Limits:**
- **robots.txt:** Not verified but likely aggregator-friendly (open mission)
- **Aggregator-Friendly:** Yes (open RSS, non-profit model suggests openness)
- **Visible Rate Limits:** None

**Content Quality Signal:**
- Based on environmental focus:
- **Estimated Ratio:** 70% French environmental stories (local pollution, agriculture, protests), 20% European/global climate context, 10% environmental activism/civil society
- High local-France environmental coverage (unique niche)
- Agriculture/rural environmental issues deeply covered
- Climate protest and activist movement coverage
- Nuclear energy debates (France-specific)

**Recommendation:**
**ADD as Tier 1** - IMMEDIATE PRIORITY
- **Pros:**
  - FREE, open RSS (no licensing barrier)
  - 100% accessible content
  - Unique environmental vertical (no other source covers this depth)
  - Strong French agriculture/rural environmental stories (fills gap)
  - Professional journalism (not amateur blog)
  - Climate crisis = major ongoing story (high relevance)
  - Likely aggregator-friendly terms
- **Cons:**
  - Niche focus (only ecology) - less general news
  - Progressive bias may not appeal to all audiences
  - Smaller team = lower article volume than dailies
- **Assessment:** Highest value-to-friction ratio of any source reviewed. READY FOR IMMEDIATE INTEGRATION.

---

## ADDITIONAL SOURCES TO INVESTIGATE

Based on gap analysis, the following five sources would strengthen FranceAujourdhui's coverage in underserved niches:

### 1. **Actu.fr** - Hyper-local Breaking News (City-Level)

**Description:** Digital local news network covering ~100 French cities (Bordeaux, Lille, Lyon, Marseille, Nice, Grenoble, Saint-Étienne, Montpellier, Nantes, and dozens more)

**Why Add:**
- True hyperlocal coverage at city/commune level (similar to Patch.com model in US)
- Fills gap left by regional dailies (city-specific vs. regional)
- "Single application to follow live news near you" - continuous local updates
- Covers cities not well-served by Tier 1 regional sources

**Estimated Coverage:**
- 90% hyperlocal city news (crime, local politics, events)
- 5% regional context
- 5% viral/national

**RSS:** Likely available (digital-native platform)

**Paywall:** Unknown - likely freemium or ad-supported

**Recommendation:** HIGH PRIORITY - investigate RSS, paywall, content quality. Could be game-changer for hyperlocal coverage.

---

### 2. **Terre-net / Web-agri** - Agricultural / Rural-France Stories

**Description:** Leading French agricultural information portal - market prices, farming news, machinery, livestock, crop guidance, agricultural policy

**Why Add:**
- Agriculture is massive French sector but underserved in news
- Rural France perspective (20% of population)
- Farmer/producer perspective on food, climate, EU policy
- Strong "fierté française" angle (French agriculture heritage)

**Estimated Coverage:**
- 85% agricultural sector news (markets, policy, technology, weather)
- 10% rural community news
- 5% food/gastronomy context

**RSS:** Unknown but likely (agricultural press often has RSS for market updates)

**Paywall:** Unknown - likely free or freemium (information service for farmers)

**Recommendation:** INVESTIGATE - unique vertical, strong French identity, fills rural gap. Low news volume but high niche value.

---

### 3. **Bondy Blog** - Banlieue / Urban-Social Stories

**Description:** "Media whose objective is to tell the story of working-class neighborhoods and make their voices heard in the national debate" - founded during 2005 banlieue riots, covers Paris suburbs and French urban social issues

**Why Add:**
- Banlieue perspective absent from mainstream media
- Social justice, immigration, police relations, urban poverty
- Youth voice from quartiers populaires
- Counter-narrative to mainstream Paris-centric coverage
- "Revenge is interviewing families of youth accused of crimes, not just taking police's word"

**Estimated Coverage:**
- 80% banlieue/quartiers populaires stories (social issues, youth, policing, culture)
- 15% French immigration/integration debates
- 5% cultural/cinema from suburban perspective

**RSS:** Unknown - likely exists (blog format)

**Paywall:** Free (association 1901 non-profit, donor/grant supported)

**Recommendation:** HIGH VALUE for diversity of perspective. Fills critical gap in banlieue coverage. Investigate RSS availability.

---

### 4. **L'Équipe** - Regional Football and Rugby

**Description:** France's #1 sports daily - while national in scope, covers regional football (Ligue 2, National leagues) and rugby extensively

**Why Add:**
- Sport is massive cultural force in France
- Regional football clubs have huge local followings
- Rugby coverage (especially southwest France) = local news
- Sport provides "softer" news to balance hard news

**Estimated Coverage:**
- 40% national sport (Ligue 1, French national teams)
- 35% regional/local sport (Ligue 2, National, regional rugby)
- 15% international sport
- 10% sport business/politics

**RSS:** Likely available (major publisher)

**Paywall:** Unknown - likely freemium

**Recommendation:** ADD for regional sports coverage IF RSS available. Sports engagement drives Facebook traffic. Complements hard news.

---

### 5. **Midi Libre** - Additional Occitanie Coverage

**Description:** Regional daily based in Montpellier, covers Occitanie (complements La Dépêche's Toulouse focus)

**Why Add:**
- Geographic overlap with La Dépêche but different city base (Montpellier vs. Toulouse)
- Mediterranean coast coverage (Sète, Nîmes, Béziers)
- Fills coastal Occitanie vs. inland Occitanie
- Cycling culture (organizes Grand Prix du Midi Libre since 1949)

**Estimated Coverage:**
- 75% Hérault/Gard/coastal Occitanie local news
- 15% regional Occitanie
- 10% national wire

**RSS:** Confirmed available (midilibre.fr/rss.xml in RSS directories)

**Paywall:** Unknown - likely metered

**Recommendation:** ADD as Tier 2 IF La Dépêche proves insufficient for Occitanie coverage. Provides Mediterranean coastal angle.

---

## IMPLEMENTATION PRIORITIES

### Immediate Integration (Ready Now)
1. **20 Minutes** - Free, aggregator-friendly, multiple local editions
2. **Reporterre** - Free, open RSS, unique environmental vertical
3. **Le Parisien** - Confirmed aggregator-friendly, strong Paris metro coverage

### High Priority (Requires Licensing Negotiation)
4. **Ouest-France** - Best regional coverage but requires commercial RSS license
5. **Le Progrès** - Lyon coverage, dynamic RSS system

### Tier 2 Additions (After Tier 1 Established)
6. **La Dépêche du Midi** - Toulouse/Occitanie
7. **Sud Ouest** - Bordeaux/southwest
8. **DNA (Dernières Nouvelles d'Alsace)** - Alsace/Strasbourg
9. **France Bleu (ici)** - Start with 3-5 largest stations for hyperlocal breaking news

### Negotiate or Skip
10. **Brut** - Excellent content but requires commercial authorization (personal use only RSS)
11. **La Voix du Nord** - SKIP due to hard paywall

### Further Investigation Required (20 min each)
12. **La Provence** - Marseille/PACA critical but missing RSS/paywall data
13. **Actu.fr** - Potential game-changer for hyperlocal but needs full evaluation
14. **Bondy Blog** - Unique banlieue perspective, check RSS

---

## TECHNICAL NOTES

### RSS Licensing Challenge
**CRITICAL FINDING:** Most French regional press RSS feeds are "personal use only" and require commercial licensing for aggregation. This applies to:
- Ouest-France (explicit)
- Brut (explicit)
- Likely others not yet investigated

**Recommended Action:**
- Consult French media law specialist
- Consider:
  1. Negotiating bulk licensing with press groups (SIPA Ouest-France, EBRA group, etc.)
  2. Using NewsAPI or similar commercial news APIs (though French regional coverage appears weak)
  3. Direct content partnerships with select publishers
  4. Fair use exemption for headline+link aggregation (requires legal review)

### robots.txt Patterns
- **Aggregator-friendly:** 20 Minutes, Le Parisien, Ouest-France (select bots)
- **Likely restricted:** Most sources not verified
- **Recommendation:** Verify robots.txt for ALL sources before scraping

### Paywall Patterns
- **Free:** 20 Minutes, Reporterre, Brut, Konbini, Le Bonbon
- **Freemium:** Ouest-France (~20-30% free), Le Progrès
- **Metered:** Le Parisien (13 free/month), Sud Ouest, La Dépêche du Midi
- **Hard:** La Voix du Nord (skip)

### Image Rights Summary
- **French Law:** Photographer attribution required, commercial reuse restricted
- **Aggregation Practice:** og:image with source attribution generally tolerated but verify each source's ToS
- **Watermarks:** Expect AFP/Getty watermarks on national/international stories
- **Recommendation:** Generate own images for posts OR negotiate image licensing separately

---

## CONCLUSION

The audit identified strong candidates to dramatically improve FranceAujourdhui's local-France coverage:

**Immediate wins:** 20 Minutes, Reporterre, Le Parisien provide free/accessible content with aggregator-friendly policies.

**High-value but complex:** Ouest-France, Le Progrès, La Dépêche require licensing negotiation but offer best regional depth.

**Niche strengths:** Reporterre (environment), France Bleu (hyperlocal radio), Bondy Blog (banlieue) fill specific gaps unavailable elsewhere.

**Critical next step:** Legal review of RSS aggregation rights and negotiation strategy with French press groups.

---

**End of Audit**  
*Document prepared by: Research Team*  
*Date: May 18, 2026*
