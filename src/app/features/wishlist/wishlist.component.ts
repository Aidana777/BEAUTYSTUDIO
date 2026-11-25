import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <div class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Хлебные крошки" class="mb-6 flex items-center gap-2 text-xs text-[#665E64]">
        <a routerLink="/" class="hover:text-[#1C1A1D]">Главная</a>
        <span>/</span>
        <span class="font-medium text-[#1C1A1D]">Избранное</span>
      </nav>

      <div class="flex flex-col justify-between gap-4 border-b border-[#1C1A1D]/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <span class="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
            Личная подборка
          </span>
          <h1 class="mt-2 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
            Избранные средства
          </h1>
          <p class="mt-1.5 text-sm text-[#665E64]">
            Сохранённые позиции хранятся в браузере, чтобы вы могли вернуться к ним в любое время.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span class="tabular-nums text-sm font-medium text-[#665E64]">
            Позиций: {{ wishlistService.count() }}
          </span>
          <button
            type="button"
            (click)="productService.openCatalogWith({})"
            class="rounded-lg border border-[#1C1A1D]/15 bg-white px-4 py-2 text-xs font-semibold text-[#1C1A1D] transition-colors hover:border-[#D94A64] hover:text-[#D94A64] cursor-pointer"
          >
            В каталог
          </button>
        </div>
      </div>

      @if (wishlistService.savedProducts().length === 0) {
        <div class="mt-12 flex flex-col items-center justify-center rounded-2xl border border-[#1C1A1D]/10 bg-white px-6 py-16 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EEF0] text-[#D94A64]">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h2 class="mt-5 font-display text-2xl font-semibold text-[#1C1A1D]">
            В избранном пока нет товаров
          </h2>
          <p class="mt-2 max-w-md text-sm leading-relaxed text-[#665E64]">
            Нажмите на значок сердца на карточке любого средства в каталоге, чтобы собрать персональный список ухода и макияжа.
          </p>
          <button
            type="button"
            (click)="productService.openCatalogWith({})"
            class="mt-6 rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
          >
            Перейти в каталог
          </button>
        </div>
      } @else {
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (product of wishlistService.savedProducts(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </div>
  `,
})
export class WishlistComponent {
  readonly wishlistService = inject(WishlistService);
  readonly productService = inject(ProductService);
}
