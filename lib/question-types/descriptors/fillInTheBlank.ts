import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseBankFields, baseExamPayload } from './shared';

export const fillInTheBlankDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    base.blanks = data.blanks ?? [];
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    return {
      ...baseBankFields(data),
      blanks: (data.blanks ?? []).map((b) => ({
        position: b.position,
        correct_answers:
          (b as { correct_answers?: string[] }).correct_answers ??
          ((b as { correct_answer?: string }).correct_answer
            ? [(b as { correct_answer: string }).correct_answer]
            : []),
        grading: (b as { grading?: string }).grading ?? "auto",
      })),
    };
  },
};
