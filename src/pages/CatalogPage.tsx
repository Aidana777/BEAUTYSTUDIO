import React, { useMemo, useState } from 'react';
import { ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { SortOption } from '../types/shop';
import { ProductCard } from '../components/product/ProductCard';

const PAGE_SIZE = 12;

export const CatalogPage: React.FC = () => {
  const { filters, setFilters, resetFilters, sort, setSort, navigate } = useStore();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Dynamically derive available filter options from real catalog data
  const availableBrands = useMemo(
    () => Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort(),
    [],
  );

  const availablePurposes = useMemo(() => {
    const subset = filters.categoryId
      ? PRODUCTS.filter((p) => p.categoryId === filters.categoryId)
      : PRODUCTS;
    return Array.from(new Set(subset.map((p) => p.purpose))).sort();
  }, [filters.categoryId]);

  const availableVolumes = useMemo(() => {
    const subset = filters.categoryId
      ? PRODUCTS.filter((p) => p.categoryId === filters.categoryId)
      : PRODUCTS;
    return Array.from(new Set(subset.map((p) => p.volume)));
  }, [filters.categoryId]);

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === filters.categoryId) ?? null,
    [filters.categoryId],
  );

  const filteredProducts = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    const list = PRODUCTS.filter((product) => {
      if (q) {
        const catName =
          CATEGORIES.find((c) => c.id === product.categoryId)?.name.toLowerCase() ?? '';
        const matchesQuery =
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.subcategory.toLowerCase().includes(q) ||
          catName.includes(q);
        if (!matchesQuery) return false;
      }
      if (filters.categoryId !== null && product.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.subcategory && product.subcategory !== filters.subcategory) {
        return false;
      }
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }
      if (filters.purpose && product.purpose !== filters.purpose) {
        return false;
      }
      if (filters.volume && product.volume !== filters.volume) {
        return false;
      }
      if (filters.priceMin !== null && product.price < filters.priceMin) {
        return false;
      }
      if (filters.priceMax !== null && product.price > filters.priceMax) {
        return false;
      }
      if (filters.inStockOnly && !product.inStock) {
        return false;
      }
      if (filters.onlyNew && !product.isNew) {
        return false;
      }
      if (filters.onlyBestseller && !product.isBestseller) {
        return false;
      }
      if (filters.onlySale && !(product.isOnSale && product.oldPrice)) {
        return false;
      }
      return true;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'newest') return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      if (sort === 'discount') {
        const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
        const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
        return db - da;
      }
      // popular
      return Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller));
    });

    return sorted;
  }, [filters, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const toggleBrand = (brand: string) => {
    setVisibleCount(PAGE_SIZE);
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const activeFilterCount =
    (filters.categoryId ? 1 : 0) +
    (filters.subcategory ? 1 : 0) +
    filters.brands.length +
    (filters.purpose ? 1 : 0) +
    (filters.volume ? 1 : 0) +
    (filters.priceMin !== null ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onlyNew ? 1 : 0) +
    (filters.onlyBestseller ? 1 : 0) +
    (filters.onlySale ? 1 : 0);

  const FilterControls = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1C1A1D]">Фильтры</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              resetFilters();
              setVisibleCount(PAGE_SIZE);
            }}
            className="text-xs font-medium text-[#D94A64] hover:underline cursor-pointer"
          >
            Сбросить ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Special Flags */}
      <div className="space-y-2.5 border-t border-[#1C1A1D]/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
          Отбор
        </p>
        {[
          { key: 'inStockOnly', label: 'Только в наличии' },
          { key: 'onlyNew', label: 'Новинки' },
          { key: 'onlyBestseller', label: 'Бестселлеры' },
          { key: 'onlySale', label: 'Товары со скидкой' },
        ].map((item) => (
          <label key={item.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1A1D]">
            <input
              type="checkbox"
              checked={Boolean(filters[item.key as keyof typeof filters])}
              onChange={(e) => {
                setVisibleCount(PAGE_SIZE);
                setFilters((prev) => ({ ...prev, [item.key]: e.target.checked }));
              }}
              className="h-4 w-4 rounded border-[#1C1A1D]/30 accent-[#D94A64]"
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      {/* Categories & Subcategories */}
      <div className="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
          Категория
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setVisibleCount(PAGE_SIZE);
              setFilters((prev) => ({
                ...prev,
                categoryId: null,
                subcategory: null,
                purpose: null,
                volume: null,
              }));
            }}
            className={`block w-full rounded-md px-2.5 py-1.5 text-left text-sm cursor-pointer ${
              filters.categoryId === null
                ? 'bg-[#F8EEF0] font-semibold text-[#D94A64]'
                : 'text-[#4B4449] hover:bg-[#F5F1EC]'
            }`}
          >
            Все категории
          </button>
          {CATEGORIES.map((cat) => {
            const selected = filters.categoryId === cat.id;
            return (
              <div key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleCount(PAGE_SIZE);
                    setFilters((prev) => ({
                      ...prev,
                      categoryId: cat.id,
                      subcategory: null,
                      purpose: null,
                      volume: null,
                    }));
                  }}
                  className={`block w-full rounded-md px-2.5 py-1.5 text-left text-sm cursor-pointer ${
                    selected
                      ? 'bg-[#F8EEF0] font-semibold text-[#D94A64]'
                      : 'text-[#4B4449] hover:bg-[#F5F1EC]'
                  }`}
                >
                  {cat.name}
                </button>
                {selected && (
                  <div className="mt-1 ml-3 space-y-1 border-l border-[#1C1A1D]/10 pl-2.5">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setVisibleCount(PAGE_SIZE);
                          setFilters((prev) => ({
                            ...prev,
                            subcategory: prev.subcategory === sub.name ? null : sub.name,
                          }));
                        }}
                        className={`block w-full rounded px-2 py-1 text-left text-xs cursor-pointer ${
                          filters.subcategory === sub.name
                            ? 'font-semibold text-[#D94A64]'
                            : 'text-[#665E64] hover:text-[#1C1A1D]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5 border-t border-[#1C1A1D]/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
          Цена (₽)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="От"
            aria-label="Цена от"
            value={filters.priceMin ?? ''}
            onChange={(e) => {
              setVisibleCount(PAGE_SIZE);
              setFilters((prev) => ({
                ...prev,
                priceMin: e.target.value ? Number(e.target.value) : null,
              }));
            }}
            className="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-1.5 text-sm tabular-nums focus:border-[#D94A64] focus:outline-none"
          />
          <input
            type="number"
            min={0}
            placeholder="До"
            aria-label="Цена до"
            value={filters.priceMax ?? ''}
            onChange={(e) => {
              setVisibleCount(PAGE_SIZE);
              setFilters((prev) => ({
                ...prev,
                priceMax: e.target.value ? Number(e.target.value) : null,
              }));
            }}
            className="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-1.5 text-sm tabular-nums focus:border-[#D94A64] focus:outline-none"
          />
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
          Бренд
        </p>
        <div className="space-y-2">
          {availableBrands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1A1D]">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="h-4 w-4 rounded border-[#1C1A1D]/30 accent-[#D94A64]"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Purpose */}
      {availablePurposes.length > 1 && (
        <div className="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
            Назначение
          </p>
          <select
            aria-label="Фильтр по назначению"
            value={filters.purpose ?? ''}
            onChange={(e) => {
              setVisibleCount(PAGE_SIZE);
              setFilters((prev) => ({
                ...prev,
                purpose: e.target.value || null,
              }));
            }}
            className="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-2 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
          >
            <option value="">Любое назначение</option>
            {availablePurposes.map((purpose) => (
              <option key={purpose} value={purpose}>
                {purpose}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Volume */}
      {availableVolumes.length > 1 && (
        <div className="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
            Объём / вес
          </p>
          <select
            aria-label="Фильтр по объёму"
            value={filters.volume ?? ''}
            onChange={(e) => {
              setVisibleCount(PAGE_SIZE);
              setFilters((prev) => ({
                ...prev,
                volume: e.target.value || null,
              }));
            }}
            className="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-2 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
          >
            <option value="">Любой объём</option>
            {availableVolumes.map((vol) => (
              <option key={vol} value={vol}>
                {vol}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Breadcrumbs */}
      <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-1.5 text-xs text-[#665E64]">
        <button
          type="button"
          onClick={() => navigate({ page: 'home' })}
          className="hover:text-[#D94A64] cursor-pointer"
        >
          Главная
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <button
          type="button"
          onClick={() => resetFilters()}
          className={activeCategory ? 'hover:text-[#D94A64] cursor-pointer' : 'font-semibold text-[#1C1A1D]'}
        >
          Каталог
        </button>
        {activeCategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-[#1C1A1D]">{activeCategory.name}</span>
          </>
        )}
        {filters.subcategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#1C1A1D]">{filters.subcategory}</span>
          </>
        )}
      </nav>

      {/* Title & Demo Disclosure */}
      <div className="mt-4 flex flex-col justify-between gap-4 border-b border-[#1C1A1D]/10 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
            {activeCategory
              ? activeCategory.name
              : filters.onlyNew
                ? 'Новинки'
                : filters.onlySale
                  ? 'Акции и специальные цены'
                  : filters.onlyBestseller
                    ? 'Бестселлеры'
                    : 'Каталог косметики'}
          </h1>
          <p className="mt-1.5 text-xs text-[#665E64]">
            Демонстрационный каталог: {PRODUCTS.length} тестовых позиций с возможностью фильтрации и сортировки.
          </p>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E848A]" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => {
                setVisibleCount(PAGE_SIZE);
                setFilters((prev) => ({ ...prev, search: e.target.value }));
              }}
              placeholder="Поиск по названию или бренду"
              aria-label="Поиск по каталогу"
              className="h-10 w-full rounded-lg border border-[#1C1A1D]/15 bg-white pl-9 pr-8 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:border-[#D94A64] focus:outline-none"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                aria-label="Очистить поиск"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E848A] hover:text-[#1C1A1D] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#1C1A1D]/15 bg-white px-3.5 text-sm font-medium text-[#1C1A1D] lg:hidden cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Фильтры</span>
              {activeFilterCount > 0 && (
                <span className="tabular-nums text-xs font-semibold text-[#D94A64]">
                  ({activeFilterCount})
                </span>
              )}
            </button>

            <select
              aria-label="Сортировка товаров"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-10 rounded-lg border border-[#1C1A1D]/15 bg-white px-3 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
            >
              <option value="popular">Сначала популярные</option>
              <option value="newest">Сначала новые</option>
              <option value="price-asc">Цена: по возрастанию</option>
              <option value="price-desc">Цена: по убыванию</option>
              <option value="discount">Сначала со скидкой</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-8 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-[#1C1A1D]/8 bg-white p-5">
            {FilterControls}
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#665E64]">
            <span className="tabular-nums">
              Найдено товаров: <strong className="text-[#1C1A1D]">{filteredProducts.length}</strong>
            </span>
            {filters.brands.length > 0 && (
              <span>Бренды: {filters.brands.join(', ')}</span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1C1A1D]/8 bg-white px-6 py-16 text-center">
              <p className="font-display text-2xl font-semibold text-[#1C1A1D]">
                Ничего не найдено
              </p>
              <p className="mt-2 max-w-md text-sm text-[#665E64]">
                Попробуйте изменить поисковый запрос или сбросить активные фильтры каталога.
              </p>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setVisibleCount(PAGE_SIZE);
                }}
                className="mt-6 rounded-lg bg-[#D94A64] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#BF3851] cursor-pointer"
              >
                Сбросить фильтры и поиск
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="rounded-lg border border-[#1C1A1D]/20 bg-white px-8 py-3 text-sm font-semibold text-[#1C1A1D] transition-colors hover:border-[#D94A64] hover:text-[#D94A64] cursor-pointer"
                  >
                    Показать ещё ({Math.min(PAGE_SIZE, filteredProducts.length - visibleCount)})
                  </button>
                  <span className="tabular-nums text-xs text-[#8E848A]">
                    Показано {visibleProducts.length} из {filteredProducts.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Filter Drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#1C1A1D]/45 lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#1C1A1D]/10 pb-3">
              <span className="font-display text-xl font-semibold text-[#1C1A1D]">
                Фильтры каталога
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Закрыть фильтры"
                className="p-1 text-[#665E64]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterControls}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-lg bg-[#1C1A1D] py-3 text-sm font-semibold text-white"
            >
              Показать товары ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
