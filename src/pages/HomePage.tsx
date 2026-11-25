import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, Box, Layers, Sparkles } from 'lucide-react';
import { BRANDS, CATEGORIES, CATEGORY_IMAGES } from '../data/categories';
import { STORE_ADVANTAGES } from '../data/editorial';
import { PRODUCTS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { Beauty3DScene } from '../components/three/Beauty3DScene';
import { ProductCard } from '../components/product/ProductCard';

type ShowcaseTab = 'new' | 'bestsellers' | 'sale';

const PROMO_FINISHES = [
  { id: 'rose', label: 'Rose Quartz', color: '#E8B4BE', accent: '#D4AF37' },
  { id: 'lavender', label: 'Lavender Silk', color: '#CFC2E5', accent: '#B89B72' },
  { id: 'amber', label: 'Warm Amber', color: '#DFB68A', accent: '#C5A059' },
];

export const HomePage: React.FC = () => {
  const { navigate, openCatalogWith } = useStore();
  const [heroSceneMode, setHeroSceneMode] = useState<'ritual' | 'fragrance' | 'makeup'>('ritual');
  const [showcaseTab, setShowcaseTab] = useState<ShowcaseTab>('new');
  const [promoFinishIdx, setPromoFinishIdx] = useState(0);
  const [promoExploded, setPromoExploded] = useState(false);

  const heroTextRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !heroTextRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, heroTextRef);

    return () => ctx.revert();
  }, []);

  const showcaseProducts = useMemo(() => {
    if (showcaseTab === 'new') {
      return PRODUCTS.filter((p) => p.isNew).slice(0, 4);
    }
    if (showcaseTab === 'bestsellers') {
      return PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);
    }
    return PRODUCTS.filter((p) => p.isOnSale && p.oldPrice).slice(0, 4);
  }, [showcaseTab]);

  const activePromoFinish = PROMO_FINISHES[promoFinishIdx];

  return (
    <div className="bg-[#FBF9F6]">
      {/* 1. HERO SECTION */}
      <section className="border-b border-[#1C1A1D]/8 bg-gradient-to-br from-[#FBF9F6] via-[#F9F1F3] to-[#F2EFF7]">
        <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Copy Column */}
            <div
              ref={heroTextRef}
              className="flex flex-col justify-center lg:col-span-6 lg:py-6"
            >
              <p className="hero-stagger text-xs font-semibold uppercase tracking-[0.16em] text-[#D94A64]">
                Beauty Studio · Косметика и уход
              </p>

              <h1
                className="hero-stagger mt-4 font-display font-semibold leading-[1.08] tracking-tight text-[#1C1A1D]"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.85rem)', textWrap: 'balance' }}
              >
                Твоя красота. Твои правила.
              </h1>

              <p className="hero-stagger mt-5 max-w-xl text-base leading-relaxed text-[#4B4449] sm:text-lg">
                Открой коллекцию косметики для ухода, макияжа и маленьких ежедневных ритуалов. Найди средства, которые подходят именно тебе.
              </p>

              <div className="hero-stagger mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => openCatalogWith({})}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#D94A64] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#BF3851] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Смотреть каталог</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openCatalogWith({ onlyNew: true })}
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#1C1A1D]/20 bg-white px-6 text-sm font-semibold text-[#1C1A1D] transition-colors duration-150 hover:border-[#D94A64] hover:text-[#D94A64] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Открыть новинки</span>
                </button>
              </div>
            </div>

            {/* Right Interactive 3D Stage */}
            <div className="relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-[#1C1A1D]/10 bg-[#F8EEF0] lg:col-span-6 lg:min-h-[480px]">
              <Beauty3DScene
                mode="hero"
                heroComposition={heroSceneMode}
                fallbackImage={CATEGORY_IMAGES.skincare}
                fallbackAlt="3D-композиция косметических средств Beauty Studio"
                className="h-full min-h-[380px] w-full flex-1 lg:min-h-[480px]"
              />

              {/* Compact Bottom-Center Composition Dock (no backdrop-blur over WebGL) */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-[#1C1A1D]/10 bg-white/95 p-1 shadow-md">
                {(
                  [
                    { id: 'ritual', label: 'Уход и аромат' },
                    { id: 'fragrance', label: 'Парфюмерия' },
                    { id: 'makeup', label: 'Макияж' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHeroSceneMode(item.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      heroSceneMode === item.id
                        ? 'bg-[#1C1A1D] text-white'
                        : 'text-[#4B4449] hover:bg-[#F8EEF0] hover:text-[#1C1A1D]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Column Studio Strip Below Hero Split */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#1C1A1D]/10 pt-6 md:grid-cols-4">
            <div>
              <p className="tabular-nums font-display text-2xl font-semibold text-[#1C1A1D]">
                {PRODUCTS.length} позиций
              </p>
              <p className="mt-0.5 text-xs text-[#665E64]">
                Демонстрационный каталог с фильтрами
              </p>
            </div>
            <div>
              <p className="tabular-nums font-display text-2xl font-semibold text-[#1C1A1D]">
                {CATEGORIES.length} категорий
              </p>
              <p className="mt-0.5 text-xs text-[#665E64]">
                Лицо, макияж, тело, волосы и ароматы
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-[#1C1A1D]">
                3D-обзор
              </p>
              <p className="mt-0.5 text-xs text-[#665E64]">
                Интерактивные сцены на Three.js
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-[#1C1A1D]">
                Быстрый заказ
              </p>
              <p className="mt-0.5 text-xs text-[#665E64]">
                Корзина, избранное и валидация формы
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
              Разделы магазина
            </p>
            <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
              Категории каталога
            </h2>
          </div>
          <button
            type="button"
            onClick={() => openCatalogWith({})}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D94A64] hover:text-[#BF3851] whitespace-nowrap cursor-pointer"
          >
            <span>Весь каталог</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const count = PRODUCTS.filter((p) => p.categoryId === category.id).length;
            return (
              <div
                key={category.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#1C1A1D]/8 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => openCatalogWith({ categoryId: category.id })}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8F5F0] text-left cursor-pointer"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </button>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openCatalogWith({ categoryId: category.id })}
                        className="font-display text-xl font-semibold text-[#1C1A1D] hover:text-[#D94A64] text-left cursor-pointer"
                      >
                        {category.name}
                      </button>
                      <span className="tabular-nums text-xs text-[#665E64]">
                        {count} поз.
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#665E64]">{category.subtitle}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#1C1A1D]/8 pt-3 text-xs text-[#4B4449]">
                    {category.subcategories.slice(0, 3).map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() =>
                          openCatalogWith({
                            categoryId: category.id,
                            subcategory: sub.name,
                          })
                        }
                        className="hover:text-[#D94A64] hover:underline cursor-pointer"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TABBED SHOWCASE: NEW ARRIVALS / BESTSELLERS / SPECIAL OFFERS */}
      <section className="border-y border-[#1C1A1D]/8 bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
                Подборки каталога
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
                {showcaseTab === 'new'
                  ? 'Новинки коллекции'
                  : showcaseTab === 'bestsellers'
                    ? 'Бестселлеры магазина'
                    : 'Специальные предложения'}
              </h2>
            </div>

            <div className="flex items-center gap-1 self-start rounded-lg bg-[#F5F1EC] p-1 md:self-auto">
              {(
                [
                  { id: 'new', label: 'Новинки' },
                  { id: 'bestsellers', label: 'Бестселлеры' },
                  { id: 'sale', label: 'Акции' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseTab(tab.id)}
                  className={`rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    showcaseTab === tab.id
                      ? 'bg-white text-[#1C1A1D] shadow-sm'
                      : 'text-[#665E64] hover:text-[#1C1A1D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {showcaseProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() =>
                openCatalogWith(
                  showcaseTab === 'new'
                    ? { onlyNew: true }
                    : showcaseTab === 'bestsellers'
                      ? { onlyBestseller: true }
                      : { onlySale: true },
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-6 py-3 text-sm font-semibold text-[#1C1A1D] transition-colors hover:border-[#D94A64] hover:text-[#D94A64] cursor-pointer"
            >
              <span>Показать всю подборку в каталоге</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. 3D PROMO RITUAL + BRANDS + ABOUT */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        {/* 3D Promo Split */}
        <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl border border-[#1C1A1D]/10 bg-[#F2EFF7] lg:grid-cols-12">
          <div className="relative min-h-[340px] lg:col-span-6 lg:min-h-[420px]">
            <Beauty3DScene
              mode="promo"
              primaryColor={activePromoFinish.color}
              accentColor={activePromoFinish.accent}
              labelBrand="Aura Luxe"
              labelTitle={activePromoFinish.label}
              fallbackImage={CATEGORY_IMAGES.skincare}
              fallbackAlt="Интерактивный 3D-обзор сыворотки и крема"
              interactiveControls
              exploded={promoExploded}
              className="h-full min-h-[340px] w-full lg:min-h-[420px]"
            />

            {/* Bottom Center Dock for Promo 3D Controls */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#1C1A1D]/10 bg-white/95 px-3 py-1.5 shadow-md">
              <div className="flex items-center gap-1.5 pr-2 border-r border-[#1C1A1D]/10">
                {PROMO_FINISHES.map((finish, idx) => (
                  <button
                    key={finish.id}
                    type="button"
                    aria-label={`Выбрать оттенок флакона ${finish.label}`}
                    onClick={() => setPromoFinishIdx(idx)}
                    className={`h-5 w-5 rounded-full border transition-transform cursor-pointer ${
                      promoFinishIdx === idx
                        ? 'scale-110 border-[#1C1A1D] ring-2 ring-[#1C1A1D]/20'
                        : 'border-black/15'
                    }`}
                    style={{ backgroundColor: finish.color }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPromoExploded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1A1D] hover:text-[#D94A64] whitespace-nowrap cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{promoExploded ? 'Собрать' : 'Разобрать'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-white p-8 sm:p-10 lg:col-span-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
              <Box className="h-4 w-4" />
              <span>3D-витрина продуктов</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[#1C1A1D]">
              Изучите форму флаконов и текстуры до покупки
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#4B4449] sm:text-base">
              Вращайте объёмную композицию мышью или касанием, меняйте цветовую гамму стекла и открывайте крышку в 3D-режиме. На странице каждого товара достоверные студийные фотографии всегда остаются главным ориентиром.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#1C1A1D]/10 pt-6 sm:grid-cols-2">
              {STORE_ADVANTAGES.slice(0, 2).map((adv) => (
                <div key={adv.title}>
                  <h3 className="text-sm font-semibold text-[#1C1A1D]">{adv.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#665E64]">
                    {adv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brands Block */}
        <div id="brands-section" className="mt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
                Демонстрационные бренды
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#1C1A1D]">
                Бренды Beauty Studio
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate({ page: 'info', section: 'about' })}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C1A1D] hover:text-[#D94A64] cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#D94A64]" />
              <span>Подробнее о магазине</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BRANDS.map((brand) => {
              const count = PRODUCTS.filter((p) => p.brand === brand.name).length;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => openCatalogWith({ brands: [brand.name] })}
                  className="flex flex-col justify-between rounded-xl border border-[#1C1A1D]/10 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D94A64]/40 hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-2xl font-semibold text-[#1C1A1D]">
                        {brand.name}
                      </h3>
                      <span className="tabular-nums text-xs font-medium text-[#665E64]">
                        {count} товаров
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#8E848A]">{brand.origin}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#4B4449]">
                      {brand.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#D94A64]">
                    <span>Смотреть товары бренда</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
