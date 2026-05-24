"use client";

import { Box, CircularProgress } from "@mui/material";
import { useMainProgress } from "@/components/layout/MainProgressProvider";

interface ShellContentLoaderProps {
  loading?: boolean;
  fetching?: boolean;
  children: React.ReactNode;
}

/**
 * In-shell loading: sidebar stays visible; only the main pane shows progress.
 */
export default function ShellContentLoader({
  loading = false,
  fetching = false,
  children,
}: ShellContentLoaderProps) {
  useMainProgress(fetching ? { active: true } : null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={280} p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
