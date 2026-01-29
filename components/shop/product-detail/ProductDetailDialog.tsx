"use client";

import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Product } from "@/features/product";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { ProductPriceSection } from "./ProductPriceSection";
import { ProductActionsSection } from "./ProductActionsSection";
import { ProductSpecsTable } from "./ProductSpecsTable";
import { ProductReviews } from "./ProductReviews";

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  currentImageIndex: number;
  isFavorite: boolean;
  cartQuantity: number;
  onClose: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  onSetImageIndex: (index: number) => void;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onUpdateQuantity: (delta: number) => void;
  onBuyOneClick: () => void;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={cn(
        "h-4 w-4",
        i < Math.round(rating)
          ? "fill-amber-400 text-amber-400"
          : "fill-muted text-muted"
      )}
    />
  ));
}

export function ProductDetailDialog({
  product,
  isOpen,
  currentImageIndex,
  isFavorite,
  cartQuantity,
  onClose,
  onNextImage,
  onPrevImage,
  onSetImageIndex,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  onBuyOneClick,
}: ProductDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto p-0 w-[95vw] sm:w-full"
        showCloseButton={false}
      >
        {product && (
          <div className="flex flex-col">
            {/* Кнопка "Назад" */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-2 sm:p-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm sm:text-base">Назад</span>
              </Button>
            </div>

            <ProductImageCarousel
              images={product.images}
              thumbnail={product.thumbnail}
              title={product.title}
              currentIndex={currentImageIndex}
              onNext={onNextImage}
              onPrev={onPrevImage}
              onSelect={onSetImageIndex}
            />

            <div className="p-3 sm:p-4 md:p-6">
              <DialogHeader className="mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold">
                      {product.title}
                    </DialogTitle>
                    {product.brand && (
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        Бренд: <span className="font-medium">{product.brand}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                    <span className="ml-1 text-xs sm:text-sm text-muted-foreground">
                      ({product.rating.toFixed(1)})
                    </span>
                  </div>
                </div>
              </DialogHeader>

              <ProductPriceSection
                price={product.price}
                discountPercentage={product.discountPercentage}
                stock={product.stock}
              />

              <ProductActionsSection
                stock={product.stock}
                cartQuantity={cartQuantity}
                isFavorite={isFavorite}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
                onToggleFavorite={onToggleFavorite}
                onBuyOneClick={onBuyOneClick}
              />

              {/* Описание */}
              <div className="mb-4 sm:mb-6">
                <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold">
                  Описание
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <ProductSpecsTable product={product} />

              <ProductReviews reviews={product.reviews || []} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
