# Exam Question Cart UX

Dedicated page `/exams/[id]/questions/from-bank` for picking bank questions into a session cart, then committing to the exam.

## Rules

- Cart shows **count only** (no points sum); points are edited on the exam questions list.
- Per-question **cart toggle** icon (`aria-pressed`); not a full-width add button.
- Questions already on the exam: disabled control + "در آزمون".
- Fixed bottom bar (`ExamQuestionCartBar`) styled like `GradingPendingNavigator` — explicit **افزودن به آزمون** button (not whole bar click).
- No drawer, no two-column bank+cart layout on this flow.
- After successful commit: redirect to `/exams/[id]/questions`.

## UX review checklist (10)

1. Discoverability — CTA on exam questions page
2. Immediate toggle feedback
3. Empty states (no results, empty cart, all in exam)
4. Mobile RTL + bottom nav clearance
5. Desktop alignment with sidebar
6. Loading / commit progress
7. Error messages (network, max score, partial commit)
8. Accessibility (labels, region, focus)
9. Repeat visit (cart empty, in-exam disabled)
10. Regression on exam questions list (drag, points, delete)
