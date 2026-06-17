import type { PrintQuestionVariant } from "@/lib/question-types/print/types";
import type { ExamPrintSettings } from "@/lib/question-types/print-settings";

export type { ExamPrintSettings };

export type ExamPrintMode = "student" | "answer_key";

/** Resolve print mode from URL search params. */
export function resolvePrintMode(
  raw: string | null | undefined,
  modeParam?: string | null
): ExamPrintMode {
  if (modeParam === "answer_key") return "answer_key";
  if (raw === "1" || raw === "true") return "answer_key";
  return "student";
}

/** Header fields editable before print. */
export interface PrintHeaderOverrides {
  schoolName?: string;
  className?: string;
  grade?: string;
  studentCode?: string;
  courseName?: string;
  examDate?: string;
  examTime?: string;
  teacherName?: string;
  studentFirstName?: string;
  studentLastName?: string;
}

export interface ExamQuestionForPrint {
  id: number;
  question_id?: number | null;
  payload?: Record<string, unknown>;
}

export interface ExamForPrint {
  id: number;
  title: string;
  partner_id?: number | null;
  type?: "offline" | "online";
  meta?: {
    duration_minutes?: number;
    passing_score?: number;
    instructions?: string;
    points_per_question?: number;
  };
  exam_questions?: ExamQuestionForPrint[];
  partner?: { name?: string };
  points_per_question?: number;
  print_settings?: ExamPrintSettings;
}

export interface PrintInteractionOptions {
  interactive?: boolean;
  onQuestionClick?: (questionNumber: number) => void;
}

export interface ExamTemplateProps {
  exam: ExamForPrint;
  headerOverrides?: PrintHeaderOverrides;
  printInteraction?: PrintInteractionOptions;
}

export type ExamTemplateId =
  | "formal_school"
  | "preschool"
  | "primary_playful"
  | "primary"
  | "middle_school"
  | "high_school"
  | "college"
  | "persian_college"
  | "modern"
  | "classic"
  | "simple_persian"
  | "compact";

export type EducationLevel =
  | "preschool"
  | "primary"
  | "middle"
  | "high"
  | "university"
  | "general";

export interface ExamTemplateConfig {
  id: ExamTemplateId;
  label: string;
  description: string;
  level: EducationLevel;
  levelLabel: string;
  questionVariant: PrintQuestionVariant;
  hasHeaderFields: boolean;
}

export const LEGACY_TEMPLATE_ALIASES: Record<string, ExamTemplateId> = {
  default: "modern",
  persian_college: "persian_college",
  simple_persian: "simple_persian",
  formal_school: "formal_school",
  college: "college",
  modern: "modern",
  classic: "classic",
};

export function resolveTemplateId(raw: string | null | undefined): ExamTemplateId {
  const value = raw?.trim() || "formal_school";
  if (value in LEGACY_TEMPLATE_ALIASES) {
    return LEGACY_TEMPLATE_ALIASES[value];
  }
  if (EXAM_TEMPLATE_IDS.includes(value as ExamTemplateId)) {
    return value as ExamTemplateId;
  }
  return "formal_school";
}

export const EXAM_TEMPLATE_IDS: ExamTemplateId[] = [
  "formal_school",
  "preschool",
  "primary_playful",
  "primary",
  "middle_school",
  "high_school",
  "college",
  "persian_college",
  "modern",
  "classic",
  "simple_persian",
  "compact",
];

export const TEMPLATE_HEADER_FIELDS: Record<
  ExamTemplateId,
  { key: keyof PrintHeaderOverrides; label: string }[]
> = {
  formal_school: [
    { key: "schoolName", label: "اسم مدرسه" },
    { key: "className", label: "کلاس" },
    { key: "grade", label: "پایه" },
    { key: "studentCode", label: "کد دانش‌آموزی" },
    { key: "courseName", label: "درس" },
    { key: "examDate", label: "تاریخ امتحان" },
    { key: "examTime", label: "وقت امتحان" },
    { key: "teacherName", label: "نام دبیر" },
  ],
  middle_school: [
    { key: "schoolName", label: "اسم مدرسه" },
    { key: "className", label: "کلاس" },
    { key: "grade", label: "پایه" },
    { key: "courseName", label: "درس" },
    { key: "examDate", label: "تاریخ" },
    { key: "teacherName", label: "نام دبیر" },
  ],
  high_school: [
    { key: "schoolName", label: "اسم مدرسه" },
    { key: "className", label: "کلاس" },
    { key: "grade", label: "پایه" },
    { key: "studentCode", label: "کد دانش‌آموزی" },
    { key: "courseName", label: "درس" },
    { key: "examDate", label: "تاریخ امتحان" },
    { key: "examTime", label: "وقت امتحان" },
    { key: "teacherName", label: "نام دبیر" },
  ],
  primary: [
    { key: "schoolName", label: "اسم مدرسه" },
    { key: "className", label: "کلاس" },
    { key: "grade", label: "پایه" },
    { key: "courseName", label: "درس" },
  ],
  primary_playful: [
    { key: "schoolName", label: "اسم مدرسه" },
    { key: "className", label: "کلاس" },
    { key: "courseName", label: "درس" },
  ],
  preschool: [
    { key: "schoolName", label: "نام مهد/مدرسه" },
    { key: "className", label: "گروه" },
    { key: "courseName", label: "موضوع" },
  ],
  college: [],
  persian_college: [
    { key: "courseName", label: "نام درس" },
    { key: "examDate", label: "تاریخ" },
    { key: "teacherName", label: "نام استاد" },
  ],
  modern: [],
  classic: [],
  simple_persian: [],
  compact: [],
};
