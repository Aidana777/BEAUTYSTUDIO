import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PRODUCTS } from '../data/products';
import {
  AppRoute,
  CartItem,
  FilterState,
  OrderRecord,
  Product,
  ProductVariant,
  SortOption,
} from '../types/shop';

const CART_STORAGE_KEY = 'beauty_studio_cart_v1';
const WISHLIST_STORAGE_KEY = 'beauty_studio_wishlist_v1';
const RECENT_STORAGE_KEY = 'beauty_studio_recent_v1';
const ORDERS_STORAGE_KEY = 'beauty_studio_orders_v1';

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  categoryId: null,
  subcategory: null,
  brands: [],
  productType: null,
  purpose: null,
  volume: null,
  priceMin: null,
  priceMax: null,
  inStockOnly: false,
  onlyNew: false,
  onlyBestseller: false,
  onlySale: false,
};

interface ToastMessage {
  id: number;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface StoreContextValue {
  route: AppRoute;
  navigate: (next: AppRoute) => void;
  openCatalogWith: (partial: Partial<FilterState>) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  sort: SortOption;
  setSort: (sort: SortOption) => void;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateCartQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  wishlistIds: number[];
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  recentlyViewedIds: number[];
  recordProductView: (productId: number) => void;
  lastOrder: OrderRecord | null;
  submitOrder: (order: Omit<OrderRecord, 'orderNumber' | 'createdAt'>) => OrderRecord;
  toast: ToastMessage | null;
  dismissToast: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function parseHashToRoute(): AppRoute {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw || raw === '/' || raw === '') return { page: 'home' };
  if (raw === '/catalog') return { page: 'catalog' };
  if (raw === '/wishlist') return { page: 'wishlist' };
  if (raw === '/checkout') return { page: 'checkout' };
  if (raw === '/about') return { page: 'info', section: 'about' };
  if (raw === '/delivery') return { page: 'info', section: 'delivery' };
  if (raw === '/contacts') return { page: 'info', section: 'contacts' };
  if (raw === '/faq') return { page: 'info', section: 'faq' };
  const productMatch = raw.match(/^\/product\/(\d+)$/);
  if (productMatch) {
    return { page: 'product', productId: Number(productMatch[1]) };
  }
  return { page: 'home' };
}

function routeToHash(route: AppRoute): string {
  switch (route.page) {
    case 'home':
      return '#/';
    case 'catalog':
      return '#/catalog';
    case 'wishlist':
      return '#/wishlist';
    case 'checkout':
      return '#/checkout';
    case 'product':
      return `#/product/${route.productId}`;
    case 'info':
      return `#/${route.section}`;
  }
}

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(() => parseHashToRoute());
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('popular');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = readJsonStorage<{ productId: number; variantId?: number; quantity: number }[]>(
      CART_STORAGE_KEY,
      [],
    );
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
  });

  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    readJsonStorage<number[]>(WISHLIST_STORAGE_KEY, []),
  );

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>(() =>
    readJsonStorage<number[]>(RECENT_STORAGE_KEY, []),
  );

  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(() => {
    const orders = readJsonStorage<OrderRecord[]>(ORDERS_STORAGE_KEY, []);
    return orders[0] ?? null;
  });

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashToRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      const serializable = cart.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity,
      }));
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage errors
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyViewedIds));
    } catch {
      // Ignore storage errors
    }
  }, [recentlyViewedIds]);

  const showToast = useCallback(
    (text: string, actionLabel?: string, onAction?: () => void) => {
      const id = Date.now();
      setToast({ id, text, actionLabel, onAction });
      window.setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 3400);
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const navigate = useCallback((next: AppRoute) => {
    const targetHash = routeToHash(next);
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setRoute(next);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openCatalogWith = useCallback(
    (partial: Partial<FilterState>) => {
      setFilters({
        ...DEFAULT_FILTERS,
        ...partial,
      });
      navigate({ page: 'catalog' });
    },
    [navigate],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const addToCart = useCallback(
    (product: Product, variant?: ProductVariant, quantity = 1) => {
      if (!product.inStock) {
        showToast('Товар временно отсутствует в наличии');
        return;
      }
      const resolvedVariant = variant ?? product.variants?.[0];
      const key = `${product.id}-${resolvedVariant?.id ?? 'default'}`;

      setCart((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { key, product, variant: resolvedVariant, quantity }];
      });

      showToast(
        `«${product.name}» добавлен в корзину`,
        'Открыть',
        () => setIsCartOpen(true),
      );
    },
    [showToast],
  );

  const updateCartQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    (productId: number) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast('Товар удалён из избранного');
          return prev.filter((id) => id !== productId);
        }
        showToast('Товар сохранён в избранное', 'Избранное', () =>
          navigate({ page: 'wishlist' }),
        );
        return [productId, ...prev];
      });
    },
    [navigate, showToast],
  );

  const isWishlisted = useCallback(
    (productId: number) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const recordProductView = useCallback((productId: number) => {
    setRecentlyViewedIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)];
      return next.slice(0, 8);
    });
  }, []);

  const submitOrder = useCallback(
    (orderInput: Omit<OrderRecord, 'orderNumber' | 'createdAt'>): OrderRecord => {
      const orderNumber = `BS-${Math.floor(1000 + Math.random() * 9000)}`;
      const record: OrderRecord = {
        ...orderInput,
        orderNumber,
        createdAt: new Date().toISOString(),
      };
      try {
        const existing = readJsonStorage<OrderRecord[]>(ORDERS_STORAGE_KEY, []);
        window.localStorage.setItem(
          ORDERS_STORAGE_KEY,
          JSON.stringify([record, ...existing].slice(0, 10)),
        );
      } catch {
        // Ignore storage errors
      }
      setLastOrder(record);
      setCart([]);
      return record;
    },
    [],
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      route,
      navigate,
      openCatalogWith,
      filters,
      setFilters,
      resetFilters,
      sort,
      setSort,
      cart,
      cartCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      recentlyViewedIds,
      recordProductView,
      lastOrder,
      submitOrder,
      toast,
      dismissToast,
    }),
    [
      route,
      navigate,
      openCatalogWith,
      filters,
      resetFilters,
      sort,
      cart,
      cartCount,
      cartTotal,
      isCartOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      recentlyViewedIds,
      recordProductView,
      lastOrder,
      submitOrder,
      toast,
      dismissToast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
