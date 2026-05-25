/** Width of the desktop sidebar (RTL: first grid column = physical right). */
export const SIDEBAR_WIDTH = 280;

/** Desktop main column top bar (notifications + account). */
export const DESKTOP_SHELL_BAR_HEIGHT = 48;

/** Collapsed mobile bottom dock height (tabs row). */
export const MOBILE_BOTTOM_NAV_HEIGHT = 56;

/** Offset above dock for floating panels (cart bar, graders). */
export const MOBILE_FLOATING_BOTTOM_OFFSET = MOBILE_BOTTOM_NAV_HEIGHT;

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
