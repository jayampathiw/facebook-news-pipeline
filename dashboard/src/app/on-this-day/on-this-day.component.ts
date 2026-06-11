import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OnThisDayPost, SupabaseService } from '../core/supabase.service';

@Component({
  selector: 'app-on-this-day',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <!-- Navbar -->
    <nav class="ink-navbar" style="display:flex;align-items:center;justify-content:space-between;padding:0 16px;height:52px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="sig sig-breaking" style="width:9px;height:9px;"></span>
        <span style="font-family:'Playfair Display',serif;font-weight:900;font-size:18px;letter-spacing:.06em;color:var(--ink-text);">SIGNAL</span>
        <span class="hidden sm:inline" style="font-size:10px;color:var(--ink-text-3);letter-spacing:.12em;text-transform:uppercase;">Console</span>
        <a routerLink="/articles" style="font-size:11px;font-weight:600;color:var(--ink-text-2);text-decoration:none;padding:3px 8px;border-radius:4px;background:var(--ink-raised);letter-spacing:.05em;">Articles</a>
        <a routerLink="/reels" style="font-size:11px;font-weight:600;color:var(--ink-text-2);text-decoration:none;padding:3px 8px;border-radius:4px;background:var(--ink-raised);letter-spacing:.05em;">▶ Reels</a>
        <a routerLink="/on-this-day" style="font-size:11px;font-weight:600;color:#b47828;text-decoration:none;padding:3px 8px;border-radius:4px;background:rgba(180,120,40,0.12);letter-spacing:.05em;">📅 On This Day</a>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="hidden sm:inline" style="font-size:11px;color:var(--ink-text-3);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ userEmail() }}</span>
        <button class="btn-theme" (click)="toggleTheme()" [title]="isDark() ? 'Switch to light' : 'Switch to dark'">{{ isDark() ? '☀' : '🌙' }}</button>
        <button class="btn-ink" style="height:30px;font-size:12px;padding:0 12px;" (click)="signOut()">Sign out</button>
      </div>
    </nav>

    <div style="min-height:calc(100vh - 52px);">
      <div style="max-width:960px;margin:0 auto;padding:16px 12px 64px;">

        <!-- Header -->
        <div style="margin-bottom:20px;">
          <h1 style="font-size:20px;font-weight:700;color:var(--ink-text);margin:0 0 4px;">📅 On This Day</h1>
          <p style="font-size:12px;color:var(--ink-text-3);margin:0;">Multi-photo historical posts for Italy &amp; France — Wikipedia events, AI-selected, AI-written</p>
        </div>

        <!-- Generate panel -->
        <div class="ink-surface" style="border-radius:10px;border:1px solid var(--ink-border);padding:16px;margin-bottom:16px;">
          <p class="section-label" style="margin-bottom:10px;">Generate content</p>

          <!-- Country tabs -->
          <div style="display:flex;gap:6px;margin-bottom:12px;">
            @for (c of ['IT','FR']; track c) {
              <button class="country-pill" [class.active]="generateCountry() === c" (click)="generateCountry.set(c)">
                {{ c === 'IT' ? '🇮🇹 Italy' : '🇫🇷 France' }}
              </button>
            }
          </div>

          <!-- Date mode -->
          <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
            <button class="btn-ink" [style]="dateMode()==='today' ? 'background:var(--ink-brand-glow);color:var(--ink-brand);' : ''"
                    style="height:28px;padding:0 12px;font-size:12px;" (click)="dateMode.set('today')">Today</button>
            <button class="btn-ink" [style]="dateMode()==='next7' ? 'background:var(--ink-brand-glow);color:var(--ink-brand);' : ''"
                    style="height:28px;padding:0 12px;font-size:12px;" (click)="dateMode.set('next7')">Next 7 days</button>
            <button class="btn-ink" [style]="dateMode()==='next30' ? 'background:var(--ink-brand-glow);color:var(--ink-brand);' : ''"
                    style="height:28px;padding:0 12px;font-size:12px;" (click)="dateMode.set('next30')">Next 30 days</button>
            <button class="btn-ink" [style]="dateMode()==='custom' ? 'background:var(--ink-brand-glow);color:var(--ink-brand);' : ''"
                    style="height:28px;padding:0 12px;font-size:12px;" (click)="dateMode.set('custom')">Custom date</button>
          </div>

          @if (dateMode() === 'custom') {
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
              <input type="date" class="ink-input" style="width:180px;height:32px;font-size:13px;"
                     [value]="customDate()" (change)="customDate.set($any($event.target).value)" />
              <span style="font-size:12px;color:var(--ink-text-3);">Pick a specific date</span>
            </div>
          }

          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <button class="btn-brand" style="gap:6px;" [disabled]="generating()" (click)="runGenerate()">
              @if (generating()) {
                <span class="loading loading-spinner" style="width:14px;height:14px;"></span>
                Generating…
              } @else {
                ✦ Generate {{ generateCountry() }} — {{ dateModeLabel() }}
              }
            </button>
            <span style="font-size:11px;color:var(--ink-text-3);">
              Calls edge function · content only · images via CLI afterwards
            </span>
          </div>

          <!-- Generation results -->
          @if (genResults().length > 0) {
            <div style="margin-top:12px;border-top:1px solid var(--ink-border);padding-top:10px;">
              @for (r of genResults(); track r.date) {
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;padding:3px 0;">
                  <span>{{ r.success ? (r.skipped ? '↩' : '✓') : '✗' }}</span>
                  <span style="font-family:'JetBrains Mono',monospace;color:var(--ink-text-2);">{{ r.date }}</span>
                  @if (r.skipped) { <span style="color:var(--ink-text-3);">already queued</span> }
                  @else if (r.success) { <span style="color:var(--ink-standard);">{{ r.events_count }} events · add images via CLI</span> }
                  @else { <span style="color:#e05050;">{{ r.error }}</span> }
                </div>
              }
              @if (needsImages()) {
                <div style="margin-top:8px;padding:8px 10px;background:rgba(180,120,40,0.08);border-radius:6px;font-size:11px;color:#b47828;font-family:'JetBrains Mono',monospace;">
                  To add images, run in terminal:<br/>
                  node src/scripts/queue-on-this-day.js {{ generateCountry() }} {{ newPostDates().join(' ') }}
                </div>
              }
            </div>
          }
        </div>

        @if (toast()) {
          <div [style]="'margin-bottom:12px;padding:10px 14px;border-radius:6px;font-size:13px;background:' + (toastOk() ? 'rgba(0,200,100,.12)' : 'rgba(220,50,50,.12)') + ';color:' + (toastOk() ? 'var(--ink-standard)' : '#e05050') + ';'">
            {{ toast() }}
          </div>
        }

        <!-- Country filter -->
        <div style="display:flex;gap:6px;margin-bottom:16px;">
          @for (c of ['', 'IT', 'FR']; track c) {
            <button class="country-pill" [class.active]="filterCountry() === c" (click)="filterCountry.set(c)">
              {{ c === '' ? '🌍 All' : c === 'IT' ? '🇮🇹 Italy' : '🇫🇷 France' }}
            </button>
          }
        </div>

        @if (loading()) {
          <div style="text-align:center;padding:40px;color:var(--ink-text-3);">Loading posts…</div>
        } @else if (filtered().length === 0) {
          <div style="text-align:center;padding:60px 20px;color:var(--ink-text-3);">
            <div style="font-size:32px;margin-bottom:12px;">📅</div>
            <div style="font-size:14px;">No posts yet. Use the Generate panel above.</div>
          </div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:12px;">
            @for (post of filtered(); track post.id) {
              <div class="ink-surface" style="border-radius:10px;border:1px solid var(--ink-border);overflow:hidden;">

                <!-- Card header -->
                <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--ink-border);flex-wrap:wrap;gap:8px;">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <span style="font-size:16px;">{{ post.country === 'IT' ? '🇮🇹' : '🇫🇷' }}</span>
                    <div>
                      <div style="font-size:14px;font-weight:600;color:var(--ink-text);">{{ post.title }}</div>
                      <div style="font-size:11px;color:var(--ink-text-3);margin-top:2px;">
                        {{ post.post_date | date:'EEEE, d MMMM yyyy' }} · {{ post.events.length }} events
                        · {{ imageCount(post) }}/{{ post.events.length }} images
                      </div>
                    </div>
                    <span [class]="statusClass(post.status)" style="font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;">
                      {{ post.status }}
                    </span>
                    @if (imageCount(post) < post.events.length && post.status !== 'posted') {
                      <span style="font-size:10px;color:#b47828;background:rgba(180,120,40,0.1);padding:2px 8px;border-radius:20px;">⚠ images missing</span>
                    }
                  </div>
                  <div style="display:flex;gap:6px;align-items:center;">
                    @if (post.status !== 'posted') {
                      <button class="btn-brand" style="height:28px;padding:0 12px;font-size:12px;" [disabled]="posting() === post.id" (click)="postToFacebook(post)">
                        @if (posting() === post.id) { <span class="loading loading-spinner" style="width:12px;height:12px;"></span> }
                        📤 Post
                      </button>
                    } @else {
                      <a (click)="openUrl('https://www.facebook.com/' + post.fb_post_id)"
                         style="font-size:12px;color:var(--ink-brand);text-decoration:none;padding:0 8px;height:28px;display:flex;align-items:center;gap:4px;cursor:pointer;">
                        View on FB ↗
                      </a>
                    }
                    <button class="btn-ink" style="height:28px;padding:0 10px;font-size:12px;color:#e05050;" (click)="deletePost(post)">Delete</button>
                  </div>
                </div>

                <!-- Image strip -->
                @if (post.events.length > 0) {
                  <div style="display:flex;gap:4px;padding:10px 12px;overflow-x:auto;" class="scrollbar-none">
                    @for (ev of post.events; track ev.year) {
                      <div style="flex-shrink:0;width:110px;position:relative;">
                        @if (ev.image_url) {
                          <img [src]="ev.image_url" alt="{{ ev.title }}"
                               style="width:110px;height:110px;object-fit:cover;border-radius:6px;display:block;" />
                        } @else {
                          <div style="width:110px;height:110px;border-radius:6px;background:var(--ink-raised);border:1px dashed var(--ink-border);display:flex;align-items:center;justify-content:center;color:var(--ink-text-3);font-size:10px;text-align:center;padding:6px;box-sizing:border-box;">
                            No image<br/>run CLI
                          </div>
                        }
                        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.75));border-radius:0 0 6px 6px;padding:4px 5px;">
                          <div style="font-size:10px;font-weight:700;color:#fff;line-height:1.2;">{{ ev.year }}</div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Events list -->
                <div style="padding:0 16px 12px;">
                  @for (ev of post.events; track ev.year) {
                    <div style="padding:7px 0;border-top:1px solid var(--ink-border);display:flex;gap:10px;align-items:flex-start;">
                      <span style="font-size:11px;font-weight:700;color:#b47828;min-width:40px;padding-top:1px;">{{ ev.year }}</span>
                      <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:600;color:var(--ink-text);">{{ ev.title }}</div>
                        <div style="font-size:12px;color:var(--ink-text-2);margin-top:2px;line-height:1.5;">{{ ev.summary }}</div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Caption preview -->
                @if (post.ai_caption?.intro) {
                  <div style="margin:0 16px 12px;padding:10px 12px;background:var(--ink-raised);border-radius:6px;font-size:12px;color:var(--ink-text-2);white-space:pre-wrap;max-height:100px;overflow-y:auto;line-height:1.5;">{{ post.ai_caption!.intro }}</div>
                }

                <!-- CLI hint for missing images -->
                @if (imageCount(post) < post.events.length && post.status !== 'posted') {
                  <div style="margin:0 16px 12px;padding:8px 10px;background:rgba(180,120,40,0.08);border-radius:6px;font-size:11px;color:#b47828;font-family:'JetBrains Mono',monospace;">
                    node src/scripts/queue-on-this-day.js {{ post.country }} {{ post.post_date }}
                  </div>
                }

              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: flex; flex-direction: column; min-height: 100vh; }`],
})
export class OnThisDayComponent implements OnInit {
  posts      = signal<OnThisDayPost[]>([]);
  loading    = signal(true);
  generating = signal(false);
  posting    = signal<string | null>(null);
  toast      = signal<string | null>(null);
  toastOk    = signal(true);

  filterCountry  = signal('');
  generateCountry = signal('IT');
  dateMode       = signal<'today' | 'next7' | 'next30' | 'custom'>('today');
  customDate     = signal(new Date().toISOString().slice(0, 10));
  genResults     = signal<any[]>([]);

  filtered = computed(() => {
    const c = this.filterCountry();
    return c ? this.posts().filter(p => p.country === c) : this.posts();
  });

  dateModeLabel = computed(() => {
    switch (this.dateMode()) {
      case 'today':  return 'today';
      case 'next7':  return 'next 7 days';
      case 'next30': return 'next 30 days';
      case 'custom': return this.customDate();
    }
  });

  newPostDates = computed(() =>
    this.genResults().filter(r => r.success && !r.skipped).map(r => r.date),
  );

  needsImages = computed(() => this.newPostDates().length > 0);

  isDark    = signal(document.documentElement.getAttribute('data-theme') !== 'light');
  userEmail = signal('');

  constructor(private router: Router, private svc: SupabaseService) {}

  async ngOnInit() {
    const session = await this.svc.getSession();
    this.userEmail.set(session?.user?.email ?? '');
    await this.reload();
  }

  async reload() {
    this.loading.set(true);
    try {
      this.posts.set(await this.svc.getOnThisDayPosts());
    } catch (err: any) {
      this.showToast(err.message, false);
    } finally {
      this.loading.set(false);
    }
  }

  buildDates(): string[] {
    const today = new Date();
    switch (this.dateMode()) {
      case 'today':  return [today.toISOString().slice(0, 10)];
      case 'next7':  return Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10); });
      case 'next30': return Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10); });
      case 'custom': return [this.customDate()];
    }
  }

  async runGenerate() {
    this.generating.set(true);
    this.genResults.set([]);
    try {
      const dates = this.buildDates();
      const res = await this.svc.queueOnThisDay(this.generateCountry(), dates);
      this.genResults.set(res.results);
      const ok = res.results.filter(r => r.success && !r.skipped).length;
      const skipped = res.results.filter(r => r.skipped).length;
      this.showToast(`${ok} queued, ${skipped} skipped. Add images via CLI.`, ok > 0 || skipped > 0);
      await this.reload();
    } catch (err: any) {
      this.showToast(err.message, false);
    } finally {
      this.generating.set(false);
    }
  }

  async postToFacebook(post: OnThisDayPost) {
    this.posting.set(post.id);
    try {
      await this.svc.postOnThisDay(post.id);
      this.showToast('Posted to Facebook!', true);
      await this.reload();
    } catch (err: any) {
      this.showToast(err.message, false);
    } finally {
      this.posting.set(null);
    }
  }

  async deletePost(post: OnThisDayPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await this.svc.deleteOnThisDayPost(post.id);
      this.posts.update(list => list.filter(p => p.id !== post.id));
    } catch (err: any) {
      this.showToast(err.message, false);
    }
  }

  imageCount(post: OnThisDayPost) {
    return post.events.filter(e => e.image_url).length;
  }

  openUrl(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  statusClass(status: string) {
    if (status === 'posted') return 'ink-badge ib-standard';
    if (status === 'failed') return 'ink-badge ib-breaking';
    return 'ink-badge ib-ai';
  }

  toggleTheme() {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.isDark.set(!this.isDark());
  }

  async signOut() {
    await this.svc.signOut();
    this.router.navigate(['/login']);
  }

  private showToast(msg: string, ok: boolean) {
    this.toast.set(msg);
    this.toastOk.set(ok);
    setTimeout(() => this.toast.set(null), 6000);
  }
}
