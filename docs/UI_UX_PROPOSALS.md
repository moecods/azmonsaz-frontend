# UI/UX Research and Proposals

This document summarizes research and proposals for improving the Azmonsaz frontend UX. **No implementation has been done**; changes should be agreed and then implemented incrementally.

---

## 1. Question creation flow

**Current:** Single form / dialog for creating questions with type, category, options, etc.

**Research (common patterns):**
- **Wizard flow:** Multi-step (e.g. type → content → options → preview) reduces cognitive load and allows per-step validation. Used by Typeform, Google Forms.
- **Inline creation:** Create from question bank or exam builder with minimal steps. Used by many LMS tools.
- **Templates:** Pre-filled by question type (multiple choice, short answer, etc.) with clear placeholders.

**Proposals:**
- **Option A – Wizard:** Add an optional “step-by-step” flow for new questions: (1) Type & category, (2) Question text & options/answer, (3) Preview & save. Keep existing single form as “advanced” path.
- **Option B – Improve current form:** Keep single form but add: clear grouping by type, inline help text, and a short preview before submit.
- **Feedback:** After create/update, show a brief success message (e.g. toast) and, where relevant, a link to “Add another” or “View in bank.”

---

## 2. Exam configuration UX

**Current:** Exam creation and editing (e.g. title, type, meta, scheduling) in one or more steps; scheduling uses date/time pickers.

**Research:**
- **Progressive disclosure:** Show only essential fields first (title, type); expand “Schedule” and “Settings” sections on demand.
- **Validation messages:** Inline, next to each field; block “Publish” until critical fields are valid, with a short summary at top if there are errors.
- **Defaults:** Sensible defaults (e.g. duration, passing score) with one-click “Use default” where applicable.

**Proposals:**
- Add a small “Exam configuration” summary (title, date range, duration, question count) on the exam edit page and before publish.
- Group fields into clear sections: “Basic info”, “Schedule”, “Scoring & behaviour”.
- Show validation summary at top of form when invalid (e.g. “Please fix 2 fields”) and keep inline errors per field.
- Consider a “Publish checklist” (e.g. has title, has at least one question, schedule valid) before allowing Publish.

---

## 3. Navigation and dashboard structure

**Current:** Dashboard with links to exams, questions, groups, admin (partners/users); sidebar and/or top nav.

**Research:**
- **Role-based home:** Different default “home” per role (e.g. creator → “My exams”, admin → “Partners & users”).
- **Quick actions:** On dashboard, prominent “Create exam”, “Add question”, “View results”.
- **Recent items:** “Recent exams” or “Continue editing” for faster re-entry.

**Proposals:**
- Keep current structure; add a small “Recent exams” (or “Recent activity”) block on dashboard for logged-in users.
- Add one or two prominent “Quick action” buttons on dashboard (e.g. “Create exam”, “Question bank”).
- Optional: Role-based default redirect after login (e.g. admin → /admin, creator → /exams or dashboard).

---

## 4. Empty states, success/error messaging, confirmation dialogs

**Current:** Lists show tables; dialogs for create/edit; some `alert()`/`confirm()` for confirmations.

**Research:**
- **Empty states:** Illustration or icon + short message + primary CTA (e.g. “No exams yet – Create your first exam”).
- **Success:** Toasts or inline banners (e.g. “Partner created”) with optional “Undo” for destructive-like actions where applicable.
- **Errors:** Inline for forms; global or section-level for list/load errors (already improved in admin tabs).
- **Confirmations:** Use modal dialogs with clear “Cancel” and “Delete” (or “Publish”) instead of `confirm()` for important actions.

**Proposals:**
- **Empty states:** Add a single reusable “EmptyState” component (icon, message, optional button) and use it for: no partners, no users, no exams, no questions in bank.
- **Success:** Introduce a small toast or snackbar system for “Created”, “Updated”, “Deleted” messages; keep existing inline success where it already exists.
- **Errors:** Keep current inline + Alert usage; ensure all list views (admin, exams, questions, groups) show an error message when fetch fails (already done for admin partners/users).
- **Confirmations:** Replace `window.confirm` for critical actions (e.g. delete exam, publish, impersonate) with a proper confirmation dialog (title, body text, Cancel / Confirm buttons).

---

## 5. Implementation approach

- **Phase 4 scope:** Research and this proposals document only.
- **Next steps:** Review with stakeholders; prioritise 1–2 areas (e.g. empty states + confirmations, or exam configuration).
- **Implementation:** Small, incremental PRs (e.g. one “EmptyState” usage, one confirmation dialog), with verification after each change.

---

*Document created as part of the full-stack refactor plan (Phase 4). Last updated: 2025.*
