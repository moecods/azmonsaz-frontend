# Storybook coverage — improvement backlog

**Snapshot date:** 2026-05-26 (report at `http://localhost:6006/coverage/index.html` after `npm run test:storybook`)

**Purpose of this document:** Record issues and priorities only — **no fixes in this phase.**

---

## Executive summary

| Metric | Value | Status |
|--------|-------|--------|
| Statements | **24.0%** (1054/4391) | Low |
| Branches | **23.0%** (1116/4860) | Lowest metric |
| Functions | **22.8%** (293/1285) | Low |
| Lines | **25.1%** (1020/4056) | Low |

### Important: what do these numbers measure?

- Current coverage comes from **Vitest + Storybook** with tag **`test`** (`vitest.config.mjs` → `storybookTest({ tags: { include: ['test'] } })`).
- Only **9 stories** tagged `test` run in interaction tests; **~33 other stories** are largely absent from this report unless pulled in via imports.
- **`services/`**, **`hooks/`**, **`providers/`** are not designed for Storybook; **0–10%** here is **expected** and not necessarily a UI bug — wrong tool for those layers.
- **Branches ~23%** means even where we have stories, `if/else` paths, error states, and open menus are under-tested.

**Conclusion:** ~25% overall line coverage is the **current baseline**; long-term goals should be defined separately (e.g. “storied UI ≥ 70% lines”, not “entire frontend monorepo”).

---

## Problem categories

### A — Measurement structure (before chasing the number)

| # | Problem | Impact | Suggested action (later) |
|---|---------|--------|---------------------------|
| A1 | One coverage report for all of `frontend` | Misleading; services/hooks drag the average down | Split reports: `coverage/storybook-ui` vs `coverage/unit` |
| A2 | Only tag `test` in Vitest storybook | ~24 stories never run interactions for coverage | Either add `test` to more stories, or a second job “all stories, no assertions” for coverage only |
| A3 | Shared `coverage.exclude` in vitest | May ignore story/fixture files or the opposite | Review exclude list for Storybook reports |
| A4 | Branches lower than lines | Interactions hit happy paths | Per `test` story: at least one error/empty/disabled variant |
| A5 | Coverage in Storybook UI vs CI | Report may be stale | CI artifact `coverage-html` + link in `STORYBOOK_SETUP.md` |

---

### B — Near-zero layers (0–10%) — right tool: unit + MSW, not story-only

| Path | Lines | Notes |
|------|-------|--------|
| `hooks/exams` | **0%** | Exam fetch/state — no story |
| `hooks` (total) | **~3%** | |
| `providers` | **~2%** | App contexts |
| `services/exams` | **~1%** | API client |
| `services/auth`, `groups`, `media`, … | **3–10%** | Only if imported from a story |
| `services/api` | **~29%** | Interceptors / error paths untested |
| `lib` (root) | **~22%** | Shared utilities |

**Backlog:**

- [ ] **B1** — Critical flows (create exam, participant, question): MSW handler in story + one interaction, **or** unit test in `tests/` for service/hook
- [ ] **B2** — Document “these folders are out of scope for Storybook coverage thresholds” in CI

---

### C — UI with stories but low coverage (high product priority)

#### C1 — Rich text editor (`components/editor` — ~66% aggregate, weak details)

| File / folder | Lines | Story exists? | Gap |
|---------------|-------|---------------|-----|
| `editor/lib/image-utils.ts` | **~2%** | No direct story | Upload/crop/resize image |
| `extensions/Image.ts` | **~9%** | Partial via RichTextEditor | Insert/edit image |
| `extensions/Layout.ts` | **~13%** | | Layout blocks |
| `extensions/Math.ts` | **~19%** | | Formula / LaTeX |
| `toolbar/ImageCropOverlay.tsx` | **~2%** | | |
| `toolbar/ImageCropper.tsx` | **~13%** | | |
| `toolbar/ImageDialog.tsx` | **~43%** | | |
| `toolbar/LayoutMenu.tsx` | **~30%** | EditorToolbar story | Layout menu not opened |
| `toolbar/LinkDialog.tsx` | **~37%** | | |
| `toolbar/EditorToolbar.tsx` | **~33%** | Yes | Most toolbar buttons not clicked |

**Backlog:**

- [ ] **C1-a** — `RichTextEditor` story: interaction “insert image, crop, save” (tag `test`)
- [ ] **C1-b** — Dedicated `EditorToolbar` story with play: open LayoutMenu, MathDialog, LinkDialog
- [ ] **C1-c** — Minimal story for `image-utils` (mock File / blob) or separate unit test

#### C2 — Exam wizard (`ExamFormSteps` — ~30% aggregate)

| Step | Lines | Issue |
|------|-------|--------|
| `SchedulingStep.tsx` | **~13%** | Date/time — only partial wizard smoke |
| `ExamPreviewStep.tsx` | **~7%** | Preview step lightly covered in wizard interaction |
| `BasicInfoStep.tsx` | **~48%** | |
| `ExamSettingsStep.tsx` | **~54%** | |

**Backlog:**

- [ ] **C2-a** — Extend `ExamFormWizard.stories` play: navigate to last step + preview
- [ ] **C2-b** — Per-step stories (like `form-step-ui`) with `test` for Scheduling + Settings edge cases
- [ ] **C2-c** — `PersianDateTimePicker` / `PersianTimePicker` (~60%): time-selection interaction in `persian-pickers` (open calendar, pick day)

#### C3 — Questions and answers (`components/questions` — ~34% aggregate)

| File | Lines | Story? |
|------|-------|--------|
| `QuestionAnswerInput.tsx` | **~31%** | Partial |
| `QuestionResultDisplay.tsx` | **0%** | None |
| `answer/MatchingAnswerInput.tsx`, etc. | **~4%** (folder) | **No stories** |
| `QuestionDisplay.stories` | — | Display only; no `test` tag |

**Backlog:**

- [ ] **C3-a** — Stories for `answer/*` per `QuestionType` (matching, ordering, blank)
- [ ] **C3-b** — `QuestionResultDisplay` story (correct/wrong/partial)
- [ ] **C3-c** — `test` tag on `QuestionDisplay` + change question type in interaction

#### C4 — Exam / participant (missing story or few interactions)

| Item | Approx. lines | Story status |
|------|---------------|--------------|
| `DescriptiveGradingBands.tsx` | **~29%** | Has story; **no** `test` |
| `ParticipantSelector.tsx` | **~45%** | No story |
| Hybrid filters (`ExamsFiltersPanel`, drawer) | — | **Phase 8** in [BACKLOG.md](./BACKLOG.md) — **0 stories** |

**Backlog:** Align with [BACKLOG.md](./BACKLOG.md) phase 8 + `test` tag on grading bands.

#### C5 — Forms

| Component | Lines | Gap |
|-----------|-------|-----|
| `FormNumberField` | **60%** | min/max, empty, keyboard |
| `FormCategorySelect` | **~72%** | List search, no category |

- [ ] **C5** — Variant interactions (validation error) + `test` tag if needed for CI

---

### D — Medium coverage UI (50–80%) — polish

| Path | Lines | Suggested action |
|------|-------|------------------|
| `components/exams` (total) | **~63%** | Complete C2–C4 |
| `components/forms` | **~64%** | C5 |
| `lib/question-types` | **~54%** | Stories for descriptors not shown in QuestionTypeChip |
| `lib/question-types/descriptors` | **~11%** | Unit or story matrix for all types |
| `components/exams/participants/tabs` | **~73%** | Tab switch in interaction |
| `components/dashboard/student` | **~67%** | Only EmptyState storied — rest of dashboard not |

---

### E — Healthy areas (patterns to copy)

**≥ ~85% lines** in current snapshot:

- `components/ui`, `components/feedback`, `components/exams/create`, `components/exams/manage`, `components/exams/participants`, `components/questions/question-bank`, `components/questions/primitives`, `theme`, `constants`, `.storybook`

**Use:** Copy story + decorator + fixture patterns from these folders for C1–C3.

---

### F — a11y (separate from numeric coverage)

Coverage shows executed lines; it does **not** show **a11y violations**.

- `npm run test:storybook:a11y` — stories with `autodocs` (separate config)
- [ ] **F1** — Maintain a list of known violations (if CI fails) in this doc or a subsection
- [ ] **F2** — Phase 8 drawer/modal stories must run in the a11y job

---

## Story ↔ coverage matrix

| Status | Approx. count | Notes |
|--------|---------------|--------|
| Story files | **~33** | |
| With tag `test` (interaction coverage) | **9** | ExamFormWizard, FormSelect, FormField, RichTextEditor, Toast, persian-pickers, QuestionTypeChip, ParticipantAddMethodNav, form-step-ui |
| With tag `visual` | **8** | Visual regression; separate from line coverage |
| No story | Hybrid filters, ParticipantSelector, answer/*, QuestionResultDisplay, … | |

**Clear gap:** ~24 stories are documentation/display only and contribute little to the current coverage number.

---

## Suggested priorities (later phases)

### Phase COV-1 — Fast, highest impact on number and UI risk

1. A2 + C2-a — wizard through preview + `test` on critical steps  
2. C1-a/b — editor image and toolbar menus  
3. C3-a — `answer/*` stories  
4. Link to phase 8 — Hybrid filters (story + `test`)

**Expected outcome:** UI-relevant lines from ~25% to **~40–50%** (without targeting services).

### Phase COV-2 — Branches and error states

1. A4 — second variant for each existing interaction  
2. C5, C2-c — pickers and FormNumberField  
3. C3-b/c — question result and type switching

**Expected outcome:** Branches around **35–40%**.

### Phase COV-3 — Hygiene and CI

1. A1, A3, A5 — split reports + artifact  
2. B1/B2 — policy for what belongs in unit tests  
3. F1/F2 — a11y with new modals/drawers

---

## Checklist before starting any backlog item

- [ ] Opened file drill-down in `coverage/index.html` (red line = untested branch)
- [ ] Decided: new story vs extend existing `play` vs unit test
- [ ] If API: MSW handler in `__storybook__/fixtures` or existing mock
- [ ] After merge: `npm run test:storybook` and compare % in the same drill-down

---

## References

```bash
npm run storybook                    # UI + coverage tab (after test)
npm run test:storybook               # interaction + coverage (~9 stories)
npm run test:storybook:a11y          # a11y smoke
```

- Product story backlog: [BACKLOG.md](./BACKLOG.md) (phase 8 Hybrid)
- Setup guide: [STORYBOOK_SETUP.md](./STORYBOOK_SETUP.md)

---

*Last updated manually from a local report — re-scan this doc after meaningful changes to `test` tags or stories.*
