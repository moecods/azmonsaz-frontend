"use client";

import { Box, Drawer } from "@mui/material";
import SidebarContent from "@/components/layout/SidebarContent";
import { SIDEBAR_WIDTH } from "@/components/layout/layout-constants";

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "temporary";
}

/** Desktop: in-grid panel (no fixed positioning). */
export function DesktopSidebar() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <SidebarContent />
    </Box>
  );
}

export default function UserSidebar({
  open,
  onClose,
  variant = "temporary",
}: UserSidebarProps) {
  if (variant === "permanent") {
    return <DesktopSidebar />;
  }

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <SidebarContent onNavigate={onClose} />
    </Drawer>
  );
}
