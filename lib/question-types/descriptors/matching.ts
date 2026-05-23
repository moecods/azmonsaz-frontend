import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseBankFields, baseExamPayload } from './shared';

export const matchingDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    base.left_items = data.left_items ?? [];
    base.right_items = data.right_items ?? [];
    base.matches = data.matches ?? [];
    base.matching_mode = data.matching_mode ?? "one_to_one";
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    return {
      ...baseBankFields(data),
      left_items: data.left_items ?? [],
      right_items: data.right_items ?? [],
      matches: data.matches ?? [],
      matching_mode: data.matching_mode ?? "one_to_one",
    };
  },
};
