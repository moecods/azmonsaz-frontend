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
  // Always create cache with RTL settings since HTML is always RTL
  // This ensures consistency between server and client rendering
  // Use prepend: false to prevent hydration mismatch with Next.js App Router
  return createCache({
    key: "mui-rtl", // Always use RTL key since HTML is RTL
    stylisPlugins: [prefixer, rtlPlugin], // Always use RTL plugins
    prepend: false, // Set to false to prevent hydration mismatch
  });
}

function getDocumentDirection(): Direction {
  if (typeof document === "undefined") return "rtl"; // Default to RTL to match HTML
  return (document.documentElement.getAttribute("dir") as Direction) || "rtl";
}

function getDocumentLocale(): Locale {
  if (typeof document === "undefined") return "fa"; // Default to FA to match HTML
  return (document.documentElement.getAttribute("lang") as Locale) || "fa";
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  // Initialize with values from HTML to prevent hydration mismatch
  // The HTML has lang="fa" dir="rtl", so we start with those values
  const [direction, setDirection] = React.useState<Direction>(() => {
    if (typeof document !== "undefined") {
      return getDocumentDirection();
    }
    // Default to RTL to match the HTML attribute
    return "rtl";
  });
  const [locale, setLocale] = React.useState<Locale>(() => {
    if (typeof document !== "undefined") {
      return getDocumentLocale();
    }
    // Default to FA to match the HTML attribute
    return "fa";
  });

  React.useEffect(() => {
    const dir = getDocumentDirection();
    const lang = getDocumentLocale();
    setDirection(dir);
    setLocale(lang);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.classList.remove("dir-ltr", "dir-rtl");
    document.documentElement.classList.add(dir === "rtl" ? "dir-rtl" : "dir-ltr");
  }, []);

  // Create cache with fixed RTL direction to prevent hydration mismatch
  // Since our HTML is always RTL, we always create cache with RTL settings
  // This ensures server and client use the same cache configuration
  const cache = React.useMemo(() => createEmotionCache("rtl"), []);
  const theme = React.useMemo(
    () =>
      createTheme({
        direction,
        palette: {
          primary: {
            main: "#1976d2",
            light: "#42a5f5",
            dark: "#1565c0",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#dc004e",
            light: "#ff5983",
            dark: "#9a0036",
            contrastText: "#ffffff",
          },
          success: {
            main: "#2e7d32",
            light: "#4caf50",
            dark: "#1b5e20",
          },
          warning: {
            main: "#ed6c02",
            light: "#ff9800",
            dark: "#e65100",
          },
          error: {
            main: "#d32f2f",
            light: "#ef5350",
            dark: "#c62828",
          },
          info: {
            main: "#0288d1",
            light: "#03a9f4",
            dark: "#01579b",
          },
          background: {
            default: "#fafafa",
            paper: "#ffffff",
          },
          text: {
            primary: "#212121",
            secondary: "#757575",
            disabled: "#bdbdbd",
          },
          divider: "#e0e0e0",
        },
        typography: {
          fontFamily: locale === "fa" 
            ? "'Vazirmatn', 'Roboto', 'Arial', sans-serif" 
            : "var(--font-geist-sans), 'Roboto', 'Arial', sans-serif",
          h1: {
            fontSize: "2.5rem", // 40px
            fontWeight: 700,
            lineHeight: 1.2,
          },
          h2: {
            fontSize: "2rem", // 32px
            fontWeight: 700,
            lineHeight: 1.2,
          },
          h3: {
            fontSize: "1.75rem", // 28px
            fontWeight: 500,
            lineHeight: 1.3,
          },
          h4: {
            fontSize: "1.5rem", // 24px
            fontWeight: 500,
            lineHeight: 1.4,
          },
          h5: {
            fontSize: "1.25rem", // 20px
            fontWeight: 500,
            lineHeight: 1.5,
          },
          h6: {
            fontSize: "1rem", // 16px
            fontWeight: 500,
            lineHeight: 1.5,
          },
          body1: {
            fontSize: "1rem", // 16px
            fontWeight: 400,
            lineHeight: 1.5,
          },
          body2: {
            fontSize: "0.875rem", // 14px
            fontWeight: 400,
            lineHeight: 1.5,
          },
          caption: {
            fontSize: "0.75rem", // 12px
            fontWeight: 400,
            lineHeight: 1.5,
          },
          button: {
            fontSize: "0.875rem", // 14px
            fontWeight: 500,
            textTransform: "none",
          },
        },
        spacing: 8, // 8px grid system
        shape: {
          borderRadius: 8, // Default border radius
        },
        shadows: [
          "none",
          "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
          "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
          "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
          "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
          "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
          "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)",
          "0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)",
          "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
          "0px 5px 6px -3px rgba(0,0,0,0.2), 0px 9px 12px 1px rgba(0,0,0,0.14), 0px 3px 16px 2px rgba(0,0,0,0.12)",
          "0px 6px 6px -3px rgba(0,0,0,0.2), 0px 10px 14px 1px rgba(0,0,0,0.14), 0px 4px 18px 3px rgba(0,0,0,0.12)",
          "0px 6px 7px -4px rgba(0,0,0,0.2), 0px 11px 15px 1px rgba(0,0,0,0.14), 0px 4px 20px 3px rgba(0,0,0,0.12)",
          "0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12)",
          "0px 7px 9px -4px rgba(0,0,0,0.2), 0px 14px 21px 2px rgba(0,0,0,0.14), 0px 5px 26px 4px rgba(0,0,0,0.12)",
          "0px 8px 9px -5px rgba(0,0,0,0.2), 0px 15px 22px 2px rgba(0,0,0,0.14), 0px 6px 28px 5px rgba(0,0,0,0.12)",
          "0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)",
          "0px 9px 11px -5px rgba(0,0,0,0.2), 0px 18px 28px 2px rgba(0,0,0,0.14), 0px 7px 34px 6px rgba(0,0,0,0.12)",
          "0px 9px 12px -6px rgba(0,0,0,0.2), 0px 19px 29px 2px rgba(0,0,0,0.14), 0px 7px 36px 6px rgba(0,0,0,0.12)",
          "0px 10px 13px -6px rgba(0,0,0,0.2), 0px 20px 31px 3px rgba(0,0,0,0.14), 0px 8px 38px 7px rgba(0,0,0,0.12)",
          "0px 10px 13px -6px rgba(0,0,0,0.2), 0px 21px 33px 3px rgba(0,0,0,0.14), 0px 8px 40px 7px rgba(0,0,0,0.12)",
          "0px 11px 14px -7px rgba(0,0,0,0.2), 0px 22px 35px 3px rgba(0,0,0,0.14), 0px 8px 42px 7px rgba(0,0,0,0.12)",
          "0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)",
        ],
        transitions: {
          duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
          },
          easing: {
            easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
            easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
            easeIn: "cubic-bezier(0.4, 0, 1, 1)",
            sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 500,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              },
              sizeSmall: {
                padding: "4px 12px",
                fontSize: "0.875rem",
              },
              sizeLarge: {
                padding: "8px 24px",
                fontSize: "0.9375rem",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
              },
            },
            variants: [
              {
                props: { variant: "outlined" },
                style: {
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: "divider",
                },
              },
              {
                props: { variant: "flat" },
                style: {
                  boxShadow: "none",
                  border: "none",
                },
              },
            ],
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
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 12,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
              rounded: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [direction, locale]
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <div suppressHydrationWarning style={{ display: 'contents' }}>
          {children}
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}


