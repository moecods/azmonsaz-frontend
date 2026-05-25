"use client";

import { AppBar, Toolbar, Box } from "@mui/material";
import NavbarLogo from "./navbar/NavbarLogo";
import NavbarActions from "./navbar/NavbarActions";

/**
 * Top bar for public / non-shell routes (login, marketing, etc.).
 * Authenticated app shell uses sidebar + ShellChrome instead.
 */
export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        borderRadius: "0px",
        bgcolor: "background.paper",
        zIndex: (theme) => theme.zIndex.drawer + 1,
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
