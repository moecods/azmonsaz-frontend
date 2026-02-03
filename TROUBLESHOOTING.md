# راهنمای رفع مشکلات

## مشکلات عمومی

### مشکل: vitest: command not found

اگر این خطا را می‌بینید:

```bash
npm install
npm run test
```

یا از npx استفاده کنید:

```bash
npx vitest
```

### مشکل: Import errors در تست‌ها

اگر با خطاهای import مواجه شدید:

1. مطمئن شوید که path aliases در `vitest.config.mjs` و `tsconfig.json` یکسان هستند
2. مطمئن شوید که `@/` به root directory اشاره می‌کند

### مشکل: CSS imports در تست‌ها

اگر با خطاهای CSS import مواجه شدید، در `vitest.config.mjs` اضافه کنید:

```js
css: {
  postcss: false,
}
```

## مشکلات Vitest

### مشکل: PostCSS Config Error در Vitest

اگر با خطای زیر مواجه شدید:

```
Failed to load PostCSS config: Invalid PostCSS Plugin found at: plugins[0]
```

### راه حل

مشکل از این است که Vitest سعی می‌کند PostCSS config را load کند اما Tailwind CSS v4 با روش جدید کار می‌کند.

**راه حل 1: استفاده از vitest.config.mjs**

فایل `vitest.config.mjs` را به صورت ESM ایجاد کنید و PostCSS را disable کنید:

```js
css: {
  postcss: false,
}
```

**راه حل 2: تغییر postcss.config.mjs**

اگر هنوز مشکل دارید، می‌توانید postcss.config.mjs را به این صورت تغییر دهید:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### مشکل: CJS Build Deprecated Warning

اگر warning زیر را می‌بینید:

```
The CJS build of Vite's Node API is deprecated
```

این فقط یک warning است و مشکلی ایجاد نمی‌کند. برای رفع آن، مطمئن شوید که از `.mjs` برای config files استفاده می‌کنید.

## مشکلات CORS

### مشکل: CORS Error

اگر با خطای CORS مواجه شدید:

```
Access to fetch at 'http://localhost:3000/' (redirected from 'http://azmonsaz.test/api/questions') 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**راه حل‌ها:**

1. **بررسی `.env.local`**:
   ```env
   NEXT_PUBLIC_API_URL=http://azmonsaz.test/api
   ```
   یا اگر از Laravel built-in server استفاده می‌کنید:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. **Restart کردن Next.js dev server** بعد از تغییر environment variable

3. **بررسی Laravel backend**:
```bash
   curl http://azmonsaz.test/api/question-categories
   ```

4. **Clear کردن Laravel cache**:
   ```bash
   cd azmonsaz
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

5. **بررسی CORS middleware** در Laravel

6. **Clear کردن browser cache** (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)

