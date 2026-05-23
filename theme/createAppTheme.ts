import { createTheme } from "@mui/material/styles";
import type { ColorMode } from "@/theme/ColorModeProvider";

type Direction = "ltr" | "rtl";
type Locale = "en" | "fa";

export function createAppTheme(
  mode: ColorMode,
  direction: Direction,
  locale: Locale
) {
  return createTheme({
    direction,
    palette: {
      mode,
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
      ...(mode === "light"
        ? {
            background: { default: "#fafafa", paper: "#ffffff" },
            text: {
              primary: "#212121",
              secondary: "#757575",
              disabled: "#bdbdbd",
            },
            divider: "#e0e0e0",
          }
        : {
            background: { default: "#121212", paper: "#1e1e1e" },
            text: {
              primary: "#f5f5f5",
              secondary: "#b0b0b0",
              disabled: "#6e6e6e",
            },
            divider: "rgba(255, 255, 255, 0.12)",
          }),
    },
    typography: {
      fontFamily:
        locale === "fa"
          ? "'Vazirmatn', 'Roboto', 'Arial', sans-serif"
          : "var(--font-geist-sans), 'Roboto', 'Arial', sans-serif",
      h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 },
      h3: { fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.3 },
      h4: { fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.4 },
      h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5 },
      h6: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 },
      body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
      caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5 },
      button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none" },
    },
    spacing: 8,
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": { borderRadius: 8 },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 12 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
    },
  });
}
