"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/features/product";
import { DiscountSectionSkeleton } from "@/components/skeletons";
import { DiscountCard } from "./DiscountCard";
import { CarouselControls } from "./CarouselControls";
import { CarouselIndicators } from "./CarouselIndicators";

interface DiscountCarouselProps {
  products: Product[];
  loading: boolean;
  isFavorite: (productId: number) => boolean;
  getCartQuantity: (productId: number) => number;
  onToggleFavorite: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onProductClick: (product: Product) => void;
}

const DISCOUNT_ITEMS = 8;

export function DiscountCarousel({
  products,
  loading,
  isFavorite,
  getCartQuantity,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  onProductClick,
}: DiscountCarouselProps) {
  const [discountIndex, setDiscountIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const discountProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, DISCOUNT_ITEMS);

  // Автопрокрутка
  useEffect(() => {
    if (discountProducts.length < 2) return;

    const intervalId = setInterval(() => {
      setDiscountIndex((prev) => (prev + 1) % discountProducts.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, [discountProducts.length]);

  // Коррекция индекса при изменении длины
  useEffect(() => {
    if (discountIndex >= discountProducts.length) {
      setDiscountIndex(0);
    }
  }, [discountIndex, discountProducts.length]);

  // Скролл к текущему элементу
  useEffect(() => {
    const target = itemRefs.current[discountIndex];
    const container = carouselRef.current;
    if (target && container) {
      container.scrollTo({
        left: target.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });
    }
  }, [discountIndex]);

  const nextDiscount = () => {
    if (discountProducts.length === 0) return;
    setDiscountIndex((prev) => (prev + 1) % discountProducts.length);
  };

  const prevDiscount = () => {
    if (discountProducts.length === 0) return;
    setDiscountIndex((prev) =>
      prev === 0 ? discountProducts.length - 1 : prev - 1
    );
  };

  if (loading && products.length === 0) {
    return <DiscountSectionSkeleton />;
  }

  if (!loading && discountProducts.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 sm:mb-10">
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className="text-lg sm:text-2xl font-bold text-foreground">
            Скидки
          </h3>
          <Badge className="border-amber-500 bg-amber-500 text-white text-xs sm:text-sm">
            <span className="hidden sm:inline">Товары со скидками</span>
            <span className="sm:hidden">Акция</span>
          </Badge>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-card">
        <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-4 overflow-x-auto px-2 sm:px-4 pb-8 sm:pb-10 pt-2 sm:pt-4 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {discountProducts.map((product, index) => (
            <DiscountCard
              key={product.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              product={product}
              isFavorite={isFavorite(product.id)}
              cartQuantity={getCartQuantity(product.id)}
              onToggleFavorite={() => onToggleFavorite(product.id)}
              onAddToCart={() => onAddToCart(product)}
              onUpdateQuantity={(delta) => onUpdateQuantity(product.id, delta)}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>

        {discountProducts.length > 1 && (
          <>
            <CarouselControls onPrev={prevDiscount} onNext={nextDiscount} />
            <CarouselIndicators
              count={discountProducts.length}
              currentIndex={discountIndex}
              onSelect={setDiscountIndex}
            />
          </>
        )}
      </div>
    </section>
  );
}
