"use client";

import { useEffect, useRef } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  onLoadMore: () => void;
  endMessage?: string;
  /** When set, end message only shows once loaded count reached total (avoids false "all loaded"). */
  loadedCount?: number;
  totalCount?: number;
}

/**
 * Observes viewport intersection and triggers onLoadMore for scroll pagination.
 */
export function InfiniteScrollSentinel({
  hasMore,
  isLoading = false,
  isFetchingMore = false,
  onLoadMore,
  endMessage = "همه سوالات بارگذاری شد",
  loadedCount,
  totalCount,
}: InfiniteScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isLoading || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        onLoadMoreRef.current();
      },
      { rootMargin: "320px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetchingMore]);

  const showSpinner = isFetchingMore;
  const reachedTotal =
    totalCount != null &&
    totalCount > 0 &&
    loadedCount != null &&
    loadedCount >= totalCount;
  const showEnd =
    !hasMore &&
    !isLoading &&
    !isFetchingMore &&
    (totalCount == null || totalCount === 0 || reachedTotal);

  return (
    <Box
      ref={sentinelRef}
      sx={{
        py: 2,
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-live="polite"
    >
      {showSpinner && <CircularProgress size={28} aria-label="در حال بارگذاری" />}
      {showEnd && (
        <Typography variant="caption" color="text.secondary">
          {endMessage}
        </Typography>
      )}
    </Box>
  );
}
