"use client";

import { Box, CircularProgress, LinearProgress } from "@mui/material";

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
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={280} p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {fetching && (
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} aria-label="در حال بارگذاری" />
      )}
      {children}
    </>
  );
}
