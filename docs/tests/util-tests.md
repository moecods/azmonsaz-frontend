# Utility Tests

Tests for pure utility functions: formatting (date, time, number, phone, currency) and debounce/throttle.

---

## Format utilities — `tests/utils/format.test.ts`

**Suite:** `format utilities`

### Purpose

Covers formatting helpers that return a string or "-" for null/undefined/invalid input.

### Functions and test cases

**formatDate**

| # | Test name | Description |
|---|-----------|-------------|
| 1 | should format a valid date | Valid date is formatted. |
| 2 | should return "-" for null | null → "-". |
| 3 | should return "-" for undefined | undefined → "-". |
| 4 | should handle string dates | String date is parsed and formatted. |
| 5 | should return "-" for invalid date | Invalid input → "-". |

**formatTime**

| # | Test name | Description |
|---|-----------|-------------|
| 6 | should format a valid time | Valid time is formatted. |
| 7 | should return "-" for null | null → "-". |

**formatDateTime**

| # | Test name | Description |
|---|-----------|-------------|
| 8 | should format date and time | Combined date and time output. |

**formatNumber**

| # | Test name | Description |
|---|-----------|-------------|
| 9 | should format a number | Number is formatted (e.g. locale). |
| 10 | should return "-" for null | null → "-". |
| 11 | should return "-" for undefined | undefined → "-". |

**formatPhone**

| # | Test name | Description |
|---|-----------|-------------|
| 12 | should format a valid phone number | 11-digit phone is formatted. |
| 13 | should handle phone with non-digits and country code | Non-digits stripped; formatting applied. |
| 14 | should return "-" for null | null → "-". |
| 15 | should return original if not 11 digits | Wrong length leaves value unchanged or returns "-". |

**formatCurrency**

| # | Test name | Description |
|---|-----------|-------------|
| 16 | should format currency | Number formatted as currency. |
| 17 | should return "-" for null | null → "-". |

---

## Debounce and throttle — `tests/utils/debounce.test.ts`

**Suite:** `debounce and throttle`

### Purpose

Covers debounce (delayed execution, cancellation, multiple rapid calls) and throttle (rate limiting, immediate first call).

### Test cases

| # | Test name | Description |
|---|-----------|-------------|
| 1 | should delay function execution | Debounced fn runs after delay. |
| 2 | should cancel previous calls | Only the last invocation runs after delay. |
| 3 | should handle multiple rapid calls | Rapid calls result in one execution after delay. |
| 4 | should limit function execution | Throttled fn is not called more than once per interval. |
| 5 | should execute immediately on first call | Throttle runs once immediately, then at interval. |
