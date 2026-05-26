import { createTheme } from "@mui/material/styles";
import type { ColorMode } from "@/theme/ColorModeProvider";
import { paletteTokens, spacingUnit, typographyTokens } from "@/theme/tokens";

type Direction = "ltr" | "rtl";
type Locale = "en" | "fa";

export function createAppTheme(
  mode: ColorMode,
  direction: Direction,
  locale: Locale
) {
  const isLight = mode === "light";
  const neutral = isLight ? paletteTokens.light : paletteTokens.dark;

  return createTheme({
    direction,
    palette: {
      mode,
      primary: paletteTokens.primary,
      secondary: paletteTokens.secondary,
      success: paletteTokens.success,
      warning: paletteTokens.warning,
      error: paletteTokens.error,
      info: paletteTokens.info,
      background: neutral.background,
      text: neutral.text,
      divider: neutral.divider,
    },
    typography: {
      fontFamily:
        locale === "fa"
          ? typographyTokens.fontFamily.fa
          : typographyTokens.fontFamily.en,
      h1: typographyTokens.h1,
      h2: typographyTokens.h2,
      h3: typographyTokens.h3,
      h4: typographyTokens.h4,
      h5: typographyTokens.h5,
      h6: typographyTokens.h6,
      body1: typographyTokens.body1,
      body2: typographyTokens.body2,
      caption: typographyTokens.caption,
      button: typographyTokens.button,
    },
    spacing: spacingUnit,
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
