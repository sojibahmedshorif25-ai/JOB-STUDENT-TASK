"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const pages = React.useMemo(() => {
    const range: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i += 1) range.push(i);
    return range;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="iconSm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages[0] > 1 && (
        <>
          <Button variant="outline" size="iconSm" onClick={() => onPageChange(1)}>
            1
          </Button>
          {pages[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="iconSm"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Button variant="outline" size="iconSm" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="iconSm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
