"use client";

import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { LANDING_STEPS } from "@/components/landing/landing-data";

export function LandingHowItWorks() {
  const theme = useTheme();

  return (
    <Box component="section" id="how-it-works" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
            راه‌اندازی
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mt: 1, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
            در چهار قدم آماده برگزاری
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: 2,
            position: "relative",
          }}
        >
          {LANDING_STEPS.map((item, index) => (
            <Paper
              key={item.step}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                position: "relative",
                height: "100%",
                bgcolor: "background.paper",
              }}
            >
              {index < LANDING_STEPS.length - 1 && (
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    position: "absolute",
                    top: 36,
                    insetInlineStart: "100%",
                    width: 16,
                    height: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.25),
                    zIndex: 0,
                  }}
                />
              )}
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {item.desc}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
