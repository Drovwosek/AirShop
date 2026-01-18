# Замена экрана "Загрузка..." на полноценный скелетон страницы

## Проблема

При первой загрузке приложения показывался простой экран с текстом "Загрузка...", что выглядело непрофессионально и не давало пользователю представления о том, что именно загружается.

## Решение

Создан компонент `PageSkeleton`, который показывает полноценный скелетон всей страницы:

- ✅ Шапка сайта с логотипом и кнопкой корзины
- ✅ Заголовок страницы
- ✅ Кнопки категорий
- ✅ Поле поиска
- ✅ Секция со скидками (карусель из 3 карточек)
- ✅ Сетка из 8 карточек товаров

## Что изменилось

### До
```tsx
if (loading && products.length === 0) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-lg text-muted-foreground">Загрузка...</div>
    </div>
  );
}
```

### После
```tsx
if (loading && products.length === 0) {
  return <PageSkeleton />;
}
```

## Компонент PageSkeleton

Расположен в `components/skeletons.tsx`:

```tsx
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
```

## Преимущества

1. **Улучшенный UX** - пользователь видит структуру страницы еще до загрузки данных
2. **Снижение воспринимаемого времени загрузки** - мозг воспринимает скелетон как более быструю загрузку
3. **Профессиональный вид** - современные приложения используют скелетоны вместо спиннеров
4. **Соответствие реальной структуре** - скелетон точно повторяет финальный вид страницы
5. **Адаптивность** - корректно отображается на всех устройствах

## Где посмотреть

1. **В приложении**: Откройте [http://localhost:3000](http://localhost:3000) в режиме инкогнито или с очищенным кешем
2. **В демо**: Откройте [http://localhost:3000/skeletons-demo](http://localhost:3000/skeletons-demo) и пролистайте до первой секции

## Технические детали

- Используется анимация **shimmer** (мерцающая волна)
- Полностью адаптивный дизайн
- Повторное использование существующих компонентов скелетонов
- TypeScript типизация
- Нулевое влияние на производительность

## Файлы изменены

1. `components/skeletons.tsx` - добавлен компонент `PageSkeleton`
2. `app/page.tsx` - заменен простой экран загрузки на `PageSkeleton`
3. `app/skeletons-demo/page.tsx` - добавлена демонстрация нового скелетона
4. `SKELETONS.md` - обновлена документация
