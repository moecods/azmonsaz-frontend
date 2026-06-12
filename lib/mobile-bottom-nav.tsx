import type { ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { hasPermission } from "@/lib/permissions";
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
  /** Action tab — handled in MobileBottomNav (expand menu) */
  action?: "toggle-menu";
}

type MobileDockUser = { permissions?: string[] } | null | undefined;

/** Creator/admin — dock «آزمون‌ها» opens exam management, not student list. */
export function canManageExams(user: MobileDockUser): boolean {
  return hasPermission(user?.permissions, "view exams");
}

export function getMobileExamsTabPath(user: MobileDockUser): string {
  return canManageExams(user) ? "/exams" : "/exams/available";
}

/** Routes already on the collapsed dock — omitted from the expanded grid menu. */
export function getMobileDockQuickPaths(user: MobileDockUser): Set<string> {
  return new Set(["/dashboard", getMobileExamsTabPath(user), "/notifications", "/profile"]);
}

/** @deprecated Use getMobileDockQuickPaths(user) */
export const mobileDockQuickPaths = new Set(
  ["/dashboard", "/exams/available", "/profile"] as const
);

const mobileDockTabDefs: MobileDockTab[] = [
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
    path: "/notifications",
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

/** @deprecated Use resolveMobileDockTabs(user) */
export const mobileDockTabs = mobileDockTabDefs;

export function resolveMobileDockTabs(user: MobileDockUser): MobileDockTab[] {
  const manage = canManageExams(user);
  const examsPath = getMobileExamsTabPath(user);

  return mobileDockTabDefs.map((tab) => {
    if (tab.id !== "my-exams") return tab;
    return {
      ...tab,
      path: examsPath,
      icon: manage ? <ListAltIcon /> : <AssignmentIcon />,
    };
  });
}

export function isExamManagementPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (isMyExamsPath(pathname)) return false;
  if (pathname === "/exams") return true;
  return pathname.startsWith("/exams/");
}

export function getMenuTabIcon(expanded: boolean): ReactNode {
  return expanded ? <KeyboardArrowDownIcon /> : <MenuIcon />;
}

export function getActiveMobileDockTabId(
  pathname: string | null,
  options: {
    menuExpanded: boolean;
    canManageExams: boolean;
  }
): MobileDockTabId | null {
  if (options.menuExpanded) return "menu";
  if (!pathname) return null;
  if (pathname === "/dashboard") return "home";
  if (pathname === "/notifications") return "notifications";
  if (options.canManageExams ? isExamManagementPath(pathname) : isMyExamsPath(pathname)) {
    return "my-exams";
  }
  if (pathname === "/profile") return "profile";
  return null;
}
