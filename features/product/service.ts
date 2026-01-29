import { Product, ProductsResponse, ProductsParams } from "./types";
import { fetchWithErrorHandling } from "@/features/errors/lib";

const API_BASE_URL = "https://dummyjson.com";

/**
 * Загрузка списка товаров с пагинацией
 */
export async function fetchProducts(
  params: ProductsParams
): Promise<ProductsResponse> {
  const { limit, skip, category } = params;

  const baseUrl = category
    ? `${API_BASE_URL}/products/category/${encodeURIComponent(category)}`
    : `${API_BASE_URL}/products`;

  const url = `${baseUrl}?limit=${limit}&skip=${skip}`;

  return fetchWithErrorHandling<ProductsResponse>(url);
}

/**
 * Загрузка товара по ID
 */
export async function fetchProduct(id: number): Promise<Product> {
  return fetchWithErrorHandling<Product>(`${API_BASE_URL}/products/${id}`);
}

/**
 * Поиск товаров
 */
export async function searchProducts(
  query: string,
  limit = 10
): Promise<Product[]> {
  if (!query.trim()) {
    return [];
  }

  const url = `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`;

  const data = await fetchWithErrorHandling<ProductsResponse>(url);
  return data.products;
}
