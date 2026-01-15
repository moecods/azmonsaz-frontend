# Migration Guide: از api.ts به Service Layer

## تغییرات اصلی

### قبل (api.ts):

```typescript
import { apiClient } from '@/lib/api';

const response = await apiClient.getQuestions({ page: 1 });
const question = await apiClient.getQuestion(1);
await apiClient.createQuestion(data);
```

### بعد (Service Layer):

```typescript
import { questionService } from '@/services';

const response = await questionService.getQuestions({ page: 1 });
const question = await questionService.getQuestion(1);
await questionService.createQuestion(data);
```

## Migration Steps

### 1. Authentication

**قبل:**
```typescript
import { apiClient } from '@/lib/api';

await apiClient.login(credentials);
await apiClient.logout();
const user = await apiClient.getMe();
```

**بعد:**
```typescript
import { authService } from '@/services';

await authService.login(credentials);
await authService.logout();
const user = await authService.getMe();
```

**یا با React Query Hook:**
```typescript
import { useLogin, useLogout, useMe } from '@/hooks/useAuth';

const { mutate: login } = useLogin();
const { mutate: logout } = useLogout();
const { data: user } = useMe();
```

### 2. Questions

**قبل:**
```typescript
import { apiClient } from '@/lib/api';

const questions = await apiClient.getQuestions({ page: 1 });
const question = await apiClient.getQuestion(1);
await apiClient.createQuestion(data);
```

**بعد:**
```typescript
import { questionService } from '@/services';

const response = await questionService.getQuestions({ page: 1 });
const question = await questionService.getQuestion(1);
await questionService.createQuestion(data);
```

**یا با React Query Hook:**
```typescript
import { useQuestions, useQuestion, useCreateQuestion } from '@/hooks/useQuestions';

const { data: questions } = useQuestions({ page: 1 });
const { data: question } = useQuestion(1);
const { mutate: createQuestion } = useCreateQuestion();
```

### 3. Exams

**قبل:**
```typescript
import { apiClient } from '@/lib/api';

const exam = await apiClient.getExam(1);
await apiClient.createExam(data);
```

**بعد:**
```typescript
import { examService } from '@/services';

const response = await examService.getExam(1);
await examService.createExam(data);
```

**یا با React Query Hook:**
```typescript
import { useExam, useCreateExam } from '@/hooks/useExams';

const { data: exam } = useExam(1);
const { mutate: createExam } = useCreateExam();
```

### 4. Users (Admin)

**قبل:**
```typescript
import { apiClient } from '@/lib/api';

const users = await apiClient.getUsers({ page: 1 });
await apiClient.createUser(data);
```

**بعد:**
```typescript
import { userService } from '@/services';

const response = await userService.getUsers({ page: 1 });
await userService.createUser(data);
```

**یا با React Query Hook:**
```typescript
import { useUsers, useCreateUser } from '@/hooks/useUsers';

const { data: users } = useUsers({ page: 1 });
const { mutate: createUser } = useCreateUser();
```

### 5. Partners (Admin)

**قبل:**
```typescript
import { apiClient } from '@/lib/api';

const partners = await apiClient.getPartners({ page: 1 });
await apiClient.createPartner(data);
```

**بعد:**
```typescript
import { partnerService } from '@/services';

const response = await partnerService.getPartners({ page: 1 });
await partnerService.createPartner(data);
```

**یا با React Query Hook:**
```typescript
import { usePartners, useCreatePartner } from '@/hooks/usePartners';

const { data: partners } = usePartners({ page: 1 });
const { mutate: createPartner } = useCreatePartner();
```

## Error Handling

### قبل:

```typescript
try {
  await apiClient.createQuestion(data);
} catch (error) {
  if (error.errors) {
    // Validation errors
  }
}
```

### بعد:

```typescript
import { ApiError } from '@/services';

try {
  await questionService.createQuestion(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      // Validation errors
      console.error(error.errors);
    } else {
      console.error(error.message);
    }
  }
}
```

## Response Structure

### قبل:

```typescript
const response = await apiClient.getQuestions();
// response.data.data = questions
// response.data.meta = pagination
```

### بعد:

```typescript
const response = await questionService.getQuestions();
// response.data.data = questions
// response.data.meta = pagination
```

ساختار response یکسان است، فقط service استفاده می‌شود.

## مزایای Service Layer

1. **Type Safety**: همه methods type-safe هستند
2. **Error Handling**: یکپارچه و قابل پیش‌بینی
3. **Retry Logic**: خودکار برای network errors
4. **Caching**: با React Query hooks
5. **Testability**: راحت‌تر برای mock کردن
6. **Maintainability**: کد تمیزتر و قابل استفاده مجدد

