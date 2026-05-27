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

## Storybook

Storybook documents **reusable** UI components used in the app.

### When to add or update a story

- New shared/presentational component (UI, feedback, forms, layout patterns) → add a story in the same PR.
- Props, variants, or appearance of an existing storied component changed → update its story in the same PR.
- Component removed from the app → remove its story (and dead code if applicable).
- Full pages or feature-only composites (e.g. `ExamManagePage`) → no story unless a reusable piece is extracted.

### Content rules

- Sample text, labels, placeholders, helper text: **Persian (فارسی)**.
- Stories run in **RTL** (`dir="rtl"`, `lang="fa"`) via `.storybook/preview.tsx`.
- Use `ThemeRegistry`; follow `docs/DESIGN.md` (no ad-hoc hex/radius).

### Backlog

Track remaining work in **`docs/storybook/BACKLOG.md`** — check off items when done.

### Run

```bash
npm run storybook   # http://localhost:6006
npm run build-storybook
npm run test:storybook        # interaction (tag `test`)
npm run test:storybook:a11y   # a11y smoke (tag `autodocs`)
```

Toolbar **light/dark theme** syncs with `ColorModeProvider`. Tokens: **Design System/Tokens**. Patterns: **Design System/Page Patterns**. Full guide: **`docs/storybook/STORYBOOK_SETUP.md`**.

## Stack reminders

- MUI + Emotion, RTL (`dir="rtl"`), Persian font Vazirmatn.
- Theme: `theme/createAppTheme.ts`, color mode: `theme/ColorModeProvider.tsx`.
