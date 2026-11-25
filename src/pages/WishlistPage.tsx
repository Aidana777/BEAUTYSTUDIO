import React, { useMemo } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, openCatalogWith, navigate } = useStore();

  const savedProducts = useMemo(
    () => PRODUCTS.filter((p) => wishlistIds.includes(p.id)),
    [wishlistIds],
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#1C1A1D]/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
            Личная подборка
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
            Избранное
          </h1>
          <p className="mt-1 text-sm text-[#665E64]">
            Сохранённые товары хранятся в памяти вашего браузера и доступны в любой момент.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCatalogWith({})}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D94A64] hover:underline cursor-pointer"
        >
          <span>Перейти в каталог</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {savedProducts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-[#1C1A1D]/8 bg-white px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EEF0] text-[#D94A64]">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-[#1C1A1D]">
            Список избранного пуст
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#665E64]">
            Отмечайте понравившиеся средства сердечком в каталоге или на странице товара, чтобы быстро вернуться к ним позже.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openCatalogWith({})}
              className="rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white hover:bg-[#BF3851] cursor-pointer"
            >
              Открыть каталог
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="rounded-lg border border-[#1C1A1D]/15 px-6 py-3 text-sm font-semibold text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
            >
              На главную
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
