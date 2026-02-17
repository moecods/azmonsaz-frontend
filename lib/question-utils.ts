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

/** Question type labels – use getQuestionTypeLabel(type) from @/lib/question-types/registry */
export { getQuestionTypeLabel } from '@/lib/question-types/registry';

/**
 * Sort questions by order and normalize order to start from 1
 */
export function sortQuestionsByOrder(questions: ExamQuestion[]): ExamQuestion[] {
  const sorted = [...questions].sort((a, b) => {
    const orderA = a.payload?.order ?? a.id ?? 0;
    const orderB = b.payload?.order ?? b.id ?? 0;
    return orderA - orderB;
  });
  
  // Normalize order to start from 1
  return sorted.map((q, index) => {
    const normalizedOrder = index + 1;
    if (q.payload) {
      q.payload.order = normalizedOrder;
    } else {
      q.payload = { order: normalizedOrder };
    }
    q.order = normalizedOrder;
    return q;
  });
}

/**
 * Ensure question order is valid (starts from 1, sequential)
 */
export function normalizeQuestionOrders(questions: ExamQuestion[]): ExamQuestion[] {
  return sortQuestionsByOrder(questions);
}

