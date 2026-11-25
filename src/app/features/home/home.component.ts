import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { CATEGORY_IMAGES } from '../../core/data/categories.data';
import { STORE_ADVANTAGES } from '../../core/data/editorial.data';
import { ProductService } from '../../core/services/product.service';
import { Beauty3dSceneComponent } from '../../shared/components/beauty-3d-scene/beauty-3d-scene.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

type ShowcaseTab = 'new' | 'bestsellers' | 'sale';

const PROMO_FINISHES = [
  { id: 'rose', label: 'Rose Quartz', color: '#E8B4BE', accent: '#D4AF37' },
  { id: 'lavender', label: 'Lavender Silk', color: '#CFC2E5', accent: '#B89B72' },
  { id: 'amber', label: 'Warm Amber', color: '#DFB68A', accent: '#C5A059' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, Beauty3dSceneComponent, ProductCardComponent],
  template: `
    <div class="bg-[#FBF9F6]">
      <!-- 1. HERO SECTION -->
      <section class="border-b border-[#1C1A1D]/8 bg-gradient-to-br from-[#FBF9F6] via-[#F9F1F3] to-[#F2EFF7]">
        <div class="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <!-- Left Copy Column -->
            <div #heroTextRef class="flex flex-col justify-center lg:col-span-6 lg:py-6">
              <p class="hero-stagger text-xs font-semibold uppercase tracking-[0.16em] text-[#D94A64]">
                Beauty Studio · Косметика и уход
              </p>

              <h1
                class="hero-stagger mt-4 font-display font-semibold leading-[1.08] tracking-tight text-[#1C1A1D]"
                style="font-size: clamp(2.35rem, 4.2vw, 3.85rem); text-wrap: balance;"
              >
                Твоя красота. Твои правила.
              </h1>

              <p class="hero-stagger mt-5 max-w-xl text-base leading-relaxed text-[#4B4449] sm:text-lg">
                Открой коллекцию косметики для ухода, макияжа и маленьких ежедневных ритуалов. Найди средства, которые подходят именно тебе.
              </p>

              <div class="hero-stagger mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  (click)="productService.openCatalogWith({})"
                  class="inline-flex h-12 items-center gap-2 rounded-lg bg-[#D94A64] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#BF3851] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Смотреть каталог</span>
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  type="button"
                  (click)="productService.openCatalogWith({ onlyNew: true })"
                  class="inline-flex h-12 items-center gap-2 rounded-lg border border-[#1C1A1D]/20 bg-white px-6 text-sm font-semibold text-[#1C1A1D] transition-colors duration-150 hover:border-[#D94A64] hover:text-[#D94A64] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Открыть новинки</span>
                </button>
              </div>
            </div>

            <!-- Right Interactive 3D Stage -->
            <div class="relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-[#1C1A1D]/10 bg-[#F8EEF0] lg:col-span-6 lg:min-h-[480px]">
              <div class="h-full min-h-[380px] w-full flex-1 lg:min-h-[480px]">
                <app-beauty-3d-scene
                  mode="hero"
                  [heroComposition]="heroSceneMode()"
                  [fallbackImage]="skincareFallback"
                  fallbackAlt="3D-композиция косметических средств Beauty Studio"
                />
              </div>

              <div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-[#1C1A1D]/10 bg-white/95 p-1 shadow-md">
                @for (comp of heroCompositions; track comp.id) {
                  <button
                    type="button"
                    (click)="heroSceneMode.set(comp.id)"
                    class="rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    [class]="
                      heroSceneMode() === comp.id
                        ? 'bg-[#1C1A1D] text-white'
                        : 'text-[#4B4449] hover:bg-[#F8EEF0] hover:text-[#1C1A1D]'
                    "
                  >
                    {{ comp.label }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- 4-Column Studio Strip -->
          <div class="mt-8 grid grid-cols-2 gap-4 border-t border-[#1C1A1D]/10 pt-6 md:grid-cols-4">
            <div>
              <p class="tabular-nums font-display text-2xl font-semibold text-[#1C1A1D]">
                {{ productService.allProducts.length }} позиций
              </p>
              <p class="mt-0.5 text-xs text-[#665E64]">
                Демонстрационный каталог с фильтрами
              </p>
            </div>
            <div>
              <p class="tabular-nums font-display text-2xl font-semibold text-[#1C1A1D]">
                {{ productService.categories.length }} категорий
              </p>
              <p class="mt-0.5 text-xs text-[#665E64]">
                Лицо, макияж, тело, волосы и ароматы
              </p>
            </div>
            <div>
              <p class="font-display text-2xl font-semibold text-[#1C1A1D]">3D-обзор</p>
              <p class="mt-0.5 text-xs text-[#665E64]">Интерактивные сцены на Three.js</p>
            </div>
            <div>
              <p class="font-display text-2xl font-semibold text-[#1C1A1D]">Быстрый заказ</p>
              <p class="mt-0.5 text-xs text-[#665E64]">Корзина, избранное и валидация формы</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. CATEGORIES SECTION -->
      <section class="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
              Разделы магазина
            </p>
            <h2 class="mt-1.5 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
              Категории каталога
            </h2>
          </div>
          <button
            type="button"
            (click)="productService.openCatalogWith({})"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D94A64] hover:text-[#BF3851] whitespace-nowrap cursor-pointer"
          >
            <span>Весь каталог</span>
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (category of productService.categories; track category.id) {
            <div class="group flex flex-col overflow-hidden rounded-xl border border-[#1C1A1D]/8 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <button
                type="button"
                (click)="productService.openCatalogWith({ categoryId: category.id })"
                class="relative aspect-[4/3] w-full overflow-hidden bg-[#F8F5F0] text-left cursor-pointer"
              >
                <img
                  [src]="category.image"
                  [alt]="category.name"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </button>
              <div class="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div class="flex items-baseline justify-between gap-2">
                    <button
                      type="button"
                      (click)="productService.openCatalogWith({ categoryId: category.id })"
                      class="font-display text-xl font-semibold text-[#1C1A1D] hover:text-[#D94A64] text-left cursor-pointer"
                    >
                      {{ category.name }}
                    </button>
                    <span class="tabular-nums text-xs text-[#665E64]">
                      {{ productService.getCategoryProductCount(category.id) }} поз.
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-[#665E64]">{{ category.subtitle }}</p>
                </div>

                <div class="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#1C1A1D]/8 pt-3 text-xs text-[#4B4449]">
                  @for (sub of category.subcategories.slice(0, 3); track sub.id) {
                    <button
                      type="button"
                      (click)="productService.openCatalogWith({ categoryId: category.id, subcategory: sub.name })"
                      class="hover:text-[#D94A64] hover:underline cursor-pointer"
                    >
                      {{ sub.name }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 3. TABBED SHOWCASE -->
      <section class="border-y border-[#1C1A1D]/8 bg-white">
        <div class="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
                Подборки каталога
              </p>
              <h2 class="mt-1.5 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
                @if (showcaseTab() === 'new') {
                  Новинки коллекции
                } @else if (showcaseTab() === 'bestsellers') {
                  Бестселлеры магазина
                } @else {
                  Специальные предложения
                }
              </h2>
            </div>

            <div class="flex items-center gap-1 self-start rounded-lg bg-[#F5F1EC] p-1 md:self-auto">
              @for (tab of showcaseTabs; track tab.id) {
                <button
                  type="button"
                  (click)="showcaseTab.set(tab.id)"
                  class="rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  [class]="
                    showcaseTab() === tab.id
                      ? 'bg-white text-[#1C1A1D] shadow-sm'
                      : 'text-[#665E64] hover:text-[#1C1A1D]'
                  "
                >
                  {{ tab.label }}
                </button>
              }
            </div>
          </div>

          <div class="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            @for (product of showcaseProducts(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>

          <div class="mt-8 flex justify-center">
            <button
              type="button"
              (click)="openShowcaseCollection()"
              class="inline-flex items-center gap-2 rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-6 py-3 text-sm font-semibold text-[#1C1A1D] transition-colors hover:border-[#D94A64] hover:text-[#D94A64] cursor-pointer"
            >
              <span>Показать всю подборку в каталоге</span>
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 4. 3D PROMO RITUAL + BRANDS -->
      <section class="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div class="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl border border-[#1C1A1D]/10 bg-[#F2EFF7] lg:grid-cols-12">
          <div class="relative min-h-[340px] lg:col-span-6 lg:min-h-[420px]">
            <div class="h-full min-h-[340px] w-full lg:min-h-[420px]">
              <app-beauty-3d-scene
                mode="promo"
                [primaryColor]="activePromoFinish().color"
                [accentColor]="activePromoFinish().accent"
                labelBrand="Aura Luxe"
                [labelTitle]="activePromoFinish().label"
                [fallbackImage]="skincareFallback"
                fallbackAlt="Интерактивный 3D-обзор сыворотки и крема"
                [interactiveControls]="true"
                [exploded]="promoExploded()"
              />
            </div>

            <div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#1C1A1D]/10 bg-white/95 px-3 py-1.5 shadow-md">
              <div class="flex items-center gap-1.5 border-r border-[#1C1A1D]/10 pr-2">
                @for (finish of promoFinishes; track finish.id; let idx = $index) {
                  <button
                    type="button"
                    [attr.aria-label]="'Выбрать оттенок флакона ' + finish.label"
                    (click)="promoFinishIdx.set(idx)"
                    class="h-5 w-5 rounded-full border transition-transform cursor-pointer"
                    [class]="
                      promoFinishIdx() === idx
                        ? 'scale-110 border-[#1C1A1D] ring-2 ring-[#1C1A1D]/20'
                        : 'border-black/15'
                    "
                    [style.backgroundColor]="finish.color"
                  ></button>
                }
              </div>
              <button
                type="button"
                (click)="promoExploded.set(!promoExploded())"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1A1D] hover:text-[#D94A64] whitespace-nowrap cursor-pointer"
              >
                <span>{{ promoExploded() ? 'Собрать' : 'Разобрать' }}</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col justify-center bg-white p-8 sm:p-10 lg:col-span-6">
            <div class="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
              3D-витрина продуктов
            </div>
            <h2 class="mt-3 font-display text-3xl font-semibold text-[#1C1A1D]">
              Изучите форму флаконов и текстуры до покупки
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-[#4B4449] sm:text-base">
              Вращайте объёмную композицию мышью или касанием, меняйте цветовую гамму стекла и открывайте крышку в 3D-режиме. На странице каждого товара достоверные студийные фотографии всегда остаются главным ориентиром.
            </p>
            <div class="mt-6 grid grid-cols-1 gap-4 border-t border-[#1C1A1D]/10 pt-6 sm:grid-cols-2">
              @for (adv of advantagesPreview; track adv.title) {
                <div>
                  <h3 class="text-sm font-semibold text-[#1C1A1D]">{{ adv.title }}</h3>
                  <p class="mt-1 text-xs leading-relaxed text-[#665E64]">
                    {{ adv.description }}
                  </p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Brands Block -->
        <div id="brands-section" class="mt-16">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
                Демонстрационные бренды
              </p>
              <h2 class="mt-1.5 font-display text-3xl font-semibold text-[#1C1A1D]">
                Бренды Beauty Studio
              </h2>
            </div>
            <a
              routerLink="/about"
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C1A1D] hover:text-[#D94A64]"
            >
              <span>Подробнее о магазине</span>
            </a>
          </div>

          <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (brand of productService.brands; track brand.id) {
              <button
                type="button"
                (click)="productService.openCatalogWith({ brands: [brand.name] })"
                class="flex flex-col justify-between rounded-xl border border-[#1C1A1D]/10 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D94A64]/40 hover:shadow-md cursor-pointer"
              >
                <div>
                  <div class="flex items-baseline justify-between gap-2">
                    <h3 class="font-display text-2xl font-semibold text-[#1C1A1D]">
                      {{ brand.name }}
                    </h3>
                    <span class="tabular-nums text-xs font-medium text-[#665E64]">
                      {{ productService.getBrandProductCount(brand.name) }} товаров
                    </span>
                  </div>
                  <p class="mt-1 text-xs text-[#8E848A]">{{ brand.origin }}</p>
                  <p class="mt-3 text-sm leading-relaxed text-[#4B4449]">
                    {{ brand.description }}
                  </p>
                </div>
                <div class="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#D94A64]">
                  <span>Смотреть товары бренда</span>
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            }
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly productService = inject(ProductService);

  @ViewChild('heroTextRef') heroTextRef?: ElementRef<HTMLDivElement>;

  readonly skincareFallback = CATEGORY_IMAGES.skincare;
  readonly advantagesPreview = STORE_ADVANTAGES.slice(0, 2);
  readonly promoFinishes = PROMO_FINISHES;

  readonly heroCompositions: { id: 'ritual' | 'fragrance' | 'makeup'; label: string }[] = [
    { id: 'ritual', label: 'Уход и аромат' },
    { id: 'fragrance', label: 'Парфюмерия' },
    { id: 'makeup', label: 'Макияж' },
  ];

  readonly showcaseTabs: { id: ShowcaseTab; label: string }[] = [
    { id: 'new', label: 'Новинки' },
    { id: 'bestsellers', label: 'Бестселлеры' },
    { id: 'sale', label: 'Акции' },
  ];

  readonly heroSceneMode = signal<'ritual' | 'fragrance' | 'makeup'>('ritual');
  readonly showcaseTab = signal<ShowcaseTab>('new');
  readonly promoFinishIdx = signal(0);
  readonly promoExploded = signal(false);

  readonly activePromoFinish = computed(() => PROMO_FINISHES[this.promoFinishIdx()]);

  readonly showcaseProducts = computed(() => {
    const tab = this.showcaseTab();
    if (tab === 'new') return this.productService.allProducts.filter((p) => p.isNew).slice(0, 4);
    if (tab === 'bestsellers') {
      return this.productService.allProducts.filter((p) => p.isBestseller).slice(0, 4);
    }
    return this.productService.allProducts.filter((p) => p.isOnSale && p.oldPrice).slice(0, 4);
  });

  private gsapCtx: gsap.Context | null = null;

  ngAfterViewInit(): void {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !this.heroTextRef?.nativeElement) return;

    this.gsapCtx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, this.heroTextRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }

  openShowcaseCollection(): void {
    const tab = this.showcaseTab();
    if (tab === 'new') this.productService.openCatalogWith({ onlyNew: true });
    else if (tab === 'bestsellers') this.productService.openCatalogWith({ onlyBestseller: true });
    else this.productService.openCatalogWith({ onlySale: true });
  }
}
