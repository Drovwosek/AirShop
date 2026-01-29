"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SearchResultSkeleton } from "@/components/skeletons";
import { Product } from "@/features/product";
import { formatPrice } from "@/lib/format";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  debouncedQuery: string;
  results: Product[];
  loading: boolean;
  isFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onProductSelect: (product: Product) => void;
}

export function SearchBar({
  query,
  onQueryChange,
  debouncedQuery,
  results,
  loading,
  isFocused,
  onFocusChange,
  inputRef,
  onProductSelect,
}: SearchBarProps) {
  return (
    <Popover open={isFocused}>
      <PopoverTrigger asChild>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск товаров..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => onFocusChange(true)}
            onBlur={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (!relatedTarget?.closest("[data-search-popover]")) {
                setTimeout(() => {
                  onFocusChange(false);
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
          const target = e.target as HTMLElement;
          if (
            target === inputRef.current ||
            target.closest("[data-search-popover]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <Command>
          <CommandList>
            {!query.trim() ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Найдите идеальный товар
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Введите название, бренд или категорию
                </p>
              </div>
            ) : loading ? (
              <div className="py-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SearchResultSkeleton key={i} />
                ))}
              </div>
            ) : !loading && debouncedQuery.trim() && results.length === 0 ? (
              <CommandEmpty>
                По запросу &quot;{debouncedQuery}&quot; товары не найдены
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.title}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onProductSelect(product);
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
                        {formatPrice(product.price)}
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
  );
}
