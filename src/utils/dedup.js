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

function titleHash(title) {
  const s = normalize(title).join(' ');
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

// Union-Find cluster detection. Merges new articles that cover the same story
// (similarity >= 0.80) across both newly fetched and recent DB articles.
// cluster_size >= 3 auto-escalates criticality to 'breaking'.
// Mutates and returns newArticles with cluster_id and cluster_size set.
export function detectAndAnnotateClusters(newArticles, recentDbArticles) {
  const all = [...newArticles, ...recentDbArticles];
  const n = all.length;
  const newCount = newArticles.length;
  if (n < 2) return newArticles;

  const parent = Array.from({ length: n }, (_, i) => i);
  function find(i) {
    while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
    return i;
  }
  function union(i, j) {
    const pi = find(i), pj = find(j);
    if (pi !== pj) parent[pi] = pj;
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (similarity(all[i].title, all[j].title) >= 0.80) union(i, j);
    }
  }

  const clusterMap = new Map();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!clusterMap.has(root)) clusterMap.set(root, []);
    clusterMap.get(root).push(i);
  }

  for (const [root, indices] of clusterMap) {
    if (indices.length < 2) continue;
    const clusterSize = indices.length;
    const clusterId = titleHash(all[root].title);
    for (const idx of indices) {
      if (idx >= newCount) continue;
      newArticles[idx].cluster_id = clusterId;
      newArticles[idx].cluster_size = clusterSize;
      if (clusterSize >= 3 && newArticles[idx].criticality !== 'breaking') {
        newArticles[idx].criticality = 'breaking';
      }
    }
  }

  return newArticles;
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
