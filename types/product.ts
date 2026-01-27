/**
 * Отзыв о товаре
 */
export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

/**
 * Товар
 */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  reviews?: Review[];
}

/**
 * Ответ API со списком товаров
 */
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Параметры запроса товаров
 */
export interface ProductsParams {
  limit: number;
  skip: number;
  category?: string | null;
}

/**
 * Опции количества товаров на странице
 */
export const ITEMS_PER_PAGE_OPTIONS = [10, 24, 48] as const;
export type ItemsPerPage = (typeof ITEMS_PER_PAGE_OPTIONS)[number];
