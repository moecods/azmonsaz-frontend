import type { ElementType } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';

export interface AdminNavItem {
  path: string;
  label: string;
  description: string;
  icon: ElementType;
  exact?: boolean;
  dataCy?: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    path: '/admin',
    label: 'نمای کلی',
    description: 'دسترسی سریع به بخش‌ها',
    icon: DashboardIcon,
    exact: true,
  },
  {
    path: '/admin/users',
    label: 'کاربران',
    description: 'مدیریت نقش و وضعیت',
    icon: PeopleIcon,
    dataCy: 'admin-nav-users',
  },
  {
    path: '/admin/audit-logs',
    label: 'لاگ‌ها',
    description: 'تغییرات آزمون',
    icon: HistoryIcon,
    dataCy: 'admin-nav-audit-logs',
  },
  {
    path: '/admin/partners',
    label: 'شرکا',
    description: 'یکپارچه‌سازی API',
    icon: BusinessIcon,
    dataCy: 'admin-nav-partners',
  },
  {
    path: '/admin/question-categories',
    label: 'دسته‌بندی سوالات',
    description: 'طبقه‌بندی بانک سوال',
    icon: CategoryIcon,
    dataCy: 'admin-nav-question-categories',
  },
];

export function isAdminNavActive(pathname: string | null, item: AdminNavItem): boolean {
  if (!pathname) return false;
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
