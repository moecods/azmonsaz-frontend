/**
 * Hook for question form submission logic.
 * Single Responsibility: build payload and call API.
 */

import { useRouter } from 'next/navigation';
import { getDescriptor } from '@/lib/question-types';
import { useCreateQuestion, useUpdateQuestion, useAddQuestionToExam } from '@/hooks';
import { handleError } from '@/lib/error-handler';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategory } from '@/types';

export interface UseQuestionSubmitOptions {
  examId?: number;
  returnUrl?: string;
  questionId?: number;
  isEditMode: boolean;
  categories: QuestionCategory[];
}

export function useQuestionSubmit({
  examId,
  returnUrl,
  questionId,
  isEditMode,
  categories,
}: UseQuestionSubmitOptions) {
  const router = useRouter();
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const addQuestionToExamMutation = useAddQuestionToExam();

  const submit = async (data: QuestionFormData) => {
    try {
      const descriptor = getDescriptor(data.type);

      if (examId) {
        const payload = descriptor.buildExamPayload(data, categories);
        await addQuestionToExamMutation.mutateAsync({ examId, data: { payload } });
        router.push(`/exams/${examId}?tab=questions`);
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
  };
}
