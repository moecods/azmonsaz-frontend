import { examService, ApiError } from "@/services";
import { buildBankQuestionPayload } from "@/lib/question-utils";
import {
  getDefaultQuestionPoints,
  wouldExceedExamMaxScoreForBatch,
  type ExamWithGrading,
} from "@/lib/exam-points";
import type { ExamQuestion } from "@/types";
import { getErrorMessage } from "@/lib/error-handler";

export interface CommitCartProgress {
  current: number;
  total: number;
}

export interface CommitCartResult {
  successCount: number;
  failedIds: number[];
  errors: string[];
  abortedByMaxScore?: boolean;
  maxScoreMessage?: string;
}

export interface CommitCartOptions {
  examId: number;
  cartIds: number[];
  existingQuestions: ExamQuestion[];
  inExamQuestionIds: ReadonlySet<number>;
  exam: ExamWithGrading | null | undefined;
  onProgress?: (progress: CommitCartProgress) => void;
}

export async function commitExamQuestionCart(
  options: CommitCartOptions
): Promise<CommitCartResult> {
  const { examId, cartIds, existingQuestions, inExamQuestionIds, exam, onProgress } =
    options;

  const toAdd = cartIds.filter((id) => !inExamQuestionIds.has(id));
  const defaultPoints = getDefaultQuestionPoints(exam);
  const startOrder = existingQuestions.length;

  const batchCheck = wouldExceedExamMaxScoreForBatch(
    exam,
    existingQuestions,
    defaultPoints,
    toAdd.length
  );
  if (batchCheck.exceeds) {
    return {
      successCount: 0,
      failedIds: toAdd,
      errors: [],
      abortedByMaxScore: true,
      maxScoreMessage: `افزودن ${toAdd.length.toLocaleString("fa-IR")} سوال با بارم پیش‌فرض (${defaultPoints}) مجاز نیست. مجموع بارم (${batchCheck.projectedTotal}) از حداکثر نمره آزمون (${batchCheck.maxScore}) بیشتر می‌شود. تعداد سوالات سبد را کم کنید یا بارم را در لیست آزمون تنظیم کنید.`,
    };
  }

  let successCount = 0;
  const failedIds: number[] = [];
  const errors: string[] = [];
  let order = startOrder;

  for (let i = 0; i < toAdd.length; i++) {
    const questionId = toAdd[i];
    order += 1;
    onProgress?.({ current: i + 1, total: toAdd.length });

    try {
      const response = await examService.addQuestionToExam(examId, {
        question_id: questionId,
        payload: buildBankQuestionPayload(order, defaultPoints),
      });
      if (!response.success) {
        throw new ApiError(response.message || "Failed to add question");
      }
      successCount += 1;
    } catch (err) {
      failedIds.push(questionId);
      errors.push(getErrorMessage(err, `سوال #${questionId}`));
    }
  }

  return { successCount, failedIds, errors };
}
