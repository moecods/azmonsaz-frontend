/**
 * Mappers for converting between API Question / exam question payload and form data.
 * Single Responsibility: data transformation only.
 */

import type { Question } from '@/types';
import type { QuestionFormData } from '@/lib/validation';

/**
 * Map exam question payload (from exam_questions.payload) to QuestionFormData for the edit form.
 */
export function payloadToFormData(payload: Record<string, unknown>): QuestionFormData {
  const questionText = (payload.question_text as string) ?? '';
  const qType = (payload.type as string) ?? 'multiple_choice';
  const optionsRaw = payload.options;
  const correctAnswer = payload.correct_answer as number | number[] | string | null | undefined;
  const difficulty = (payload.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium';

  const options: QuestionFormData['options'] = Array.isArray(optionsRaw) && optionsRaw.length > 0
    ? (optionsRaw as string[]).map((opt: string, index: number) => {
        const text = typeof opt === 'string' ? opt : String(opt);
        let isCorrect = false;

        if (qType === 'multiple_select' && Array.isArray(correctAnswer)) {
          isCorrect = correctAnswer.includes(index);
        } else if (qType === 'true_false' || qType === 'multiple_choice') {
          isCorrect = correctAnswer === index || (Array.isArray(correctAnswer) && correctAnswer.includes(index));
        }
        return { text, is_correct: isCorrect };
      })
    : qType === 'true_false'
      ? [
          { text: 'صحیح', is_correct: correctAnswer === 0 },
          { text: 'غلط', is_correct: correctAnswer === 1 },
        ]
      : [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ];

  const items = (payload.items as QuestionFormData['items']) ?? [];
  const correct_order = (payload.correct_order as number[]) ?? [];
  const left_items = (payload.left_items as QuestionFormData['left_items']) ?? [];
  const right_items = (payload.right_items as QuestionFormData['right_items']) ?? [];
  const matches = (payload.matches as QuestionFormData['matches']) ?? [];
  const blanks = (payload.blanks as QuestionFormData['blanks']) ?? [];

  const optionsObj =
    optionsRaw && typeof optionsRaw === 'object' && !Array.isArray(optionsRaw)
      ? (optionsRaw as Record<string, unknown>)
      : null;

  return {
    text: questionText,
    type: qType as QuestionFormData['type'],
    options,
    correct_answer: correctAnswer ?? 0,
    category_id: 0,
    tags: [],
    difficulty,
    items,
    correct_order,
    left_items,
    right_items,
    matches,
    blanks,
    display_settings: (payload.display_settings as QuestionFormData['display_settings']) ?? {},
    matching_mode:
      (payload.matching_mode as QuestionFormData['matching_mode']) ??
      (optionsObj?.matching_mode as QuestionFormData['matching_mode']) ??
      'one_to_one',
  };
}

export function questionToFormData(question: Question): QuestionFormData {
  const q = question as unknown as Record<string, unknown>;
  const questionOptions = question.options || [];
  const correctAnswer = question.correct_answer;
  const qType = question.type;
  const convertedOptions = convertOptions(questionOptions, correctAnswer, qType);

  const categoryId = resolveCategoryId(question, q);
  const blanks = resolveBlanks(question, q, qType);
  const leftItems = resolveLeftItems(question, q, qType);
  const rightItems = resolveRightItems(question, q, qType);
  const matches = resolveMatches(question, q, qType);

  const optsNested =
    q.options && typeof q.options === 'object' && !Array.isArray(q.options)
      ? (q.options as Record<string, unknown>)
      : null;

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
    left_items: leftItems,
    right_items: rightItems,
    blanks,
    matches: matches,
    display_settings: question.display_settings ?? (q.display_settings as QuestionFormData['display_settings']) ?? {},
    matching_mode:
      (q.matching_mode as QuestionFormData['matching_mode']) ??
      (optsNested?.matching_mode as QuestionFormData['matching_mode']) ??
      'one_to_one',
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

function resolveLeftItems(
  question: Question,
  q: Record<string, unknown>,
  qType: string
): QuestionFormData['left_items'] {
  let items = (q.left_items || []) as QuestionFormData['left_items'];

  if (qType !== 'matching' || items.length > 0 || !q.options) {
    return items;
  }

  const opts = q.options as Record<string, unknown> | unknown[];

  if (typeof opts === 'object' && opts !== null && !Array.isArray(opts) && 'left_items' in opts) {
    return (opts as { left_items: QuestionFormData['left_items'] }).left_items;
  }

  return items;
}

function resolveRightItems(
  question: Question,
  q: Record<string, unknown>,
  qType: string
): QuestionFormData['right_items'] {
  let items = (q.right_items || []) as QuestionFormData['right_items'];

  if (qType !== 'matching' || items.length > 0 || !q.options) {
    return items;
  }

  const opts = q.options as Record<string, unknown> | unknown[];

  if (typeof opts === 'object' && opts !== null && !Array.isArray(opts) && 'right_items' in opts) {
    return (opts as { right_items: QuestionFormData['right_items'] }).right_items;
  }

  return items;
}

function resolveMatches(
  question: Question,
  q: Record<string, unknown>,
  qType: string
): QuestionFormData['matches'] {
  let matches = (q.matches || []) as QuestionFormData['matches'];

  if (qType !== 'matching' || matches.length > 0 || !q.correct_answer) {
    return matches;
  }

  const correctAnswer = q.correct_answer;

  if (Array.isArray(correctAnswer)) {
    return correctAnswer as QuestionFormData['matches'];
  }

  return matches;
}
