import { fetchWithErrorHandling } from "@/features/errors/lib";

const API_BASE_URL = "https://dummyjson.com";

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
