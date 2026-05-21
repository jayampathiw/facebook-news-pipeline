import { Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string | null;
  country: string;
  status: 'pending' | 'approved' | 'rejected' | 'posted' | 'failed';
  criticality: 'breaking' | 'alert' | 'trending' | 'standard';
  priority_score: number;
  published_at: string | null;
  posted_at: string | null;
  created_at: string;
  ai_caption: { intro: string; question: string; cta: string } | null;
  fb_post_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  image_prompt: string | null;
  formatted_image_prompt: string | null;
  image_headline: string | null;
  seed_comment: string | null;
  seed_comment_template_id: string | null;
  story_category: string | null;
  boost_eligible: boolean;
  content_signals: {
    binary_frame?: boolean;
    poll_fit_score?: number;
    protagonist_named?: string | null;
    best_format?: 'post' | 'carousel' | 'reel';
    fr_it_stake_first_sentence?: boolean;
    pillar_hint?: string | null;
  } | null;
  cluster_id: number | null;
  cluster_size: number;
  pillar: string | null;
  publish_score: number | null;
  editorial_score: number | null;
  generated_image_url: string | null;
  tags?: string[];
  hashtags?: string[];
}

export interface PostMetric {
  id: number;
  article_id: string;
  fb_post_id: string;
  snapshot_at: string;
  interval_tag: '+1h' | '+24h' | '+7d';
  impressions: number | null;
  engaged_users: number | null;
  reactions_total: number | null;
  reactions_like: number | null;
  reactions_love: number | null;
  reactions_anger: number | null;
  reactions_haha: number | null;
  reactions_wow: number | null;
  reactions_sad: number | null;
  comments: number | null;
  shares: number | null;
  clicks: number | null;
}

export interface ArticleWithMetrics extends Article {
  post_metrics: PostMetric[];
}

export interface ArticleFilters {
  country?: string;
  status?: string;
  criticality?: string;
  sortBy?: 'created_at' | 'priority_score' | 'published_at';
  sortDir?: 'asc' | 'desc';
}

export interface ArticleStats {
  pending: number;
  approved: number;
  rejected: number;
  posted: number;
  failed: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;
  private _user = new BehaviorSubject<User | null>(null);

  user$ = this._user.asObservable();

  constructor(private zone: NgZone) {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.client.auth.onAuthStateChange((_event, session) => {
      this.zone.run(() => this._user.next(session?.user ?? null));
    });
    this.client.auth.getSession().then(({ data }) => {
      this._user.next(data.session?.user ?? null);
    });
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.client.auth.signOut();
  }

  async getArticles(filters: ArticleFilters = {}): Promise<Article[]> {
    const sortBy = filters.sortBy ?? 'created_at';
    const ascending = filters.sortDir === 'asc';

    let query = this.client
      .from('articles')
      .select('*')
      .order(sortBy, { ascending });

    if (filters.country) query = query.eq('country', filters.country);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.criticality) query = query.eq('criticality', filters.criticality);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Article[];
  }

  async getStats(): Promise<ArticleStats> {
    const { data, error } = await this.client.from('articles').select('status');
    if (error) throw error;
    const stats: ArticleStats = { pending: 0, approved: 0, rejected: 0, posted: 0, failed: 0, total: 0 };
    for (const row of data ?? []) {
      const s = row.status as keyof ArticleStats;
      if (s in stats) (stats[s] as number)++;
      stats.total++;
    }
    return stats;
  }

  async updateArticleStatus(id: string, status: Article['status']) {
    const { error } = await this.client.from('articles').update({ status }).eq('id', id);
    if (error) throw error;
  }

  async deleteArticle(id: string) {
    const { error } = await this.client.from('articles').delete().eq('id', id);
    if (error) throw error;
  }

  async deleteArticles(ids: string[]) {
    const { error } = await this.client.from('articles').delete().in('id', ids);
    if (error) throw error;
  }

  async updateArticlesStatus(ids: string[], status: Article['status']) {
    const { error } = await this.client.from('articles').update({ status }).in('id', ids);
    if (error) throw error;
  }

  async selectTopNews(country: string): Promise<{ selected_ids: string[] }> {
    const session = await this.getSession();
    const token = session?.access_token ?? environment.supabaseAnonKey;
    const url = `${environment.supabaseUrl}/functions/v1/generate-caption`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': environment.supabaseAnonKey,
      },
      body: JSON.stringify({ action: 'select_top_news', ...(country ? { country } : {}) }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async postToFacebook(articleIds: string[]): Promise<{
    results: { id: string; success: boolean; fb_post_id?: string; error?: string }[];
  }> {
    const session = await this.getSession();
    const token = session?.access_token ?? environment.supabaseAnonKey;
    const res = await fetch(`${environment.supabaseUrl}/functions/v1/post-to-facebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': environment.supabaseAnonKey,
      },
      body: JSON.stringify({ article_ids: articleIds }),
    });
    if (!res.ok) throw new Error(`Post to Facebook error: ${await res.text()}`);
    return res.json();
  }

  async getArticlesWithMetrics(limit = 50): Promise<ArticleWithMetrics[]> {
    const { data, error } = await this.client
      .from('articles')
      .select('id, title, source, country, posted_at, fb_post_id, post_metrics(*)')
      .eq('status', 'posted')
      .not('fb_post_id', 'is', null)
      .order('posted_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(a => ({ ...a, post_metrics: a.post_metrics ?? [] })) as unknown as ArticleWithMetrics[];
  }

  async generateImage(articleId: string): Promise<{ url: string }> {
    const session = await this.getSession();
    const token = session?.access_token ?? environment.supabaseAnonKey;
    const res = await fetch(`${environment.supabaseUrl}/functions/v1/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': environment.supabaseAnonKey,
      },
      body: JSON.stringify({ article_id: articleId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error ?? `Image generation failed (${res.status})`);
    }
    return res.json();
  }

  async generateCaptions(articleIds: string[]): Promise<{ processed: number; results: { id: string; seo_title: string }[]; errors?: { id: string; error: string }[] }> {
    const session = await this.getSession();
    const token = session?.access_token ?? environment.supabaseAnonKey;
    const url = `${environment.supabaseUrl}/functions/v1/generate-caption`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': environment.supabaseAnonKey,
      },
      body: JSON.stringify({ article_ids: articleIds }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Edge Function error: ${text}`);
    }
    return res.json();
  }
}
