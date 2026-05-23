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
import { Box, LinearProgress } from "@mui/material";

const StartNavigationContext = createContext<(() => void) | null>(null);

export function useStartNavigation() {
  const start = useContext(StartNavigationContext);
  return start ?? (() => {});
}

/**
 * Route-transition feedback: top progress bar only.
 * Page content stays mounted; use route loading.tsx + per-page query skeletons for data.
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
        {isNavigating && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
            aria-label="در حال بارگذاری صفحه"
          />
        )}
        {children}
      </Box>
    </StartNavigationContext.Provider>
  );
}
