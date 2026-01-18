"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Heart, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ProductCardSkeleton,
  CategoriesSkeleton,
  DiscountSectionSkeleton,
  SearchResultSkeleton,
  PageSkeleton,
} from "@/components/skeletons";
import { ErrorDisplay } from "@/components/error-display";
import { parseApiError, getErrorMessage } from "@/lib/errors";

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  reviews?: Review[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 24, 48] as const;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<any>(null);
  const [limit, setLimit] = useState<number>(10);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cardImageIndexes, setCardImageIndexes] = useState<Record<number, number>>({});
  const [discountIndex, setDiscountIndex] = useState(0);
  const discountCarouselRef = useRef<HTMLDivElement>(null);
  const discountItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Загрузка категорий
  useEffect(() => {
    fetch("https://dummyjson.com/products/categories")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Не удалось загрузить категории");
        }
        return res.json();
      })
      .then((data: unknown) => {
        // Обрабатываем разные форматы ответа
        let categoriesList: string[] = [];
        
        if (Array.isArray(data)) {
          categoriesList = data.map((item) => {
            // Если это строка - используем как есть
            if (typeof item === "string") {
              return item;
            }
            // Если это объект - пытаемся извлечь значение
            if (typeof item === "object" && item !== null) {
              // Проверяем различные возможные поля
              if ("name" in item && typeof item.name === "string") {
                return item.name;
              }
              if ("slug" in item && typeof item.slug === "string") {
                return item.slug;
              }
              if ("title" in item && typeof item.title === "string") {
                return item.title;
              }
            }
            return String(item);
          });
        }
        
        setCategories(categoriesList);
        setCategoriesLoading(false);
      })
      .catch(async (err) => {
        console.error(err);
        const apiErr = await parseApiError(err);
        toast.error(getErrorMessage(apiErr));
        setCategoriesLoading(false);
      });
  }, []);

  // Загрузка основного списка товаров (с учетом категории)
  useEffect(() => {
    setLoading(true);
    setError(null);
    setApiError(null);

    const baseUrl = selectedCategory
      ? `https://dummyjson.com/products/category/${encodeURIComponent(selectedCategory)}`
      : `https://dummyjson.com/products`;
    
    const url = `${baseUrl}?limit=${limit}&skip=${skip}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Не удалось загрузить товары");
        }
        return res.json();
      })
      .then((data: ProductsResponse) => {
        setProducts(data.products);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(async (err) => {
        console.error(err);
        const apiErr = await parseApiError(err);
        setApiError(apiErr);
        setError(getErrorMessage(apiErr));
        setLoading(false);
      });
  }, [limit, skip, selectedCategory]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Поиск для поповера (отдельно от основного списка)
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    // Не очищаем результаты - показываем предыдущие во время загрузки
    setSearchLoading(true);

    fetch(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(debouncedSearchQuery)}&limit=10`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Не удалось выполнить поиск");
        }
        return res.json();
      })
      .then((data: ProductsResponse) => {
        setSearchResults(data.products);
        setSearchLoading(false);
      })
      .catch(async (err) => {
        console.error(err);
        const apiErr = await parseApiError(err);
        toast.error(getErrorMessage(apiErr));
        // При ошибке тоже не очищаем результаты, если они были
        setSearchLoading(false);
      });
  }, [debouncedSearchQuery]);

  const totalPages = Math.ceil(total / limit);
  const DISCOUNT_ITEMS = 8;
  const discountProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, DISCOUNT_ITEMS);

  useEffect(() => {
    if (discountProducts.length < 2) {
      return;
    }
    const intervalId = setInterval(() => {
      setDiscountIndex((prev) => (prev + 1) % discountProducts.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, [discountProducts.length]);

  useEffect(() => {
    if (discountIndex >= discountProducts.length) {
      setDiscountIndex(0);
    }
  }, [discountIndex, discountProducts.length]);

  useEffect(() => {
    const target = discountItemRefs.current[discountIndex];
    const container = discountCarouselRef.current;
    if (target && container) {
      container.scrollTo({
        left: target.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });
    }
  }, [discountIndex]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setSkip(0);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setSkip(0);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSkip((page - 1) * limit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success("Товар добавлен в корзину", {
      description: product.title,
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
    toast.success("Заказ оформлен!");
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        toast.info("Удалено из избранного");
        return prev.filter((id) => id !== productId);
      }
      toast.success("Добавлено в избранное");
      return [...prev, productId];
    });
  }, []);

  const openProductDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  }, []);

  const closeProductDetail = useCallback(() => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  }, []);

  const nextImage = useCallback(() => {
    if (selectedProduct) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [selectedProduct]);

  const prevImage = useCallback(() => {
    if (selectedProduct) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  }, [selectedProduct]);

  const nextCardImage = useCallback((productId: number, totalImages: number) => {
    setCardImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }));
  }, []);

  const prevCardImage = useCallback((productId: number, totalImages: number) => {
    setCardImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) === 0 ? totalImages - 1 : (prev[productId] || 0) - 1,
    }));
  }, []);

  const setCardImage = useCallback((productId: number, index: number) => {
    setCardImageIndexes((prev) => ({
      ...prev,
      [productId]: index,
    }));
  }, []);

  const nextDiscount = useCallback(() => {
    if (discountProducts.length === 0) {
      return;
    }
    setDiscountIndex((prev) => (prev + 1) % discountProducts.length);
  }, [discountProducts.length]);

  const prevDiscount = useCallback(() => {
    if (discountProducts.length === 0) {
      return;
    }
    setDiscountIndex((prev) =>
      prev === 0 ? discountProducts.length - 1 : prev - 1
    );
  }, [discountProducts.length]);

  const buyOneClick = useCallback((product: Product) => {
    toast.success("Заказ оформлен!", {
      description: `${product.title} — ${product.price.toLocaleString("ru-RU")} ₽`,
    });
    closeProductDetail();
  }, [closeProductDetail]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
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
  };

  if (loading && products.length === 0) {
    return <PageSkeleton />;
  }

  if (error && apiError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <ErrorDisplay
            error={apiError}
            onRetry={apiError.retryable ? () => window.location.reload() : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Шапка сайта */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">AirShop</h1>
            {process.env.NODE_ENV === 'development' && (
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
          
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
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
              
              {cart.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Корзина пуста</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Добавьте товары для оформления заказа
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-4">
                      {cart.map((item) => (
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
                              {item.product.price.toLocaleString("ru-RU")} ₽
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.product.id, -1)}
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
                                onClick={() => updateQuantity(item.product.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.product.id)}
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
                      <span className="text-xl font-bold">
                        {cartTotal.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    <Button className="w-full" size="lg" onClick={clearCart}>
                      Оформить заказ
                    </Button>
                  </SheetFooter>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-24">
        {/* Заголовок */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">Товары</h2>
          
          {/* Фильтры по категориям */}
          {categoriesLoading ? (
            <CategoriesSkeleton />
          ) : (
            <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={cn(
                  "rounded-lg border px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors active:scale-95",
                  selectedCategory === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                Все
              </button>
              {categories.map((category, index) => {
                const categoryName = typeof category === "string" ? category : String(category);
                // Используем index как fallback ключ, если categoryName не уникален
                const uniqueKey = categoryName !== "[object Object]" ? categoryName : `category-${index}`;
                return (
                  <button
                    key={uniqueKey}
                    onClick={() => handleCategoryChange(categoryName)}
                    className={cn(
                      "rounded-lg border px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors capitalize active:scale-95",
                      selectedCategory === categoryName
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {categoryName.replace(/-/g, " ")}
                  </button>
                );
              })}
            </div>
          )}

          {/* Поиск с поповером */}
          <Popover open={isSearchFocused}>
            <PopoverTrigger asChild>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={(e) => {
                    // Не убираем фокус, если кликнули на результат поиска
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget?.closest("[data-search-popover]")) {
                      setTimeout(() => {
                        setIsSearchFocused(false);
                      }, 150);
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-card px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              data-search-popover
              className="w-[var(--radix-popover-trigger-width)] p-0 animate-none data-[state=open]:animate-none data-[state=closed]:animate-none"
              align="start"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                // Не закрываем если кликнули на инпут
                const target = e.target as HTMLElement;
                if (target === searchInputRef.current || target.closest("[data-search-popover]")) {
                  e.preventDefault();
                }
              }}
            >
                <Command>
                  <CommandList>
                    {!searchQuery.trim() ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <Search className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          Найдите идеальный товар
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Введите название, бренд или категорию
                        </p>
                      </div>
                    ) : searchLoading ? (
                      <div className="py-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <SearchResultSkeleton key={i} />
                        ))}
                      </div>
                    ) : !searchLoading &&
                      debouncedSearchQuery.trim() &&
                      searchResults.length === 0 ? (
                      <CommandEmpty>
                        По запросу "{debouncedSearchQuery}" товары не найдены
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {searchResults.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.title}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              addToCart(product);
                              setSearchQuery("");
                              setIsSearchFocused(false);
                            }}
                            className="flex items-center gap-3"
                          >
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                              <Image
                                src={product.thumbnail}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {product.title}
                              </p>
                              <p className="text-sm font-semibold text-foreground mt-0.5">
                                {product.price.toLocaleString("ru-RU")} ₽
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
            </PopoverContent>
          </Popover>
        </div>

        {loading && products.length === 0 ? (
          <DiscountSectionSkeleton />
        ) : !loading && discountProducts.length > 0 && (
          <section className="mb-6 sm:mb-10">
            <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-lg sm:text-2xl font-bold text-foreground">Скидки</h3>
                <Badge className="border-amber-500 bg-amber-500 text-white text-xs sm:text-sm">
                  <span className="hidden sm:inline">Товары со скидками</span>
                  <span className="sm:hidden">Акция</span>
                </Badge>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-border bg-card">
              <div
                ref={discountCarouselRef}
                className="flex gap-2 sm:gap-4 overflow-x-auto px-2 sm:px-4 pb-8 sm:pb-10 pt-2 sm:pt-4 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {discountProducts.map((product, index) => {
                  const visualDiscount =
                    product.discountPercentage > 0
                      ? Math.round(product.discountPercentage)
                      : Math.min(25, Math.max(5, Math.round(product.rating * 3)));
                  const discountedPrice = Math.round(
                    product.price * (1 - visualDiscount / 100)
                  );
                  const cartItem = cart.find(
                    (item) => item.product.id === product.id
                  );

                  return (
                    <Card
                      key={product.id}
                      ref={(el) => {
                        discountItemRefs.current[index] = el;
                      }}
                      className="w-[75%] sm:w-[48%] md:w-[45%] lg:w-[30%] xl:w-[23%] shrink-0 snap-start cursor-pointer group relative flex flex-col overflow-hidden p-0 shadow-sm transition-all hover:shadow-lg"
                      onClick={() => openProductDetail(product)}
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
                            toggleFavorite(product.id);
                          }}
                          className="absolute left-2 sm:left-3 bottom-2 sm:bottom-3 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4 transition-colors",
                              favorites.includes(product.id)
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
                              {discountedPrice.toLocaleString("ru-RU")} ₽
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            Экономия {(product.price - discountedPrice).toLocaleString("ru-RU")} ₽
                          </p>
                        </div>
                      </CardContent>

                      {/* Футер с кнопками */}
                      <CardFooter className="flex items-center justify-between gap-2 p-3 sm:p-4 pt-0">
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, -1);
                              }}
                            >
                              {cartItem.quantity === 1 ? (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {cartItem.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, 1);
                              }}
                              disabled={cartItem.quantity >= product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
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
                })}
              </div>

              {discountProducts.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevDiscount}
                    aria-label="Предыдущий товар"
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-sm h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextDiscount}
                    aria-label="Следующий товар"
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-sm h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {discountProducts.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
                  {discountProducts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDiscountIndex(idx)}
                      className={cn(
                        "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all",
                        idx === discountIndex
                          ? "bg-foreground w-3 sm:w-4"
                          : "bg-foreground/30 hover:bg-foreground/50"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Сетка товаров */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: limit }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden p-0 shadow-sm transition-all hover:shadow-md cursor-pointer"
                  onClick={() => openProductDetail(product)}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {(() => {
                      const currentIdx = cardImageIndexes[product.id] || 0;
                      const images = product.images.length > 0 ? product.images : [product.thumbnail];
                      return (
                        <>
                          <Image
                            src={images[currentIdx] || product.thumbnail}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          
                          {/* Стрелки навигации - видимы на touch устройствах */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  prevCardImage(product.id, images.length);
                                }}
                                className="absolute left-1 sm:left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1 sm:p-1.5 opacity-100 sm:opacity-0 backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
                              >
                                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextCardImage(product.id, images.length);
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
                                      setCardImage(product.id, idx);
                                    }}
                                    className={cn(
                                      "h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full transition-all",
                                      idx === currentIdx
                                        ? "bg-white w-2 sm:w-3"
                                        : "bg-white/50 hover:bg-white/75"
                                    )}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                    
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute left-1 sm:left-2 top-1 sm:top-2 z-10 rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
                    >
                      <Heart
                        className={cn(
                          "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
                          favorites.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
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
                        {product.price.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-end gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 pt-0">
                    {(() => {
                      const cartItem = cart.find((item) => item.product.id === product.id);
                      if (cartItem) {
                        return (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, -1);
                              }}
                            >
                              {cartItem.quantity === 1 ? (
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                              ) : (
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                            <span className="w-5 sm:w-6 md:w-8 text-center text-xs sm:text-sm font-semibold">
                              {cartItem.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, 1);
                              }}
                              disabled={cartItem.quantity >= product.stock}
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        );
                      }
                      return (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
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
                      );
                    })()}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Пагинация и выбор количества товаров */}
            <div className="mt-6 sm:mt-8 mb-8 flex flex-col gap-3 sm:gap-4 bg-card/50 p-3 sm:p-4 rounded-lg border border-border">
              <div className="flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-between">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Показано {skip + 1}–{Math.min(skip + limit, total)} из {total}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                      Товаров на странице:
                    </span>
                    <div className="flex gap-0.5 sm:gap-1 rounded-lg border border-border bg-card p-0.5 sm:p-1">
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleLimitChange(option)}
                          className={cn(
                            "rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors",
                            limit === option
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted active:bg-muted"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex gap-0.5 sm:gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={cn(
                        "rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                        currentPage === 1
                          ? "cursor-not-allowed text-muted-foreground opacity-50"
                          : "text-foreground hover:bg-muted active:bg-muted"
                      )}
                    >
                      <span className="hidden sm:inline">Назад</span>
                      <ChevronLeft className="h-4 w-4 sm:hidden" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={cn(
                            "min-w-[32px] sm:min-w-[40px] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                            currentPage === pageNum
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted active:bg-muted"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                        currentPage === totalPages
                          ? "cursor-not-allowed text-muted-foreground opacity-50"
                          : "text-foreground hover:bg-muted active:bg-muted"
                      )}
                    >
                      <span className="hidden sm:inline">Вперед</span>
                      <ChevronRight className="h-4 w-4 sm:hidden" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Модальное окно с детальной информацией о товаре */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && closeProductDetail()}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto p-0 w-[95vw] sm:w-full" showCloseButton={false}>
          {selectedProduct && (
            <div className="flex flex-col">
              {/* Кнопка "Назад" */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-2 sm:p-3">
                <Button
                  variant="ghost"
                  onClick={closeProductDetail}
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Назад</span>
                </Button>
              </div>

              {/* Карусель изображений */}
              <div className="relative aspect-square sm:aspect-video w-full bg-muted">
                <Image
                  src={selectedProduct.images[currentImageIndex] || selectedProduct.thumbnail}
                  alt={selectedProduct.title}
                  fill
                  className="object-contain"
                />
                
                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    
                    {/* Индикаторы */}
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
                      {selectedProduct.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors",
                            idx === currentImageIndex
                              ? "bg-foreground"
                              : "bg-foreground/30 hover:bg-foreground/50"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Миниатюры - скрыты на маленьких экранах */}
                {selectedProduct.images.length > 1 && (
                  <div className="hidden sm:flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-2">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "relative h-10 w-10 md:h-14 md:w-14 overflow-hidden rounded-md border-2 transition-all",
                          idx === currentImageIndex
                            ? "border-primary"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={img}
                          alt={`${selectedProduct.title} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 md:p-6">
                <DialogHeader className="mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div>
                      <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold">
                        {selectedProduct.title}
                      </DialogTitle>
                      {selectedProduct.brand && (
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                          Бренд: <span className="font-medium">{selectedProduct.brand}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedProduct.rating)}
                      <span className="ml-1 text-xs sm:text-sm text-muted-foreground">
                        ({selectedProduct.rating.toFixed(1)})
                      </span>
                    </div>
                  </div>
                </DialogHeader>

                {/* Цена */}
                <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    {selectedProduct.price.toLocaleString("ru-RU")} ₽
                  </span>
                  {selectedProduct.discountPercentage > 0 && (
                    <Badge variant="destructive" className="text-xs sm:text-sm">
                      -{Math.round(selectedProduct.discountPercentage)}%
                    </Badge>
                  )}
                  <Badge
                    variant={selectedProduct.stock > 0 ? "default" : "destructive"}
                    className={cn(
                      "flex items-center gap-1 text-xs sm:text-sm",
                      selectedProduct.stock > 0
                        ? "bg-green-500/90 text-white border-green-500/90"
                        : "bg-red-500/90 text-white border-red-500/90"
                    )}
                  >
                    {selectedProduct.stock > 0 ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="hidden sm:inline">В наличии ({selectedProduct.stock} шт.)</span>
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

                {/* Кнопки действий */}
                <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
                  {(() => {
                    const cartItem = cart.find((item) => item.product.id === selectedProduct.id);
                    if (cartItem) {
                      return (
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 sm:p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => updateQuantity(selectedProduct.id, -1)}
                          >
                            {cartItem.quantity === 1 ? (
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                            ) : (
                              <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </Button>
                          <span className="w-8 sm:w-12 text-center text-base sm:text-lg font-semibold">
                            {cartItem.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => updateQuantity(selectedProduct.id, 1)}
                            disabled={cartItem.quantity >= selectedProduct.stock}
                          >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>
                      );
                    }
                    return (
                      <Button
                        size="lg"
                        onClick={() => addToCart(selectedProduct)}
                        disabled={selectedProduct.stock <= 0}
                        className="flex-1 sm:flex-none h-9 sm:h-10 md:h-11 text-sm sm:text-base"
                      >
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                        В корзину
                      </Button>
                    );
                  })()}
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => buyOneClick(selectedProduct)}
                    disabled={selectedProduct.stock <= 0}
                    className="flex-1 sm:flex-none bg-amber-500 text-white hover:bg-amber-600 h-9 sm:h-10 md:h-11 text-sm sm:text-base"
                  >
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Купить в один клик</span>
                    <span className="sm:hidden">Быстрая покупка</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className={cn(
                      "h-9 sm:h-10 md:h-11 w-9 sm:w-10 md:w-11 p-0",
                      favorites.includes(selectedProduct.id) &&
                        "border-red-500 text-red-500 hover:bg-red-50"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5",
                        favorites.includes(selectedProduct.id) && "fill-red-500"
                      )}
                    />
                  </Button>
                </div>

                {/* Описание */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold">Описание</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Характеристики */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">Характеристики</h3>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-xs sm:text-sm">
                      <tbody>
                        {selectedProduct.brand && (
                          <tr className="border-b border-border">
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium w-1/3 sm:w-auto">Бренд</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">{selectedProduct.brand}</td>
                          </tr>
                        )}
                        {selectedProduct.category && (
                          <tr className="border-b border-border">
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">Категория</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 capitalize">{selectedProduct.category.replace(/-/g, " ")}</td>
                          </tr>
                        )}
                        {selectedProduct.weight && (
                          <tr className="border-b border-border">
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">Вес</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">{selectedProduct.weight} г</td>
                          </tr>
                        )}
                        {selectedProduct.dimensions && (
                          <tr className="border-b border-border">
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">Размеры</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {selectedProduct.dimensions.width} × {selectedProduct.dimensions.height} × {selectedProduct.dimensions.depth} см
                            </td>
                          </tr>
                        )}
                        {selectedProduct.warrantyInformation && (
                          <tr className="border-b border-border">
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">Гарантия</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">{selectedProduct.warrantyInformation}</td>
                          </tr>
                        )}
                        {selectedProduct.shippingInformation && (
                          <tr className="border-b border-border">
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">Доставка</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">{selectedProduct.shippingInformation}</td>
                          </tr>
                        )}
                        {selectedProduct.returnPolicy && (
                          <tr className="border-b border-border last:border-b-0">
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">Возврат</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">{selectedProduct.returnPolicy}</td>
                          </tr>
                        )}
                        {selectedProduct.minimumOrderQuantity && selectedProduct.minimumOrderQuantity > 1 && (
                          <tr>
                            <td className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 font-medium">Мин. заказ</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">{selectedProduct.minimumOrderQuantity} шт.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Отзывы */}
                {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
                  <div>
                    <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">
                      Отзывы ({selectedProduct.reviews.length})
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {selectedProduct.reviews.map((review, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border p-2.5 sm:p-4"
                        >
                          <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-muted">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm sm:text-base font-medium">{review.reviewerName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 ml-8 sm:ml-0">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
