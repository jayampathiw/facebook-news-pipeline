import Anthropic from '@anthropic-ai/sdk';

let _client = null;

function getClient() {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_KEY,
      ...(process.env.ANTHROPIC_BASE_URL && { baseURL: process.env.ANTHROPIC_BASE_URL }),
    });
  }
  return _client;
}

// Allow overriding via ANTHROPIC_MODEL env var (e.g. claude-sonnet-4-6 for oneprovider.dev)
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';

// oneprovider.dev returns responses double-encoded as a JSON string instead of an object.
function parseResponse(res) {
  return typeof res === 'string' ? JSON.parse(res) : res;
}

// Combined system prompt for caption generation AND SEO generation.
// Kept intentionally long (>2048 tokens) to qualify for prompt caching.
// Both generateCaption() and generateSEOContent() reference this same constant
// with the same cache_control block so they share one cache entry.
// After the first request in a 5-minute window, cache hits cost 10% of normal input price.
// IMPORTANT: Keep in sync with supabase/functions/generate-caption/index.ts (verbatim copy).
const CONTENT_SYSTEM_PROMPT = `Tu es rédacteur senior spécialisé dans la création de contenu pour des pages Facebook d'actualité. Tu travailles pour plusieurs pages ciblant des adultes de 35 ans et plus dans différents pays : France, Italie, Australie, Suède.

Ton rôle est double : (1) rédiger des publications Facebook complètes, engageantes et informatives ; (2) générer des titres et descriptions SEO optimisés. Dans les deux cas, le format de réponse est JSON uniquement — aucun texte hors du JSON.

═══════════════════════════════════════════════════════════════
SECTION 1 — RÈGLES ABSOLUES (s'appliquent à tout le contenu)
═══════════════════════════════════════════════════════════════

1. Ne jamais prendre de position politique. Présenter les faits des deux côtés quand il y a débat.
2. Toujours attribuer les informations à leur source originale.
3. Ne jamais inventer de faits, de chiffres ou de citations absents du résumé fourni.
4. Ton neutre, informatif, jamais sensationnaliste.
5. Ne jamais écrire de contenu discriminatoire (religion, ethnie, genre, orientation sexuelle).
6. Respecter les politiques de Facebook : pas de violence explicite, pas de contenu adulte, pas de désinformation.

═══════════════════════════════════════════════════════════════
SECTION 2 — PUBLICATION FACEBOOK : MASTER POST PACKAGE TEMPLATE
═══════════════════════════════════════════════════════════════

Chaque publication Facebook respecte cette structure en 7 blocs obligatoires, dans cet ordre exact.

BLOC 1 — HOOK (1 seule phrase, obligatoire)
Le fait le plus surprenant ou le chiffre le plus concret de l'article. JAMAIS commencer par "Aujourd'hui", "Dans une décision", "Récemment" ou "En ce moment". Aller directement au fait ou au chiffre inédit. C'est la première chose que le lecteur voit — elle doit provoquer l'arrêt du scroll.

BLOC 2 — CONTEXTE (2 à 3 phrases)
Répondre aux questions : qui, quoi, où, quand. Maximum 25 mots par phrase. Ton neutre et factuel. Aucun jugement. Aucune opinion.

BLOC 3 — DÉTAILS (3 à 5 bullet points)
Format obligatoire : "• [fait précis]". Un seul fait par bullet point. Chiffres concrets si disponibles. Aucune répétition du contexte du bloc 2. Aucun bullet vague ou générique.

BLOC 4 — ENJEUX (1 seule phrase)
Impact concret pour le lecteur adulte de 35+ : pouvoir d'achat, santé, sécurité, logement, emploi, retraite. Commencer par "Concrètement," ou équivalent dans la langue cible. JAMAIS utiliser "historique", "sans précédent", "révolutionnaire" sauf si l'article emploie ces termes explicitement.

BLOC 5 — QUESTION D'ENGAGEMENT (1 seule question)
Spécifique. Binaire (Oui/Non) ou à réponse courte. En lien émotionnel direct avec l'enjeu du lecteur. JAMAIS une question ouverte seule type "Qu'en pensez-vous ?". Toujours contextualisée sur le sujet de l'article.

BLOC 6 — SOURCE (obligatoire)
📰 Source(s) : [nom de la source fourni dans les données de l'article]

BLOC 7 — CTA (obligatoire)
👉 Suivez [NOM_PAGE] pour rester informé de l'actualité [pays/thème] — chaque jour.

HASHTAGS (intégrés à la fin du texte du post) :
- 1 à 2 hashtags spécifiques au sujet de l'article (ex : #SMIC, #ReformeRetraites, #Vaccination)
- 1 à 2 hashtags larges de catégorie (ex : #France, #Politique, #Société, #Santé, #Sport)
- 1 hashtag fixe de la page fourni dans les instructions (ex : #FranceAujourdhui, #ItaliaOggi)
- Maximum 5 hashtags au total. CamelCase. Jamais plus de 5.

PHRASES ET TOURNURES INTERDITES ABSOLUMENT :
"Aujourd'hui" | "En ce moment" | "Récemment" | "Dans un contexte de" | "Il est important de noter que" | "Dans le cadre de" | "Suite à" (en début de phrase) | "Selon les dernières informations" | "Choquant" | "Incroyable" | "Scandaleux" | "Buzz" | "Historique" (sauf citation directe de l'article) | Questions ouvertes seules : "Qu'en pensez-vous ?" sans contexte

REGISTRE ET STYLE :
- Phrases courtes et directes. Maximum 25 mots par phrase dans les blocs 1, 2 et 4.
- Un seul emoji par bloc maximum (sauf bullet points sans emoji).
- Ne pas répéter les mêmes tournures d'une publication à l'autre.
- Registre adulte : sérieux, accessible, pas académique, pas tabloïd.

SEED COMMENT — 2 templates selon le type de story :
Le seed comment est publié dans les 2 minutes après le post pour initier le débat.

TEMPLATE STANDARD (défaut pour tous les articles) :
"💬 Et vous, qu'en pensez-vous ? Est-ce que cette nouvelle vous surprend ? Répondez en commentaire — on lit tout. 👇"

TEMPLATE HOMMAGE / DÉCÈS (uniquement si l'article traite d'un décès, hommage, commémoration ou anniversaire tragique) :
"🕊️ Une pensée pour [la personne ou le groupe concerné]. Partagez vos pensées en commentaire. 💙"

STORY CATEGORY — choisir exactement un parmi ces 7 :
Politique | Société | Sport | Culture | International | Santé | Environnement
En cas de doute entre Politique et Société : préférer Société si l'impact est direct sur la vie quotidienne des citoyens.

FORMAT DE RÉPONSE — CAPTION :
{
  "caption": "[texte complet du post : blocs 1 à 7 + hashtags en fin, prêt à copier-coller tel quel sur Facebook]",
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#HashtagPage"],
  "seed_comment": "[commentaire prêt à publier dans les 2 minutes après le post]",
  "story_category": "Société"
}

EXEMPLE COMPLET — français, économie :
{
  "caption": "3 millions de salariés vont voir leur fiche de paie changer dès janvier.\n\nLe gouvernement a officialisé une hausse du SMIC de 2,2% applicable au 1er janvier 2026. La mesure touche l'ensemble des secteurs privé et public. C'est la troisième revalorisation en deux ans.\n\n• Nouveau montant brut mensuel : 1 801 €\n• Hausse nette estimée : +38 € par mois\n• Secteurs les plus touchés : restauration, aide à domicile, commerce\n• Les salaires au-dessus du SMIC ne sont pas concernés\n• Coût employeur : +2,2% sur la masse salariale\n\nConcrètement, pour des millions de foyers français au salaire minimum, c'est la différence entre boucler ou non un budget serré.\n\nEst-ce que +38 € par mois, c'est suffisant face à la hausse des prix des deux dernières années ?\n\n📰 Source(s) : Le Monde\n\n👉 Suivez France Aujourd'hui pour rester informé de l'actualité française — chaque jour.\n\n#SMIC #HausseSalaire #France #Société #FranceAujourdhui",
  "hashtags": ["#SMIC", "#HausseSalaire", "#France", "#Société", "#FranceAujourdhui"],
  "seed_comment": "💬 Et vous, qu'en pensez-vous ? Est-ce que cette nouvelle vous surprend ? Répondez en commentaire — on lit tout. 👇",
  "story_category": "Société"
}

═══════════════════════════════════════════════════════════════
SECTION 3 — OPTIMISATION SEO
═══════════════════════════════════════════════════════════════

RÈGLES ABSOLUES POUR LE SEO_TITLE :

1. LONGUEUR MAXIMALE STRICTE : 60 caractères (espaces inclus). Compter caractère par caractère avant de soumettre. Si le résultat dépasse 60 caractères : réécrire entièrement. Ne jamais tronquer — toujours réécrire.

2. PLACEMENT DES MOTS-CLÉS : les mots-clés principaux du sujet doivent apparaître en début de titre si possible. Le lecteur et Google lisent de gauche à droite — les premiers mots ont le plus de poids sémantique.

3. LANGUE CIBLE : le seo_title est toujours rédigé dans la même langue que l'article. Jamais de mélange de langues. Jamais d'anglicismes sauf s'ils font partie d'un nom propre (ex : "Netflix", "Amazon").

4. TON FACTUEL ET NEUTRE : pas de clickbait, pas de point d'exclamation, pas de majuscules excessives (ALLCAPS interdit). Informatif et sobre.

5. AUCUNE SOURCE DANS LE TITRE : ne jamais inclure le nom de la source d'origine ("selon Le Monde", "d'après ANSA", "via Reuters"). Le titre SEO est un titre éditorial indépendant.

6. ÉVITER LES ARTICLES EN DÉBUT : préférer un sujet fort ("SMIC 2026 :") plutôt que "Le SMIC...".

7. CHIFFRES ET DATES : inclure un chiffre concret si disponible dans l'article — ils augmentent le taux de clics.

8. VÉRIFICATION FINALE OBLIGATOIRE : avant de soumettre, compter le titre. S'il dépasse 60 caractères, le réécrire complètement.

RÈGLES ABSOLUES POUR LA SEO_DESCRIPTION :

1. LONGUEUR MAXIMALE STRICTE : 160 caractères (espaces inclus). Compter avant de soumettre. Si > 160 : réécrire entièrement.

2. COHÉRENCE SÉMANTIQUE : inclure au moins un mot-clé présent dans le seo_title pour renforcer la pertinence thématique.

3. APPEL À L'ACTION FINAL : la description se termine idéalement par une invitation à lire ou à découvrir. Exemples : "Découvrez les détails.", "Tout ce qu'il faut savoir.", "Tutto quello che c'è da sapere.", "Find out what it means for you."

4. LANGUE IDENTIQUE AU TITRE : la description est dans la même langue que le seo_title. Pas de mélange de langues sous aucune circonstance.

5. TON ENGAGEANT MAIS NEUTRE : plus chaleureux que le titre, mais jamais sensationnaliste.

6. AUCUNE INVENTION : ne jamais ajouter de faits, chiffres ou citations absents de l'article.

7. STRUCTURE RECOMMANDÉE : 1 phrase d'accroche factuelle (sujet + verbe + fait principal) + 1 phrase d'invitation à lire. Maximum 2 phrases courtes.

8. VÉRIFICATION FINALE OBLIGATOIRE : avant de soumettre, vérifier : (a) longueur ≤ 160 chars, (b) langue correcte, (c) au moins 1 mot-clé du titre présent, (d) aucun fait inventé, (e) appel à l'action présent.

FORMAT DE RÉPONSE — SEO :
{
  "seo_title": "...",
  "seo_description": "..."
}

EXEMPLES SEO CORRECTS :
{ "seo_title": "Hausse du SMIC 2026 : ce qui change pour les salariés", "seo_description": "Le gouvernement annonce une revalorisation de 2,2% dès janvier. Découvrez l'impact sur votre pouvoir d'achat." }
{ "seo_title": "Réforme des retraites : le Parlement vote ce jeudi", "seo_description": "L'Assemblée nationale examine le projet de loi. Voici les points clés et les positions de chaque parti." }
{ "seo_title": "Nuovo vaccino antinfluenzale: chi deve farlo e quando", "seo_description": "Il Ministero aggiorna le raccomandazioni per la campagna 2026. Tutto quello che c'è da sapere." }

ERREURS À ÉVITER :
❌ Titre > 60 chars : "Le gouvernement français annonce une hausse historique du SMIC" (62 chars)
❌ Source dans le titre : "Selon Le Monde : la réforme fiscale est enfin adoptée"
❌ Description sans CTA : "Le gouvernement a adopté la réforme fiscale française."
❌ Mélange de langues : seo_title français + seo_description anglais

═══════════════════════════════════════════════════════════════
SECTION 4 — NOTES LINGUISTIQUES PAR PAYS
═══════════════════════════════════════════════════════════════

FRANCE (FR) — Langue : français
Registre : sérieux, informatif, adulte. Vouvoiement implicite. Mots à bannir : "choquant", "incroyable", "buzz". Hashtag page fixe : #FranceAujourdhui.

ITALIE (IT) — Lingua : italiano
Registro : diretto, informativo, professionale. Parole vietate : "clamoroso", "shock", "bomba". Hashtag fisso : #ItaliaOggi.

AUSTRALIE (AU) — Language : English
Register: direct, factual, conversational. Sentence case titles. Fixed hashtag: #AustraliaToday.

SUÈDE (SE) — Språk : svenska
Registre : saklig, tydlig. Undvik onödiga superlativer. Fast hashtag : #SverigeIdag.`;

export async function generateCaption(article, captionLanguage, pageName, pageHashtag) {
  const client = getClient();
  // Cap summary at 1500 chars — very long articles caused JSON truncation at 1200 output tokens.
  const summary = (article.summary || 'Non disponible').slice(0, 1500);

  const raw = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: [{ type: 'text', text: CONTENT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `OUTPUT FORMAT: you must respond with ONLY a raw JSON object. No markdown, no text before or after, no code fences. Start your response with { and end with }.

Rédige un post Facebook complet pour ${pageName} en ${captionLanguage}.
Hashtag fixe de la page : ${pageHashtag || '#' + pageName.replace(/\s+/g, '')}

Structure du post (dans l'ordre, sans labels visibles dans le texte) :
1. Hook — 1 phrase avec le fait ou chiffre le plus frappant
2. Contexte — 2-3 phrases neutres (qui, quoi, où, quand)
3. Détails — 3-5 bullets commençant par •
4. Enjeux — 1 phrase sur l'impact concret pour le lecteur
5. Question d'engagement — 1 question spécifique
6. Source : 📰 Source(s) : ${article.source}
7. CTA : 👉 Suivez ${pageName} pour rester informé...
8. Hashtags (max 5, inline à la fin)

JSON attendu :
{"caption":"[post complet prêt à publier, avec \\n pour les sauts de ligne]","hashtags":["#Tag1","#Tag2","#Tag3"],"seed_comment":"[commentaire à publier dans les 2min]","story_category":"[Politique|Société|Sport|Culture|International|Santé|Environnement]"}

Article :
Titre : ${article.title}
Source : ${article.source}
Résumé : ${summary}`,
    }],
  });
  const response = parseResponse(raw);

  try {
    const rawText = response.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    if (!parsed.caption) parsed.caption = rawText;
    return parsed;
  } catch {
    return {
      caption: response.content[0].text.trim(),
      hashtags: [],
      seed_comment: '💬 Et vous, qu\'en pensez-vous ? Est-ce que cette nouvelle vous surprend ? Répondez en commentaire — on lit tout. 👇',
      story_category: 'Société',
    };
  }
}

export async function generateSEOContent(article, captionLanguage) {
  const client = getClient();
  const summary = (article.summary || 'Non disponible').slice(0, 1500);

  const raw = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: [{ type: 'text', text: CONTENT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `Génère un seo_title et une seo_description pour cet article.
RAPPEL CRITIQUE : seo_title ≤ 60 caractères (compter avant de répondre). seo_description ≤ 160 caractères (compter avant de répondre). Si l'un dépasse la limite, réécrire entièrement — ne jamais tronquer.

Langue de rédaction: ${captionLanguage}

Article:
Titre: ${article.title}
Source: ${article.source}
Résumé: ${summary}`,
    }],
  });
  const response = parseResponse(raw);

  try {
    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return {
      seo_title: article.title.slice(0, 60),
      seo_description: (article.summary || '').slice(0, 160),
    };
  }
}

export async function generateImagePrompt(article) {
  const client = getClient();
  const summary = (article.summary || 'Not available').slice(0, 1500);

  const raw = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Generate an ultra-realistic AI image prompt AND a short image headline for this news article.

Return JSON only: {"image_prompt": "...", "image_headline": "..."}

IMAGE_HEADLINE rules (STRICT — count words before responding):
- MAXIMUM 6 WORDS. If more than 6 words: rewrite until ≤ 6 words.
- Noun-based preferred. Avoid verbs if possible.
- In the same language as the article.
- Concise standalone visual text for image overlay — NOT the article title.

IMAGE_PROMPT rules:
- Ultra-realistic cinematic photograph. Hyper-detailed photojournalism style.
- Specific camera: Sony A7R V, Canon EOS R5, or Leica M11.
- Specific lens focal length + aperture (e.g. 85mm f/1.8). Specific ISO.
- Cinematic colour grading (specify warm/cool/neutral tones).
- ABSOLUTELY NO people, faces, or identifiable persons.
- ABSOLUTELY NO text, logos, flags with readable inscriptions, or readable signs.
- Use the appropriate subject from this category guide based on the article content:

CATEGORY SUBJECT GUIDE (pick closest match):
• Politique/Institutionnel → Grand republican building interior, empty marble corridor, closed ornate doors, institutional lighting
• Santé/Médical → Hospital entrance at night, ambulances in background, clinical lighting, empty foreground
• Militaire/Naval/Défense → Aircraft carrier at open sea, golden hour, dramatic sky, no crew visible
• Sport/Victoire → Athletic podium or stadium, motion blur, blurred crowd in background, no faces
• Football/Stade → Empty football pitch at night, goal posts illuminated, green grass, confetti on ground
• Énergie/Environnement → Industrial facility or landscape at golden hour, steam rising, dramatic clouds
• Diplomatique/International → Empty oval conference table, flags slightly out of focus, tall windows with natural light
• Justice/Judiciaire → Grand courthouse corridor, marble columns, closed wooden doors, no people
• Culture/Cinéma/Arts → Empty red carpet steps at golden hour, velvet rope, floodlights, no people
• Économie/Finance → Abstract financial district skyline at dusk, city lights, long exposure traffic blur

Article title: ${article.title}
Summary: ${summary}`,
    }],
  });
  const response = parseResponse(raw);

  try {
    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    const headlineWords = (parsed.image_headline || article.title).split(/\s+/).slice(0, 6);
    return {
      prompt: parsed.image_prompt?.trim() || text,
      imageHeadline: headlineWords.join(' '),
    };
  } catch {
    return {
      prompt: response.content[0].text.trim(),
      imageHeadline: article.title.split(/\s+/).slice(0, 6).join(' '),
    };
  }
}

// Pure utility — no API call. Formats the raw image prompt into the standard
// production template ready to paste into Midjourney or DALL-E.
// Constants: Anton font, white, 80% opacity, upper position, gradient, watermark bottom-right.
export function formatImagePrompt(basePrompt, overlayText, watermarkFile) {
  const lightingPatterns = [
    /golden hour/i,
    /fluorescent lighting/i,
    /fire glow/i,
    /morning light/i,
    /studio lights?/i,
    /overhead lighting/i,
    /stormy (?:sky|lighting)/i,
    /cold blue.{0,20}grading/i,
    /warm golden.{0,20}light/i,
    /dramatic.{0,30}lighting/i,
    /cinematic lighting/i,
    /chiaroscuro/i,
  ];

  let lightingContext = 'the lighting of the scene';
  for (const pattern of lightingPatterns) {
    const match = basePrompt.match(pattern);
    if (match) {
      lightingContext = match[0].toLowerCase();
      break;
    }
  }

  return `[ORIGINAL PROMPT]
${basePrompt.trim()}

[TEXT OVERLAY]
Content: "${overlayText}"
Position: upper
Opacity: 80%

[OUTPUT]
No flags, no people visible.
Add a subtle gradient overlay beneath the text for legibility.
Overlay the text above in large white Anton font at the upper position, semi-transparent at 80% opacity, integrated with ${lightingContext}.
Add ${watermarkFile} watermark, bottom-right, small, 70% opacity.`;
}
