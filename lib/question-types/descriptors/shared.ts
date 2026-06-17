import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import {
  correctAnswerIdsFromOptions,
  toStoredOptions,
} from '@/lib/option-ids';

export function baseExamPayload(
  data: QuestionFormData,
  categories: QuestionCategoryRef[]
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    question_text: data.text,
    type: data.type,
    order: 1,
    points: 1,
    difficulty: data.difficulty,
    tags: data.tags ?? [],
  };
  if (data.category_id && categories.length) {
    const cat = categories.find((c) => c.id === data.category_id);
    if (cat) base.category = cat.name;
  }
  const displaySettings = {
    ...((data.display_settings as Record<string, unknown>) ?? {}),
  };
  if (data.matching_mode) {
    base.matching_mode = data.matching_mode;
    displaySettings.matchingMode = data.matching_mode;
  }
  base.display_settings = displaySettings;
  if (data.print_settings && Object.keys(data.print_settings).length > 0) {
    base.print_settings = data.print_settings;
  }
  return base;
}

/** Common bank API fields including display layout settings. */
export function baseBankFields(data: QuestionFormData): Record<string, unknown> {
  return {
    text: data.text,
    type: data.type,
    category_id: data.category_id,
    tags: data.tags ?? [],
    difficulty: data.difficulty,
    display_settings: data.display_settings ?? {},
    ...(data.print_settings && Object.keys(data.print_settings).length > 0
      ? { print_settings: data.print_settings }
      : {}),
  };
}

export function buildOptionTypePayload(
  data: QuestionFormData,
  multiple: boolean
): { options: ReturnType<typeof toStoredOptions>; correct_answer: string | string[] } {
  const opts = data.options ?? [];
  return {
    options: toStoredOptions(opts),
    correct_answer: correctAnswerIdsFromOptions(opts, multiple),
  };
}
