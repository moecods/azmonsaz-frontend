import type { ExamFormData } from "@/lib/validation";

export const EXAM_SCHEDULE_LABELS: Record<
  NonNullable<ExamFormData["schedule_type"]>,
  string
> = {
  none: "بدون زمان‌بندی (پیش‌نویس / چاپ)",
  fixed_window: "بازه ثابت (تاریخ + شروع و پایان)",
  duration_only: "فقط مدت — شروع با ورود دانش‌آموز",
  registration_deadline: "مهلت ثبت‌نام + بازه",
  flexible_until: "در دسترس از / تا مهلت",
};

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
