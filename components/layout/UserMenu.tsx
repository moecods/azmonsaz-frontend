"use client";

import { useState, MouseEvent } from "react";
import {
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { useColorMode } from "@/theme/ColorModeProvider";
import UserAvatar from "@/components/ui/UserAvatar";
import InstallAppMenuItem from "@/components/pwa/InstallAppMenuItem";

export interface UserMenuProps {
  /** Shell: account actions only (nav is in sidebar / mobile dock). */
  variant?: "shell" | "public";
}

export default function UserMenu({ variant = "public" }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isShell = variant === "shell";

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    router.push("/");
  };

  const handleNavigation = (path: string) => {
    handleClose();
    router.push(path);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "مدیر";
      case "content_manager":
        return "مدیر محتوا";
      case "creator":
        return "سازنده";
      default:
        return role;
    }
  };

  const getRoleColor = (
    role: string
  ): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (role) {
      case "admin":
        return "error";
      case "content_manager":
        return "primary";
      case "creator":
        return "success";
      default:
        return "default";
    }
  };

  if (!user) return null;

  const triggerSx = isShell && isMobile ? { ml: 0.5 } : { ml: 2 };

  return (
    <>
      {isShell && isMobile ? (
        <IconButton
          onClick={handleClick}
          size="small"
          sx={triggerSx}
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          data-cy="user-menu-button"
        >
          <UserAvatar
            name={user.name}
            avatarUrl={user.avatar_url}
            sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
          />
        </IconButton>
      ) : (
        <Button
          onClick={handleClick}
          sx={{
            ...triggerSx,
            textTransform: "none",
            color: "text.primary",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          data-cy="user-menu-button"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {(!isMobile || !isShell) && (
              <Typography variant="body2" fontWeight="medium" noWrap>
                {user.name}
              </Typography>
            )}
            <UserAvatar
              name={user.name}
              avatarUrl={user.avatar_url}
              sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
            />
          </Stack>
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" noWrap>
            {user.name}
          </Typography>
          {user.email && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          )}
          {user.roles && user.roles.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
              {user.roles.map((role) => (
                <Chip
                  key={role}
                  label={getRoleLabel(role)}
                  size="small"
                  color={getRoleColor(role)}
                  sx={{ height: 20, fontSize: "0.65rem" }}
                />
              ))}
            </Stack>
          )}
        </Box>
        <Divider />
        {!isShell && (
          <MenuItem onClick={() => handleNavigation("/dashboard")}>
            <DashboardIcon sx={{ mr: 2, fontSize: 20 }} />
            داشبورد
          </MenuItem>
        )}
        <MenuItem onClick={() => handleNavigation("/profile")}>
          <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
          پروفایل
        </MenuItem>
        <MenuItem
          onClick={() => {
            toggleColorMode();
          }}
        >
          {mode === "light" ? (
            <DarkModeIcon sx={{ mr: 2, fontSize: 20 }} />
          ) : (
            <LightModeIcon sx={{ mr: 2, fontSize: 20 }} />
          )}
          {mode === "light" ? "حالت تاریک" : "حالت روشن"}
        </MenuItem>
        <InstallAppMenuItem onClose={handleClose} />
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }} data-cy="logout-button">
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
          خروج
        </MenuItem>
      </Menu>
    </>
  );
}
