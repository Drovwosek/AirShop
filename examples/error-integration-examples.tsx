/**
 * Примеры интеграции системы обработки ошибок в реальные компоненты
 */

import { useState, useEffect } from "react";
import { useAsyncAction, useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorDisplay } from "@/components/error-display";
import { fetchWithErrorHandling, retryWithBackoff } from "@/lib/errors";
import { ErrorLogger, ValidationErrorHelper } from "@/lib/error-helpers";

// ============================================================================
// ПРИМЕР 1: Компонент списка товаров с обработкой ошибок
// ============================================================================

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
}

function ProductList() {
  const { loading, data, error, execute } = useAsyncAction<Product[]>();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    execute(async () => {
      const response = await fetch("https://dummyjson.com/products");
      if (!response.ok) throw response;
      const data = await response.json();
      return data.products;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={error.retryable ? loadProducts : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {data?.map((product) => (
        <div key={product.id} className="p-4 border rounded">
          <h3>{product.title}</h3>
          <p>{product.price} ₽</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ПРИМЕР 2: Форма с валидационными ошибками
// ============================================================================

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw response;

      const data = await response.json();
      console.log("Success:", data);
    } catch (err) {
      const apiError = await handleError(err);
      
      // Логируем ошибку
      ErrorLogger.log(apiError, {
        component: "LoginForm",
        action: "login",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
        />
        {error &&
          ValidationErrorHelper.hasFieldError(error, "email") && (
            <p className="text-sm text-red-500 mt-1">
              {ValidationErrorHelper.getFieldErrors(error, "email")[0]}
            </p>
          )}
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full px-4 py-2 border rounded"
        />
        {error &&
          ValidationErrorHelper.hasFieldError(error, "password") && (
            <p className="text-sm text-red-500 mt-1">
              {ValidationErrorHelper.getFieldErrors(error, "password")[0]}
            </p>
          )}
      </div>

      {error && !ValidationErrorHelper.getErrorFields(error).length && (
        <ErrorDisplay error={error} compact onDismiss={clearError} />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        {loading ? "Загрузка..." : "Войти"}
      </button>
    </form>
  );
}

// ============================================================================
// ПРИМЕР 3: Загрузка с retry логикой
// ============================================================================

function ProductDetailWithRetry({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const { error, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductWithRetry();
  }, [productId]);

  const loadProductWithRetry = async () => {
    setLoading(true);
    clearError();

    try {
      const product = await retryWithBackoff(
        async () => {
          const response = await fetch(
            `https://dummyjson.com/products/${productId}`
          );
          if (!response.ok) throw response;
          return await response.json();
        },
        3,
        1000
      );

      setProduct(product);
    } catch (err) {
      await handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка товара...</div>;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={error.retryable ? loadProductWithRetry : undefined}
      />
    );
  }

  if (!product) return null;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">{product.title}</h2>
      <p className="text-lg">{product.price} ₽</p>
    </div>
  );
}

// ============================================================================
// ПРИМЕР 4: Множественные запросы с обработкой ошибок
// ============================================================================

interface DashboardData {
  products: Product[];
  categories: string[];
  stats: {
    totalProducts: number;
    totalSales: number;
  };
}

function Dashboard() {
  const { loading, data, error, execute } = useAsyncAction<DashboardData>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    execute(async () => {
      // Параллельная загрузка данных
      const [productsRes, categoriesRes, statsRes] = await Promise.all([
        fetchWithErrorHandling("https://dummyjson.com/products?limit=10"),
        fetchWithErrorHandling("https://dummyjson.com/products/categories"),
        fetchWithErrorHandling("https://dummyjson.com/products/1"), // mock stats
      ]);

      return {
        products: productsRes.products,
        categories: categoriesRes.slice(0, 5),
        stats: {
          totalProducts: productsRes.total,
          totalSales: 12345,
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorDisplay
          error={error}
          onRetry={error.retryable ? loadDashboardData : undefined}
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Товаров</h3>
          <p className="text-2xl font-bold">{data.stats.totalProducts}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Категорий</h3>
          <p className="text-2xl font-bold">{data.categories.length}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Продаж</h3>
          <p className="text-2xl font-bold">{data.stats.totalSales}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Последние товары</h2>
        <div className="space-y-2">
          {data.products.map((product) => (
            <div key={product.id} className="p-2 border rounded">
              {product.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ПРИМЕР 5: Поиск с обработкой ошибок
// ============================================================================

function SearchWithErrorHandling() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const { error, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      clearError();
      return;
    }

    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    clearError();

    try {
      const data = await fetchWithErrorHandling<{ products: Product[] }>(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(
          searchQuery
        )}`
      );

      setResults(data.products);
    } catch (err) {
      await handleError(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск товаров..."
        className="w-full px-4 py-2 border rounded"
      />

      {loading && <div>Поиск...</div>}

      {error && (
        <ErrorDisplay
          error={error}
          compact
          onRetry={error.retryable ? () => searchProducts(query) : undefined}
          onDismiss={clearError}
        />
      )}

      {!loading && !error && query && results.length === 0 && (
        <p className="text-muted-foreground">Товары не найдены</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((product) => (
            <div key={product.id} className="p-3 border rounded">
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-muted-foreground">
                {product.price} ₽
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export {
  ProductList,
  LoginForm,
  ProductDetailWithRetry,
  Dashboard,
  SearchWithErrorHandling,
};
