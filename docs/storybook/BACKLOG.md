# Storybook backlog

Phases 1–7 are done. **Public deploy (GitHub Pages) is intentionally disabled** — CI artifact + local run only.

**Coverage (~25% lines):** separate backlog for coverage gaps → [COVERAGE_BACKLOG.md](./COVERAGE_BACKLOG.md)

---

## Product note: list page filters (implemented)

**Decision:** One filter card (`QuestionBankFiltersPanel`) everywhere. Below `lg`, it collapses in an **Accordion** (default closed). No bottom drawer, no inline chip rows on `/exams`.

---

## Phase 8 — Filter panel stories

**Goal:** Storybook coverage for `QuestionBankFiltersPanel` + `ExamsFiltersPanel`.

| Task | File / story |
|------|----------------|
| [ ] `QuestionBankFiltersPanel` — desktop card | default |
| [ ] `QuestionBankFiltersPanel` — mobile accordion | viewport `mobile2`, `collapsibleOnMobile` |
| [ ] `ExamsFiltersPanel` | wraps filter card |
| [ ] `QuestionBankLayout` with filters + mock list | optional |

### 8.2 — Other pages (no special mobile pattern)

| Page | Notes |
|------|--------|
| [x] `/exams` | Accordion via `QuestionBankFiltersPanel` |
| [ ] `/groups`, `/questions`, … | Same panel; adjust title/fields only |

### 8.3 — Tests

| Task | Tag |
|------|-----|
| [ ] interaction: expand accordion, change select | `test` |
| [ ] viewport `mobile2` | parameters |

### 8.4 — Cleanup

| Task | Notes |
|------|--------|
| [ ] Remove `ExamFilters.tsx` + `FilterContainer` if unused | legacy |
| [ ] Page patterns MDX | done |

---

## Quick reference

```bash
npm run storybook
npm run build-storybook
npm run test:storybook
npm run test:storybook:a11y
npx playwright install chromium
```

### Current stats

- **Story files:** ~33
- **Interaction (`test`):** 9
- **Visual (`visual`):** DesignTokens, ExamManageHero, QuestionBankCard, form-step-ui, PageStates
