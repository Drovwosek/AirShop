import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Скелетон для карточки товара
export function ProductCardSkeleton() {
  return (
    <Card className="group relative flex flex-col overflow-hidden p-0 shadow-sm">
      {/* Изображение */}
      <Skeleton className="relative aspect-square w-full" />

      <CardContent className="flex flex-1 flex-col p-2 sm:p-3 md:p-4">
        {/* Заголовок */}
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="mb-1 h-4 w-1/2" />

        {/* Цена */}
        <div className="mt-auto pt-2 sm:pt-3 md:pt-4">
          <Skeleton className="h-6 sm:h-7 md:h-8 w-24 sm:w-28" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 pt-0">
        <Skeleton className="h-8 sm:h-9 md:h-10 w-24 sm:w-28" />
      </CardFooter>
    </Card>
  );
}

// Скелетон для категорий
export function CategoriesSkeleton() {
  return (
    <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 sm:h-10 w-16 sm:w-20 rounded-lg" />
      ))}
    </div>
  );
}

// Скелетон для секции скидок
export function DiscountSectionSkeleton() {
  return (
    <section className="mb-6 sm:mb-10">
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto px-2 sm:px-4 pb-8 sm:pb-10 pt-2 sm:pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-[75%] shrink-0 rounded-lg border border-border bg-background p-2 sm:p-4 sm:w-[60%] md:w-[85%] lg:w-[85%] xl:w-[45%] 2xl:w-[30%]"
            >
              <div className="flex flex-col gap-2 sm:gap-4 xl:flex-row xl:gap-6 xl:items-center">
                <Skeleton className="relative aspect-[4/3] sm:aspect-[16/9] xl:aspect-square w-full xl:w-[200px] xl:shrink-0 rounded-lg" />
                
                <div className="flex flex-col gap-1.5 sm:gap-3 xl:flex-1 xl:min-w-0">
                  <div>
                    <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-1" />
                    <Skeleton className="h-4 sm:h-5 w-full mb-1" />
                    <Skeleton className="h-4 sm:h-5 w-3/4" />
                  </div>
                  
                  <Skeleton className="h-3 sm:h-4 w-full hidden sm:block" />
                  
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 xl:gap-3">
                    <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                    <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Skeleton className="h-8 sm:h-9 w-24 sm:w-28" />
                    <Skeleton className="h-8 sm:h-9 w-8 sm:w-9" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Скелетон для результатов поиска
export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-1.5">
      <Skeleton className="h-10 w-10 flex-shrink-0 rounded-md" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Скелетон для корзины
export function CartItemSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg border border-border p-3">
      <Skeleton className="h-16 w-16 flex-shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 ml-auto rounded" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для модального окна товара
export function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Кнопка назад */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-2 sm:p-3">
        <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
      </div>

      {/* Изображение */}
      <Skeleton className="relative aspect-square sm:aspect-video w-full" />

      <div className="p-3 sm:p-4 md:p-6">
        {/* Заголовок */}
        <div className="mb-3 sm:mb-4">
          <Skeleton className="h-6 sm:h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        {/* Цена */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
          <Skeleton className="h-8 sm:h-10 w-32 sm:w-40" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Кнопки */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-11 w-32 sm:w-40" />
          <Skeleton className="h-9 sm:h-11 w-40 sm:w-48" />
          <Skeleton className="h-9 sm:h-11 w-9 sm:w-11" />
        </div>

        {/* Описание */}
        <div className="mb-4 sm:mb-6">
          <Skeleton className="h-5 sm:h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Характеристики */}
        <div className="mb-4 sm:mb-6">
          <Skeleton className="h-5 sm:h-6 w-32 mb-3" />
          <div className="overflow-hidden rounded-lg border border-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex border-b border-border last:border-b-0">
                <Skeleton className="w-1/3 h-10 sm:h-12 rounded-none" />
                <div className="flex-1 p-2 sm:p-3">
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Отзывы */}
        <div>
          <Skeleton className="h-5 sm:h-6 w-32 mb-3" />
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-2.5 sm:p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для полной страницы
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Шапка сайта */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Заголовок */}
        <div className="mb-4 sm:mb-6">
          <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 mb-3 sm:mb-4" />
          
          {/* Категории */}
          <CategoriesSkeleton />

          {/* Поиск */}
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        </div>

        {/* Секция скидок */}
        <DiscountSectionSkeleton />

        {/* Сетка товаров */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
