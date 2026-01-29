"use client";

import { useState, useCallback } from "react";
import { Product } from "../types";
import { toast } from "sonner";

interface UseProductDetailReturn {
  selectedProduct: Product | null;
  currentImageIndex: number;
  isOpen: boolean;
  open: (product: Product) => void;
  close: () => void;
  nextImage: () => void;
  prevImage: () => void;
  setImageIndex: (index: number) => void;
  buyOneClick: (onComplete?: () => void) => void;
}

export function useProductDetail(): UseProductDetailReturn {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const open = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  }, []);

  const close = useCallback(() => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  }, []);

  const nextImage = useCallback(() => {
    if (selectedProduct) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [selectedProduct]);

  const prevImage = useCallback(() => {
    if (selectedProduct) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  }, [selectedProduct]);

  const setImageIndex = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  const buyOneClick = useCallback(
    (onComplete?: () => void) => {
      if (selectedProduct) {
        toast.success("Заказ оформлен!", {
          description: `${selectedProduct.title} — ${selectedProduct.price.toLocaleString("ru-RU")} ₽`,
        });
        close();
        onComplete?.();
      }
    },
    [selectedProduct, close]
  );

  return {
    selectedProduct,
    currentImageIndex,
    isOpen: !!selectedProduct,
    open,
    close,
    nextImage,
    prevImage,
    setImageIndex,
    buyOneClick,
  };
}
