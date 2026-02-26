import { ExamFormData } from './validation';
import { Exam } from '@/types';
import { handleError } from './error-handler';

/** Exam with flat fields (duration_minutes, passing_score, etc.) - API returns these at top level. */
type ExamWithFlat = Exam & {
  duration_minutes?: number | null;
  passing_score?: number | null;
  instructions?: string | null;
  tags?: string[] | null;
  points_per_question?: number;
};

/** Get duration_minutes from exam (flat or legacy meta). */
export function getExamDurationMinutes(exam: Exam): number | null | undefined {
  const e = exam as ExamWithFlat;
  return e.duration_minutes ?? (exam.meta as { duration_minutes?: number })?.duration_minutes ?? null;
}

/** Get passing_score from exam (flat or legacy meta). */
export function getExamPassingScore(exam: Exam): number | null | undefined {
  const e = exam as ExamWithFlat;
  return e.passing_score ?? (exam.meta as { passing_score?: number })?.passing_score ?? null;
}

/** Get instructions from exam (flat or legacy meta). */
export function getExamInstructions(exam: Exam): string | undefined {
  const e = exam as ExamWithFlat;
  return (e.instructions ?? (exam.meta as { instructions?: string })?.instructions) ?? undefined;
}

/** Get points_per_question from exam (flat or legacy meta). */
export function getExamPointsPerQuestion(exam: Exam): number {
  const e = exam as ExamWithFlat;
  return e.points_per_question ?? (exam.meta as { points_per_question?: number })?.points_per_question ?? 10;
}

/**
 * Loads exam fields (duration_minutes, passing_score, etc.) from exam into form values.
 * Reads from flat fields on exam; supports legacy exam.meta for backward compatibility.
 */
export function loadExamMetaToForm(exam: Exam): Partial<ExamFormData> {
  const flat = exam as Exam & {
    duration_minutes?: number | null;
    passing_score?: number | null;
    instructions?: string | null;
    tags?: string[] | null;
    exam_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
  };
  const meta = exam.meta as Record<string, unknown> | undefined;

  return {
    duration_minutes: flat.duration_minutes ?? (meta?.duration_minutes as number) ?? null,
    passing_score: flat.passing_score ?? (meta?.passing_score as number) ?? null,
    instructions: (flat.instructions ?? meta?.instructions ?? '') as string,
    tags: (flat.tags ?? meta?.tags ?? []) as string[],
    exam_date: flat.exam_date ?? null,
    start_time: flat.start_time ?? null,
    end_time: flat.end_time ?? null,
  };
}

/**
 * Builds callback URL with exam ID and status
 * @throws {Error} If baseUrl is invalid or empty
 */
export function buildCallbackUrl(
  baseUrl: string | null | undefined,
  examId: number,
  additionalParams?: Record<string, string>
): string {
  if (!baseUrl || typeof baseUrl !== 'string' || baseUrl.trim() === '') {
    throw new Error('Callback URL is required');
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('exam_id', examId.toString());
    url.searchParams.set('status', 'completed');
    
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value != null && value !== '') {
        url.searchParams.set(key, value);
        }
      });
    }
    
    return url.toString();
  } catch (error) {
    handleError(error, { context: 'Build Callback URL' });
    throw new Error('Invalid callback URL provided');
  }
}

/**
 * Checks if user has creator/admin/content_manager role
 */
export function isCreatorUser(roles?: string[]): boolean {
  if (!roles) return false;
  return roles.some(role => ['admin', 'content_manager', 'creator'].includes(role));
}

