import React, { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/shop';
import { useStore } from '../../context/StoreContext';
import { formatPrice, getDiscountPercent } from '../../utils/format';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, addToCart, toggleWishlist, isWishlisted } = useStore();
  const [imgError, setImgError] = useState(false);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  const wishlisted = isWishlisted(product.id);
  const discount = getDiscountPercent(product.price, product.oldPrice);

  let statusTag: string | null = null;
  if (discount) {
    statusTag = `−${discount}%`;
  } else if (product.isNew) {
    statusTag = 'Новинка';
  } else if (product.isBestseller) {
    statusTag = 'Хит';
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 3.5, ry: x * 3.5 });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  return (
    <article
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#1C1A1D]/8 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div>
        {/* Image Frame (4:3 uniform aspect ratio) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8F5F0]">
          <button
            type="button"
            onClick={() => navigate({ page: 'product', productId: product.id })}
            aria-label={`Открыть ${product.name}`}
            className="block h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D94A64]"
          >
            {!imgError ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F8EEF0] to-[#F2EFF7] p-4 text-center">
                <span className="font-display text-lg font-semibold text-[#1C1A1D]">
                  {product.brand}
                </span>
                <span className="mt-1 text-xs text-[#665E64]">{product.name}</span>
              </div>
            )}
          </button>

          {/* At most 1 subtle rectangular label */}
          {statusTag && (
            <span
              className={`pointer-events-none absolute left-3 top-3 rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                discount
                  ? 'bg-[#D94A64] text-white'
                  : 'bg-[#1C1A1D]/88 text-white'
              }`}
            >
              {statusTag}
            </span>
          )}

          {/* Wishlist Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label={wishlisted ? 'Удалить из избранного' : 'Добавить в избранное'}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-150 cursor-pointer ${
              wishlisted
                ? 'border-[#D94A64]/30 bg-white text-[#D94A64]'
                : 'border-[#1C1A1D]/10 bg-white/95 text-[#4B4449] hover:text-[#D94A64]'
            }`}
          >
            <Heart
              className="h-4 w-4"
              fill={wishlisted ? 'currentColor' : 'none'}
              strokeWidth={1.85}
            />
          </button>
        </div>

        {/* Clean Unboxed Metadata & Title */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#665E64]">
            <span className="font-medium text-[#4B4449]">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.volume}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate({ page: 'product', productId: product.id })}
            className="mt-1.5 block text-left text-[15px] font-semibold leading-snug text-[#1C1A1D] transition-colors hover:text-[#D94A64] cursor-pointer line-clamp-2"
          >
            {product.name}
          </button>

          <p className="mt-1 text-xs text-[#665E64] line-clamp-1">{product.purpose}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {product.variants.slice(0, 4).map((v) => (
                <span
                  key={v.id}
                  title={v.name}
                  className="inline-block h-3 w-3 rounded-full border border-black/15"
                  style={{ backgroundColor: v.hex || '#E8B4BE' }}
                />
              ))}
              <span className="text-[11px] text-[#8E848A]">
                {product.variants.length} вар.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Price & Add to Cart Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-[#1C1A1D]/8 px-4 py-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="tabular-nums text-[15px] font-bold text-[#1C1A1D]">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="tabular-nums text-xs text-[#8E848A] line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-[11px] font-medium text-[#8E848A]">Нет в наличии</span>
          )}
        </div>

        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => addToCart(product)}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
            product.inStock
              ? 'bg-[#1C1A1D] text-white hover:bg-[#D94A64] cursor-pointer'
              : 'cursor-not-allowed bg-[#EAE5E1] text-[#8E848A]'
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{product.inStock ? 'В корзину' : 'Ожидается'}</span>
        </button>
      </div>
    </article>
  );
};
