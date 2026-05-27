# راهنمای طراحی UI (منبع حقیقت)

این سند برای **توسعه‌دهندگان و AI** است تا تصمیم‌های بصری در repo ثبت شود، نه فقط در چت.

## سلسله‌مراتب منابع

```
1. theme/tokens.ts          ← رنگ، فونت، radius (تغییر اصلی اینجا)
2. theme/createAppTheme.ts  ← تم MUI
3. theme/page-sx.ts         ← الگوهای صفحه (برند، auth، section)
4. docs/UI_STANDARDS.md     ← جزئیات UX، a11y، الگوهای کامپوننت
5. theme/design-tokens.json ← export اختیاری برای Figma
6. Storybook (`components/**/*.stories.tsx`) ← نمونه‌های فارسی/RTL برای کامپوننت‌های reusable
```

اگر سندی با کد conflict داشت، **کد در `theme/` اولویت دارد** — سند را به‌روز کنید.

Storybook: `npm run storybook` — rules in `AGENTS.md` and backlog in `docs/storybook/BACKLOG.md`.

## قوانین اجباری

### رنگ و تم

- از `theme.palette.*` و `alpha(theme.palette.primary.main, 0.1)` استفاده کنید.
- **hex دستی ممنوع** در کامپوننت‌های جدید (مثل `#1976d2`).
- حالت روشن/تاریک: `useColorMode()` — پیش‌فرض `light`، ذخیره در `localStorage` کلید `azmonsaz-color-mode`.

### گرادیان برند

- فقط `brandPanelSx(theme)` از `@/theme/page-sx` — برای auth، لندینگ، CTA.
- رشته `linear-gradient(145deg, ...)` را کپی نکنید.

### فاصله و شعاع

- فاصله: `theme.spacing(n)` (واحد پایه **8px**).
- شعاع پیش‌فرض دکمه/فیلد: **8px**؛ کارت MUI: **12px**.
- صفحات auth: `authPageSx` از `@/components/auth/auth-layout` یا `@/theme/page-sx`.

### تایپوگرافی

- فارسی: **Vazirmatn** (در `typographyTokens.fontFamily.fa`).
- عناوین صفحه: `variant="h3"` / `h4` با `fontWeight={700|800}` — نه فونت سایز دستی مگر breakpoint.

### RTL

- `dir="rtl"` روی `<html>` — از `insetInlineStart` / `marginInline` استفاده کنید، نه فقط `left`/`right`.

### دکمه‌ها

- `textTransform: none` (در تم global).
- CTA اصلی: `variant="contained"` + `color="primary"`.
- دکمه‌های برجسته روی پنل برند: پس‌زمینه `background.paper`، متن `primary.main`.

## کجا استایل بگذاریم؟

| نوع صفحه | محل استایل |
|----------|------------|
| Auth (login/register) | `authPageSx` |
| لندینگ / مارکتینگ | `pageSectionSx`, `brandPanelSx`, `elevatedCardSx` |
| داشبورد / پنل کاربر | MUI defaults + `Card variant="outlined"` |
| آزمون در حال برگزاری | `take-exam-styles.ts` فقط |

## استثنا: Take Exam

`components/exams/take/take-exam-styles.ts` تم جدا با پس‌زمینه آرام دارد.  
**دلیل:** تمرکز کاربر حین آزمون.  
تغییر در آن فایل باید در این سند ثبت شود. برای صفحات جدید از آن کپی نکنید.

## چک‌لیست قبل از PR UI

- [ ] hex جدید در فایل کامپوننت نیست
- [ ] `brandPanelSx` برای پنل‌های آبی برند
- [ ] dark mode با `theme.palette.mode` تست شده
- [ ] موبایل: `xs` / `sm` / `md` در `sx`
- [ ] اگر توکن جدید لازم است → `theme/tokens.ts` + `design-tokens.json`

## فایل‌های مرتبط

- [`theme/README.md`](../theme/README.md)
- [`UI_STANDARDS.md`](./UI_STANDARDS.md)
- [`AGENTS.md`](../AGENTS.md) — دستورالعمل برای AI
