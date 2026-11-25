import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CartDrawerComponent,
    ToastComponent,
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-[#FBF9F6] text-[#1C1A1D]">
      <app-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
      <app-cart-drawer />
      <app-toast />
    </div>
  `,
})
export class AppComponent {}
