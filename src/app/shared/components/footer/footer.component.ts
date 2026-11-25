import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-[#1C1A1D]/10 bg-white text-[#1C1A1D]">
      <div class="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div class="space-y-4">
            <a
              routerLink="/"
              class="inline-block font-display text-2xl font-semibold tracking-tight text-[#1C1A1D] hover:text-[#D94A64]"
            >
              Beauty Studio
            </a>
            <p class="text-sm leading-relaxed text-[#665E64]">
              Цифровое beauty-пространство на Angular для знакомства с косметикой ухода, декоративными текстурами и парфюмерией.
            </p>
            <p class="text-xs leading-relaxed text-[#8E848A]">
              Демонстрационная витрина MVP: ассортимент, цены и отзывы представлены в тестовом формате.
            </p>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-[#1C1A1D]">Категории каталога</h3>
            <ul class="mt-4 space-y-2.5 text-sm text-[#665E64]">
              @for (cat of productService.categories; track cat.id) {
                <li>
                  <button
                    type="button"
                    (click)="productService.openCatalogWith({ categoryId: cat.id })"
                    class="transition-colors hover:text-[#D94A64] cursor-pointer"
                  >
                    {{ cat.name }}
                  </button>
                </li>
              }
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-[#1C1A1D]">Покупателям</h3>
            <ul class="mt-4 space-y-2.5 text-sm text-[#665E64]">
              <li>
                <button
                  type="button"
                  (click)="productService.openCatalogWith({ onlyNew: true })"
                  class="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Новинки каталога
                </button>
              </li>
              <li>
                <button
                  type="button"
                  (click)="productService.openCatalogWith({ onlyBestseller: true })"
                  class="transition-colors hover:text-[#D94A64] cursor-pointer"
                >
                  Бестселлеры
                </button>
              </li>
              <li>
                <a routerLink="/delivery" class="transition-colors hover:text-[#D94A64]">
                  Доставка и оплата
                </a>
              </li>
              <li>
                <a routerLink="/faq" class="transition-colors hover:text-[#D94A64]">
                  Частые вопросы (FAQ)
                </a>
              </li>
              <li>
                <a routerLink="/about" class="transition-colors hover:text-[#D94A64]">
                  О магазине
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-[#1C1A1D]">Связь и разделы</h3>
            <ul class="mt-4 space-y-2.5 text-sm text-[#665E64]">
              <li>
                <a routerLink="/contacts" class="transition-colors hover:text-[#D94A64]">
                  Контакты студии
                </a>
              </li>
              <li>
                <a routerLink="/wishlist" class="transition-colors hover:text-[#D94A64]">
                  Список избранного
                </a>
              </li>
              <li>
                <a routerLink="/checkout" class="transition-colors hover:text-[#D94A64]">
                  Оформление заказа
                </a>
              </li>
            </ul>
            <p class="mt-4 text-xs text-[#8E848A]">
              Условия обработки персональных данных и оферта добавляются при подключении реального магазина.
            </p>
          </div>
        </div>

        <div class="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#1C1A1D]/10 pt-6 text-xs text-[#8E848A] sm:flex-row sm:items-center">
          <p>© 2026 Beauty Studio. Демонстрационный Angular e-commerce проект.</p>
          <p>{{ productService.allProducts.length }} тестовых позиций · Интерактивная 3D-витрина на Three.js</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly productService = inject(ProductService);
}
