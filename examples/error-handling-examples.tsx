/**
 * Примеры использования системы обработки ошибок
 * 
 * Этот файл содержит готовые примеры кода для различных сценариев
 */

// ============================================================================
// 1. БАЗОВАЯ ОБРАБОТКА ОШИБОК В FETCH
// ============================================================================

import { parseApiError, getErrorMessage } from "@/lib/errors";

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    
    if (!response.ok) {
      // Можно бросить сам response, система его распарсит
      throw response;
    }
    
    return await response.json();
  } catch (error) {
    // Парсим ошибку в стандартный формат
    const apiError = await parseApiError(error);
    
    // Получаем человекочитаемое сообщение
    console.error(getErrorMessage(apiError));
    
    // Проверяем, можно ли повторить запрос
    if (apiError.retryable) {
      console.log("Можно повторить запрос");
    }
    
    throw apiError;
  }
}

// ============================================================================
// 2. ИСПОЛЬЗОВАНИЕ fetchWithErrorHandling
// ============================================================================

import { fetchWithErrorHandling } from "@/lib/errors";

async function loadProductsSimple() {
  // Автоматически обрабатывает ошибки и парсит их
  const products = await fetchWithErrorHandling<Product[]>(
    "/api/products",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return products;
}

// ============================================================================
// 3. RETRY ЛОГИКА С ЭКСПОНЕНЦИАЛЬНОЙ ЗАДЕРЖКОЙ
// ============================================================================

import { retryWithBackoff } from "@/lib/errors";

async function loadProductsWithRetry() {
  const products = await retryWithBackoff(
    async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw response;
      return await response.json();
    },
    3,    // максимум 3 попытки
    1000  // начальная задержка 1 секунда
  );
  
  // Задержки будут: 1с, 2с, 4с (с добавлением случайного jitter)
  return products;
}

// ============================================================================
// 4. ИСПОЛЬЗОВАНИЕ ХУКА useErrorHandler
// ============================================================================

import { useErrorHandler } from "@/hooks/use-error-handler";

function ProductList() {
  const [products, setProducts] = useState([]);
  const { error, isError, handleError, clearError } = useErrorHandler();
  
  const loadData = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw response;
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      // Автоматически парсит ошибку и показывает toast
      await handleError(err);
    }
  };
  
  return (
    <div>
      {isError && (
        <ErrorDisplay 
          error={error} 
          onDismiss={clearError}
          onRetry={error.retryable ? loadData : undefined}
        />
      )}
      {/* ... остальной код */}
    </div>
  );
}

// ============================================================================
// 5. ИСПОЛЬЗОВАНИЕ ХУКА useAsyncAction
// ============================================================================

import { useAsyncAction } from "@/hooks/use-error-handler";

function ProductList() {
  const { loading, data, error, isError, execute, reset } = useAsyncAction<Product[]>();
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = () => {
    execute(async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw response;
      return await response.json();
    });
  };
  
  if (loading) return <div>Загрузка...</div>;
  if (isError) return <ErrorDisplay error={error} onRetry={loadProducts} />;
  if (!data) return null;
  
  return (
    <div>
      {data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ============================================================================
// 6. ИСПОЛЬЗОВАНИЕ ХУКА useRetry
// ============================================================================

import { useRetry } from "@/hooks/use-error-handler";

function ProductList() {
  const [products, setProducts] = useState([]);
  const { retry, retrying, retryCount } = useRetry();
  const { handleError } = useErrorHandler();
  
  const loadProducts = async () => {
    try {
      const result = await retry(
        async () => {
          const response = await fetch("/api/products");
          if (!response.ok) throw response;
          return await response.json();
        },
        5,    // максимум 5 попыток
        1000  // начальная задержка 1 секунда
      );
      
      if (result) {
        setProducts(result);
      }
    } catch (error) {
      await handleError(error);
    }
  };
  
  return (
    <button onClick={loadProducts} disabled={retrying}>
      {retrying 
        ? `Попытка ${retryCount} из 5...` 
        : "Загрузить товары"
      }
    </button>
  );
}

// ============================================================================
// 7. КОМПОНЕНТЫ ОТОБРАЖЕНИЯ ОШИБОК
// ============================================================================

import { ErrorDisplay, InlineError, FullPageError } from "@/components/error-display";

// Полный вариант с деталями
function FullErrorExample({ error }) {
  return (
    <ErrorDisplay
      error={error}
      onRetry={() => window.location.reload()}
      onDismiss={() => setError(null)}
    />
  );
}

// Компактный вариант
function CompactErrorExample({ error }) {
  return (
    <ErrorDisplay
      error={error}
      compact
      onRetry={() => retryAction()}
      onDismiss={() => setError(null)}
    />
  );
}

// Встроенный вариант
function InlineErrorExample({ error }) {
  return (
    <div className="space-y-2">
      <input type="text" />
      <InlineError error={error} />
    </div>
  );
}

// Полноэкранный вариант
function FullPageErrorExample({ error }) {
  return (
    <FullPageError
      error={error}
      onRetry={() => window.location.reload()}
    />
  );
}

// ============================================================================
// 8. ERROR BOUNDARY
// ============================================================================

import { ErrorBoundary } from "@/components/error-boundary";

function App() {
  return (
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        // Отправить ошибку в систему мониторинга (Sentry, LogRocket и т.д.)
        console.error("React Error:", error, errorInfo);
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}

// Кастомный fallback
function AppWithCustomFallback() {
  return (
    <ErrorBoundary 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Упс! Что-то пошло не так</h1>
            <button onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </button>
          </div>
        </div>
      }
    >
      <YourComponent />
    </ErrorBoundary>
  );
}

// ============================================================================
// 9. ОБРАБОТКА РАЗНЫХ ТИПОВ ОШИБОК С БЭКЕНДА
// ============================================================================

// Пример 1: Простая ошибка
const simpleError = {
  statusCode: 404,
  message: "Product not found"
};

// Пример 2: Валидационная ошибка с деталями
const validationError = {
  statusCode: 400,
  message: "Validation failed",
  details: [
    {
      field: "email",
      message: "Invalid email format",
      code: "INVALID_EMAIL"
    },
    {
      field: "password",
      message: "Password must be at least 8 characters",
      code: "PASSWORD_TOO_SHORT"
    }
  ]
};

// Пример 3: Серверная ошибка с requestId
const serverError = {
  statusCode: 500,
  message: "Internal server error",
  requestId: "req_abc123xyz",
  timestamp: "2026-01-18T10:30:00Z"
};

// Пример 4: Rate limit ошибка
const rateLimitError = {
  statusCode: 429,
  message: "Too many requests",
  retryAfter: 60
};

// ============================================================================
// 10. ИСПОЛЬЗОВАНИЕ В useEffect
// ============================================================================

function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);
  const { error, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProduct();
  }, [productId]);
  
  const loadProduct = async () => {
    setLoading(true);
    clearError();
    
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw response;
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      await handleError(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} onRetry={loadProduct} />;
  if (!product) return null;
  
  return <ProductCard product={product} />;
}

// ============================================================================
// 11. ОБРАБОТКА ОШИБОК В ФОРМАХ
// ============================================================================

function LoginForm() {
  const { handleError } = useErrorHandler();
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });
      
      if (!response.ok) throw response;
      
      const data = await response.json();
      // Успешный вход
      router.push("/dashboard");
    } catch (err) {
      const apiError = await handleError(err);
      
      // Показываем детали валидации в форме
      if (apiError.type === ErrorType.VALIDATION_ERROR && apiError.details) {
        setFormError(apiError);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {formError && formError.details && (
        <div className="space-y-2">
          {formError.details.map((detail, i) => (
            <InlineError 
              key={i} 
              error={{
                ...formError,
                message: detail.message
              }} 
            />
          ))}
        </div>
      )}
      {/* форма */}
    </form>
  );
}

// ============================================================================
// 12. ОБРАБОТКА МНОЖЕСТВЕННЫХ ЗАПРОСОВ
// ============================================================================

function Dashboard() {
  const { error, handleError, clearError, withErrorHandling } = useErrorHandler();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    loadAllData();
  }, []);
  
  const loadAllData = async () => {
    clearError();
    
    // withErrorHandling автоматически обрабатывает ошибки
    const result = await withErrorHandling(async () => {
      const [products, categories, stats] = await Promise.all([
        fetch("/api/products").then(r => r.json()),
        fetch("/api/categories").then(r => r.json()),
        fetch("/api/stats").then(r => r.json()),
      ]);
      
      return { products, categories, stats };
    });
    
    if (result) {
      setData(result);
    }
  };
  
  if (error) {
    return <FullPageError error={error} onRetry={loadAllData} />;
  }
  
  return <div>{/* контент */}</div>;
}

export {};
