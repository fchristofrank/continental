import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'analyze/single/:code',
    loadComponent: () =>
      import('./pages/single-analysis/single-analysis').then((m) => m.SingleAnalysis),
  },
  {
    path: 'analyze/bilateral/:a/:b',
    loadComponent: () =>
      import('./pages/bilateral-analysis/bilateral-analysis').then((m) => m.BilateralAnalysis),
  },
  {
    path: 'analyze/multi',
    loadComponent: () =>
      import('./pages/multi-analysis/multi-analysis').then((m) => m.MultiAnalysis),
  },
  { path: '**', redirectTo: '' },
];
