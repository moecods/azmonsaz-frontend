/**
 * Mappers for converting between API Question / exam question payload and form data.
 * Single Responsibility: data transformation only.
 */

import type { Question } from '@/types';
import type { QuestionFormData } from '@/lib/validation';
import { generateOptionId, mapApiOptionsToForm } from '@/lib/option-ids';

/**
 * Map exam question payload (from exam_questions.payload) to QuestionFormData for the edit form.
 */
export function payloadToFormData(payload: Record<string, unknown>): QuestionFormData {
  const questionText = (payload.question_text as string) ?? '';
  const qType = (payload.type as string) ?? 'multiple_choice';
  const optionsRaw = payload.options;
  const correctAnswer = payload.correct_answer as string | string[] | null | undefined;
  const difficulty = (payload.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium';

  const options: QuestionFormData['options'] =
    Array.isArray(optionsRaw) && optionsRaw.length > 0
      ? mapApiOptionsToForm(optionsRaw, correctAnswer ?? null, qType)
      : qType === 'true_false'
        ? mapApiOptionsToForm([], correctAnswer ?? null, 'true_false')
        : [
            { id: generateOptionId(), text: '', is_correct: false },
            { id: generateOptionId(), text: '', is_correct: false },
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

  const resolvedCorrect =
    correctAnswer ??
    (qType === 'multiple_select'
      ? options.filter((o) => o.is_correct).map((o) => o.id)
      : options.find((o) => o.is_correct)?.id ?? '');

  return {
    text: questionText,
    type: qType as QuestionFormData['type'],
    options,
    correct_answer: resolvedCorrect,
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
  const convertedOptions = mapApiOptionsToForm(
    questionOptions as unknown[],
    correctAnswer,
    qType
  );

  const categoryId = resolveCategoryId(question, q);
  const blanks = resolveBlanks(question, q, qType);
  const items = resolveOrderingItems(q, qType);
  const correct_order = resolveCorrectOrder(q, qType, items);
  const leftItems = resolveLeftItems(question, q, qType);
  const rightItems = resolveRightItems(question, q, qType);
  const matches = resolveMatches(question, q, qType);

  const optsNested =
    q.options && typeof q.options === 'object' && !Array.isArray(q.options)
      ? (q.options as Record<string, unknown>)
      : null;

  const resolvedCorrect =
    correctAnswer ??
    (qType === 'multiple_select'
      ? convertedOptions.filter((o) => o.is_correct).map((o) => o.id)
      : convertedOptions.find((o) => o.is_correct)?.id ?? '');

  return {
    text: question.text,
    type: question.type,
    options: convertedOptions,
    correct_answer: resolvedCorrect,
    category_id: categoryId,
    tags: question.tags || [],
    difficulty: question.difficulty,
    items,
    correct_order,
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
    return ((opts as { blanks: Array<Record<string, unknown>> }).blanks).map((blank) => {
      const answers = (blank.correct_answers as string[] | undefined) ?? [];
      const legacy = blank.correct_answer != null ? String(blank.correct_answer) : "";
      return {
        position: Number(blank.position ?? 0),
        correct_answer: answers[0] ?? legacy,
        correct_answers: answers.length > 0 ? answers : legacy ? [legacy] : [],
        grading: (blank.grading as "auto" | "manual") ?? "auto",
      };
    });
  }

  const ca = q.correct_answer;
  if (Array.isArray(ca) && ca.length > 0 && Array.isArray(ca[0])) {
    return (ca as string[][]).map((answers, position) => ({
      position,
      correct_answers: answers.map(String),
      correct_answer: answers[0] != null ? String(answers[0]) : "",
      grading: "auto" as const,
    }));
  }

  if (question.text && String(question.text).includes('_____')) {
    const count = Math.max(0, String(question.text).split('_____').length - 1);
    return Array.from({ length: count }, (_, i) => ({ position: i, correct_answer: '' }));
  }

  return blanks;
}

function resolveOrderingItems(
  q: Record<string, unknown>,
  qType: string
): QuestionFormData["items"] {
  if (qType !== "ordering") {
    return [];
  }

  if (Array.isArray(q.items) && q.items.length > 0) {
    return q.items as QuestionFormData["items"];
  }

  const opts = q.options;
  if (typeof opts === "object" && opts !== null && !Array.isArray(opts) && "items" in opts) {
    return (opts as { items: QuestionFormData["items"] }).items ?? [];
  }

  return [];
}

function resolveCorrectOrder(
  q: Record<string, unknown>,
  qType: string,
  items: QuestionFormData["items"]
): number[] {
  if (qType !== "ordering") {
    return [];
  }

  if (Array.isArray(q.correct_order) && q.correct_order.length > 0) {
    return q.correct_order as number[];
  }

  const ca = q.correct_answer;
  if (Array.isArray(ca) && ca.length > 0 && ca.every((v) => typeof v === "number")) {
    return ca as number[];
  }

  return items.map((_, i) => i);
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
