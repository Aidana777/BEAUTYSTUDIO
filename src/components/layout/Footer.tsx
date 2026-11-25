import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigate, openCatalogWith } = useStore();

  return (
    <footer className="border-t border-[#1C1A1D]/10 bg-white text-[#1C1A1D]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="font-display text-2xl font-semibold tracking-tight text-[#1C1A1D] hover:text-[#D94A64] cursor-pointer"
            >
              Beauty Studio
            </button>
            <p className="text-sm leading-relaxed text-[#665E64]">
              Цифровое beauty-пространство для знакомства с косметикой ухода, декоративными текстурами и парфюмерией.
            </p>
            <p className="text-xs leading-relaxed text-[#8E848A]">
              Демонстрационная витрина MVP: ассортимент, цены и отзывы представлены в тестовом формате.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-[#1C1A1D]">Категории каталога</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#665E64]">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => openCatalogWith({ categoryId: cat.id })}
                    className="transition-colors hover:text-[#D94A64] cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-[#1C1A1D]">Покупателям</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#665E64]">
              <li>
                <button
                  type="button"
                  onClick={() => openCatalogWith({ onlyNew: true })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Новинки каталога
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openCatalogWith({ onlyBestseller: true })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Бестселлеры
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'info', section: 'delivery' })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Доставка и оплата
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'info', section: 'faq' })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Частые вопросы (FAQ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'info', section: 'about' })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  О магазине
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-sm font-semibold text-[#1C1A1D]">Связь и разделы</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#665E64]">
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'info', section: 'contacts' })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Контакты студии
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'wishlist' })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Список избранного
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'checkout' })}
                  className="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Оформление заказа
                </button>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[#8E848A]">
              Условия обработки персональных данных и оферта добавляются при подключении реального магазина.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#1C1A1D]/10 pt-6 text-xs text-[#8E848A] sm:flex-row sm:items-center">
          <p>© 2026 Beauty Studio. Демонстрационный e-commerce проект.</p>
          <p>48 тестовых позиций · Интерактивная 3D-витрина на Three.js</p>
        </div>
      </div>
    </footer>
  );
};
