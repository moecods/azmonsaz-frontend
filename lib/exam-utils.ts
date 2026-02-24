import { ExamFormData } from './validation';
import { Exam } from '@/types';
import { handleError } from './error-handler';

/**
 * Builds meta object from exam form data, excluding null/undefined values
 */
export function buildExamMeta(data: ExamFormData): Record<string, unknown> | undefined {
  const meta: Record<string, unknown> = {};

  if (data.duration_minutes) {
    meta.duration_minutes = data.duration_minutes;
  }
  if (data.passing_score !== null && data.passing_score !== undefined) {
    meta.passing_score = data.passing_score;
  }
  if (data.max_attempts) {
    meta.max_attempts = data.max_attempts;
  }
  if (data.instructions) {
    meta.instructions = data.instructions;
  }
  if (data.tags && data.tags.length > 0) {
    meta.tags = data.tags;
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

/**
 * Loads meta fields from exam into form values
 */
export function loadExamMetaToForm(exam: Exam): Partial<ExamFormData> {
  const meta = exam.meta || {};
  const examWithDates = exam as Exam & { exam_date?: string; start_time?: string; end_time?: string };

  const examDate = examWithDates.exam_date ?? null;
  const startTime = examWithDates.start_time ?? null;
  const endTime = examWithDates.end_time ?? null;

  return {
    duration_minutes: meta.duration_minutes ?? null,
    passing_score: meta.passing_score ?? null,
    max_attempts: meta.max_attempts ?? null,
    instructions: meta.instructions ?? '',
    tags: meta.tags ?? [],
    exam_date: examDate,
    start_time: startTime,
    end_time: endTime,
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

