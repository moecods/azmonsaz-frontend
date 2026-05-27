# Storybook Configuration

- **main.ts** — stories + MDX under `docs/`
- **preview.tsx** — RTL, Vazirmatn, theme toolbar, a11y=`error` in CI
- **StorybookDecorator.tsx** — ThemeRegistry + `colorMode` sync

## Run

```bash
npm run storybook
npm run build-storybook
npm run test:storybook          # tag test
npm run test:storybook:a11y     # tag autodocs
```

## CI

`.github/workflows/storybook.yml` — build + artifact, interaction, a11y, Chromatic (optional). **No Pages deploy.**

## Docs

`docs/storybook/STORYBOOK_SETUP.md` — team guide and PR checklist.

`docs/storybook/BACKLOG.md` — phase 8.

`docs/storybook/COVERAGE_BACKLOG.md` — coverage improvement backlog.
