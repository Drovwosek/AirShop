"use client";

import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  cartQuantity: number;
  currentImageIndex: number;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onUpdateQuantity: (delta: number) => void;
  onImagePrev: () => void;
  onImageNext: () => void;
  onImageSelect: (index: number) => void;
  onClick: () => void;
}

export function ProductCard({
  product,
  isFavorite,
  cartQuantity,
  currentImageIndex,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  onImagePrev,
  onImageNext,
  onImageSelect,
  onClick,
}: ProductCardProps) {
  const images =
    product.images.length > 0 ? product.images : [product.thumbnail];
  const inCart = cartQuantity > 0;

  return (
    <Card
      className="group relative flex flex-col overflow-hidden p-0 shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={images[currentImageIndex] || product.thumbnail}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Стрелки навигации */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImagePrev();
              }}
              className="absolute left-1 sm:left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1 sm:p-1.5 opacity-100 sm:opacity-0 backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageNext();
              }}
              className="absolute right-1 sm:right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1 sm:p-1.5 opacity-100 sm:opacity-0 backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            {/* Точки-индикаторы */}
            <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 sm:gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageSelect(idx);
                  }}
                  className={cn(
                    "h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full transition-all",
                    idx === currentImageIndex
                      ? "bg-white w-2 sm:w-3"
                      : "bg-white/50 hover:bg-white/75"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Бейдж наличия */}
        <div className="absolute right-1 sm:right-2 top-1 sm:top-2 z-10">
          <Badge
            variant={product.stock > 0 ? "default" : "destructive"}
            className={cn(
              "flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5",
              product.stock > 0
                ? "bg-green-500/90 text-white border-green-500/90"
                : "bg-red-500/90 text-white border-red-500/90"
            )}
          >
            {product.stock > 0 ? (
              <>
                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline sm:inline">В наличии</span>
              </>
            ) : (
              <>
                <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline sm:inline">Нет</span>
              </>
            )}
          </Badge>
        </div>

        {/* Кнопка избранного */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute left-1 sm:left-2 top-1 sm:top-2 z-10 rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )}
          />
        </button>
      </div>

      <CardContent className="flex flex-1 flex-col p-2 sm:p-3 md:p-4">
        <h3 className="mb-1 sm:mb-2 text-sm sm:text-base md:text-lg font-semibold text-card-foreground line-clamp-2">
          {product.title}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-2 sm:pt-3 md:pt-4">
          <span className="text-base sm:text-lg md:text-2xl font-bold text-card-foreground">
            {formatPrice(product.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 pt-0">
        {inCart ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(-1);
              }}
            >
              {cartQuantity === 1 ? (
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
              ) : (
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <span className="w-5 sm:w-6 md:w-8 text-center text-xs sm:text-sm font-semibold">
              {cartQuantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(1);
              }}
              disabled={cartQuantity >= product.stock}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={product.stock <= 0}
            variant={product.stock > 0 ? "default" : "secondary"}
            className={cn(
              "h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm",
              product.stock <= 0 && "opacity-50"
            )}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">В корзину</span>
            <span className="sm:hidden">Купить</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
