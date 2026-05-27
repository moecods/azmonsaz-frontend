import type { ExamFormData } from "@/lib/validation";

export const EXAM_SCHEDULE_LABELS: Record<
  NonNullable<ExamFormData["schedule_type"]>,
  string
> = {
  none: "بدون محدودیت زمانی",
  fixed_window: "بازه ثابت",
  duration_only: "مدت از لحظه ورود",
  registration_deadline: "مهلت ثبت‌نام + بازه",
  flexible_until: "بازه انعطاف‌پذیر",
};

export const EXAM_SCHEDULE_DESCRIPTIONS: Record<
  NonNullable<ExamFormData["schedule_type"]>,
  string
> = {
  none: "آزمون آنلاین بدون زمان شروع/پایان مشخص (مناسب پیش‌نویس یا چاپ).",
  fixed_window: "تاریخ و ساعت شروع و پایان برای همه شرکت‌کنندگان یکسان است.",
  duration_only: "هر نفر با ورود به آزمون، مدت مشخصی برای پاسخ‌دهی دارد.",
  registration_deadline: "ثبت‌نام تا مهلت معین؛ برگزاری در بازه زمانی ثابت.",
  flexible_until: "از تاریخی در دسترس است تا مهلت نهایی انجام.",
};

export const GRADING_MODE_OPTIONS: {
  value: NonNullable<ExamFormData["grading_mode"]>;
  title: string;
  description: string;
}[] = [
  {
    value: "numeric_percent",
    title: "نمره درصدی",
    description: "قبولی بر اساس حداقل درصد (مثلاً ۵۰٪).",
  },
  {
    value: "numeric_scale",
    title: "مقیاس عددی",
    description: "نمره از یک سقف مشخص، مثلاً از ۲۰.",
  },
  {
    value: "descriptive",
    title: "نمره توصیفی",
    description: "پانگ‌هایی مثل «خیلی خوب»، «خوب»، «قابل قبول».",
  },
];

export const EXAM_TYPE_LABELS: Record<NonNullable<ExamFormData["type"]>, string> = {
  online: "آنلاین",
  offline: "آفلاین",
};

export const GRADING_MODE_LABELS: Record<
  NonNullable<ExamFormData["grading_mode"]>,
  string
> = {
  numeric_percent: "درصدی (نمره قبولی %)",
  numeric_scale: "مقیاس عددی",
  descriptive: "توصیفی (پانگ‌های نمره)",
  banded: "باندی",
};
