"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Box, LinearProgress } from "@mui/material";

const StartNavigationContext = createContext<(() => void) | null>(null);

export function useStartNavigation() {
  const start = useContext(StartNavigationContext);
  return start ?? (() => {});
}

type DataProgressInput = {
  /** Show bar (fetching / loading more). */
  active?: boolean;
  /** 0–100 for infinite-scroll style progress; omit for indeterminate. */
  progress?: number;
};

type DataProgressState = {
  active: boolean;
  progress?: number;
};

const DataProgressContext = createContext<{
  setDataProgress: (state: DataProgressState | null) => void;
}>({ setDataProgress: () => {} });

/**
 * Registers page-level loading on the sticky bar at the top of main (below navbar).
 */
export function useMainProgress(input: DataProgressInput | null | undefined) {
  const { setDataProgress } = useContext(DataProgressContext);

  const active = input?.active ?? false;
  const progress = input?.progress;

  useEffect(() => {
    if (!active) {
      setDataProgress(null);
      return;
    }
    setDataProgress({
      active: true,
      progress:
        progress != null && Number.isFinite(progress)
          ? Math.min(100, Math.max(0, progress))
          : undefined,
    });
    return () => setDataProgress(null);
  }, [active, progress, setDataProgress]);
}

function MainTopProgressBar({
  isNavigating,
  dataProgress,
}: {
  isNavigating: boolean;
  dataProgress: DataProgressState | null;
}) {
  const show = isNavigating || (dataProgress?.active ?? false);
  if (!show) return null;

  const hasDeterminate =
    !isNavigating &&
    dataProgress?.progress != null &&
    dataProgress.progress < 100;

  return (
    <Box
      component="div"
      role="progressbar"
      aria-label="در حال بارگذاری"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 9,
        width: "100%",
        flexShrink: 0,
        bgcolor: "background.paper",
      }}
    >
      <LinearProgress
        variant={hasDeterminate ? "determinate" : "indeterminate"}
        value={hasDeterminate ? dataProgress?.progress : undefined}
        color="primary"
        sx={{
          height: 3,
          borderRadius: 0,
          "& .MuiLinearProgress-bar": {
            transition: hasDeterminate ? "transform 0.25s ease" : undefined,
          },
        }}
      />
    </Box>
  );
}

/**
 * Route transitions + optional data-fetch progress at the top of the scrollable main pane.
 */
export function MainProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [dataProgress, setDataProgress] = useState<DataProgressState | null>(null);

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

  const dataCtx = useMemo(() => ({ setDataProgress }), []);

  return (
    <StartNavigationContext.Provider value={startNavigation}>
      <DataProgressContext.Provider value={dataCtx}>
        <MainTopProgressBar isNavigating={isNavigating} dataProgress={dataProgress} />
        {children}
      </DataProgressContext.Provider>
    </StartNavigationContext.Provider>
  );
}
