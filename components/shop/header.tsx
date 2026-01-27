"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { CartSheet } from "./cart-sheet";
import { CartItem } from "@/types/cart";

interface HeaderProps {
  cartItemsCount: number;
  cartTotal: number;
  cartItems: CartItem[];
  isCartOpen: boolean;
  onCartOpenChange: (open: boolean) => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export function Header({
  cartItemsCount,
  cartTotal,
  cartItems,
  isCartOpen,
  onCartOpenChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">AirShop</h1>
          {process.env.NODE_ENV === "development" && (
            <div className="flex gap-2">
              <a
                href="/skeletons-demo"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                [Skeletons Demo]
              </a>
              <a
                href="/errors-demo"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                [Errors Demo]
              </a>
            </div>
          )}
        </div>

        <Sheet open={isCartOpen} onOpenChange={onCartOpenChange}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Корзина ({cartItemsCount})</SheetTitle>
            </SheetHeader>
            <CartSheet
              items={cartItems}
              total={cartTotal}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              onCheckout={onClearCart}
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
