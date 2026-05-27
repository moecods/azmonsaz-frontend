import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PreviewIcon from "@mui/icons-material/Preview";

export const EXAM_FORM_STEPS = [
  {
    id: "basic",
    label: "اطلاعات پایه",
    shortLabel: "پایه",
    description: "عنوان، نوع و مسئول آزمون",
    icon: InfoOutlinedIcon,
  },
  {
    id: "settings",
    label: "تنظیمات و نمره‌دهی",
    shortLabel: "تنظیمات",
    description: "نمره‌دهی، دستورالعمل و انتشار نتیجه",
    icon: TuneIcon,
  },
  {
    id: "scheduling",
    label: "زمان‌بندی",
    shortLabel: "زمان",
    description: "بازه برگزاری و محدودیت زمانی",
    icon: ScheduleIcon,
  },
  {
    id: "preview",
    label: "پیش‌نمایش",
    shortLabel: "پیش‌نمایش",
    description: "بررسی نهایی قبل از ذخیره",
    icon: PreviewIcon,
  },
] as const;

export const EXAM_FORM_PREVIEW_STEP_INDEX = EXAM_FORM_STEPS.length - 1;
