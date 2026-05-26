# Theme & Design Tokens

منبع حقیقت بصری اپ در این پوشه است — نه در تاریخچه چت AI.

## فایل‌ها

| فایل | نقش |
|------|-----|
| `tokens.ts` | رنگ‌ها، تایپوگرافی، radius، shadow — **تغییر رنگ فقط اینجا** |
| `createAppTheme.ts` | ساخت تم MUI از `tokens.ts` |
| `page-sx.ts` | الگوهای `sx` مشترک (برند، auth، section) |
| `ColorModeProvider.tsx` | روشن / تاریک + `localStorage` |
| `ThemeRegistry.tsx` | RTL + Emotion + ThemeProvider |
| `design-tokens.json` | export برای Figma (Tokens Studio) |

## قبل از UI جدید

1. بخوانید: [`docs/DESIGN.md`](../docs/DESIGN.md)
2. جزئیات UX: [`docs/UI_STANDARDS.md`](../docs/UI_STANDARDS.md)
3. از `theme.palette` و `page-sx` استفاده کنید — hex دستی ممنوع (جز استثناهای مستند)

## الگوهای آماده

```tsx
import { useTheme } from "@mui/material";
import { brandPanelSx, authPageSx, pageSectionSx } from "@/theme/page-sx";

const theme = useTheme();
<Box sx={brandPanelSx(theme)}>...</Box>
```

```tsx
// Auth pages — بدون تغییر import قدیمی
import { authPageSx } from "@/components/auth/auth-layout";
```

## استثناهای شناخته‌شده

- `components/exams/take/take-exam-styles.ts` — تم جدا برای تمرکز حین آزمون (legacy). تغییر فقط با به‌روزرسانی `docs/DESIGN.md`.
