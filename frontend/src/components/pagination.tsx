import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  maxDisplayedPages?: number;
}

export function Pagination({ currentPage, onPageChange, hasMore, maxDisplayedPages = 5 }: PaginationProps) {
  const generatePagination = () => {
    const pageNumbers: number[] = [];

    let startPage = Math.max(0, currentPage - Math.floor(maxDisplayedPages / 2));

    for (let i = 0; i < maxDisplayedPages; i++) {
      const pageNumber = startPage + i;
      if (pageNumber >= 0 && (hasMore || pageNumber <= currentPage)) {
        pageNumbers.push(pageNumber);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = generatePagination();

  return (
    <nav className="flex justify-center items-center space-x-2" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? "page" : undefined}
          aria-label={`Page ${page}`}
        >
          {page + 1}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasMore}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
