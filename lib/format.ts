/**
 * Форматирование цены в рублях
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU") + " ₽";
}

/**
 * Форматирование даты
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Вычисление визуальной скидки
 */
export function calculateVisualDiscount(
  discountPercentage: number,
  rating: number
): number {
  if (discountPercentage > 0) {
    return Math.round(discountPercentage);
  }
  return Math.min(25, Math.max(5, Math.round(rating * 3)));
}

/**
 * Вычисление цены со скидкой
 */
export function calculateDiscountedPrice(
  price: number,
  discountPercent: number
): number {
  return Math.round(price * (1 - discountPercent / 100));
}
