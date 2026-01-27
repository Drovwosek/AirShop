"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

interface ProductPriceSectionProps {
  price: number;
  discountPercentage: number;
  stock: number;
}

export function ProductPriceSection({
  price,
  discountPercentage,
  stock,
}: ProductPriceSectionProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
      <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
        {formatPrice(price)}
      </span>
      {discountPercentage > 0 && (
        <Badge variant="destructive" className="text-xs sm:text-sm">
          -{Math.round(discountPercentage)}%
        </Badge>
      )}
      <Badge
        variant={stock > 0 ? "default" : "destructive"}
        className={cn(
          "flex items-center gap-1 text-xs sm:text-sm",
          stock > 0
            ? "bg-green-500/90 text-white border-green-500/90"
            : "bg-red-500/90 text-white border-red-500/90"
        )}
      >
        {stock > 0 ? (
          <>
            <CheckCircle2 className="h-3 w-3" />
            <span className="hidden sm:inline">В наличии ({stock} шт.)</span>
            <span className="sm:hidden">Есть</span>
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3" />
            <span>Нет в наличии</span>
          </>
        )}
      </Badge>
    </div>
  );
}
