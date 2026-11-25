import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (cartService.toast(); as t) {
      <div
        role="status"
        aria-live="polite"
        class="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-[#1C1A1D]/12 bg-[#1C1A1D] px-4 py-3 text-white shadow-xl"
      >
        <svg class="h-4 w-4 shrink-0 text-[#F2A6B4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <p class="text-xs font-medium leading-snug sm:text-sm">{{ t.text }}</p>
        @if (t.actionLabel) {
          <button
            type="button"
            (click)="onAction(t)"
            class="ml-1 shrink-0 text-xs font-semibold text-[#F5B0BE] underline underline-offset-2 hover:text-white cursor-pointer"
          >
            {{ t.actionLabel }}
          </button>
        }
        <button
          type="button"
          (click)="cartService.dismissToast()"
          aria-label="Закрыть уведомление"
          class="ml-1 shrink-0 text-white/60 hover:text-white cursor-pointer"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    }
  `,
})
export class ToastComponent {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  onAction(toast: NonNullable<ReturnType<typeof this.cartService.toast>>): void {
    if (toast.openCart) {
      this.cartService.openDrawer();
    } else if (toast.actionRoute) {
      void this.router.navigateByUrl(toast.actionRoute);
    }
    this.cartService.dismissToast();
  }
}
