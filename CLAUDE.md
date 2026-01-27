# Инструкция по рефакторингу React-приложения

## Три основные проблемы

### 1. Декомпозиция крупных компонентов

**Структура проекта:**
```
app/
├── components/
│   ├── ui/           # Button, Input, Card
│   └── features/     # ProductCard, ProductsList
├── hooks/            # useProducts, useFilters
├── services/         # API функции
└── types/            # TypeScript типы
```

**Принцип:** Один компонент = одна задача, максимум 200 строк

**Было:**
```tsx
// app/products/page.tsx - 500+ строк
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... 20+ useState, useEffect, 300+ строк JSX
}
```

**Стало:**
```tsx
// app/products/page.tsx
export default function ProductsPage() {
  return <ProductsContainer />;
}

// components/features/products/ProductsContainer.tsx
export function ProductsContainer() {
  const { data, isLoading } = useProducts();
  return <ProductsList products={data} loading={isLoading} />;
}

// hooks/useProducts.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
}

// services/productsService.ts
export async function fetchProducts() {
  const response = await fetch('/api/products');
  return response.json();
}
```

---

### 2. Минимизация состояний

**Правило:** Храни только source of truth, остальное вычисляй

**Было (плохо):**
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [skip, setSkip] = useState(0);  // дублирование!
const [totalPages, setTotalPages] = useState(0);
```

**Стало (хорошо):**
```tsx
// Минимум состояния
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 20;

// Вычисляемые значения
const skip = (currentPage - 1) * ITEMS_PER_PAGE;
const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
```

**Для связанных состояний используй useReducer:**
```tsx
const [state, dispatch] = useReducer(reducer, {
  currentPage: 1,
  itemsPerPage: 20
});

// Вычисляй производные
const skip = (state.currentPage - 1) * state.itemsPerPage;
```

---

### 3. TanStack Query вместо useEffect

**Проблемы useEffect:**
- Race conditions (гонки запросов)
- Ручное управление loading/error
- Нет кэширования
- Сложная обработка ошибок

**Установка:**
```bash
npm install @tanstack/react-query
```

**Setup:**
```tsx
// app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Базовое использование:**

```tsx
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// GET запрос
export function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

// POST/PUT/DELETE запрос
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// В компоненте
function ProductsContainer() {
  const { data, isLoading, error } = useProducts();
  const createMutation = useCreateProduct();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  return <ProductsList products={data} />;
}
```

**Pagination:**
```tsx
export function useProductsPagination() {
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: () => fetchProducts({ 
      skip: (page - 1) * limit, 
      limit 
    }),
    keepPreviousData: true, // плавная пагинация
  });
  
  return { data, isLoading, page, setPage };
}
```

---

## Пошаговый план рефакторинга

### Шаг 1: Установка TanStack Query
```bash
npm install @tanstack/react-query
```
Настроить Providers (см. выше)

### Шаг 2: Выделить API логику
Создать `services/productsService.ts`:
```tsx
export async function fetchProducts(filters?) {
  const response = await fetch('/api/products');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

### Шаг 3: Создать custom hooks
Создать `hooks/useProducts.ts` с useQuery (см. выше)

### Шаг 4: Декомпозировать UI
- Выделить маленькие компоненты (ProductCard, ProductsList)
- Создать container компонент (ProductsContainer)
- Страница только рендерит контейнер

### Шаг 5: Оптимизировать состояния
- Убрать дублирующие useState
- Вычислять производные значения
- Связанные состояния → useReducer

---

## Чеклист

**После рефакторинга проверь:**
- [ ] Компоненты < 200 строк
- [ ] Нет useEffect для fetch
- [ ] API логика в services/
- [ ] Custom hooks в hooks/
- [ ] Минимум useState
- [ ] Нет дублирующих состояний

---

## Ссылки

- React Query: https://tanstack.com/query/latest
- React Docs (useEffect): https://react.dev/reference/react/useEffect#fetching-data-with-effects
- Thinking in React: https://react.dev/learn/thinking-in-react