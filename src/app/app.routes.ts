import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';

export const routes: Routes = [
  { path: '', component: Home, title: 'ByteX — Discover the Future of Technology' },
  { path: 'shop', component: Shop, title: 'ByteX — Shop' },
  { path: '**', redirectTo: '' },
];
