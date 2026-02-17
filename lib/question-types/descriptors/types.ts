/**
 * Descriptor interface for question types: payload building (and optional form/preview).
 */

import type { QuestionFormData } from '@/lib/validation';

export interface QuestionCategoryRef {
  id: number;
  name: string;
}

export interface QuestionTypeDescriptor {
  /** Build exam question payload from form data (for add-to-exam or create-in-exam). */
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown>;
  /** Build question bank payload from form data (for create question in bank). Optional if same as exam. */
  buildBankPayload?(data: QuestionFormData): Record<string, unknown>;
}
