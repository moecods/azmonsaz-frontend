/**
 * Hook for question form submission logic.
 * Single Responsibility: build payload and call API.
 */

import { useRouter } from 'next/navigation';
import { getDescriptor } from '@/lib/question-types';
import { useCreateQuestion, useUpdateQuestion, useAddQuestionToExam, useUpdateExamQuestion } from '@/hooks';
import { handleError } from '@/lib/error-handler';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategory } from '@/types';

export interface UseQuestionSubmitOptions {
  examId?: number;
  returnUrl?: string;
  questionId?: number;
  /** When editing an exam question (not bank), pass the exam_question id */
  examQuestionId?: number;
  /** When editing exam question, pass the initial payload to preserve order/points when building new payload */
  examQuestionPayload?: Record<string, unknown>;
  isEditMode: boolean;
  categories: QuestionCategory[];
}

export function useQuestionSubmit({
  examId,
  returnUrl,
  questionId,
  examQuestionId,
  examQuestionPayload,
  isEditMode,
  categories,
}: UseQuestionSubmitOptions) {
  const router = useRouter();
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const addQuestionToExamMutation = useAddQuestionToExam();
  const updateExamQuestionMutation = useUpdateExamQuestion();

  const submit = async (data: QuestionFormData) => {
    try {
      const descriptor = getDescriptor(data.type);

      if (examId && examQuestionId != null && isEditMode) {
        const built = descriptor.buildExamPayload(data, categories) as Record<string, unknown>;
        const payload = {
          ...built,
          order: examQuestionPayload?.order ?? built.order,
          points: examQuestionPayload?.points ?? built.points,
          print_settings:
            (data.print_settings as Record<string, unknown> | undefined) ??
            examQuestionPayload?.print_settings ??
            built.print_settings,
        };
        await updateExamQuestionMutation.mutateAsync({
          examId,
          questionId: examQuestionId,
          data: { payload },
        });
        router.push(`/exams/${examId}/questions`);
        return;
      }

      if (examId && examQuestionId == null) {
        const payload = descriptor.buildExamPayload(data, categories);
        await addQuestionToExamMutation.mutateAsync({ examId, data: { payload } });
        router.push(returnUrl ?? `/exams/${examId}/questions`);
        return;
      }

      const payload = descriptor.buildBankPayload
        ? descriptor.buildBankPayload(data)
        : descriptor.buildExamPayload(data, categories);

      if (isEditMode && questionId) {
        await updateQuestionMutation.mutateAsync({
          id: questionId,
          data: payload as unknown as import('@/types').UpdateQuestionRequest,
        });
        router.push('/questions');
        return;
      }

      await createQuestionMutation.mutateAsync(
        payload as unknown as Parameters<typeof createQuestionMutation.mutateAsync>[0]
      );
      if (returnUrl) router.push(returnUrl);
      else router.push('/questions');
    } catch (error) {
      handleError(error, { context: isEditMode ? 'Edit Question' : 'Create Question' });
    }
  };

  return {
    submit,
    createQuestionMutation,
    updateQuestionMutation,
    addQuestionToExamMutation,
    updateExamQuestionMutation,
  };
}
