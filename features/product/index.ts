// Types
export type {
  Product,
  Review,
  ProductsResponse,
  ProductsParams,
  ItemsPerPage,
} from "./types";
export { ITEMS_PER_PAGE_OPTIONS } from "./types";

// Service
export {
  fetchProducts,
  fetchProduct,
  searchProducts,
} from "./service";

// Hooks
export { useProducts, useProductDetail, useCardImages } from "./hooks";
