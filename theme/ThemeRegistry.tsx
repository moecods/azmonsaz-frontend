"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { ThemeProvider } from "@mui/material/styles";
import { ColorModeProvider, useColorMode } from "@/theme/ColorModeProvider";
import { createAppTheme } from "@/theme/createAppTheme";
import { ToastProvider } from "@/providers/ToastProvider";

type Direction = "ltr" | "rtl";
type Locale = "en" | "fa";

function createEmotionCache() {
  return createCache({
    key: "mui-rtl",
    stylisPlugins: [prefixer, rtlPlugin],
    prepend: false,
  });
}

function getDocumentDirection(): Direction {
  if (typeof document === "undefined") return "rtl";
  return (document.documentElement.getAttribute("dir") as Direction) || "rtl";
}

function getDocumentLocale(): Locale {
  if (typeof document === "undefined") return "fa";
  return (document.documentElement.getAttribute("lang") as Locale) || "fa";
}

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { mode } = useColorMode();
  const [direction, setDirection] = React.useState<Direction>("rtl");
  const [locale, setLocale] = React.useState<Locale>("fa");

  React.useEffect(() => {
    const dir = getDocumentDirection();
    const lang = getDocumentLocale();
    setDirection(dir);
    setLocale(lang);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.classList.remove("dir-ltr", "dir-rtl");
    document.documentElement.classList.add(dir === "rtl" ? "dir-rtl" : "dir-ltr");
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  const theme = React.useMemo(
    () => createAppTheme(mode, direction, locale),
    [mode, direction, locale]
  );

  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => createEmotionCache(), []);

  return (
    <CacheProvider value={cache}>
      <ColorModeProvider>
        <ThemedApp>
          <div suppressHydrationWarning style={{ display: "contents" }}>
            {children}
          </div>
        </ThemedApp>
      </ColorModeProvider>
    </CacheProvider>
  );
}
