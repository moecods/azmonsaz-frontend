# Test Documentation Overview

This folder contains documentation for the frontend unit and integration tests.

---

## Test Status and Count

| Category    | Test Files | Suites | Test Cases | Status  |
|------------|------------|--------|------------|---------|
| App (pages)| 1          | 1      | 2          | ✅ Unit |
| Components | 3          | 3      | 23         | ✅ Unit |
| Hooks      | 3          | 3      | 19         | ✅ Unit |
| Services   | 3          | 3      | 26         | ✅ Unit |
| Utils      | 2          | 2      | 24         | ✅ Unit |
| **Total**  | **12**     | **12** | **94**     | ✅      |

- **Suites**: number of `describe()` blocks (one per file in this project).
- **Test cases**: number of `it()` / `test()` cases.
- All listed tests are run by Vitest in the **unit** project (see `vitest.config.mjs`). A separate **storybook** project runs Storybook-based tests.

---

## Testing Stack

| Tool / Layer      | Purpose |
|-------------------|--------|
| **Vitest**        | Test runner (unit tests). |
| **jsdom**         | Browser-like environment for DOM and `window`. |
| **React Testing Library** | Render components, query by role/label, user events. |
| **@testing-library/user-event** | Simulate user interactions (click, type). |
| **vi (Vitest mocks)** | Mock modules (`vi.mock`), functions (`vi.fn()`), timers. |

---

## Test Structure

```
tests/
├── app/
│   └── exams/
│       └── CreateExamPage.test.tsx    # Create exam page redirects
├── components/
│   ├── ProtectedRoute.test.tsx       # Auth and permission guards
│   ├── UserSidebar.test.tsx         # Role-based sidebar menu
│   ├── exams/
│   │   └── ExamFormWizard.test.tsx  # Exam form submit buttons
│   └── ui/
│       └── Button.test.tsx          # Shared Button component
├── hooks/
│   ├── useDebounce.test.ts
│   ├── useDialog.test.ts
│   └── usePagination.test.ts
├── services/
│   ├── ApiClient.test.ts            # HTTP client, auth, errors, retry
│   ├── AuthService.test.ts
│   └── QuestionService.test.ts
├── utils/
│   ├── format.test.ts               # formatDate, formatTime, formatNumber, etc.
│   └── debounce.test.ts             # debounce and throttle
└── setup.ts                         # Global mocks (router, matchMedia, localStorage)
```

---

## How Tests Are Run

### Commands

```bash
# Watch mode (development)
npm run test

# Single run (CI)
npm run test:run

# With coverage
npm run test:coverage

# With Vitest UI
npm run test:ui
```

### Running Subsets

```bash
# One file
npx vitest run tests/app/exams/CreateExamPage.test.tsx

# One directory
npx vitest run tests/hooks/

# By name pattern
npx vitest run -t "ProtectedRoute"
```

### Global Setup (`tests/setup.ts`)

- **next/navigation**: `useRouter`, `usePathname`, `useSearchParams` mocked (e.g. `push`/`replace` as `vi.fn()`).
- **window.matchMedia**: mocked for responsive code.
- **localStorage**: in-memory mock.
- **afterEach**: React Testing Library `cleanup()`.

Individual test files add their own mocks (e.g. `@/hooks`, `@/lib/data-service`) where needed.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [OVERVIEW.md](./OVERVIEW.md) | This file — status, count, stack, structure, commands. |
| [app-tests.md](./app-tests.md) | Create exam page redirect tests. |
| [component-tests.md](./component-tests.md) | ProtectedRoute, UserSidebar, ExamFormWizard, Button. |
| [hook-tests.md](./hook-tests.md) | useDebounce, useDialog, usePagination. |
| [service-tests.md](./service-tests.md) | ApiClient, AuthService, QuestionService. |
| [util-tests.md](./util-tests.md) | Format utilities, debounce/throttle. |

For writing new tests and conventions, see the project root **[TESTING_GUIDE.md](../../TESTING_GUIDE.md)**.
