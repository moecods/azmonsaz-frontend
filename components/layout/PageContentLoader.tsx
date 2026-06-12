"use client";

import { Box, CircularProgress } from "@mui/material";
import { useMainProgress } from "@/components/layout/MainProgressProvider";

interface PageContentLoaderProps {
  /** True when there is no cached data yet (first load). */
  isLoading: boolean;
  /** True when refetching in the background (cached data may still show). */
  isFetching?: boolean;
  children: React.ReactNode;
}

/**
 * Shows loading only in the main content area — sidebar stays interactive.
 * Background fetches use the sticky bar at the top of main content.
 */
export default function PageContentLoader({
  isLoading,
  isFetching = false,
  children,
}: PageContentLoaderProps) {
  useMainProgress(isFetching ? { active: true } : null);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240} p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
