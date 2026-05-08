import { Component, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf, NgClass, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { Article, ArticleStats, SupabaseService } from '../core/supabase.service';
import { ArticleDetailDialogComponent } from './article-detail-dialog.component';

const COUNTRIES = ['FR', 'IT', 'AU', 'SE'];
const STATUSES = ['pending', 'approved', 'rejected', 'posted', 'failed'];
const CRITICALITIES = ['breaking', 'alert', 'trending', 'standard'];

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [
    NgIf, NgClass, NgFor, DatePipe, TitleCasePipe, ReactiveFormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule, MatToolbarModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatCheckboxModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule,
  ],
  template: `
    <!-- Top Toolbar -->
    <mat-toolbar color="primary" class="main-toolbar">
      <mat-icon class="toolbar-icon">newspaper</mat-icon>
      <span class="toolbar-title">News Pipeline Dashboard</span>
      <span class="spacer"></span>
      <span class="user-email">{{ userEmail() }}</span>
      <button mat-icon-button matTooltip="Sign out" (click)="signOut()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="page-content">

      <!-- Stats Row -->
      <div class="stats-row" *ngIf="stats()">
        <div class="stat-card stat-total" (click)="filterByStatus('')">
          <div class="stat-value">{{ stats()!.total }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card stat-pending" (click)="filterByStatus('pending')">
          <div class="stat-value">{{ stats()!.pending }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card stat-approved" (click)="filterByStatus('approved')">
          <div class="stat-value">{{ stats()!.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card stat-rejected" (click)="filterByStatus('rejected')">
          <div class="stat-value">{{ stats()!.rejected }}</div>
          <div class="stat-label">Rejected</div>
        </div>
        <div class="stat-card stat-posted" (click)="filterByStatus('posted')">
          <div class="stat-value">{{ stats()!.posted }}</div>
          <div class="stat-label">Posted</div>
        </div>
        <div class="stat-card stat-failed" (click)="filterByStatus('failed')">
          <div class="stat-value">{{ stats()!.failed }}</div>
          <div class="stat-label">Failed</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar" [formGroup]="filters">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Country</mat-label>
          <mat-select formControlName="country">
            <mat-option value="">All Countries</mat-option>
            <mat-option *ngFor="let c of countries" [value]="c">{{ c }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="">All Statuses</mat-option>
            <mat-option *ngFor="let s of statuses" [value]="s">{{ s | titlecase }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Criticality</mat-label>
          <mat-select formControlName="criticality">
            <mat-option value="">All Levels</mat-option>
            <mat-option *ngFor="let c of criticalities" [value]="c">{{ c | titlecase }}</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="load()" matTooltip="Refresh data">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <!-- Batch Action Bar (shown when rows are selected) -->
      <div class="batch-bar" *ngIf="selection.hasValue()">
        <mat-icon>check_box</mat-icon>
        <strong>{{ selection.selected.length }} selected</strong>
        <button mat-raised-button color="primary" [disabled]="generating()" (click)="generateSelected()">
          <mat-spinner *ngIf="generating()" diameter="16"></mat-spinner>
          <mat-icon *ngIf="!generating()">auto_awesome</mat-icon>
          {{ generating() ? 'Generating...' : 'Generate Captions' }}
        </button>
        <button mat-raised-button color="warn" (click)="deleteSelected()">
          <mat-icon>delete_sweep</mat-icon> Delete Selected
        </button>
        <button mat-icon-button (click)="selection.clear()" matTooltip="Clear selection">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading()" class="loading-overlay">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading articles...</p>
      </div>

      <!-- Table -->
      <div class="table-container" *ngIf="!loading()">
        <table mat-table [dataSource]="dataSource" matSort matSortActive="created_at" matSortDirection="desc">

          <!-- Checkbox Column -->
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef class="checkbox-col">
              <mat-checkbox
                (change)="$event ? toggleAllRows() : null"
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()"
                matTooltip="Select all"
              ></mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" class="checkbox-col">
              <mat-checkbox
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null"
                [checked]="selection.isSelected(row)"
              ></mat-checkbox>
            </td>
          </ng-container>

          <!-- Criticality Column (sorts by priority_score numerically) -->
          <ng-container matColumnDef="criticality">
            <th mat-header-cell *matHeaderCellDef mat-sort-header arrowPosition="after">Level</th>
            <td mat-cell *matCellDef="let row">
              <span class="crit-chip" [ngClass]="'crit-' + row.criticality">
                {{ critIcon(row.criticality) }} {{ row.criticality | titlecase }}
              </span>
            </td>
          </ng-container>

          <!-- Title Column -->
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header arrowPosition="after">Article</th>
            <td mat-cell *matCellDef="let row" class="title-cell">
              <div class="article-title" [matTooltip]="row.title">{{ row.title }}</div>
              <div class="article-source">{{ row.source }}</div>
            </td>
          </ng-container>

          <!-- Country Column -->
          <ng-container matColumnDef="country">
            <th mat-header-cell *matHeaderCellDef mat-sort-header arrowPosition="after">Country</th>
            <td mat-cell *matCellDef="let row">
              <span class="country-chip">{{ row.country }}</span>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header arrowPosition="after">Status</th>
            <td mat-cell *matCellDef="let row">
              <span class="status-chip" [ngClass]="'status-' + row.status">
                {{ row.status | titlecase }}
              </span>
            </td>
          </ng-container>

          <!-- AI Content Column -->
          <ng-container matColumnDef="has_ai">
            <th mat-header-cell *matHeaderCellDef mat-sort-header arrowPosition="after">AI</th>
            <td mat-cell *matCellDef="let row" class="ai-cell">
              <mat-icon
                [class]="row.ai_caption ? 'ai-yes' : 'ai-no'"
                [matTooltip]="row.ai_caption ? 'Caption + SEO + Image ready' : 'No AI content yet'"
              >
                {{ row.ai_caption ? 'check_circle' : 'radio_button_unchecked' }}
              </mat-icon>
            </td>
          </ng-container>

          <!-- Inserted Date Column -->
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef mat-sort-header arrowPosition="after">Inserted</th>
            <td mat-cell *matCellDef="let row" class="date-cell">
              {{ row.created_at | date:'dd MMM yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row" class="actions-cell" (click)="$event.stopPropagation()">
              <button mat-icon-button matTooltip="View / Review" (click)="openDetail(row)">
                <mat-icon>visibility</mat-icon>
              </button>
              <button
                mat-icon-button
                matTooltip="Generate AI content"
                [disabled]="generating()"
                (click)="generateOne(row)"
              >
                <mat-icon>auto_awesome</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Delete article" color="warn" (click)="deleteOne(row)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns;"
            class="article-row"
            [class.selected-row]="selection.isSelected(row)"
            (click)="openDetail(row)"
          ></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" colspan="8">
              <mat-icon>inbox</mat-icon>
              <p>No articles match the selected filters.</p>
            </td>
          </tr>
        </table>

        <mat-paginator
          [pageSizeOptions]="[25, 50, 100]"
          [pageSize]="25"
          showFirstLastButtons
        ></mat-paginator>
      </div>

    </div>
  `,
  styles: [`
    .main-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-icon { margin-right: 8px; }
    .toolbar-title { font-size: 1.1rem; font-weight: 600; }
    .spacer { flex: 1; }
    .user-email { font-size: 0.85rem; margin-right: 8px; opacity: 0.85; }

    .page-content { padding: 16px; max-width: 1400px; margin: 0 auto; }

    .stats-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .stat-card {
      flex: 1;
      min-width: 80px;
      background: white;
      border-radius: 8px;
      padding: 12px 16px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-top: 3px solid #e0e0e0;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .stat-card:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.15); }
    .stat-total  { border-color: #607d8b; }
    .stat-pending  { border-color: #f57c00; }
    .stat-approved { border-color: #388e3c; }
    .stat-rejected { border-color: #d32f2f; }
    .stat-posted   { border-color: #1976d2; }
    .stat-failed   { border-color: #7b1fa2; }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: #333; }
    .stat-label { font-size: 0.72rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }

    .filter-bar {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .filter-field { min-width: 160px; }

    .batch-bar {
      display: flex;
      gap: 12px;
      align-items: center;
      background: #1565c0;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }
    .batch-bar mat-icon { color: white; }

    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
      color: #666;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    table { width: 100%; }

    .checkbox-col { width: 48px; padding-right: 0; }

    .crit-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      white-space: nowrap;
    }
    .crit-breaking { background: #ffebee; color: #c62828; }
    .crit-alert    { background: #fff3e0; color: #e65100; }
    .crit-trending { background: #e3f2fd; color: #1565c0; }
    .crit-standard { background: #f5f5f5; color: #616161; }

    .status-chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 12px;
      white-space: nowrap;
    }
    .status-pending  { background: #fff3e0; color: #e65100; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .status-posted   { background: #e3f2fd; color: #1565c0; }
    .status-failed   { background: #f3e5f5; color: #6a1b9a; }

    .country-chip {
      font-size: 0.75rem;
      font-weight: 700;
      background: #e0e0e0;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .title-cell { max-width: 340px; }
    .article-title {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 320px;
    }
    .article-source { font-size: 0.75rem; color: #888; margin-top: 2px; }

    .date-cell { font-size: 0.8rem; color: #666; white-space: nowrap; }

    .ai-yes { color: #388e3c; font-size: 20px !important; }
    .ai-no  { color: #bdbdbd; font-size: 20px !important; }
    .ai-cell { text-align: center; }

    .actions-cell { white-space: nowrap; }
    .actions-cell button { opacity: 0; transition: opacity 0.15s; }

    .article-row { cursor: pointer; transition: background 0.1s; }
    .article-row:hover { background: #f5f5f5; }
    .article-row:hover .actions-cell button { opacity: 1; }
    .selected-row { background: #e3f2fd !important; }

    .no-data { text-align: center; padding: 48px; color: #999; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
  `],
})
export class ArticleListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['select', 'criticality', 'title', 'country', 'status', 'has_ai', 'created_at', 'actions'];
  dataSource = new MatTableDataSource<Article>([]);
  selection = new SelectionModel<Article>(true, []);

  loading = signal(true);
  generating = signal(false);
  stats = signal<ArticleStats | null>(null);
  userEmail = signal('');

  filters: FormGroup;
  countries = COUNTRIES;
  statuses = STATUSES;
  criticalities = CRITICALITIES;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.filters = this.fb.group({
      country: [''],
      status: [''],
      criticality: [''],
    });
  }

  ngOnInit() {
    this.supabase.user$.subscribe(user => this.userEmail.set(user?.email ?? ''));
    this.filters.valueChanges.subscribe(() => this.load());
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Sort "Level" column by numeric priority_score, not alphabetically
    this.dataSource.sortingDataAccessor = (article, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'criticality': return article.priority_score;
        case 'has_ai': return article.ai_caption ? 1 : 0;
        case 'created_at': return article.created_at ?? '';
        default: return (article as any)[sortHeaderId] ?? '';
      }
    };
  }

  async load() {
    this.loading.set(true);
    this.selection.clear();
    try {
      const { country, status, criticality } = this.filters.value;
      const [articles, statsData] = await Promise.all([
        this.supabase.getArticles({
          country: country || undefined,
          status: status || undefined,
          criticality: criticality || undefined,
          sortBy: 'created_at',
          sortDir: 'desc',
        }),
        this.supabase.getStats(),
      ]);
      this.dataSource.data = articles;
      this.stats.set(statsData);
    } catch (err: any) {
      this.snackBar.open(`Load error: ${err.message}`, 'OK', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  filterByStatus(status: string) {
    this.filters.patchValue({ status });
  }

  openDetail(article: Article) {
    const ref = this.dialog.open(ArticleDetailDialogComponent, {
      data: { article },
      width: '720px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
    ref.afterClosed().subscribe(result => {
      if (result?.updated) this.load();
    });
  }

  async generateOne(article: Article) {
    this.generating.set(true);
    try {
      const result = await this.supabase.generateCaptions([article.id]);
      this.snackBar.open(`Generated content for ${result.processed} article`, 'OK', { duration: 3000 });
      this.load();
    } catch (err: any) {
      this.snackBar.open(`Generation failed: ${err.message}`, 'Dismiss', { duration: 5000 });
    } finally {
      this.generating.set(false);
    }
  }

  async generateSelected() {
    const ids = this.selection.selected.map(a => a.id);
    if (!ids.length) return;
    this.generating.set(true);
    try {
      const result = await this.supabase.generateCaptions(ids);
      this.snackBar.open(`Generated ${result.processed} / ${ids.length} articles`, 'OK', { duration: 3000 });
      this.load();
    } catch (err: any) {
      this.snackBar.open(`Generation failed: ${err.message}`, 'Dismiss', { duration: 5000 });
    } finally {
      this.generating.set(false);
    }
  }

  async deleteOne(article: Article) {
    if (!confirm(`Delete "${article.title}"?\n\nThis cannot be undone.`)) return;
    try {
      await this.supabase.deleteArticle(article.id);
      this.snackBar.open('Article deleted', 'OK', { duration: 2000 });
      this.load();
    } catch (err: any) {
      this.snackBar.open(`Delete failed: ${err.message}`, 'OK', { duration: 4000 });
    }
  }

  async deleteSelected() {
    const selected = this.selection.selected;
    if (!selected.length) return;
    if (!confirm(`Delete ${selected.length} selected articles?\n\nThis cannot be undone.`)) return;
    try {
      await this.supabase.deleteArticles(selected.map(a => a.id));
      this.snackBar.open(`Deleted ${selected.length} articles`, 'OK', { duration: 2000 });
      this.load();
    } catch (err: any) {
      this.snackBar.open(`Delete failed: ${err.message}`, 'OK', { duration: 4000 });
    }
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  critIcon(level: string): string {
    return { breaking: '🔴', alert: '🟠', trending: '🔵', standard: '⚪' }[level] ?? '⚪';
  }
}
