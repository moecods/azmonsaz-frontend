/** Supportive, low-stigma copy for student-facing exam results. */

export function getExamOutcomeHeadline(passed: boolean, percentage: number): string {
  if (passed) {
    return percentage >= 90 ? 'عالی بود!' : 'به حد نصاب رسیدید';
  }
  if (percentage >= 50) {
    return 'نزدیک به حد نصاب بودید';
  }
  return 'فرصت تمرین و پیشرفت';
}

export function getExamOutcomeSubline(passed: boolean, passingScorePercent?: number | null): string {
  if (passed) {
    return 'نتیجه شما نشان می‌دهد در این آزمون به معیار قبولی رسیده‌اید.';
  }
  const threshold =
    passingScorePercent != null && passingScorePercent > 0
      ? `حد نصاب این آزمون حدود ${passingScorePercent}٪ است. `
      : '';
  return `${threshold}هر آزمون فرصتی برای یادگیری است؛ با مرور پاسخ‌ها می‌توانید نقاط قوت و زمینه‌های تمرین را ببینید.`;
}

export function getQuestionStatusLabel(
  isPendingGrading: boolean,
  isCorrect: boolean | undefined
): { label: string; chipColor: 'default' | 'success' | 'warning' | 'info' } {
  if (isPendingGrading) {
    return { label: 'در حال بررسی', chipColor: 'info' };
  }
  if (isCorrect) {
    return { label: 'درست', chipColor: 'success' };
  }
  return { label: 'نیاز به مرور', chipColor: 'default' };
}

export function getQuestionCardBorderColor(
  isPendingGrading: boolean,
  isCorrect: boolean | undefined
): string {
  if (isPendingGrading) {
    return 'info.light';
  }
  if (isCorrect) {
    return 'success.light';
  }
  return 'divider';
}

export function getSummaryCircleColors(passed: boolean): {
  bgcolor: string;
  iconColor: string;
} {
  if (passed) {
    return { bgcolor: 'success.light', iconColor: 'success.main' };
  }
  return { bgcolor: 'grey.100', iconColor: 'text.secondary' };
}

/** Labels for answer review (student vs teacher grading UI). */
export type ResultAudience = 'student' | 'grader';

export function participantAnswerLabel(audience: ResultAudience): string {
  return audience === 'grader' ? 'پاسخ دانش‌آموز' : 'پاسخ شما';
}

export function participantAnswerChipLabel(audience: ResultAudience, isCorrect: boolean): string {
  if (audience === 'grader') {
    return isCorrect ? 'پاسخ دانش‌آموز (درست)' : 'پاسخ دانش‌آموز';
  }
  return isCorrect ? 'پاسخ شما (درست)' : 'انتخاب شما';
}
