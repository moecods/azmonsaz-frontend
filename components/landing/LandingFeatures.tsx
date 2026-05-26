"use client";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { LANDING_FEATURES } from "@/components/landing/landing-data";

export function LandingFeatures() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="features"
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: (t) =>
          t.palette.mode === "dark" ? alpha(t.palette.primary.main, 0.04) : "grey.50",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 }, maxWidth: 640, mx: "auto" }}>
          <Typography
            variant="overline"
            color="primary"
            fontWeight={700}
            letterSpacing={1.5}
            sx={{ display: "block", mb: 1 }}
          >
            امکانات
          </Typography>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
            همه‌چیز برای چرخه کامل آزمون
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            از بانک سوال تا گزارش نهایی — ابزارهایی که تیم آموزشی شما هر روز به آن نیاز دارد.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {LANDING_FEATURES.map((item) => {
            const palette = theme.palette[item.accent];
            return (
              <Card
                key={item.title}
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: palette.main,
                    boxShadow: `0 16px 32px ${alpha(palette.main, 0.12)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mb: 2,
                      bgcolor: alpha(palette.main, 0.12),
                      color: `${item.accent}.main`,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
