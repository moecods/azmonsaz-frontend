/**
 * Shared visual tokens for the take-exam experience (calm, focused).
 * LEGACY ISOLATED THEME — do not reuse outside take-exam routes.
 * @see docs/DESIGN.md
 */
export const takeExamColors = {
  pageBg: "#f4f6f9",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "rgba(15, 23, 42, 0.08)",
  accent: "#2563eb",
  accentSoft: "rgba(37, 99, 235, 0.08)",
  successSoft: "rgba(22, 163, 74, 0.1)",
  warningSoft: "rgba(234, 179, 8, 0.12)",
};

/** Applied to authenticated shell `<main>` on take-exam routes. */
export const takeExamMainSx = {
  bgcolor: takeExamColors.pageBg,
  backgroundImage:
    "linear-gradient(165deg, #f8fafc 0%, #eef2f7 42%, #f4f6f9 100%)",
} as const;

export const takeExamPageSx = {
  root: {
    minHeight: { xs: "100%", md: "100dvh" },
    width: "100%",
    py: { xs: 0.25, sm: 2 },
    px: { xs: 0, sm: 2 },
  },
  container: {
    maxWidth: 960,
    px: { xs: 0.75, sm: 2 },
  },
  card: {
    borderRadius: { xs: 2, sm: 3 },
    border: "1px solid",
    borderColor: takeExamColors.border,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
    bgcolor: takeExamColors.surface,
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    borderRadius: { xs: 2, sm: 3 },
    border: "1px solid",
    borderColor: takeExamColors.border,
    bgcolor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
  },
} as const;
