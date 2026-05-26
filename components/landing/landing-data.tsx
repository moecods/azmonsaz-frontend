import type { ReactNode } from "react";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import GroupIcon from "@mui/icons-material/Group";

export const LANDING_NAV = [
  { id: "features", label: "امکانات" },
  { id: "how-it-works", label: "راه‌اندازی" },
  { id: "benefits", label: "مزایا" },
] as const;

export const LANDING_STATS = [
  { value: "نامحدود", label: "سوالات در بانک" },
  { value: "چندلایه", label: "دسته‌بندی و برچسب" },
  { value: "لحظه‌ای", label: "گزارش و تحلیل" },
  { value: "امن", label: "اجرای آزمون آنلاین" },
] as const;

export interface LandingFeature {
  icon: ReactNode;
  title: string;
  desc: string;
  accent: "primary" | "secondary" | "info" | "success";
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: <SchoolIcon />,
    title: "بانک سوالات هوشمند",
    desc: "ایجاد و مدیریت آرشیو سوالات با دسته‌بندی درختی، برچسب و جستجوی سریع.",
    accent: "primary",
  },
  {
    icon: <QuizIcon />,
    title: "سازنده آزمون انعطاف‌پذیر",
    desc: "زمان، نمره‌دهی، تصادفی‌سازی و قوانین شرکت — متناسب با هر سناریوی آموزشی.",
    accent: "secondary",
  },
  {
    icon: <SecurityIcon />,
    title: "امنیت و محرمانگی",
    desc: "حفاظت از سوالات و نتایج با احراز هویت و سطوح دسترسی قابل تنظیم.",
    accent: "info",
  },
  {
    icon: <SpeedIcon />,
    title: "عملکرد پایدار",
    desc: "زیرساخت مناسب برگزاری آزمون با تعداد بالای شرکت‌کننده همزمان.",
    accent: "success",
  },
  {
    icon: <AnalyticsIcon />,
    title: "داشبورد تحلیلی",
    desc: "نمودارها و گزارش‌های دقیق برای ارزیابی عملکرد و تصمیم‌گیری آموزشی.",
    accent: "primary",
  },
  {
    icon: <GroupIcon />,
    title: "مدیریت کاربران",
    desc: "نقش‌های مدیر، ناظر و آزمون‌دهنده برای سازمان‌ها و تیم‌های آموزشی.",
    accent: "secondary",
  },
];

export const LANDING_STEPS = [
  {
    step: "۱",
    title: "ایجاد حساب",
    desc: "ثبت‌نام سریع و ورود به پنل مدیریت سازمان.",
  },
  {
    step: "۲",
    title: "طراحی سوالات",
    desc: "افزودن سوالات به بانک با انواع مختلف و دسته‌بندی.",
  },
  {
    step: "۳",
    title: "تنظیم آزمون",
    desc: "انتخاب سوالات، زمان‌بندی و انتشار لینک شرکت.",
  },
  {
    step: "۴",
    title: "تحلیل نتایج",
    desc: "مشاهده پاسخ‌ها و دریافت گزارش‌های آماری.",
  },
] as const;

export const LANDING_BENEFITS = [
  "صرفه‌جویی در زمان با استفاده مجدد از سوالات",
  "سازمان‌دهی منعطف با دسته‌بندی درختی",
  "امنیت داده‌ها و کنترل دسترسی",
  "شخصی‌سازی ظاهر آزمون با برند سازمان",
  "مدیریت متمرکز آزمون‌ها و کاربران",
  "پشتیبانی از گروه‌ها و کلاس‌های آموزشی",
] as const;
