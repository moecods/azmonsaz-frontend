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


export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldHideNavbar = useNavbarVisibility();

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        borderRadius: '0px',
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.drawer + 1,
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

