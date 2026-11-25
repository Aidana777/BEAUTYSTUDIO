import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/shop.models';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { formatPrice, getDiscountPercent } from '../../../core/utils/format.util';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article
      (mousemove)="onMouseMove($event)"
      (mouseleave)="resetTilt()"
      [style.transform]="tiltTransform()"
      class="group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-[#1C1A1D]/8 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div>
        <div class="relative aspect-[4/3] w-full overflow-hidden bg-[#F8F5F0]">
          <a
            [routerLink]="['/product', product.id]"
            [attr.aria-label]="'Открыть ' + product.name"
            class="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D94A64]"
          >
            @if (!imgError()) {
              <img
                [src]="product.image"
                [alt]="product.name"
                loading="lazy"
                referrerPolicy="no-referrer"
                (error)="imgError.set(true)"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            } @else {
              <div class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F8EEF0] to-[#F2EFF7] p-4 text-center">
                <span class="font-display text-lg font-semibold text-[#1C1A1D]">
                  {{ product.brand }}
                </span>
                <span class="mt-1 text-xs text-[#665E64]">{{ product.name }}</span>
              </div>
            }
          </a>

          @if (statusTag) {
            <span
              class="pointer-events-none absolute left-3 top-3 rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide"
              [class]="discount ? 'bg-[#D94A64] text-white' : 'bg-[#1C1A1D]/88 text-white'"
            >
              {{ statusTag }}
            </span>
          }

          <button
            type="button"
            (click)="onToggleWishlist($event)"
            [attr.aria-label]="isWishlisted ? 'Удалить из избранного' : 'Добавить в избранное'"
            class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-150 cursor-pointer"
            [class]="
              isWishlisted
                ? 'border-[#D94A64]/30 bg-white text-[#D94A64]'
                : 'border-[#1C1A1D]/10 bg-white/95 text-[#4B4449] hover:text-[#D94A64]'
            "
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              [attr.fill]="isWishlisted ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.85"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>

        <div class="p-4">
          <div class="flex items-center gap-1.5 text-xs text-[#665E64]">
            <span class="font-medium text-[#4B4449]">{{ product.brand }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ product.volume }}</span>
          </div>

          <a
            [routerLink]="['/product', product.id]"
            class="mt-1.5 block text-left text-[15px] font-semibold leading-snug text-[#1C1A1D] transition-colors hover:text-[#D94A64] line-clamp-2"
          >
            {{ product.name }}
          </a>

          <p class="mt-1 text-xs text-[#665E64] line-clamp-1">{{ product.purpose }}</p>

          @if (product.variants && product.variants.length > 0) {
            <div class="mt-2.5 flex items-center gap-1.5">
              @for (v of product.variants.slice(0, 4); track v.id) {
                <span
                  [title]="v.name"
                  class="inline-block h-3 w-3 rounded-full border border-black/15"
                  [style.backgroundColor]="v.hex || '#E8B4BE'"
                ></span>
              }
              <span class="text-[11px] text-[#8E848A]">
                {{ product.variants.length }} вар.
              </span>
            </div>
          }
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 border-t border-[#1C1A1D]/8 px-4 py-3">
        <div>
          <div class="flex items-baseline gap-2">
            <span class="tabular-nums text-[15px] font-bold text-[#1C1A1D]">
              {{ formatPrice(product.price) }}
            </span>
            @if (product.oldPrice) {
              <span class="tabular-nums text-xs text-[#8E848A] line-through">
                {{ formatPrice(product.oldPrice) }}
              </span>
            }
          </div>
          @if (!product.inStock) {
            <span class="text-[11px] font-medium text-[#8E848A]">Нет в наличии</span>
          }
        </div>

        <button
          type="button"
          [disabled]="!product.inStock"
          (click)="addToCart()"
          class="flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150"
          [class]="
            product.inStock
              ? 'bg-[#1C1A1D] text-white hover:bg-[#D94A64] cursor-pointer'
              : 'cursor-not-allowed bg-[#EAE5E1] text-[#8E848A]'
          "
        >
          <svg
            class="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>{{ product.inStock ? 'В корзину' : 'Ожидается' }}</span>
        </button>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  @Input({ required: true }) product!: Product;

  readonly imgError = signal(false);
  readonly tiltTransform = signal('perspective(900px) rotateX(0deg) rotateY(0deg)');
  readonly formatPrice = formatPrice;

  get isWishlisted(): boolean {
    return this.wishlistService.isWishlisted(this.product.id);
  }

  get discount(): number | null {
    return getDiscountPercent(this.product.price, this.product.oldPrice);
  }

  get statusTag(): string | null {
    if (this.discount) return `−${this.discount}%`;
    if (this.product.isNew) return 'Новинка';
    if (this.product.isBestseller) return 'Хит';
    return null;
  }

  onMouseMove(e: MouseEvent): void {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    this.tiltTransform.set(
      `perspective(900px) rotateX(${(-y * 3.5).toFixed(2)}deg) rotateY(${(x * 3.5).toFixed(2)}deg)`,
    );
  }

  resetTilt(): void {
    this.tiltTransform.set('perspective(900px) rotateX(0deg) rotateY(0deg)');
  }

  onToggleWishlist(e: MouseEvent): void {
    e.stopPropagation();
    this.wishlistService.toggle(this.product.id);
  }

  addToCart(): void {
    this.cartService.addToCart(this.product);
  }
}
