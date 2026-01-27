"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselControlsProps {
  onPrev: () => void;
  onNext: () => void;
}

export function CarouselControls({ onPrev, onNext }: CarouselControlsProps) {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        aria-label="Предыдущий товар"
        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-sm h-8 w-8 sm:h-9 sm:w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        aria-label="Следующий товар"
        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 shadow-sm h-8 w-8 sm:h-9 sm:w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  );
}
