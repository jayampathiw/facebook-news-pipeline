import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf, NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { Article, SupabaseService } from '../core/supabase.service';

export interface DialogData {
  article: Article;
}

@Component({
  selector: 'app-article-detail-dialog',
  standalone: true,
  imports: [
    NgIf, NgClass, DatePipe, UpperCasePipe,
    MatDialogModule, MatTabsModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatTooltipModule, MatDividerModule,
  ],
  template: `
    <div class="dialog-header" [ngClass]="'crit-' + article.criticality">
      <div class="header-left">
        <span class="crit-badge">{{ article.criticality | uppercase }}</span>
        <span class="country-badge">{{ article.country }}</span>
      </div>
      <span class="status-badge" [ngClass]="'status-' + article.status">{{ article.status }}</span>
    </div>

    <h2 mat-dialog-title class="dialog-title">{{ article.title }}</h2>
    <div class="dialog-meta">
      <span class="meta-source">{{ article.source }}</span>
      <span class="meta-date">{{ article.created_at | date:'dd MMM yyyy, HH:mm' }}</span>
    </div>

    <mat-dialog-content>
      <mat-tab-group>

        <!-- Tab 1: Overview -->
        <mat-tab label="Overview">
          <div class="tab-content">
            <div class="field-block">
              <div class="field-label">Summary</div>
              <div class="field-value">{{ article.summary || '—' }}</div>
            </div>
            <mat-divider></mat-divider>
            <div class="field-block">
              <div class="field-label">Article ID</div>
              <div class="id-row">
                <code class="field-id">{{ article.id }}</code>
                <button mat-icon-button matTooltip="Copy ID" (click)="copy(article.id)">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
            </div>
            <mat-divider></mat-divider>
            <div class="field-row">
              <div class="field-block">
                <div class="field-label">URL</div>
                <a [href]="article.url" target="_blank" class="article-link">
                  <mat-icon inline>open_in_new</mat-icon> Open article
                </a>
              </div>
              <div class="field-block">
                <div class="field-label">Published</div>
                <div class="field-value">{{ article.published_at ? (article.published_at | date:'dd MMM yyyy') : '—' }}</div>
              </div>
              <div class="field-block">
                <div class="field-label">Priority Score</div>
                <div class="field-value score">{{ article.priority_score }}</div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Caption -->
        <mat-tab label="Caption">
          <div class="tab-content">
            <ng-container *ngIf="article.ai_caption; else noCaption">
              <div class="field-block">
                <div class="field-label">Intro</div>
                <div class="field-value caption-text">{{ article.ai_caption.intro }}</div>
                <button mat-icon-button matTooltip="Copy intro" (click)="copy(article.ai_caption!.intro)">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <mat-divider></mat-divider>
              <div class="field-block">
                <div class="field-label">Engagement Question</div>
                <div class="field-value caption-text">{{ article.ai_caption.question }}</div>
                <button mat-icon-button matTooltip="Copy question" (click)="copy(article.ai_caption!.question)">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <mat-divider></mat-divider>
              <div class="field-block">
                <div class="field-label">CTA</div>
                <div class="field-value caption-text">{{ article.ai_caption.cta }}</div>
                <button mat-icon-button matTooltip="Copy CTA" (click)="copy(article.ai_caption!.cta)">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <mat-divider></mat-divider>
              <div class="field-block">
                <div class="field-label">Full Post</div>
                <button mat-stroked-button (click)="copyFullPost()">
                  <mat-icon>content_copy</mat-icon> Copy full post
                </button>
              </div>
            </ng-container>
            <ng-template #noCaption>
              <div class="empty-state">
                <mat-icon>auto_awesome</mat-icon>
                <p>No caption generated yet. Use the Generate button below.</p>
              </div>
            </ng-template>
          </div>
        </mat-tab>

        <!-- Tab 3: SEO -->
        <mat-tab label="SEO">
          <div class="tab-content">
            <ng-container *ngIf="article.seo_title || article.seo_description; else noSeo">
              <div class="field-block">
                <div class="field-label">SEO Title <span class="char-count">{{ (article.seo_title || '').length }}/60</span></div>
                <div class="field-value">{{ article.seo_title || '—' }}</div>
                <button mat-icon-button matTooltip="Copy SEO title" (click)="copy(article.seo_title!)">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <mat-divider></mat-divider>
              <div class="field-block">
                <div class="field-label">SEO Description <span class="char-count">{{ (article.seo_description || '').length }}/160</span></div>
                <div class="field-value">{{ article.seo_description || '—' }}</div>
                <button mat-icon-button matTooltip="Copy SEO description" (click)="copy(article.seo_description!)">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
            </ng-container>
            <ng-template #noSeo>
              <div class="empty-state">
                <mat-icon>search</mat-icon>
                <p>No SEO content generated yet.</p>
              </div>
            </ng-template>
          </div>
        </mat-tab>

        <!-- Tab 4: Image Prompt -->
        <mat-tab label="Image">
          <div class="tab-content">
            <ng-container *ngIf="article.image_prompt; else noImage">
              <div class="field-block">
                <div class="field-label">Raw Prompt</div>
                <div class="field-value mono">{{ article.image_prompt }}</div>
                <button mat-icon-button matTooltip="Copy raw prompt" (click)="copy(article.image_prompt!)">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
              <mat-divider></mat-divider>
              <div class="field-block">
                <div class="field-label">Formatted Prompt (Midjourney / DALL·E)</div>
                <div class="field-value mono formatted-prompt">{{ article.formatted_image_prompt }}</div>
                <button mat-raised-button color="accent" (click)="copy(article.formatted_image_prompt!)">
                  <mat-icon>content_copy</mat-icon> Copy formatted prompt
                </button>
              </div>
            </ng-container>
            <ng-template #noImage>
              <div class="empty-state">
                <mat-icon>image</mat-icon>
                <p>No image prompt generated yet.</p>
              </div>
            </ng-template>
          </div>
        </mat-tab>

      </mat-tab-group>
    </mat-dialog-content>

    <mat-divider></mat-divider>

    <mat-dialog-actions class="dialog-actions">
      <div class="actions-left">
        <button
          mat-raised-button
          color="primary"
          [disabled]="generating()"
          (click)="generate()"
          matTooltip="Generate / regenerate all AI content"
        >
          <mat-spinner *ngIf="generating()" diameter="18"></mat-spinner>
          <mat-icon *ngIf="!generating()">auto_awesome</mat-icon>
          {{ generating() ? 'Generating...' : 'Generate' }}
        </button>
      </div>

      <div class="actions-right">
        <button
          mat-stroked-button
          color="warn"
          [disabled]="article.status === 'rejected'"
          (click)="setStatus('rejected')"
        >
          <mat-icon>thumb_down</mat-icon> Reject
        </button>
        <button
          mat-raised-button
          color="accent"
          [disabled]="article.status === 'approved'"
          (click)="setStatus('approved')"
        >
          <mat-icon>thumb_up</mat-icon> Approve
        </button>
        <button mat-button mat-dialog-close>Close</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 24px;
      margin: 0 -24px;
    }
    .crit-breaking { background: #ffebee; }
    .crit-alert { background: #fff3e0; }
    .crit-trending { background: #e3f2fd; }
    .crit-standard { background: #f5f5f5; }
    .header-left { display: flex; gap: 8px; align-items: center; }
    .crit-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background: #333;
      color: white;
      letter-spacing: 1px;
    }
    .country-badge {
      font-size: 0.75rem;
      font-weight: 600;
      background: #e0e0e0;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .status-posted { background: #e3f2fd; color: #1565c0; }
    .status-failed { background: #f3e5f5; color: #6a1b9a; }
    .dialog-title {
      margin-bottom: 0;
      font-size: 1.1rem;
      line-height: 1.4;
    }
    .dialog-meta {
      display: flex;
      gap: 16px;
      padding: 0 24px 8px;
      font-size: 0.8rem;
      color: #666;
    }
    .meta-source { font-weight: 600; }
    .tab-content { padding: 16px 0; display: flex; flex-direction: column; gap: 12px; }
    .field-block { display: flex; flex-direction: column; gap: 4px; }
    .field-row { display: flex; gap: 24px; flex-wrap: wrap; }
    .field-label { font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 0.9rem; color: #333; line-height: 1.5; }
    .caption-text { white-space: pre-wrap; }
    .mono { font-family: monospace; font-size: 0.8rem; white-space: pre-wrap; word-break: break-word; }
    .formatted-prompt { background: #f5f5f5; padding: 12px; border-radius: 4px; max-height: 150px; overflow-y: auto; }
    .score { font-size: 1.2rem; font-weight: 700; color: #1565c0; }
    .char-count { font-weight: 400; color: #999; margin-left: 8px; }
    .id-row { display: flex; align-items: center; gap: 4px; }
    .field-id { font-family: monospace; font-size: 0.78rem; color: #555; background: #f5f5f5; padding: 3px 8px; border-radius: 4px; user-select: all; }
    .article-link { display: flex; align-items: center; gap: 4px; color: #1565c0; font-size: 0.9rem; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px; color: #999; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .dialog-actions { display: flex; justify-content: space-between; padding: 8px 0; }
    .actions-left { display: flex; gap: 8px; }
    .actions-right { display: flex; gap: 8px; align-items: center; }
    mat-spinner { display: inline-block; }
  `],
})
export class ArticleDetailDialogComponent {
  article: Article;
  generating = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) data: DialogData,
    private dialogRef: MatDialogRef<ArticleDetailDialogComponent>,
    private supabase: SupabaseService,
    private snackBar: MatSnackBar,
  ) {
    this.article = { ...data.article };
  }

  async setStatus(status: 'approved' | 'rejected') {
    try {
      await this.supabase.updateArticleStatus(this.article.id, status);
      this.article = { ...this.article, status };
      this.snackBar.open(`Article ${status}`, 'OK', { duration: 2000 });
      this.dialogRef.close({ updated: true, article: this.article });
    } catch (err: any) {
      this.snackBar.open(`Error: ${err.message}`, 'OK', { duration: 3000 });
    }
  }

  async generate() {
    this.generating.set(true);
    try {
      await this.supabase.generateCaptions([this.article.id]);
      const articles = await this.supabase.getArticles();
      const updated = articles.find(a => a.id === this.article.id);
      if (updated) this.article = updated;
      this.snackBar.open('Content generated successfully', 'OK', { duration: 3000 });
    } catch (err: any) {
      this.snackBar.open(`Generation failed: ${err.message}`, 'OK', { duration: 4000 });
    } finally {
      this.generating.set(false);
    }
  }

  copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied to clipboard', '', { duration: 1500 });
    });
  }

  copyFullPost() {
    if (!this.article.ai_caption) return;
    const { intro, question, cta } = this.article.ai_caption;
    this.copy(`${intro}\n\n${question}\n\n${cta}`);
  }
}
