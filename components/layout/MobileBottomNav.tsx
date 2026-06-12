"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Collapse,
  Paper,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "@/hooks";
import { useStartNavigation } from "@/components/layout/NavigationProvider";
import UserAvatar from "@/components/ui/UserAvatar";
import MobileMenuSheet from "@/components/layout/MobileMenuSheet";
import { useNotificationUnreadCount } from "@/components/notifications/NotificationBell";
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
} from "@/components/layout/layout-constants";
import {
  canManageExams,
  getActiveMobileDockTabId,
  getMenuTabIcon,
  resolveMobileDockTabs,
  type MobileDockTab,
} from "@/lib/mobile-bottom-nav";

function DockTab({
  tab,
  isActive,
  icon,
  badge,
  onPress,
  hideActiveHighlight = false,
}: {
  tab: MobileDockTab;
  isActive: boolean;
  icon: React.ReactNode;
  badge?: number;
  onPress: () => void;
  /** No primary ring/background when active (e.g. profile avatar). */
  hideActiveHighlight?: boolean;
}) {
  const theme = useTheme();
  const showHighlight = isActive && !hideActiveHighlight;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onPress()}
      data-cy={`nav-mobile-${tab.id}`}
      aria-expanded={tab.action === "toggle-menu" && isActive ? true : undefined}
      aria-current={tab.path && isActive ? "page" : undefined}
      aria-label={tab.label}
      sx={{
        minWidth: 0,
        width: "100%",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        py: 0.75,
        px: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.25,
        color: showHighlight ? "primary.main" : "text.secondary",
        WebkitTapHighlightColor: "transparent",
        transition: "color 0.15s ease",
        "&:active": { opacity: 0.88 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: "50%",
          bgcolor: showHighlight ? alpha(theme.palette.primary.main, 0.12) : "transparent",
          "& .MuiSvgIcon-root": { fontSize: 22 },
        }}
      >
        {icon}
        {badge != null && badge > 0 && (
          <Box
            component="span"
            aria-hidden
            sx={{
              position: "absolute",
              top: -2,
              left: -2,
              minWidth: 16,
              height: 16,
              px: 0.5,
              borderRadius: 8,
              bgcolor: "error.main",
              color: "error.contrastText",
              fontSize: "0.65rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {badge > 9 ? "9+" : badge}
          </Box>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.65rem",
          fontWeight: showHighlight ? 700 : 500,
          lineHeight: 1.2,
          width: "100%",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tab.label}
      </Typography>
    </Box>
  );
}

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const startNavigation = useStartNavigation();
  const unreadCount = useNotificationUnreadCount();

  const [menuExpanded, setMenuExpanded] = useState(false);

  const closeMenu = useCallback(() => setMenuExpanded(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  if (!isMobile || !user) {
    return null;
  }

  const dockTabs = resolveMobileDockTabs(user);
  const userCanManageExams = canManageExams(user);

  const activeId = getActiveMobileDockTabId(pathname, {
    menuExpanded,
    canManageExams: userCanManageExams,
  });

  const navigate = (path: string) => {
    closeMenu();
    if (path !== pathname) {
      startNavigation();
      router.push(path);
    }
  };

  const handleTabPress = (tab: MobileDockTab) => {
    if (tab.action === "toggle-menu") {
      setMenuExpanded((prev) => !prev);
      return;
    }
    if (tab.path) {
      navigate(tab.path);
    }
  };

  const resolveIcon = (tab: MobileDockTab, isActive: boolean): React.ReactNode => {
    if (tab.id === "menu") return getMenuTabIcon(menuExpanded);
    if (tab.id === "profile") {
      return (
        <UserAvatar
          name={user?.name}
          avatarUrl={user?.avatar_url}
          sx={{ width: 24, height: 24, fontSize: "0.65rem" }}
        />
      );
    }
    return tab.icon;
  };

  return (
    <>
      {menuExpanded && (
        <Box
          role="presentation"
          onClick={closeMenu}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: (t) => t.zIndex.drawer,
            bgcolor: alpha(theme.palette.common.black, 0.4),
          }}
        />
      )}

      <Paper
        component="nav"
        aria-label="ناوبری موبایل"
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.drawer + 1,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.97),
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          pb: "env(safe-area-inset-bottom, 0px)",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Collapse in={menuExpanded} timeout={240}>
          <Box
            sx={{
              maxHeight: "min(62vh, 480px)",
              overflowY: "auto",
              overflowX: "hidden",
              borderBottom: 1,
              borderColor: "divider",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <MobileMenuSheet onNavigate={closeMenu} />
          </Box>
        </Collapse>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${dockTabs.length}, minmax(0, 1fr))`,
            alignItems: "stretch",
            minHeight: MOBILE_BOTTOM_NAV_HEIGHT,
            maxWidth: 480,
            mx: "auto",
            px: 0.5,
          }}
        >
          {dockTabs.map((tab) => (
            <DockTab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeId}
              hideActiveHighlight={tab.id === "profile"}
              icon={resolveIcon(tab, tab.id === activeId)}
              badge={tab.id === "notifications" ? unreadCount : undefined}
              onPress={() => handleTabPress(tab)}
            />
          ))}
        </Box>
      </Paper>
    </>
  );
}
