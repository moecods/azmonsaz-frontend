# Service Tests

Tests for API and service layers.

---

## ApiClient — `tests/services/ApiClient.test.ts`

| # | Test | Description |
|---|------|-------------|
| 1 | should set and get token | Token stored and returned. |
| 2 | should clear token when set to null | Token cleared. |
| 3 | should make GET request successfully | GET returns data. |
| 4 | should include query parameters | Query string in URL. |
| 5 | should include authorization header when token is set | Bearer header sent. |
| 6 | should make POST request with data | POST body and response. |
| 7 | should throw ApiError on 401 Unauthorized | 401 throws ApiError. |
| 8 | should throw ApiError with validation errors on 422 | 422 with errors. |
| 9 | should throw ApiError on network errors | Network failure throws. |
| 10 | should handle timeout | Timeout enforced. |
| 11 | should retry on network errors | Retry on network failure. |
| 12 | should not retry on 4xx errors | No retry on 4xx. |

---

## AuthService — `tests/services/AuthService.test.ts`

| # | Test | Description |
|---|------|-------------|
| 1 | should login and store token | Login stores token. |
| 2 | should not store token if login fails | Failure leaves token unchanged. |
| 3 | should clear token on logout | Logout clears token. |
| 4 | should clear token even if API call fails | Token cleared on logout error. |
| 5 | should fetch current user | Current user fetched. |
| 6 | should return true when token exists | isAuthenticated true with token. |
| 7 | should return false when token is null | isAuthenticated false without token. |

---

## QuestionService — `tests/services/QuestionService.test.ts`

| # | Test | Description |
|---|------|-------------|
| 1 | should fetch questions with filters | List with filters. |
| 2 | should fetch questions without filters | List default. |
| 3 | should fetch single question by ID | Get by id. |
| 4 | should create new question | POST create. |
| 5 | should update question | PATCH/PUT update. |
| 6 | should delete question | DELETE. |
| 7 | should fetch question categories | Categories list. |
