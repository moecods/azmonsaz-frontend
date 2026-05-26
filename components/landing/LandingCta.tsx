"use client";

import { Box, Button, Container, Stack, Typography, alpha, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { authPageSx } from "@/components/auth/auth-layout";

interface LandingCtaProps {
  showLoggedIn: boolean;
  onPrimaryAction: () => void;
}

export function LandingCta({ showLoggedIn, onPrimaryAction }: LandingCtaProps) {
  const theme = useTheme();

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 8 }, px: { xs: 2, md: 0 } }}>
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 4, md: 5 },
            px: { xs: 3, md: 5 },
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
              width: 280,
              height: 280,
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.06),
              bottom: -100,
              insetInlineStart: -60,
            }}
          />
          <Stack spacing={2.5} alignItems="center" sx={{ position: "relative" }}>
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
              آماده شروع هستید؟
            </Typography>
            <Typography sx={{ opacity: 0.92, maxWidth: 480, lineHeight: 1.85 }}>
              همین حالا وارد شوید و اولین آزمون خود را در چند دقیقه راه‌اندازی کنید.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onPrimaryAction}
              endIcon={<ArrowBackIcon />}
              sx={{
                bgcolor: "background.paper",
                color: "primary.main",
                fontWeight: 800,
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                "&:hover": { bgcolor: alpha("#fff", 0.92) },
              }}
            >
              {showLoggedIn ? "ورود به پنل" : "شروع کنید"}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
