"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageCarouselProps {
  images: string[];
  thumbnail: string;
  title: string;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSelect: (index: number) => void;
}

export function ProductImageCarousel({
  images,
  thumbnail,
  title,
  currentIndex,
  onNext,
  onPrev,
  onSelect,
}: ProductImageCarouselProps) {
  return (
    <div className="relative aspect-square sm:aspect-video w-full bg-muted">
      <Image
        src={images[currentIndex] || thumbnail}
        alt={title}
        fill
        className="object-contain"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Индикаторы */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(idx)}
                className={cn(
                  "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors",
                  idx === currentIndex
                    ? "bg-foreground"
                    : "bg-foreground/30 hover:bg-foreground/50"
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="hidden sm:flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={cn(
                "relative h-10 w-10 md:h-14 md:w-14 overflow-hidden rounded-md border-2 transition-all",
                idx === currentIndex
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${title} ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
