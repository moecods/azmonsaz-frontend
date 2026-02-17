/**
 * Question type registry - single source for metadata and kind grouping.
 */

import type { QuestionTypeId } from './constants';
import { QUESTION_TYPE_IDS } from './constants';

export type QuestionTypeKind =
  | 'options_single'
  | 'options_multiple'
  | 'options_fixed'
  | 'text'
  | 'ordering'
  | 'matching'
  | 'blanks';

export interface QuestionTypeConfig {
  id: QuestionTypeId;
  labelFa: string;
  kind: QuestionTypeKind;
}

const REGISTRY: Record<QuestionTypeId, QuestionTypeConfig> = {
  multiple_choice: {
    id: 'multiple_choice',
    labelFa: 'چند گزینه‌ای',
    kind: 'options_single',
  },
  true_false: {
    id: 'true_false',
    labelFa: 'صحیح/غلط',
    kind: 'options_fixed',
  },
  multiple_select: {
    id: 'multiple_select',
    labelFa: 'چند گزینه‌ای (چند پاسخ)',
    kind: 'options_multiple',
  },
  essay: {
    id: 'essay',
    labelFa: 'تشریحی',
    kind: 'text',
  },
  short_answer: {
    id: 'short_answer',
    labelFa: 'پاسخ کوتاه',
    kind: 'text',
  },
  fill_in_the_blank: {
    id: 'fill_in_the_blank',
    labelFa: 'جای خالی',
    kind: 'blanks',
  },
  matching: {
    id: 'matching',
    labelFa: 'تطبیقی',
    kind: 'matching',
  },
  ordering: {
    id: 'ordering',
    labelFa: 'ترتیب‌دهی',
    kind: 'ordering',
  },
};

export function getQuestionTypeConfig(type: string): QuestionTypeConfig | undefined {
  if (type in REGISTRY) {
    return REGISTRY[type as QuestionTypeId];
  }
  return undefined;
}

export function getQuestionTypeLabel(type: string): string {
  return getQuestionTypeConfig(type)?.labelFa ?? type;
}

export function getQuestionTypeKind(type: string): QuestionTypeKind | undefined {
  return getQuestionTypeConfig(type)?.kind;
}

export function isOptionsBased(type: string): boolean {
  const kind = getQuestionTypeKind(type);
  return kind === 'options_single' || kind === 'options_multiple' || kind === 'options_fixed';
}

export function isOptionsSingle(type: string): boolean {
  return getQuestionTypeKind(type) === 'options_single';
}

export function isOptionsMultiple(type: string): boolean {
  return getQuestionTypeKind(type) === 'options_multiple';
}

export function isOptionsFixed(type: string): boolean {
  return getQuestionTypeKind(type) === 'options_fixed';
}

export function isTextBased(type: string): boolean {
  return getQuestionTypeKind(type) === 'text';
}

export function isEssay(type: string): boolean {
  return type === 'essay';
}

export function getAllQuestionTypeConfigs(): QuestionTypeConfig[] {
  return QUESTION_TYPE_IDS.map((id) => REGISTRY[id]);
}

export function getSupportedQuestionTypeIds(): readonly QuestionTypeId[] {
  return QUESTION_TYPE_IDS;
}
