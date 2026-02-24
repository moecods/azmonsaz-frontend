/**
 * Mappers for converting between API Question and form data.
 * Single Responsibility: data transformation only.
 */

import type { Question } from '@/types';
import type { QuestionFormData } from '@/lib/validation';

export function questionToFormData(question: Question): QuestionFormData {
  const q = question as unknown as Record<string, unknown>;
  const questionOptions = question.options || [];
  const correctAnswer = question.correct_answer;
  const qType = question.type;
  const isStringArray = questionOptions.length > 0 && typeof questionOptions[0] === 'string';

  const convertedOptions = convertOptions(questionOptions, correctAnswer, qType);

  const categoryId = resolveCategoryId(question, q);
  const blanks = resolveBlanks(question, q, qType);

  return {
    text: question.text,
    type: question.type,
    options: convertedOptions,
    correct_answer: question.correct_answer,
    category_id: categoryId,
    tags: question.tags || [],
    difficulty: question.difficulty,
    items: (q.items || []) as QuestionFormData['items'],
    correct_order: (q.correct_order || []) as number[],
    left_items: (q.left_items || []) as QuestionFormData['left_items'],
    right_items: (q.right_items || []) as QuestionFormData['right_items'],
    matches: (q.matches || []) as QuestionFormData['matches'],
    blanks,
  };
}

function convertOptions(
  questionOptions: unknown[],
  correctAnswer: number | number[] | null,
  qType: string
): QuestionFormData['options'] {
  const isStringArray = questionOptions.length > 0 && typeof questionOptions[0] === 'string';

  if (isStringArray) {
    return (questionOptions as string[]).map((opt: string, index: number) => {
      const optionText = typeof opt === 'string' ? opt : String(opt);
      let isCorrect = false;
      if (qType === 'multiple_select') {
        isCorrect = Array.isArray(correctAnswer) && correctAnswer.includes(index);
      } else if (qType === 'true_false' || qType === 'multiple_choice') {
        isCorrect = correctAnswer === index || (Array.isArray(correctAnswer) && correctAnswer.includes(index));
      }
      return { text: optionText, is_correct: isCorrect };
    });
  }

  if (questionOptions.length > 0) {
    return questionOptions as Array<{ text: string; is_correct: boolean }>;
  }

  if (qType === 'true_false') {
    return [
      { text: 'درست', is_correct: correctAnswer === 0 },
      { text: 'نادرست', is_correct: correctAnswer === 1 },
    ];
  }

  return [
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ];
}

function resolveCategoryId(question: Question, q: Record<string, unknown>): number {
  let categoryId = Number(q.category_id) || 0;
  if (categoryId <= 0 && question.category) {
    categoryId = (question.category as { id?: number }).id ?? 0;
  }
  return categoryId;
}

function resolveBlanks(
  question: Question,
  q: Record<string, unknown>,
  qType: string
): { position: number; correct_answer: string }[] {
  let blanks = (q.blanks || []) as { position: number; correct_answer: string }[];

  if (qType !== 'fill_in_the_blank' || blanks.length > 0 || !q.options) {
    return blanks;
  }

  const opts = q.options as Record<string, unknown> | unknown[];

  if (Array.isArray(opts) && opts.length > 0 && typeof opts[0] === 'object' && opts[0] !== null && 'correct_answer' in (opts[0] as object)) {
    return opts as { position: number; correct_answer: string }[];
  }

  if (typeof opts === 'object' && opts !== null && 'blanks' in opts && Array.isArray((opts as { blanks: unknown }).blanks)) {
    return (opts as { blanks: { position: number; correct_answer: string }[] }).blanks;
  }

  if (question.text && String(question.text).includes('_____')) {
    const count = Math.max(0, String(question.text).split('_____').length - 1);
    return Array.from({ length: count }, (_, i) => ({ position: i, correct_answer: '' }));
  }

  return blanks;
}
