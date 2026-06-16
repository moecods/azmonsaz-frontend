import type { ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { hasPermission, type Permission } from "@/lib/permissions";

export interface SidebarMenuItem {
  label: string;
  icon: ReactNode;
  path: string;
  roles?: string[];
  permission?: Permission;
  /** Shorter hint under label */
  description?: string;
}

export interface SidebarNavSection {
  id: string;
  label?: string;
  items: SidebarMenuItem[];
}

export const sidebarNavSections: SidebarNavSection[] = [
  {
    id: "main",
    items: [
      {
        label: "داشبورد",
        icon: <DashboardIcon />,
        path: "/dashboard",
        description: "خلاصه وضعیت",
      },
    ],
  },
  {
    id: "teaching",
    label: "مدیریت آموزشی",
    items: [
      {
        label: "مدیریت آزمون‌ها",
        icon: <ListAltIcon />,
        path: "/exams",
        permission: "view exams",
        description: "لیست و تنظیمات",
      },
      {
        label: "ایجاد آزمون",
        icon: <AddCircleOutlineIcon />,
        path: "/exams/create",
        permission: "create exams",
      },
      {
        label: "بانک سوالات",
        icon: <QuizIcon />,
        path: "/questions",
        permission: "manage questions",
      },
      {
        label: "مدیریت گروه‌ها",
        icon: <GroupIcon />,
        path: "/groups",
        permission: "create exams",
      },
    ],
  },
  {
    id: "student",
    label: "شرکت در آزمون",
    items: [
      {
        label: "آزمون‌های من",
        icon: <AssignmentIcon />,
        path: "/exams/available",
        description: "ثبت‌نام و شرکت",
      },
    ],
  },
  {
    id: "account",
    items: [
      {
        label: "اعلان‌ها",
        icon: <NotificationsIcon />,
        path: "/notifications",
        description: "پیام‌ها و یادآوری‌ها",
      },
      {
        label: "پروفایل",
        icon: <PersonIcon />,
        path: "/profile",
        description: "حساب و امنیت",
      },
    ],
  },
  {
    id: "admin",
    label: "مدیریت سیستم",
    items: [
      {
        label: "پنل مدیریت",
        icon: <AdminPanelSettingsIcon />,
        path: "/admin",
        permission: "manage users",
      },
    ],
  },
];

/** Flat list for prefetch and legacy tests */
export const sidebarMenuItems: SidebarMenuItem[] = sidebarNavSections.flatMap((s) => s.items);

/** Paths that belong to the student "my exams" area (shared with mobile quick nav) */
export function isMyExamsPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/exams/available") return true;
  if (pathname.startsWith("/exams/take/")) return true;
  if (/^\/exams\/\d+\/result/.test(pathname)) return true;
  if (pathname.startsWith("/exams/participate/")) return true;
  return false;
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "مدیر";
    case "content_manager":
      return "مدیر محتوا";
    case "creator":
      return "سازنده";
    case "student":
      return "دانش‌آموز";
    default:
      return role;
  }
}

type SidebarUser = {
  roles?: string[];
  permissions?: string[];
};

function isItemVisible(item: SidebarMenuItem, user: SidebarUser | null | undefined): boolean {
  if (item.permission) {
    return hasPermission(user?.permissions, item.permission);
  }
  if (item.roles?.length) {
    return item.roles.some((role) => user?.roles?.includes(role));
  }
  return true;
}

export function getVisibleSidebarSections(
  user: SidebarUser | null | undefined
): SidebarNavSection[] {
  return sidebarNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isItemVisible(item, user)),
    }))
    .filter((section) => section.items.length > 0);
}

export function resolveActiveMenuPath(
  pathname: string | null,
  items: SidebarMenuItem[]
): string | null {
  if (!pathname) return null;

  const exact = items.find((item) => pathname === item.path);
  if (exact) return exact.path;

  const matches = items
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length);

  return matches[0]?.path ?? null;
}
