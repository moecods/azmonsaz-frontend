export interface PendingGradingQuestion {
  exam_question_id: number;
  is_pending_grading?: boolean;
  manual_score?: number | null;
}

export interface GradingScrollTarget {
  id: string;
  label: string;
}

export interface PendingGradingStats {
  total: number;
  completed: number;
  outstandingCount: number;
  allDone: boolean;
}

export interface GradingProgressOptions {
  /** Pending questions the teacher has scored in the current session (before/without save). */
  locallyGradedIds?: ReadonlySet<number>;
}

/** Needs manual grading and no saved or in-session score yet. */
export function questionNeedsTeacherGrading(
  question: PendingGradingQuestion,
  options?: GradingProgressOptions
): boolean {
  if (!question.is_pending_grading) {
    return false;
  }
  if (question.manual_score !== null && question.manual_score !== undefined) {
    return false;
  }
  if (options?.locallyGradedIds?.has(question.exam_question_id)) {
    return false;
  }
  return true;
}

export function buildPendingGradingTargets(
  questions: PendingGradingQuestion[],
  options?: GradingProgressOptions
): GradingScrollTarget[] {
  const targets: GradingScrollTarget[] = [];
  questions.forEach((question, index) => {
    if (questionNeedsTeacherGrading(question, options)) {
      targets.push({
        id: `grading-question-${question.exam_question_id}`,
        label: `سوال ${index + 1}`,
      });
    }
  });
  return targets;
}

export function getPendingGradingStats(
  questions: PendingGradingQuestion[],
  options?: GradingProgressOptions
): PendingGradingStats {
  const manualQueue = questions.filter((q) => q.is_pending_grading);
  const outstanding = manualQueue.filter((q) => questionNeedsTeacherGrading(q, options));
  const total = manualQueue.length;
  const outstandingCount = outstanding.length;

  return {
    total,
    completed: total - outstandingCount,
    outstandingCount,
    allDone: total === 0 || outstandingCount === 0,
  };
}

export function gradingQuestionAnchorId(examQuestionId: number): string {
  return `grading-question-${examQuestionId}`;
}
