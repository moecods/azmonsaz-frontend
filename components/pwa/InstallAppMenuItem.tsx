"use client";

import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export interface InstallAppMenuItemProps {
  onClose: () => void;
}

/**
 * Shown when Chrome/Edge offer install (beforeinstallprompt). Hidden after install or on unsupported browsers.
 */
export default function InstallAppMenuItem({ onClose }: InstallAppMenuItemProps) {
  const { canInstall, promptInstall } = usePwaInstall();

  if (!canInstall) return null;

  const handleClick = async () => {
    onClose();
    await promptInstall();
  };

  return (
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
        <InstallMobileIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>نصب اپلیکیشن</ListItemText>
    </MenuItem>
  );
}
