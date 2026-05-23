"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ListAltIcon from "@mui/icons-material/ListAlt";
import GroupIcon from "@mui/icons-material/Group";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useAuth } from "@/hooks";
import { useStartNavigation } from "@/components/layout/NavigationProvider";
import { hasPermission, type Permission } from "@/lib/permissions";
import UserAvatar from "@/components/ui/UserAvatar";

export interface SidebarMenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  permission?: Permission;
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  { label: "داشبورد", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "آزمون‌های من", icon: <SchoolIcon />, path: "/exams/available" },
  { label: "مدیریت آزمون‌ها", icon: <ListAltIcon />, path: "/exams", permission: "view exams" },
  { label: "ایجاد آزمون", icon: <SchoolIcon />, path: "/exams/create", permission: "create exams" },
  { label: "بانک سوالات", icon: <QuizIcon />, path: "/questions", permission: "manage questions" },
  { label: "مدیریت گروه‌ها", icon: <GroupIcon />, path: "/groups", permission: "create exams" },
  { label: "پروفایل", icon: <PersonIcon />, path: "/profile" },
  { label: "اشتراک Pro", icon: <WorkspacePremiumIcon />, path: "/subscription" },
  { label: "پشتیبانی و آموزش", icon: <HelpOutlineIcon />, path: "/support" },
  { label: "پنل مدیریت", icon: <AdminPanelSettingsIcon />, path: "/admin", permission: "manage users" },
];

function getRoleLabel(role: string) {
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
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const startNavigation = useStartNavigation();
  const { user } = useAuth();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    sidebarMenuItems.forEach((item) => {
      try {
        router.prefetch(item.path);
      } catch {
        /* ignore */
      }
    });
  }, [router]);

  const filteredMenuItems = sidebarMenuItems.filter((item) => {
    if (item.permission) {
      return hasPermission(user?.permissions, item.permission);
    }
    if (item.roles) {
      return item.roles.some((role) => user?.roles?.includes(role));
    }
    return true;
  });

  const activeStates = useMemo(() => {
    if (!pathname) return new Map<string, boolean>();

    const states = new Map<string, boolean>();
    const exactMatch = filteredMenuItems.find((item) => pathname === item.path);

    if (exactMatch) {
      filteredMenuItems.forEach((item) => {
        states.set(item.path, item.path === exactMatch.path);
      });
    } else {
      const matchingPaths = filteredMenuItems
        .filter((item) => pathname === item.path || pathname.startsWith(item.path + "/"))
        .sort((a, b) => b.path.length - a.path.length);

      const mostSpecific = matchingPaths[0];
      filteredMenuItems.forEach((item) => {
        states.set(item.path, item.path === mostSpecific?.path);
      });
    }

    return states;
  }, [pathname, filteredMenuItems]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 3,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <UserAvatar
            name={user?.name}
            avatarUrl={user?.avatar_url}
            sx={{
              bgcolor: "primary.light",
              width: 56,
              height: 56,
              fontSize: "1.25rem",
            }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {user?.name || "کاربر"}
            </Typography>
            {user?.phone_number && (
              <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
                {user.phone_number}
              </Typography>
            )}
            {user?.roles && user.roles.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                {user.roles.map((role) => (
                  <Chip
                    key={role}
                    label={getRoleLabel(role)}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "inherit",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, pt: 2, overflowY: "auto" }}>
        {filteredMenuItems.map((item, index) => {
          const isActive = activeStates.get(item.path) || false;
          const isPending = pendingPath === item.path;
          const isSelected = isActive || isPending;

          return (
            <ListItem key={`${item.path}-${index}`} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                prefetch
                onClick={() => {
                  if (item.path !== pathname) {
                    setPendingPath(item.path);
                    startNavigation();
                  }
                  onNavigate?.();
                }}
                selected={isSelected}
                data-cy={`nav-${item.path.slice(1).replace(/\//g, "-")}`}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? "primary.contrastText" : "text.secondary",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
