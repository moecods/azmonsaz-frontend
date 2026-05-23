# استانداردهای UI/UX - Azmoon-Saz

## 1. Design System

### 1.1 Color Palette

#### Primary Colors
- **Primary Main**: `#1976d2` (آبی اصلی)
- **Primary Light**: `#42a5f5` (آبی روشن)
- **Primary Dark**: `#1565c0` (آبی تیره)
- **Primary Contrast**: `#ffffff` (متن روی آبی)

#### Secondary Colors
- **Secondary Main**: `#dc004e` (صورتی/قرمز)
- **Secondary Light**: `#ff5983` (صورتی روشن)
- **Secondary Dark**: `#9a0036` (صورتی تیره)

#### Semantic Colors
- **Success**: `#2e7d32` (سبز)
- **Warning**: `#ed6c02` (نارنجی)
- **Error**: `#d32f2f` (قرمز)
- **Info**: `#0288d1` (آبی اطلاعات)

#### Neutral Colors
- **Background**: `#fafafa` (پس‌زمینه اصلی)
- **Paper**: `#ffffff` (پس‌زمینه کارت‌ها)
- **Divider**: `#e0e0e0` (خط جداکننده)
- **Text Primary**: `#212121` (متن اصلی)
- **Text Secondary**: `#757575` (متن ثانویه)
- **Text Disabled**: `#bdbdbd` (متن غیرفعال)

### 1.2 Typography

#### Font Family
- **Primary**: `'Vazirmatn', 'Roboto', 'Arial', sans-serif` (فارسی)
- **Monospace**: `'Courier New', monospace` (کد)

#### Font Sizes
- **H1**: `2.5rem` (40px) - عنوان اصلی
- **H2**: `2rem` (32px) - عنوان بخش
- **H3**: `1.75rem` (28px) - عنوان زیربخش
- **H4**: `1.5rem` (24px) - عنوان کوچک
- **H5**: `1.25rem` (20px) - عنوان خیلی کوچک
- **H6**: `1rem` (16px) - عنوان خیلی خیلی کوچک
- **Body1**: `1rem` (16px) - متن اصلی
- **Body2**: `0.875rem` (14px) - متن کوچک
- **Caption**: `0.75rem` (12px) - توضیحات
- **Button**: `0.875rem` (14px) - دکمه

#### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Bold**: 700

#### Line Heights
- **Tight**: 1.2
- **Normal**: 1.5
- **Relaxed**: 1.75

### 1.3 Spacing System (8px Grid)

```
0: 0px
1: 4px   (0.25rem)
2: 8px   (0.5rem)
3: 12px  (0.75rem)
4: 16px  (1rem)
5: 20px  (1.25rem)
6: 24px  (1.5rem)
8: 32px  (2rem)
10: 40px (2.5rem)
12: 48px (3rem)
16: 64px (4rem)
20: 80px (5rem)
24: 96px (6rem)
```

### 1.4 Border Radius

- **Small**: `4px` (0.25rem)
- **Medium**: `8px` (0.5rem)
- **Large**: `12px` (0.75rem)
- **XLarge**: `16px` (1rem)
- **Round**: `50%` (دایره)

### 1.5 Shadows

- **Elevation 0**: `none`
- **Elevation 1**: `0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)`
- **Elevation 2**: `0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)`
- **Elevation 4**: `0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)`
- **Elevation 8**: `0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)`

### 1.6 Breakpoints (Responsive)

- **xs**: `0px` (موبایل)
- **sm**: `600px` (تبلت کوچک)
- **md**: `900px` (تبلت)
- **lg**: `1200px` (دسکتاپ)
- **xl**: `1536px` (دسکتاپ بزرگ)

### 1.7 Transitions & Animations

#### Duration
- **Fast**: `150ms`
- **Normal**: `250ms`
- **Slow**: `350ms`

#### Easing
- **Ease In**: `cubic-bezier(0.4, 0, 1, 1)`
- **Ease Out**: `cubic-bezier(0, 0, 0.2, 1)`
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)`

#### Common Animations
- **Fade In**: `opacity 0 → 1`
- **Slide Up**: `transform translateY(10px) → translateY(0)`
- **Scale**: `transform scale(0.95) → scale(1)`

## 2. Component Standards

### 2.1 Button Variants

- **contained**: دکمه پر (پیش‌فرض)
- **outlined**: دکمه با حاشیه
- **text**: دکمه متنی
- **icon**: دکمه آیکون

### 2.2 Button Sizes

- **small**: `height: 32px`, `padding: 4px 12px`
- **medium**: `height: 40px`, `padding: 6px 16px` (پیش‌فرض)
- **large**: `height: 48px`, `padding: 8px 24px`

### 2.3 Input States

- **default**: حالت عادی
- **focused**: حالت فوکوس
- **error**: حالت خطا
- **disabled**: حالت غیرفعال
- **readonly**: حالت فقط خواندنی

### 2.4 Card Variants

- **elevated**: با سایه
- **outlined**: با حاشیه
- **flat**: بدون سایه و حاشیه

## 3. UX Guidelines

### 3.1 Loading States

- **Skeleton**: برای محتوای در حال بارگذاری
- **Spinner**: برای عملیات کوتاه (< 2 ثانیه)
- **Progress Bar**: برای عملیات طولانی (> 2 ثانیه)

### 3.2 Error Handling

- **Inline Error**: خطا در کنار فیلد
- **Toast Notification**: برای خطاهای عمومی
- **Error Page**: برای خطاهای بزرگ

### 3.3 Feedback

- **Success Toast**: برای عملیات موفق
- **Error Toast**: برای خطاها
- **Warning Toast**: برای هشدارها
- **Info Toast**: برای اطلاعات

### 3.4 Form Validation

- **Real-time**: اعتبارسنجی در حین تایپ
- **On Blur**: اعتبارسنجی هنگام خروج از فیلد
- **On Submit**: اعتبارسنجی هنگام ارسال

### 3.5 Accessibility

- **ARIA Labels**: برای همه عناصر تعاملی
- **Keyboard Navigation**: پشتیبانی کامل از کیبورد
- **Focus Management**: مدیریت فوکوس
- **Screen Reader**: پشتیبانی از خواننده صفحه
- **Color Contrast**: نسبت کنتراست حداقل 4.5:1

## 4. Code Standards

### 4.1 Component Structure

```tsx
// 1. Imports
import React from 'react';
import { ... } from '@mui/material';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ ... }: ComponentProps) {
  // 4. Hooks
  // 5. State
  // 6. Effects
  // 7. Handlers
  // 8. Render
  return (...);
}
```

### 4.2 Naming Conventions

- **Components**: PascalCase (`Button`, `UserCard`)
- **Hooks**: camelCase با `use` prefix (`useAuth`, `useQuestions`)
- **Utilities**: camelCase (`formatDate`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)

### 4.3 File Structure

```
components/
  Button/
    Button.tsx
    Button.test.tsx
    Button.stories.tsx (optional)
    index.ts
```

## 5. Performance Guidelines

### 5.1 Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports

### 5.2 Optimization
- Memoization برای expensive calculations
- useMemo برای derived values
- useCallback برای event handlers
- React.memo برای pure components

### 5.3 Bundle Size
- Tree shaking
- Dynamic imports
- Avoid large dependencies

## 6. Testing Standards

### 6.1 Test Structure
- **Arrange**: آماده‌سازی
- **Act**: اجرای عمل
- **Assert**: بررسی نتیجه

### 6.2 Test Coverage
- **Minimum**: 80% coverage
- **Critical Paths**: 100% coverage
- **Utilities**: 100% coverage

### 6.3 Test Types
- **Unit Tests**: برای utilities و hooks
- **Component Tests**: برای کامپوننت‌ها
- **Integration Tests**: برای صفحات و features

## 7. Accessibility (a11y)

### Take / result exams
- Option rows: `aria-label` on radio/checkbox inputs (`QuestionAnswerInput`).
- Exam timer: use `role="timer"` and `aria-live="polite"` when displaying countdown.
- Question navigation: move focus to question stem heading on index change (`tabIndex={-1}` + `ref.focus()`).

### Forms
- All inputs must have visible `<label>` or `aria-label`.
- Validation errors: link fields with `aria-describedby` to error text (`FormValidationAlerts`).

### Color
- Do not rely on color alone for correct/incorrect — use borders, chips, or icons (see `QuestionView` result mode).

