import React, { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Header: React.FC = () => {
  const {
    route,
    navigate,
    openCatalogWith,
    filters,
    cartCount,
    wishlistIds,
    setIsCartOpen,
  } = useStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCatalogWith({ search: searchInput.trim() });
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const navItems: {
    label: string;
    active: boolean;
    onClick: () => void;
  }[] = [
    {
      label: 'Каталог',
      active: route.page === 'catalog' && !filters.onlyNew && !filters.onlySale,
      onClick: () => openCatalogWith({}),
    },
    {
      label: 'Бренды',
      active: false,
      onClick: () => {
        navigate({ page: 'home' });
        window.setTimeout(() => {
          document.getElementById('brands-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      },
    },
    {
      label: 'Новинки',
      active: route.page === 'catalog' && filters.onlyNew,
      onClick: () => openCatalogWith({ onlyNew: true }),
    },
    {
      label: 'Акции',
      active: route.page === 'catalog' && filters.onlySale,
      onClick: () => openCatalogWith({ onlySale: true }),
    },
    {
      label: 'О нас',
      active: route.page === 'info' && route.section === 'about',
      onClick: () => navigate({ page: 'info', section: 'about' }),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#1C1A1D]/10 bg-[#FBF9F6]/95">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
        {/* Zone 1: Single-line Wordmark */}
        <button
          type="button"
          onClick={() => navigate({ page: 'home' })}
          className="font-display text-xl font-semibold tracking-tight text-[#1C1A1D] whitespace-nowrap shrink-0 hover:text-[#D94A64] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D94A64] sm:text-2xl cursor-pointer"
        >
          Beauty Studio
        </button>

        {/* Zone 2: Single-line Nav Links */}
        <nav aria-label="Основная навигация" className="hidden items-center gap-6 md:flex lg:gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D94A64] cursor-pointer ${
                item.active
                  ? 'text-[#D94A64]'
                  : 'text-[#4B4449] hover:text-[#1C1A1D]'
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#D94A64]" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Поиск по каталогу"
            aria-expanded={searchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1C1A1D] transition-colors duration-150 hover:bg-[#F8EEF0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94A64] cursor-pointer"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={() => navigate({ page: 'wishlist' })}
            aria-label={`Избранное, товаров: ${wishlistIds.length}`}
            className={`relative flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94A64] cursor-pointer ${
              route.page === 'wishlist'
                ? 'bg-[#F8EEF0] text-[#D94A64]'
                : 'text-[#1C1A1D] hover:bg-[#F8EEF0]'
            }`}
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} />
            <span className="tabular-nums text-xs font-semibold">{wishlistIds.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Корзина, товаров: ${cartCount}`}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#1C1A1D] px-3.5 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#D94A64] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94A64] cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.85} />
            <span className="hidden sm:inline">Корзина</span>
            <span className="tabular-nums text-xs font-semibold opacity-90">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1C1A1D] hover:bg-[#F8EEF0] md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#1C1A1D]/10 bg-white px-4 py-3 sm:px-6">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-[1280px] items-center gap-3"
          >
            <Search className="h-4 w-4 shrink-0 text-[#665E64]" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Найти сыворотку, помаду, аромат или бренд..."
              autoFocus
              className="w-full bg-transparent py-1.5 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="text-xs font-medium text-[#665E64] hover:text-[#1C1A1D] whitespace-nowrap cursor-pointer"
              >
                Очистить
              </button>
            )}
            <button
              type="submit"
              className="rounded-lg bg-[#D94A64] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-[#BF3851] cursor-pointer"
            >
              Найти
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#1C1A1D]/10 bg-[#FBF9F6] px-4 py-4 md:hidden">
          <nav aria-label="Мобильное меню" className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                navigate({ page: 'home' });
                setMobileMenuOpen(false);
              }}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Главная
            </button>
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick();
                  setMobileMenuOpen(false);
                }}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  item.active
                    ? 'bg-[#F8EEF0] text-[#D94A64]'
                    : 'text-[#1C1A1D] hover:bg-[#F8EEF0]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                navigate({ page: 'info', section: 'delivery' });
                setMobileMenuOpen(false);
              }}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Доставка и оплата
            </button>
            <button
              type="button"
              onClick={() => {
                navigate({ page: 'info', section: 'faq' });
                setMobileMenuOpen(false);
              }}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Частые вопросы (FAQ)
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
