import { createClient } from '@supabase/supabase-js';

let _client = null;

function getClient() {
  if (!_client) {
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
  return _client;
}

export async function saveArticles(articles) {
  const supabase = getClient();
  let saved = 0;

  for (const article of articles) {
    const { error } = await supabase.from('articles').insert(article);

    if (!error) {
      saved++;
    } else if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
      console.error(`  DB insert error: ${error.message}`);
    }
  }

  return saved;
}

export async function updateArticle(id, fields) {
  const supabase = getClient();
  const { error } = await supabase.from('articles').update(fields).eq('id', id);
  if (error) console.error(`  DB update error: ${error.message}`);
}

export async function updateArticleStatus(id, status) {
  return updateArticle(id, { status });
}

export async function getPendingArticles(country = null) {
  const supabase = getClient();
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'pending')
    .order('priority_score', { ascending: false })
    .order('published_at', { ascending: false });

  if (country) query = query.eq('country', country);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getArticleById(id) {
  const supabase = getClient();
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getRecentArticleTitles(country, daysBack = 3) {
  const supabase = getClient();
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('articles')
    .select('title')
    .eq('country', country)
    .gte('created_at', since);
  if (error) throw error;
  return (data || []).map(r => r.title);
}
