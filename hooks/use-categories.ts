"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/products";

interface UseCategoriesReturn {
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCategories(): UseCategoriesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30 минут - категории меняются редко
  });

  return {
    categories: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
