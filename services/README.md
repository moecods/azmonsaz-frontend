# Service Layer Documentation

## Overview

Service Layer یک لایه abstraction برای API calls است که:
- کد را تمیزتر و قابل استفاده مجدد می‌کند
- Error handling یکپارچه دارد
- Retry logic برای failed requests
- Type-safe API methods
- Request cancellation support

## ساختار

```
services/
  api/
    ApiClient.ts      # Base API client با error handling و retry logic
  auth/
    AuthService.ts    # Authentication operations
  questions/
    QuestionService.ts # Question operations
  exams/
    ExamService.ts    # Exam operations
  users/
    UserService.ts    # User management operations
  partners/
    PartnerService.ts # Partner management operations
  index.ts            # Export همه services
```

## استفاده

### Import Services

```typescript
import {
  authService,
  questionService,
  examService,
  userService,
  partnerService,
} from '@/services';
```

### مثال: استفاده از AuthService

```typescript
import { authService } from '@/services';

// Login
const response = await authService.login({
  phone_number: '09123456789',
  password: 'password',
});

// Get current user
const user = await authService.getMe();

// Logout
await authService.logout();
```

### مثال: استفاده از QuestionService

```typescript
import { questionService } from '@/services';

// Get questions with filters
const questions = await questionService.getQuestions({
  category_id: 1,
  difficulty: 'medium',
  page: 1,
  per_page: 10,
});

// Create question
const newQuestion = await questionService.createQuestion({
  text: 'What is 2+2?',
  type: 'multiple_choice',
  // ...
});
```

### مثال: Error Handling

```typescript
import { authService, ApiError } from '@/services';

try {
  await authService.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      // Validation errors
      console.error('Validation errors:', error.errors);
    } else if (error.status === 401) {
      // Unauthorized
      console.error('Invalid credentials');
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
  }
}
```

## Features

### 1. Automatic Retry

API Client به صورت خودکار failed requests را retry می‌کند:
- Network errors: 3 بار retry با exponential backoff
- 5xx errors: 3 بار retry
- 4xx errors: retry نمی‌شود

### 2. Request Timeout

هر request یک timeout دارد (پیش‌فرض: 30 ثانیه)

### 3. Error Handling

- `ApiError` class برای type-safe error handling
- Validation errors (422) با `errors` object
- Network errors با message مناسب

### 4. Token Management

- Automatic token storage در localStorage
- Automatic token injection در headers
- Automatic redirect به login در صورت 401

## Migration (lib/api.ts removed)

### Use services instead:

```typescript
import { questionService } from '@/services';

const response = await questionService.getQuestions({ page: 1 });
```

## Testing

برای تست کردن services، می‌توانید ApiClient را mock کنید:

```typescript
import { ApiClient } from '@/services';
import { QuestionService } from '@/services';

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  // ...
} as unknown as ApiClient;

const questionService = new QuestionService(mockApiClient);
```

