"use client";

import { Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Review } from "@/features/product";

interface ProductReviewsProps {
  reviews: Review[];
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={cn(
        "h-4 w-4",
        i < Math.round(rating)
          ? "fill-amber-400 text-amber-400"
          : "fill-muted text-muted"
      )}
    />
  ));
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">
        Отзывы ({reviews.length})
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {reviews.map((review, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border p-2.5 sm:p-4"
          >
            <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                <span className="text-sm sm:text-base font-medium">
                  {review.reviewerName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 ml-8 sm:ml-0">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(review.date)}
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
