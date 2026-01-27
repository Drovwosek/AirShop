import { Product } from "./product";

/**
 * Элемент корзины
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Состояние корзины
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}
