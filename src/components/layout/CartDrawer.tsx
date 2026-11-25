import React, { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    navigate,
    openCatalogWith,
  } = useStore();

  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1C1A1D]/45"
      role="dialog"
      aria-modal="true"
      aria-label="Корзина покупок"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-[#FBF9F6] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1A1D]/10 bg-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#D94A64]" />
            <h2 className="font-display text-xl font-semibold text-[#1C1A1D]">
              Корзина
            </h2>
            <span className="tabular-nums text-sm text-[#665E64]">({cartCount})</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Закрыть корзину"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#665E64] hover:bg-[#F8EEF0] hover:text-[#1C1A1D] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EEF0] text-[#D94A64]">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-[#1C1A1D]">
              Корзина пока пуста
            </h3>
            <p className="mt-2 max-w-xs text-sm text-[#665E64]">
              Перейдите в каталог, чтобы подобрать средства для ухода, макияжа или парфюмерии.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                openCatalogWith({});
              }}
              className="mt-6 rounded-lg bg-[#D94A64] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {cart.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 rounded-xl border border-[#1C1A1D]/8 bg-white p-3.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate({ page: 'product', productId: item.product.id });
                    }}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F8F5F0] cursor-pointer"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#665E64]">
                            {item.product.brand}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCartOpen(false);
                              navigate({ page: 'product', productId: item.product.id });
                            }}
                            className="truncate text-left text-sm font-semibold text-[#1C1A1D] hover:text-[#D94A64] cursor-pointer block max-w-full"
                          >
                            {item.product.name}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          aria-label={`Удалить ${item.product.name}`}
                          className="shrink-0 p-1 text-[#8E848A] hover:text-[#D94A64] cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {item.variant && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#665E64]">
                          {item.variant.hex && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full border border-black/15"
                              style={{ backgroundColor: item.variant.hex }}
                            />
                          )}
                          <span>{item.variant.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.key, item.quantity - 1)}
                          aria-label="Уменьшить количество"
                          className="flex h-7 w-7 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="tabular-nums w-8 text-center text-xs font-semibold text-[#1C1A1D]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.key, item.quantity + 1)}
                          aria-label="Увеличить количество"
                          className="flex h-7 w-7 items-center justify-center text-[#1C1A1D] hover:bg-[#F8EEF0] cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="tabular-nums text-sm font-semibold text-[#1C1A1D]">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="tabular-nums text-[11px] text-[#8E848A]">
                            {formatPrice(item.product.price)} / шт.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-[#1C1A1D]/10 bg-white px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#665E64]">Итого за товары</span>
                <span className="tabular-nums text-lg font-bold text-[#1C1A1D]">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8E848A]">
                Демонстрационный расчёт корзины без списания средств.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate({ page: 'checkout' });
                  }}
                  className="w-full rounded-lg bg-[#D94A64] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
                >
                  Оформить заказ
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full rounded-lg border border-[#1C1A1D]/15 py-2 text-xs font-medium text-[#665E64] transition-colors hover:bg-[#F8EEF0] hover:text-[#1C1A1D] cursor-pointer"
                >
                  Очистить корзину
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
