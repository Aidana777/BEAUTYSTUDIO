import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { DEMO_REVIEWS, FAQ_ITEMS, STORE_ADVANTAGES } from '../data/editorial';
import { useStore } from '../context/StoreContext';

interface InfoPageProps {
  section: 'about' | 'delivery' | 'contacts' | 'faq';
}

export const InfoPage: React.FC<InfoPageProps> = ({ section }) => {
  const { navigate, openCatalogWith } = useStore();
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id);

  const tabs: { id: InfoPageProps['section']; label: string }[] = [
    { id: 'about', label: 'О магазине' },
    { id: 'delivery', label: 'Доставка и оплата' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contacts', label: 'Контакты' },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Breadcrumbs */}
      <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-xs text-[#665E64]">
        <button
          type="button"
          onClick={() => navigate({ page: 'home' })}
          className="hover:text-[#D94A64] cursor-pointer"
        >
          Главная
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-[#1C1A1D]">
          {tabs.find((t) => t.id === section)?.label}
        </span>
      </nav>

      {/* Section Switcher */}
      <div className="mt-6 flex flex-wrap gap-1.5 rounded-xl bg-[#F5F1EC] p-1.5 sm:inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate({ page: 'info', section: tab.id })}
            className={`rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              section === tab.id
                ? 'bg-white text-[#1C1A1D] shadow-sm'
                : 'text-[#665E64] hover:text-[#1C1A1D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {section === 'about' && (
        <div className="mt-8 space-y-12">
          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#1C1A1D]/8 bg-white p-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
                О проекте Beauty Studio
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-[#1C1A1D] sm:text-4xl">
                Современное beauty-пространство с фокусом на удобство выбора
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#4B4449] sm:text-base">
                Beauty Studio создан как редакционная e-commerce витрина для косметики ухода за лицом, телом, волосами, декоративных средств и парфюмерии. Главная задача интерфейса — сделать поиск подходящих формул простым, прозрачным и визуально приятным.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#4B4449] sm:text-base">
                В текущей демонстрационной версии собраны 48 тестовых позиций в шести категориях, интерактивные 3D-сцены на базе Three.js и полноценная клиентская логика корзины и избранного.
              </p>
              <button
                type="button"
                onClick={() => openCatalogWith({})}
                className="mt-6 rounded-lg bg-[#D94A64] px-6 py-3 text-sm font-semibold text-white hover:bg-[#BF3851] cursor-pointer"
              >
                Перейти в каталог
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5">
              {STORE_ADVANTAGES.map((adv) => (
                <div
                  key={adv.title}
                  className="rounded-xl border border-[#1C1A1D]/8 bg-[#FBF9F6] p-4"
                >
                  <h2 className="text-sm font-semibold text-[#1C1A1D]">{adv.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#665E64]">
                    {adv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Clearly marked demo reviews */}
          <div>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#665E64]">
                  Демонстрационный блок
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#1C1A1D]">
                  Примеры карточек отзывов (тестовые заглушки)
                </h2>
              </div>
              <span className="text-xs text-[#8E848A]">
                Представлены для демонстрации макета интерфейса
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {DEMO_REVIEWS.map((rev) => (
                <article
                  key={rev.id}
                  className="flex flex-col justify-between rounded-xl border border-[#1C1A1D]/8 bg-white p-6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#1C1A1D]">
                        {rev.author}
                      </span>
                      <div className="flex items-center gap-0.5 text-[#D94A64]" aria-label={`Оценка ${rev.rating} из 5`}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-[#8E848A]">{rev.date}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#4B4449]">{rev.text}</p>
                  </div>
                  <p className="mt-4 border-t border-[#1C1A1D]/8 pt-3 text-xs font-medium text-[#665E64]">
                    Товар: {rev.productName}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'delivery' && (
        <div className="mt-8 rounded-2xl border border-[#1C1A1D]/8 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
            Информация для покупателей
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#1C1A1D]">
            Доставка и оплата
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#665E64]">
            Текущая версия сайта является демонстрационным MVP-прототипом. Точные тарифы доставки, зоны обслуживания, сроки курьерских служб и платёжные реквизиты публикуются после утверждения условий владельцем магазина.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#1C1A1D]/8 bg-[#FBF9F6] p-5">
              <h2 className="text-base font-semibold text-[#1C1A1D]">Способы получения</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4B4449]">
                В форме оформления заказа доступны два сценария: курьерская доставка по адресу и самовывоз. Окончательный формат подтверждается при обработке заявки.
              </p>
            </div>
            <div className="rounded-xl border border-[#1C1A1D]/8 bg-[#FBF9F6] p-5">
              <h2 className="text-base font-semibold text-[#1C1A1D]">Стоимость и сроки</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4B4449]">
                Стоимость доставки рассчитывается и согласовывается после подключения реальных логистических тарифов магазина. В демо-режиме сумма доставки не начисляется.
              </p>
            </div>
            <div className="rounded-xl border border-[#1C1A1D]/8 bg-[#FBF9F6] p-5">
              <h2 className="text-base font-semibold text-[#1C1A1D]">Оплата заказа</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4B4449]">
                В первой версии MVP предусмотрено оформление заявки без онлайн-эквайринга. Подключение банковских карт и платёжных систем планируется на следующем этапе.
              </p>
            </div>
          </div>
        </div>
      )}

      {section === 'faq' && (
        <div className="mt-8 rounded-2xl border border-[#1C1A1D]/8 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
            Ответы на вопросы
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#1C1A1D]">
            Частые вопросы (FAQ)
          </h1>

          <div className="mt-6 divide-y divide-[#1C1A1D]/10">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id} className="py-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 text-left text-base font-semibold text-[#1C1A1D] hover:text-[#D94A64] cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#D94A64]' : 'text-[#665E64]'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4B4449]">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {section === 'contacts' && (
        <div className="mt-8 rounded-2xl border border-[#1C1A1D]/8 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D94A64]">
            Связаться с нами
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#1C1A1D]">
            Контакты Beauty Studio
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4B4449]">
            Раздел подготовлен для размещения актуальных контактов магазина: адреса шоурума, телефона службы поддержки, графика работы и ссылок на официальные сообщества. В демонстрационной версии вымышленные адреса и номера телефонов не указываются.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-[#1C1A1D]/8 bg-[#FBF9F6] p-5">
              <h2 className="text-sm font-semibold text-[#1C1A1D]">Поддержка покупателей</h2>
              <p className="mt-1.5 text-sm text-[#665E64]">
                Для тестирования сценария обращения оформите заявку через корзину или воспользуйтесь разделом FAQ.
              </p>
            </div>
            <div className="rounded-xl border border-[#1C1A1D]/8 bg-[#FBF9F6] p-5">
              <h2 className="text-sm font-semibold text-[#1C1A1D]">Статус витрины</h2>
              <p className="mt-1.5 text-sm text-[#665E64]">
                Версия MVP: каталог из 48 тестовых позиций, 3D-презентация и локальное сохранение корзины.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
