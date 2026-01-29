"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ITEMS_PER_PAGE_OPTIONS } from "@/features/product";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  skip: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  limit,
  skip,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  return (
    <div className="mt-6 sm:mt-8 mb-8 flex flex-col gap-3 sm:gap-4 bg-card/50 p-3 sm:p-4 rounded-lg border border-border">
      <div className="flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Показано {skip + 1}–{Math.min(skip + limit, total)} из {total}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
              Товаров на странице:
            </span>
            <div className="flex gap-0.5 sm:gap-1 rounded-lg border border-border bg-card p-0.5 sm:p-1">
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => onLimitChange(option)}
                  className={cn(
                    "rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors",
                    limit === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted active:bg-muted"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-0.5 sm:gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                currentPage === 1
                  ? "cursor-not-allowed text-muted-foreground opacity-50"
                  : "text-foreground hover:bg-muted active:bg-muted"
              )}
            >
              <span className="hidden sm:inline">Назад</span>
              <ChevronLeft className="h-4 w-4 sm:hidden" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "min-w-[32px] sm:min-w-[40px] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                    currentPage === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted active:bg-muted"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                currentPage === totalPages
                  ? "cursor-not-allowed text-muted-foreground opacity-50"
                  : "text-foreground hover:bg-muted active:bg-muted"
              )}
            >
              <span className="hidden sm:inline">Вперед</span>
              <ChevronRight className="h-4 w-4 sm:hidden" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
