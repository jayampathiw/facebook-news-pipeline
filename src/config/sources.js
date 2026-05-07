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
    ],
    newsapi: { query: 'France politique actualité', language: 'fr' },
    captionLanguage: 'français',
    fbPageEnvKey: 'FR',
    pageName: "France Aujourd'hui",
    watermarkFile: 'FranceAujourdhui_Logo_v2.png',
  },
  IT: {
    rss: [
      { name: 'ANSA',        url: 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml' },
      { name: 'Corriere',    url: 'https://xml2.corriereobjects.it/rss/homepage.xml' },
      { name: 'Repubblica',  url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml' },
      { name: 'La Stampa',   url: 'https://www.lastampa.it/rss/copertina.xml' },
      { name: 'AGI',         url: 'https://www.agi.it/rss.xml' },
    ],
    newsapi: { query: 'Italia politica attualità', language: 'it' },
    captionLanguage: 'italiano',
    fbPageEnvKey: 'IT',
    pageName: 'Italia Oggi',
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
