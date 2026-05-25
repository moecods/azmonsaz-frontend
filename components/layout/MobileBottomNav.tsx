"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import NotificationBell, {
  useNotificationUnreadCount,
} from "@/components/notifications/NotificationBell";
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
} from "@/components/layout/layout-constants";
import {
  getActiveMobileDockTabId,
  getMenuTabIcon,
  mobileDockTabs,
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
  onPress: (el: HTMLElement) => void;
  /** No primary ring/background when active (e.g. notifications + profile cluster). */
  hideActiveHighlight?: boolean;
}) {
  const theme = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const showHighlight = isActive && !hideActiveHighlight;

  return (
    <Box
      ref={buttonRef}
      component="button"
      type="button"
      onClick={() => {
        if (buttonRef.current) onPress(buttonRef.current);
      }}
      data-cy={`nav-mobile-${tab.id}`}
      aria-expanded={tab.action === "toggle-menu" && isActive ? true : undefined}
      aria-current={tab.path && isActive ? "page" : undefined}
      sx={{
        flex: 1,
        minWidth: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        py: 0.75,
        px: 0.25,
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
          borderRadius: "50%",
          bgcolor: showHighlight ? alpha(theme.palette.primary.main, 0.12) : "transparent",
          "& .MuiSvgIcon-root": { fontSize: 22 },
        }}
      >
        {icon}
        {badge != null && badge > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: 2,
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
          maxWidth: "100%",
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
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuExpanded(false), []);

  useEffect(() => {
    closeMenu();
    setNotifOpen(false);
    setNotifAnchor(null);
  }, [pathname, closeMenu]);

  if (!isMobile || !user) {
    return null;
  }

  const activeId = getActiveMobileDockTabId(pathname, {
    menuExpanded,
    notificationsOpen: notifOpen,
  });

  const navigate = (path: string) => {
    closeMenu();
    setNotifOpen(false);
    if (path !== pathname) {
      startNavigation();
      router.push(path);
    }
  };

  const handleTabPress = (tab: MobileDockTab, el: HTMLElement) => {
    if (tab.action === "toggle-menu") {
      setNotifOpen(false);
      setMenuExpanded((prev) => !prev);
      return;
    }
    if (tab.action === "notifications") {
      setMenuExpanded(false);
      setNotifAnchor(el);
      setNotifOpen(true);
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
          sx={{ width: 28, height: 28, fontSize: "0.7rem" }}
        />
      );
    }
    return tab.icon;
  };

  const mainTabs = mobileDockTabs.filter(
    (t) => t.id === "home" || t.id === "my-exams"
  );
  const accountTabs = mobileDockTabs.filter(
    (t) => t.id === "notifications" || t.id === "profile"
  );
  const menuTab = mobileDockTabs.find((t) => t.id === "menu");

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

      <NotificationBell
        hideTrigger
        anchorEl={notifAnchor}
        open={notifOpen}
        onClose={() => {
          setNotifOpen(false);
          setNotifAnchor(null);
        }}
      />

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
            display: "flex",
            alignItems: "stretch",
            minHeight: MOBILE_BOTTOM_NAV_HEIGHT,
            maxWidth: 560,
            mx: "auto",
          }}
        >
          {mainTabs.map((tab) => (
            <DockTab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeId}
              icon={resolveIcon(tab, tab.id === activeId)}
              onPress={(el) => handleTabPress(tab, el)}
            />
          ))}

          <Box
            sx={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "stretch",
              gap: 0.25,
            }}
          >
            {accountTabs.map((tab) => (
              <Box key={tab.id} sx={{ width: 56, display: "flex" }}>
                <DockTab
                  tab={tab}
                  isActive={tab.id === activeId}
                  hideActiveHighlight
                  icon={resolveIcon(tab, tab.id === activeId)}
                  badge={tab.id === "notifications" ? unreadCount : undefined}
                  onPress={(el) => handleTabPress(tab, el)}
                />
              </Box>
            ))}
          </Box>

          {menuTab && (
            <DockTab
              tab={menuTab}
              isActive={menuTab.id === activeId}
              icon={resolveIcon(menuTab, menuTab.id === activeId)}
              onPress={(el) => handleTabPress(menuTab, el)}
            />
          )}
        </Box>
      </Paper>
    </>
  );
}
