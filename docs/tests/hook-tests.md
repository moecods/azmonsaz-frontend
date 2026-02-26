# Hook Tests

Tests for custom React hooks.

---

## useDebounce — `tests/hooks/useDebounce.test.ts`

| # | Test | Description |
|---|------|-------------|
| 1 | should return initial value immediately | First value is the initial value. |
| 2 | should debounce value changes | Value updates after delay. |
| 3 | should use default delay of 300ms | Default delay is 300ms. |
| 4 | should cancel previous debounce on rapid changes | Only last value applies after delay. |

---

## useDialog — `tests/hooks/useDialog.test.ts`

| # | Test | Description |
|---|------|-------------|
| 1 | should initialize with closed state | Default is closed. |
| 2 | should initialize with custom open state | initialOpen: true works. |
| 3 | should open dialog | open() sets open. |
| 4 | should close dialog | close() sets closed. |
| 5 | should toggle dialog | toggle() flips state. |

---

## usePagination — `tests/hooks/usePagination.test.ts`

| # | Test | Description |
|---|------|-------------|
| 1 | should initialize with default values | Default page and perPage. |
| 2 | should calculate total pages correctly | totalPages from items and perPage. |
| 3 | should go to specific page | goToPage(n) updates page. |
| 4 | should not go to invalid page | Out-of-range page rejected. |
| 5 | should navigate to next page | nextPage() increments. |
| 6 | should navigate to previous page | prevPage() decrements. |
| 7 | should not go before first page | Page >= 1. |
| 8 | should not go after last page | Page <= last. |
| 9 | should calculate start and end index correctly | Slice indices correct. |
| 10 | should have correct hasNextPage and hasPrevPage flags | Flags match bounds. |
