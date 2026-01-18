# Быстрый старт: Обработка ошибок

## 🚀 Начало работы

### 1. Просмотр демонстрации

Запустите приложение и откройте страницу `/errors-demo` чтобы увидеть все возможности системы:

```bash
npm run dev
# Откройте http://localhost:3000/errors-demo
```

### 2. Базовое использование в компоненте

```typescript
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorDisplay } from "@/components/error-display";

function MyComponent() {
  const { error, handleError, clearError } = useErrorHandler();
  
  const loadData = async () => {
    try {
      const response = await fetch("/api/data");
      if (!response.ok) throw response;
      // обработка данных
    } catch (err) {
      handleError(err); // ✨ Автоматически парсит и показывает toast
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

### 3. Еще проще с useAsyncAction

```typescript
import { useAsyncAction } from "@/hooks/use-error-handler";
import { ErrorDisplay } from "@/components/error-display";

function MyComponent() {
  const { loading, data, error, execute } = useAsyncAction();
  
  const loadData = () => execute(async () => {
    const response = await fetch("/api/data");
    if (!response.ok) throw response;
    return await response.json();
  });
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <ErrorDisplay error={error} onRetry={loadData} />;
  return <div>{JSON.stringify(data)}</div>;
}
```

### 4. Retry для нестабильных API

```typescript
import { retryWithBackoff } from "@/lib/errors";

const data = await retryWithBackoff(
  () => fetch("/api/unstable-endpoint").then(r => r.json()),
  3,    // максимум 3 попытки
  1000  // начальная задержка 1 секунда
);
```

## 📊 Типы ошибок

Система автоматически определяет тип ошибки и показывает соответствующую иконку:

| HTTP | Тип | Иконка | Можно повторить |
|------|-----|--------|-----------------|
| Network | `NETWORK_ERROR` | 📡 | ✅ Да |
| 400 | `VALIDATION_ERROR` | ⚠️ | ❌ Нет |
| 401 | `AUTHENTICATION_ERROR` | 🔒 | ❌ Нет |
| 403 | `AUTHORIZATION_ERROR` | 🛡️ | ❌ Нет |
| 404 | `NOT_FOUND` | 🔍 | ❌ Нет |
| 429 | `RATE_LIMIT` | ⏱️ | ✅ Да |
| 500+ | `SERVER_ERROR` | 💥 | ✅ Да |
| Timeout | `TIMEOUT` | ⏰ | ✅ Да |

## 🎨 Варианты отображения

### Полный (с деталями)
```typescript
<ErrorDisplay error={error} onRetry={retry} onDismiss={clear} />
```

### Компактный
```typescript
<ErrorDisplay error={error} compact />
```

### Встроенный
```typescript
<InlineError error={error} />
```

### На всю страницу
```typescript
<FullPageError error={error} onRetry={retry} />
```

## 🛡️ Error Boundary

Оберните приложение для перехвата React ошибок:

```typescript
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

## 📝 Формат ответа с бэкенда

Система поддерживает различные форматы:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email",
      "code": "INVALID_EMAIL"
    }
  ],
  "requestId": "req_123",
  "timestamp": "2026-01-18T10:00:00Z"
}
```

## 💡 Полезные ссылки

- 📖 [Полная документация](ERRORS.md)
- 💻 [Примеры кода](examples/error-handling-examples.tsx)
- 🎯 [Демо страница](/errors-demo)

## ✨ Возможности

- ✅ 8 типов ошибок с иконками и цветами
- ✅ Автоматический парсинг различных форматов
- ✅ Retry логика с экспоненциальной задержкой
- ✅ Toast уведомления
- ✅ Error Boundary
- ✅ TypeScript типизация
- ✅ Поддержка деталей ошибок
- ✅ RequestId для отладки
- ✅ Готовые React хуки
