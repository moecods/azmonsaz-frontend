"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useAuth } from "@/hooks";
import { useStartNavigation } from "@/components/layout/NavigationProvider";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  getRoleLabel,
  getVisibleSidebarSections,
  resolveActiveMenuPath,
  sidebarMenuItems,
  type SidebarMenuItem,
} from "@/lib/sidebar-nav";

export { sidebarMenuItems } from "@/lib/sidebar-nav";
export type { SidebarMenuItem } from "@/lib/sidebar-nav";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز";

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarBrand() {
  return (
    <Box
      component={Link}
      href="/dashboard"
      prefetch
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 2,
        py: 2,
        textDecoration: "none",
        color: "inherit",
        borderRadius: 2,
        mx: 1,
        mt: 1,
        transition: "background-color 0.15s ease",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
          color: "primary.main",
        }}
      >
        <SchoolIcon />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={800} noWrap>
          {APP_NAME}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          پلتفرم آزمون آنلاین
        </Typography>
      </Box>
    </Box>
  );
}

function SidebarUserCard({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const primaryRole = user?.roles?.[0];

  return (
    <Box
      component={Link}
      href="/profile"
      prefetch
      onClick={() => onNavigate?.()}
      sx={{
        mx: 1.5,
        mb: 1,
        p: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        textDecoration: "none",
        color: "inherit",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: 1,
        },
      }}
    >
      <UserAvatar
        name={user?.name}
        avatarUrl={user?.avatar_url}
        sx={{ width: 44, height: 44, fontSize: "1rem" }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>
          {user?.name || "کاربر"}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {user?.phone_number || "—"}
        </Typography>
        {primaryRole && (
          <Chip
            label={getRoleLabel(primaryRole)}
            size="small"
            sx={{ mt: 0.75, height: 20, fontSize: "0.65rem" }}
          />
        )}
      </Box>
      <ChevronLeftIcon fontSize="small" color="action" />
    </Box>
  );
}

function NavItem({
  item,
  isActive,
  onNavigate,
  onPending,
}: {
  item: SidebarMenuItem;
  isActive: boolean;
  onNavigate?: () => void;
  onPending: (path: string) => void;
}) {
  const theme = useTheme();
  const pathname = usePathname();
  const startNavigation = useStartNavigation();

  return (
    <ListItem disablePadding sx={{ px: 1.5, mb: 0.5 }}>
      <ListItemButton
        component={Link}
        href={item.path}
        prefetch
        onClick={() => {
          if (item.path !== pathname) {
            onPending(item.path);
            startNavigation();
          }
          onNavigate?.();
        }}
        selected={isActive}
        data-cy={`nav-${item.path.slice(1).replace(/\//g, "-")}`}
        sx={{
          borderRadius: 2,
          py: 1.1,
          px: 1.5,
          position: "relative",
          overflow: "hidden",
          "&.Mui-selected": {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.14),
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 8,
              bottom: 8,
              right: 0,
              width: 3,
              borderRadius: "4px 0 0 4px",
              bgcolor: "primary.main",
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: isActive ? "primary.main" : "text.secondary",
          }}
        >
          {item.icon}
        </ListItemIcon>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={isActive ? 700 : 500} noWrap>
            {item.label}
          </Typography>
          {item.description && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {item.description}
            </Typography>
          )}
        </Box>
      </ListItemButton>
    </ListItem>
  );
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const sections = useMemo(() => getVisibleSidebarSections(user), [user]);
  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const activePath = useMemo(
    () => resolveActiveMenuPath(pathname, flatItems),
    [pathname, flatItems]
  );

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

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
      }}
    >
      <SidebarBrand />
      <SidebarUserCard onNavigate={onNavigate} />

      <Divider sx={{ mx: 2, mb: 1 }} />

      <Box sx={{ flex: 1, overflowY: "auto", py: 0.5, pb: 2 }}>
        {sections.map((section, sectionIndex) => (
          <Box key={section.id} sx={{ mb: sectionIndex < sections.length - 1 ? 1.5 : 0 }}>
            {section.label && (
              <Typography
                variant="overline"
                sx={{
                  px: 2.5,
                  pt: 1,
                  pb: 0.75,
                  display: "block",
                  color: "text.disabled",
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  fontSize: "0.68rem",
                }}
              >
                {section.label}
              </Typography>
            )}
            <List disablePadding>
              {section.items.map((item) => {
                const isActive = activePath === item.path || pendingPath === item.path;
                return (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={isActive}
                    onNavigate={onNavigate}
                    onPending={setPendingPath}
                  />
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
