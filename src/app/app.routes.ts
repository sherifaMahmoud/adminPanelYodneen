import { Routes } from '@angular/router';

import { ProductsComponent } from './admin/products/products.component';
import { SidebarComponent } from './admin/Sidebar/Sidebar.component';
import { OffersComponent } from './admin/offers/offers.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { LoginComponent } from './pages/login/login.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ===== Login =====
  {
    path: 'login',
    component: LoginComponent
  },

  // ===== Admin Pages =====
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard]
  },

  {
    path: 'offers',
    component: OffersComponent,
    canActivate: [authGuard]
  },

  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [authGuard]
  },

  {
    path: 'sidebar',
    component: SidebarComponent,
    canActivate: [authGuard]
  },

  // ===== Default =====
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ===== Not Found =====
  {
    path: '**',
    redirectTo: 'login'
  }

];