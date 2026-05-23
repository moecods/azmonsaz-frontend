import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseBankFields, baseExamPayload } from './shared';

export const shortAnswerDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    const answers = data.correct_answers ?? [];
    base.correct_answer = answers.length > 0 ? answers : data.correct_answer;
    base.correct_answers = answers;
    base.manual_grading = data.manual_grading ?? answers.length === 0;
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    const answers = data.correct_answers ?? [];
    return {
      ...baseBankFields(data),
      correct_answer: answers.length > 0 ? answers : data.correct_answer,
      correct_answers: answers,
      manual_grading: data.manual_grading ?? answers.length === 0,
    };
  },
};
