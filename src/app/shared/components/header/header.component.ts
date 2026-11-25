import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <header class="sticky top-0 z-40 border-b border-[#1C1A1D]/10 bg-[#FBF9F6]/95">
      <div class="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <!-- Zone 1: Single-line Wordmark -->
        <a
          routerLink="/"
          class="font-display text-xl font-semibold tracking-tight text-[#1C1A1D] whitespace-nowrap shrink-0 hover:text-[#D94A64] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D94A64] sm:text-2xl"
        >
          Beauty Studio
        </a>

        <!-- Zone 2: Single-line Nav Links -->
        <nav aria-label="Основная навигация" class="hidden items-center gap-6 md:flex lg:gap-8">
          <button
            type="button"
            (click)="openCatalogAll()"
            class="relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer"
            [class]="isCatalogAllActive() ? 'text-[#D94A64]' : 'text-[#4B4449] hover:text-[#1C1A1D]'"
          >
            Каталог
            @if (isCatalogAllActive()) {
              <span class="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#D94A64]"></span>
            }
          </button>

          <button
            type="button"
            (click)="scrollToBrands()"
            class="relative py-1 text-sm font-medium text-[#4B4449] whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#1C1A1D] cursor-pointer"
          >
            Бренды
          </button>

          <button
            type="button"
            (click)="productService.openCatalogWith({ onlyNew: true })"
            class="relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer"
            [class]="isNewActive() ? 'text-[#D94A64]' : 'text-[#4B4449] hover:text-[#1C1A1D]'"
          >
            Новинки
            @if (isNewActive()) {
              <span class="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#D94A64]"></span>
            }
          </button>

          <button
            type="button"
            (click)="productService.openCatalogWith({ onlySale: true })"
            class="relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer"
            [class]="isSaleActive() ? 'text-[#D94A64]' : 'text-[#4B4449] hover:text-[#1C1A1D]'"
          >
            Акции
            @if (isSaleActive()) {
              <span class="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#D94A64]"></span>
            }
          </button>

          <a
            routerLink="/about"
            class="relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150"
            [class]="router.url.startsWith('/about') ? 'text-[#D94A64]' : 'text-[#4B4449] hover:text-[#1C1A1D]'"
          >
            О нас
            @if (router.url.startsWith('/about')) {
              <span class="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#D94A64]"></span>
            }
          </a>
        </nav>

        <!-- Zone 3: Actions -->
        <div class="flex items-center gap-2 shrink-0 sm:gap-3">
          <button
            type="button"
            (click)="toggleSearch()"
            aria-label="Поиск по каталогу"
            [attr.aria-expanded]="searchOpen()"
            class="flex h-10 w-10 items-center justify-center rounded-lg text-[#1C1A1D] transition-colors duration-150 hover:bg-[#F8EEF0] cursor-pointer"
          >
            <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <a
            routerLink="/wishlist"
            [attr.aria-label]="'Избранное, товаров: ' + wishlistService.count()"
            class="relative flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150"
            [class]="router.url.startsWith('/wishlist') ? 'bg-[#F8EEF0] text-[#D94A64]' : 'text-[#1C1A1D] hover:bg-[#F8EEF0]'"
          >
            <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span class="tabular-nums text-xs font-semibold">{{ wishlistService.count() }}</span>
          </a>

          <button
            type="button"
            (click)="cartService.openDrawer()"
            [attr.aria-label]="'Корзина, товаров: ' + cartService.totalCount()"
            class="flex h-10 items-center gap-2 rounded-lg bg-[#1C1A1D] px-3.5 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#D94A64] cursor-pointer"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span class="hidden sm:inline">Корзина</span>
            <span class="tabular-nums text-xs font-semibold opacity-90">
              {{ cartService.totalCount() }}
            </span>
          </button>

          <button
            type="button"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            [attr.aria-label]="mobileMenuOpen() ? 'Закрыть меню' : 'Открыть меню'"
            [attr.aria-expanded]="mobileMenuOpen()"
            class="flex h-10 w-10 items-center justify-center rounded-lg text-[#1C1A1D] hover:bg-[#F8EEF0] md:hidden cursor-pointer"
          >
            @if (mobileMenuOpen()) {
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            } @else {
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          </button>
        </div>
      </div>

      @if (searchOpen()) {
        <div class="border-t border-[#1C1A1D]/10 bg-white px-4 py-3 sm:px-6">
          <form (ngSubmit)="submitSearch()" class="mx-auto flex max-w-[1280px] items-center gap-3">
            <svg class="h-4 w-4 shrink-0 text-[#665E64]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              name="headerSearch"
              [(ngModel)]="searchInput"
              placeholder="Найти сыворотку, помаду, аромат или бренд..."
              class="w-full bg-transparent py-1.5 text-sm text-[#1C1A1D] placeholder:text-[#8E848A] focus:outline-none"
            />
            @if (searchInput) {
              <button
                type="button"
                (click)="searchInput = ''"
                class="text-xs font-medium text-[#665E64] hover:text-[#1C1A1D] whitespace-nowrap cursor-pointer"
              >
                Очистить
              </button>
            }
            <button
              type="submit"
              class="rounded-lg bg-[#D94A64] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 hover:bg-[#BF3851] cursor-pointer"
            >
              Найти
            </button>
          </form>
        </div>
      }

      @if (mobileMenuOpen()) {
        <div class="border-t border-[#1C1A1D]/10 bg-[#FBF9F6] px-4 py-4 md:hidden">
          <nav aria-label="Мобильное меню" class="flex flex-col gap-1">
            <a
              routerLink="/"
              (click)="mobileMenuOpen.set(false)"
              class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Главная
            </a>
            <button
              type="button"
              (click)="openCatalogAll(); mobileMenuOpen.set(false)"
              class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Каталог
            </button>
            <button
              type="button"
              (click)="productService.openCatalogWith({ onlyNew: true }); mobileMenuOpen.set(false)"
              class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Новинки
            </button>
            <button
              type="button"
              (click)="productService.openCatalogWith({ onlySale: true }); mobileMenuOpen.set(false)"
              class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Акции
            </button>
            <a
              routerLink="/about"
              (click)="mobileMenuOpen.set(false)"
              class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              О нас
            </a>
            <a
              routerLink="/delivery"
              (click)="mobileMenuOpen.set(false)"
              class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Доставка и оплата
            </a>
            <a
              routerLink="/faq"
              (click)="mobileMenuOpen.set(false)"
              class="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1C1A1D] hover:bg-[#F8EEF0]"
            >
              Частые вопросы (FAQ)
            </a>
          </nav>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  readonly router = inject(Router);
  readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  readonly searchOpen = signal(false);
  readonly mobileMenuOpen = signal(false);
  searchInput = '';

  isCatalogAllActive(): boolean {
    return (
      this.router.url.startsWith('/catalog') &&
      !this.productService.filters().onlyNew &&
      !this.productService.filters().onlySale
    );
  }

  isNewActive(): boolean {
    return this.router.url.startsWith('/catalog') && this.productService.filters().onlyNew;
  }

  isSaleActive(): boolean {
    return this.router.url.startsWith('/catalog') && this.productService.filters().onlySale;
  }

  openCatalogAll(): void {
    this.productService.openCatalogWith({});
  }

  toggleSearch(): void {
    this.searchInput = this.productService.filters().search;
    this.searchOpen.update((v) => !v);
  }

  submitSearch(): void {
    this.productService.openCatalogWith({ search: this.searchInput.trim() });
    this.searchOpen.set(false);
    this.mobileMenuOpen.set(false);
  }

  scrollToBrands(): void {
    void this.router.navigate(['/']).then(() => {
      window.setTimeout(() => {
        document.getElementById('brands-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    });
  }
}
