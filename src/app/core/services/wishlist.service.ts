import { Injectable, computed, inject, signal } from '@angular/core';
import { PRODUCTS } from '../data/products.data';
import { CartService } from './cart.service';

const WISHLIST_STORAGE_KEY = 'beauty_studio_wishlist_v1';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly cartService = inject(CartService);

  readonly wishlistIds = signal<number[]>(this.loadWishlist());

  readonly count = computed(() => this.wishlistIds().length);

  readonly savedProducts = computed(() =>
    PRODUCTS.filter((p) => this.wishlistIds().includes(p.id)),
  );

  isWishlisted(productId: number): boolean {
    return this.wishlistIds().includes(productId);
  }

  toggle(productId: number): void {
    const exists = this.isWishlisted(productId);
    const next = exists
      ? this.wishlistIds().filter((id) => id !== productId)
      : [productId, ...this.wishlistIds()];

    this.wishlistIds.set(next);
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }

    if (exists) {
      this.cartService.showToast({ text: 'Товар удалён из избранного' });
    } else {
      this.cartService.showToast({
        text: 'Товар сохранён в избранное',
        actionLabel: 'Избранное',
        actionRoute: '/wishlist',
      });
    }
  }

  private loadWishlist(): number[] {
    try {
      const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  }
}
