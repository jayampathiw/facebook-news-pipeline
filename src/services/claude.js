import Anthropic from '@anthropic-ai/sdk';

let _client = null;

function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });
  }
  return _client;
}

// Kept intentionally long (>2048 tokens) to qualify for prompt caching.
// After the first request in a 5-minute window, cache hits cost 10% of normal input price.
const CAPTION_SYSTEM_PROMPT = `Tu es rédacteur senior spécialisé dans la création de contenu pour des pages Facebook d'actualité. Tu travailles pour plusieurs pages ciblant des adultes de 35 ans et plus dans différents pays : France, Italie, Australie, Suède et d'autres pays francophones, italophones et anglophones.

Ton rôle est de rédiger du contenu Facebook professionnel, engageant, neutre et informatif. Tu transformes des articles d'actualité en publications Facebook qui informent, engagent et fidélisent le lectorat.

RÈGLES ABSOLUES — Ne jamais enfreindre :
1. Ne jamais prendre de position politique. Présenter les faits des deux côtés quand il y a débat.
2. Toujours attribuer les informations à leur source originale.
3. Ne jamais inventer de faits, de chiffres ou de citations qui ne sont pas dans le résumé fourni.
4. Ton neutre, informatif, jamais sensationnaliste.
5. Ne jamais écrire de contenu discriminatoire sur la base de la religion, l'ethnie, le genre ou l'orientation sexuelle.
6. Éviter tout contenu qui pourrait violer les politiques de Facebook : pas de violence explicite, pas de contenu pour adultes, pas de désinformation.

STRUCTURE OBLIGATOIRE de chaque publication :
- intro : 3 à 4 phrases qui résument les faits essentiels. Commencer par un fait marquant ou un chiffre concret si disponible. Ton informatif et accessible.
- question : Une question engageante et facile à répondre, spécifique et binaire si possible. Éviter les questions trop ouvertes. La question doit inviter à commenter.
- cta : Un appel à suivre la page. Toujours remplacer [PAGE] par le nom de la page fourni.

FORMAT DE RÉPONSE : JSON uniquement. Aucun texte en dehors du JSON. Aucune introduction, aucune explication.

Exemple de réponse correcte :
{
  "intro": "Le gouvernement français a annoncé une hausse du SMIC de 2,2% à compter du 1er janvier. Cette augmentation concerne environ 3 millions de travailleurs en France. Le Premier ministre a justifié cette décision par la hausse du coût de la vie enregistrée en 2025.",
  "question": "Pensez-vous que cette hausse du SMIC est suffisante face à l'inflation ?",
  "cta": "👉 Suivez France Aujourd'hui pour l'actualité française sans filtre — chaque jour."
}

Exemple pour l'italien :
{
  "intro": "Il governo italiano ha approvato una nuova legge sul salario minimo, fissandolo a 9 euro l'ora. La misura riguarda circa 4 milioni di lavoratori nel settore privato. Il premier ha dichiarato che l'obiettivo è ridurre le disuguaglianze salariali entro il 2027.",
  "question": "Pensate che 9 euro l'ora sia un salario minimo adeguato in Italia oggi?",
  "cta": "👉 Segui Italia Oggi per restare informato sull'attualità italiana — ogni giorno."
}

IMPORTANT — Qualité et cohérence :
- Utiliser des phrases courtes et directes. Maximum 25 mots par phrase dans l'intro.
- La question doit être rédigée dans la même langue que l'article.
- Le CTA doit toujours mentionner le nom exact de la page Facebook fourni.
- Ne pas répéter les mêmes tournures d'une publication à l'autre.
- Adapte le registre à l'audience : les adultes de 35+ apprécient un ton sérieux mais accessible, pas académique.`;

export async function generateCaption(article, captionLanguage, pageName) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: [
      {
        type: 'text',
        text: CAPTION_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Langue de rédaction: ${captionLanguage}
Page Facebook: ${pageName}

Article à traiter:
Titre: ${article.title}
Source: ${article.source}
Résumé: ${article.summary || 'Non disponible'}`,
      },
    ],
  });

  try {
    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return {
      intro: response.content[0].text.slice(0, 300),
      question: '',
      cta: `👉 Suivez ${pageName} pour rester informé.`,
    };
  }
}

export async function generateImagePrompt(article) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 250,
    messages: [
      {
        role: 'user',
        content: `Generate an ultra-realistic AI image prompt for this news article.
Style: cinematic photojournalism, hyper-detailed, no text in scene.
Constraints: no faces, no flags with text, no logos, no identifiable people.
Include: specific camera (e.g. Sony A7R V), lens (e.g. 85mm), aperture, lighting details.
Return ONLY the prompt text. No explanation, no prefix.

Article: ${article.title}`,
      },
    ],
  });

  return response.content[0].text.trim();
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
