"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Container, Paper, Stack } from "@mui/material";
import AuthBrandLogo from "@/components/auth/AuthBrandLogo";
import { authPageSx } from "@/components/auth/auth-layout";

export interface AuthShellProps {
  children: ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
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
                bgcolor: "background.default",
                borderInlineEnd: { md: 1 },
                borderColor: "divider",
              }}
            >
              <Stack spacing={2.5}>
                <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
                  <Stack justifyContent="center" alignItems="center">
                    <AuthBrandLogo variant="withNameAndSlogan" />
                  </Stack>
                </Link>
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
