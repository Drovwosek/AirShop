import { Product, ProductsResponse, ProductsParams } from "@/types/product";
import { fetchWithErrorHandling } from "@/lib/errors";

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
 * Загрузка списка категорий
 */
export async function fetchCategories(): Promise<string[]> {
  const data = await fetchWithErrorHandling<unknown[]>(
    `${API_BASE_URL}/products/categories`
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    if (typeof item === "string") {
      return item;
    }
    if (typeof item === "object" && item !== null) {
      if ("name" in item && typeof item.name === "string") {
        return item.name;
      }
      if ("slug" in item && typeof item.slug === "string") {
        return item.slug;
      }
      if ("title" in item && typeof item.title === "string") {
        return item.title;
      }
    }
    return String(item);
  });
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

/**
 * Загрузка товара по ID
 */
export async function fetchProduct(id: number): Promise<Product> {
  return fetchWithErrorHandling<Product>(`${API_BASE_URL}/products/${id}`);
}
