import { Routes } from '@angular/router';
import { CatalogComponent } from './features/catalog/catalog.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { HomeComponent } from './features/home/home.component';
import { InfoComponent } from './features/info/info.component';
import { ProductDetailComponent } from './features/product/product-detail.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'about', component: InfoComponent, data: { section: 'about' } },
  { path: 'delivery', component: InfoComponent, data: { section: 'delivery' } },
  { path: 'faq', component: InfoComponent, data: { section: 'faq' } },
  { path: 'contacts', component: InfoComponent, data: { section: 'contacts' } },
  { path: '**', redirectTo: '' },
];
