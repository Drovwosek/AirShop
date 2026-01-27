"use client";

import { useState, useRef, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { searchProducts } from "@/services/products";

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  results: Product[];
  loading: boolean;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  clearSearch: () => void;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // useDeferredValue для debounce эффекта
  const debouncedQuery = useDeferredValue(query);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60 * 1000, // 1 минута
  });

  const clearSearch = () => {
    setQuery("");
    setIsFocused(false);
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    results: data ?? [],
    loading: isLoading,
    isFocused,
    setIsFocused,
    inputRef,
    clearSearch,
  };
}
