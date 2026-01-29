"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseFavoritesReturn {
  favorites: number[];
  toggle: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  clear: () => void;
}

export function useFavorites(): UseFavoritesReturn {
  // Используем Set для O(1) lookup вместо O(n) при Array.includes()
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());

  const toggle = useCallback((productId: number) => {
    setFavoritesSet((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        toast.info("Удалено из избранного");
      } else {
        next.add(productId);
        toast.success("Добавлено в избранное");
      }
      return next;
    });
  }, []);

  // O(1) проверка вместо O(n)
  const isFavorite = useCallback(
    (productId: number) => favoritesSet.has(productId),
    [favoritesSet]
  );

  const clear = useCallback(() => {
    setFavoritesSet(new Set());
  }, []);

  return {
    // Конвертируем в массив для обратной совместимости
    favorites: Array.from(favoritesSet),
    toggle,
    isFavorite,
    clear,
  };
}
