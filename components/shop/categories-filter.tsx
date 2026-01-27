"use client";

import { cn } from "@/lib/utils";
import { CategoriesSkeleton } from "@/components/skeletons";

interface CategoriesFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  loading?: boolean;
}

export function CategoriesFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  loading,
}: CategoriesFilterProps) {
  if (loading) {
    return <CategoriesSkeleton />;
  }

  return (
    <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
      <button
        onClick={() => onCategoryChange(null)}
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
        const categoryName =
          typeof category === "string" ? category : String(category);
        const uniqueKey =
          categoryName !== "[object Object]" ? categoryName : `category-${index}`;

        return (
          <button
            key={uniqueKey}
            onClick={() => onCategoryChange(categoryName)}
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
  );
}
