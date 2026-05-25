"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Container, Paper, Stack, Typography, alpha, useTheme } from "@mui/material";
import AuthBrandLogo from "@/components/auth/AuthBrandLogo";
import { APP_NAME_FA, authPageSx } from "@/components/auth/auth-layout";

export interface AuthShellProps {
  children: ReactNode;
  /** Short line under app name on brand panel */
  brandTagline: string;
  brandBullets?: string[];
}

export default function AuthShell({
  children,
  brandTagline,
  brandBullets = [],
}: AuthShellProps) {
  const theme = useTheme();

  return (
    <Box sx={authPageSx.root}>
      <Container maxWidth="md" disableGutters sx={{ width: "100%" }}>
        <Paper elevation={0} sx={authPageSx.card}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              minHeight: { xs: "auto", md: 560 },
            }}
          >
            <Box
              sx={{
                flex: { md: "0 0 42%" },
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "primary.contrastText",
                position: "relative",
                overflow: "hidden",
                ...authPageSx.brandPanel(theme),
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.08),
                  top: -80,
                  insetInlineEnd: -60,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.06),
                  bottom: -50,
                  insetInlineStart: -40,
                }}
              />

              <Stack spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
                <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AuthBrandLogo />
                    <Box>
                      <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                        {APP_NAME_FA}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.88 }}>
                        پلتفرم آزمون آنلاین
                      </Typography>
                    </Box>
                  </Stack>
                </Link>

                <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.75, maxWidth: 280 }}>
                  {brandTagline}
                </Typography>

                {brandBullets.length > 0 && (
                  <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25, opacity: 0.9 }}>
                    {brandBullets.map((item) => (
                      <Typography key={item} component="li" variant="body2">
                        {item}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: { xs: 2.5, sm: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {children}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
