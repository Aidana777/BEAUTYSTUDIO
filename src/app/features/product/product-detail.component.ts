import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { formatPrice, getDiscountPercent } from '../../core/utils/format.util';
import { Beauty3dSceneComponent } from '../../shared/components/beauty-3d-scene/beauty-3d-scene.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

type DetailTab = 'description' | 'usage' | 'ingredients' | 'features';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, Beauty3dSceneComponent, ProductCardComponent],
  template: `
    @if (!product(); as missing) {
      <div class="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 class="font-display text-3xl font-semibold text-[#1C1A1D]">Товар не найден</h1>
        <p class="mt-2 text-sm text-[#665E64]">
          Возможно, позиция была удалена или ссылка устарела.
        </p>
        <button
          type="button"
          (click)="productService.openCatalogWith({})"
          class="mt-6 rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white cursor-pointer"
        >
          Вернуться в каталог
        </button>
      </div>
    } @else {
      @let p = product()!;
      <div class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <!-- Breadcrumbs -->
        <nav aria-label="Хлебные крошки" class="flex flex-wrap items-center gap-1.5 text-xs text-[#665E64]">
          <a routerLink="/" class="hover:text-[#D94A64]">Главная</a>
          <span>/</span>
          <button
            type="button"
            (click)="productService.openCatalogWith({})"
            class="hover:text-[#D94A64] cursor-pointer"
          >
            Каталог
          </button>
          @if (category(); as cat) {
            <span>/</span>
            <button
              type="button"
              (click)="productService.openCatalogWith({ categoryId: cat.id })"
              class="hover:text-[#D94A64] cursor-pointer"
            >
              {{ cat.name }}
            </button>
          }
          <span>/</span>
          <span class="font-semibold text-[#1C1A1D]">{{ p.name }}</span>
        </nav>

        <!-- Main Grid -->
        <div class="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <!-- Left Sticky Media -->
          <div class="lg:col-span-6">
            <div class="lg:sticky lg:top-24">
              @if (p.has3dModel) {
                <div class="mb-3 inline-flex rounded-lg bg-[#F5F1EC] p-1">
                  <button
                    type="button"
                    (click)="mediaMode.set('photo')"
                    class="rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                    [class]="mediaMode() === 'photo' ? 'bg-white text-[#1C1A1D] shadow-sm' : 'text-[#665E64] hover:text-[#1C1A1D]'"
                  >
                    Фотографии
                  </button>
                  <button
                    type="button"
                    (click)="mediaMode.set('3d')"
                    class="rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                    [class]="mediaMode() === '3d' ? 'bg-white text-[#1C1A1D] shadow-sm' : 'text-[#665E64] hover:text-[#1C1A1D]'"
                  >
                    3D-модель (вращение)
                  </button>
                </div>
              }

              <div class="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#1C1A1D]/10 bg-[#F8F5F0]">
                @if (mediaMode() === '3d' && p.has3dModel) {
                  <app-beauty-3d-scene
                    mode="product"
                    [silhouette]="p.modelSilhouette || 'serum'"
                    [primaryColor]="active3dColor()"
                    [accentColor]="p.accentColorHex || '#D4AF37'"
                    [labelBrand]="p.brand"
                    [labelTitle]="p.name"
                    [fallbackImage]="p.image"
                    [fallbackAlt]="p.name"
                    [interactiveControls]="true"
                    [exploded]="exploded3d()"
                  />
                  <div class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-[#1C1A1D]/10 bg-white/95 px-3.5 py-1.5 text-xs shadow-sm">
                    <span class="text-[#665E64] whitespace-nowrap">Потяните для вращения</span>
                    <button
                      type="button"
                      (click)="exploded3d.set(!exploded3d())"
                      class="font-semibold text-[#D94A64] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      {{ exploded3d() ? 'Закрыть' : 'Открыть' }}
                    </button>
                  </div>
                } @else {
                  <img
                    [src]="p.gallery[activeImageIdx()] || p.image"
                    [alt]="p.name"
                    referrerPolicy="no-referrer"
                    class="h-full w-full object-cover"
                  />
                }
              </div>

              @if (mediaMode() === 'photo' && p.gallery.length > 1) {
                <div class="mt-3 flex gap-3">
                  @for (imgSrc of p.gallery; track imgSrc; let idx = $index) {
                    <button
                      type="button"
                      (click)="activeImageIdx.set(idx)"
                      class="h-20 w-24 overflow-hidden rounded-lg border transition-all cursor-pointer"
                      [class]="
                        activeImageIdx() === idx
                          ? 'border-[#D94A64] ring-2 ring-[#D94A64]/20'
                          : 'border-[#1C1A1D]/10 opacity-75 hover:opacity-100'
                      "
                    >
                      <img
                        [src]="imgSrc"
                        [alt]="p.name + ' ракурс ' + (idx + 1)"
                        referrerPolicy="no-referrer"
                        class="h-full w-full object-cover"
                      />
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Right Purchase Module -->
          <div class="lg:col-span-6">
            <div class="rounded-2xl border border-[#1C1A1D]/8 bg-white p-6 sm:p-8">
              <div class="flex flex-wrap items-center gap-2 text-xs text-[#665E64]">
                <button
                  type="button"
                  (click)="productService.openCatalogWith({ brands: [p.brand] })"
                  class="font-semibold text-[#D94A64] hover:underline cursor-pointer"
                >
                  {{ p.brand }}
                </button>
                <span aria-hidden="true">·</span>
                <span>{{ p.subcategory }}</span>
                <span aria-hidden="true">·</span>
                <span>Тестовая позиция каталога</span>
              </div>

              <h1 class="mt-2 font-display text-3xl font-semibold leading-tight text-[#1C1A1D] sm:text-4xl">
                {{ p.name }}
              </h1>

              <p class="mt-2 text-sm text-[#665E64]">
                {{ p.purpose }} · Объём / вес:
                <strong class="text-[#1C1A1D]">{{ p.volume }}</strong>
              </p>

              <div class="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-y border-[#1C1A1D]/10 py-5">
                <div class="flex items-baseline gap-3">
                  <span class="tabular-nums text-3xl font-bold text-[#1C1A1D]">
                    {{ formatPrice(p.price) }}
                  </span>
                  @if (p.oldPrice) {
                    <span class="tabular-nums text-lg text-[#8E848A] line-through">
                      {{ formatPrice(p.oldPrice) }}
                    </span>
                    @if (discount()) {
                      <span class="rounded-sm bg-[#D94A64] px-2 py-0.5 text-xs font-semibold text-white">
                        −{{ discount() }}%
                      </span>
                    }
                  }
                </div>

                <span
                  class="inline-flex items-center gap-1.5 text-xs font-semibold"
                  [class]="p.inStock ? 'text-[#2E6B47]' : 'text-[#8E848A]'"
                >
                  {{ p.inStock ? 'В наличии' : 'Нет в наличии' }}
                </span>
              </div>

              @if (p.variants && p.variants.length > 0) {
                <div class="mt-6">
                  <p class="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
                    Вариант / оттенок:
                    <span class="normal-case text-[#1C1A1D]">
                      {{ selectedVariant()?.name }}
                    </span>
                  </p>
                  <div class="mt-3 flex flex-wrap gap-2.5">
                    @for (variant of p.variants; track variant.id; let idx = $index) {
                      <button
                        type="button"
                        (click)="selectedVariantIdx.set(idx)"
                        class="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
                        [class]="
                          selectedVariantIdx() === idx
                            ? 'border-[#1C1A1D] bg-[#F8EEF0] text-[#1C1A1D]'
                            : 'border-[#1C1A1D]/15 bg-white text-[#4B4449] hover:border-[#1C1A1D]/40'
                        "
                      >
                        @if (variant.hex) {
                          <span
                            class="inline-block h-4 w-4 rounded-full border border-black/15"
                            [style.backgroundColor]="variant.hex"
                          ></span>
                        }
                        <span>{{ variant.name }}</span>
                      </button>
                    }
                  </div>
                </div>
              }

              <div class="mt-6 flex flex-wrap items-center gap-3">
                <div class="flex h-12 items-center rounded-lg border border-[#1C1A1D]/20 bg-[#FBF9F6]">
                  <button
                    type="button"
                    (click)="decreaseQty()"
                    aria-label="Уменьшить количество"
                    class="flex h-full w-10 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                  >
                    −
                  </button>
                  <span class="tabular-nums w-10 text-center text-sm font-semibold">
                    {{ quantity() }}
                  </span>
                  <button
                    type="button"
                    (click)="increaseQty()"
                    aria-label="Увеличить количество"
                    class="flex h-full w-10 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  [disabled]="!p.inStock"
                  (click)="addToCart()"
                  class="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-colors whitespace-nowrap"
                  [class]="
                    p.inStock
                      ? 'bg-[#D94A64] text-white hover:bg-[#BF3851] cursor-pointer'
                      : 'cursor-not-allowed bg-[#EAE5E1] text-[#8E848A]'
                  "
                >
                  <span>{{ p.inStock ? 'Добавить в корзину' : 'Товар ожидается' }}</span>
                </button>

                <button
                  type="button"
                  (click)="wishlistService.toggle(p.id)"
                  [attr.aria-label]="isWishlisted() ? 'Убрать из избранного' : 'В избранное'"
                  class="flex h-12 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors cursor-pointer"
                  [class]="
                    isWishlisted()
                      ? 'border-[#D94A64] bg-[#F8EEF0] text-[#D94A64]'
                      : 'border-[#1C1A1D]/20 bg-white text-[#1C1A1D] hover:border-[#D94A64]'
                  "
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    [attr.fill]="isWishlisted() ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    stroke-width="1.85"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <span class="hidden sm:inline">
                    {{ isWishlisted() ? 'В избранном' : 'В избранное' }}
                  </span>
                </button>
              </div>

              <!-- Tabs -->
              <div class="mt-8 border-t border-[#1C1A1D]/10 pt-6">
                <div class="flex flex-wrap gap-1 rounded-lg bg-[#F5F1EC] p-1">
                  @for (tab of detailTabs; track tab.id) {
                    <button
                      type="button"
                      (click)="activeTab.set(tab.id)"
                      class="rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                      [class]="
                        activeTab() === tab.id
                          ? 'bg-white text-[#1C1A1D] shadow-sm'
                          : 'text-[#665E64] hover:text-[#1C1A1D]'
                      "
                    >
                      {{ tab.label }}
                    </button>
                  }
                </div>

                <div class="mt-4 text-sm leading-relaxed text-[#4B4449]">
                  @if (activeTab() === 'description') {
                    <p>{{ p.description }}</p>
                  } @else if (activeTab() === 'usage') {
                    <p>{{ p.usage }}</p>
                  } @else if (activeTab() === 'ingredients') {
                    <p class="font-mono text-xs leading-relaxed text-[#4B4449]">
                      {{ p.ingredients.join(', ') }}
                    </p>
                  } @else {
                    <ul class="space-y-2">
                      @for (f of p.features; track f) {
                        <li class="flex items-start gap-2">
                          <span class="text-[#D94A64]">✓</span>
                          <span>{{ f }}</span>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        @if (similarProducts().length > 0) {
          <section class="mt-16 border-t border-[#1C1A1D]/10 pt-12">
            <h2 class="font-display text-2xl font-semibold text-[#1C1A1D] sm:text-3xl">
              Похожие товары
            </h2>
            <div class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              @for (item of similarProducts(); track item.id) {
                <app-product-card [product]="item" />
              }
            </div>
          </section>
        }

        @if (pairedProducts().length > 0) {
          <section class="mt-12 border-t border-[#1C1A1D]/10 pt-12">
            <h2 class="font-display text-2xl font-semibold text-[#1C1A1D] sm:text-3xl">
              С этим товаром покупают
            </h2>
            <div class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              @for (item of pairedProducts(); track item.id) {
                <app-product-card [product]="item" />
              }
            </div>
          </section>
        }

        @if (recentProducts().length > 0) {
          <section class="mt-12 border-t border-[#1C1A1D]/10 pt-12">
            <h2 class="font-display text-2xl font-semibold text-[#1C1A1D] sm:text-3xl">
              Вы недавно смотрели
            </h2>
            <div class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              @for (item of recentProducts(); track item.id) {
                <app-product-card [product]="item" />
              }
            </div>
          </section>
        }
      </div>
    }
  `,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  readonly formatPrice = formatPrice;

  readonly productId = signal<number>(0);
  readonly selectedVariantIdx = signal(0);
  readonly activeImageIdx = signal(0);
  readonly mediaMode = signal<'photo' | '3d'>('photo');
  readonly exploded3d = signal(false);
  readonly quantity = signal(1);
  readonly activeTab = signal<DetailTab>('description');

  readonly detailTabs: { id: DetailTab; label: string }[] = [
    { id: 'description', label: 'Описание' },
    { id: 'usage', label: 'Применение' },
    { id: 'ingredients', label: 'Состав (INCI)' },
    { id: 'features', label: 'Особенности' },
  ];

  readonly product = computed(() => this.productService.getProductById(this.productId()));

  readonly category = computed(() => {
    const p = this.product();
    return p ? this.productService.categories.find((c) => c.id === p.categoryId) : undefined;
  });

  readonly selectedVariant = computed(() => {
    const p = this.product();
    return p?.variants?.[this.selectedVariantIdx()];
  });

  readonly discount = computed(() => {
    const p = this.product();
    return p ? getDiscountPercent(p.price, p.oldPrice) : null;
  });

  readonly active3dColor = computed(() => {
    const p = this.product();
    return this.selectedVariant()?.hex || p?.modelColorHex || '#E8B4BE';
  });

  readonly isWishlisted = computed(() => {
    const p = this.product();
    return p ? this.wishlistService.isWishlisted(p.id) : false;
  });

  readonly similarProducts = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.productService.allProducts
      .filter((item) => item.id !== p.id && item.categoryId === p.categoryId)
      .slice(0, 4);
  });

  readonly pairedProducts = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.productService.allProducts
      .filter((item) => item.id !== p.id && item.brand === p.brand && item.categoryId !== p.categoryId)
      .concat(this.productService.allProducts.filter((item) => item.id !== p.id && item.isBestseller))
      .slice(0, 4);
  });

  readonly recentProducts = computed(() => {
    const id = this.productId();
    return this.productService
      .recentlyViewedIds()
      .filter((rid) => rid !== id)
      .map((rid) => this.productService.getProductById(rid))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 4);
  });

  private routeSub: Subscription | null = null;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.productId.set(id);
      this.selectedVariantIdx.set(0);
      this.activeImageIdx.set(0);
      this.mediaMode.set('photo');
      this.exploded3d.set(false);
      this.quantity.set(1);
      this.activeTab.set('description');
      if (this.productService.getProductById(id)) {
        this.productService.recordProductView(id);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  decreaseQty(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  increaseQty(): void {
    this.quantity.update((q) => q + 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addToCart(p, this.selectedVariant(), this.quantity());
  }
}
