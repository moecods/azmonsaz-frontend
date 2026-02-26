# Component Tests

Tests for React components: layout, auth guards, forms, and UI primitives.

---

## ProtectedRoute — `tests/components/ProtectedRoute.test.tsx`

**Suite:** `ProtectedRoute`

### Purpose

Verifies that the route guard shows content, redirects to login, or shows a 403 based on authentication and role/permission.

### Mocks

- **next/navigation**: `useRouter` with `push` and `replace` as `vi.fn()`.
- **@/hooks**: `useAuth` is mocked to control `isAuthenticated`, `isLoading`, and `user` (including `roles` / `permissions`).

### Test cases


| #   | Test name                                                         | Description                                                               |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | renders children when user is authenticated and has required role | Child content is visible when user has the required role.                 |
| 2   | redirects to login when user is not authenticated                 | `router.replace('/login')` is called when not authenticated.              |
| 3   | shows 403 error when user does not have required role             | 403 message (e.g. "دسترسی محدود شده است") is shown; child content is not. |
| 4   | shows loading state during initial load                           | While `isLoading` is true, child content is not rendered.                 |
| 5   | allows access when no role is required                            | When neither role nor permission is required, child is shown.             |
| 6   | allows admin to access admin routes                               | Admin user sees content for admin route.                                  |
| 7   | allows content_manager to access content_manager routes           | Content manager sees content for content_manager route.                   |
| 8   | allows creator to access creator routes                           | Creator sees content for creator route.                                   |
| 9   | denies creator access to admin routes                             | Creator sees 403 for admin-only route.                                    |
| 10  | denies content_manager access to admin-only routes                | Content manager sees 403 for admin route.                                 |


---

## UserSidebar — `tests/components/UserSidebar.test.tsx`

**Suite:** `UserSidebar - Role-based Menu Items`

### Purpose

Checks that sidebar menu items and admin panel visibility depend on user role (admin, content_manager, creator).

### Test cases


| #   | Test name                                                     | Description                                                                     |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | shows all menu items for admin                                | Admin sees full menu (e.g. dashboard, exams, questions, admin).                 |
| 2   | shows limited menu items for content_manager (only questions) | Content manager sees a restricted set (e.g. questions).                         |
| 3   | shows limited menu items for creator                          | Creator sees creator-appropriate items (e.g. exams, questions, not full admin). |
| 4   | hides admin panel for creator role                            | Admin section is not shown for creator.                                         |
| 5   | shows admin panel for admin role                              | Admin section is shown for admin.                                               |
| 6   | does not show admin panel for content_manager role            | Admin section is hidden for content_manager.                                    |


---

## ExamFormWizard — `tests/components/exams/ExamFormWizard.test.tsx`

**Suite:** `ExamFormWizard`

### Purpose

Ensures the create-exam form’s two submit buttons call `onSubmit` with the correct second argument (`redirectToQuestions`: true or false).

### Setup

- A wrapper provides `QueryClientProvider` and `ThemeProvider`.
- A small wrapper component uses `useForm` with `examSchema` and valid default values (e.g. `title: 'Test Exam'`) so submit runs without validation errors.

### Test cases


| #   | Test name                                                                                     | Description                                                                          |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | calls onSubmit with redirectToQuestions false when "Create exam" button is clicked            | Clicking "ایجاد آزمون" calls `onSubmit(data, false)`.                                |
| 2   | calls onSubmit with redirectToQuestions true when "Create and add question" button is clicked | Clicking "ایجاد و افزودن سوال" calls `onSubmit(data, true)`.                         |
| 3   | shows "Update exam" button when existingExam is true                                          | In edit mode only "به‌روزرسانی آزمون" is shown; create/add-question buttons are not. |


---

## Button — `tests/components/ui/Button.test.tsx`

**Suite:** `Button`

### Purpose

Covers the shared Button component: render, loading state, disabled state, click handling, and styling (variant, size).

### Test cases


| #   | Test name                             | Description                                            |
| --- | ------------------------------------- | ------------------------------------------------------ |
| 1   | should render button with text        | Button displays given label.                           |
| 2   | should show loading state             | Loading indicator is shown when `loading` is true.     |
| 3   | should be disabled when loading       | Button is disabled while loading.                      |
| 4   | should handle click events            | `onClick` is called when the button is clicked.        |
| 5   | should not call onClick when disabled | `onClick` is not called when button is disabled.       |
| 6   | should apply variant styles           | Variant prop affects styling (e.g. primary, outlined). |
| 7   | should apply size styles              | Size prop affects styling (e.g. small, large).         |


