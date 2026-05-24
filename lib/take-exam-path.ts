/** Whether the current route is the focused take-exam experience (full main chrome). */
export function isTakeExamRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return /^\/exams\/take\/[^/]+/.test(pathname);
}
