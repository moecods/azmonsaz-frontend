"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";
import UserMenu from "./layout/UserMenu";
import NotificationBell from "./notifications/NotificationBell";
import { useNavbarVisibility } from "@/hooks/useNavbarVisibility";
import NavbarLogo from "./navbar/NavbarLogo";
import NavbarActions from "./navbar/NavbarActions";


interface NavbarProps {
  /** In authenticated grid shell: in-flow bar (not fixed). */
  variant?: "default" | "shell";
}

export default function Navbar({ variant = "default" }: NavbarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isShell = variant === "shell";

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldHideNavbar = useNavbarVisibility();

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <AppBar
      position={isShell ? "static" : "fixed"}
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        borderRadius: "0px",
        bgcolor: "background.paper",
        zIndex: isShell ? 1 : (theme) => theme.zIndex.drawer + 1,
        width: "100%",
      }}
    >
      <Toolbar>
        <NavbarLogo />
        <Box sx={{ flexGrow: 1 }} />
        <NavbarActions />
      </Toolbar>
    </AppBar>
  );
}

