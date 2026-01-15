# راهنمای ریفکتورینگ فرانت‌اند

## وضعیت فعلی

### ✅ کارهای انجام شده

1. **استانداردهای UI/UX**: ایجاد مستندات کامل در `docs/UI_STANDARDS.md`
2. **Design System**: بهبود Theme با رنگ‌ها، Typography، Spacing و Shadows
3. **کامپوننت‌های پایه**:
   - `Button`: دکمه با loading state
   - `Card`: کارت با variants (elevated, outlined, flat)
   - `Loading`: کامپوننت loading با spinner
   - `SkeletonLoading`: skeleton برای محتوای در حال بارگذاری
   - `Alert`: کامپوننت alert
   - `Toast`: کامپوننت toast notification
4. **Utility Functions**:
   - `cn`: merge class names
   - `formatDate`, `formatTime`, `formatDateTime`: فرمت تاریخ
   - `formatNumber`: فرمت اعداد
   - `formatPhone`: فرمت شماره تلفن
   - `formatCurrency`: فرمت پول
   - `debounce`, `throttle`: برای بهینه‌سازی performance

### 🔄 در حال انجام

- ایجاد کامپوننت‌های بیشتر (Input, Select, Table, etc.)

### 📋 کارهای باقی‌مانده

1. **پکیج‌های مورد نیاز برای تست**:
   ```bash
   npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/coverage-v8 jsdom clsx
   ```

2. **کامپوننت‌های Form**:
   - FormField
   - FormSelect
   - FormCheckbox
   - FormAutocomplete

3. **Custom Hooks**:
   - useQuestions
   - useExams
   - useUsers
   - useDialog
   - usePagination
   - useDebounce

4. **Service Layer**:
   - AuthService
   - QuestionService
   - ExamService
   - UserService
   - PartnerService

5. **Error Handling**:
   - ErrorBoundary
   - ErrorHandler
   - ErrorDisplay

6. **Testing**:
   - Setup Vitest
   - Unit Tests
   - Component Tests
   - Integration Tests

## نحوه استفاده از کامپوننت‌های جدید

### Button

```tsx
import { Button } from '@/components/ui';

<Button variant="contained" color="primary" loading={isLoading}>
  ارسال
</Button>
```

### Card

```tsx
import { Card } from '@/components/ui';

<Card variant="elevated" title="عنوان" subtitle="زیرعنوان" actions={<Button>عملیات</Button>}>
  محتوای کارت
</Card>
```

### Loading

```tsx
import { Loading, SkeletonLoading } from '@/components/feedback';

<Loading message="در حال بارگذاری..." size="large" />
<SkeletonLoading lines={3} showAvatar />
```

### Alert & Toast

```tsx
import { Alert, Toast } from '@/components/feedback';

<Alert severity="success" title="موفق" closable>
  عملیات با موفقیت انجام شد
</Alert>

<Toast 
  message="پیام موفقیت" 
  severity="success" 
  open={open} 
  onClose={() => setOpen(false)} 
/>
```

### Utilities

```tsx
import { formatDate, formatNumber, debounce } from '@/utils';

const formattedDate = formatDate(new Date());
const formattedNumber = formatNumber(1234567);
const debouncedSearch = debounce((value: string) => {
  console.log(value);
}, 300);
```

## ساختار فایل‌ها

```
components/
  ui/              # کامپوننت‌های UI پایه
    Button/
    Card/
  forms/           # کامپوننت‌های فرم
  layout/          # کامپوننت‌های layout
  feedback/        # کامپوننت‌های feedback (Loading, Alert, etc.)
utils/             # توابع کمکی
  cn.ts
  format.ts
  debounce.ts
constants/         # ثابت‌ها
hooks/             # Custom hooks
services/          # Service layer
docs/              # مستندات
  UI_STANDARDS.md
```

## مراحل بعدی

1. نصب پکیج‌های تست
2. ایجاد کامپوننت‌های Form
3. ایجاد Custom Hooks
4. ریفکتور Service Layer
5. ایجاد Error Handling
6. نوشتن تست‌ها

