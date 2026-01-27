"use client";

import { PageSkeleton } from "@/components/skeletons";
import { ErrorDisplay } from "@/components/error-display";
import {
  Header,
  CategoriesFilter,
  SearchBar,
  ProductGrid,
  DiscountCarousel,
  ProductDetailDialog,
  Pagination,
} from "@/components/shop";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useSearch } from "@/hooks/use-search";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useCardImages } from "@/hooks/use-card-images";

export default function Home() {
  // Хуки для управления данными и состоянием
  const products = useProducts();
  const categories = useCategories();
  const search = useSearch();
  const cart = useCart();
  const favorites = useFavorites();
  const productDetail = useProductDetail();
  const cardImages = useCardImages();

  // Начальная загрузка
  if (products.loading && products.products.length === 0) {
    return <PageSkeleton />;
  }

  // Критическая ошибка
  if (products.error && products.apiError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <ErrorDisplay
            error={products.apiError}
            onRetry={
              products.apiError.retryable
                ? () => window.location.reload()
                : undefined
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Шапка сайта */}
      <Header
        cartItemsCount={cart.itemsCount}
        cartTotal={cart.total}
        cartItems={cart.items}
        isCartOpen={cart.isOpen}
        onCartOpenChange={cart.setIsOpen}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onClearCart={cart.clearCart}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-24">
        {/* Заголовок */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Товары
          </h2>

          {/* Фильтры по категориям */}
          <CategoriesFilter
            categories={categories.categories}
            selectedCategory={products.selectedCategory}
            onCategoryChange={products.setCategory}
            loading={categories.loading}
          />

          {/* Поиск */}
          <SearchBar
            query={search.query}
            onQueryChange={search.setQuery}
            debouncedQuery={search.debouncedQuery}
            results={search.results}
            loading={search.loading}
            isFocused={search.isFocused}
            onFocusChange={search.setIsFocused}
            inputRef={search.inputRef}
            onProductSelect={(product) => {
              cart.addItem(product);
              search.clearSearch();
            }}
          />
        </div>

        {/* Карусель скидок */}
        <DiscountCarousel
          products={products.products}
          loading={products.loading && products.products.length === 0}
          isFavorite={favorites.isFavorite}
          getCartQuantity={cart.getItemQuantity}
          onToggleFavorite={favorites.toggle}
          onAddToCart={cart.addItem}
          onUpdateQuantity={cart.updateQuantity}
          onProductClick={productDetail.open}
        />

        {/* Сетка товаров */}
        <ProductGrid
          products={products.products}
          loading={products.loading}
          skeletonCount={products.limit}
          isFavorite={favorites.isFavorite}
          getCartQuantity={cart.getItemQuantity}
          getImageIndex={cardImages.getImageIndex}
          onToggleFavorite={favorites.toggle}
          onAddToCart={cart.addItem}
          onUpdateQuantity={cart.updateQuantity}
          onImagePrev={cardImages.prevImage}
          onImageNext={cardImages.nextImage}
          onImageSelect={cardImages.setImage}
          onProductClick={productDetail.open}
        />

        {/* Пагинация */}
        {!products.loading && (
          <Pagination
            currentPage={products.currentPage}
            totalPages={products.totalPages}
            limit={products.limit}
            skip={products.skip}
            total={products.total}
            onPageChange={(page) => {
              products.setPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onLimitChange={products.setLimit}
          />
        )}
      </div>

      {/* Модальное окно товара */}
      <ProductDetailDialog
        product={productDetail.selectedProduct}
        isOpen={productDetail.isOpen}
        currentImageIndex={productDetail.currentImageIndex}
        isFavorite={
          productDetail.selectedProduct
            ? favorites.isFavorite(productDetail.selectedProduct.id)
            : false
        }
        cartQuantity={
          productDetail.selectedProduct
            ? cart.getItemQuantity(productDetail.selectedProduct.id)
            : 0
        }
        onClose={productDetail.close}
        onNextImage={productDetail.nextImage}
        onPrevImage={productDetail.prevImage}
        onSetImageIndex={productDetail.setImageIndex}
        onToggleFavorite={() => {
          if (productDetail.selectedProduct) {
            favorites.toggle(productDetail.selectedProduct.id);
          }
        }}
        onAddToCart={() => {
          if (productDetail.selectedProduct) {
            cart.addItem(productDetail.selectedProduct);
          }
        }}
        onUpdateQuantity={(delta) => {
          if (productDetail.selectedProduct) {
            cart.updateQuantity(productDetail.selectedProduct.id, delta);
          }
        }}
        onBuyOneClick={() => productDetail.buyOneClick()}
      />
    </div>
  );
}
