"use client";

import { Product } from "@/features/product";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "@/components/skeletons";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  skeletonCount: number;
  isFavorite: (productId: number) => boolean;
  getCartQuantity: (productId: number) => number;
  getImageIndex: (productId: number) => number;
  onToggleFavorite: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onImagePrev: (productId: number, totalImages: number) => void;
  onImageNext: (productId: number, totalImages: number) => void;
  onImageSelect: (productId: number, index: number) => void;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading,
  skeletonCount,
  isFavorite,
  getCartQuantity,
  getImageIndex,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  onImagePrev,
  onImageNext,
  onImageSelect,
  onProductClick,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const images =
          product.images.length > 0 ? product.images : [product.thumbnail];
        return (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={isFavorite(product.id)}
            cartQuantity={getCartQuantity(product.id)}
            currentImageIndex={getImageIndex(product.id)}
            onToggleFavorite={() => onToggleFavorite(product.id)}
            onAddToCart={() => onAddToCart(product)}
            onUpdateQuantity={(delta) => onUpdateQuantity(product.id, delta)}
            onImagePrev={() => onImagePrev(product.id, images.length)}
            onImageNext={() => onImageNext(product.id, images.length)}
            onImageSelect={(index) => onImageSelect(product.id, index)}
            onClick={() => onProductClick(product)}
          />
        );
      })}
    </div>
  );
}
