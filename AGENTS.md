# Agent instructions (Azmoon-Saz Frontend)

## UI / Design

Before creating or redesigning any UI:

1. Read **`docs/DESIGN.md`** (rules and source-of-truth hierarchy).
2. Use **`theme/tokens.ts`** for colors — do not invent new hex values.
3. Use **`theme/page-sx.ts`** for brand panels, auth layout, and marketing sections (`brandPanelSx`, `authPageSx`).
4. Refer to **`docs/UI_STANDARDS.md`** for UX, a11y, and component patterns.

### Do not

- Copy `linear-gradient` brand strings inline.
- Add page-specific `*-styles.ts` files without documenting the exception in `docs/DESIGN.md`.
- Rely on chat-only design decisions — update `theme/` or `docs/DESIGN.md` when introducing a new pattern.

### Legacy exception

`components/exams/take/take-exam-styles.ts` — isolated exam-taking theme; do not spread to other pages.

## Stack reminders

- MUI + Emotion, RTL (`dir="rtl"`), Persian font Vazirmatn.
- Theme: `theme/createAppTheme.ts`, color mode: `theme/ColorModeProvider.tsx`.
