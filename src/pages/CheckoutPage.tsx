import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DeliveryMethod, OrderRecord } from '../types/shop';
import { formatPrice } from '../utils/format';

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, submitOrder, openCatalogWith, navigate } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (customerName.trim().length < 2) {
      nextErrors.customerName = 'Укажите ваше имя (минимум 2 символа).';
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      nextErrors.phone = 'Введите корректный номер телефона.';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Проверьте формат электронной почты.';
    }
    if (deliveryMethod === 'delivery' && address.trim().length < 6) {
      nextErrors.address = 'Укажите адрес для доставки.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!validate()) return;

    const record = submitOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      deliveryMethod,
      address: deliveryMethod === 'delivery' ? address.trim() : 'Самовывоз из студии',
      comment: comment.trim(),
      paymentMethod: 'При получении (демонстрационная заявка)',
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        variantName: item.variant?.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        lineTotal: item.product.price * item.quantity,
      })),
      totalAmount: cartTotal,
    });
    setConfirmedOrder(record);
  };

  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-[#1C1A1D]/10 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E9F5EE] text-[#2E6B47]">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
            Заявка #{confirmedOrder.orderNumber} сохранена
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#1C1A1D]">
            Заказ оформлен
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#4B4449]">
            Спасибо за заказ! Мы получили вашу заявку и свяжемся с вами для подтверждения.
          </p>

          <div className="mt-8 rounded-xl border border-[#1C1A1D]/10 bg-[#FBF9F6] p-5 text-left text-sm">
            <div className="flex justify-between border-b border-[#1C1A1D]/10 pb-3">
              <span className="text-[#665E64]">Получатель</span>
              <span className="font-semibold text-[#1C1A1D]">{confirmedOrder.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-[#1C1A1D]/10 py-3">
              <span className="text-[#665E64]">Телефон</span>
              <span className="tabular-nums font-medium text-[#1C1A1D]">{confirmedOrder.phone}</span>
            </div>
            <div className="flex justify-between border-b border-[#1C1A1D]/10 py-3">
              <span className="text-[#665E64]">Способ получения</span>
              <span className="font-medium text-[#1C1A1D]">
                {confirmedOrder.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {confirmedOrder.items.map((item) => (
                <div key={`${item.productId}-${item.variantName}`} className="flex justify-between gap-2 text-xs">
                  <span className="text-[#4B4449]">
                    {item.name} {item.variantName ? `(${item.variantName})` : ''} × {item.quantity}
                  </span>
                  <span className="tabular-nums font-semibold text-[#1C1A1D]">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-[#1C1A1D]/10 pt-3 font-semibold text-[#1C1A1D]">
              <span>Итого по товарам</span>
              <span className="tabular-nums">{formatPrice(confirmedOrder.totalAmount)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openCatalogWith({})}
              className="rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white hover:bg-[#BF3851] cursor-pointer"
            >
              Продолжить покупки
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
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EEF0] text-[#D94A64]">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-[#1C1A1D]">
          В корзине нет товаров
        </h1>
        <p className="mt-2 text-sm text-[#665E64]">
          Добавьте косметические средства из каталога перед оформлением заказа.
        </p>
        <button
          type="button"
          onClick={() => openCatalogWith({})}
          className="mt-6 rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white hover:bg-[#BF3851] cursor-pointer"
        >
          Перейти в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-xs text-[#665E64]">
        <button type="button" onClick={() => navigate({ page: 'home' })} className="hover:text-[#D94A64] cursor-pointer">
          Главная
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-[#1C1A1D]">Оформление заказа</span>
      </nav>

      <h1 className="mt-4 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
        Оформление заказа
      </h1>
      <p className="mt-1.5 text-xs text-[#665E64]">
        Демонстрационная форма заявки: данные сохраняются локально в сессии браузера без списания оплаты.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-2xl border border-[#1C1A1D]/8 bg-white p-6 sm:p-8 lg:col-span-7"
        >
          <div>
            <h2 className="font-display text-xl font-semibold text-[#1C1A1D]">
              Контактные данные
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-name" className="block text-xs font-semibold text-[#4B4449]">
                  Имя *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Например, Анна"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3.5 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-[#D94A64]">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-phone" className="block text-xs font-semibold text-[#4B4449]">
                  Номер телефона *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3.5 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-[#D94A64]">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-email" className="block text-xs font-semibold text-[#4B4449]">
                  Электронная почта (необязательно)
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3.5 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#D94A64]">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#1C1A1D]/10 pt-6">
            <h2 className="font-display text-xl font-semibold text-[#1C1A1D]">
              Способ получения
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(
                [
                  { id: 'delivery', label: 'Доставка', sub: 'По указанному адресу' },
                  { id: 'pickup', label: 'Самовывоз', sub: 'Условия уточняются при подтверждении' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDeliveryMethod(opt.id)}
                  className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    deliveryMethod === opt.id
                      ? 'border-[#D94A64] bg-[#F8EEF0]'
                      : 'border-[#1C1A1D]/15 bg-[#FBF9F6] hover:border-[#1C1A1D]/30'
                  }`}
                >
                  <p className="text-sm font-semibold text-[#1C1A1D]">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-[#665E64]">{opt.sub}</p>
                </button>
              ))}
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="mt-4">
                <label htmlFor="checkout-address" className="block text-xs font-semibold text-[#4B4449]">
                  Адрес доставки *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Город, улица, дом, квартира"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3.5 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-[#D94A64]">{errors.address}</p>
                )}
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="checkout-comment" className="block text-xs font-semibold text-[#4B4449]">
                Комментарий к заказу
              </label>
              <textarea
                id="checkout-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Удобное время звонка или пожелания по упаковке"
                className="mt-1.5 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] p-3 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-lg bg-[#D94A64] text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
          >
            Подтвердить заказ
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-[#1C1A1D]/8 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-[#1C1A1D]">
              Состав заказа
            </h2>

            <div className="mt-4 divide-y divide-[#1C1A1D]/10">
              {cart.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-3 py-3.5">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 shrink-0 rounded-lg bg-[#F8F5F0] object-cover"
                    />
                    <div>
                      <p className="text-xs text-[#665E64]">{item.product.brand}</p>
                      <p className="text-sm font-semibold text-[#1C1A1D]">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-[#665E64]">{item.variant.name}</p>
                      )}
                      <p className="tabular-nums mt-0.5 text-xs text-[#665E64]">
                        {item.quantity} шт. × {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                  <p className="tabular-nums shrink-0 text-sm font-semibold text-[#1C1A1D]">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-[#1C1A1D]/10 pt-4 text-sm">
              <div className="flex justify-between text-[#665E64]">
                <span>Товары</span>
                <span className="tabular-nums font-medium text-[#1C1A1D]">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#665E64]">
                <span>Доставка</span>
                <span className="text-xs text-[#665E64]">Уточняется при подтверждении</span>
              </div>
              <div className="flex justify-between border-t border-[#1C1A1D]/10 pt-3 text-base font-bold text-[#1C1A1D]">
                <span>Итого к оплате</span>
                <span className="tabular-nums">{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
