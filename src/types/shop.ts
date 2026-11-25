export type ModelSilhouette =
  | 'serum'
  | 'cream'
  | 'lipstick'
  | 'fragrance'
  | 'lotion'
  | 'elixir';

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  hex?: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  categoryId: number;
  subcategory: string;
  productType: string;
  purpose: string;
  description: string;
  usage: string;
  features: string[];
  price: number;
  oldPrice?: number;
  image: string;
  gallery: string[];
  volume: string;
  ingredients: string[];
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
  isDemoData: boolean;
  variants?: ProductVariant[];
  has3dModel?: boolean;
  modelSilhouette?: ModelSilhouette;
  modelColorHex?: string;
  accentColorHex?: string;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  image: string;
  subcategories: Subcategory[];
}

export interface BrandInfo {
  id: string;
  name: string;
  origin: string;
  description: string;
  specialty: string;
}

export interface CartItem {
  key: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export type SortOption =
  | 'popular'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'discount';

export interface FilterState {
  search: string;
  categoryId: number | null;
  subcategory: string | null;
  brands: string[];
  productType: string | null;
  purpose: string | null;
  volume: string | null;
  priceMin: number | null;
  priceMax: number | null;
  inStockOnly: boolean;
  onlyNew: boolean;
  onlyBestseller: boolean;
  onlySale: boolean;
}

export type DeliveryMethod = 'delivery' | 'pickup';

export interface OrderRecord {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  comment: string;
  paymentMethod: string;
  items: {
    productId: number;
    name: string;
    brand: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  totalAmount: number;
}

export type AppRoute =
  | { page: 'home' }
  | { page: 'catalog' }
  | { page: 'product'; productId: number }
  | { page: 'wishlist' }
  | { page: 'checkout' }
  | { page: 'info'; section: 'about' | 'delivery' | 'contacts' | 'faq' };
