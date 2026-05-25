"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useIsAuthenticated } from "@/hooks";

interface GuestRouteProps {
  children: React.ReactNode;
  /** Where to send users who already have a valid auth token */
  redirectTo?: string;
}

/**
 * For public-only pages (login, register). Redirects authenticated users away.
 * Uses token check (useIsAuthenticated), not useAuth().isAuthenticated, because
 * /me is disabled on public pages and would always appear logged out.
 */
export default function GuestRoute({
  children,
  redirectTo = "/dashboard",
}: GuestRouteProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    router.replace(redirectTo);
  }, [mounted, isAuthenticated, router, redirectTo]);

  if (!mounted || isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
