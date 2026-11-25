import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { formatPrice } from '../../../core/utils/format.util';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  template: `
    @if (cartService.isOpen()) {
      <div
        class="fixed inset-0 z-50 flex justify-end bg-[#1C1A1D]/45"
        role="dialog"
        aria-modal="true"
        aria-label="Корзина покупок"
        (click)="cartService.closeDrawer()"
      >
        <div
          class="flex h-full w-full max-w-md flex-col bg-[#FBF9F6] shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between border-b border-[#1C1A1D]/10 bg-white px-6 py-4">
            <div class="flex items-center gap-2.5">
              <svg class="h-5 w-5 text-[#D94A64]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">Корзина</h2>
              <span class="tabular-nums text-sm text-[#665E64]">
                ({{ cartService.totalCount() }})
              </span>
            </div>
            <button
              type="button"
              (click)="cartService.closeDrawer()"
              aria-label="Закрыть корзину"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-[#665E64] hover:bg-[#F8EEF0] hover:text-[#1C1A1D] cursor-pointer"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          @if (cartService.items().length === 0) {
            <div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EEF0] text-[#D94A64]">
                <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h3 class="mt-5 font-display text-xl font-semibold text-[#1C1A1D]">
                Корзина пока пуста
              </h3>
              <p class="mt-2 max-w-xs text-sm text-[#665E64]">
                Перейдите в каталог, чтобы подобрать средства для ухода, макияжа или парфюмерии.
              </p>
              <button
                type="button"
                (click)="goToCatalog()"
                class="mt-6 rounded-lg bg-[#D94A64] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
              >
                Перейти в каталог
              </button>
            </div>
          } @else {
            <div class="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              @for (item of cartService.items(); track item.key) {
                <div class="flex gap-4 rounded-xl border border-[#1C1A1D]/8 bg-white p-3.5">
                  <button
                    type="button"
                    (click)="openProduct(item.product.id)"
                    class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F8F5F0] cursor-pointer"
                  >
                    <img
                      [src]="item.product.image"
                      [alt]="item.product.name"
                      referrerPolicy="no-referrer"
                      class="h-full w-full object-cover"
                    />
                  </button>

                  <div class="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <p class="text-xs font-medium text-[#665E64]">
                            {{ item.product.brand }}
                          </p>
                          <button
                            type="button"
                            (click)="openProduct(item.product.id)"
                            class="block max-w-full truncate text-left text-sm font-semibold text-[#1C1A1D] hover:text-[#D94A64] cursor-pointer"
                          >
                            {{ item.product.name }}
                          </button>
                        </div>
                        <button
                          type="button"
                          (click)="cartService.removeItem(item.key)"
                          [attr.aria-label]="'Удалить ' + item.product.name"
                          class="shrink-0 p-1 text-[#8E848A] hover:text-[#D94A64] cursor-pointer"
                        >
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>

                      @if (item.variant) {
                        <div class="mt-1 flex items-center gap-1.5 text-xs text-[#665E64]">
                          @if (item.variant.hex) {
                            <span
                              class="inline-block h-2.5 w-2.5 rounded-full border border-black/15"
                              [style.backgroundColor]="item.variant.hex"
                            ></span>
                          }
                          <span>{{ item.variant.name }}</span>
                        </div>
                      }
                    </div>

                    <div class="mt-3 flex items-center justify-between gap-2">
                      <div class="flex items-center rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6]">
                        <button
                          type="button"
                          (click)="cartService.updateQuantity(item.key, item.quantity - 1)"
                          aria-label="Уменьшить количество"
                          class="flex h-7 w-7 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                        >
                          −
                        </button>
                        <span class="tabular-nums w-8 text-center text-xs font-semibold text-[#1C1A1D]">
                          {{ item.quantity }}
                        </span>
                        <button
                          type="button"
                          (click)="cartService.updateQuantity(item.key, item.quantity + 1)"
                          aria-label="Увеличить количество"
                          class="flex h-7 w-7 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div class="text-right">
                        <p class="tabular-nums text-sm font-semibold text-[#1C1A1D]">
                          {{ formatPrice(item.product.price * item.quantity) }}
                        </p>
                        @if (item.quantity > 1) {
                          <p class="tabular-nums text-[11px] text-[#8E848A]">
                            {{ formatPrice(item.product.price) }} / шт.
                          </p>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div class="border-t border-[#1C1A1D]/10 bg-white px-6 py-5">
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#665E64]">Итого за товары</span>
                <span class="tabular-nums text-lg font-bold text-[#1C1A1D]">
                  {{ formatPrice(cartService.totalPrice()) }}
                </span>
              </div>
              <p class="mt-1 text-xs text-[#8E848A]">
                Демонстрационный расчёт корзины без списания средств.
              </p>

              <div class="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  (click)="goToCheckout()"
                  class="w-full rounded-lg bg-[#D94A64] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
                >
                  Оформить заказ
                </button>
                <button
                  type="button"
                  (click)="cartService.clearCart()"
                  class="w-full rounded-lg border border-[#1C1A1D]/15 py-2 text-xs font-medium text-[#665E64] transition-colors hover:bg-[#F8EEF0] hover:text-[#1C1A1D] cursor-pointer"
                >
                  Очистить корзину
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  readonly formatPrice = formatPrice;

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.cartService.isOpen()) {
      this.cartService.closeDrawer();
    }
  }

  openProduct(id: number): void {
    this.cartService.closeDrawer();
    void this.router.navigate(['/product', id]);
  }

  goToCatalog(): void {
    this.cartService.closeDrawer();
    this.productService.openCatalogWith({});
  }

  goToCheckout(): void {
    this.cartService.closeDrawer();
    void this.router.navigate(['/checkout']);
  }
}
