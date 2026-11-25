import { Injectable, computed, signal } from '@angular/core';
import { PRODUCTS } from '../data/products.data';
import { CartItem, OrderRecord, Product, ProductVariant, ToastMessage } from '../models/shop.models';

const CART_STORAGE_KEY = 'beauty_studio_cart_v1';
const ORDERS_STORAGE_KEY = 'beauty_studio_orders_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>(this.loadCart());
  readonly isOpen = signal(false);
  readonly toast = signal<ToastMessage | null>(null);
  readonly lastOrder = signal<OrderRecord | null>(this.loadLastOrder());

  readonly totalCount = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0),
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  );

  openDrawer(): void {
    this.isOpen.set(true);
  }

  closeDrawer(): void {
    this.isOpen.set(false);
  }

  addToCart(product: Product, variant?: ProductVariant, quantity = 1): void {
    if (!product.inStock) {
      this.showToast({ text: 'Товар временно отсутствует в наличии' });
      return;
    }

    const resolvedVariant = variant ?? product.variants?.[0];
    const key = `${product.id}-${resolvedVariant?.id ?? 'default'}`;

    this.items.update((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { key, product, variant: resolvedVariant, quantity }];
    });

    this.persistCart();
    this.showToast({
      text: `«${product.name}» добавлен в корзину`,
      actionLabel: 'Открыть',
      openCart: true,
    });
  }

  updateQuantity(key: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(key);
      return;
    }
    this.items.update((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
    this.persistCart();
  }

  removeItem(key: string): void {
    this.items.update((prev) => prev.filter((item) => item.key !== key));
    this.persistCart();
  }

  clearCart(): void {
    this.items.set([]);
    this.persistCart();
  }

  submitOrder(orderInput: Omit<OrderRecord, 'orderNumber' | 'createdAt'>): OrderRecord {
    const orderNumber = `BS-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: OrderRecord = {
      ...orderInput,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    try {
      const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as OrderRecord[]) : [];
      window.localStorage.setItem(
        ORDERS_STORAGE_KEY,
        JSON.stringify([record, ...existing].slice(0, 10)),
      );
    } catch {
      // Ignore storage errors
    }
    this.lastOrder.set(record);
    this.clearCart();
    return record;
  }

  showToast(payload: Omit<ToastMessage, 'id'>): void {
    const id = Date.now();
    this.toast.set({ id, ...payload });
    window.setTimeout(() => {
      if (this.toast()?.id === id) {
        this.toast.set(null);
      }
    }, 3400);
  }

  dismissToast(): void {
    this.toast.set(null);
  }

  private persistCart(): void {
    try {
      const serializable = this.items().map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity,
      }));
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage quota errors
    }
  }

  private loadCart(): CartItem[] {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const saved = JSON.parse(raw) as {
        productId: number;
        variantId?: number;
        quantity: number;
      }[];
      return saved
        .map((entry) => {
          const product = PRODUCTS.find((p) => p.id === entry.productId);
          if (!product) return null;
          const variant = entry.variantId
            ? product.variants?.find((v) => v.id === entry.variantId)
            : product.variants?.[0];
          const key = `${product.id}-${variant?.id ?? 'default'}`;
          return {
            key,
            product,
            variant,
            quantity: Math.max(1, entry.quantity),
          } as CartItem;
        })
        .filter((item): item is CartItem => item !== null);
    } catch {
      return [];
    }
  }

  private loadLastOrder(): OrderRecord | null {
    try {
      const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as OrderRecord[]) : [];
      return list[0] ?? null;
    } catch {
      return null;
    }
  }
}
