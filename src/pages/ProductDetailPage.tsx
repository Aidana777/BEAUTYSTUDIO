import React, { useEffect, useMemo, useState } from 'react';
import { Box, Check, ChevronRight, Heart, Image as ImageIcon, Layers, Minus, Plus, ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { formatPrice, getDiscountPercent } from '../utils/format';
import { Beauty3DScene } from '../components/three/Beauty3DScene';
import { ProductCard } from '../components/product/ProductCard';

interface ProductDetailPageProps {
  productId: number;
}

type DetailTab = 'description' | 'usage' | 'ingredients' | 'features';

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const {
    navigate,
    openCatalogWith,
    addToCart,
    toggleWishlist,
    isWishlisted,
    recentlyViewedIds,
    recordProductView,
  } = useStore();

  const product = useMemo(
    () => PRODUCTS.find((p) => p.id === productId),
    [productId],
  );

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [mediaMode, setMediaMode] = useState<'photo' | '3d'>('photo');
  const [exploded3d, setExploded3d] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>('description');

  useEffect(() => {
    if (product) {
      recordProductView(product.id);
      setSelectedVariantIdx(0);
      setActiveImageIdx(0);
      setMediaMode('photo');
      setExploded3d(false);
      setQuantity(1);
      setActiveTab('description');
    }
  }, [product, recordProductView]);

  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === product?.categoryId),
    [product],
  );

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(
      (p) => p.id !== product.id && p.categoryId === product.categoryId,
    ).slice(0, 4);
  }, [product]);

  const pairedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(
      (p) => p.id !== product.id && p.brand === product.brand && p.categoryId !== product.categoryId,
    )
      .concat(PRODUCTS.filter((p) => p.id !== product.id && p.isBestseller))
      .slice(0, 4);
  }, [product]);

  const recentProducts = useMemo(() => {
    return recentlyViewedIds
      .filter((id) => id !== productId)
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 4);
  }, [recentlyViewedIds, productId]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold text-[#1C1A1D]">
          Товар не найден
        </h1>
        <p className="mt-2 text-sm text-[#665E64]">
          Возможно, позиция была удалена или ссылка устарела.
        </p>
        <button
          type="button"
          onClick={() => openCatalogWith({})}
          className="mt-6 rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white cursor-pointer"
        >
          Вернуться в каталог
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const selectedVariant = product.variants?.[selectedVariantIdx];
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const active3dColor = selectedVariant?.hex || product.modelColorHex || '#E8B4BE';

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
          onClick={() => openCatalogWith({})}
          className="hover:text-[#D94A64] cursor-pointer"
        >
          Каталог
        </button>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              type="button"
              onClick={() => openCatalogWith({ categoryId: category.id })}
              className="hover:text-[#D94A64] cursor-pointer"
            >
              {category.name}
            </button>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-[#1C1A1D]">{product.name}</span>
      </nav>

      {/* Main Product Grid */}
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Sticky Gallery / 3D Viewer */}
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            {product.has3dModel && (
              <div className="mb-3 inline-flex rounded-lg bg-[#F5F1EC] p-1">
                <button
                  type="button"
                  onClick={() => setMediaMode('photo')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                    mediaMode === 'photo'
                      ? 'bg-white text-[#1C1A1D] shadow-sm'
                      : 'text-[#665E64] hover:text-[#1C1A1D]'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Фотографии</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode('3d')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                    mediaMode === '3d'
                      ? 'bg-white text-[#1C1A1D] shadow-sm'
                      : 'text-[#665E64] hover:text-[#1C1A1D]'
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>3D-модель (вращение)</span>
                </button>
              </div>
            )}

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#1C1A1D]/10 bg-[#F8F5F0]">
              {mediaMode === '3d' && product.has3dModel ? (
                <>
                  <Beauty3DScene
                    mode="product"
                    silhouette={product.modelSilhouette}
                    primaryColor={active3dColor}
                    accentColor={product.accentColorHex || '#D4AF37'}
                    labelBrand={product.brand}
                    labelTitle={product.name}
                    fallbackImage={product.image}
                    fallbackAlt={product.name}
                    interactiveControls
                    exploded={exploded3d}
                    className="h-full w-full"
                  />
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-[#1C1A1D]/10 bg-white/95 px-3.5 py-1.5 text-xs shadow-sm">
                    <span className="text-[#665E64] whitespace-nowrap">
                      Потяните для вращения
                    </span>
                    <button
                      type="button"
                      onClick={() => setExploded3d((prev) => !prev)}
                      className="inline-flex items-center gap-1 font-semibold text-[#D94A64] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>{exploded3d ? 'Закрыть' : 'Открыть'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <img
                  src={product.gallery[activeImageIdx] || product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Thumbnails */}
            {mediaMode === 'photo' && product.gallery.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.gallery.map((imgSrc, idx) => (
                  <button
                    key={`${imgSrc}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-20 w-24 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-[#D94A64] ring-2 ring-[#D94A64]/20'
                        : 'border-[#1C1A1D]/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`${product.name} — ракурс ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Contiguous Purchase Module */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-[#1C1A1D]/8 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#665E64]">
              <button
                type="button"
                onClick={() => openCatalogWith({ brands: [product.brand] })}
                className="font-semibold text-[#D94A64] hover:underline cursor-pointer"
              >
                {product.brand}
              </button>
              <span aria-hidden="true">·</span>
              <span>{product.subcategory}</span>
              <span aria-hidden="true">·</span>
              <span>Тестовая позиция каталога</span>
            </div>

            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-[#1C1A1D] sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-[#665E64]">
              {product.purpose} · Объём / вес: <strong className="text-[#1C1A1D]">{product.volume}</strong>
            </p>

            {/* Price & Availability */}
            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-y border-[#1C1A1D]/10 py-5">
              <div className="flex items-baseline gap-3">
                <span className="tabular-nums text-3xl font-bold text-[#1C1A1D]">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="tabular-nums text-lg text-[#8E848A] line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                    {discount && (
                      <span className="rounded-sm bg-[#D94A64] px-2 py-0.5 text-xs font-semibold text-white">
                        −{discount}%
                      </span>
                    )}
                  </>
                )}
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  product.inStock ? 'text-[#2E6B47]' : 'text-[#8E848A]'
                }`}
              >
                {product.inStock && <Check className="h-3.5 w-3.5" />}
                <span>{product.inStock ? 'В наличии' : 'Нет в наличии'}</span>
              </span>
            </div>

            {/* Variants / Shades */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#665E64]">
                  Вариант / оттенок:{' '}
                  <span className="normal-case text-[#1C1A1D]">
                    {selectedVariant?.name}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {product.variants.map((variant, idx) => {
                    const selected = idx === selectedVariantIdx;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#1C1A1D] bg-[#F8EEF0] text-[#1C1A1D]'
                            : 'border-[#1C1A1D]/15 bg-white text-[#4B4449] hover:border-[#1C1A1D]/40'
                        }`}
                      >
                        {variant.hex && (
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-black/15"
                            style={{ backgroundColor: variant.hex }}
                          />
                        )}
                        <span>{variant.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-lg border border-[#1C1A1D]/20 bg-[#FBF9F6]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Уменьшить количество"
                  className="flex h-full w-10 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="tabular-nums w-10 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Увеличить количество"
                  className="flex h-full w-10 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => addToCart(product, selectedVariant, quantity)}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-colors whitespace-nowrap ${
                  product.inStock
                    ? 'bg-[#D94A64] text-white hover:bg-[#BF3851] cursor-pointer'
                    : 'cursor-not-allowed bg-[#EAE5E1] text-[#8E848A]'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{product.inStock ? 'Добавить в корзину' : 'Товар ожидается'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'Убрать из избранного' : 'В избранное'}
                className={`flex h-12 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors cursor-pointer ${
                  wishlisted
                    ? 'border-[#D94A64] bg-[#F8EEF0] text-[#D94A64]'
                    : 'border-[#1C1A1D]/20 bg-white text-[#1C1A1D] hover:border-[#D94A64]'
                }`}
              >
                <Heart
                  className="h-4 w-4"
                  fill={wishlisted ? 'currentColor' : 'none'}
                />
                <span className="hidden sm:inline">
                  {wishlisted ? 'В избранном' : 'В избранное'}
                </span>
              </button>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-8 border-t border-[#1C1A1D]/10 pt-6">
              <div className="flex flex-wrap gap-1 rounded-lg bg-[#F5F1EC] p-1">
                {(
                  [
                    { id: 'description', label: 'Описание' },
                    { id: 'usage', label: 'Применение' },
                    { id: 'ingredients', label: 'Состав (INCI)' },
                    { id: 'features', label: 'Особенности' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-white text-[#1C1A1D] shadow-sm'
                        : 'text-[#665E64] hover:text-[#1C1A1D]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-sm leading-relaxed text-[#4B4449]">
                {activeTab === 'description' && <p>{product.description}</p>}
                {activeTab === 'usage' && <p>{product.usage}</p>}
                {activeTab === 'ingredients' && (
                  <p className="font-mono text-xs leading-relaxed text-[#4B4449]">
                    {product.ingredients.join(', ')}
                  </p>
                )}
                {activeTab === 'features' && (
                  <ul className="space-y-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#D94A64]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-16 border-t border-[#1C1A1D]/10 pt-12">
          <h2 className="font-display text-2xl font-semibold text-[#1C1A1D] sm:text-3xl">
            Похожие товары
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Paired Products */}
      {pairedProducts.length > 0 && (
        <section className="mt-12 border-t border-[#1C1A1D]/10 pt-12">
          <h2 className="font-display text-2xl font-semibold text-[#1C1A1D] sm:text-3xl">
            С этим товаром покупают
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {pairedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentProducts.length > 0 && (
        <section className="mt-12 border-t border-[#1C1A1D]/10 pt-12">
          <h2 className="font-display text-2xl font-semibold text-[#1C1A1D] sm:text-3xl">
            Вы недавно смотрели
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {recentProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
