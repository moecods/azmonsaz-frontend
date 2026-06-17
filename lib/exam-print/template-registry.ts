import type { ExamTemplateConfig, ExamTemplateId } from "./types";

export const EXAM_TEMPLATES: ExamTemplateConfig[] = [
  {
    id: "formal_school",
    label: "رسمی مدرسه",
    description: "فرم استاندارد آموزش‌وپرورش با جدول بارم و مشخصات دانش‌آموز",
    level: "general",
    levelLabel: "همه مقاطع",
    questionVariant: "formal",
    hasHeaderFields: true,
  },
  {
    id: "preschool",
    label: "پیش‌دبستانی",
    description: "فونت بزرگ، حاشیه شاد و فضای پاسخ وسیع برای کودکان",
    level: "preschool",
    levelLabel: "پیش‌دبستانی",
    questionVariant: "playful",
    hasHeaderFields: true,
  },
  {
    id: "primary_playful",
    label: "ابتدایی کودکانه",
    description: "طراحی شاد با حاشیه خط‌چین برای کلاس‌های ابتدایی",
    level: "primary",
    levelLabel: "ابتدایی",
    questionVariant: "playful",
    hasHeaderFields: true,
  },
  {
    id: "primary",
    label: "ابتدایی",
    description: "ساده و خوانا برای دانش‌آموزان ابتدایی",
    level: "primary",
    levelLabel: "ابتدایی",
    questionVariant: "default",
    hasHeaderFields: true,
  },
  {
    id: "middle_school",
    label: "متوسطه اول",
    description: "هدر منظم با جدول مشخصات برای دوره اول متوسطه",
    level: "middle",
    levelLabel: "متوسطه اول",
    questionVariant: "default",
    hasHeaderFields: true,
  },
  {
    id: "high_school",
    label: "دبیرستان",
    description: "فرم رسمی با فضای بیشتر برای پاسخ تشریحی",
    level: "high",
    levelLabel: "دبیرستان",
    questionVariant: "default",
    hasHeaderFields: true,
  },
  {
    id: "college",
    label: "دانشگاهی (EN)",
    description: "چیدمان آکادمیک انگلیسی با هدر LTR",
    level: "university",
    levelLabel: "دانشگاه",
    questionVariant: "minimal",
    hasHeaderFields: false,
  },
  {
    id: "persian_college",
    label: "دانشگاهی فارسی",
    description: "قالب دانشگاهی با عناوین فارسی",
    level: "university",
    levelLabel: "دانشگاه",
    questionVariant: "default",
    hasHeaderFields: true,
  },
  {
    id: "modern",
    label: "مدرن",
    description: "طراحی تمیز و معاصر برای هر مقطعی",
    level: "general",
    levelLabel: "عمومی",
    questionVariant: "default",
    hasHeaderFields: false,
  },
  {
    id: "classic",
    label: "کلاسیک",
    description: "سیاه‌سفید، مینیمال و مناسب چاپ اقتصادی",
    level: "general",
    levelLabel: "عمومی",
    questionVariant: "minimal",
    hasHeaderFields: false,
  },
  {
    id: "simple_persian",
    label: "ساده فارسی",
    description: "حداقل تزئین، تمرکز بر متن سوالات",
    level: "general",
    levelLabel: "عمومی",
    questionVariant: "minimal",
    hasHeaderFields: false,
  },
  {
    id: "compact",
    label: "فشرده دو ستونه",
    description: "برای آزمون‌های طولانی؛ گزینه‌ها در دو ستون",
    level: "general",
    levelLabel: "عمومی",
    questionVariant: "compact",
    hasHeaderFields: false,
  },
];

export function getTemplateConfig(id: ExamTemplateId): ExamTemplateConfig {
  return EXAM_TEMPLATES.find((t) => t.id === id) ?? EXAM_TEMPLATES[0];
}

export function getValidTemplateIds(): ExamTemplateId[] {
  return EXAM_TEMPLATES.map((t) => t.id);
}
