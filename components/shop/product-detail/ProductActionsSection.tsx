"use client";

import { Heart, Minus, Plus, Trash2, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductActionsSectionProps {
  stock: number;
  cartQuantity: number;
  isFavorite: boolean;
  onAddToCart: () => void;
  onUpdateQuantity: (delta: number) => void;
  onToggleFavorite: () => void;
  onBuyOneClick: () => void;
}

export function ProductActionsSection({
  stock,
  cartQuantity,
  isFavorite,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavorite,
  onBuyOneClick,
}: ProductActionsSectionProps) {
  const inCart = cartQuantity > 0;

  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
      {inCart ? (
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 sm:p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => onUpdateQuantity(-1)}
          >
            {cartQuantity === 1 ? (
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            ) : (
              <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
          <span className="w-8 sm:w-12 text-center text-base sm:text-lg font-semibold">
            {cartQuantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => onUpdateQuantity(1)}
            disabled={cartQuantity >= stock}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          onClick={onAddToCart}
          disabled={stock <= 0}
          className="flex-1 sm:flex-none h-9 sm:h-10 md:h-11 text-sm sm:text-base"
        >
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
          В корзину
        </Button>
      )}
      <Button
        size="lg"
        variant="secondary"
        onClick={onBuyOneClick}
        disabled={stock <= 0}
        className="flex-1 sm:flex-none bg-amber-500 text-white hover:bg-amber-600 h-9 sm:h-10 md:h-11 text-sm sm:text-base"
      >
        <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
        <span className="hidden sm:inline">Купить в один клик</span>
        <span className="sm:hidden">Быстрая покупка</span>
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={onToggleFavorite}
        className={cn(
          "h-9 sm:h-10 md:h-11 w-9 sm:w-10 md:w-11 p-0",
          isFavorite && "border-red-500 text-red-500 hover:bg-red-50"
        )}
      >
        <Heart
          className={cn("h-4 w-4 sm:h-5 sm:w-5", isFavorite && "fill-red-500")}
        />
      </Button>
    </div>
  );
}
