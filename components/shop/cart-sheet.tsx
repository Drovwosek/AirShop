"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/format";

interface CartSheetProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export function CartSheet({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartSheetProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Корзина пуста</p>
        <p className="text-sm text-muted-foreground mt-1">
          Добавьте товары для оформления заказа
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-3 rounded-lg border border-border p-3"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.product.thumbnail}
                  alt={item.product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-medium line-clamp-2">
                  {item.product.title}
                </p>
                <p className="text-sm font-semibold mt-1">
                  {formatPrice(item.product.price)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SheetFooter className="flex-col gap-4 border-t border-border pt-4 sm:flex-col">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-medium">Итого:</span>
          <span className="text-xl font-bold">{formatPrice(total)}</span>
        </div>
        <Button className="w-full" size="lg" onClick={onCheckout}>
          Оформить заказ
        </Button>
      </SheetFooter>
    </>
  );
}
