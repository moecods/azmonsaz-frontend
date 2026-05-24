/**
 * Routes that share the persistent sidebar / bottom-nav shell.
 * Keep in sync with sidebar menu paths in UserSidebar.tsx.
 */
export const AUTHENTICATED_SHELL_PREFIXES = [
  '/dashboard',
  '/profile',
  '/exams',
  '/questions',
  '/groups',
  '/admin',
  '/subscription',
  '/partners',
] as const;

export function isAuthenticatedShellPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return AUTHENTICATED_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
