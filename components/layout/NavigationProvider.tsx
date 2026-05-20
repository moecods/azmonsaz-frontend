"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Box, CircularProgress, Skeleton, Stack } from "@mui/material";

const StartNavigationContext = createContext<(() => void) | null>(null);

export function useStartNavigation() {
  const start = useContext(StartNavigationContext);
  return start ?? (() => {});
}

function NavigationSkeleton() {
  return (
    <Stack spacing={2} aria-busy aria-label="در حال بارگذاری صفحه">
      <Skeleton variant="text" width="40%" height={36} />
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="rounded" height={140} />
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    </Stack>
  );
}

/**
 * Replaces stale page content with a skeleton as soon as navigation starts
 * (sidebar click or internal link), instead of waiting for API + route.
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => setIsNavigating(true);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;

      setIsNavigating(true);
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [pathname]);

  return (
    <StartNavigationContext.Provider value={startNavigation}>
      <Box sx={{ position: "relative", minHeight: 200 }}>
        {isNavigating ? <NavigationSkeleton /> : children}
      </Box>
    </StartNavigationContext.Provider>
  );
}
