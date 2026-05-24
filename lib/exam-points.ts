import type { Exam } from '@/types';
import type { ExamQuestion } from '@/types';
import { normalizeDescriptiveConfig } from '@/lib/grading';

export const DEFAULT_POINTS_PER_QUESTION = 1;

export type ExamWithGrading = Exam & {
  grading_mode?: string;
  grading_config?: Record<string, unknown> | null;
  points_per_question?: number;
};

/** Max total question weights when scale grading is configured. */
export function getExamMaxScore(exam: ExamWithGrading | null | undefined): number | null {
  if (!exam) return null;
  const mode = exam.grading_mode ?? 'numeric_percent';
  if (mode !== 'numeric_scale' && mode !== 'descriptive') {
    return null;
  }
  const config = exam.grading_config;
  if (!config || typeof config !== 'object') {
    return null;
  }
  const scaleMax =
    mode === 'descriptive'
      ? normalizeDescriptiveConfig(config as Record<string, unknown>).scale_max
      : Number((config as { scale_max?: number }).scale_max);
  return Number.isFinite(scaleMax) && scaleMax > 0 ? scaleMax : null;
}

export function getDefaultQuestionPoints(exam: ExamWithGrading | null | undefined): number {
  const raw = exam?.points_per_question;
  const value = raw != null ? Number(raw) : DEFAULT_POINTS_PER_QUESTION;
  return value >= 1 ? value : DEFAULT_POINTS_PER_QUESTION;
}

export function getQuestionPoints(
  question: ExamQuestion,
  defaultPoints: number
): number {
  const fromPayload = question.payload?.points;
  if (typeof fromPayload === 'number' && !Number.isNaN(fromPayload)) {
    return Math.max(0, fromPayload);
  }
  return defaultPoints;
}

export function sumExamQuestionPoints(
  questions: ExamQuestion[],
  defaultPoints: number,
  excludeQuestionId?: number
): number {
  return questions.reduce((sum, q) => {
    if (excludeQuestionId != null && q.id === excludeQuestionId) {
      return sum;
    }
    return sum + getQuestionPoints(q, defaultPoints);
  }, 0);
}

export function wouldExceedExamMaxScore(
  exam: ExamWithGrading | null | undefined,
  questions: ExamQuestion[],
  defaultPoints: number,
  proposedPoints: number,
  excludeQuestionId?: number
): { exceeds: boolean; maxScore: number | null; projectedTotal: number } {
  const maxScore = getExamMaxScore(exam);
  const otherSum = sumExamQuestionPoints(questions, defaultPoints, excludeQuestionId);
  const projectedTotal = otherSum + proposedPoints;
  return {
    exceeds: maxScore != null && projectedTotal > maxScore,
    maxScore,
    projectedTotal,
  };
}

/** Whether adding `additionalCount` questions at `defaultPoints` each would exceed exam max. */
export function wouldExceedExamMaxScoreForBatch(
  exam: ExamWithGrading | null | undefined,
  questions: ExamQuestion[],
  defaultPoints: number,
  additionalCount: number
): { exceeds: boolean; maxScore: number | null; projectedTotal: number } {
  const maxScore = getExamMaxScore(exam);
  const currentSum = sumExamQuestionPoints(questions, defaultPoints);
  const projectedTotal = currentSum + additionalCount * defaultPoints;
  return {
    exceeds: maxScore != null && projectedTotal > maxScore,
    maxScore,
    projectedTotal,
  };
}

export function maxPointsAllowedForQuestion(
  exam: ExamWithGrading | null | undefined,
  questions: ExamQuestion[],
  defaultPoints: number,
  questionId: number
): number {
  const maxScore = getExamMaxScore(exam);
  if (maxScore == null) {
    return 100;
  }
  const otherSum = sumExamQuestionPoints(questions, defaultPoints, questionId);
  return Math.max(0, maxScore - otherSum);
}
