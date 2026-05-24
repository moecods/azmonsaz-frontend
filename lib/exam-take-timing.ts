import type { ExamFormData } from "@/lib/validation";

export type ExamScheduleType = NonNullable<ExamFormData["schedule_type"]>;

export type ExamTakeTimingKind =
  | "none"
  | "participant_duration"
  | "exam_window"
  | "flexible_deadline"
  | "combined";

/** Server timing payload (start exam / sync). */
export interface ExamTakeTimingDescriptor {
  visible: boolean;
  remaining_seconds: number | null;
  kind: ExamTakeTimingKind | string;
  label: string;
  hint?: string | null;
}

export interface ExamTakeTimingPreview {
  visible: boolean;
  label: string;
  hint?: string | null;
  duration_minutes?: number | null;
}

export interface ExamTakeTimingInput {
  schedule_type?: ExamScheduleType | string | null;
  duration_minutes?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  due_by?: string | null;
  timing?: ExamTakeTimingDescriptor | null;
  timing_preview?: ExamTakeTimingPreview | null;
  remaining_seconds?: number | null;
}

export function formatTakeExamDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Normalize API timing for UI state. */
export function resolveTakeExamTiming(
  input: ExamTakeTimingInput,
  participantStarted: boolean
): ExamTakeTimingDescriptor {
  if (input.timing) {
    return {
      visible: input.timing.visible,
      remaining_seconds: input.timing.remaining_seconds,
      kind: (input.timing.kind as ExamTakeTimingKind) ?? "none",
      label: input.timing.label || "زمان باقی‌مانده",
      hint: input.timing.hint ?? null,
    };
  }

  if (!participantStarted && input.timing_preview) {
    return {
      visible: false,
      remaining_seconds: null,
      kind: "none",
      label: input.timing_preview.label,
      hint: input.timing_preview.hint ?? null,
    };
  }

  if (input.remaining_seconds != null && participantStarted) {
    return {
      visible: true,
      remaining_seconds: input.remaining_seconds,
      kind: "participant_duration",
      label: "زمان باقی‌مانده",
      hint: null,
    };
  }

  return {
    visible: false,
    remaining_seconds: null,
    kind: "none",
    label: "بدون محدودیت زمانی",
    hint: null,
  };
}
