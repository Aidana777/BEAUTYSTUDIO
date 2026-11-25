import { BrandInfo, Category } from '../models/shop.models';

export const CATEGORY_IMAGES = {
  skincare: '/src/assets/images/skincare_serum_studio_1795614810328.jpg',
  makeup: '/src/assets/images/makeup_velvet_lipstick_1795614810343.jpg',
  bodycare: '/src/assets/images/bodycare_silk_lotion_1795614812336.jpg',
  haircare: '/src/assets/images/haircare_elixir_bottle_1795614810772.jpg',
  fragrance: '/src/assets/images/fragrance_crystal_flacon_1795614810848.jpg',
  sets: '/src/assets/images/giftset_beauty_coffret_1795614811913.jpg',
};

export const CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'face-care',
    name: 'Уход за лицом',
    subtitle: 'Ежедневный уход и сияние',
    image: CATEGORY_IMAGES.skincare,
    subcategories: [
      { id: 'cleansing', name: 'Очищение' },
      { id: 'toners', name: 'Тоники и эссенции' },
      { id: 'serums', name: 'Сыворотки' },
      { id: 'creams', name: 'Кремы' },
      { id: 'masks', name: 'Маски' },
      { id: 'eye-care', name: 'Уход за кожей вокруг глаз' },
      { id: 'spf', name: 'SPF' },
    ],
  },
  {
    id: 2,
    slug: 'makeup',
    name: 'Макияж',
    subtitle: 'Цвет, настроение и самовыражение',
    image: CATEGORY_IMAGES.makeup,
    subcategories: [
      { id: 'foundation', name: 'Тональные средства' },
      { id: 'concealer', name: 'Консилеры' },
      { id: 'powder', name: 'Пудры' },
      { id: 'blush-bronzer', name: 'Румяна и бронзеры' },
      { id: 'highlighter', name: 'Хайлайтеры' },
      { id: 'eyeshadow', name: 'Тени' },
      { id: 'mascara', name: 'Тушь' },
      { id: 'lips', name: 'Помады и блески' },
    ],
  },
  {
    id: 3,
    slug: 'body-care',
    name: 'Уход за телом',
    subtitle: 'Мягкость и забота',
    image: CATEGORY_IMAGES.bodycare,
    subcategories: [
      { id: 'body-creams', name: 'Кремы и лосьоны' },
      { id: 'scrubs', name: 'Скрабы' },
      { id: 'shower-gels', name: 'Гели для душа' },
      { id: 'body-oils', name: 'Масла' },
    ],
  },
  {
    id: 4,
    slug: 'hair-care',
    name: 'Уход за волосами',
    subtitle: 'Красота в каждом движении',
    image: CATEGORY_IMAGES.haircare,
    subcategories: [
      { id: 'shampoos', name: 'Шампуни' },
      { id: 'conditioners', name: 'Кондиционеры' },
      { id: 'hair-masks', name: 'Маски' },
      { id: 'hair-oils', name: 'Масла и сыворотки' },
      { id: 'styling', name: 'Стайлинг' },
    ],
  },
  {
    id: 5,
    slug: 'fragrance',
    name: 'Парфюмерия',
    subtitle: 'Ароматы с характером',
    image: CATEGORY_IMAGES.fragrance,
    subcategories: [
      { id: 'women-perfume', name: 'Женские ароматы' },
      { id: 'men-perfume', name: 'Мужские ароматы' },
      { id: 'unisex-perfume', name: 'Унисекс' },
    ],
  },
  {
    id: 6,
    slug: 'gift-sets',
    name: 'Наборы и подарки',
    subtitle: 'Подарки для особенных моментов',
    image: CATEGORY_IMAGES.sets,
    subcategories: [{ id: 'coffrets', name: 'Подарочные наборы' }],
  },
];

export const BRANDS: BrandInfo[] = [
  {
    id: 'aura-luxe',
    name: 'Aura Luxe',
    origin: 'Демо-бренд · Уход за лицом',
    specialty: 'Сыворотки, кремы с церамидами и деликатное очищение',
    description:
      'Минималистичные формулы на основе гиалуроновой кислоты, пептидов и ниацинамида для базового ежедневного ухода.',
  },
  {
    id: 'velvet-bloom',
    name: 'Velvet Bloom',
    origin: 'Демо-бренд · Декоративная косметика',
    specialty: 'Помады, румяна, кремовые текстуры и тональные флюиды',
    description:
      'Выразительные оттенки с сатиновым и бархатным финишем, созданные для естественного и вечернего макияжа.',
  },
  {
    id: 'aether-botanica',
    name: 'Aether Botanica',
    origin: 'Демо-бренд · Волосы и тело',
    specialty: 'Масла для волос, бессульфатные шампуни и лосьоны',
    description:
      'Ботанические комплексы с экстрактом лаванды, камелии и масла ши для мягкого восстановления волос и кожи.',
  },
  {
    id: 'maison-rose',
    name: 'Maison Rosé',
    origin: 'Демо-бренд · Парфюмерия',
    specialty: 'Цветочные, древесные и мускусные композиции',
    description:
      'Коллекция парфюмерных вод с многослойным раскрытием нот бергамота, дамасской розы, амбры и кедра.',
  },
  {
    id: 'solenne',
    name: 'Solenne Lab',
    origin: 'Демо-бренд · Защита и восстановление',
    specialty: 'SPF-флюиды, антиоксиданты и уход за кожей вокруг глаз',
    description:
      'Лёгкие некомедогенные текстуры для ежедневной фотозащиты и поддержания комфортного баланса кожи.',
  },
  {
    id: 'kuro-studio',
    name: 'Kuro Atelier',
    origin: 'Демо-бренд · Наборы и унисекс-уход',
    specialty: 'Подарочные сеты, скрабы и унисекс-ароматы',
    description:
      'Продуманные комплекты для домашнего спа-ритуала и лаконичные ароматы в стекле.',
  },
];
