# Storybook guide

Storybook is the app’s **reusable** UI catalog. Rules: **`AGENTS.md`** (Storybook section).

## Local development

```bash
cd azmonsaz-frontend
npm install
npm run storybook          # http://localhost:6006
npm run build-storybook    # output: storybook-static/
```

Preview the static build:

```bash
npx serve storybook-static
```

## Tests

| Command | Purpose |
|---------|---------|
| `npm run test:storybook` | Interaction — stories with tag `test` |
| `npm run test:storybook:a11y` | Smoke + a11y — stories with `autodocs` (separate config: `vitest.storybook-a11y.mjs`) |

Playwright prerequisite:

```bash
npx playwright install chromium
```

With `CI=true`, serious a11y violations (`a11y.test: 'error'`) fail the job.

### Coverage (interaction tests)

After `npm run test:storybook`, the HTML report is available in Storybook (e.g. `http://localhost:6006/coverage/index.html` while `npm run storybook` is running) or in Vitest output.  
**Note:** This coverage mostly reflects stories tagged **`test`** (9 stories) — not the full catalog.  
Improvement backlog: [`COVERAGE_BACKLOG.md`](./COVERAGE_BACKLOG.md).

**Tip:** Only **one** `storybookTest` in `vitest.config.mjs` — a11y uses `vitest.storybook-a11y.mjs` (avoids duplicate Vitest project name errors in Storybook’s Tests tab).

### Visual regression (optional — Chromatic)

```bash
npm run chromatic
```

Requires a [chromatic.com](https://www.chromatic.com) account and `CHROMATIC_PROJECT_TOKEN`.  
Stories tagged `visual` are marked for stable snapshots.

## Layout

```
.storybook/
  main.ts, preview.tsx, StorybookDecorator.tsx, vitest.setup.ts
  docs/PagePatterns.mdx       # page patterns

components/**/*.stories.tsx
theme/DesignTokens.stories.tsx
theme/design-tokens.json      # Figma export (source of truth: theme/tokens.ts)
components/questions/__storybook__/fixtures.ts

docs/storybook/BACKLOG.md     # phase 8
```

## Tags

| Tag | Use |
|-----|-----|
| `autodocs` | Docs + runs in `test:storybook:a11y` |
| `test` | Interaction test (`test:storybook`) |
| `visual` | Chromatic / visual regression |
| `skip-a11y` | Temporary — known a11y violation on this story |

## Story rules

### Do

- Reusable components (forms, feedback, exams, questions, editor)
- Variants: default, empty, error, mobile viewport
- **Persian** copy, **RTL**, Vazirmatn, light/dark theme from toolbar
- Tag `test` + `play` for important interactions
- Tag `visual` for stable UI (tokens, hero, bank card, …)

### Do not

- Full pages with routing/API (`ExamManagePage`, `LandingPage`)
- Dead `ui/*` components: Button, Card, Input, Badge, Avatar, Modal, Skeleton
- `FilterContainer` — legacy; story removed (only used in old `ExamFilters.tsx`)
- Marketing landing — unless a separate team maintains it

## Adding a new story

1. `ComponentName.stories.tsx` next to the component
2. `title: 'Domain/Subdomain — ComponentName'` for the sidebar
3. In the same PR as the component change
4. For interactions → `tags: ['test']` + `play` (portals: use `screen`, not only `canvas`)
5. For stable UI → `tags: ['visual']`

## Design tokens and patterns

- Code: `theme/tokens.ts`
- Figma: `theme/design-tokens.json` — keep aligned with the **Design System/Tokens** story
- Page patterns: **Design System/Page Patterns** (MDX)

## CI (no public deploy)

Workflow: `.github/workflows/storybook.yml`

| Job | Description |
|-----|-------------|
| Build | `build-storybook` + artifact `storybook-static` (14 days) |
| Interaction | `test:storybook` |
| a11y | `test:storybook:a11y` |
| Chromatic | Only if `CHROMATIC_PROJECT_TOKEN` is set in secrets |

**GitHub Pages / online deploy is not enabled** — preview via Actions artifact or local `npm run storybook`.

### Download artifact from a PR

GitHub → Actions → Storybook workflow → run → Artifacts → `storybook-static` → unzip → `npx serve .`

## PR checklist

- [ ] New/updated story for reusable component
- [ ] `npm run build-storybook` passes
- [ ] `npm run test:storybook` green
- [ ] If stable UI changed: `test:storybook:a11y` green (or temporary `skip-a11y` + issue)

## Remaining Storybook work

Phase 8 details: **[`BACKLOG.md`](./BACKLOG.md)**

- [ ] Filter panel + accordion mobile stories
- [ ] Interaction: expand accordion, change filter
- [ ] (Optional) auto-sync `design-tokens.json` from `tokens.ts`

**Product:** list filters use one card; mobile = Accordion (`QuestionBankFiltersPanel`).
