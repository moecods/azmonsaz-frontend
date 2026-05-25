import { alpha, type Theme } from "@mui/material/styles";

export const APP_NAME_FA = process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز";

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
      t.palette.mode === "dark"
        ? "0 8px 32px rgba(0,0,0,0.45)"
        : "0 12px 40px rgba(15, 23, 42, 0.12)",
  },
  brandPanel: (t: Theme) => ({
    background: `linear-gradient(145deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 55%, ${alpha(t.palette.primary.light, 0.85)} 100%)`,
  }),
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
