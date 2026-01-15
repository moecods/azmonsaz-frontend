import { useState, useCallback, useMemo } from 'react';

export interface UsePaginationProps {
  /**
   * Total number of items
   */
  total: number;
  /**
   * Items per page
   * @default 10
   */
  perPage?: number;
  /**
   * Initial page
   * @default 1
   */
  initialPage?: number;
}

export interface UsePaginationReturn {
  /**
   * Current page (1-indexed)
   */
  page: number;
  /**
   * Items per page
   */
  perPage: number;
  /**
   * Total number of items
   */
  total: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Go to specific page
   */
  goToPage: (page: number) => void;
  /**
   * Go to next page
   */
  nextPage: () => void;
  /**
   * Go to previous page
   */
  prevPage: () => void;
  /**
   * Go to first page
   */
  firstPage: () => void;
  /**
   * Go to last page
   */
  lastPage: () => void;
  /**
   * Check if can go to next page
   */
  hasNextPage: boolean;
  /**
   * Check if can go to previous page
   */
  hasPrevPage: boolean;
  /**
   * Start index for current page (0-indexed)
   */
  startIndex: number;
  /**
   * End index for current page (0-indexed)
   */
  endIndex: number;
}

/**
 * Custom hook for managing pagination state
 * 
 * @param props - Pagination configuration
 * @returns Pagination state and handlers
 * 
 * @example
 * ```tsx
 * const pagination = usePagination({ total: 100, perPage: 10 });
 * 
 * return (
 *   <Pagination
 *     page={pagination.page}
 *     count={pagination.totalPages}
 *     onChange={(_, page) => pagination.goToPage(page)}
 *   />
 * );
 * ```
 */
export function usePagination({
  total,
  perPage = 10,
  initialPage = 1,
}: UsePaginationProps): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);

  const totalPages = useMemo(() => Math.ceil(total / perPage), [total, perPage]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const startIndex = (page - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);

  return {
    page,
    perPage,
    total,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
  };
}

