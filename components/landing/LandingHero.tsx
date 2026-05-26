"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { APP_NAME_FA, authPageSx } from "@/components/auth/auth-layout";
import { LANDING_STATS } from "@/components/landing/landing-data";
import { LandingHeroPreview } from "@/components/landing/LandingHeroPreview";

interface LandingHeroProps {
  showLoggedIn: boolean;
  onPrimaryAction: () => void;
}

export function LandingHero({ showLoggedIn, onPrimaryAction }: LandingHeroProps) {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 4, md: 8 },
        pb: { xs: 6, md: 10 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: (t) =>
            t.palette.mode === "dark"
              ? `radial-gradient(ellipse 80% 60% at 50% -20%, ${alpha(t.palette.primary.main, 0.25)} 0%, transparent 70%)`
              : `radial-gradient(ellipse 80% 60% at 50% -20%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          top: -120,
          insetInlineEnd: -80,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: { xs: 4, lg: 6 },
            alignItems: "center",
          }}
        >
          <Stack spacing={3}>
            <Chip
              label="پلتفرم ارزشیابی آنلاین"
              size="small"
              sx={{
                alignSelf: { xs: "center", lg: "flex-start" },
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            />

            <Typography
              variant="h2"
              component="h1"
              fontWeight={900}
              sx={{
                fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
                lineHeight: 1.15,
                textAlign: { xs: "center", lg: "start" },
              }}
            >
              با{" "}
              <Box
                component="span"
                sx={{
                  background: authPageSx.brandPanel(theme).background,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {APP_NAME_FA}
              </Box>
              ، آزمون بسازید و نتیجه بگیرید
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={400}
              sx={{
                lineHeight: 1.85,
                maxWidth: 520,
                fontSize: { xs: "1rem", md: "1.15rem" },
                textAlign: { xs: "center", lg: "start" },
                mx: { xs: "auto", lg: 0 },
              }}
            >
              طراحی سوال، برگزاری آزمون آنلاین و تحلیل نتایج — همه در یک پنل یکپارچه
              برای مدارس، دانشگاه‌ها و سازمان‌های آموزشی.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                justifyContent: { xs: "center", lg: "flex-start" },
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={onPrimaryAction}
                endIcon={<RocketLaunchIcon />}
                sx={{
                  py: 1.5,
                  px: 3.5,
                  fontWeight: 800,
                  fontSize: "1rem",
                  borderRadius: 2.5,
                  boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                {showLoggedIn ? "رفتن به پنل" : "شروع رایگان"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                endIcon={<ArrowBackIcon sx={{ transform: "rotate(180deg)" }} />}
                sx={{ py: 1.5, px: 3, fontWeight: 700, borderRadius: 2.5 }}
              >
                مشاهده امکانات
              </Button>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 2,
                pt: 1,
                maxWidth: 480,
                mx: { xs: "auto", lg: 0 },
              }}
            >
              {LANDING_STATS.map((stat) => (
                <Box key={stat.label}>
                  <Typography variant="h6" fontWeight={800} color="primary.main">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>

          <Box sx={{ maxWidth: 480, mx: { xs: "auto", lg: 0 }, width: "100%" }}>
            <LandingHeroPreview />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
