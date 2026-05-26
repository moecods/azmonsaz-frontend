"use client";

import {
  Box,
  Container,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { authPageSx } from "@/components/auth/auth-layout";
import { LANDING_BENEFITS } from "@/components/landing/landing-data";

export function LandingBenefits() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="benefits"
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: (t) =>
          t.palette.mode === "dark" ? alpha(t.palette.primary.main, 0.04) : "grey.50",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
              چرا تیم‌های آموزشی ما را انتخاب می‌کنند؟
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.85 }}>
              تمرکز بر سادگی کاربری، امنیت داده و گزارش‌دهی دقیق — بدون پیچیدگی‌های
              غیرضروری.
            </Typography>
            <Stack spacing={1.5}>
              {LANDING_BENEFITS.map((benefit) => (
                <Stack key={benefit} direction="row" spacing={1.5} alignItems="flex-start">
                  <CheckCircleRoundedIcon sx={{ color: "success.main", mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                    {benefit}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              color: "primary.contrastText",
              position: "relative",
              overflow: "hidden",
              ...authPageSx.brandPanel(theme),
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: "50%",
                bgcolor: alpha("#fff", 0.08),
                top: -60,
                insetInlineEnd: -40,
              }}
            />
            <Stack spacing={2} sx={{ position: "relative" }}>
              <Typography variant="h5" fontWeight={800}>
                یک پنل برای کل سازمان
              </Typography>
              <Typography sx={{ opacity: 0.92, lineHeight: 1.85 }}>
                مدیران، ناظران و آزمون‌دهندگان هر کدام نمای مخصوص خود را دارند؛
                همه زیر یک سقف و با کنترل دسترسی شفاف.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                  pt: 1,
                }}
              >
                {["بانک سوال", "ساخت آزمون", "گروه‌ها", "گزارش‌ها"].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha("#fff", 0.12),
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
