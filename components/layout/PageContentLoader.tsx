"use client";

import { Box, CircularProgress, LinearProgress } from "@mui/material";

interface PageContentLoaderProps {
  /** True when there is no cached data yet (first load). */
  isLoading: boolean;
  /** True when refetching in the background (cached data may still show). */
  isFetching?: boolean;
  children: React.ReactNode;
}

/**
 * Shows loading only in the main content area — sidebar stays interactive.
 */
export default function PageContentLoader({
  isLoading,
  isFetching = false,
  children,
}: PageContentLoaderProps) {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240} p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {isFetching && (
        <LinearProgress
          sx={{ mb: 2, borderRadius: 1 }}
          aria-label="در حال بارگذاری"
        />
      )}
      {children}
    </>
  );
}
