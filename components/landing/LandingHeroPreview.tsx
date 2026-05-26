"use client";

import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

/** Decorative product preview for the hero — not live data */
export function LandingHeroPreview() {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 24px 48px rgba(0,0,0,0.35)"
            : "0 24px 48px rgba(15, 23, 42, 0.12)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />
      <Stack spacing={2} sx={{ position: "relative" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            نمای کلی آزمون‌ها
          </Typography>
          <Chip size="small" label="زنده" color="success" variant="outlined" />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1.5,
          }}
        >
          {[
            { icon: <AssignmentTurnedInIcon fontSize="small" />, label: "آزمون فعال", value: "۱۲" },
            { icon: <PeopleIcon fontSize="small" />, label: "شرکت‌کننده", value: "۳۴۸" },
            { icon: <TrendingUpIcon fontSize="small" />, label: "میانگین نمره", value: "۷۸٪" },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <Box sx={{ color: "primary.main", mb: 0.5 }}>{item.icon}</Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="body2" fontWeight={600}>
              آزمون ریاضی — پایه دوازدهم
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ۶۵٪ تکمیل
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        <Stack spacing={1}>
          {["علی رضایی — ۱۹/۲۰", "مریم احمدی — در حال برگزاری", "گروه الف — ۲۴ نفر"].map(
            (row) => (
              <Stack
                key={row}
                direction="row"
                alignItems="center"
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    ml: 1.5,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{row}</Typography>
              </Stack>
            )
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
