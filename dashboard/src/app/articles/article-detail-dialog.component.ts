import { Component, Input, Output, EventEmitter, signal, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Article, SupabaseService } from '../core/supabase.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div style="display:flex;flex-direction:column;height:100%;background:var(--ink-surface);position:relative;">

      <!-- ── Header ── -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;flex-shrink:0;border-bottom:1px solid var(--ink-border);"
           [style.background]="critBg(article.criticality)">
        <div style="display:flex;align-items:center;gap:6px;">
          <span [class]="critSigClass(article.criticality)"></span>
          <span [class]="'ink-badge ' + critBadgeClass(article.criticality)">{{ article.criticality }}</span>
          <span class="ink-badge" style="background:var(--ink-raised);color:var(--ink-text-2);">{{ article.country }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span [class]="'ink-badge ' + statusBadgeClass(article.status)">{{ article.status }}</span>
          <button class="btn-ghost-icon" (click)="closePanel.emit()">✕</button>
        </div>
      </div>

      <!-- ── Title + meta ── -->
      <div style="padding:12px 16px;border-bottom:1px solid var(--ink-border);flex-shrink:0;">
        <h2 style="font-size:14px;font-weight:600;line-height:1.45;color:var(--ink-text);margin-bottom:6px;">{{ article.title }}</h2>
        <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--ink-text-2);font-family:'JetBrains Mono',monospace;flex-wrap:wrap;">
          <span>{{ article.source }}</span>
          <span style="color:var(--ink-text-3);">·</span>
          <span>{{ article.created_at | date:'dd MMM yyyy, HH:mm' }}</span>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="ink-tabs scrollbar-none" style="overflow-x:auto;">
        @for (tab of tabs; track tab; let i = $index) {
          <button [class]="'ink-tab ' + (activeTab() === i ? 'active' : '')" (click)="activeTab.set(i)">{{ tab }}</button>
        }
      </div>

      <!-- ── Scrollable body ── -->
      <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;">

        <!-- Overview -->
        @if (activeTab() === 0) {
          @if (article.summary) {
            <div>
              <p class="section-label">Summary</p>
              <p style="font-size:13px;color:var(--ink-text);line-height:1.65;">{{ article.summary }}</p>
            </div>
            <div style="border-top:1px solid var(--ink-border);"></div>
          }
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <p class="section-label">Priority Score</p>
              <p style="font-size:28px;font-weight:700;color:var(--ink-brand);font-family:'JetBrains Mono',monospace;line-height:1;">{{ article.priority_score }}</p>
            </div>
            <div>
              <p class="section-label">Published</p>
              <p style="font-size:13px;color:var(--ink-text);font-family:'JetBrains Mono',monospace;">{{ article.published_at ? (article.published_at | date:'dd MMM yyyy') : '—' }}</p>
            </div>
          </div>
          <div style="border-top:1px solid var(--ink-border);"></div>
          <div>
            <p class="section-label">Article ID</p>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <code style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink-text-2);background:var(--ink-raised);border:1px solid var(--ink-border);padding:4px 8px;border-radius:4px;word-break:break-all;flex:1;">{{ article.id }}</code>
              <button class="btn-ink" style="height:28px;padding:0 10px;font-size:11px;flex-shrink:0;" (click)="copy(article.id)">Copy</button>
            </div>
          </div>
          <div style="border-top:1px solid var(--ink-border);"></div>
          <div>
            <p class="section-label">Source URL</p>
            <a [href]="article.url" target="_blank" rel="noopener"
               style="font-size:13px;color:var(--ink-brand);text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
              Open article <span style="opacity:.6;">↗</span>
            </a>
          </div>
          @if (article.fb_post_id) {
            <div style="border-top:1px solid var(--ink-border);"></div>
            <div>
              <p class="section-label">Facebook Post</p>
              <a [href]="'https://www.facebook.com/' + article.fb_post_id" target="_blank" rel="noopener"
                 style="font-size:13px;color:var(--ink-brand);text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                View on Facebook <span style="opacity:.6;">↗</span>
              </a>
              <p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink-text-3);margin-top:4px;">{{ article.fb_post_id }}</p>
            </div>
          }
        }

        <!-- Caption -->
        @if (activeTab() === 1) {
          @if (article.ai_caption?.intro) {
            @if (article.story_category) {
              <div style="display:flex;align-items:center;gap:6px;">
                <span class="ink-badge ib-brand">{{ article.story_category }}</span>
              </div>
            }
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <p class="section-label" style="margin-bottom:0;">Intro</p>
                <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.ai_caption!.intro)">Copy</button>
              </div>
              <div class="ink-content-block" style="white-space:pre-wrap;max-height:200px;overflow-y:auto;">{{ article.ai_caption!.intro }}</div>
            </div>
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <p class="section-label" style="margin-bottom:0;">Engagement Question</p>
                <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.ai_caption!.question)">Copy</button>
              </div>
              <div class="ink-content-block" style="white-space:pre-wrap;">{{ article.ai_caption!.question }}</div>
            </div>
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <p class="section-label" style="margin-bottom:0;">CTA &amp; Source</p>
                <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.ai_caption!.cta)">Copy</button>
              </div>
              <div class="ink-content-block" style="white-space:pre-wrap;">{{ article.ai_caption!.cta }}</div>
            </div>
            @if ((article.hashtags?.length ?? 0) > 0) {
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                  <p class="section-label" style="margin-bottom:0;">Hashtags</p>
                  <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.hashtags!.join(' '))">Copy all</button>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  @for (tag of article.hashtags; track tag) {
                    <span class="ink-badge ib-brand" style="cursor:pointer;" (click)="copy(tag)" title="Click to copy">{{ tag }}</span>
                  }
                </div>
              </div>
            }
            @if (article.seed_comment) {
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                  <div>
                    <p class="section-label" style="margin-bottom:2px;">Seed Comment</p>
                    <p style="font-size:10px;color:var(--ink-alert);letter-spacing:.04em;text-transform:uppercase;font-weight:600;">Post within 2 min of publishing</p>
                  </div>
                  <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.seed_comment!)">Copy</button>
                </div>
                <div class="ink-content-block">{{ article.seed_comment }}</div>
              </div>
            }
            <button class="btn-brand" style="width:100%;justify-content:center;" (click)="copyFullPost()">📋 Copy full post</button>
          } @else {
            <div class="empty-state">
              <div style="font-size:32px;opacity:.2;">✦</div>
              <p style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;">No caption yet — use Generate below</p>
            </div>
          }
        }

        <!-- SEO -->
        @if (activeTab() === 2) {
          @if (article.seo_title || article.seo_description) {
            @if (article.story_category) {
              <div style="display:flex;align-items:center;gap:6px;">
                <p class="section-label" style="margin-bottom:0;">Category</p>
                <span class="ink-badge ib-brand">{{ article.story_category }}</span>
              </div>
            }
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <p class="section-label" style="margin-bottom:0;">
                  SEO Title
                  <span [style.color]="(article.seo_title || '').length > 60 ? 'var(--ink-breaking)' : 'var(--ink-text-3)'"
                        style="font-weight:400;text-transform:none;letter-spacing:normal;"> {{ (article.seo_title || '').length }}/60</span>
                </p>
                <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.seo_title!)">Copy</button>
              </div>
              <div class="ink-content-block">{{ article.seo_title || '—' }}</div>
            </div>
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <p class="section-label" style="margin-bottom:0;">
                  SEO Description
                  <span [style.color]="(article.seo_description || '').length > 160 ? 'var(--ink-breaking)' : 'var(--ink-text-3)'"
                        style="font-weight:400;text-transform:none;letter-spacing:normal;"> {{ (article.seo_description || '').length }}/160</span>
                </p>
                <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.seo_description!)">Copy</button>
              </div>
              <div class="ink-content-block">{{ article.seo_description || '—' }}</div>
            </div>
          } @else {
            <div class="empty-state">
              <div style="font-size:32px;opacity:.2;">◑</div>
              <p style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;">No SEO content yet</p>
            </div>
          }
        }

        <!-- Image Prompt -->
        @if (activeTab() === 3) {
          @if (article.image_prompt) {
            @if (article.image_headline) {
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                  <p class="section-label" style="margin-bottom:0;">
                    Image Headline
                    <span style="font-weight:400;text-transform:none;letter-spacing:normal;color:var(--ink-text-3);">(max 6 words)</span>
                  </p>
                  <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.image_headline!)">Copy</button>
                </div>
                <div class="ink-content-block" style="font-size:15px;font-weight:700;color:var(--ink-text);letter-spacing:.02em;">{{ article.image_headline }}</div>
              </div>
            }
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <p class="section-label" style="margin-bottom:0;">Raw Prompt</p>
                <button class="btn-ink" style="height:26px;padding:0 10px;font-size:11px;" (click)="copy(article.image_prompt!)">Copy</button>
              </div>
              <div class="ink-content-block" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink-text-2);">{{ article.image_prompt }}</div>
            </div>
            <div>
              <p class="section-label">
                Formatted Prompt
                <span style="font-weight:400;text-transform:none;letter-spacing:normal;color:var(--ink-text-3);">(Midjourney / DALL·E)</span>
              </p>
              <div class="ink-content-block" style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink-text-2);max-height:140px;overflow-y:auto;">{{ article.formatted_image_prompt }}</div>
              <button class="btn-brand" style="width:100%;margin-top:8px;" (click)="copy(article.formatted_image_prompt!)">
                📋 Copy formatted prompt
              </button>
            </div>
          } @else {
            <div class="empty-state">
              <div style="font-size:32px;opacity:.2;">▦</div>
              <p style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;">No image prompt yet</p>
            </div>
          }
        }

        <!-- Signals -->
        @if (activeTab() === 4) {
          @if (article.content_signals && (article.content_signals.pillar_hint || article.content_signals.best_format || article.content_signals.protagonist_named !== undefined)) {
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="ink-surface" style="padding:10px;border-radius:6px;border:1px solid var(--ink-border);">
                <p class="section-label" style="margin-bottom:4px;">Binary Frame</p>
                <span [class]="'ink-badge ' + (article.content_signals!.binary_frame ? 'ib-breaking' : '')">{{ article.content_signals!.binary_frame ? '✓ Yes' : '— No' }}</span>
              </div>
              <div class="ink-surface" style="padding:10px;border-radius:6px;border:1px solid var(--ink-border);">
                <p class="section-label" style="margin-bottom:4px;">Poll Fit</p>
                <span style="font-size:20px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--ink-brand);">{{ article.content_signals!.poll_fit_score ?? '—' }}<span style="font-size:12px;font-weight:400;color:var(--ink-text-3);">/5</span></span>
              </div>
              <div class="ink-surface" style="padding:10px;border-radius:6px;border:1px solid var(--ink-border);">
                <p class="section-label" style="margin-bottom:4px;">Protagonist</p>
                <span style="font-size:13px;font-weight:600;color:var(--ink-text);">{{ article.content_signals!.protagonist_named ?? '—' }}</span>
              </div>
              <div class="ink-surface" style="padding:10px;border-radius:6px;border:1px solid var(--ink-border);">
                <p class="section-label" style="margin-bottom:4px;">Best Format</p>
                <span class="ink-badge ib-brand">{{ article.content_signals!.best_format ?? '—' }}</span>
              </div>
              <div class="ink-surface" style="padding:10px;border-radius:6px;border:1px solid var(--ink-border);">
                <p class="section-label" style="margin-bottom:4px;">Local Stake First</p>
                <span [class]="'ink-badge ' + (article.content_signals!.fr_it_stake_first_sentence ? 'ib-standard' : '')">{{ article.content_signals!.fr_it_stake_first_sentence ? '✓ Yes' : '— No' }}</span>
              </div>
              <div class="ink-surface" style="padding:10px;border-radius:6px;border:1px solid var(--ink-border);">
                <p class="section-label" style="margin-bottom:4px;">Pillar</p>
                <span style="font-size:11px;font-weight:600;font-family:'JetBrains Mono',monospace;color:var(--ink-text);">{{ article.content_signals!.pillar_hint ?? '—' }}</span>
              </div>
            </div>
            @if ((article.cluster_size ?? 1) >= 2) {
              <div style="border-top:1px solid var(--ink-border);"></div>
              <div>
                <p class="section-label">Cluster</p>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="ink-badge ib-alert">🔗 {{ article.cluster_size }} sources</span>
                  <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--ink-text-3);">ID: {{ article.cluster_id }}</span>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <div style="font-size:32px;opacity:.2;">◈</div>
              <p style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;">No signals yet — generate content first</p>
            </div>
          }
        }

      </div>

      <!-- ── Inline toast ── -->
      @if (toast()) {
        <div style="position:absolute;bottom:80px;left:50%;transform:translateX(-50%);z-index:10;pointer-events:none;">
          <div [class]="'toast-msg ' + (toast()!.ok ? 'toast-ok' : 'toast-err')">
            {{ toast()!.ok ? '✓' : '✗' }} {{ toast()!.msg }}
          </div>
        </div>
      }

      <!-- ── Action footer ── -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-top:1px solid var(--ink-border);flex-shrink:0;flex-wrap:wrap;">
        <button class="btn-ink" [disabled]="generating()" (click)="generate()">
          @if (generating()) { <span class="loading loading-spinner loading-xs"></span> }
          ✦ Generate
        </button>
        <div style="display:flex;align-items:center;gap:8px;margin-left:auto;flex-wrap:wrap;">
          <button class="btn-reject" [disabled]="article.status === 'rejected'" (click)="setStatus('rejected')">Reject</button>
          <button class="btn-approve" [disabled]="article.status === 'approved'" (click)="setStatus('approved')">Approve</button>
          <button class="btn-brand"
                  [disabled]="article.status !== 'approved' || posting()"
                  style="background:var(--ink-brand);"
                  (click)="postToFacebook()">
            @if (posting()) { <span class="loading loading-spinner loading-xs"></span> }
            @else { <span>📤</span> }
            Post to Facebook
          </button>
          <button class="btn-brand" [disabled]="article.status === 'posted'" (click)="setStatus('posted')">✓ Mark Posted</button>
          <button class="btn-ink" (click)="closePanel.emit()">Close</button>
        </div>
      </div>

    </div>
  `,
  styles: [`:host { display: flex; flex-direction: column; height: 100%; }`],
})
export class ArticleDetailComponent implements OnDestroy {
  @Input() article!: Article;
  @Output() closePanel = new EventEmitter<void>();
  @Output() articleUpdated = new EventEmitter<Article>();

  tabs = ['Overview', 'Caption', 'SEO', 'Image', 'Signals'];
  activeTab = signal(0);
  generating = signal(false);
  posting = signal(false);
  toast = signal<{ msg: string; ok: boolean } | null>(null);
  private toastTimer: any;

  constructor(private supabase: SupabaseService) {}

  ngOnDestroy() {
    clearTimeout(this.toastTimer);
  }

  critBg(level: string): string {
    const bgs: Record<string, string> = {
      breaking: 'linear-gradient(135deg, rgba(255,54,54,.14) 0%, rgba(255,54,54,.04) 100%)',
      alert:    'linear-gradient(135deg, rgba(255,140,0,.13)  0%, rgba(255,140,0,.03)  100%)',
      trending: 'linear-gradient(135deg, rgba(30,122,255,.12) 0%, rgba(30,122,255,.03) 100%)',
      standard: 'linear-gradient(135deg, rgba(0,204,112,.12)  0%, rgba(0,204,112,.03)  100%)',
    };
    return bgs[level] ?? 'transparent';
  }

  critSigClass(level: string): string {
    return `sig sig-${level || 'standard'}`;
  }

  critBadgeClass(level: string): string {
    return ({ breaking: 'ib-breaking', alert: 'ib-alert', trending: 'ib-trending', standard: 'ib-standard' } as any)[level] ?? '';
  }

  statusBadgeClass(status: string): string {
    return ({ pending: 'ib-pending', approved: 'ib-approved', rejected: 'ib-rejected', posted: 'ib-posted', failed: 'ib-failed' } as any)[status] ?? '';
  }

  showToast(msg: string, ok = true) {
    clearTimeout(this.toastTimer);
    this.toast.set({ msg, ok });
    this.toastTimer = setTimeout(() => this.toast.set(null), 2500);
  }

  async setStatus(status: Article['status']) {
    try {
      await this.supabase.updateArticleStatus(this.article.id, status);
      this.article = { ...this.article, status };
      this.showToast(`Article ${status}`);
      this.articleUpdated.emit(this.article);
    } catch (err: any) {
      this.showToast(err.message, false);
    }
  }

  async postToFacebook() {
    this.posting.set(true);
    try {
      const result = await this.supabase.postToFacebook([this.article.id]);
      const r = result.results[0];
      if (r?.success) {
        this.article = { ...this.article, status: 'posted', fb_post_id: r.fb_post_id ?? null };
        this.articleUpdated.emit(this.article);
        this.showToast('Posted to Facebook ✓');
      } else {
        this.showToast(r?.error ?? 'Post failed', false);
      }
    } catch (err: any) {
      this.showToast(err.message, false);
    } finally {
      this.posting.set(false);
    }
  }

  async generate() {
    this.generating.set(true);
    try {
      const result = await this.supabase.generateCaptions([this.article.id]);
      if (result.processed === 0) {
        const errMsg = result.errors?.[0]?.error ?? 'Generation failed';
        this.showToast(errMsg, false);
      } else {
        const articles = await this.supabase.getArticles();
        const updated = articles.find(a => a.id === this.article.id);
        if (updated) {
          this.article = updated;
          this.articleUpdated.emit(this.article);
        }
        this.showToast('Content generated');
      }
    } catch (err: any) {
      this.showToast(err.message, false);
    } finally {
      this.generating.set(false);
    }
  }

  copy(text: string) {
    navigator.clipboard.writeText(text).then(() => this.showToast('Copied'));
  }

  copyFullPost() {
    const cap = this.article.ai_caption;
    if (!cap?.intro) return;
    const text = [cap.intro, cap.question, cap.cta].filter(Boolean).join('\n\n');
    this.copy(text);
  }
}
