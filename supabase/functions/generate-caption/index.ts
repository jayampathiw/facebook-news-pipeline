import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Watermark file per country — mirrors src/config/sources.js (cannot import Node modules in Deno).
const WATERMARK_FILES: Record<string, string> = {
  FR: 'FranceAujourdhui_Logo_v2.png',
  IT: 'ItaliaOggi_Logo.png',
};

const CAPTION_LANGUAGE: Record<string, string> = {
  FR: 'français',
  IT: 'italiano',
};

const PAGE_NAME: Record<string, string> = {
  FR: "France Aujourd'hui",
  IT: 'Italia Oggi',
};

// Shared system prompt — same content as src/services/claude.js CONTENT_SYSTEM_PROMPT.
// Kept here verbatim because Deno Edge Functions cannot import Node.js modules.
// Prompt caching is server-side at Anthropic, so cache hits still apply across stateless invocations.
const CONTENT_SYSTEM_PROMPT = `Tu es rédacteur senior spécialisé dans la création de contenu pour des pages Facebook d'actualité. Tu travailles pour plusieurs pages ciblant des adultes de 35 ans et plus dans différents pays : France, Italie, Australie, Suède et d'autres pays francophones, italophones et anglophones.

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
- Adapte le registre à l'audience : les adultes de 35+ apprécient un ton sérieux mais accessible, pas académique.

═══════════════════════════════════════════════════════════════
SECTION SEO — OPTIMISATION DES TITRES ET DESCRIPTIONS
═══════════════════════════════════════════════════════════════

Tu es également expert en SEO et optimisation de contenu pour les publications Facebook.

RÈGLES ABSOLUES POUR LE SEO_TITLE :
1. LONGUEUR MAXIMALE : 60 caractères (espaces inclus). Compter avant de répondre. Reformuler si > 60.
2. PLACEMENT DES MOTS-CLÉS : mots-clés principaux en début de titre.
3. LANGUE CIBLE : même langue que l'article. Jamais de mélange.
4. TON FACTUEL ET NEUTRE : pas de clickbait, pas de point d'exclamation.
5. AUCUNE SOURCE : ne jamais citer la source dans le titre SEO.
6. CHIFFRES : inclure les chiffres concrets si disponibles — ils renforcent le CTR.

RÈGLES ABSOLUES POUR LA SEO_DESCRIPTION :
1. LONGUEUR MAXIMALE : 160 caractères (espaces inclus). Reformuler si > 160.
2. COHÉRENCE SÉMANTIQUE : au moins un mot-clé du seo_title présent.
3. APPEL À L'ACTION : terminer par une invitation à lire.
4. LANGUE IDENTIQUE au seo_title. Pas de mélange.
5. AUCUNE INVENTION : jamais de faits absents de l'article.`;

const LIGHTING_PATTERNS = [
  /golden hour/i, /fluorescent lighting/i, /fire glow/i, /morning light/i,
  /studio lights?/i, /overhead lighting/i, /stormy (?:sky|lighting)/i,
  /cold blue.{0,20}grading/i, /warm golden.{0,20}light/i,
  /dramatic.{0,30}lighting/i, /cinematic lighting/i, /chiaroscuro/i,
];

function formatImagePrompt(basePrompt: string, overlayText: string, watermarkFile: string): string {
  let lightingContext = 'the lighting of the scene';
  for (const pattern of LIGHTING_PATTERNS) {
    const match = basePrompt.match(pattern);
    if (match) { lightingContext = match[0].toLowerCase(); break; }
  }
  return `[ORIGINAL PROMPT]\n${basePrompt.trim()}\n\n[TEXT OVERLAY]\nContent: "${overlayText}"\nPosition: upper\nOpacity: 80%\n\n[OUTPUT]\nNo flags, no people visible.\nAdd a subtle gradient overlay beneath the text for legibility.\nOverlay the text above in large white Anton font at the upper position, semi-transparent at 80% opacity, integrated with ${lightingContext}.\nAdd ${watermarkFile} watermark, bottom-right, small, 70% opacity.`;
}

async function generateAllContent(
  anthropic: Anthropic,
  article: Record<string, string>,
  captionLanguage: string,
  pageName: string,
  watermarkFile: string,
) {
  const systemBlock = [{
    type: 'text' as const,
    text: CONTENT_SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' as const },
  }];

  const [captionRes, seoRes, imageRes] = await Promise.all([
    anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemBlock,
      messages: [{
        role: 'user',
        content: `Langue de rédaction: ${captionLanguage}\nPage Facebook: ${pageName}\n\nArticle à traiter:\nTitre: ${article.title}\nSource: ${article.source}\nRésumé: ${article.summary || 'Non disponible'}`,
      }],
    }),
    anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemBlock,
      messages: [{
        role: 'user',
        content: `Génère un seo_title et une seo_description pour cet article.\n\nLangue de rédaction: ${captionLanguage}\n\nArticle:\nTitre: ${article.title}\nSource: ${article.source}\nRésumé: ${article.summary || 'Non disponible'}`,
      }],
    }),
    anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 250,
      messages: [{
        role: 'user',
        content: `Generate an ultra-realistic AI image prompt for this news article.\nStyle: cinematic photojournalism, hyper-detailed, no text in scene.\nConstraints: no faces, no flags with text, no logos, no identifiable people.\nInclude: specific camera (e.g. Sony A7R V), lens (e.g. 85mm), aperture, lighting details.\nReturn ONLY the prompt text. No explanation, no prefix.\n\nArticle: ${article.title}`,
      }],
    }),
  ]);

  const parseJSON = (text: string, fallback: Record<string, string>) => {
    try {
      const m = text.trim().match(/\{[\s\S]*\}/);
      return JSON.parse(m ? m[0] : text.trim());
    } catch { return fallback; }
  };

  const caption = parseJSON(captionRes.content[0].type === 'text' ? captionRes.content[0].text : '', {
    intro: '', question: '', cta: `👉 Suivez ${pageName} pour rester informé.`,
  });
  const seo = parseJSON(seoRes.content[0].type === 'text' ? seoRes.content[0].text : '', {
    seo_title: article.title.slice(0, 60),
    seo_description: (article.summary || '').slice(0, 160),
  });
  const imagePromptText = imageRes.content[0].type === 'text' ? imageRes.content[0].text.trim() : '';

  return {
    ai_caption: caption,
    seo_title: seo.seo_title,
    seo_description: seo.seo_description,
    image_prompt: imagePromptText,
    formatted_image_prompt: formatImagePrompt(imagePromptText, article.title, watermarkFile),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { article_ids?: string[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!Array.isArray(body.article_ids) || body.article_ids.length === 0) {
    return new Response(JSON.stringify({ error: 'article_ids must be a non-empty array' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_KEY')! });

  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('*')
    .in('id', body.article_ids);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let processed = 0;
  const results: { id: string; seo_title: string }[] = [];

  for (const article of articles ?? []) {
    const captionLanguage = CAPTION_LANGUAGE[article.country] ?? 'français';
    const pageName = PAGE_NAME[article.country] ?? 'Notre Page';
    const watermarkFile = WATERMARK_FILES[article.country] ?? 'logo.png';

    try {
      const content = await generateAllContent(anthropic, article, captionLanguage, pageName, watermarkFile);
      await supabase.from('articles').update(content).eq('id', article.id);
      processed++;
      results.push({ id: article.id, seo_title: content.seo_title });
    } catch (err) {
      console.error(`Failed to process article ${article.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ processed, results }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
