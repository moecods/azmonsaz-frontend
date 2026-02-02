import { ExamQuestion } from '@/types';

/**
 * Get question text from exam question
 */
export function getQuestionText(question: ExamQuestion): string {
  const payload = question.payload || {};
  return payload.question_text || question.question?.text || 'بدون متن';
}

/**
 * Get question options from exam question
 */
export function getQuestionOptions(question: ExamQuestion): any[] {
  const payload = question.payload || {};
  return payload.options || question.question?.options || [];
}

/**
 * Get question type from exam question
 */
export function getQuestionType(question: ExamQuestion): string {
  const payload = question.payload || {};
  return payload.type || question.question?.type || 'multiple_choice';
}

/**
 * Build payload for adding question from bank
 */
export function buildBankQuestionPayload(order: number, points: number = 10): Record<string, unknown> {
  return {
    order,
    points,
  };
}

/**
 * Build payload for adding custom question
 */
export function buildCustomQuestionPayload(
  question: ExamQuestion,
  order: number,
  points: number = 10
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    question_text: question.custom_text || '',
    type: question.question?.type || 'multiple_choice',
    order,
    points,
  };

  if (question.custom_options && question.custom_options.length > 0) {
    payload.options = question.custom_options.map(opt => 
      typeof opt === 'string' ? opt : opt.text
    );
  }

  if (question.custom_correct_answer !== undefined) {
    payload.correct_answer = question.custom_correct_answer;
  }

  return payload;
}

/**
 * Question type labels in Persian
 */
export const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'چند گزینه‌ای',
  true_false: 'صحیح/غلط',
  multiple_select: 'چند گزینه‌ای (چند پاسخ)',
  essay: 'تشریحی',
};

/**
 * Sort questions by order
 */
export function sortQuestionsByOrder(questions: ExamQuestion[]): ExamQuestion[] {
  return [...questions].sort((a, b) => {
    const orderA = a.payload?.order ?? a.id;
    const orderB = b.payload?.order ?? b.id;
    return orderA - orderB;
  });
}

