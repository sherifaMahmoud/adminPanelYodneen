import { ProductsComponent } from './admin/products/products.component';
import { Routes } from '@angular/router';
import { SidebarComponent } from './admin/Sidebar/Sidebar.component';
import { OffersComponent } from './admin/offers/offers.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'sidebar', component: SidebarComponent },
  { path: 'offers', component: OffersComponent },
  { path: 'categories', component: CategoriesComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'sidebar', component: SidebarComponent },

  { path: 'login', component: LoginComponent
   },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // ✅ بدل /products



];
