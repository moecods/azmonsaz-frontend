"use client";

import { useEffect, useRef, useState } from "react";
import { Button, CircularProgress, type ButtonProps } from "@mui/material";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  /** Brief success label after loading completes (optional visual flash) */
  successFlash?: string;
  successFlashMs?: number;
}

export function LoadingButton({
  loading = false,
  loadingText,
  successFlash,
  successFlashMs = 1500,
  children,
  disabled,
  startIcon,
  onClick,
  ...rest
}: LoadingButtonProps) {
  const [flash, setFlash] = useState<string | null>(null);
  const wasLoading = useRef(false);

  useEffect(() => {
    if (wasLoading.current && !loading && successFlash) {
      setFlash(successFlash);
      const t = window.setTimeout(() => setFlash(null), successFlashMs);
      return () => window.clearTimeout(t);
    }
    wasLoading.current = loading;
  }, [loading, successFlash, successFlashMs]);

  const label = flash ?? (loading && loadingText ? loadingText : children);
  const showSpinner = loading && !flash;

  return (
    <Button
      {...rest}
      disabled={disabled || loading}
      onClick={loading ? undefined : onClick}
      startIcon={
        showSpinner ? (
          <CircularProgress size={16} color="inherit" aria-hidden />
        ) : (
          startIcon
        )
      }
    >
      {label}
    </Button>
  );
}
