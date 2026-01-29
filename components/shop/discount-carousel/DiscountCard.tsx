"use client";

import { forwardRef } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Heart,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Product } from "@/features/product";
import {
  formatPrice,
  calculateVisualDiscount,
  calculateDiscountedPrice,
} from "@/lib/format";

interface DiscountCardProps {
  product: Product;
  isFavorite: boolean;
  cartQuantity: number;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onUpdateQuantity: (delta: number) => void;
  onClick: () => void;
}

export const DiscountCard = forwardRef<HTMLDivElement, DiscountCardProps>(
  function DiscountCard(
    {
      product,
      isFavorite,
      cartQuantity,
      onToggleFavorite,
      onAddToCart,
      onUpdateQuantity,
      onClick,
    },
    ref
  ) {
    const visualDiscount = calculateVisualDiscount(
      product.discountPercentage,
      product.rating
    );
    const discountedPrice = calculateDiscountedPrice(
      product.price,
      visualDiscount
    );
    const inCart = cartQuantity > 0;

    return (
      <Card
        ref={ref}
        className="w-[75%] sm:w-[48%] md:w-[45%] lg:w-[30%] xl:w-[23%] shrink-0 snap-start cursor-pointer group relative flex flex-col overflow-hidden p-0 shadow-sm transition-all hover:shadow-lg"
        onClick={onClick}
      >
        {/* Изображение товара */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Бейдж скидки */}
          <Badge className="absolute left-2 sm:left-3 top-2 sm:top-3 border-red-500 bg-red-500 text-white text-sm font-semibold shadow-lg">
            -{visualDiscount}%
          </Badge>

          {/* Бейдж наличия */}
          <div className="absolute right-2 sm:right-3 top-2 sm:top-3">
            <Badge
              variant={product.stock > 0 ? "default" : "destructive"}
              className={cn(
                "flex items-center gap-1 backdrop-blur-sm",
                product.stock > 0
                  ? "bg-green-500/90 text-white border-green-500/90"
                  : "bg-red-500/90 text-white border-red-500/90"
              )}
            >
              {product.stock > 0 ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden sm:inline">В наличии</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Нет</span>
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
            className="absolute left-2 sm:left-3 bottom-2 sm:bottom-3 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              )}
            />
          </button>
        </div>

        {/* Контент карточки */}
        <CardContent className="flex flex-1 flex-col p-3 sm:p-4">
          <h4 className="mb-2 text-base sm:text-lg font-semibold text-card-foreground line-clamp-2">
            {product.title}
          </h4>

          {/* Цены */}
          <div className="mt-auto space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-card-foreground">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </div>
            <p className="text-xs text-green-600 font-medium">
              Экономия {formatPrice(product.price - discountedPrice)}
            </p>
          </div>
        </CardContent>

        {/* Футер с кнопками */}
        <CardFooter className="flex items-center justify-between gap-2 p-3 sm:p-4 pt-0">
          {inCart ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(-1);
                }}
              >
                {cartQuantity === 1 ? (
                  <Trash2 className="h-4 w-4 text-destructive" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </Button>
              <span className="w-8 text-center font-semibold">
                {cartQuantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(1);
                }}
                disabled={cartQuantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={product.stock <= 0}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              В корзину
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
);
