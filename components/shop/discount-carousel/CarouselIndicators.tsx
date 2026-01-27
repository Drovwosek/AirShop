"use client";

import { cn } from "@/lib/utils";

interface CarouselIndicatorsProps {
  count: number;
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function CarouselIndicators({
  count,
  currentIndex,
  onSelect,
}: CarouselIndicatorsProps) {
  return (
    <div className="absolute bottom-2 sm:bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
      {Array.from({ length: count }, (_, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={cn(
            "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all",
            idx === currentIndex
              ? "bg-foreground w-3 sm:w-4"
              : "bg-foreground/30 hover:bg-foreground/50"
          )}
        />
      ))}
    </div>
  );
}
