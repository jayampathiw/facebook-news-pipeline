// Keyword-based criticality classifier. No AI — pure pattern matching.
// Returns { criticality, priority_score } for each article.

// +15 score boost when a local place name appears in title/summary (capped at one boost per article)
const FR_PLACE_NAMES = /\b(Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Strasbourg|Montpellier|Bordeaux|Lille|Rennes|Reims|Le\s+Havre|Saint[-\s]Étienne|Saint[-\s]Etienne|Toulon|Grenoble|Dijon|Angers|Nîmes|Nimes|Villeurbanne|Le\s+Mans|Aix[-\s]en[-\s]Provence|Brest|Tours|Amiens|Limoges|Clermont[-\s]Ferrand|Perpignan|Metz|Besançon|Besancon|Orléans|Orleans|Mulhouse|Rouen|Argenteuil|Caen|Nancy|Tourcoing|Roubaix|Nanterre|Vitry[-\s]sur[-\s]Seine|Avignon|Créteil|Creteil|Dunkerque|Poitiers|Colombes|Versailles|Fort[-\s]de[-\s]France|Courbevoie|Aulnay[-\s]sous[-\s]Bois|Cherbourg|Île[-\s]de[-\s]France|Ile[-\s]de[-\s]France|Auvergne|Rhône[-\s]Alpes|Hauts[-\s]de[-\s]France|Nouvelle[-\s]Aquitaine|Occitanie|Grand\s+Est|Normandie|Pays\s+de\s+la\s+Loire|Bretagne|Bourgogne|Franche[-\s]Comté|Franche[-\s]Comte|Centre[-\s]Val\s+de\s+Loire|Provence|Côte\s+d['']Azur|Corse)\b/i;

const IT_PLACE_NAMES = /\b(Roma|Milano|Napoli|Torino|Palermo|Genova|Bologna|Firenze|Bari|Catania|Venezia|Verona|Messina|Padova|Trieste|Taranto|Brescia|Prato|Parma|Modena|Reggio\s+Calabria|Reggio\s+Emilia|Perugia|Livorno|Ravenna|Cagliari|Foggia|Rimini|Salerno|Ferrara|Sassari|Bergamo|Monza|Latina|Giugliano|Siracusa|Pescara|Trento|Forlì|Forli|Vicenza|Terni|Bolzano|Novara|Piacenza|Ancona|Andria|Arezzo|Udine|Cesena|Lecce|Lombardia|Lazio|Campania|Sicilia|Veneto|Piemonte|Puglia|Toscana|Emilia[-\s]Romagna|Calabria|Friuli|Marche|Liguria|Sardegna|Abruzzo|Umbria|Basilicata|Molise|Valle\s+d['']Aosta|Trentino|Alto\s+Adige)\b/i;

// +20 boost for IT articles matching 65+ female demographic resonance — health, family, justice, cost-of-living
const IT_DEMOGRAPHIC_RESONANCE = /\b(anzian[io]|pensionati?|pensione|salute|malatt[ia]|ospedale|medic[oi]|cura|farmac[io]|famiglia|bambini|nonni|nonna|nipot[ii]|figlio|figlia|madre|vittima|giustizia|ingiustizia|sicurezza|violenza|truffa|truffe|disagio|povert[àa]|carovita|spesa|bollette|rincaro|prezzo|prezzi)\b/i;

const BREAKING =/\b(breaking|just\s+in|flash\s+info|en\s+direct|alerte|urgente?|ultime\s+notizie?|in\s+diretta|in\s+corso|just\s+nu|larm|senaste\s+nytt|br[åa]dskande|happening\s+now|developing\s+story|dernière\s+heure)\b/i;

const ALERT = /\b(earthquake|seisme|tremblement\s+de\s+terre|terremoto|jordb[äa]vning|flood|inondation|alluvione|[öo]versvämning|hurricane|ouragan|uragano|orkan|tsunami|explosion|incendie|incendio|brand|crash|crash\s+plane|crash\s+train|tragedy|trag[eé]die|tragedia|tragedi|coup\s+d[''´]état|coup\s+d.état|putsch|golpe|statskupp|assassination|assassinat|assassinio|mord|war|guerre|guerra|krig|invasion|invasion|invasione|invasion|bombing|attentat|attentato|terrorattack|airstrike|frappe\s+a[eé]rienne|attacco\s+aereo|luftangrepp|massacre|massaker|strage|massaker|famine|fam[ií]ne|katastrophe|catastrophe|catastrofe|katastrof|disaster|catastrophe|calamit[àa]|katastrof|missing\s+plane|crash\s+airline|death\s+toll|bilan\s+mort|bilancio\s+vittime|d[öo]dssiffra|emergency|urgence|emergenza|n[öo]dl[äa]ge|crisis|crise|crisi|kris|ligue\s+des\s+champions|champion(?:s)?\s+d['']europe|finale\s+de\s+la\s+(?:ligue|coupe)|équipe\s+de\s+france|les\s+bleus|nazionale\s+italiana|azzurri|coppa\s+del\s+mondo|campionato\s+del\s+mondo|coupe\s+du\s+monde\s+de\s+football)\b/i;

const TRENDING = /\b(trending|viral|goes?\s+viral|buzz|record|champion|champions\s+league|world\s+cup|coupe\s+du\s+monde|coppa\s+del\s+mondo|VM|EM|oscar|grammy|bafta|palme\s+d[''´]or|cannes|festival|celebrity|stars?|scandale|scandalo|skandal|fait\s+divers|curiosit[àa]|kuriosa|instagram|tiktok|youtube|twitter|social\s+media|r[ée]seaux\s+sociaux|social\s+network|sociala\s+medier|PSG|paris\s+saint[-\s]germain|ligue\s+1|serie\s+a|juventus|inter\s+milan|ac\s+milan|napoli|olympique\s+de\s+marseille|olympique\s+lyonnais|stade\s+de\s+reims|as\s+monaco|coupe\s+de\s+france|roland[-\s]garros|tour\s+de\s+france|formule\s+1|grand\s+prix\s+de|six\s+nations|ligue\s+magnus|top\s+14|pro\s+d2|finale|demi[-\s]finale|ogc\s+nice|rc\s+toulon|stade\s+toulousain|toulouse\s+rugby|montpellier\s+hsc|hsc\s+montpellier|sc\s+bastia|bouclier\s+de\s+brennus|\bOM\b)\b/i;

const SCORE = {
  breaking: 100,
  alert:     75,
  trending:  50,
  standard:  25,
};

export function classifyArticle(article) {
  const text = `${article.title || ''} ${article.summary || ''}`;

  let level;
  if (BREAKING.test(text))      level = 'breaking';
  else if (ALERT.test(text))    level = 'alert';
  else if (TRENDING.test(text)) level = 'trending';
  else                          level = 'standard';

  let priority_score = SCORE[level];

  const placeRegex = article.country === 'FR' ? FR_PLACE_NAMES
                   : article.country === 'IT' ? IT_PLACE_NAMES
                   : null;
  if (placeRegex && placeRegex.test(text)) priority_score += 15;
  if (article.country === 'IT' && IT_DEMOGRAPHIC_RESONANCE.test(text)) priority_score += 20;

  return { criticality: level, priority_score };
}
