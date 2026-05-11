import { ProductsComponent } from './admin/products/products.component';
import { Routes } from '@angular/router';
import { SidebarComponent } from './admin/Sidebar/Sidebar.component';
import { OffersComponent } from './admin/offers/offers.component';
import { CategoriesComponent } from './admin/categories/categories.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'offers', component: OffersComponent },
  { path: 'categories', component: CategoriesComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'sidebar', component: SidebarComponent },





];
