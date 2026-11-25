import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeliveryMethod, OrderRecord } from '../../core/models/shop.models';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { formatPrice } from '../../core/utils/format.util';

interface CheckoutErrors {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Хлебные крошки" class="mb-6 flex items-center gap-2 text-xs text-[#665E64]">
        <a routerLink="/" class="hover:text-[#1C1A1D]">Главная</a>
        <span>/</span>
        <span class="font-medium text-[#1C1A1D]">Оформление заказа</span>
      </nav>

      @if (submittedOrder(); as order) {
        <section class="mx-auto max-w-3xl rounded-2xl border border-[#1C1A1D]/10 bg-white p-6 shadow-sm sm:p-10">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F6EE] text-[#2F855A]">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <p class="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
            Заказ № {{ order.orderNumber }}
          </p>
          <h1 class="mt-2 font-display text-2xl font-semibold leading-snug text-[#1C1A1D] sm:text-3xl">
            Спасибо за заказ! Мы получили вашу заявку и свяжемся с вами для подтверждения.
          </h1>
          <p class="mt-3 text-sm text-[#665E64]">
            Демонстрационная заявка сохранена локально в вашем браузере без списания средств и передачи данных на внешние серверы.
          </p>

          <div class="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-[#1C1A1D]/10 bg-[#FBF9F6] p-5 text-sm sm:grid-cols-2">
            <div>
              <span class="text-xs text-[#8E848A]">Получатель</span>
              <p class="mt-0.5 font-medium text-[#1C1A1D]">{{ order.customerName }}</p>
            </div>
            <div>
              <span class="text-xs text-[#8E848A]">Телефон</span>
              <p class="mt-0.5 font-medium text-[#1C1A1D]">{{ order.phone }}</p>
            </div>
            @if (order.email) {
              <div>
                <span class="text-xs text-[#8E848A]">Электронная почта</span>
                <p class="mt-0.5 font-medium text-[#1C1A1D]">{{ order.email }}</p>
              </div>
            }
            <div>
              <span class="text-xs text-[#8E848A]">Способ получения</span>
              <p class="mt-0.5 font-medium text-[#1C1A1D]">
                {{ order.deliveryMethod === 'delivery' ? 'Курьерская доставка' : 'Самовывоз' }}
              </p>
            </div>
            @if (order.deliveryMethod === 'delivery' && order.address) {
              <div class="sm:col-span-2">
                <span class="text-xs text-[#8E848A]">Адрес доставки</span>
                <p class="mt-0.5 font-medium text-[#1C1A1D]">{{ order.address }}</p>
              </div>
            }
            <div>
              <span class="text-xs text-[#8E848A]">Оплата</span>
              <p class="mt-0.5 font-medium text-[#1C1A1D]">{{ order.paymentMethod }}</p>
            </div>
            @if (order.comment) {
              <div>
                <span class="text-xs text-[#8E848A]">Комментарий</span>
                <p class="mt-0.5 font-medium text-[#1C1A1D]">{{ order.comment }}</p>
              </div>
            }
          </div>

          <div class="mt-6">
            <h2 class="text-sm font-semibold text-[#1C1A1D]">Состав заказа</h2>
            <ul class="mt-3 divide-y divide-[#1C1A1D]/8 border-t border-b border-[#1C1A1D]/8">
              @for (item of order.items; track item.productId + '-' + (item.variantName ?? 'base')) {
                <li class="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p class="font-medium text-[#1C1A1D]">
                      {{ item.name }}
                      <span class="text-xs text-[#665E64]">× {{ item.quantity }}</span>
                    </p>
                    <p class="text-xs text-[#665E64]">
                      {{ item.brand }}{{ item.variantName ? ' · ' + item.variantName : '' }}
                    </p>
                  </div>
                  <span class="tabular-nums font-semibold text-[#1C1A1D]">
                    {{ formatPrice(item.lineTotal) }}
                  </span>
                </li>
              }
            </ul>

            <div class="mt-4 flex items-center justify-between text-base font-bold text-[#1C1A1D]">
              <span>Итого по заявке</span>
              <span class="tabular-nums">{{ formatPrice(order.totalAmount) }}</span>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              (click)="productService.openCatalogWith({})"
              class="rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
            >
              Продолжить покупки
            </button>
            <a
              routerLink="/"
              class="rounded-lg border border-[#1C1A1D]/15 bg-white px-6 py-3 text-sm font-semibold text-[#1C1A1D] transition-colors hover:bg-[#F8EEF0]"
            >
              На главную
            </a>
          </div>
        </section>
      } @else if (cartService.items().length === 0) {
        <section class="mx-auto max-w-xl rounded-2xl border border-[#1C1A1D]/10 bg-white px-6 py-16 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EEF0] text-[#D94A64]">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1 class="mt-5 font-display text-2xl font-semibold text-[#1C1A1D]">
            Корзина пуста
          </h1>
          <p class="mt-2 text-sm text-[#665E64]">
            Добавьте хотя бы одно косметическое средство из каталога, чтобы перейти к оформлению заказа.
          </p>
          <button
            type="button"
            (click)="productService.openCatalogWith({})"
            class="mt-6 rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
          >
            Выбрать товары в каталоге
          </button>
        </section>
      } @else {
        <div>
          <h1 class="font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
            Оформление заказа
          </h1>
          <p class="mt-1.5 text-sm text-[#665E64]">
            Заполните контактные данные и выберите удобный способ получения.
          </p>

          <form
            (ngSubmit)="submit()"
            novalidate
            class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            <div class="space-y-6 lg:col-span-7">
              <div class="rounded-2xl border border-[#1C1A1D]/10 bg-white p-6">
                <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">
                  1. Контактные данные
                </h2>

                <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label for="customerName" class="block text-xs font-semibold text-[#1C1A1D]">
                      Имя и фамилия *
                    </label>
                    <input
                      id="customerName"
                      name="customerName"
                      type="text"
                      [(ngModel)]="customerName"
                      placeholder="Например, Анна Соколова"
                      class="mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:outline-none"
                      [class]="
                        errors().customerName
                          ? 'border-[#C53030] bg-[#FFF5F5]'
                          : 'border-[#1C1A1D]/15 bg-[#FBF9F6] focus:border-[#D94A64]'
                      "
                    />
                    @if (errors().customerName) {
                      <p class="mt-1 text-xs text-[#C53030]">{{ errors().customerName }}</p>
                    }
                  </div>

                  <div>
                    <label for="phone" class="block text-xs font-semibold text-[#1C1A1D]">
                      Телефон *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      [(ngModel)]="phone"
                      placeholder="+7 (999) 123-45-67"
                      class="mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:outline-none"
                      [class]="
                        errors().phone
                          ? 'border-[#C53030] bg-[#FFF5F5]'
                          : 'border-[#1C1A1D]/15 bg-[#FBF9F6] focus:border-[#D94A64]'
                      "
                    />
                    @if (errors().phone) {
                      <p class="mt-1 text-xs text-[#C53030]">{{ errors().phone }}</p>
                    }
                  </div>

                  <div>
                    <label for="email" class="block text-xs font-semibold text-[#1C1A1D]">
                      Электронная почта (необязательно)
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      [(ngModel)]="email"
                      placeholder="name@example.ru"
                      class="mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:outline-none"
                      [class]="
                        errors().email
                          ? 'border-[#C53030] bg-[#FFF5F5]'
                          : 'border-[#1C1A1D]/15 bg-[#FBF9F6] focus:border-[#D94A64]'
                      "
                    />
                    @if (errors().email) {
                      <p class="mt-1 text-xs text-[#C53030]">{{ errors().email }}</p>
                    }
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-[#1C1A1D]/10 bg-white p-6">
                <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">
                  2. Способ получения
                </h2>

                <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    (click)="setDeliveryMethod('delivery')"
                    class="flex flex-col items-start rounded-xl border p-4 text-left transition-colors cursor-pointer"
                    [class]="
                      deliveryMethod === 'delivery'
                        ? 'border-[#D94A64] bg-[#F8EEF0]/55'
                        : 'border-[#1C1A1D]/12 bg-[#FBF9F6] hover:border-[#1C1A1D]/30'
                    "
                  >
                    <span class="text-sm font-semibold text-[#1C1A1D]">Курьерская доставка</span>
                    <span class="mt-1 text-xs text-[#665E64]">
                      Укажите адрес — детали и сроки уточняются при подтверждении
                    </span>
                  </button>

                  <button
                    type="button"
                    (click)="setDeliveryMethod('pickup')"
                    class="flex flex-col items-start rounded-xl border p-4 text-left transition-colors cursor-pointer"
                    [class]="
                      deliveryMethod === 'pickup'
                        ? 'border-[#D94A64] bg-[#F8EEF0]/55'
                        : 'border-[#1C1A1D]/12 bg-[#FBF9F6] hover:border-[#1C1A1D]/30'
                    "
                  >
                    <span class="text-sm font-semibold text-[#1C1A1D]">Самовывоз</span>
                    <span class="mt-1 text-xs text-[#665E64]">
                      Получение из пункта выдачи после подтверждения заявки
                    </span>
                  </button>
                </div>

                @if (deliveryMethod === 'delivery') {
                  <div class="mt-4">
                    <label for="address" class="block text-xs font-semibold text-[#1C1A1D]">
                      Адрес доставки *
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      [(ngModel)]="address"
                      placeholder="Город, улица, дом, квартира или офис"
                      class="mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:outline-none"
                      [class]="
                        errors().address
                          ? 'border-[#C53030] bg-[#FFF5F5]'
                          : 'border-[#1C1A1D]/15 bg-[#FBF9F6] focus:border-[#D94A64]'
                      "
                    />
                    @if (errors().address) {
                      <p class="mt-1 text-xs text-[#C53030]">{{ errors().address }}</p>
                    }
                  </div>
                }
              </div>

              <div class="rounded-2xl border border-[#1C1A1D]/10 bg-white p-6">
                <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">
                  3. Оплата и комментарий
                </h2>

                <div class="mt-4 space-y-2.5">
                  @for (option of paymentOptions; track option) {
                    <label
                      class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors"
                      [class]="
                        paymentMethod === option
                          ? 'border-[#D94A64] bg-[#F8EEF0]/45 font-medium text-[#1C1A1D]'
                          : 'border-[#1C1A1D]/12 bg-[#FBF9F6] text-[#4B4449]'
                      "
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        [value]="option"
                        [(ngModel)]="paymentMethod"
                        class="accent-[#D94A64]"
                      />
                      <span>{{ option }}</span>
                    </label>
                  }
                </div>

                <div class="mt-4">
                  <label for="comment" class="block text-xs font-semibold text-[#1C1A1D]">
                    Комментарий к заказу (необязательно)
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows="3"
                    [(ngModel)]="comment"
                    placeholder="Удобное время звонка или пожелания по упаковке..."
                    class="mt-1.5 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3.5 py-2.5 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:border-[#D94A64] focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <aside class="lg:col-span-5">
              <div class="sticky top-24 rounded-2xl border border-[#1C1A1D]/10 bg-white p-6">
                <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">
                  Ваш заказ
                </h2>

                <div class="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                  @for (item of cartService.items(); track item.key) {
                    <div class="flex items-center gap-3 rounded-xl border border-[#1C1A1D]/8 bg-[#FBF9F6] p-2.5">
                      <img
                        [src]="item.product.image"
                        [alt]="item.product.name"
                        referrerPolicy="no-referrer"
                        class="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-[#1C1A1D]">
                          {{ item.product.name }}
                        </p>
                        <p class="text-xs text-[#665E64]">
                          {{ item.quantity }} шт.{{ item.variant ? ' · ' + item.variant.name : '' }}
                        </p>
                      </div>
                      <span class="tabular-nums shrink-0 text-sm font-semibold text-[#1C1A1D]">
                        {{ formatPrice(item.product.price * item.quantity) }}
                      </span>
                    </div>
                  }
                </div>

                <div class="mt-5 space-y-2 border-t border-[#1C1A1D]/10 pt-4 text-sm">
                  <div class="flex justify-between text-[#665E64]">
                    <span>Товары ({{ cartService.totalCount() }})</span>
                    <span class="tabular-nums font-medium text-[#1C1A1D]">
                      {{ formatPrice(cartService.totalPrice()) }}
                    </span>
                  </div>
                  <div class="flex justify-between text-[#665E64]">
                    <span>Доставка</span>
                    <span>Уточняется менеджером</span>
                  </div>
                  <div class="flex justify-between border-t border-[#1C1A1D]/10 pt-3 text-base font-bold text-[#1C1A1D]">
                    <span>К оплате</span>
                    <span class="tabular-nums">{{ formatPrice(cartService.totalPrice()) }}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  class="mt-6 w-full rounded-lg bg-[#D94A64] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
                >
                  Подтвердить заказ
                </button>

                <p class="mt-3 text-center text-xs leading-relaxed text-[#8E848A]">
                  Демонстрационное оформление заказа в MVP: реальная оплата и списание средств не производятся.
                </p>
              </div>
            </aside>
          </form>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent {
  readonly cartService = inject(CartService);
  readonly productService = inject(ProductService);
  readonly formatPrice = formatPrice;

  readonly paymentOptions = [
    'При получении после подтверждения (наличными или картой)',
    'Оплата при самовывозе в студии (демо)',
  ];

  customerName = '';
  phone = '';
  email = '';
  deliveryMethod: DeliveryMethod = 'delivery';
  address = '';
  paymentMethod = this.paymentOptions[0];
  comment = '';

  readonly errors = signal<CheckoutErrors>({});
  readonly submittedOrder = signal<OrderRecord | null>(null);

  setDeliveryMethod(method: DeliveryMethod): void {
    this.deliveryMethod = method;
    if (method === 'pickup') {
      this.errors.update((prev) => ({ ...prev, address: undefined }));
    }
  }

  submit(): void {
    const nextErrors: CheckoutErrors = {};

    if (this.customerName.trim().length < 2) {
      nextErrors.customerName = 'Введите имя и фамилию (минимум 2 символа)';
    }

    const digits = this.phone.replace(/\D/g, '');
    if (digits.length < 7) {
      nextErrors.phone = 'Укажите корректный номер телефона (от 7 цифр)';
    }

    const trimmedEmail = this.email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Проверьте формат электронной почты';
    }

    if (this.deliveryMethod === 'delivery' && this.address.trim().length < 6) {
      nextErrors.address = 'Укажите адрес доставки (улица, дом, квартира)';
    }

    this.errors.set(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const items = this.cartService.items().map((entry) => ({
      productId: entry.product.id,
      name: entry.product.name,
      brand: entry.product.brand,
      variantName: entry.variant?.name,
      quantity: entry.quantity,
      unitPrice: entry.product.price,
      lineTotal: entry.product.price * entry.quantity,
    }));

    const order = this.cartService.submitOrder({
      customerName: this.customerName.trim(),
      phone: this.phone.trim(),
      email: trimmedEmail,
      deliveryMethod: this.deliveryMethod,
      address: this.deliveryMethod === 'delivery' ? this.address.trim() : '',
      comment: this.comment.trim(),
      paymentMethod: this.paymentMethod,
      items,
      totalAmount: this.cartService.totalPrice(),
    });

    this.submittedOrder.set(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
