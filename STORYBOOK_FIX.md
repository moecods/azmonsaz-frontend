# Storybook Fixes

## مشکلات حل شده

### 1. `__dirname is not defined`
- مشکل: در ESM modules، `__dirname` به صورت خودکار تعریف نمی‌شود
- حل: استفاده از `fileURLToPath` و `import.meta.url` برای تعریف `__dirname`

### 2. Addons نصب نشده
- مشکل: Addons زیر نصب نشده بودند:
  - `@storybook/addon-essentials`
  - `@storybook/addon-interactions`
  - `@storybook/addon-links`
  - `@storybook/addon-viewport`
- حل: این addons از `main.ts` حذف شدند چون نصب نشده بودند. اگر می‌خواهید از آنها استفاده کنید، باید نصب شوند.

## نصب Addons (اختیاری)

اگر می‌خواهید addons بیشتری داشته باشید:

```bash
npm install --save-dev @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-viewport
```

سپس آنها را به `addons` array در `.storybook/main.ts` اضافه کنید.

## Addons فعلی

Addons نصب شده و فعال:
- `@chromatic-com/storybook` - برای visual testing
- `@storybook/addon-vitest` - برای تست‌ها
- `@storybook/addon-a11y` - برای accessibility testing
- `@storybook/addon-docs` - برای مستندات

## تست

حالا Storybook باید بدون خطا اجرا شود:

```bash
npm run storybook
```

