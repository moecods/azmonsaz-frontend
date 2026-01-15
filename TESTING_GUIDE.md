# راهنمای تست‌نویسی و اجرای تست‌ها

## نصب و راه‌اندازی

پکیج‌های مورد نیاز نصب شده‌اند. برای اطمینان، می‌توانید دوباره نصب کنید:

```bash
npm install
```

## اجرای تست‌ها

### دستورات اصلی

```bash
# اجرای تست‌ها در watch mode (پیشنهادی برای توسعه)
npm run test

# اجرای تست‌ها با UI
npm run test:ui

# اجرای تست‌ها با coverage report
npm run test:coverage

# اجرای یکباره تست‌ها (برای CI/CD)
npm run test:run
```

### اجرای تست‌های خاص

```bash
# اجرای یک فایل تست خاص
npx vitest tests/utils/format.test.ts

# اجرای تست‌های یک دایرکتوری
npx vitest tests/hooks/

# اجرای تست‌های با pattern خاص
npx vitest -t "useDebounce"
```

## ساختار تست‌ها

### Unit Tests

تست‌های unit برای utilities و hooks:

```
tests/
  utils/
    format.test.ts      # تست‌های format utilities
    debounce.test.ts    # تست‌های debounce/throttle
  hooks/
    useDebounce.test.ts
    useDialog.test.ts
    usePagination.test.ts
```

### Component Tests

تست‌های کامپوننت‌ها:

```
tests/
  components/
    ui/
      Button.test.tsx
```

## نوشتن تست جدید

### مثال: تست یک Utility Function

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/format';

describe('formatDate', () => {
  it('should format a valid date', () => {
    const date = new Date('2024-01-15');
    const formatted = formatDate(date);
    expect(formatted).toBeTruthy();
  });

  it('should return "-" for null', () => {
    expect(formatDate(null)).toBe('-');
  });
});
```

### مثال: تست یک Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialog } from '@/hooks/useDialog';

describe('useDialog', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.open).toBe(false);
  });

  it('should open dialog', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.open).toBe(true);
  });
});
```

### مثال: تست یک Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Best Practices

### 1. نام‌گذاری تست‌ها

- از `describe` برای گروه‌بندی تست‌ها استفاده کنید
- از `it` یا `test` برای هر تست استفاده کنید
- نام تست‌ها باید واضح و توصیفی باشند

```typescript
describe('formatDate', () => {
  it('should format a valid date correctly', () => {});
  it('should return "-" for null values', () => {});
  it('should handle invalid dates gracefully', () => {});
});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange: آماده‌سازی
  const items = [1, 2, 3];
  
  // Act: اجرای عمل
  const total = items.reduce((sum, item) => sum + item, 0);
  
  // Assert: بررسی نتیجه
  expect(total).toBe(6);
});
```

### 3. استفاده از Test Utilities

همیشه از `test-utils.tsx` برای render کردن کامپوننت‌ها استفاده کنید:

```typescript
import { render, screen } from '@/tests/utils/test-utils';
```

این utility به صورت خودکار Theme و QueryClient را فراهم می‌کند.

### 4. Mock کردن Dependencies

```typescript
// Mock کردن Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock کردن API calls
vi.mock('@/lib/api', () => ({
  apiClient: {
    getQuestions: vi.fn(),
  },
}));
```

### 5. Cleanup

تست‌ها به صورت خودکار cleanup می‌شوند (در `setup.ts`). اما اگر نیاز به cleanup دستی دارید:

```typescript
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

## Coverage

برای مشاهده coverage report:

```bash
npm run test:coverage
```

این دستور یک گزارش HTML در `coverage/` ایجاد می‌کند.

### Coverage Goals

- **Utilities**: 100%
- **Hooks**: 100%
- **Components**: 80%+
- **Pages**: 70%+

## Troubleshooting

### مشکل: `vitest: command not found`

```bash
# نصب مجدد پکیج‌ها
npm install

# یا استفاده از npx
npx vitest
```

### مشکل: تست‌ها fail می‌شوند

1. بررسی کنید که همه پکیج‌ها نصب شده‌اند
2. بررسی کنید که `tests/setup.ts` درست است
3. بررسی کنید که path aliases در `vitest.config.ts` درست است

### مشکل: Import errors

مطمئن شوید که path aliases در `tsconfig.json` و `vitest.config.ts` یکسان هستند.

## منابع

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Jest DOM](https://github.com/testing-library/jest-dom)

