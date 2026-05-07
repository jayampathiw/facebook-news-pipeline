function normalize(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3); // ignore short words
}

export function similarity(a, b) {
  const wordsA = new Set(normalize(a));
  const wordsB = new Set(normalize(b));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  return intersection / Math.max(wordsA.size, wordsB.size);
}

export function deduplicate(articles) {
  const seen = [];
  const result = [];

  for (const article of articles) {
    const isDuplicate = seen.some(s => similarity(s.title, article.title) > 0.7);
    if (!isDuplicate) {
      seen.push(article);
      result.push(article);
    }
  }

  return result;
}
