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

const PAGE_HASHTAG: Record<string, string> = {
  FR: '#FranceAujourdhui',
  IT: '#ItaliaOggi',
};

const PATRIOTIC_PATTERN = /\b(victoire|victory|vittoria|seger|champion|médaille|medaglia|medalj|medal|award|prix|premio|pris|record|exploit|succès|successo|framgång|fierté|pride|orgoglio|stolthet|historique|historico|historisk|first\s+ever|premier\s+(français|italian)|nationale?)\b/i;

const SOCIAL_PATTERN = /\b(retraite|pension|pensionné|retraité|pensionato|pensionista|ålderspension|santé|hôpital|maladie|cancer|médicament|salute|ospedale|malattia|cura|hälsa|sjukhus|logement|loyer|immobilier|appartement|alloggio|affitto|bostad|hyra|emploi|chômage|licenciement|salaire|lavoro|disoccupazione|stipendio|arbete|lön|inflation|pouvoir\s+d.achat|coût\s+de\s+la\s+vie|economia|tasse|ekonomi|famille|enfant|parent|scuola|familj|barn|skola)\b/i;

function tagArticle(a: { criticality: string; title: string; summary: string | null }): string[] {
  const tags: string[] = [];
  if (a.criticality === 'breaking') tags.push('breaking');
  if (a.criticality === 'alert')    tags.push('alert');
  if (a.criticality === 'trending') tags.push('trending');
  const text = `${a.title} ${a.summary ?? ''}`;
  if (PATRIOTIC_PATTERN.test(text)) tags.push('patriotic');
  if (SOCIAL_PATTERN.test(text))    tags.push('social');
  return tags;
}

// Shared system prompt — same content as src/services/claude.js CONTENT_SYSTEM_PROMPT.
// Kept here verbatim because Deno Edge Functions cannot import Node.js modules.
// Prompt caching is server-side at Anthropic: cache hits apply across stateless invocations.
// Both caption and SEO calls use this block so they share one cache entry.
const CONTENT_SYSTEM_PROMPT = `Tu es rédacteur senior spécialisé dans la création de contenu pour des pages Facebook d'actualité. Tu travailles pour plusieurs pages ciblant des adultes de 35 ans et plus dans différents pays : France, Italie, Australie, Suède.

Ton rôle est double : (1) rédiger des publications Facebook complètes, engageantes et informatives ; (2) générer des titres et descriptions SEO optimisés. Dans les deux cas, le format de réponse est JSON uniquement — aucun texte hors du JSON.

═══════════════════════════════════════════════════════════════
SECTION 1 — RÈGLES ABSOLUES (s'appliquent à tout le contenu)
═══════════════════════════════════════════════════════════════

1. Ne jamais prendre de position politique. Présenter les faits des deux côtés quand il y a débat.
2. Toujours attribuer les informations à leur source originale.
3. Ne jamais inventer de faits, de chiffres ou de citations absents du résumé fourni.
4. Ton engageant et informé — présenter tensions et enjeux de façon concrète, jamais sensationnaliste.
5. Ne jamais écrire de contenu discriminatoire (religion, ethnie, genre, orientation sexuelle).
6. Respecter les politiques de Facebook : pas de violence explicite, pas de contenu adulte, pas de désinformation.

═══════════════════════════════════════════════════════════════
SECTION 2 — PUBLICATION FACEBOOK : MASTER POST PACKAGE TEMPLATE
═══════════════════════════════════════════════════════════════

Chaque publication Facebook respecte cette structure en 7 blocs obligatoires, dans cet ordre exact.

BLOC 1 — HOOK (1 seule phrase, obligatoire)
Formuler la tension ou le conflit central de l'article — qui s'affronte, qui perd, qui gagne, quel choix est imposé. JAMAIS commencer par "Aujourd'hui", "Dans une décision", "Récemment" ou "En ce moment". Aller directement au cœur du conflit ou au chiffre qui révèle l'enjeu réel. C'est la première phrase que le lecteur voit — elle doit provoquer l'arrêt du scroll.
❌ "Le gouvernement annonce une réforme du chômage." (neutre, pas de tension)
✅ "600 000 chômeurs vont perdre leurs droits plus vite — le gouvernement a tranché." (acteur + perdant + décision)
❌ "L'Italia approva una nuova legge sul lavoro." (neutro, nessuna tensione)
✅ "2 milioni di lavoratori a rischio : il Parlamento ha votato sì." (numero + chi perde + azione concreta)

BLOC 2 — CONTEXTE (2 à 3 phrases)
Répondre aux questions : qui, quoi, où, quand. Maximum 25 mots par phrase. Ton neutre et factuel. Aucun jugement. Aucune opinion.

BLOC 3 — DÉTAILS (3 à 5 bullet points)
Format obligatoire : "• [fait précis]". Un seul fait par bullet point. Chiffres concrets si disponibles. Aucune répétition du contexte du bloc 2. Aucun bullet vague ou générique.

BLOC 4 — ENJEUX (1 seule phrase)
Impact concret pour le lecteur adulte de 35+ : pouvoir d'achat, santé, sécurité, logement, emploi, retraite. Commencer par "Concrètement," ou équivalent dans la langue cible. JAMAIS utiliser "historique", "sans précédent", "révolutionnaire" sauf si l'article emploie ces termes explicitement.

ENJEUX INTERNATIONAUX — règle impérative :
Pour tout article dont le sujet principal se déroule hors du pays cible, la première phrase de l'intro DOIT répondre à la question : "Qu'est-ce que cela change concrètement pour [pays cible] ?" Si le résumé ne contient pas cette information, formuler l'enjeu géopolitique ou économique le plus probable pour ce pays.

BLOC 5 — QUESTION D'ENGAGEMENT (1 seule question)
La question doit être fermée (Oui/Non), binaire (A ou B ?), ou triptyque (A, B ou C ?). Jamais ouverte seule. Elle doit forcer une prise de position ou un choix immédiat du lecteur.
❌ "Qu'en pensez-vous ?" (ouverte, pas d'ancrage)
❌ "Quelle est votre opinion sur cette réforme ?" (ouverte)
✅ "Est-ce que +38 € par mois, c'est suffisant face à la hausse des prix ?" (binaire implicite, ancrage chiffré)
✅ "Vaccin obligatoire : pour, contre, ou seulement pour les soignants ?" (triptyque clair)
✅ "Giusto o sbagliato ? La legge passa con 5 voti di scarto." (binaire émotionnel, chiffre d'ancrage)

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
- VOIX ACTIVE OBLIGATOIRE : sujet → verbe → objet. Bannir la voix passive sauf citation directe.
- PROTAGONISTE NOMMÉ : si l'article mentionne une personne principale, utiliser son nom de famille dans le hook (ex : "Macron signe", "Meloni annonce"). Dans image_headline, utiliser le nom de famille seul si un seul protagoniste est identifié.

SEED COMMENT — règle de sélection :
Le seed comment est publié dans les 2 minutes après le post pour initier le débat.
Une liste de templates éligibles est fournie dans le message utilisateur. Choisir le template dont le ton correspond le mieux au contenu de l'article.
Remplir le placeholder {topic_noun} avec le sujet précis de l'article (3–6 mots max, dans la langue cible). Ne pas laisser {topic_noun} tel quel.
Retourner dans seed_comment_template_id l'identifiant du template choisi (ex : "fr_03").
Exception décès/hommage : si l'article traite d'un décès, commémoration ou hommage, répondre avec format condoléances : "🕊️ Une pensée pour [personne concernée]. Partagez vos pensées en commentaire. 💙" et seed_comment_template_id = "condolences".

STORY CATEGORY — choisir exactement un parmi ces 7 :
Politique | Société | Sport | Culture | International | Santé | Environnement
En cas de doute entre Politique et Société : préférer Société si l'impact est direct sur la vie quotidienne des citoyens.

CONTENT_SIGNALS — champs à remplir systématiquement :
- binary_frame (bool) : true si l'article présente clairement deux camps opposés (pour/contre, gagnants/perdants)
- poll_fit_score (int 1–5) : score de viralité sondage — 5 si une question OUI/NON évidente se dégage, 1 si aucune
- protagonist_named (string | null) : nom de famille du protagoniste principal si un seul est mentionné, sinon null
- best_format (enum) : "post" (standard) | "carousel" (sujet multi-angles) | "reel" (événement visuel fort)
- fr_it_stake_first_sentence (bool) : true si la première phrase de l'intro répond à "qu'est-ce que ça change pour [pays] ?"
- pillar_hint (string | null) : pilier éditorial le plus pertinent pour cet article (voir Section 4 pour la liste par pays)

FORMAT DE RÉPONSE — CAPTION :
{
  "intro": "[blocs 1 à 4 : hook + contexte + détails + enjeux, avec \\n pour les sauts de ligne entre paragraphes]",
  "question": "[bloc 5 : question d'engagement, 1 phrase se terminant par ?]",
  "cta": "[blocs 6-7 + hashtags : 📰 Source(s) : X + 👉 CTA + hashtags inline, avec \\n entre chaque élément]",
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#HashtagPage"],
  "seed_comment": "[template rempli avec topic_noun]",
  "seed_comment_template_id": "fr_03",
  "story_category": "Société",
  "content_signals": {
    "binary_frame": true,
    "poll_fit_score": 4,
    "protagonist_named": "Macron",
    "best_format": "post",
    "fr_it_stake_first_sentence": true,
    "pillar_hint": "france-en-debat"
  }
}

EXEMPLE COMPLET — français, économie :
{
  "intro": "3 millions de salariés vont voir leur fiche de paie changer dès janvier.\n\nLe gouvernement a officialisé une hausse du SMIC de 2,2% applicable au 1er janvier 2026. La mesure touche l'ensemble des secteurs privé et public. C'est la troisième revalorisation en deux ans.\n\n• Nouveau montant brut mensuel : 1 801 €\n• Hausse nette estimée : +38 € par mois\n• Secteurs les plus touchés : restauration, aide à domicile, commerce\n• Les salaires au-dessus du SMIC ne sont pas concernés\n• Coût employeur : +2,2% sur la masse salariale\n\nConcrètement, pour des millions de foyers français au salaire minimum, c'est la différence entre boucler ou non un budget serré.",
  "question": "Est-ce que +38 € par mois, c'est suffisant face à la hausse des prix des deux dernières années ?",
  "cta": "📰 Source(s) : Le Monde\n\n👉 Suivez France Aujourd'hui pour rester informé de l'actualité française — chaque jour.\n\n#SMIC #HausseSalaire #France #Société #FranceAujourdhui",
  "hashtags": ["#SMIC", "#HausseSalaire", "#France", "#Société", "#FranceAujourdhui"],
  "seed_comment": "💬 Et vous ? la hausse du SMIC — votre réaction en commentaire 👇",
  "seed_comment_template_id": "fr_01",
  "story_category": "Société",
  "content_signals": {
    "binary_frame": false,
    "poll_fit_score": 4,
    "protagonist_named": null,
    "best_format": "post",
    "fr_it_stake_first_sentence": true,
    "pillar_hint": "france-en-debat"
  }
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
Registre : formel-chaleureux. Vouvoiement strict dans la question d'engagement et le CTA ("Pensez-vous que...", "Et vous ?"). Ton sérieux mais jamais froid — l'information doit toucher le lecteur, pas le mettre à distance. Mots à bannir : "choquant", "incroyable", "buzz", "scandaleux". Hashtag page fixe : #FranceAujourdhui.
Si boost_eligible = false pour cet article : éviter toute formulation qui amplifie une controverse politique, une opposition communautaire ou un sujet sensible aux politiques publicitaires. Reformuler vers l'enjeu factuel (ex : au lieu de "polémique sur...", écrire "le débat porte sur...").
Piliers éditoriaux (utiliser pillar_hint pour guider le ton et l'angle) :
- france-en-debat : sujets de société clivants (retraites, immigration, justice)
- fierte-francaise : réussites, excellence française, patrimoine
- le-monde-vu-paris : actualité internationale vue de France (enjeu france d'abord)
- sondage-du-jour : opinion, sondages, questions de société
- retour-sur : événements commémoratifs, anniversaires, "il y a X ans"
- ma-ville-aujourdhui : actualité locale et régionale
- sport-francais : football et rugby français, résultats OM/OGC Nice/RC Toulon/Stade Toulousain, Tour de France, Roland-Garros, sport régional PACA et Occitanie

ITALIE (IT) — Lingua : italiano
Registro : diretto ed emotivo — il lettore italiano risponde a storie concrete di persone, numeri reali e impatto immediato sulla vita quotidiana. Tono caldo ma autorevole, mai gridato. Parole vietate : "clamoroso", "shock", "bomba", "incredibile". Hashtag fisso : #ItaliaOggi.
Per articoli giudiziari o legali : è consentito citare il nome della legge o dell'articolo di codice (es. "art. 416-bis c.p.") — aiuta il lettore italiano a verificare e aumenta la credibilità.
Se boost_eligible = false per questo articolo : evitare qualsiasi formulazione che amplifichi la controversia politica, l'opposizione comunitaria o soggetti sensibili alle policy pubblicitarie. Riformulare verso il fatto concreto.
Pilastri editoriali (usare pillar_hint per orientare il tono e l'angolo) :
- fatto-del-giorno : notizia principale del giorno, fatto + conseguenza
- italia-nel-mondo : Italia vista dall'estero, o mondo visto dall'Italia
- capire-la-legge : spiegazione di norme, sentenze, riforme giuridiche
- azzurri : sport italiano, Nazionale, eventi sportivi nazionali
- italia-che-funziona : storie positive, eccellenze, soluzioni italiane
- storie-italiane : cronaca umana, storie di persone comuni
- la-mia-citta : attualità locale e regionale italiana
- vaticano : notizie vaticane e religiose cattoliche
Priorità di tono : per articoli IT classificati Società o Sanità, il hook (blocco 1) deve privilegiare l'aggancio emotivo su quello politico — protagonista con nome > istituzione > cifra astratta.

AUSTRALIE (AU) — Language : English
Register: direct, factual, conversational. Sentence case titles. Fixed hashtag: #AustraliaToday.

SUÈDE (SE) — Språk : svenska
Registre : saklig, tydlig. Undvik onödiga superlativer. Fast hashtag : #SverigeIdag.

═══════════════════════════════════════════════════════════════
SECTION 5 — PERSONAS AUDIENCE PAR PAGE
═══════════════════════════════════════════════════════════════

Ces personas définissent le lecteur type de chaque page. Ils guident le choix de l'angle, du ton et de l'accroche — en particulier pour le hook (bloc 1) et la question d'engagement (bloc 5). Ils n'autorisent pas à inventer des faits ni à prendre de positions politiques.

FRANCE — FranceAujourdhui
Profil : retraité(e)s et semi-retraité(e)s de la France méditerranéenne. Concentration géographique : Marseille (23%), Avignon (8%), Hyères (8%), Nice (8%), Perpignan (8%). Villes à gouvernance RN pour Nice et Perpignan — lectorat sensible à la sécurité locale et à l'identité régionale, sans pour autant être partisan.
Valeurs dominantes : identité régionale et méditerranéenne, sécurité locale, pouvoir d'achat, justice/équité, économie locale et touristique, fierté du patrimoine.
Ce qui résonne : sujets sur la Provence, la Côte d'Azur, l'Occitanie ; risques sanitaires en milieu méditerranéen ; justice locale (crimes, tribunaux, faits divers) ; économie du littoral (tourisme, immobilier, coût de la vie) ; météo et environnement méditerranéen ; culture régionale.
Ce qui ne résonne pas : débats de politique parisienne entre partis d'initiés ; polémiques OTAN ou défense abstraite ; fiscalité complexe sans impact local direct ; contenus visant les moins de 40 ans en zone urbaine dense.
Règle de pilier : pour un article local PACA/Occitanie, préférer le pilier "ma-ville-aujourdhui". Pour les faits divers judiciaires locaux, préférer "france-en-debat".
Identité sportive : pour le lectorat PACA/Occitanie, le sport n'est pas du divertissement — c'est de l'identité régionale. L'OM est à Marseille ce que le RC Toulon est au Var : une fierté communautaire. Traiter les victoires comme des événements de fierté collective, les défaites comme un deuil partagé. Hook recommandé pour articles Sport : "L'OM [résultat] — Marseille [réaction émotionnelle collective]". Pour OGC Nice et RC Toulon, même logique de fierté locale. Pilier : sport-francais.

ITALIE — ItaliaOggi
Profil : femmes de 65 ans et plus, concentrées à Rome (31%), présentes dans toutes les grandes villes italiennes (Genova, Milan, Turin, Naples, Palerme). Génération sensible à la sécurité, à la santé et à la foi catholique.
Valeurs dominantes : sécurité de la famille, santé (maladies chroniques, coûts médicaux), justice/injustice, fierté nationale, coût de la vie, foi catholique, solidarité intergénérationnelle.
Ce qui résonne : victimes nommées avec prénom et âge ; angle "nonna/madre/famiglia" ; risques sanitaires concrets (médicaments, hôpitaux, maladies chroniques) ; crimes contre personnes âgées ou enfants ; hausses des prix alimentaires ou médicaux ; nouvelles du Vatican ; histoires de justice rendue ou déniée ; tragédies humaines avec protagoniste identifié.
Ce qui ne résonne pas : mèmes partisans ou débats de couloir parlementaire ; géopolitique abstraite ; fiscalité complexe sans impact sur la pension ; culture tech ou jeunes urbains.
Règle de ton : pour IT, si l'article peut être cadré via une personne nommée (victime, bénéficiaire, protagoniste), l'utiliser dans le bloc 1 plutôt qu'une institution.
Emojis appropriés pour IT : 🙏 (solidarité, foi), ❤️ (famille, émotion), ⚠️ (alerte santé/sécurité), 🕊️ (décès/hommage). Éviter les emojis politiques (🗳️, 🏛️) pour les articles Société.`;

const SEED_COMMENT_TEMPLATES: Record<string, { id: string; t: string }[]> = {
  FR: [
    { id: 'fr_01', t: '💬 Et vous ? {topic_noun} — votre réaction en commentaire 👇' },
    { id: 'fr_02', t: 'Pour ou contre ? {topic_noun} en débat — votre verdict 👇' },
    { id: 'fr_03', t: 'Est-ce que ça vous touche directement ? {topic_noun} — on vous lit tous 👇' },
    { id: 'fr_04', t: 'Un mot pour décrire la situation : {topic_noun} — répondez ici 👇' },
    { id: 'fr_05', t: '🗣️ La parole est à vous. {topic_noun} — votre avis compte.' },
    { id: 'fr_06', t: 'Vous êtes surpris(e) par {topic_noun} ? Dites-le en commentaire 👇' },
    { id: 'fr_07', t: "💬 {topic_noun} — d'accord ou pas ? Un commentaire suffit." },
    { id: 'fr_08', t: 'Dans votre quotidien, {topic_noun} ça change quoi ? Répondez ci-dessous 👇' },
    { id: 'fr_09', t: 'Bonne ou mauvaise nouvelle ? {topic_noun} — votre verdict 👇' },
    { id: 'fr_10', t: 'On débat : {topic_noun} — pour ou contre en commentaire 👇' },
  ],
  IT: [
    { id: 'it_01', t: '💬 E voi, cosa ne pensate? {topic_noun} — un commento ci basta 👇' },
    { id: 'it_02', t: 'Pro o contro? {topic_noun} — il vostro verdetto 👇' },
    { id: 'it_03', t: 'Vi riguarda da vicino? {topic_noun} — rispondete qui sotto 👇' },
    { id: 'it_04', t: 'Una parola su {topic_noun} — scrivetela qui 👇' },
    { id: 'it_05', t: '🗣️ Vi leggiamo tutti. {topic_noun} — cosa ne pensate?' },
    { id: 'it_06', t: "Siete d'accordo? {topic_noun} — dite la vostra 👇" },
    { id: 'it_07', t: '💬 {topic_noun} — buona o cattiva notizia? Un commento qui sotto.' },
    { id: 'it_08', t: 'Nella vostra vita di tutti i giorni, {topic_noun} che effetto fa? 👇' },
    { id: 'it_09', t: 'Un commento vale più di un like. {topic_noun} — scriveteci 👇' },
    { id: 'it_10', t: 'Notizia che vi sorprende? {topic_noun} — reagite qui sotto 👇' },
  ],
};

function pickEligibleTemplates(country: string, recentIds: string[]): { id: string; t: string }[] {
  const pool = SEED_COMMENT_TEMPLATES[country] || [];
  const recent = new Set(recentIds);
  const eligible = pool.filter(t => !recent.has(t.id));
  return eligible.length > 0 ? eligible : pool;
}

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
  pageHashtag: string,
  watermarkFile: string,
  model: string,
  recentSeedTemplateIds: string[] = [],
) {
  const systemBlock = [{
    type: 'text' as const,
    text: CONTENT_SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' as const },
  }];

  // Cap summary at 1500 chars — very long articles caused JSON truncation at 1200 output tokens.
  const summary = (article.summary || 'Non disponible').slice(0, 1500);

  const [captionRes, seoRes, imageRes] = await Promise.all([
    anthropic.messages.create({
      model,
      max_tokens: 1400,
      system: systemBlock,
      messages: [{
        role: 'user',
        content: `OUTPUT FORMAT: you must respond with ONLY a raw JSON object. No markdown, no text before or after, no code fences. Start your response with { and end with }.

Rédige un post Facebook complet pour ${pageName} en ${captionLanguage}.
Hashtag fixe de la page : ${pageHashtag}
${article.boost_eligible === 'false' || article.boost_eligible === false ? `\nNote : boost_eligible=false — adapter le registre selon les règles Section 4 ${article.country}.` : ''}
Structure du post (dans l'ordre, sans labels visibles dans le texte) :
1. Hook — tension/conflit central avec acteur nommé si possible
2. Contexte — 2-3 phrases neutres (qui, quoi, où, quand)
3. Détails — 3-5 bullets commençant par •
4. Enjeux — 1 phrase sur l'impact concret pour le lecteur
5. Question d'engagement — fermée ou binaire (pas ouverte seule)
6. Source : 📰 Source(s) : ${article.source}
7. CTA : 👉 Suivez ${pageName} pour rester informé...
8. Hashtags (max 5, inline à la fin)

JSON attendu :
{"intro":"[blocs 1-4]","question":"[bloc 5]","cta":"[blocs 6-7 + hashtags]","hashtags":["#Tag1","#Tag2","#Tag3"],"seed_comment":"[template rempli]","seed_comment_template_id":"[id du template]","story_category":"[Politique|Société|Sport|Culture|International|Santé|Environnement]","content_signals":{"binary_frame":true,"poll_fit_score":3,"protagonist_named":"Dupont","best_format":"post","fr_it_stake_first_sentence":true,"pillar_hint":"france-en-debat"}}

Templates éligibles pour le seed_comment (choisir un parmi ces IDs, remplir {topic_noun} en ${captionLanguage}) :
${pickEligibleTemplates(article.country, recentSeedTemplateIds).map((t: { id: string; t: string }) => `[${t.id}] "${t.t}"`).join('\n')}

Article :
Titre : ${article.title}
Source : ${article.source}
Résumé : ${summary}`,
      }],
    }),
    anthropic.messages.create({
      model,
      max_tokens: 200,
      system: systemBlock,
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
    }),
    anthropic.messages.create({
      model,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Generate an ultra-realistic AI image prompt AND a short image headline for this news article.

Return JSON only: {"image_prompt": "...", "image_headline": "..."}

IMAGE_HEADLINE rules (STRICT — count words before responding):
- MAXIMUM 6 WORDS. If more than 6 words: rewrite until ≤ 6 words.
- Noun-based preferred. Avoid verbs if possible.
- MUST be written in ${captionLanguage}. NEVER use English. Even if the article summary is in English, the headline must be in ${captionLanguage}.
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

Article: ${article.title}
Summary: ${summary}`,
      }],
    }),
  ]);

  const parseJSON = (text: string, fallback: Record<string, string>) => {
    try {
      const m = text.trim().match(/\{[\s\S]*\}/);
      return JSON.parse(m ? m[0] : text.trim());
    } catch { return fallback; }
  };

  const getText = (res: any): string => {
    const r = typeof res === 'string' ? JSON.parse(res) : res;
    return r.content?.[0]?.text ?? r.completion ?? r.text ?? '';
  };

  const captionRawText = getText(captionRes) || '';
  const captionData = parseJSON(captionRawText, {
    intro: captionRawText,
    question: '',
    cta: '',
    seed_comment: '💬 Et vous, qu\'en pensez-vous ? Est-ce que cette nouvelle vous surprend ? Répondez en commentaire — on lit tout. 👇',
    story_category: 'Société',
  });
  if (!captionData.intro) captionData.intro = captionRawText;
  const seo = parseJSON(getText(seoRes) || '', {
    seo_title: article.title.slice(0, 60),
    seo_description: (article.summary || '').slice(0, 160),
  });
  const imageData = parseJSON(getText(imageRes) || '', {
    image_prompt: '',
    image_headline: '',
  });

  const imagePromptText = (imageData.image_prompt || getText(imageRes)).trim();
  const imageHeadlineWords = (imageData.image_headline || article.title).split(/\s+/);
  const imageHeadline = imageHeadlineWords.slice(0, 6).join(' ');
  const EDGE_ENGLISH_STOPWORDS = /\b(the|and|of|for|has|have|will|with|this|that|are|was|were|been|being)\b/i;
  if (['français', 'italiano'].includes(captionLanguage) && EDGE_ENGLISH_STOPWORDS.test(imageHeadline)) {
    console.error(`image_headline appears English: "${imageHeadline}" (lang: ${captionLanguage}) — regenerate via generate-image.js`);
  }

  return {
    ai_caption: { intro: captionData.intro || '', question: captionData.question || '', cta: captionData.cta || '' },
    seo_title: seo.seo_title,
    seo_description: seo.seo_description,
    image_prompt: imagePromptText,
    formatted_image_prompt: formatImagePrompt(imagePromptText, imageHeadline, watermarkFile),
    image_headline: imageHeadline,
    seed_comment: captionData.seed_comment || null,
    seed_comment_template_id: captionData.seed_comment_template_id || null,
    story_category: captionData.story_category || null,
    hashtags: Array.isArray(captionData.hashtags) ? captionData.hashtags : [],
    content_signals: captionData.content_signals ?? {},
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
  return await handleRequest(req);
  } catch (err: any) {
    console.error('Unhandled error:', err?.message ?? err);
    return new Response(JSON.stringify({ error: err?.message ?? 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { article_ids?: string[]; action?: string; country?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (body.action === 'select_top_news') {
    const country: string | undefined = body.country || undefined;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    let dbQuery = supabase
      .from('articles')
      .select('id, title, summary, criticality, country, source, tags, status')
      .in('status', ['pending', 'approved'])
      .gte('created_at', twelveHoursAgo)
      .order('priority_score', { ascending: false })
      .limit(150);
    if (country) dbQuery = dbQuery.eq('country', country);

    const { data: rawArticles, error: dbErr } = await dbQuery;
    if (dbErr) return new Response(JSON.stringify({ error: dbErr.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    // Exclude articles already posted or already selected as top_pick in a previous run.
    const eligible = (rawArticles ?? []).filter(a => a.status !== 'posted' && !a.tags?.includes('top_pick'));
    const tagged = eligible
      .map(a => ({ ...a, tags: tagArticle(a) }))
      .filter(a => a.tags.length > 0);

    if (tagged.length === 0) {
      return new Response(JSON.stringify({ selected_ids: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropicOpts: { apiKey: string; baseURL?: string } = { apiKey: Deno.env.get('ANTHROPIC_KEY')! };
    const baseURL = Deno.env.get('ANTHROPIC_BASE_URL');
    if (baseURL) anthropicOpts.baseURL = baseURL;
    const anthropic = new Anthropic(anthropicOpts);
    const model = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5-20251001';

    const articleList = tagged.map(a =>
      `ID: ${a.id} [Tags: ${a.tags.join(', ')}]\nTitle: ${a.title}\nSummary: ${a.summary ?? ''}`
    ).join('\n\n');

    const response = await anthropic.messages.create({
      model,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `You are an editorial assistant for a Facebook news page targeting adults aged 35+.\nFrom the pre-tagged articles below, select the best 5–10 for publishing today.\nTag meanings: breaking=major incident, alert=serious event, trending=widely discussed, patriotic=national pride/achievement, social=affects people over 35 (health/economy/housing/pensions).\nPrioritise breaking > alert > patriotic + social > trending.\nReturn ONLY: {"selected_ids": ["id1","id2",...]}\n\nArticles:\n${articleList}`,
      }],
    });

    const parsed = typeof response === 'string' ? JSON.parse(response) : response;
    const firstContent = (parsed as any).content?.[0];
    const text = firstContent?.type === 'text' ? firstContent.text : (parsed as any).completion ?? (parsed as any).text ?? '{}';
    let selected_ids: string[] = [];
    try {
      const m = text.trim().match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m ? m[0] : text.trim());
      selected_ids = parsed.selected_ids ?? [];
    } catch { /* keep empty array */ }

    // Write tags back to DB so editors can filter by them
    await Promise.all(tagged.map(a => {
      const articleTags = selected_ids.includes(a.id) ? [...a.tags, 'top_pick'] : a.tags;
      return supabase.from('articles').update({ tags: articleTags }).eq('id', a.id);
    }));

    return new Response(JSON.stringify({ selected_ids }), {
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
  const anthropicOpts: { apiKey: string; baseURL?: string } = { apiKey: Deno.env.get('ANTHROPIC_KEY')! };
  const baseURL = Deno.env.get('ANTHROPIC_BASE_URL');
  if (baseURL) anthropicOpts.baseURL = baseURL;
  const anthropic = new Anthropic(anthropicOpts);
  const model = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5-20251001';

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
  const errors: { id: string; error: string }[] = [];
  const recentSeedByCountry: Record<string, string[]> = {};

  for (const article of articles ?? []) {
    const captionLanguage = CAPTION_LANGUAGE[article.country] ?? 'français';
    const pageName = PAGE_NAME[article.country] ?? 'Notre Page';
    const pageHashtag = PAGE_HASHTAG[article.country] ?? '#NoutrePage';
    const watermarkFile = WATERMARK_FILES[article.country] ?? 'logo.png';

    try {
      if (!recentSeedByCountry[article.country]) {
        const { data: seedRows } = await supabase
          .from('articles')
          .select('seed_comment_template_id')
          .eq('country', article.country)
          .not('seed_comment_template_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20);
        recentSeedByCountry[article.country] = (seedRows || [])
          .map((r: any) => r.seed_comment_template_id).filter(Boolean);
      }
      const recentSeedIds = recentSeedByCountry[article.country];
      const content = await generateAllContent(anthropic, article, captionLanguage, pageName, pageHashtag, watermarkFile, model, recentSeedIds);
      if (content.seed_comment_template_id) {
        recentSeedByCountry[article.country].push(content.seed_comment_template_id);
      }
      await supabase.from('articles').update(content).eq('id', article.id);
      processed++;
      results.push({ id: article.id, seo_title: content.seo_title });
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.error(`Failed to process article ${article.id}:`, msg);
      errors.push({ id: article.id, error: msg });
    }
  }

  const status = errors.length > 0 && processed === 0 ? 500 : 200;
  return new Response(JSON.stringify({ processed, results, errors }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
