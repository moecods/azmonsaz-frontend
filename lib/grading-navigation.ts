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

/** Needs manual grading and no saved manual score yet. */
export function questionNeedsTeacherGrading(question: PendingGradingQuestion): boolean {
  if (!question.is_pending_grading) {
    return false;
  }
  return question.manual_score === null || question.manual_score === undefined;
}

export function buildPendingGradingTargets(questions: PendingGradingQuestion[]): GradingScrollTarget[] {
  const targets: GradingScrollTarget[] = [];
  questions.forEach((question, index) => {
    if (questionNeedsTeacherGrading(question)) {
      targets.push({
        id: `grading-question-${question.exam_question_id}`,
        label: `سوال ${index + 1}`,
      });
    }
  });
  return targets;
}

export function getPendingGradingStats(questions: PendingGradingQuestion[]): PendingGradingStats {
  const manualQueue = questions.filter((q) => q.is_pending_grading);
  const outstanding = manualQueue.filter((q) => questionNeedsTeacherGrading(q));
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
