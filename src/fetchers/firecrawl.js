import axios from 'axios';

function parseArticlesFromMarkdown(markdown, sourceUrl) {
  const { hostname } = new URL(sourceUrl);
  const domain = hostname.replace(/^www\./, '');

  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const seen = new Set();
  const articles = [];
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    const title = match[1].trim();
    const url = match[2].trim();

    if (!url.includes(domain)) continue;
    if (title.length < 25) continue;
    if (/\.(jpg|jpeg|png|gif|pdf|mp4|mp3|webp|svg)($|\?)/i.test(url)) continue;
    if (/\/(tags?|categor|auteur|author|recherche|search|rss|feed)\b/i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);

    articles.push({ title, url });
  }

  return articles;
}

export async function fetchFirecrawlHomepages(homepageSources, country) {
  if (!process.env.FIRECRAWL_KEY) {
    console.warn('  ⚠ FIRECRAWL_KEY not set, skipping homepage scrape');
    return [];
  }

  const results = [];

  for (const source of homepageSources) {
    try {
      const response = await axios.post(
        'https://api.firecrawl.dev/v1/scrape',
        { url: source.url, formats: ['markdown'], onlyMainContent: false },
        {
          headers: {
            Authorization: `Bearer ${process.env.FIRECRAWL_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const markdown = response.data?.data?.markdown || '';
      const found = parseArticlesFromMarkdown(markdown, source.url);

      const articles = found.map(({ title, url }) => ({
        country,
        source: source.name,
        title,
        original_url: url,
        summary: null,
        published_at: new Date().toISOString(),
      }));

      results.push(...articles);
      console.log(`  ✓ Firecrawl ${source.name}: ${articles.length} articles found`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(`  ✗ Firecrawl ${source.name}: ${msg}`);
    }
  }

  return results;
}
