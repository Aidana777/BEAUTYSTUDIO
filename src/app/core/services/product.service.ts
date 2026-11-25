import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BRANDS, CATEGORIES } from '../data/categories.data';
import { PRODUCTS } from '../data/products.data';
import { FilterState, Product, SortOption } from '../models/shop.models';

const RECENT_STORAGE_KEY = 'beauty_studio_recent_v1';

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  categoryId: null,
  subcategory: null,
  brands: [],
  purpose: null,
  volume: null,
  priceMin: null,
  priceMax: null,
  inStockOnly: false,
  onlyNew: false,
  onlyBestseller: false,
  onlySale: false,
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly router = inject(Router);

  readonly allProducts = PRODUCTS;
  readonly categories = CATEGORIES;
  readonly brands = BRANDS;

  readonly filters = signal<FilterState>({ ...DEFAULT_FILTERS });
  readonly sort = signal<SortOption>('popular');
  readonly recentlyViewedIds = signal<number[]>(this.loadRecent());

  readonly availableBrands = computed(() =>
    Array.from(new Set(this.allProducts.map((p) => p.brand))).sort(),
  );

  readonly availablePurposes = computed(() => {
    const catId = this.filters().categoryId;
    const subset = catId
      ? this.allProducts.filter((p) => p.categoryId === catId)
      : this.allProducts;
    return Array.from(new Set(subset.map((p) => p.purpose))).sort();
  });

  readonly availableVolumes = computed(() => {
    const catId = this.filters().categoryId;
    const subset = catId
      ? this.allProducts.filter((p) => p.categoryId === catId)
      : this.allProducts;
    return Array.from(new Set(subset.map((p) => p.volume)));
  });

  readonly activeCategory = computed(() => {
    const catId = this.filters().categoryId;
    return this.categories.find((c) => c.id === catId) ?? null;
  });

  readonly filteredProducts = computed(() => {
    const f = this.filters();
    const s = this.sort();
    const q = f.search.trim().toLowerCase();

    const list = this.allProducts.filter((product) => {
      if (q) {
        const catName =
          this.categories.find((c) => c.id === product.categoryId)?.name.toLowerCase() ?? '';
        const matchesQuery =
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.subcategory.toLowerCase().includes(q) ||
          catName.includes(q);
        if (!matchesQuery) return false;
      }
      if (f.categoryId !== null && product.categoryId !== f.categoryId) return false;
      if (f.subcategory && product.subcategory !== f.subcategory) return false;
      if (f.brands.length > 0 && !f.brands.includes(product.brand)) return false;
      if (f.purpose && product.purpose !== f.purpose) return false;
      if (f.volume && product.volume !== f.volume) return false;
      if (f.priceMin !== null && product.price < f.priceMin) return false;
      if (f.priceMax !== null && product.price > f.priceMax) return false;
      if (f.inStockOnly && !product.inStock) return false;
      if (f.onlyNew && !product.isNew) return false;
      if (f.onlyBestseller && !product.isBestseller) return false;
      if (f.onlySale && !(product.isOnSale && product.oldPrice)) return false;
      return true;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (s === 'price-asc') return a.price - b.price;
      if (s === 'price-desc') return b.price - a.price;
      if (s === 'newest') return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      if (s === 'discount') {
        const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return db - da;
      }
      return Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller));
    });

    return sorted;
  });

  getProductById(id: number): Product | undefined {
    return this.allProducts.find((p) => p.id === id);
  }

  getCategoryProductCount(categoryId: number): number {
    return this.allProducts.filter((p) => p.categoryId === categoryId).length;
  }

  getBrandProductCount(brandName: string): number {
    return this.allProducts.filter((p) => p.brand === brandName).length;
  }

  openCatalogWith(partial: Partial<FilterState>): void {
    this.filters.set({
      ...DEFAULT_FILTERS,
      ...partial,
    });
    void this.router.navigate(['/catalog']);
  }

  updateFilters(patch: Partial<FilterState>): void {
    this.filters.update((prev) => ({ ...prev, ...patch }));
  }

  toggleBrandFilter(brand: string): void {
    this.filters.update((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }

  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
  }

  recordProductView(productId: number): void {
    const next = [
      productId,
      ...this.recentlyViewedIds().filter((id) => id !== productId),
    ].slice(0, 8);
    this.recentlyViewedIds.set(next);
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  private loadRecent(): number[] {
    try {
      const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  }
}
