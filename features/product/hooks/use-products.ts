"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, ITEMS_PER_PAGE_OPTIONS } from "../types";
import { fetchProducts } from "../service";
import { ApiError } from "@/features/errors/lib";

interface UseProductsOptions {
  initialLimit?: number;
  category?: string | null;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  apiError: ApiError | null;
  total: number;
  limit: number;
  skip: number;
  currentPage: number;
  totalPages: number;
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  setCategory: (category: string | null) => void;
  selectedCategory: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { initialLimit = ITEMS_PER_PAGE_OPTIONS[0] } = options;

  // Минимум состояния - только source of truth
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    options.category ?? null
  );

  // Вычисляемое значение вместо useState
  const skip = (currentPage - 1) * limit;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", { limit, skip, category: selectedCategory }],
    queryFn: () => fetchProducts({ limit, skip, category: selectedCategory }),
    placeholderData: (prev) => prev, // keepPreviousData для плавной пагинации
  });

  // Вычисляемое значение
  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setCurrentPage(1);
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  return {
    products: data?.products ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    apiError: error ? (error as unknown as ApiError) : null,
    total: data?.total ?? 0,
    limit,
    skip,
    currentPage,
    totalPages,
    setLimit,
    setPage: setCurrentPage,
    setCategory,
    selectedCategory,
    refetch,
  };
}
