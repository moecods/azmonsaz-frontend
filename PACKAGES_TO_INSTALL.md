# 📦 پکیج‌های مورد نیاز برای کارهای باقی‌مانده

## 🎯 دستور نصب سریع (فقط ضروری‌ها)

```bash
npm install next-seo framer-motion @sentry/nextjs
```

---

## 📋 دستورات نصب کامل (دسته‌بندی شده)

### 1️⃣ ضروری برای Production

```bash
# SEO و Meta Tags
npm install next-seo

# Error Tracking و Monitoring
npm install @sentry/nextjs
```

**استفاده:**
- `next-seo`: Meta tags، Open Graph، Structured data
- `@sentry/nextjs`: Error tracking، Performance monitoring

---

### 2️⃣ برای بهتر شدن UX (توصیه می‌شود)

```bash
# Animation Library
npm install framer-motion
```

**استفاده:**
- Smooth animations
- Page transitions
- Component animations

---

### 3️⃣ برای کامپوننت‌های بیشتر

```bash
# Date Picker (اگر نیاز باشد)
npm install @mui/x-date-pickers

# Virtual Scrolling (برای لیست‌های بزرگ)
npm install @tanstack/react-virtual

# File Upload (اگر نیاز باشد)
npm install react-dropzone
```

**استفاده:**
- `@mui/x-date-pickers`: Date/Time picker components
- `@tanstack/react-virtual`: Virtual scrolling برای performance
- `react-dropzone`: File upload با drag & drop

---

### 4️⃣ برای چندزبانه‌سازی (اختیاری)

```bash
# i18n
npm install next-intl
```

**استفاده:**
- چندزبانه‌سازی کامل
- Locale switching
- RTL/LTR support

---

### 5️⃣ برای Date Utilities (اگر نیاز باشد)

```bash
# Date manipulation
npm install date-fns
# یا
npm install dayjs
```

**استفاده:**
- Date manipulation و formatting
- Calculations

---

### 6️⃣ برای Charts/Graphs (اگر نیاز باشد)

```bash
# Charts
npm install recharts
# یا
npm install @mui/x-charts
```

---

## 🚀 دستور نصب کامل (همه پکیج‌های توصیه شده)

```bash
# ضروری
npm install next-seo @sentry/nextjs

# UX
npm install framer-motion

# کامپوننت‌ها
npm install @mui/x-date-pickers @tanstack/react-virtual react-dropzone

# Utilities
npm install date-fns

# اختیاری - i18n
npm install next-intl
```

---

## ✅ پکیج‌های قبلاً نصب شده

این پکیج‌ها قبلاً نصب شده‌اند و نیازی به نصب مجدد نیست:

- ✅ `@mui/material` - UI components
- ✅ `@mui/icons-material` - Icons
- ✅ `@tanstack/react-query` - State management
- ✅ `react-hook-form` - Form management
- ✅ `zod` - Validation
- ✅ `vitest` - Testing
- ✅ `@testing-library/react` - Component testing
- ✅ `playwright` - E2E testing
- ✅ `storybook` - Component documentation
- ✅ `clsx` - Class name utility
- ✅ `msw` - Mock Service Worker

---

## 📝 توضیحات هر پکیج

### next-seo
**چرا نیاز است:**
- SEO optimization
- Meta tags management
- Open Graph tags
- Structured data (JSON-LD)

**مثال استفاده:**
```tsx
import { NextSeo } from 'next-seo';

<NextSeo
  title="Azmoon-Saz"
  description="Exam builder platform"
  openGraph={{
    title: 'Azmoon-Saz',
    description: 'Exam builder platform',
  }}
/>
```

### @sentry/nextjs
**چرا نیاز است:**
- Error tracking در production
- Performance monitoring
- User session replay
- Crash reporting

**مثال استفاده:**
```tsx
// در next.config.ts
const { withSentryConfig } = require('@sentry/nextjs');
```

### framer-motion
**چرا نیاز است:**
- Smooth animations
- Better UX
- Page transitions
- Component animations

**مثال استفاده:**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### @mui/x-date-pickers
**چرا نیاز است:**
- Date picker component
- Time picker
- Date range picker

**مثال استفاده:**
```tsx
import { DatePicker } from '@mui/x-date-pickers';
```

### @tanstack/react-virtual
**چرا نیاز است:**
- Virtual scrolling
- Performance برای لیست‌های بزرگ
- Memory optimization

**مثال استفاده:**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

### next-intl
**چرا نیاز است:**
- چندزبانه‌سازی
- Locale management
- Translation management

**مثال استفاده:**
```tsx
import { useTranslations } from 'next-intl';
```

---

## 🎯 پیشنهاد نصب مرحله‌ای

### مرحله 1: ضروری‌ها (برای Production)
```bash
npm install next-seo @sentry/nextjs
```

### مرحله 2: UX بهتر
```bash
npm install framer-motion
```

### مرحله 3: کامپوننت‌های بیشتر (اگر نیاز باشد)
```bash
npm install @mui/x-date-pickers @tanstack/react-virtual
```

### مرحله 4: اختیاری
```bash
npm install next-intl date-fns react-dropzone
```

---

## ⚠️ نکات مهم

1. **next-seo**: برای SEO ضروری است
2. **@sentry/nextjs**: برای production error tracking توصیه می‌شود
3. **framer-motion**: برای UX بهتر اما اختیاری است
4. **@mui/x-date-pickers**: فقط اگر نیاز به date picker دارید
5. **next-intl**: فقط اگر نیاز به چندزبانه‌سازی دارید

---

## 🔍 بررسی نیاز

قبل از نصب، بررسی کنید:
- آیا نیاز به date picker دارید؟ → `@mui/x-date-pickers`
- آیا نیاز به چندزبانه‌سازی دارید؟ → `next-intl`
- آیا لیست‌های بزرگ دارید؟ → `@tanstack/react-virtual`
- آیا نیاز به file upload دارید？ → `react-dropzone`
