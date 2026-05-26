"use client";

import Link from "next/link";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import AuthBrandLogo from "@/components/auth/AuthBrandLogo";
import { APP_NAME_FA } from "@/components/auth/auth-layout";
import { LANDING_NAV } from "@/components/landing/landing-data";
import { useColorMode } from "@/theme/ColorModeProvider";

interface LandingHeaderProps {
  showLoggedIn: boolean;
  onNavigate: (sectionId: string) => void;
  onAuth: () => void;
  onDashboard: () => void;
}

export function LandingHeader({
  showLoggedIn,
  onNavigate,
  onAuth,
  onDashboard,
}: LandingHeaderProps) {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 1, md: 0.5 }}
      alignItems={{ xs: "stretch", md: "center" }}
    >
      {LANDING_NAV.map((item) => (
        <Button
          key={item.id}
          color="inherit"
          onClick={() => {
            onNavigate(item.id);
            setMenuOpen(false);
          }}
          sx={{
            fontWeight: 600,
            color: "text.primary",
            px: { xs: 1.5, md: 2 },
            justifyContent: { xs: "flex-start", md: "center" },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.82),
        backdropFilter: "blur(12px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 2, py: { xs: 0.5, md: 0 }, minHeight: { xs: 56, md: 64 } }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", flexShrink: 0 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <AuthBrandLogo />
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Box component="span" sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2 }}>
                {APP_NAME_FA}
              </Box>
            </Box>
          </Stack>
        </Link>

        <Box sx={{ flex: 1, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
          {navLinks}
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: "auto" }}>
          <Tooltip title={mode === "light" ? "حالت تاریک" : "حالت روشن"}>
            <IconButton onClick={toggleColorMode} aria-label="تغییر تم">
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {showLoggedIn ? (
            <Button variant="contained" onClick={onDashboard} sx={{ fontWeight: 700, display: { xs: "none", sm: "inline-flex" } }}>
              پنل کاربری
            </Button>
          ) : (
            <>
              <Button
                variant="text"
                onClick={onAuth}
                sx={{ fontWeight: 600, display: { xs: "none", sm: "inline-flex" } }}
              >
                ورود
              </Button>
              <Button
                variant="contained"
                onClick={onAuth}
                sx={{ fontWeight: 700, display: { xs: "none", sm: "inline-flex" } }}
              >
                شروع رایگان
              </Button>
            </>
          )}

          <IconButton
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="منو"
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      </Toolbar>

      {menuOpen && (
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            px: 2,
            pb: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {navLinks}
          <Stack spacing={1} sx={{ mt: 1.5 }}>
            {showLoggedIn ? (
              <Button fullWidth variant="contained" onClick={onDashboard}>
                پنل کاربری
              </Button>
            ) : (
              <>
                <Button fullWidth variant="outlined" onClick={onAuth}>
                  ورود
                </Button>
                <Button fullWidth variant="contained" onClick={onAuth}>
                  شروع رایگان
                </Button>
              </>
            )}
          </Stack>
        </Box>
      )}
    </AppBar>
  );
}
