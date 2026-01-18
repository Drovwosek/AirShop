# Архитектура системы обработки ошибок

## 📁 Структура файлов

```
lib/
├── errors.ts                    # Основная логика обработки ошибок
└── error-helpers.ts             # Вспомогательные утилиты

components/
├── error-display.tsx            # Компоненты отображения
└── error-boundary.tsx           # Error Boundary

hooks/
└── use-error-handler.ts         # React хуки

types/
└── errors.ts                    # TypeScript типы

examples/
├── error-handling-examples.tsx  # Базовые примеры
└── error-integration-examples.tsx # Интеграция в компоненты

docs/
├── ERRORS.md                    # Полная документация
├── ERRORS_QUICKSTART.md         # Быстрый старт
└── ERRORS_ARCHITECTURE.md       # Этот файл
```

## 🏗️ Компоненты системы

### 1. Ядро (`lib/errors.ts`)

**Основные функции:**
- `parseApiError()` - парсинг ошибок в стандартный формат
- `fetchWithErrorHandling()` - обертка над fetch
- `retryWithBackoff()` - retry логика
- `getErrorMessage()` - человекочитаемые сообщения
- `getErrorIcon()` / `getErrorColor()` - визуальное представление

**Типы ошибок:**
```typescript
enum ErrorType {
  NETWORK_ERROR,
  VALIDATION_ERROR,
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  NOT_FOUND,
  SERVER_ERROR,
  RATE_LIMIT,
  TIMEOUT,
  UNKNOWN
}
```

**Интерфейс ошибки:**
```typescript
interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: ErrorDetail[];
  timestamp?: string;
  requestId?: string;
  retryable?: boolean;
}
```

### 2. Помощники (`lib/error-helpers.ts`)

**ErrorLogger** - Логирование и мониторинг
```typescript
ErrorLogger.log(error, context)
ErrorLogger.getLogs()
ErrorLogger.getLogsByType(type)
```

**ValidationErrorHelper** - Работа с валидацией
```typescript
ValidationErrorHelper.getFieldErrors(error, fieldName)
ValidationErrorHelper.hasFieldError(error, fieldName)
ValidationErrorHelper.toFormErrors(error)
```

**RetryHelper** - Управление retry логикой
```typescript
RetryHelper.calculateDelay(attempt, baseDelay, maxDelay)
RetryHelper.shouldRetry(error, attempt, maxAttempts)
RetryHelper.createRetryFunction(fn, options)
```

**ErrorAnalyzer** - Анализ ошибок
```typescript
ErrorAnalyzer.groupByType(errors)
ErrorAnalyzer.getErrorFrequency(errors)
ErrorAnalyzer.getMostFrequentError(errors)
```

**ErrorFactory** - Создание кастомных ошибок
```typescript
ErrorFactory.createValidationError(message, details)
ErrorFactory.createServerError(message, requestId)
ErrorFactory.createAuthError(message, type, redirectUrl)
```

### 3. React Хуки (`hooks/use-error-handler.ts`)

**useErrorHandler** - Базовая обработка
```typescript
const { error, isError, handleError, clearError, withErrorHandling } = useErrorHandler();
```

**useAsyncAction** - Управление состоянием
```typescript
const { loading, data, error, isError, execute, reset } = useAsyncAction<T>();
```

**useRetry** - Retry логика
```typescript
const { retry, retrying, retryCount } = useRetry();
```

### 4. Компоненты отображения (`components/error-display.tsx`)

**ErrorDisplay** - Основной компонент
```typescript
<ErrorDisplay 
  error={error}
  onRetry={retry}
  onDismiss={dismiss}
  compact={false}
/>
```

**InlineError** - Встроенный вариант
```typescript
<InlineError error={error} />
```

**FullPageError** - Полноэкранный вариант
```typescript
<FullPageError error={error} onRetry={retry} />
```

### 5. Error Boundary (`components/error-boundary.tsx`)

Перехватывает React ошибки на уровне компонента:
```typescript
<ErrorBoundary onError={handleError}>
  <App />
</ErrorBoundary>
```

## 🔄 Поток обработки ошибок

```
1. Ошибка происходит
   ↓
2. parseApiError() парсит в ApiError
   ↓
3. Определяется ErrorType по статус коду
   ↓
4. Проверяется retryable флаг
   ↓
5. Если retryable → retryWithBackoff()
   Иначе → handleError() → toast
   ↓
6. ErrorDisplay отображает ошибку
   ↓
7. ErrorLogger логирует для мониторинга
```

## 📊 Диаграмма зависимостей

```
┌─────────────────────────────────────────┐
│           Error Boundary                │
│  (перехватывает React ошибки)           │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│         React Hooks Layer               │
│  ┌─────────────────────────────────┐   │
│  │ useErrorHandler                 │   │
│  │ useAsyncAction                  │   │
│  │ useRetry                        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│       Components Layer                  │
│  ┌─────────────────────────────────┐   │
│  │ ErrorDisplay                    │   │
│  │ InlineError                     │   │
│  │ FullPageError                   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│         Core Layer (lib)                │
│  ┌─────────────────────────────────┐   │
│  │ parseApiError                   │   │
│  │ fetchWithErrorHandling          │   │
│  │ retryWithBackoff                │   │
│  │ getErrorMessage/Icon/Color      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│       Helpers Layer                     │
│  ┌─────────────────────────────────┐   │
│  │ ErrorLogger                     │   │
│  │ ValidationErrorHelper           │   │
│  │ RetryHelper                     │   │
│  │ ErrorAnalyzer                   │   │
│  │ ErrorFactory                    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🎯 Паттерны использования

### Паттерн 1: Простой запрос
```typescript
try {
  const data = await fetchWithErrorHandling("/api/data");
} catch (error) {
  // Ошибка уже в формате ApiError
  console.error(error);
}
```

### Паттерн 2: С React хуком
```typescript
const { loading, data, error, execute } = useAsyncAction();

execute(async () => {
  return await fetchData();
});
```

### Паттерн 3: С retry
```typescript
const data = await retryWithBackoff(
  () => fetchData(),
  3,
  1000
);
```

### Паттерн 4: Форма с валидацией
```typescript
try {
  await submitForm(data);
} catch (err) {
  const error = await handleError(err);
  if (isValidationError(error)) {
    const formErrors = ValidationErrorHelper.toFormErrors(error);
    setErrors(formErrors);
  }
}
```

## 🔌 Точки расширения

### 1. Добавление нового типа ошибки

```typescript
// 1. Добавить в enum
enum ErrorType {
  // ...
  CUSTOM_ERROR = "CUSTOM_ERROR"
}

// 2. Добавить обработку в getErrorMessage
export function getErrorMessage(error: ApiError): string {
  switch (error.type) {
    case ErrorType.CUSTOM_ERROR:
      return "Кастомное сообщение";
    // ...
  }
}

// 3. Добавить иконку в getErrorIcon
export function getErrorIcon(type: ErrorType): string {
  switch (type) {
    case ErrorType.CUSTOM_ERROR:
      return "CustomIcon";
    // ...
  }
}
```

### 2. Интеграция с мониторингом

```typescript
// В ErrorLogger.sendToMonitoring()
private static sendToMonitoring(log: ErrorLog): void {
  // Sentry
  Sentry.captureException(log.error, {
    contexts: { custom: log.context },
    tags: { errorType: log.error.type },
  });
  
  // LogRocket
  LogRocket.captureException(log.error, {
    extra: log.context,
  });
  
  // DataDog
  datadogLogs.logger.error(log.error.message, {
    error: log.error,
    context: log.context,
  });
}
```

### 3. Кастомные компоненты отображения

```typescript
// Создать свой компонент
function CustomErrorDisplay({ error }: { error: ApiError }) {
  return (
    <div className="custom-error">
      {/* Кастомная разметка */}
    </div>
  );
}

// Использовать
<ErrorBoundary fallback={<CustomErrorDisplay error={error} />}>
  <App />
</ErrorBoundary>
```

## 🧪 Тестирование

### Unit тесты
```typescript
describe("parseApiError", () => {
  it("должен парсить Response объект", async () => {
    const response = new Response(null, { status: 404 });
    const error = await parseApiError(response);
    expect(error.type).toBe(ErrorType.NOT_FOUND);
  });
});
```

### Интеграционные тесты
```typescript
describe("useErrorHandler", () => {
  it("должен обрабатывать ошибки", async () => {
    const { result } = renderHook(() => useErrorHandler());
    await act(async () => {
      await result.current.handleError(new Error("Test"));
    });
    expect(result.current.error).toBeTruthy();
  });
});
```

## 📈 Метрики и мониторинг

Система предоставляет данные для мониторинга:

```typescript
// Получить статистику
const logs = ErrorLogger.getLogs();
const frequency = ErrorAnalyzer.getErrorFrequency(logs);
const mostFrequent = ErrorAnalyzer.getMostFrequentError(logs);

// Проверить критичность
if (ErrorAnalyzer.hasCriticalErrors(logs)) {
  alert("Обнаружены критичные ошибки!");
}
```

## 🔐 Безопасность

- Не отображаем stack traces в production
- Не логируем чувствительные данные (пароли, токены)
- RequestId для трейсинга без раскрытия деталей
- Sanitize сообщений ошибок перед отображением

## 🚀 Performance

- Lazy loading компонентов ошибок
- Мemoизация ErrorDisplay
- Дебаунс для повторных запросов
- Ограничение количества логов в памяти
- Экспоненциальный backoff для retry

## 📝 Best Practices

1. **Всегда используйте parseApiError** для обработки ошибок
2. **Логируйте критичные ошибки** с контекстом
3. **Показывайте понятные сообщения** пользователям
4. **Используйте retry** только для временных ошибок
5. **Оборачивайте критичные компоненты** в ErrorBoundary
6. **Включайте requestId** в ответы для отладки
7. **Тестируйте обработку ошибок** на всех путях

## 🔄 Жизненный цикл ошибки

```
1. Ошибка возникает в fetch/async операции
2. parseApiError преобразует в ApiError
3. ErrorLogger логирует с контекстом
4. Если retryable → RetryHelper пытается повторить
5. handleError показывает toast уведомление
6. ErrorDisplay отображает детальную информацию
7. Пользователь может повторить или закрыть
8. Метрики отправляются в систему мониторинга
```
