import { ExamFormData } from './validation';
import { Exam } from '@/types';

/**
 * Builds meta object from exam form data, excluding null/undefined values
 */
export function buildExamMeta(data: ExamFormData): Record<string, any> | undefined {
  const meta: Record<string, any> = {};

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
  if (data.start_at) {
    meta.start_at = data.start_at;
  }
  if (data.end_at) {
    meta.end_at = data.end_at;
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

/**
 * Loads meta fields from exam into form values
 */
export function loadExamMetaToForm(exam: Exam): Partial<ExamFormData> {
  const meta = exam.meta || {};
  return {
    duration_minutes: meta.duration_minutes ?? null,
    passing_score: meta.passing_score ?? null,
    max_attempts: meta.max_attempts ?? null,
    instructions: meta.instructions ?? '',
    tags: meta.tags ?? [],
    start_at: meta.start_at ?? null,
    end_at: meta.end_at ?? null,
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
    console.error('Invalid callback URL:', baseUrl, error);
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

