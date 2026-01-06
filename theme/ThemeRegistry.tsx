"use client";
import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { createTheme, ThemeProvider } from "@mui/material/styles";

type Direction = "ltr" | "rtl";
type Locale = "en" | "fa";

function createEmotionCache(direction: Direction) {
  return createCache({
    key: direction === "rtl" ? "mui-rtl" : "mui",
    stylisPlugins: direction === "rtl" ? [prefixer, rtlPlugin] : [prefixer],
    prepend: true,
  });
}

function getDocumentDirection(): Direction {
  if (typeof document === "undefined") return "ltr";
  return (document.documentElement.getAttribute("dir") as Direction) || "ltr";
}

function getDocumentLocale(): Locale {
  if (typeof document === "undefined") return "en";
  return (document.documentElement.getAttribute("lang") as Locale) || "en";
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = React.useState<Direction>("ltr");
  const [locale, setLocale] = React.useState<Locale>("en");

  React.useEffect(() => {
    const dir = getDocumentDirection();
    const lang = getDocumentLocale();
    setDirection(dir);
    setLocale(lang);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.classList.remove("dir-ltr", "dir-rtl");
    document.documentElement.classList.add(dir === "rtl" ? "dir-rtl" : "dir-ltr");
  }, []);

  const cache = React.useMemo(() => createEmotionCache(direction), [direction]);
  const theme = React.useMemo(
    () =>
      createTheme({
        direction,
        palette: {
          primary: {
            main: "#1976d2",
            light: "#42a5f5",
            dark: "#1565c0",
          },
          secondary: {
            main: "#dc004e",
            light: "#ff5983",
            dark: "#9a0036",
          },
          background: {
            default: "#fafafa",
            paper: "#ffffff",
          },
        },
        typography: {
          fontFamily: locale === "fa" 
            ? "Vazirmatn, Tahoma, Arial, sans-serif" 
            : "var(--font-geist-sans), Arial, sans-serif",
          h1: {
            fontSize: "2.5rem",
            fontWeight: 600,
          },
          h2: {
            fontSize: "2rem",
            fontWeight: 600,
          },
          h3: {
            fontSize: "1.75rem",
            fontWeight: 500,
          },
          h4: {
            fontSize: "1.5rem",
            fontWeight: 500,
          },
          h5: {
            fontSize: "1.25rem",
            fontWeight: 500,
          },
          h6: {
            fontSize: "1rem",
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 8,
                },
              },
            },
          },
        },
      }),
    [direction, locale]
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}


