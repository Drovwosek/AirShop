# Система обработки ошибок

Комплексная система для обработки и отображения ошибок, которые могут прийти с бэкенда.

## Структура

```
lib/
  └── errors.ts              # Утилиты для парсинга и обработки ошибок
components/
  ├── error-display.tsx      # Компоненты для отображения ошибок
  └── error-boundary.tsx     # Error Boundary для перехвата React ошибок
hooks/
  └── use-error-handler.ts   # React хуки для работы с ошибками
```

## Типы ошибок

Система поддерживает 8 типов ошибок:

1. **NETWORK_ERROR** - Проблемы с сетью/подключением
2. **VALIDATION_ERROR** - Ошибки валидации данных (400)
3. **AUTHENTICATION_ERROR** - Ошибки аутентификации (401)
4. **AUTHORIZATION_ERROR** - Ошибки авторизации/доступа (403)
5. **NOT_FOUND** - Ресурс не найден (404)
6. **SERVER_ERROR** - Серверные ошибки (500+)
7. **RATE_LIMIT** - Превышен лимит запросов (429)
8. **TIMEOUT** - Превышено время ожидания

## Использование

### 1. Базовая обработка ошибок

```typescript
import { parseApiError, getErrorMessage } from "@/lib/errors";

try {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw response;
  }
  const data = await response.json();
} catch (err) {
  const apiError = await parseApiError(err);
  console.error(getErrorMessage(apiError));
}
```

### 2. Использование fetchWithErrorHandling

```typescript
import { fetchWithErrorHandling } from "@/lib/errors";

try {
  const products = await fetchWithErrorHandling("/api/products");
  console.log(products);
} catch (apiError) {
  // Ошибка уже обработана и имеет стандартный формат
  console.error(apiError);
}
```

### 3. Retry логика

```typescript
import { retryWithBackoff } from "@/lib/errors";

const products = await retryWithBackoff(
  () => fetch("/api/products").then(r => r.json()),
  3,  // максимум 3 попытки
  1000 // базовая задержка 1 секунда
);
```

### 4. React хуки

#### useErrorHandler

```typescript
import { useErrorHandler } from "@/hooks/use-error-handler";

function MyComponent() {
  const { error, handleError, clearError } = useErrorHandler();

  const loadData = async () => {
    try {
      const response = await fetch("/api/data");
      if (!response.ok) throw response;
    } catch (err) {
      handleError(err); // Автоматически показывает toast
    }
  };

  return (
    <div>
      {error && <ErrorDisplay error={error} onDismiss={clearError} />}
      <button onClick={loadData}>Загрузить</button>
    </div>
  );
}
```

#### useAsyncAction

```typescript
import { useAsyncAction } from "@/hooks/use-error-handler";

function MyComponent() {
  const { loading, data, error, execute } = useAsyncAction();

  const loadData = () => {
    execute(async () => {
      const response = await fetch("/api/data");
      return await response.json();
    });
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <ErrorDisplay error={error} />;
  return <div>{data}</div>;
}
```

#### useRetry

```typescript
import { useRetry } from "@/hooks/use-error-handler";

function MyComponent() {
  const { retry, retrying, retryCount } = useRetry();

  const loadData = () => {
    retry(async () => {
      const response = await fetch("/api/data");
      return await response.json();
    }, 5, 1000);
  };

  return (
    <button onClick={loadData} disabled={retrying}>
      {retrying ? `Попытка ${retryCount}...` : "Загрузить"}
    </button>
  );
}
```

### 5. Компоненты отображения

#### ErrorDisplay (полный вариант)

```typescript
import { ErrorDisplay } from "@/components/error-display";

<ErrorDisplay
  error={apiError}
  onRetry={() => loadData()}
  onDismiss={() => setError(null)}
/>
```

#### ErrorDisplay (компактный вариант)

```typescript
<ErrorDisplay
  error={apiError}
  compact
  onRetry={() => loadData()}
  onDismiss={() => setError(null)}
/>
```

#### InlineError (встроенный)

```typescript
import { InlineError } from "@/components/error-display";

<InlineError error={apiError} />
```

#### FullPageError (на всю страницу)

```typescript
import { FullPageError } from "@/components/error-display";

<FullPageError
  error={apiError}
  onRetry={() => window.location.reload()}
/>
```

### 6. Error Boundary

```typescript
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary onError={(error, errorInfo) => {
  // Отправить в систему логирования
  console.error(error, errorInfo);
}}>
  <YourComponent />
</ErrorBoundary>
```

## Формат ошибки API

Система автоматически парсит различные форматы ошибок с бэкенда:

### Пример 1: Простая ошибка

```json
{
  "statusCode": 404,
  "message": "Product not found"
}
```

### Пример 2: Валидационная ошибка с деталями

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    },
    {
      "field": "password",
      "message": "Password too short",
      "code": "PASSWORD_TOO_SHORT"
    }
  ]
}
```

### Пример 3: Серверная ошибка с requestId

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "requestId": "req_abc123xyz",
  "timestamp": "2026-01-18T10:30:00Z"
}
```

## Демонстрация

Чтобы увидеть все возможности системы обработки ошибок:

1. Запустите приложение: `npm run dev`
2. Перейдите на `/errors-demo`
3. Изучите различные типы ошибок и способы их отображения

## Особенности

- ✅ Автоматический парсинг различных форматов ошибок
- ✅ Определение типа ошибки по HTTP статус коду
- ✅ Поддержка деталей ошибок (для валидации)
- ✅ Автоматическая retry логика для временных ошибок
- ✅ Экспоненциальная задержка при повторных попытках
- ✅ Интеграция с toast уведомлениями
- ✅ Error Boundary для перехвата React ошибок
- ✅ TypeScript типизация
- ✅ Человекочитаемые сообщения для каждого типа ошибки
- ✅ Иконки и цвета для визуального различения типов ошибок
- ✅ Поддержка requestId для отладки
- ✅ Индикация retryable ошибок

## Интеграция в существующий код

Система уже интегрирована в главную страницу (`app/page.tsx`):

- Загрузка товаров
- Загрузка категорий
- Поиск товаров
- Отображение ошибок с возможностью повторить запрос

## Расширение

Для добавления новых типов ошибок:

1. Добавьте тип в `ErrorType` enum в `lib/errors.ts`
2. Обновите функции `getErrorMessage`, `getErrorIcon`, `getErrorColor`
3. Добавьте компонент иконки в `components/error-display.tsx`

## Лучшие практики

1. **Всегда используйте parseApiError** для обработки ошибок с бэкенда
2. **Показывайте toast уведомления** для незначительных ошибок
3. **Используйте ErrorDisplay** для важных ошибок, требующих внимания
4. **Оборачивайте критичные компоненты** в ErrorBoundary
5. **Включайте requestId** в ответах бэкенда для отладки
6. **Используйте retry логику** для временных ошибок (сеть, таймауты, 5xx)
