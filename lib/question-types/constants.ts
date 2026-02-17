/**
 * Question type IDs - single source aligned with backend QuestionTypeStrategyFactory.
 */

export const QUESTION_TYPE_IDS = [
  'multiple_choice',
  'true_false',
  'multiple_select',
  'essay',
  'short_answer',
  'fill_in_the_blank',
  'matching',
  'ordering',
] as const;

export type QuestionTypeId = (typeof QUESTION_TYPE_IDS)[number];

export function isQuestionTypeId(value: string): value is QuestionTypeId {
  return QUESTION_TYPE_IDS.includes(value as QuestionTypeId);
}
