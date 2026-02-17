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
  // Send date, start_time, end_time instead of start_at and end_at
  if (data.exam_date) {
    meta.date = data.exam_date;
  }
  if (data.start_time) {
    meta.start_time = data.start_time;
  }
  if (data.end_time) {
    meta.end_time = data.end_time;
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

/**
 * Loads meta fields from exam into form values
 */
export function loadExamMetaToForm(exam: Exam): Partial<ExamFormData> {
  const meta = exam.meta || {};
  
  // Handle both old format (start_at, end_at) and new format (date, start_time, end_time)
  let examDate = meta.date ?? null;
  let startTime = meta.start_time ?? null;
  let endTime = meta.end_time ?? null;
  
  // If old format exists, parse it to new format
  if (!examDate && meta.start_at) {
    try {
      const startAt = new Date(meta.start_at as string);
      examDate = startAt.toISOString().split('T')[0];
      startTime = startAt.toTimeString().slice(0, 5); // HH:mm format
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  if (!endTime && meta.end_at) {
    try {
      const endAt = new Date(meta.end_at as string);
      endTime = endAt.toTimeString().slice(0, 5); // HH:mm format
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
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

