# App / Page Tests

Tests for app routes (Next.js pages) and their behavior (e.g. redirects after form submit).

---

## CreateExamPage — `tests/app/exams/CreateExamPage.test.tsx`

**Suite:** `CreateExamPage redirects`  
**File:** `tests/app/exams/CreateExamPage.test.tsx`

### Purpose

Ensures that after creating an exam, the user is redirected to the correct URL depending on which submit button they click.

### Setup and mocks

- **next/navigation**: `useRouter` and `useSearchParams` mocked; `push` is asserted.
- **@/hooks**: Partially mocked via `importOriginal`; `useAuth`, `useCreateExam`, `useUpdateExam`, `useCompleteExam`, `usePartner`, `useExam` are overridden. Other hooks (e.g. `useAvailableExams`) come from the real module.
- **@/lib/data-service**: `isUsingMockData` returns `false`.
- **useCreateExam**: Returns a mutation object whose `mutateAsync` resolves with `{ id: 42 }` so redirects can be asserted without a real API.
- **useAuth**: Authenticated creator user with `create exams` permission so the create exam form is shown.

### Test cases

| # | Test name | Description |
|---|-----------|-------------|
| 1 | redirects to manage exam when user clicks "Create exam" | User fills title, clicks "ایجاد آزمون". `router.push` is called with `/exams/42` (manage exam), not with `/questions`. |
| 2 | redirects to manage exam questions when user clicks "Create and add question" | User fills title, clicks "ایجاد و افزودن سوال". `router.push` is called with `/exams/42/questions`. |

### Notes

- The "Create exam" button is distinguished from the sidebar nav link by selecting the actual `<button>` (e.g. `tagName === 'BUTTON'`).
- The page is rendered inside a wrapper that provides `QueryClientProvider` and `ThemeProvider`.
