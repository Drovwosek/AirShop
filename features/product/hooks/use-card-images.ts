"use client";

import { useState, useCallback } from "react";

interface UseCardImagesReturn {
  getImageIndex: (productId: number) => number;
  nextImage: (productId: number, totalImages: number) => void;
  prevImage: (productId: number, totalImages: number) => void;
  setImage: (productId: number, index: number) => void;
}

export function useCardImages(): UseCardImagesReturn {
  const [indexes, setIndexes] = useState<Record<number, number>>({});

  const getImageIndex = useCallback(
    (productId: number) => indexes[productId] || 0,
    [indexes]
  );

  const nextImage = useCallback((productId: number, totalImages: number) => {
    setIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }));
  }, []);

  const prevImage = useCallback((productId: number, totalImages: number) => {
    setIndexes((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] || 0) === 0
          ? totalImages - 1
          : (prev[productId] || 0) - 1,
    }));
  }, []);

  const setImage = useCallback((productId: number, index: number) => {
    setIndexes((prev) => ({
      ...prev,
      [productId]: index,
    }));
  }, []);

  return {
    getImageIndex,
    nextImage,
    prevImage,
    setImage,
  };
}
