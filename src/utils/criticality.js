// Keyword-based criticality classifier. No AI — pure pattern matching.
// Returns { level, priority_score } for each article.

const BREAKING = /\b(breaking|just\s+in|flash\s+info|en\s+direct|alerte|urgente?|ultime\s+notizie?|in\s+diretta|in\s+corso|just\s+nu|larm|senaste\s+nytt|br[åa]dskande|happening\s+now|developing\s+story|dernière\s+heure)\b/i;

const ALERT = /\b(earthquake|seisme|tremblement\s+de\s+terre|terremoto|jordb[äa]vning|flood|inondation|alluvione|[öo]versvämning|hurricane|ouragan|uragano|orkan|tsunami|explosion|incendie|incendio|brand|crash|crash\s+plane|crash\s+train|tragedy|trag[eé]die|tragedia|tragedi|coup\s+d[''´]état|coup\s+d.état|putsch|golpe|statskupp|assassination|assassinat|assassinio|mord|war|guerre|guerra|krig|invasion|invasion|invasione|invasion|bombing|attentat|attentato|terrorattack|airstrike|frappe\s+a[eé]rienne|attacco\s+aereo|luftangrepp|massacre|massaker|strage|massaker|famine|fam[ií]ne|katastrophe|catastrophe|catastrofe|katastrof|disaster|catastrophe|calamit[àa]|katastrof|missing\s+plane|crash\s+airline|death\s+toll|bilan\s+mort|bilancio\s+vittime|d[öo]dssiffra|emergency|urgence|emergenza|n[öo]dl[äa]ge|crisis|crise|crisi|kris)\b/i;

const TRENDING = /\b(trending|viral|goes?\s+viral|buzz|record|champion|champions\s+league|world\s+cup|coupe\s+du\s+monde|coppa\s+del\s+mondo|VM|EM|oscar|grammy|bafta|palme\s+d[''´]or|cannes|festival|celebrity|stars?|scandale|scandalo|skandal|fait\s+divers|curiosit[àa]|kuriosa|instagram|tiktok|youtube|twitter|social\s+media|r[ée]seaux\s+sociaux|social\s+network|sociala\s+medier)\b/i;

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

  return { criticality: level, priority_score: SCORE[level] };
}
