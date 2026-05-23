/** Width of the desktop sidebar (RTL: first grid column = physical right). */
export const SIDEBAR_WIDTH = 280;

/** Height reserved above scrollable main on mobile (bottom navigation). */
export const MOBILE_BOTTOM_NAV_HEIGHT = 64;

/**
 * Single horizontal/vertical padding for authenticated shell content.
 * Applied in UserLayout (mobile) and AuthenticatedShell main (desktop).
 * Pages inside the shell should not add extra horizontal padding on mobile.
 */
export const SHELL_CONTENT_PADDING = {
  px: { xs: 1, sm: 2 },
  py: { xs: 1, sm: 2 },
} as const;

/** Align fixed bottom navigators with shell horizontal padding (MUI spacing: xs=1 → 8px). */
export const MOBILE_SHELL_PADDING_X = 8;

/** Desktop main column inner padding (MUI spacing: 3 → 24px). */
export const DESKTOP_SHELL_PADDING_X = 24;

/** Page-level Container inside authenticated shell — no duplicate gutters. */
export const shellPageContainerSx = {
  disableGutters: true,
  px: 0,
  py: { xs: 0.5, sm: 1, md: 4 },
} as const;
