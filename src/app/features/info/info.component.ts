import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DEMO_REVIEWS, FAQ_ITEMS, STORE_ADVANTAGES } from '../../core/data/editorial.data';
import { ProductService } from '../../core/services/product.service';

export type InfoSection = 'about' | 'delivery' | 'faq' | 'contacts';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Хлебные крошки" class="mb-6 flex items-center gap-2 text-xs text-[#665E64]">
        <a routerLink="/" class="hover:text-[#1C1A1D]">Главная</a>
        <span>/</span>
        <span class="font-medium text-[#1C1A1D]">{{ sectionLabel() }}</span>
      </nav>

      <!-- Section Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-[#1C1A1D]/10 pb-5">
        <a
          routerLink="/about"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          [class]="
            section() === 'about'
              ? 'bg-[#1C1A1D] text-white'
              : 'border border-[#1C1A1D]/12 bg-white text-[#4B4449] hover:border-[#D94A64] hover:text-[#D94A64]'
          "
        >
          О магазине
        </a>
        <a
          routerLink="/delivery"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          [class]="
            section() === 'delivery'
              ? 'bg-[#1C1A1D] text-white'
              : 'border border-[#1C1A1D]/12 bg-white text-[#4B4449] hover:border-[#D94A64] hover:text-[#D94A64]'
          "
        >
          Доставка и оплата
        </a>
        <a
          routerLink="/faq"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          [class]="
            section() === 'faq'
              ? 'bg-[#1C1A1D] text-white'
              : 'border border-[#1C1A1D]/12 bg-white text-[#4B4449] hover:border-[#D94A64] hover:text-[#D94A64]'
          "
        >
          Частые вопросы (FAQ)
        </a>
        <a
          routerLink="/contacts"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          [class]="
            section() === 'contacts'
              ? 'bg-[#1C1A1D] text-white'
              : 'border border-[#1C1A1D]/12 bg-white text-[#4B4449] hover:border-[#D94A64] hover:text-[#D94A64]'
          "
        >
          Контакты
        </a>
      </div>

      @switch (section()) {
        @case ('about') {
          <section class="mt-8 space-y-12">
            <div class="grid grid-cols-1 gap-8 rounded-2xl border border-[#1C1A1D]/10 bg-white p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
              <div class="lg:col-span-7">
                <span class="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
                  О проекте Beauty Studio
                </span>
                <h1 class="mt-3 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
                  Цифровое beauty-пространство с фокусом на состав, форму и выбор
                </h1>
                <p class="mt-4 text-sm leading-relaxed text-[#4B4449] sm:text-base">
                  Beauty Studio спроектирован как удобный интернет-магазин косметики и парфюмерии на базе Angular, Tailwind CSS и Three.js. В каталоге собраны 48 тестовых товаров по шести ключевым направлениям: уход за лицом, макияж, уход за телом, волосы, парфюмерия и подарочные наборы.
                </p>
                <p class="mt-3 text-sm leading-relaxed text-[#665E64]">
                  Версия работает как полноценный фронтенд-MVP: фильтрация, выбор оттенков, 3D-превью флаконов, избранное, корзина и оформление заявки функционируют мгновенно в браузере.
                </p>
                <div class="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    (click)="productService.openCatalogWith({})"
                    class="rounded-lg bg-[#D94A64] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
                  >
                    Открыть каталог
                  </button>
                  <a
                    routerLink="/faq"
                    class="rounded-lg border border-[#1C1A1D]/15 px-5 py-2.5 text-sm font-semibold text-[#1C1A1D] hover:bg-[#F8EEF0]"
                  >
                    Ответы на вопросы
                  </a>
                </div>
              </div>

              <div class="lg:col-span-5">
                <div class="overflow-hidden rounded-xl bg-[#F8F5F0]">
                  <img
                    src="/src/assets/images/giftset_beauty_coffret_1795614811913.jpg"
                    alt="Beauty Studio — коллекция средств"
                    referrerPolicy="no-referrer"
                    class="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 class="font-display text-2xl font-semibold text-[#1C1A1D] sm:text-3xl">
                Ключевые возможности витрины
              </h2>
              <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                @for (item of advantages; track item.title) {
                  <div class="rounded-xl border border-[#1C1A1D]/10 bg-white p-5">
                    <h3 class="font-display text-lg font-semibold text-[#1C1A1D]">
                      {{ item.title }}
                    </h3>
                    <p class="mt-2 text-sm leading-relaxed text-[#665E64]">
                      {{ item.description }}
                    </p>
                  </div>
                }
              </div>
            </div>

            <div>
              <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <span class="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
                    Примеры интерфейса
                  </span>
                  <h2 class="mt-1 font-display text-2xl font-semibold text-[#1C1A1D]">
                    Демонстрационные карточки отзывов
                  </h2>
                </div>
                <p class="text-xs text-[#8E848A]">
                  Тестовые макеты отзывов для демонстрации оформления блока
                </p>
              </div>

              <div class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                @for (review of demoReviews; track review.id) {
                  <article class="rounded-xl border border-[#1C1A1D]/10 bg-white p-5">
                    <div class="flex items-center justify-between text-xs text-[#8E848A]">
                      <span>{{ review.date }}</span>
                      <span class="font-semibold text-[#D94A64]">{{ review.rating }} / 5</span>
                    </div>
                    <h3 class="mt-2.5 text-sm font-semibold text-[#1C1A1D]">
                      {{ review.productName }}
                    </h3>
                    <p class="mt-2 text-sm leading-relaxed text-[#4B4449]">
                      {{ review.text }}
                    </p>
                    <p class="mt-4 text-xs font-medium text-[#665E64]">
                      {{ review.author }}
                    </p>
                  </article>
                }
              </div>
            </div>
          </section>
        }

        @case ('delivery') {
          <section class="mt-8 space-y-8">
            <div>
              <span class="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
                Логистика и расчёт
              </span>
              <h1 class="mt-2 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
                Доставка и оплата
              </h1>
              <p class="mt-2 max-w-2xl text-sm leading-relaxed text-[#665E64]">
                В демонстрационном MVP доступны базовые сценарии выбора получения и оплаты заказа. Точные тарифы, зоны курьерской службы и платёжный шлюз подключаются при запуске рабочего магазина.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="rounded-2xl border border-[#1C1A1D]/10 bg-white p-6">
                <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">
                  Способы получения
                </h2>
                <ul class="mt-4 space-y-4 text-sm text-[#4B4449]">
                  <li class="rounded-xl bg-[#FBF9F6] p-4">
                    <p class="font-semibold text-[#1C1A1D]">Курьерская доставка</p>
                    <p class="mt-1 text-xs leading-relaxed text-[#665E64]">
                      При оформлении заказа вы указываете город, улицу и дом. Срок и стоимость согласовываются при подтверждении заявки.
                    </p>
                  </li>
                  <li class="rounded-xl bg-[#FBF9F6] p-4">
                    <p class="font-semibold text-[#1C1A1D]">Самовывоз из пункта выдачи</p>
                    <p class="mt-1 text-xs leading-relaxed text-[#665E64]">
                      Удобный вариант без указания адреса доставки. После подтверждения заказ резервируется для выдачи.
                    </p>
                  </li>
                </ul>
              </div>

              <div class="rounded-2xl border border-[#1C1A1D]/10 bg-white p-6">
                <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">
                  Условия оплаты
                </h2>
                <ul class="mt-4 space-y-4 text-sm text-[#4B4449]">
                  <li class="rounded-xl bg-[#FBF9F6] p-4">
                    <p class="font-semibold text-[#1C1A1D]">Оплата при получении</p>
                    <p class="mt-1 text-xs leading-relaxed text-[#665E64]">
                      Доступна оплата наличными или банковской картой курьеру и в пункте самовывоза после проверки состава заказа.
                    </p>
                  </li>
                  <li class="rounded-xl bg-[#FBF9F6] p-4">
                    <p class="font-semibold text-[#1C1A1D]">Прозрачный расчёт в корзине</p>
                    <p class="mt-1 text-xs leading-relaxed text-[#665E64]">
                      Итоговая стоимость товаров обновляется автоматически при изменении количества или оттенков без скрытых комиссий.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        }

        @case ('faq') {
          <section class="mt-8">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
              Справочный центр
            </span>
            <h1 class="mt-2 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
              Частые вопросы
            </h1>
            <p class="mt-2 max-w-2xl text-sm text-[#665E64]">
              Ответы по работе каталога, подбору оттенков, проверке состава INCI и оформлению демонстрационного заказа.
            </p>

            <div class="mt-8 space-y-3">
              @for (item of faqItems; track item.id) {
                <div class="overflow-hidden rounded-xl border border-[#1C1A1D]/10 bg-white">
                  <button
                    type="button"
                    (click)="toggleFaq(item.id)"
                    [attr.aria-expanded]="openFaqId() === item.id"
                    class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#1C1A1D] transition-colors hover:bg-[#FBF9F6] cursor-pointer sm:text-base"
                  >
                    <span>{{ item.question }}</span>
                    <span class="shrink-0 text-lg font-normal text-[#D94A64]">
                      {{ openFaqId() === item.id ? '−' : '+' }}
                    </span>
                  </button>

                  @if (openFaqId() === item.id) {
                    <div class="border-t border-[#1C1A1D]/8 px-5 py-4 text-sm leading-relaxed text-[#4B4449]">
                      {{ item.answer }}
                    </div>
                  }
                </div>
              }
            </div>
          </section>
        }

        @case ('contacts') {
          <section class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div class="space-y-6 lg:col-span-5">
              <div>
                <span class="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
                  Связаться с нами
                </span>
                <h1 class="mt-2 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
                  Контакты Beauty Studio
                </h1>
                <p class="mt-2 text-sm leading-relaxed text-[#665E64]">
                  Раздел контактов подготовлен для демонстрационного MVP и может быть дополнен актуальными реквизитами владельца магазина.
                </p>
              </div>

              <div class="space-y-3 rounded-2xl border border-[#1C1A1D]/10 bg-white p-6 text-sm">
                <div>
                  <span class="text-xs text-[#8E848A]">Формат витрины</span>
                  <p class="mt-0.5 font-medium text-[#1C1A1D]">
                    Демонстрационный онлайн-каталог Beauty Studio
                  </p>
                </div>
                <div>
                  <span class="text-xs text-[#8E848A]">График приёма онлайн-заявок</span>
                  <p class="mt-0.5 font-medium text-[#1C1A1D]">Круглосуточно через корзину сайта</p>
                </div>
                <div>
                  <span class="text-xs text-[#8E848A]">Почта для тестовых обращений</span>
                  <p class="mt-0.5 font-medium text-[#1C1A1D]">hello&#64;beauty-studio.demo</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-[#1C1A1D]/10 bg-white p-6 sm:p-8 lg:col-span-7">
              <h2 class="font-display text-xl font-semibold text-[#1C1A1D]">
                Форма обратной связи (демо)
              </h2>
              <p class="mt-1 text-xs text-[#665E64]">
                Сообщение проверяется локально в интерфейсе без отправки на сервер.
              </p>

              @if (feedbackSent()) {
                <div class="mt-6 rounded-xl border border-[#2F855A]/25 bg-[#E8F6EE] p-5 text-sm text-[#1C1A1D]">
                  <p class="font-semibold text-[#2F855A]">Обращение сформировано</p>
                  <p class="mt-1 text-[#4B4449]">
                    Спасибо за сообщение! В демонстрационной версии форма подтверждает отправку мгновенно.
                  </p>
                  <button
                    type="button"
                    (click)="resetFeedback()"
                    class="mt-4 rounded-lg border border-[#1C1A1D]/15 bg-white px-4 py-2 text-xs font-semibold text-[#1C1A1D] hover:bg-[#FBF9F6] cursor-pointer"
                  >
                    Отправить ещё одно сообщение
                  </button>
                </div>
              } @else {
                <form (ngSubmit)="submitFeedback()" class="mt-5 space-y-4">
                  <div>
                    <label for="fbName" class="block text-xs font-semibold text-[#1C1A1D]">
                      Ваше имя *
                    </label>
                    <input
                      id="fbName"
                      name="fbName"
                      type="text"
                      [(ngModel)]="feedbackName"
                      placeholder="Мария"
                      class="mt-1.5 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3.5 py-2.5 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label for="fbText" class="block text-xs font-semibold text-[#1C1A1D]">
                      Вопрос или комментарий *
                    </label>
                    <textarea
                      id="fbText"
                      name="fbText"
                      rows="4"
                      [(ngModel)]="feedbackMessage"
                      placeholder="Напишите вопрос по подбору средства или работе каталога..."
                      class="mt-1.5 w-full rounded-lg border border-[#1C1A1D]/15 bg-[#FBF9F6] px-3.5 py-2.5 text-sm text-[#1C1A1D] focus:border-[#D94A64] focus:outline-none"
                    ></textarea>
                  </div>
                  @if (feedbackError()) {
                    <p class="text-xs text-[#C53030]">{{ feedbackError() }}</p>
                  }
                  <button
                    type="submit"
                    class="rounded-lg bg-[#D94A64] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BF3851] cursor-pointer"
                  >
                    Отправить сообщение
                  </button>
                </form>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
})
export class InfoComponent {
  private readonly route = inject(ActivatedRoute);
  readonly productService = inject(ProductService);

  private readonly routeData = toSignal(this.route.data, {
    initialValue: { section: 'about' as InfoSection },
  });

  readonly section = computed<InfoSection>(
    () => (this.routeData()['section'] as InfoSection | undefined) ?? 'about',
  );

  readonly sectionLabel = computed(() => {
    switch (this.section()) {
      case 'delivery':
        return 'Доставка и оплата';
      case 'faq':
        return 'Частые вопросы';
      case 'contacts':
        return 'Контакты';
      default:
        return 'О магазине';
    }
  });

  readonly advantages = STORE_ADVANTAGES;
  readonly faqItems = FAQ_ITEMS;
  readonly demoReviews = DEMO_REVIEWS;

  readonly openFaqId = signal<string | null>(FAQ_ITEMS[0]?.id ?? null);

  feedbackName = '';
  feedbackMessage = '';
  readonly feedbackSent = signal(false);
  readonly feedbackError = signal('');

  toggleFaq(id: string): void {
    this.openFaqId.update((curr) => (curr === id ? null : id));
  }

  submitFeedback(): void {
    if (this.feedbackName.trim().length < 2 || this.feedbackMessage.trim().length < 5) {
      this.feedbackError.set('Заполните имя и текст сообщения (минимум 5 символов).');
      return;
    }
    this.feedbackError.set('');
    this.feedbackSent.set(true);
  }

  resetFeedback(): void {
    this.feedbackName = '';
    this.feedbackMessage = '';
    this.feedbackError.set('');
    this.feedbackSent.set(false);
  }
}
