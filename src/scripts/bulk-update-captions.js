import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { computePublishScore } from '../utils/publishScore.js';
import { SLOTS } from '../services/facebook.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function formatImagePrompt(basePrompt, overlayText, watermarkFile) {
  const lightingPatterns = [
    /golden hour/i, /golden afternoon light/i, /golden light/i,
    /cinematic lighting/i, /dramatic.{0,30}lighting/i, /overhead lighting/i,
    /warm golden.{0,20}light/i,
  ];
  let lightingContext = 'the lighting of the scene';
  for (const pattern of lightingPatterns) {
    const match = basePrompt.match(pattern);
    if (match) { lightingContext = match[0].toLowerCase(); break; }
  }
  return `[ORIGINAL PROMPT]\n${basePrompt.trim()}\n\n[TEXT OVERLAY]\nContent: "${overlayText}"\nPosition: upper\nOpacity: 80%\n\n[OUTPUT]\nNo flags, no people visible.\nAdd a subtle gradient overlay beneath the text for legibility.\nOverlay the text above in large white Anton font at the upper position, semi-transparent at 80% opacity, integrated with ${lightingContext}.\nAdd ${watermarkFile} watermark, bottom-right, small, 70% opacity.`;
}

const articles = [
  // ── ITALY ──────────────────────────────────────────────────────────────────
  {
    id: 'c343a4df-8e7e-4f9f-b7ab-5197c3bfbe18',
    country: 'IT', criticality: 'trending', priority_score: 65,
    watermarkFile: 'vivere_in_italia_banner_logo.png',
    ai_caption: {
      intro: 'IL DERBY NON FINISCE IN CAMPO. 🔴\n\nIl Torino pareggia 2-2 con la Juventus in un derby intenso e combattuto. Ma le notizie più importanti arrivano dal presidente Urbano Cairo, che ha già fissato un incontro per decidere il futuro della panchina.\n\n• Risultato: Torino 2-2 Juventus\n• Cairo soddisfatto della prestazione collettiva: "anche chi è entrato ha dato tanto"\n• Incontro Cairo–Petrachi previsto per decidere il futuro di D\'Aversa\n• La stagione si chiude con molti interrogativi sulla guida tecnica\n\nPer i tifosi granata, il pareggio è dolceamaro: un punto conquistato con orgoglio, ma l\'incertezza sull\'allenatore pesa.',
      question: 'Secondo voi, D\'Aversa merita di essere confermato sulla panchina del Torino?',
      cta: '📰 Fonte: Toro News\n\n👉 Seguite Italia Oggi per restare aggiornati sull\'attualità italiana — ogni giorno.\n\n#Torino #SerieA #DerbyDellaMole #ItaliaOggi',
    },
    hashtags: ['#Torino', '#SerieA', '#DerbyDellaMole', '#ItaliaOggi'],
    image_headline: 'DERBY GRANATA 2-2',
    image_prompt: 'An intense football stadium at dusk, the oval bowl lit with golden floodlights against a deep blue sky, a sea of granata dark-red and black-and-white scarves in the stands, the pitch bright green at center, dramatic cinematic lighting, wide-angle aerial perspective, high contrast, emotion-filled atmosphere',
    seo_title: 'Torino-Juventus 2-2: Cairo decide il futuro di D\'Aversa',
    seo_description: 'Il derby della Mole finisce 2-2. Cairo incontrerà Petrachi per decidere la panchina: D\'Aversa confermato o esonerato? Segui gli aggiornamenti.',
    story_category: 'Sport',
    recommended_format: 'poll',
    pillar: 'sport',
    content_signals: { binary_frame: true, poll_fit_score: 5, protagonist_named: 'Cairo', best_format: 'poll', fr_it_stake_first_sentence: true, pillar_hint: 'sport' },
  },
  {
    id: '83fd160f-f575-44a7-923b-4a5aabd3ac25',
    country: 'IT', criticality: 'standard', priority_score: 40,
    watermarkFile: 'vivere_in_italia_banner_logo.png',
    ai_caption: {
      intro: 'CAIRO: «NON MI CANDIDO SINDACO DI MILANO». 🗞️\n\nIn un\'ampia intervista al Corriere della Sera, Urbano Cairo chiude ogni porta alla politica e parla del suo futuro: imprenditore, sempre e solo. E sul derby della Mole, si regala un sogno.\n\n• «Fare l\'imprenditore è l\'opposto della politica: qui le decisioni le prendi tu»\n• Nessuna candidatura a sindaco di Milano: la voce è definitivamente smentita\n• Sul derby: «Battere la Juve sarebbe il più bel regalo di compleanno»\n• Cairo resta concentrato su RCS Media, La7 e Torino FC\n\nUn profilo raro nel panorama italiano: un uomo di potere che rifiuta la politica e preferisce restare nel mondo delle aziende.',
      question: 'Pensate che Cairo farebbe un buon sindaco di Milano, oppure ha ragione a restare nel mondo degli affari?',
      cta: '📰 Fonte: Corriere della Sera\n\n👉 Seguite Italia Oggi per restare aggiornati sull\'attualità italiana — ogni giorno.\n\n#Cairo #Milano #Torino #ItaliaOggi',
    },
    hashtags: ['#Cairo', '#Milano', '#Torino', '#ItaliaOggi'],
    image_headline: 'CAIRO: NO ALLA POLITICA',
    image_prompt: 'A confident Italian businessman in a sharp dark suit standing in a modern Milan office with floor-to-ceiling windows overlooking the city skyline, morning light streaming in, serious yet composed expression, cinematic lighting with warm golden tones, photorealistic, high contrast',
    seo_title: 'Cairo: «Non mi candido sindaco di Milano, resto imprenditore»',
    seo_description: 'Cairo chiude le porte alla politica in un\'intervista al Corriere. Sul derby col Torino: battere la Juventus il miglior regalo di compleanno.',
    story_category: 'Politica',
    recommended_format: 'image',
    pillar: 'politica-economia',
    content_signals: { binary_frame: true, poll_fit_score: 4, protagonist_named: 'Cairo', best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'politica-economia' },
  },
  {
    id: 'ff46d92b-2503-4bd5-8309-4f5cbc2286a1',
    country: 'IT', criticality: 'standard', priority_score: 40,
    watermarkFile: 'vivere_in_italia_banner_logo.png',
    ai_caption: {
      intro: '«SONO CONTENTO DI TUTTI». La voce di Cairo dopo il derby. 🔴\n\nA pochi minuti dal fischio finale, il presidente del Torino Urbano Cairo commenta il pareggio 2-2 contro la Juventus con soddisfazione per l\'atteggiamento di tutta la squadra.\n\n• «È stato un buon derby, la squadra ha lottato fino alla fine»\n• Cairo elogia anche i subentrati: «Chi è entrato ha dato tanto»\n• Il morale è alto nonostante il pareggio\n• Rimane aperta la questione panchina: incontro con Petrachi in programma\n\nUna squadra che ha lasciato tutto in campo — e un presidente che lo riconosce pubblicamente.',
      question: 'Il Torino meritava la vittoria nel derby, oppure il 2-2 è un risultato giusto?',
      cta: '📰 Fonte: La Gazzetta dello Sport\n\n👉 Seguite Italia Oggi per restare aggiornati sull\'attualità italiana — ogni giorno.\n\n#Torino #Juventus #SerieA #ItaliaOggi',
    },
    hashtags: ['#Torino', '#Juventus', '#SerieA', '#ItaliaOggi'],
    image_headline: 'CAIRO DOPO IL DERBY',
    image_prompt: 'A football club president speaking to journalists in a stadium tunnel after a match, surrounded by microphones and cameras, floodlit stadium visible in background, warm golden stadium lights, Italian football atmosphere, cinematic lighting, photorealistic',
    seo_title: 'Cairo dopo il derby: «Sono contento, chi è entrato ha dato tanto»',
    seo_description: 'Il presidente del Torino soddisfatto dopo il 2-2 con la Juventus. Cairo elogia tutta la squadra e anticipa l\'incontro con Petrachi sul futuro tecnico.',
    story_category: 'Sport',
    recommended_format: 'image',
    pillar: 'sport',
    content_signals: { binary_frame: true, poll_fit_score: 4, protagonist_named: 'Cairo', best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'sport' },
  },
  {
    id: '0c53541e-4f7f-4c3a-a106-1cab9f8ae2dc',
    country: 'IT', criticality: 'standard', priority_score: 25,
    watermarkFile: 'vivere_in_italia_banner_logo.png',
    ai_caption: {
      intro: 'ANTONELLI CAMPIONE A MONTREAL. 🏆🇮🇹\n\nKimi Antonelli vince il Gran Premio del Canada e firma un\'altra pagina straordinaria della sua stagione in Formula 1. Il giovane talento italiano della Mercedes supera tutti sul circuito di Montreal.\n\n• Antonelli trionfa a Montreal davanti a decine di migliaia di tifosi\n• Il compagno di squadra George Russell è costretto al ritiro\n• Una battaglia interna alla Mercedes ha tenuto col fiato sospeso per tutta la gara\n• Il giovane pilota italiano si conferma tra i migliori della griglia 2026\n\nL\'Italia torna sul gradino più alto del podio in Formula 1. Antonelli sta diventando il nuovo simbolo del motorsport italiano.',
      question: 'Secondo voi, Antonelli può diventare il prossimo campione del mondo di Formula 1?',
      cta: '📰 Fonte: Sky Sports\n\n👉 Seguite Italia Oggi per restare aggiornati sull\'attualità italiana — ogni giorno.\n\n#Antonelli #F1 #FormulaUno #GranPremio #ItaliaOggi',
    },
    hashtags: ['#Antonelli', '#F1', '#FormulaUno', '#ItaliaOggi'],
    image_headline: 'ANTONELLI VINCE IN CANADA',
    image_prompt: 'A Formula 1 race car crossing the finish line at Circuit Gilles Villeneuve in Montreal, checkered flag waving, crowd cheering wildly, golden afternoon light casting long shadows, dramatic cinematic color grading, motion blur on wheels, high energy victory atmosphere, photorealistic',
    seo_title: 'Antonelli vince il GP Canada: Russell si ritira, Mercedes in festa',
    seo_description: 'Kimi Antonelli trionfa nel Gran Premio del Canada. Il giovane italiano della Mercedes conquista una vittoria emozionante dopo una battaglia interna con Russell.',
    story_category: 'Sport',
    recommended_format: 'image',
    pillar: 'sport',
    content_signals: { binary_frame: false, poll_fit_score: 4, protagonist_named: 'Antonelli', best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'sport' },
  },
  {
    id: '2ac917b4-064c-4155-bc39-4e20ba87785d',
    country: 'IT', criticality: 'standard', priority_score: 25,
    watermarkFile: 'vivere_in_italia_banner_logo.png',
    ai_caption: {
      intro: 'WOLFF: «APPENA ACCETTABILE». Il GP del Canada lascia l\'amaro in bocca alla Mercedes. 🏎️\n\nIl team principal Toto Wolff commenta con parole misurate la doppia storia del Gran Premio del Canada: la vittoria di Antonelli è positiva, ma il ritiro di Russell e la battaglia interna preoccupano.\n\n• Wolff definisce il risultato «dolceamaro» dopo il ritiro di Russell\n• La battaglia tra i due piloti Mercedes ha rischiato di compromettere entrambi\n• «Appena accettabile» è il giudizio del team principal sulla gestione di gara\n• La Mercedes deve rivedere la strategia di squadra per i prossimi Gran Premi\n\nLa vittoria di Antonelli è un successo, ma il modo in cui è arrivata preoccupa il vertice del team.',
      question: 'La Mercedes avrebbe dovuto imporre ordini di scuderia per evitare la battaglia interna tra Antonelli e Russell?',
      cta: '📰 Fonte: Formula 1\n\n👉 Seguite Italia Oggi per restare aggiornati sull\'attualità italiana — ogni giorno.\n\n#Mercedes #Wolff #F1 #ItaliaOggi',
    },
    hashtags: ['#Mercedes', '#Wolff', '#F1', '#ItaliaOggi'],
    image_headline: 'WOLFF: RISULTATO DOLCEAMARO',
    image_prompt: 'A Formula 1 team principal in a Mercedes branded jacket standing in the pit lane at dusk, looking pensively at monitors, engineers working in the background, neon-lit garage, dramatic overhead lighting with blue and white tones, cinematic wide shot, photorealistic',
    seo_title: 'Wolff: «Appena accettabile» — la Mercedes fa i conti dopo il Canada',
    seo_description: 'Toto Wolff commenta la vittoria di Antonelli e il ritiro di Russell in Canada. Il boss Mercedes critica la gestione della battaglia interna tra i suoi due piloti.',
    story_category: 'Sport',
    recommended_format: 'poll',
    pillar: 'sport',
    content_signals: { binary_frame: true, poll_fit_score: 5, protagonist_named: 'Wolff', best_format: 'poll', fr_it_stake_first_sentence: false, pillar_hint: 'sport' },
  },
  {
    id: 'd24b4715-e73a-487e-8aa1-d92d40676fd3',
    country: 'IT', criticality: 'standard', priority_score: 25,
    watermarkFile: 'vivere_in_italia_banner_logo.png',
    ai_caption: {
      intro: 'CHI HA DORMITO PEGGIO STANOTTE? TOTO WOLFF. 😅🏎️\n\nDopo il Gran Premio del Canada, i commenti non mancano: la vittoria di Antonelli è accompagnata dalla tensione interna alla Mercedes e dall\'uscita di pista di Russell. Il grande deluso della notte è proprio il boss del team.\n\n• Wolff ha gestito una battaglia interna ad alto rischio senza imporre ordini di scuderia\n• Russell esce dal GP senza punti, Antonelli vince ma tra mille polemiche\n• Gli analisti di Motorsport.com indicano Wolff come il più penalizzato emotivamente\n• La Mercedes deve trovare un equilibrio interno prima del prossimo appuntamento\n\nVincere così, con un compagno di squadra ritirato, non è mai una vittoria piena. E Wolff lo sa benissimo.',
      question: 'Chi ha sofferto di più dopo il GP del Canada: Wolff, Russell, o entrambi ugualmente?',
      cta: '📰 Fonte: Motorsport.com\n\n👉 Seguite Italia Oggi per restare aggiornati sull\'attualità italiana — ogni giorno.\n\n#F1 #Mercedes #Wolff #ItaliaOggi',
    },
    hashtags: ['#F1', '#Mercedes', '#Wolff', '#ItaliaOggi'],
    image_headline: 'WOLFF, NOTTE DIFFICILE',
    image_prompt: 'A stressed Formula 1 team manager sitting alone in an empty pit lane late at night, a laptop open with race data, pit wall monitors glowing blue and white, scattered strategy papers, dim overhead lighting with cool blue tint, cinematic noir atmosphere, photorealistic',
    seo_title: 'GP Canada: perché Wolff è il grande deluso della notte',
    seo_description: 'Toto Wolff alle prese con le conseguenze della battaglia Mercedes in Canada: Russell ritirato, Antonelli vincitore, ma la squadra paga un prezzo alto internamente.',
    story_category: 'Sport',
    recommended_format: 'image',
    pillar: 'sport',
    content_signals: { binary_frame: false, poll_fit_score: 3, protagonist_named: 'Wolff', best_format: 'post', fr_it_stake_first_sentence: false, pillar_hint: 'sport' },
  },
  {
    id: 'afa93a54-0386-4e9f-9ca5-c560b3b6508f',
    country: 'IT', criticality: 'standard', priority_score: 5,
    watermarkFile: 'vivere_in_italia_banner_logo.png',
    ai_caption: {
      intro: 'PSICOLOGI IN PIAZZA AL MINISTERO. ✊\n\nLa protesta dei professionisti della salute mentale si intensifica: gli psicologi italiani scendono in campo contro l\'aumento contributivo imposto dall\'Enpap — la loro cassa previdenziale — senza alcuna consultazione preventiva della categoria.\n\n• Aumento contributivo Enpap definito «calato dall\'alto» senza confronto con i professionisti\n• La protesta si sposta fisicamente al Ministero competente\n• Gli psicologi chiedono trasparenza e dialogo prima di qualsiasi modifica\n• La salute mentale in Italia è già sotto pressione: più costi significa meno professionisti accessibili\n\nDietro la protesta c\'è una domanda semplice: chi tutela chi tutela la salute mentale degli italiani?',
      question: 'Pensate che gli psicologi abbiano ragione a protestare contro l\'aumento contributivo imposto dall\'Enpap?',
      cta: '📰 Fonte: Il Fatto Quotidiano\n\n👉 Seguite Italia Oggi per restare aggiornati sull\'attualità italiana — ogni giorno.\n\n#Psicologi #SaluteMentale #Enpap #ItaliaOggi',
    },
    hashtags: ['#Psicologi', '#SaluteMentale', '#Enpap', '#ItaliaOggi'],
    image_headline: 'PSICOLOGI: NO ALL\'ENPAP',
    image_prompt: 'A group of professionals in business casual attire holding protest signs in front of a large Italian government ministry building in Rome, bright morning light, classical Roman architecture in background, calm but determined atmosphere, wide-angle shot, photorealistic',
    seo_title: 'Psicologi protestano al Ministero contro l\'aumento contributivo Enpap',
    seo_description: 'Gli psicologi italiani manifestano contro l\'aumento contributivo imposto dall\'Enpap, accusata di non aver consultato la categoria. La protesta si sposta al Ministero.',
    story_category: 'Società',
    recommended_format: 'image',
    pillar: 'salute',
    content_signals: { binary_frame: true, poll_fit_score: 4, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'salute' },
  },

  // ── FRANCE ─────────────────────────────────────────────────────────────────
  {
    id: '85fa45f2-6461-43df-92b0-91f7f454ed85',
    country: 'FR', criticality: 'standard', priority_score: 25,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'LES BTS DOMINENT LES AMERICAN MUSIC AWARDS. 🎶🏆\n\nLe groupe coréen BTS a remporté le titre d\'Artiste de l\'Année aux American Music Awards, l\'une des distinctions les plus prestigieuses de la musique mondiale. Une victoire qui confirme la domination de la K-pop sur la scène internationale.\n\n• BTS couronnés Artistes de l\'Année aux AMA 2026\n• Le groupe continue de battre des records d\'audience planétaire\n• La K-pop s\'impose comme force culturelle dominante de cette décennie\n• Des millions de fans en France célèbrent la victoire sur les réseaux sociaux\n\nQue l\'on soit fan ou non, l\'impact culturel des BTS est aujourd\'hui indéniable — y compris sur la jeunesse française.',
      question: 'Êtes-vous fan de BTS et de la K-pop, ou ce phénomène vous laisse-t-il indifférent(e) ?',
      cta: '📰 Source(s) : BBC\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité mondiale — chaque jour.\n\n#BTS #Kpop #AMA #Musique #FranceAujourdhui',
    },
    hashtags: ['#BTS', '#Kpop', '#AMA', '#Musique', '#FranceAujourdhui'],
    image_headline: 'BTS : ARTISTES DE L\'ANNÉE',
    image_prompt: 'A grand concert stage bathed in dramatic purple and blue spotlights, an immense crowd of fans waving glowing lightsticks, confetti falling from above, massive LED screens with award announcements, cinematic wide shot from stage level, high-energy atmosphere, photorealistic',
    seo_title: 'BTS élus Artistes de l\'Année aux American Music Awards 2026',
    seo_description: 'Le groupe coréen BTS remporte le titre suprême aux AMA 2026. La K-pop confirme sa domination mondiale, avec des millions de fans en France et en Europe.',
    story_category: 'Culture',
    recommended_format: 'image',
    pillar: 'culture',
    content_signals: { binary_frame: true, poll_fit_score: 4, protagonist_named: 'BTS', best_format: 'post', fr_it_stake_first_sentence: false, pillar_hint: 'culture' },
  },
  {
    id: '0d275ddf-724e-43d5-9c1e-5ed4d3aee1c5',
    country: 'FR', criticality: 'standard', priority_score: 25,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'LES GRANDS GAGNANTS DE LA 52e CÉRÉMONIE DES AMA. 🏆🎵\n\nLa 52e édition des American Music Awards a livré son palmarès complet : une soirée de records, de surprises et de performances mémorables suivie par des millions de fans à travers le monde, dont en France.\n\n• Palmarès complet annoncé pour les AMA 2026\n• BTS couronnés Artistes de l\'Année dans une salle en délire\n• Plusieurs artistes internationaux très suivis en France récompensés\n• Une cérémonie commentée en direct sur les réseaux sociaux français\n\nLa musique américaine reste une référence culturelle mondiale — et les Français y sont particulièrement attentifs.',
      question: 'Avez-vous suivi la cérémonie des AMA cette année, et êtes-vous d\'accord avec le palmarès ?',
      cta: '📰 Source(s) : American Music Awards\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité culturelle — chaque jour.\n\n#AMA #Musique #AmericanMusicAwards #FranceAujourdhui',
    },
    hashtags: ['#AMA', '#Musique', '#AmericanMusicAwards', '#FranceAujourdhui'],
    image_headline: 'AMA 2026 : LE PALMARÈS',
    image_prompt: 'A glamorous awards ceremony stage with golden spotlights and a giant chandelier, red carpet in the foreground, shining golden trophy statues on display, audience in formal evening attire, cinematic dramatic lighting, wide-angle photorealistic shot',
    seo_title: 'American Music Awards 2026 : le palmarès complet de la 52e édition',
    seo_description: 'Les AMA 2026 ont révélé leurs lauréats. BTS, Artiste de l\'Année, domine une soirée pleine de surprises. Découvrez tous les gagnants de cette 52e cérémonie.',
    story_category: 'Culture',
    recommended_format: 'image',
    pillar: 'culture',
    content_signals: { binary_frame: true, poll_fit_score: 3, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: false, pillar_hint: 'culture' },
  },
  {
    id: 'b85fd31b-9231-4352-9945-1d9cd4b9337d',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'FRANCE SOUS UN DÔME DE CHALEUR HISTORIQUE. 🌡️🔥\n\nDepuis le début de cet épisode caniculaire, les records mensuels de température s\'accumulent en France à un rythme alarmant. France Info publie une visualisation complète de l\'ampleur de l\'événement région par région.\n\n• Des records mensuels de température battus dans de nombreuses régions françaises\n• Le « dôme de chaleur » est un phénomène météorologique bloquant la circulation de l\'air\n• Les populations vulnérables — personnes âgées, nourrissons — sont en première ligne\n• Les autorités rappellent les gestes essentiels : hydratation, recherche de fraîcheur, vigilance accrue\n\nLes climatologues sont formels : ces épisodes vont se multiplier. La question n\'est plus « si » mais « quand » le prochain surviendra.',
      question: 'Avez-vous constaté des effets de cette vague de chaleur là où vous habitez ?',
      cta: '📰 Source(s) : France Info\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité française — chaque jour.\n\n#Canicule #DômeDeChauleur #Météo #France #FranceAujourdhui',
    },
    hashtags: ['#Canicule', '#DômeDeChauleur', '#Météo', '#France', '#FranceAujourdhui'],
    image_headline: 'CANICULE : RECORDS BATTUS',
    image_prompt: 'A cracked sun-scorched earth landscape in southern France under a blazing midday sun, a thermometer in close-up showing extreme heat, intense heat haze rising from the ground, deep orange and red sky, cinematic dramatic color grading, wide angle, photorealistic',
    seo_title: 'Dôme de chaleur : les records de température battus région par région',
    seo_description: 'La France subit un dôme de chaleur exceptionnel. France Info cartographie les records mensuels de température battus depuis le début de l\'épisode caniculaire.',
    story_category: 'Environnement',
    recommended_format: 'image',
    pillar: 'environnement',
    content_signals: { binary_frame: false, poll_fit_score: 3, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'environnement' },
  },
  {
    id: 'd85812e2-a000-4141-8728-0f4cc3a4662b',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'ROLAND-GARROS 2026 : LES GRANDES QUESTIONS AVANT LE COUP D\'ENVOI. 🎾\n\nLe tournoi du Grand Chelem parisien s\'apprête à débuter, et France Info pose les quatre questions clés que se posent tous les amateurs de tennis en France.\n\n• Jannik Sinner, grand favori sur terre battue — les Français peuvent-ils rivaliser ?\n• Les Bleus dans le doute : Humbert, Moutet et les autres face à un tableau relevé\n• Tableau féminin complètement ouvert cette année\n• Les Françaises auront-elles leur mot à dire dans ce Roland-Garros 2026 ?\n\nPour des millions de Français, les deux semaines de Roland-Garros représentent le rendez-vous tennistique annuel incontournable.',
      question: 'Un Français peut-il remporter Roland-Garros 2026, ou Sinner est-il imbattable sur terre battue ?',
      cta: '📰 Source(s) : France Info\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité française — chaque jour.\n\n#RolandGarros #Tennis #Sinner #FranceAujourdhui',
    },
    hashtags: ['#RolandGarros', '#Tennis', '#Sinner', '#FranceAujourdhui'],
    image_headline: 'ROLAND-GARROS 2026',
    image_prompt: 'The iconic red clay courts of Roland-Garros in Paris bathed in golden afternoon light, white court lines pristine, empty stands before the tournament begins, the Eiffel Tower faintly visible through the Paris haze in the background, cinematic wide-angle shot, photorealistic',
    seo_title: 'Roland-Garros 2026 : Sinner favori, Français dans le doute',
    seo_description: 'France Info pose les quatre grandes questions de Roland-Garros 2026 : les Français face à Sinner, le tableau féminin ouvert, et les chances tricolores de victoire.',
    story_category: 'Sport',
    recommended_format: 'poll',
    pillar: 'sport',
    content_signals: { binary_frame: true, poll_fit_score: 5, protagonist_named: 'Sinner', best_format: 'poll', fr_it_stake_first_sentence: true, pillar_hint: 'sport' },
  },
  {
    id: '00a4065c-b530-40da-a7f1-37f4ec67064c',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'LA PYRAMIDE DE KHÉOPS, CHEF-D\'ŒUVRE ANTISISMIQUE VIEUX DE 4 600 ANS. 🏛️🔬\n\nDes chercheurs ont découvert que la Grande Pyramide de Gizeh résiste aux tremblements de terre de manière remarquable — une propriété intégrée par les architectes de l\'Antiquité bien avant que la sismologie n\'existe en tant que science.\n\n• La forme pyramidale distribue naturellement les forces sismiques vers le sol\n• Les joints entre les blocs de pierre absorbent les vibrations comme un amortisseur naturel\n• La structure n\'a subi aucun dommage majeur malgré plusieurs séismes importants en 46 siècles\n• Les ingénieurs modernes étudient ces principes pour concevoir des bâtiments plus résilients\n\nL\'Antiquité nous enseigne encore des leçons que la technologie moderne peine à égaler.',
      question: 'Saviez-vous que les pyramides égyptiennes avaient cette propriété antisismique remarquable ?',
      cta: '📰 Source(s) : Libération\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité scientifique — chaque jour.\n\n#Khéops #Pyramide #Science #Archéologie #FranceAujourdhui',
    },
    hashtags: ['#Khéops', '#Pyramide', '#Science', '#Archéologie', '#FranceAujourdhui'],
    image_headline: 'KHÉOPS : 4 600 ANS DE RÉSISTANCE',
    image_prompt: 'The Great Pyramid of Giza at golden hour, a dramatic warm desert sky with the sun low on the horizon casting long shadows across the sand, slight heat haze, cinematic wide-angle shot from ground level making the pyramid appear truly monumental, photorealistic, high contrast',
    seo_title: 'La pyramide de Khéops résiste aux séismes depuis 4 600 ans',
    seo_description: 'Des chercheurs révèlent que la pyramide de Khéops est un chef-d\'œuvre antisismique naturel. Sa conception protège la structure des tremblements de terre depuis 46 siècles.',
    story_category: 'Culture',
    recommended_format: 'image',
    pillar: 'culture',
    content_signals: { binary_frame: false, poll_fit_score: 2, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: false, pillar_hint: 'culture' },
  },
  {
    id: '901ed5f0-ff41-485d-9610-fb318d4a5b9d',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'ACCORD IRANO-AMÉRICAIN : LES NÉGOCIATIONS S\'INTENSIFIENT. 🕊️\n\nWashington et Téhéran seraient à quelques étapes de finaliser un accord qui pourrait mettre fin à l\'un des conflits les plus complexes du Moyen-Orient. France 24 révèle les contours de ces discussions cruciales.\n\n• Des négociations discrètes en cours depuis plusieurs semaines entre les deux pays\n• Les principaux points de friction : programme nucléaire iranien et allègement des sanctions\n• Un accord éventuel bouleverserait l\'équilibre géopolitique régional\n• Pour la France et l\'Europe : un accord signifie une stabilité régionale et un impact direct sur les prix de l\'énergie\n\nLa France, partenaire historique des négociations sur le nucléaire iranien, suit de très près l\'évolution de la situation.',
      question: 'Pensez-vous qu\'un accord durable entre les États-Unis et l\'Iran est réellement possible cette fois ?',
      cta: '📰 Source(s) : France 24\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité internationale — chaque jour.\n\n#Iran #EtatsUnis #Diplomatie #MoyenOrient #FranceAujourdhui',
    },
    hashtags: ['#Iran', '#EtatsUnis', '#Diplomatie', '#MoyenOrient', '#FranceAujourdhui'],
    image_headline: 'USA–IRAN : ACCORD EN VUE',
    image_prompt: 'Two diplomats shaking hands in a formal high-ceilinged negotiation room with national flags in the background, a large oval conference table with papers and water glasses, dramatic overhead lighting, wide-angle cinematic shot, photorealistic, tense yet hopeful atmosphere',
    seo_title: 'États-Unis et Iran cherchent à finaliser un accord de paix',
    seo_description: 'Washington et Téhéran intensifient les négociations pour un accord qui pourrait mettre fin au conflit. L\'enjeu pour la France : stabilité régionale et prix de l\'énergie.',
    story_category: 'International',
    recommended_format: 'image',
    pillar: 'international',
    content_signals: { binary_frame: true, poll_fit_score: 4, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'international' },
  },
  {
    id: '562af706-ce66-401e-9b18-3c76e5d10e7e',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'RIXE À LA COUPE DE FRANCE : 17 PERSONNES DEVANT LA JUSTICE. ⚖️\n\nDix-sept personnes ont été présentées à un juge d\'instruction à la suite d\'une rixe qui a éclaté en marge d\'un match de la Coupe de France. Les violences dans et autour des stades restent un sujet préoccupant.\n\n• 17 individus présentés à un juge d\'instruction après les violences\n• La rixe s\'est produite aux abords du stade lors d\'un match de Coupe de France\n• Le phénomène de violence dans le football français inquiète clubs et autorités\n• Des mesures de sécurité renforcées seraient envisagées par la LFP\n\nLe football français paie encore le prix de la violence en dehors des terrains — un problème structurel qui dépasse le simple fait divers.',
      question: 'Les sanctions actuelles sont-elles suffisantes pour lutter contre la violence dans et autour des stades français ?',
      cta: '📰 Source(s) : Libération\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité française — chaque jour.\n\n#CoupeDeFrance #Football #Justice #FranceAujourdhui',
    },
    hashtags: ['#CoupeDeFrance', '#Football', '#Justice', '#FranceAujourdhui'],
    image_headline: 'RIXE STADE : 17 EN JUSTICE',
    image_prompt: 'Police officers in high-visibility vests managing a tense crowd outside a French football stadium at dusk, stadium floodlights illuminating the scene from behind, crowd control barriers and fences visible, cinematic wide-angle shot, photorealistic',
    seo_title: 'Rixe Coupe de France : 17 personnes devant un juge d\'instruction',
    seo_description: '17 individus présentés devant la justice après une rixe en marge de la Coupe de France. La violence dans les stades français au cœur d\'une nouvelle procédure judiciaire.',
    story_category: 'Société',
    recommended_format: 'image',
    pillar: 'france-en-debat',
    content_signals: { binary_frame: true, poll_fit_score: 4, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'france-en-debat' },
  },
  {
    id: '927f4913-ba0e-4e90-9fdc-2176ec154afb',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'LES « JEUX DES DOPÉS » : LIBERTÉ SPORTIVE OU DANGER POUR LA SANTÉ ? 💉🏋️\n\nLes Enhanced Games, une compétition sportive où le dopage est officiellement autorisé, suscitent une vive controverse. Libération analyse les risques réels pour les athlètes qui y participent.\n\n• Les Enhanced Games permettent l\'usage légal de substances dopantes\n• Les risques cardiovasculaires, hormonaux et psychologiques sont sérieusement documentés\n• Les organisateurs défendent le concept au nom de la liberté individuelle des athlètes adultes\n• Les médecins sportifs et les fédérations internationales s\'y opposent fermement\n\nPour les amateurs de sport, cette compétition pose une question fondamentale : où s\'arrête le sport, et où commence l\'expérimentation médicale ?',
      question: 'Les Enhanced Games devraient-ils être autorisés, ou représentent-ils une menace pour les valeurs fondamentales du sport ?',
      cta: '📰 Source(s) : Libération\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité sportive — chaque jour.\n\n#EnhancedGames #Dopage #Sport #Santé #FranceAujourdhui',
    },
    hashtags: ['#EnhancedGames', '#Dopage', '#Sport', '#Santé', '#FranceAujourdhui'],
    image_headline: 'JEUX DOPÉS : LES RISQUES',
    image_prompt: 'A muscular athlete in a stark clinical white laboratory setting surrounded by medical equipment, vials and performance supplements on a stainless steel table, dramatic overhead lighting casting hard shadows, cold blue and white color palette, cinematic wide shot, photorealistic',
    seo_title: 'Enhanced Games : quels risques pour la santé des athlètes dopés ?',
    seo_description: 'Les Enhanced Games légalisent le dopage sportif. Libération décrypte les risques cardiaques, hormonaux et psychologiques que courent les athlètes participants.',
    story_category: 'Santé',
    recommended_format: 'poll',
    pillar: 'sante',
    content_signals: { binary_frame: true, poll_fit_score: 5, protagonist_named: null, best_format: 'poll', fr_it_stake_first_sentence: false, pillar_hint: 'sante' },
  },
  {
    id: '7f34f195-d3a9-4d9c-93db-3cea0973785f',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'LA DIASPORA CONGOLAISE VEUT BÂTIR SON PAYS. 🇨🇩🌍\n\nEn entretien avec France 24, des membres de la diaspora congolaise en France expriment un désir fort et sincère de contribuer au développement de la République démocratique du Congo — malgré la distance et les défis politiques.\n\n• La diaspora congolaise est l\'une des plus actives d\'Afrique centrale présente en France\n• Les transferts d\'argent de la diaspora représentent une part significative du PIB congolais\n• Au-delà de l\'argent : des compétences, des réseaux et une volonté d\'agir concrètement\n• Les obstacles restent nombreux : instabilité politique, corruption, manque d\'infrastructures\n\nPour la communauté française d\'origine congolaise, ce sujet touche à l\'identité et à l\'engagement citoyen.',
      question: 'Pensez-vous que la diaspora africaine en France joue un rôle important dans le développement de leurs pays d\'origine ?',
      cta: '📰 Source(s) : France 24\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité internationale — chaque jour.\n\n#Congo #Diaspora #Afrique #Développement #FranceAujourdhui',
    },
    hashtags: ['#Congo', '#Diaspora', '#Afrique', '#Développement', '#FranceAujourdhui'],
    image_headline: 'DIASPORA : BÂTIR LE CONGO',
    image_prompt: 'A confident African professional in business attire speaking at a conference podium, an African city skyline with modern buildings visible through large windows behind, warm morning sunlight, diverse attentive audience in the foreground, cinematic wide-angle, photorealistic',
    seo_title: 'La diaspora congolaise en France veut contribuer au développement du Congo',
    seo_description: 'Des membres de la diaspora congolaise confient à France 24 leur désir de participer au développement du pays malgré l\'instabilité politique et les obstacles structurels.',
    story_category: 'International',
    recommended_format: 'image',
    pillar: 'international',
    content_signals: { binary_frame: true, poll_fit_score: 3, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'international' },
  },
  {
    id: '499e3ffc-756f-4e1f-9508-4e03a3a064fd',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'MOZAMBIQUE : LA FORCE RWANDAISE RESTE À CABO DELGADO. 🌍🇷🇼\n\nLa mission militaire rwandaise déployée dans la province de Cabo Delgado, au nord du Mozambique, a été officiellement prolongée. Une décision stratégique dans une région où la menace jihadiste reste préoccupante.\n\n• La mission rwandaise à Cabo Delgado est prolongée après évaluation positive de ses résultats\n• Le Rwanda est reconnu comme l\'une des forces africaines les plus efficaces en opérations de stabilisation\n• La province reste fragile malgré les opérations militaires des dernières années\n• Enjeux : sécurité régionale, ressources gazières offshore et stabilisation de l\'Afrique australe\n\nPour la France, qui maintient des intérêts économiques et stratégiques en Afrique, l\'évolution de Cabo Delgado reste un point de vigilance.',
      question: 'Pensez-vous que les forces africaines comme le Rwanda sont plus efficaces que les missions occidentales pour stabiliser le continent ?',
      cta: '📰 Source(s) : France 24\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité africaine — chaque jour.\n\n#CaboDelgado #Rwanda #Mozambique #Afrique #FranceAujourdhui',
    },
    hashtags: ['#CaboDelgado', '#Rwanda', '#Mozambique', '#Afrique', '#FranceAujourdhui'],
    image_headline: 'RWANDA RESTE AU MOZAMBIQUE',
    image_prompt: 'African soldiers in military gear on patrol in a lush tropical forest setting in Mozambique, military helicopters visible in the background sky, early morning golden light filtering through dense vegetation, cinematic wide-angle shot, high contrast, photorealistic',
    seo_title: 'Cabo Delgado : la mission militaire rwandaise prolongée au Mozambique',
    seo_description: 'Le Rwanda prolonge sa présence militaire à Cabo Delgado pour maintenir la sécurité dans une province du Mozambique toujours menacée par des groupes jihadistes.',
    story_category: 'International',
    recommended_format: 'image',
    pillar: 'international',
    content_signals: { binary_frame: true, poll_fit_score: 3, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: true, pillar_hint: 'international' },
  },
  {
    id: '470431b8-c121-4e7e-8ca1-27837e61e34b',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'LOÏS BOISSON, L\'ESPOIR TRICOLORE À ROLAND-GARROS. 🎾🇫🇷\n\nAu terme d\'une saison difficile, la joueuse française Loïs Boisson aborde Roland-Garros 2026 avec un état d\'esprit renouvelé et le soutien croissant du public français derrière elle.\n\n• «Je sens beaucoup d\'engouement autour de moi» : Boisson reconnaît l\'élan populaire\n• Une année compliquée sur les plans physique et mental pour la joueuse\n• Roland-Garros comme tremplin pour relancer une carrière prometteuse\n• L\'attente du public français est forte après des saisons sans vainqueur tricolore Porte d\'Auteuil\n\nLe tennis français a besoin d\'un nouveau visage. Loïs Boisson est prête à relever le défi.',
      question: 'Pensez-vous que Loïs Boisson peut créer la surprise et aller loin à Roland-Garros 2026 ?',
      cta: '📰 Source(s) : Libération\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité du sport français — chaque jour.\n\n#RolandGarros #Tennis #LoïsBoisson #France #FranceAujourdhui',
    },
    hashtags: ['#RolandGarros', '#Tennis', '#LoïsBoisson', '#France', '#FranceAujourdhui'],
    image_headline: 'BOISSON À L\'ASSAUT DU GRAND CHELEM',
    image_prompt: 'A female tennis player in full swing hitting a forehand on the red clay court at Roland-Garros, crowd visible in the tiered stands behind, golden afternoon light illuminating the court, cinematic low-angle dramatic sports photography, photorealistic',
    seo_title: 'Loïs Boisson : l\'espoir du tennis français à Roland-Garros 2026',
    seo_description: 'Après une année difficile, Loïs Boisson aborde Roland-Garros avec optimisme. Elle confie ressentir «beaucoup d\'engouement» autour d\'elle avant le Grand Chelem parisien.',
    story_category: 'Sport',
    recommended_format: 'image',
    pillar: 'sport',
    content_signals: { binary_frame: false, poll_fit_score: 3, protagonist_named: 'Boisson', best_format: 'post', fr_it_stake_first_sentence: false, pillar_hint: 'sport' },
  },
  {
    id: '98aaf587-883e-4d9b-9560-4631b3f23c82',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'LE CHEF ÉTOILÉ DU VAR RÊVE D\'UN BISTROT À COTIGNAC. 🍽️⭐\n\nBenjamin Le Balch, chef du restaurant gastronomique de l\'abbaye de Peyrassol dans le Var, évoque son envie d\'ouvrir un bistrot plus simple et accessible dans le pittoresque village de Cotignac — une idée qui séduit autant les locaux que les fins gourmets.\n\n• Le Balch dirige l\'un des restaurants les plus réputés de Provence\n• L\'idée d\'un bistrot à Cotignac : retour aux racines, cuisine généreuse et abordable\n• Le Var, territoire d\'excellence de la haute gastronomie provençale\n• Une initiative qui valoriserait les producteurs locaux et le terroir varois\n\nLa grande cuisine française ne se résume pas aux palaces parisiens — la Provence est un vivier de talents qui méritent une plus grande visibilité.',
      question: 'Préférez-vous dîner dans un restaurant gastronomique étoilé ou dans un bon bistrot de terroir provençal ?',
      cta: '📰 Source(s) : France Info\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité française — chaque jour.\n\n#Gastronomie #Provence #Var #CuisineProvençale #FranceAujourdhui',
    },
    hashtags: ['#Gastronomie', '#Provence', '#Var', '#CuisineProvençale', '#FranceAujourdhui'],
    image_headline: 'BISTROT ÉTOILÉ EN PROVENCE',
    image_prompt: 'A charming Provençal stone restaurant terrace bathed in golden late afternoon light, a rustic wooden table set with wine glasses and linen napkins, lavender fields and rolling hills visible in the background, a chef in a white apron inspecting the outdoor setting, warm Mediterranean atmosphere, cinematic wide-angle, photorealistic',
    seo_title: 'Benjamin Le Balch veut ouvrir un bistrot à Cotignac dans le Var',
    seo_description: 'Le chef étoilé de Peyrassol, Benjamin Le Balch, envisage d\'ouvrir un bistrot accessible à Cotignac. Une idée qui allie excellence gastronomique et ancrage dans le terroir varois.',
    story_category: 'Culture',
    recommended_format: 'image',
    pillar: 'culture',
    content_signals: { binary_frame: true, poll_fit_score: 4, protagonist_named: 'Le Balch', best_format: 'post', fr_it_stake_first_sentence: false, pillar_hint: 'culture' },
  },
  {
    id: '262a5934-781a-4e4a-81f8-bd01dc79c350',
    country: 'FR', criticality: 'standard', priority_score: 5,
    watermarkFile: 'FranceAujourdhui_Logo.png',
    ai_caption: {
      intro: 'DES ENFANTS FRANÇAIS ABANDONNÉS AU PORTUGAL : QUI SONT CES PARENTS ? 👶🚨\n\nL\'affaire avait suscité une vive émotion en France : un couple français avait abandonné leurs enfants au Portugal dans des conditions dramatiques. L\'Obs revient sur le profil de ces parents pour tenter de comprendre l\'incompréhensible.\n\n• Un couple de nationalité française a abandonné ses enfants mineurs au Portugal\n• Les enfants ont depuis été pris en charge par les autorités portugaises\n• L\'enquête sur le profil des parents révèle des fragilités sociales et psychologiques profondes\n• L\'affaire a relancé le débat sur l\'aide aux familles françaises en détresse extrême\n\nCe fait divers dépasse la chronique judiciaire : il pose des questions difficiles sur les failles du filet de protection sociale.',
      question: 'Pensez-vous que ces parents auraient pu être repérés et aidés avant d\'en arriver à une telle situation ?',
      cta: '📰 Source(s) : L\'Obs\n\n👉 Suivez France Aujourd\'hui pour rester informé(e) de l\'actualité française — chaque jour.\n\n#Justice #Famille #FaitDivers #Social #FranceAujourdhui',
    },
    hashtags: ['#Justice', '#Famille', '#FaitDivers', '#Social', '#FranceAujourdhui'],
    image_headline: 'ENFANTS ABANDONNÉS : LE PROFIL',
    image_prompt: 'A somber and emotionally charged European courtroom, a judge\'s elevated bench in the background with scales of justice, two individuals seated beside legal counsel in civilian clothing, soft diffused light from high windows, cinematic dramatic wide-angle shot, photorealistic',
    seo_title: 'Enfants abandonnés au Portugal : le profil du couple français',
    seo_description: 'L\'Obs analyse le profil du couple français qui a abandonné ses enfants au Portugal. Une affaire qui révèle des failles sociales et relance le débat sur l\'aide aux familles en crise.',
    story_category: 'Société',
    recommended_format: 'image',
    pillar: 'france-en-debat',
    content_signals: { binary_frame: false, poll_fit_score: 2, protagonist_named: null, best_format: 'post', fr_it_stake_first_sentence: false, pillar_hint: 'france-en-debat' },
  },
];

const slots = { FR: SLOTS.FR ?? [], IT: SLOTS.IT ?? [] };

let ok = 0, fail = 0;

for (const a of articles) {
  try {
    const formatted = formatImagePrompt(a.image_prompt, a.image_headline, a.watermarkFile);
    const pillar = a.pillar;
    const publish_score = computePublishScore(
      { ...a, created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString() },
      {},
      slots[a.country] ?? []
    );

    const { error } = await supabase.from('articles').update({
      ai_caption: a.ai_caption,
      hashtags: a.hashtags,
      seed_comment: null,
      seed_comment_template_id: null,
      story_category: a.story_category,
      content_signals: a.content_signals,
      image_headline: a.image_headline,
      image_prompt: a.image_prompt,
      formatted_image_prompt: formatted,
      seo_title: a.seo_title,
      seo_description: a.seo_description,
      pillar,
      recommended_format: a.recommended_format,
      publish_score,
    }).eq('id', a.id);

    if (error) throw new Error(error.message);
    console.log(`  ✓ [${a.country}] ${a.id} — ${a.seo_title.slice(0, 55)}`);
    ok++;
  } catch (err) {
    console.error(`  ✗ ${a.id}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} updated, ${fail} failed`);
