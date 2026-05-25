import type { ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { isMyExamsPath } from "@/lib/sidebar-nav";

export type MobileDockTabId =
  | "home"
  | "my-exams"
  | "notifications"
  | "profile"
  | "menu";

export interface MobileDockTab {
  id: MobileDockTabId;
  label: string;
  icon: ReactNode | null;
  /** Route tab — navigates on tap */
  path?: string;
  /** Action tab — handled in MobileBottomNav (notifications / expand menu) */
  action?: "notifications" | "toggle-menu";
}

/** Routes already on the collapsed dock — omitted from the expanded grid menu. */
export const mobileDockQuickPaths = new Set(
  ["/dashboard", "/exams/available", "/profile"] as const
);

export const mobileDockTabs: MobileDockTab[] = [
  { id: "home", label: "خانه", icon: <DashboardIcon />, path: "/dashboard" },
  {
    id: "my-exams",
    label: "آزمون‌ها",
    icon: <AssignmentIcon />,
    path: "/exams/available",
  },
  {
    id: "notifications",
    label: "اعلان",
    icon: <NotificationsIcon />,
    action: "notifications",
  },
  {
    id: "profile",
    label: "پروفایل",
    icon: null,
    path: "/profile",
  },
  {
    id: "menu",
    label: "منو",
    icon: <MenuIcon />,
    action: "toggle-menu",
  },
];

export function getMenuTabIcon(expanded: boolean): ReactNode {
  return expanded ? <KeyboardArrowDownIcon /> : <MenuIcon />;
}

export function getActiveMobileDockTabId(
  pathname: string | null,
  options: { menuExpanded: boolean; notificationsOpen: boolean }
): MobileDockTabId | null {
  if (options.notificationsOpen) return "notifications";
  if (options.menuExpanded) return "menu";
  if (!pathname) return null;
  if (pathname === "/dashboard") return "home";
  if (isMyExamsPath(pathname)) return "my-exams";
  if (pathname === "/profile") return "profile";
  return null;
}
