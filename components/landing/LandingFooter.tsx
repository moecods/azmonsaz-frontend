"use client";

import Link from "next/link";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { APP_NAME_FA } from "@/components/auth/auth-layout";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "center", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            © {year} {APP_NAME_FA}. تمامی حقوق محفوظ است.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography
              component={Link}
              href="/login"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}
            >
              ورود
            </Typography>
            <Typography
              component={Link}
              href="/register"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}
            >
              ثبت‌نام
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
          پلتفرم طراحی و برگزاری آزمون آنلاین
        </Typography>
      </Container>
    </Box>
  );
}
