export const SOURCES = {
  FR: {
    rss: [
      { name: 'Le Monde',    url: 'https://www.lemonde.fr/rss/une.xml' },
      { name: 'Le Figaro',   url: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
      { name: 'France Info', url: 'https://www.francetvinfo.fr/titres.rss' },
      { name: 'France 24',   url: 'https://www.france24.com/fr/rss' },
      { name: 'Libération',  url: 'https://www.liberation.fr/arc/outboundfeeds/rss/?outputType=xml' },
      { name: "L'Obs",       url: 'https://www.nouvelobs.com/a-la-une/rss.xml' },
      { name: 'BFM TV',      url: 'https://www.bfmtv.com/rss/news-24-7/' },
      // A.6 additions — free-license RSS only (D3a decision)
      { name: 'Reporterre',  url: 'https://reporterre.net/spip.php?page=backend' },
      { name: 'Le Parisien', url: 'https://feeds.leparisien.fr/leparisien/rss' },
      { name: 'Bondy Blog',  url: 'https://www.bondyblog.fr/feed/' },
      // Removed — 20 Minutes: Cloudfront 403 bot-block (verified 2026-05-20)
      // Removed — Actu.fr: RSS URL 404 (verified 2026-05-20)
      // Deferred — licensed/syndication cost exceeds free tier (D3a): AFP wire, Reuters FR,
      // Le Point (paywall API), L'Express (paywall API), Courrier International (licensed content)
    ],
    newsapi: { query: 'France politique actualité', language: 'fr' },
    captionLanguage: 'français',
    fbPageEnvKey: 'FR',
    pageName: "France Aujourd'hui",
    pageHashtag: '#FranceAujourdhui',
    watermarkFile: 'FranceAujourdhui_Logo_v2.png',
  },
  IT: {
    rss: [
      { name: 'ANSA',                       url: 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml' },
      { name: 'Corriere della Sera',         url: 'https://xml2.corriereobjects.it/rss/homepage.xml' },
      { name: 'Repubblica',                  url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml' },
      { name: 'La Stampa',                   url: 'https://www.lastampa.it/rss/copertina.xml' },
      { name: 'AGI',                         url: 'https://www.agi.it/rss.xml' },
      // A.7 additions — center-left editorial balance (D3b decision); Il Giornale excluded (right-wing)
      { name: 'Il Resto del Carlino',        url: 'https://www.ilrestodelcarlino.it/rss' },
      { name: 'Il Messaggero',               url: 'https://www.ilmessaggero.it/rss/home.xml' },
      { name: 'Il Secolo XIX',               url: 'https://www.ilsecoloxix.it/rss' },
      { name: 'Corriere.it',                 url: 'https://www.corriere.it/rss/homepage.xml' },
      { name: 'La Gazzetta del Mezzogiorno', url: 'https://feeds.feedburner.com/lagazzettadelmezzogiorno/viyi6z8dkwu' },
      // Removed — Corriere Milano: subdomain 404 (verified 2026-05-20); replaced by corriere.it main
      // Removed — Corriere Roma: subdomain 404 (verified 2026-05-20); replaced by corriere.it main
      { name: 'Vatican News',                url: 'https://www.vaticannews.va/it.rss.xml' },
      { name: 'La Gazzetta dello Sport',     url: 'https://www.gazzetta.it/rss/home.xml' },
      { name: 'Il Fatto Quotidiano',         url: 'https://www.ilfattoquotidiano.it/feed/' },
      // Phase 2 (10k engaged-follower gate): Il Sole 24 Ore, Corriere del Veneto
      // Phase 3 (Month 6+): Dissapore, other vertical feeds (investigate when triggered)
    ],
    newsapi: { query: 'Italia politica attualità', language: 'it' },
    captionLanguage: 'italiano',
    fbPageEnvKey: 'IT',
    pageName: 'Italia Oggi',
    pageHashtag: '#ItaliaOggi',
    watermarkFile: 'ItaliaOggi_Logo.png',
  },

  // To add a new country, copy this block and fill in:
  // XX: {
  //   rss: [{ name: 'Source Name', url: 'https://feed.url/rss.xml' }],
  //   newsapi: { query: 'query string', language: 'xx' },
  //   captionLanguage: 'language name',
  //   fbPageEnvKey: 'XX',
  //   pageName: 'Page Display Name',
  //   watermarkFile: 'XX_Logo.png',
  // },
};
