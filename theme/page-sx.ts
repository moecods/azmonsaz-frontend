import { alpha, type Theme } from "@mui/material/styles";
import { shadows } from "@/theme/tokens";

/**
 * Brand gradient panel (auth sidebar, landing CTA, marketing blocks).
 * Always use this helper — do not copy the gradient string elsewhere.
 */
export function brandPanelSx(theme: Theme) {
  return {
    background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${alpha(theme.palette.primary.light, 0.85)} 100%)`,
    color: theme.palette.primary.contrastText,
  } as const;
}

/** Reusable section vertical padding for marketing / static pages */
export const pageSectionSx = {
  py: { xs: 6, md: 10 },
} as const;

/** Standard elevated card on grey sections */
export const elevatedCardSx = {
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: shadows.elevatedSoft,
  },
} as const;

/** Auth pages + similar split layouts */
export const authPageSx = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    py: { xs: 2, sm: 3 },
    px: { xs: 1.5, sm: 2 },
    bgcolor: (t: Theme) =>
      t.palette.mode === "dark"
        ? t.palette.background.default
        : alpha(t.palette.primary.main, 0.04),
  },
  card: {
    borderRadius: { xs: 3, md: 4 },
    overflow: "hidden",
    bgcolor: "background.paper",
    boxShadow: (t: Theme) =>
      t.palette.mode === "dark" ? shadows.cardDark : shadows.cardLight,
  },
  brandPanel: brandPanelSx,
  primaryButton: {
    py: 1.35,
    fontSize: "1rem",
    fontWeight: 700,
    borderRadius: 2.5,
  },
  field: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  },
} as const;
