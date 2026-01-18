"use client";

import {
  ProductCardSkeleton,
  CategoriesSkeleton,
  DiscountSectionSkeleton,
  SearchResultSkeleton,
  CartItemSkeleton,
  ProductDetailSkeleton,
  PageSkeleton,
} from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SkeletonsDemo() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">
            Демонстрация скелетонов
          </h1>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Page Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Скелетон полной страницы</h2>
          <p className="text-muted-foreground mb-4">
            Показывается при первой загрузке приложения вместо текста "Загрузка..."
          </p>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="relative" style={{ height: "600px", overflow: "auto" }}>
              <PageSkeleton />
            </div>
          </div>
        </section>

        {/* Categories Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Скелетон категорий</h2>
          <p className="text-muted-foreground mb-4">
            Используется при загрузке списка категорий товаров
          </p>
          <div className="p-4 border border-border rounded-lg bg-card">
            <CategoriesSkeleton />
          </div>
        </section>

        {/* Search Result Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Скелетон результатов поиска</h2>
          <p className="text-muted-foreground mb-4">
            Показывается в выпадающем списке во время поиска товаров
          </p>
          <div className="p-4 border border-border rounded-lg bg-card max-w-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Product Card Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Скелетон карточки товара</h2>
          <p className="text-muted-foreground mb-4">
            Отображается в основной сетке товаров во время загрузки
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Discount Section Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Скелетон секции скидок</h2>
          <p className="text-muted-foreground mb-4">
            Показывается при первой загрузке страницы для секции товаров со скидками
          </p>
          <DiscountSectionSkeleton />
        </section>

        {/* Cart Item Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Скелетон товара в корзине</h2>
          <p className="text-muted-foreground mb-4">
            Может использоваться при загрузке корзины (для будущих улучшений)
          </p>
          <div className="max-w-md space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Product Detail Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Скелетон детальной информации о товаре
          </h2>
          <p className="text-muted-foreground mb-4">
            Может использоваться при открытии модального окна товара (для будущих
            улучшений)
          </p>
          <div className="border border-border rounded-lg bg-card max-w-4xl overflow-hidden">
            <ProductDetailSkeleton />
          </div>
        </section>

        {/* Animation Info */}
        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Особенности анимации</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Все скелетоны используют кастомную анимацию <strong>shimmer</strong> -
              эффект мерцающей волны, которая плавно проходит по элементу слева
              направо.
            </p>
            <p>
              Анимация повторяется каждые 2 секунды, создавая живое и динамичное
              ощущение загрузки контента.
            </p>
            <p>
              Это более современный и приятный подход по сравнению с простой
              пульсацией opacity.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
