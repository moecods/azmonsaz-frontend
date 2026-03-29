import { useMemo } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const USER_LAYOUT_PAGES = [
  '/dashboard',
  '/profile',
  '/exams',
  '/exams/available',
  '/questions',
  '/admin',
] as const;

export const useNavbarVisibility = (): boolean => {
  const theme = useTheme();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  return useMemo(() => {
    if (pathname === '/login') return true;

    const isUserPage = USER_LAYOUT_PAGES.some(page =>
      pathname === page || pathname.startsWith(page + '/')
    );

    if (isMobile && isAuthenticated && isUserPage) {
      return true;
    }

    return false;
  }, [pathname, isMobile, isAuthenticated]);
};