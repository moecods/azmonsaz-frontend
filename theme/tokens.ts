/**
 * Design tokens — single source of truth for colors, spacing, radius, etc.
 * Used by createAppTheme and documented in docs/DESIGN.md.
 * Do not duplicate hex values elsewhere; import from here or use theme.palette.
 */

export const paletteTokens = {
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
  light: {
    background: { default: "#fafafa", paper: "#ffffff" },
    text: {
      primary: "#212121",
      secondary: "#757575",
      disabled: "#bdbdbd",
    },
    divider: "#e0e0e0",
  },
  dark: {
    background: { default: "#121212", paper: "#1e1e1e" },
    text: {
      primary: "#f5f5f5",
      secondary: "#b0b0b0",
      disabled: "#6e6e6e",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
} as const;

export const typographyTokens = {
  fontFamily: {
    fa: "'Vazirmatn', 'Roboto', 'Arial', sans-serif",
    en: "var(--font-geist-sans), 'Roboto', 'Arial', sans-serif",
  },
  h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 },
  h3: { fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.3 },
  h4: { fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.4 },
  h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5 },
  h6: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 },
  body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5 },
  button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none" as const },
} as const;

/** MUI spacing unit (theme.spacing(1) === 8px) */
export const spacingUnit = 8;

/** Border radius in px — align with theme.shape and component overrides */
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
  round: "50%",
} as const;

export const shadows = {
  cardLight: "0 12px 40px rgba(15, 23, 42, 0.12)",
  cardDark: "0 8px 32px rgba(0, 0, 0, 0.45)",
  elevatedSoft: "0 16px 32px rgba(15, 23, 42, 0.08)",
  primaryGlow: (primaryMain: string) => `0 12px 28px ${primaryMain}59`,
} as const;

export const transitions = {
  fast: "150ms",
  normal: "250ms",
  slow: "350ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/** Motion durations (ms) — use via theme/motion.ts helpers */
export const motionTokens = {
  duration: {
    instant: 0,
    fast: 120,
    normal: 200,
    slow: 300,
  },
  easing: transitions.easing,
  distance: {
    sm: 4,
    md: 8,
  },
} as const;

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;
