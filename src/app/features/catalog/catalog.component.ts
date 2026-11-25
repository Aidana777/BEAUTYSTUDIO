import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SortOption } from '../../core/models/shop.models';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
    <div class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <!-- Breadcrumbs -->
      <nav aria-label="Хлебные крошки" class="flex flex-wrap items-center gap-1.5 text-xs text-[#665E64]">
        <a routerLink="/" class="hover:text-[#D94A64]">Главная</a>
        <span>/</span>
        <button
          type="button"
          (click)="resetAll()"
          class="cursor-pointer"
          [class]="productService.activeCategory() ? 'hover:text-[#D94A64]' : 'font-semibold text-[#1C1A1D]'"
        >
          Каталог
        </button>
        @if (productService.activeCategory(); as activeCat) {
          <span>/</span>
          <span class="font-semibold text-[#1C1A1D]">{{ activeCat.name }}</span>
        }
        @if (productService.filters().subcategory; as sub) {
          <span>/</span>
          <span class="text-[#1C1A1D]">{{ sub }}</span>
        }
      </nav>

      <!-- Title & Toolbar -->
      <div class="mt-4 flex flex-col justify-between gap-4 border-b border-[#1C1A1D]/10 pb-6 md:flex-row md:items-end">
        <div>
          <h1 class="font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
            {{ headingTitle() }}
          </h1>
          <p class="mt-1.5 text-xs text-[#665E64]">
            Демонстрационный каталог: {{ productService.allProducts.length }} тестовых позиций с возможностью фильтрации и сортировки.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative flex-1 sm:w-64">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E848A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              [ngModel]="productService.filters().search"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Поиск по названию или бренду"
              aria-label="Поиск по каталогу"
              class="h-10 w-full rounded-lg border border-[#1C1A1D]/15 bg-white pl-9 pr-8 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:border-[#D94A64] focus:outline-none"
            />
            @if (productService.filters().search) {
              <button
                type="button"
                (click)="onSearchChange('')"
                aria-label="Очистить поиск"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E848A] hover:text-[#1C1A1D] cursor-pointer"
              >
                ×
              </button>
            }
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="mobileFiltersOpen.set(true)"
              class="inline-flex h-10 items-center gap-2 rounded-lg border border-[#1C1A1D]/15 bg-white px-3.5 text-sm font-medium text-[#1C1A1D] lg:hidden cursor-pointer"
            >
              <span>Фильтры</span>
              @if (activeFilterCount() > 0) {
                <span class="tabular-nums text-xs font-semibold text-[#D94A64]">
                  ({{ activeFilterCount() }})
                </span>
              }
            </button>

            <select
              aria-label="Сортировка товаров"
              [ngModel]="productService.sort()"
              (ngModelChange)="onSortChange($event)"
              class="h-10 rounded-lg border border-[#1C1A1D]/15 bg-white px-3 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
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

      <!-- Main Layout -->
      <div class="mt-8 flex gap-8">
        <!-- Desktop Filters Sidebar -->
        <aside class="hidden w-64 shrink-0 lg:block">
          <div class="sticky top-24 rounded-xl border border-[#1C1A1D]/8 bg-white p-5">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-semibold text-[#1C1A1D]">Фильтры</h2>
                @if (activeFilterCount() > 0) {
                  <button
                    type="button"
                    (click)="resetAll()"
                    class="text-xs font-medium text-[#D94A64] hover:underline cursor-pointer"
                  >
                    Сбросить ({{ activeFilterCount() }})
                  </button>
                }
              </div>

              <!-- Flags -->
              <div class="space-y-2.5 border-t border-[#1C1A1D]/10 pt-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Отбор</p>
                <label class="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1A1D]">
                  <input
                    type="checkbox"
                    [checked]="productService.filters().inStockOnly"
                    (change)="toggleFlag('inStockOnly', $any($event.target).checked)"
                    class="h-4 w-4 rounded border-[#1C1A1D]/30 accent-[#D94A64]"
                  />
                  <span>Только в наличии</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1A1D]">
                  <input
                    type="checkbox"
                    [checked]="productService.filters().onlyNew"
                    (change)="toggleFlag('onlyNew', $any($event.target).checked)"
                    class="h-4 w-4 rounded border-[#1C1A1D]/30 accent-[#D94A64]"
                  />
                  <span>Новинки</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1A1D]">
                  <input
                    type="checkbox"
                    [checked]="productService.filters().onlyBestseller"
                    (change)="toggleFlag('onlyBestseller', $any($event.target).checked)"
                    class="h-4 w-4 rounded border-[#1C1A1D]/30 accent-[#D94A64]"
                  />
                  <span>Бестселлеры</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1A1D]">
                  <input
                    type="checkbox"
                    [checked]="productService.filters().onlySale"
                    (change)="toggleFlag('onlySale', $any($event.target).checked)"
                    class="h-4 w-4 rounded border-[#1C1A1D]/30 accent-[#D94A64]"
                  />
                  <span>Товары со скидкой</span>
                </label>
              </div>

              <!-- Categories -->
              <div class="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Категория</p>
                <div class="space-y-1">
                  <button
                    type="button"
                    (click)="selectCategory(null)"
                    class="block w-full rounded-md px-2.5 py-1.5 text-left text-sm cursor-pointer"
                    [class]="
                      productService.filters().categoryId === null
                        ? 'bg-[#F8EEF0] font-semibold text-[#D94A64]'
                        : 'text-[#4B4449] hover:bg-[#F5F1EC]'
                    "
                  >
                    Все категории
                  </button>
                  @for (cat of productService.categories; track cat.id) {
                    <div>
                      <button
                        type="button"
                        (click)="selectCategory(cat.id)"
                        class="block w-full rounded-md px-2.5 py-1.5 text-left text-sm cursor-pointer"
                        [class]="
                          productService.filters().categoryId === cat.id
                            ? 'bg-[#F8EEF0] font-semibold text-[#D94A64]'
                            : 'text-[#4B4449] hover:bg-[#F5F1EC]'
                        "
                      >
                        {{ cat.name }}
                      </button>
                      @if (productService.filters().categoryId === cat.id) {
                        <div class="mt-1 ml-3 space-y-1 border-l border-[#1C1A1D]/10 pl-2.5">
                          @for (sub of cat.subcategories; track sub.id) {
                            <button
                              type="button"
                              (click)="toggleSubcategory(sub.name)"
                              class="block w-full rounded px-2 py-1 text-left text-xs cursor-pointer"
                              [class]="
                                productService.filters().subcategory === sub.name
                                  ? 'font-semibold text-[#D94A64]'
                                  : 'text-[#665E64] hover:text-[#1C1A1D]'
                              "
                            >
                              {{ sub.name }}
                            </button>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Price -->
              <div class="space-y-2.5 border-t border-[#1C1A1D]/10 pt-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Цена (₽)</p>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="От"
                    aria-label="Цена от"
                    [ngModel]="productService.filters().priceMin"
                    (ngModelChange)="onPriceChange('priceMin', $event)"
                    class="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-1.5 text-sm tabular-nums focus:border-[#D94A64] focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="До"
                    aria-label="Цена до"
                    [ngModel]="productService.filters().priceMax"
                    (ngModelChange)="onPriceChange('priceMax', $event)"
                    class="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-1.5 text-sm tabular-nums focus:border-[#D94A64] focus:outline-none"
                  />
                </div>
              </div>

              <!-- Brands -->
              <div class="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Бренд</p>
                <div class="space-y-2">
                  @for (brand of productService.availableBrands(); track brand) {
                    <label class="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1A1D]">
                      <input
                        type="checkbox"
                        [checked]="productService.filters().brands.includes(brand)"
                        (change)="toggleBrand(brand)"
                        class="h-4 w-4 rounded border-[#1C1A1D]/30 accent-[#D94A64]"
                      />
                      <span>{{ brand }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Purpose -->
              @if (productService.availablePurposes().length > 1) {
                <div class="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
                  <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Назначение</p>
                  <select
                    aria-label="Фильтр по назначению"
                    [ngModel]="productService.filters().purpose || ''"
                    (ngModelChange)="onSelectChange('purpose', $event)"
                    class="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-2 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                  >
                    <option value="">Любое назначение</option>
                    @for (purpose of productService.availablePurposes(); track purpose) {
                      <option [value]="purpose">{{ purpose }}</option>
                    }
                  </select>
                </div>
              }

              <!-- Volume -->
              @if (productService.availableVolumes().length > 1) {
                <div class="space-y-2 border-t border-[#1C1A1D]/10 pt-4">
                  <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Объём / вес</p>
                  <select
                    aria-label="Фильтр по объёму"
                    [ngModel]="productService.filters().volume || ''"
                    (ngModelChange)="onSelectChange('volume', $event)"
                    class="w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3 py-2 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                  >
                    <option value="">Любой объём</option>
                    @for (vol of productService.availableVolumes(); track vol) {
                      <option [value]="vol">{{ vol }}</option>
                    }
                  </select>
                </div>
              }
            </div>
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="min-w-0 flex-1">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#665E64]">
            <span class="tabular-nums">
              Найдено товаров:
              <strong class="text-[#1C1A1D]">{{ productService.filteredProducts().length }}</strong>
            </span>
            @if (productService.filters().brands.length > 0) {
              <span>Бренды: {{ productService.filters().brands.join(', ') }}</span>
            }
          </div>

          @if (productService.filteredProducts().length === 0) {
            <div class="flex flex-col items-center justify-center rounded-2xl border border-[#1C1A1D]/8 bg-white px-6 py-16 text-center">
              <p class="font-display text-2xl font-semibold text-[#1C1A1D]">Ничего не найдено</p>
              <p class="mt-2 max-w-md text-sm text-[#665E64]">
                Попробуйте изменить поисковый запрос или сбросить активные фильтры каталога.
              </p>
              <button
                type="button"
                (click)="resetAll()"
                class="mt-6 rounded-lg bg-[#D94A64] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#BF3851] cursor-pointer"
              >
                Сбросить фильтры и поиск
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              @for (product of visibleProducts(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            @if (hasMore()) {
              <div class="mt-10 flex flex-col items-center gap-2">
                <button
                  type="button"
                  (click)="showMore()"
                  class="rounded-lg border border-[#1C1A1D]/20 bg-white px-8 py-3 text-sm font-semibold text-[#1C1A1D] transition-colors hover:border-[#D94A64] hover:text-[#D94A64] cursor-pointer"
                >
                  Показать ещё ({{ nextBatchCount() }})
                </button>
                <span class="tabular-nums text-xs text-[#8E848A]">
                  Показано {{ visibleProducts().length }} из {{ productService.filteredProducts().length }}
                </span>
              </div>
            }
          }
        </div>
      </div>

      <!-- Mobile Filter Drawer -->
      @if (mobileFiltersOpen()) {
        <div
          class="fixed inset-0 z-50 flex justify-end bg-[#1C1A1D]/45 lg:hidden"
          (click)="mobileFiltersOpen.set(false)"
        >
          <div
            class="flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-5 shadow-2xl"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-4 flex items-center justify-between border-b border-[#1C1A1D]/10 pb-3">
              <span class="font-display text-xl font-semibold text-[#1C1A1D]">Фильтры каталога</span>
              <button
                type="button"
                (click)="mobileFiltersOpen.set(false)"
                aria-label="Закрыть фильтры"
                class="p-1 text-[#665E64]"
              >
                ×
              </button>
            </div>

            <div class="space-y-5">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Категория</p>
                <div class="mt-2 space-y-1">
                  <button
                    type="button"
                    (click)="selectCategory(null)"
                    class="block w-full rounded px-2 py-1.5 text-left text-sm"
                    [class]="productService.filters().categoryId === null ? 'bg-[#F8EEF0] font-semibold text-[#D94A64]' : 'text-[#4B4449]'"
                  >
                    Все категории
                  </button>
                  @for (cat of productService.categories; track cat.id) {
                    <button
                      type="button"
                      (click)="selectCategory(cat.id)"
                      class="block w-full rounded px-2 py-1.5 text-left text-sm"
                      [class]="productService.filters().categoryId === cat.id ? 'bg-[#F8EEF0] font-semibold text-[#D94A64]' : 'text-[#4B4449]'"
                    >
                      {{ cat.name }}
                    </button>
                  }
                </div>
              </div>

              <div class="border-t border-[#1C1A1D]/10 pt-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">Бренд</p>
                <div class="mt-2 space-y-2">
                  @for (brand of productService.availableBrands(); track brand) {
                    <label class="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        [checked]="productService.filters().brands.includes(brand)"
                        (change)="toggleBrand(brand)"
                        class="h-4 w-4 accent-[#D94A64]"
                      />
                      <span>{{ brand }}</span>
                    </label>
                  }
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="mobileFiltersOpen.set(false)"
              class="mt-6 w-full rounded-lg bg-[#1C1A1D] py-3 text-sm font-semibold text-white"
            >
              Показать товары ({{ productService.filteredProducts().length }})
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class CatalogComponent {
  readonly productService = inject(ProductService);

  readonly visibleCount = signal(PAGE_SIZE);
  readonly mobileFiltersOpen = signal(false);

  readonly headingTitle = computed(() => {
    const activeCat = this.productService.activeCategory();
    if (activeCat) return activeCat.name;
    const f = this.productService.filters();
    if (f.onlyNew) return 'Новинки';
    if (f.onlySale) return 'Акции и специальные цены';
    if (f.onlyBestseller) return 'Бестселлеры';
    return 'Каталог косметики';
  });

  readonly activeFilterCount = computed(() => {
    const f = this.productService.filters();
    return (
      (f.categoryId ? 1 : 0) +
      (f.subcategory ? 1 : 0) +
      f.brands.length +
      (f.purpose ? 1 : 0) +
      (f.volume ? 1 : 0) +
      (f.priceMin !== null ? 1 : 0) +
      (f.priceMax !== null ? 1 : 0) +
      (f.inStockOnly ? 1 : 0) +
      (f.onlyNew ? 1 : 0) +
      (f.onlyBestseller ? 1 : 0) +
      (f.onlySale ? 1 : 0)
    );
  });

  readonly visibleProducts = computed(() =>
    this.productService.filteredProducts().slice(0, this.visibleCount()),
  );

  readonly hasMore = computed(
    () => this.visibleCount() < this.productService.filteredProducts().length,
  );

  readonly nextBatchCount = computed(() =>
    Math.min(PAGE_SIZE, this.productService.filteredProducts().length - this.visibleCount()),
  );

  onSearchChange(value: string): void {
    this.visibleCount.set(PAGE_SIZE);
    this.productService.updateFilters({ search: value });
  }

  onSortChange(value: SortOption): void {
    this.productService.sort.set(value);
  }

  selectCategory(categoryId: number | null): void {
    this.visibleCount.set(PAGE_SIZE);
    this.productService.updateFilters({
      categoryId,
      subcategory: null,
      purpose: null,
      volume: null,
    });
  }

  toggleSubcategory(name: string): void {
    this.visibleCount.set(PAGE_SIZE);
    const current = this.productService.filters().subcategory;
    this.productService.updateFilters({
      subcategory: current === name ? null : name,
    });
  }

  toggleBrand(brand: string): void {
    this.visibleCount.set(PAGE_SIZE);
    this.productService.toggleBrandFilter(brand);
  }

  toggleFlag(key: 'inStockOnly' | 'onlyNew' | 'onlyBestseller' | 'onlySale', checked: boolean): void {
    this.visibleCount.set(PAGE_SIZE);
    this.productService.updateFilters({ [key]: checked });
  }

  onPriceChange(key: 'priceMin' | 'priceMax', value: number | string | null): void {
    this.visibleCount.set(PAGE_SIZE);
    const parsed = value === '' || value === null ? null : Number(value);
    this.productService.updateFilters({ [key]: Number.isNaN(parsed) ? null : parsed });
  }

  onSelectChange(key: 'purpose' | 'volume', value: string): void {
    this.visibleCount.set(PAGE_SIZE);
    this.productService.updateFilters({ [key]: value || null });
  }

  showMore(): void {
    this.visibleCount.update((c) => c + PAGE_SIZE);
  }

  resetAll(): void {
    this.visibleCount.set(PAGE_SIZE);
    this.productService.resetFilters();
  }
}
