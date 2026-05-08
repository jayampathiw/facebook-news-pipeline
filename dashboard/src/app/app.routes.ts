import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'articles', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'articles',
    loadComponent: () => import('./articles/article-list.component').then(m => m.ArticleListComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'articles' },
];
