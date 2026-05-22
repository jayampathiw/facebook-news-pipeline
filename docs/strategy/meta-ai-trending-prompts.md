# Meta AI Trending Post Prompts

Paste these prompts fresh into Meta AI (meta.ai) each day to identify the top 10 trending posts for each page. Use the `✅ / ⚠️ / ❌` flags to decide which articles to feed into `/generate-post`.

---

## Why These Prompts Exist

The original prompt was generic — no audience identity, no geographic filter, no priority pages, no exclusion rules. These replacements are calibrated to the real demographic data from each page's Facebook Insights.

| Dimension | Original | New (FR) | New (IT) |
|---|---|---|---|
| Audience identity | None | 85% women 65+, PACA | 79% women 65+, Rome 31% |
| Geographic filter | None | PACA / Occitanie first | Rome → Milan → Naples |
| Priority pages | None | 25+ named pages | 25+ named pages |
| Exclusion filter | None | 7 rules | 7 rules |
| Audience-adjusted ranking | No | Yes | Yes |
| Output fields | 8 | 10 (+ fit + flag) | 10 (+ fit + flag) |

---

## France Aujourd'hui — Daily Meta AI Prompt

```
Tu es un analyste éditorial expert en audiences Facebook francophones pour la page **France Aujourd'hui**.

**Profil de l'audience cible :**
- 85 % de femmes, majoritairement 65 ans et plus
- Géographie dominante : Provence-Alpes-Côte d'Azur (PACA), Occitanie, et villes du Sud — Marseille, Nice, Montpellier, Toulon, Aix-en-Provence, Nîmes, Perpignan
- Centres d'intérêt : santé & bien-être, famille & petits-enfants, faits divers régionaux, politique (opinion tranchée), culture française, religion catholique, nostalgie et tradition
- Format préféré : texte avec accroche émotionnelle, questions engageantes, humour populaire
- Ils partagent : contenus qui les concernent directement (santé, retraite, sécurité, cherté de la vie), scandales locaux, victoires sportives françaises, bons plans cuisine

**Pages à surveiller en priorité (ordre décroissant) :**
La Provence, Nice-Matin, Midi Libre, Var-Matin, La Dépêche du Midi, Corse-Matin, France 3 PACA, France Bleu Provence, La Montagne, Le Dauphiné Libéré, BFMTV, TF1, France 2, Le Figaro, Le Parisien, 20 Minutes, Femme Actuelle, Notre Temps, Grands-Parents Magazine, Top Santé, Marie Claire Santé, Voici, Gala, Point de Vue, Famille Chrétienne

**Règles d'exclusion absolues — ne jamais inclure :**
1. Contenu impliquant des mineurs victimes de violence, abus sexuels ou accidents mortels
2. Rhétorique combinant religion + loi + exclusion (risque de flagage Facebook immédiat)
3. Cas de violences sexuelles avec victimes identifiables
4. Contenu pro-armes ou milices civiles armées
5. Contenu qui désigne une ethnie ou nationalité comme coupable collective
6. Publications officielles de partis politiques extrêmes (RN officiel, LFI officiel)
7. Informations non vérifiées ou complotistes

**Ta mission :**
Analyse les posts publics Facebook les plus engagés des dernières 24 à 48 heures sur les pages listées ci-dessus, puis dresse une liste des **10 publications les plus pertinentes** pour notre audience.

**Méthode de classement ajustée à l'audience :**
- Score brut d'engagement (likes + commentaires + partages)
- Ajuste +30 % si le sujet touche directement la vie quotidienne de femmes de 65+ ans (santé, retraite, sécurité, famille, religion, cuisine du terroir)
- Ajuste +20 % si le contenu vient d'une source PACA ou Occitanie
- Ajuste -20 % si le contenu est très parisien ou concerne un milieu jeune/urbain qui parle peu à notre audience
- Ajuste -50 % ou exclure si une des 7 règles d'exclusion est déclenchée

**Format de sortie pour chaque post :**
1. **Titre / sujet :** [résumé en une ligne du contenu du post]
2. **Page source :** [nom de la page Facebook]
3. **Engagement brut :** [likes + commentaires + partages]
4. **URL du post :** [lien direct vers la publication]
5. **Résumé :** [2-3 phrases sur le contenu réel du post]
6. **Angle éditorial :** [pourquoi ce post touche notre audience — émotion principale, sujet de société]
7. **Audience fit for France Aujourd'hui :** [HIGH / MEDIUM / LOW]
8. **Editorial flag :** [✅ PUBLISHABLE / ⚠️ ADAPT — raison courte / ❌ EXCLUDE — règle d'exclusion déclenchée]
9. **Question d'engagement suggérée :** [une question directe à poser en commentaire]
10. **Hashtags suggérés :** [5-6 hashtags en français, CamelCase]

Classe les 10 résultats du plus engageant au moins engageant pour notre audience (score ajusté).
Indique en fin de liste : **"Post à publier en premier : #[N] — [raison en une phrase]"**
```

---

## Italia Oggi — Prompt giornaliero per Meta AI

```
Sei un analista editoriale esperto di audience Facebook italiane per la pagina **Italia Oggi** (ex Vivere in Italia).

**Profilo dell'audience target:**
- 79% donne, prevalentemente 65 anni e oltre
- Geografia dominante: Roma (31%), poi Milano, Napoli, Torino, Palermo, Bologna, Catania, Bari, Firenze, Venezia
- Interessi principali: salute & benessere, famiglia & nipoti, cucina italiana & tradizioni, cronaca locale, politica (opinioni forti), fede cattolica, nostalgia e identità italiana
- Format preferito: testo con apertura emotiva, domande coinvolgenti, contenuti condivisibili in famiglia
- Condividono: contenuti sulla salute quotidiana (pressione, diabete, rimedi naturali), sicurezza locale, orgoglio italiano, disastri naturali, vicende della Chiesa cattolica, cucina regionale, storie di nonne/famiglie

**Pagine da monitorare in priorità (ordine decrescente):**
ANSA, Repubblica, Corriere della Sera, La Stampa, Il Messaggero, Il Giornale, Libero, TGCom24, SkyTG24, La7, RTL 102.5, Radio Maria, Vatican News, L'Osservatore Romano, Donna Moderna, Io Donna, Grazia, Famiglia Cristiana, Credere, Salute della donna, Il Corriere di Roma, Napoli Today, MilanoToday, PalermoToday, BolognaToday

**Regole di esclusione assolute — non includere mai:**
1. Contenuti con minori vittime di violenza, abusi sessuali o incidenti mortali
2. Casi di violenza sessuale con vittime identificabili
3. Retorica anti-immigrati come driver principale del contenuto
4. Contenuti pro-armi o milizie civili
5. Pubblicazioni ufficiali di partiti politici estremi (FdI ufficiale, Lega ufficiale, M5S ufficiale)
6. Contenuti che designano un'etnia o nazionalità come colpevole collettiva
7. Informazioni non verificate o complottiste

**Il tuo compito:**
Analizza i post pubblici Facebook più coinvolgenti delle ultime 24-48 ore sulle pagine elencate sopra, poi prepara una lista delle **10 pubblicazioni più rilevanti** per la nostra audience.

**Metodo di classifica adattato all'audience:**
- Punteggio bruto di engagement (like + commenti + condivisioni)
- Aumenta +30% se il tema riguarda direttamente la vita quotidiana di donne di 65+ anni (salute, pensione, sicurezza, famiglia, religione, cucina regionale)
- Aumenta +20% se il contenuto è Roma-centrico o riguarda città del Sud (Napoli, Palermo, Bari, Catania)
- Aumenta +10% se il contenuto riguarda la Chiesa cattolica, il Papa o la fede
- Riduci -20% se il contenuto è molto milanese/settentrionale o riguarda ambienti giovanili/urbani lontani dall'audience
- Riduci -50% o escludi se una delle 7 regole di esclusione è attivata

**Formato di output per ogni post:**
1. **Titolo / argomento:** [riassunto in una riga del contenuto del post]
2. **Pagina fonte:** [nome della pagina Facebook]
3. **Engagement bruto:** [like + commenti + condivisioni]
4. **URL del post:** [link diretto alla pubblicazione]
5. **Riassunto:** [2-3 frasi sul contenuto reale del post]
6. **Angolo editoriale:** [perché questo post tocca la nostra audience — emozione principale, tema sociale]
7. **Audience fit per Italia Oggi:** [HIGH / MEDIUM / LOW]
8. **Editorial flag:** [✅ PUBBLICABILE / ⚠️ ADATTA — breve motivazione / ❌ ESCLUDI — regola di esclusione attivata]
9. **Domanda di coinvolgimento suggerita:** [una domanda diretta da porre nei commenti]
10. **Hashtag suggeriti:** [5-6 hashtag in italiano, CamelCase]

Classifica i 10 risultati dal più coinvolgente al meno coinvolgente per la nostra audience (punteggio adattato).
Indica alla fine della lista: **"Post da pubblicare per primo: #[N] — [motivazione in una frase]"**
```

---

## Come usare questi prompt

1. Apri [meta.ai](https://meta.ai) ogni mattina
2. Incolla il prompt della pagina su cui stai lavorando (FR o IT)
3. Meta AI restituirà i 10 post con URL reali dal feed pubblico di Facebook
4. Usa i flag:
   - `✅ PUBLISHABLE` → porta l'ID articolo in `/generate-post`
   - `⚠️ ADAPT` → leggi il motivo, adatta il tono se necessario
   - `❌ EXCLUDE` → salta completamente
5. Copia gli URL dei post `✅` e inseriscili nel pipeline o usali come riferimento per `/generate-post`

---

## Audience Reference

### France Aujourd'hui

| Metric | Value |
|---|---|
| Women | 85% |
| Age 65+ | majority |
| Top geography | PACA + Occitanie (55%+ combined) |
| Key cities | Marseille, Nice, Montpellier, Toulon, Aix |
| Top content | Santé, famille, faits divers, politique |
| Religion | Catholique (modérée) |
| Format | Texte émotionnel, question engageante |

### Italia Oggi

| Metric | Value |
|---|---|
| Women | 79% |
| Age 65+ | majority |
| Top city | Roma (31%) |
| Other cities | Milano, Napoli, Torino, Palermo |
| Top content | Salute, famiglia, cucina, fede |
| Religion | Cattolica (forte) |
| Format | Testo condivisibile, storia umana |
