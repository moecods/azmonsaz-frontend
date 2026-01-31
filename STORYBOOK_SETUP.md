# راهنمای راه‌اندازی Storybook

## نصب

برای نصب Storybook و dependencies مورد نیاز، دستور زیر را اجرا کنید:

```bash
npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-a11y @storybook/addon-viewport @storybook/blocks storybook
```

یا اگر از yarn استفاده می‌کنید:

```bash
yarn add -D @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-a11y @storybook/addon-viewport @storybook/blocks storybook
```

## اجرا

برای اجرای Storybook در حالت development:

```bash
npm run storybook
```

Storybook در آدرس `http://localhost:6006` اجرا می‌شود.

## Build برای Production

برای build کردن Storybook به صورت static:

```bash
npm run build-storybook
```

فایل‌های build شده در پوشه `storybook-static` قرار می‌گیرند.

## ساختار

```
.storybook/
  ├── main.ts          # پیکربندی اصلی Storybook
  └── preview.tsx      # پیکربندی preview (decorators, parameters)

components/
  └── ui/
      └── Button/
          ├── Button.tsx
          └── Button.stories.tsx  # Story file
```

## نوشتن Story

برای هر کامپوننت، یک فایل `.stories.tsx` ایجاد کنید:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Category/ComponentName',
  component: YourComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Description of your component',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

## Addons نصب شده

- **@storybook/addon-essentials**: شامل Controls, Actions, Viewport, Backgrounds, و Docs
- **@storybook/addon-interactions**: برای تست تعاملات
- **@storybook/addon-links**: برای لینک کردن stories
- **@storybook/addon-a11y**: برای بررسی accessibility
- **@storybook/addon-viewport**: برای تست responsive design

## Decorators

در `.storybook/preview.tsx`، decorators زیر اضافه شده‌اند:

- **ThemeRegistry**: برای استفاده از MUI theme
- **QueryClientProvider**: برای React Query

## Stories موجود

### UI Components
- ✅ `Button` - دکمه با variants و sizes مختلف
- ✅ `Card` - کارت با variants مختلف

### Feedback Components
- ✅ `Loading` - نمایش loading state
- ✅ `Alert` - نمایش پیام‌های مختلف

## نکات مهم

1. **Path Aliases**: از `@/` برای import استفاده کنید
2. **MUI Integration**: Theme و components MUI به صورت خودکار در دسترس هستند
3. **React Query**: برای کامپوننت‌هایی که از React Query استفاده می‌کنند، QueryClientProvider اضافه شده است
4. **RTL Support**: Theme از RTL پشتیبانی می‌کند

## مثال‌های بیشتر

برای مثال‌های بیشتر، به فایل‌های `.stories.tsx` موجود مراجعه کنید.

## Troubleshooting

### مشکل: Storybook اجرا نمی‌شود
- مطمئن شوید که همه dependencies نصب شده‌اند
- پورت 6006 را بررسی کنید که آزاد باشد

### مشکل: `__dirname is not defined`
- مشکل: در ESM modules، `__dirname` به صورت خودکار تعریف نمی‌شود
- حل: استفاده از `fileURLToPath` و `import.meta.url` برای تعریف `__dirname`

### مشکل: Import errors
- مطمئن شوید که path aliases در `.storybook/main.ts` به درستی تنظیم شده‌اند

### مشکل: MUI components کار نمی‌کنند
- مطمئن شوید که `ThemeRegistry` در decorators اضافه شده است

### مشکل: Addons نصب نشده
- اگر addons زیر نصب نشده باشند، از `main.ts` حذف کنید:
  - `@storybook/addon-essentials`
  - `@storybook/addon-interactions`
  - `@storybook/addon-links`
  - `@storybook/addon-viewport`
- یا آنها را نصب کنید:
  ```bash
  npm install --save-dev @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-viewport
  ```

