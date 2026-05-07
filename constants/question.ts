export const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'چند گزینه‌ای',
  true_false: 'صحیح/غلط',
  multiple_select: 'چند گزینه‌ای (چند پاسخ)',
  essay: 'تشریحی',
  ordering: 'ترتیبی',
  matching: 'تطبیقی',
  fill_in_the_blank: 'جای خالی',
  short_answer: 'پاسخ کوتاه',
};

export const DIFFICULTY_CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  easy: { label: 'آسان', color: 'success' },
  medium: { label: 'متوسط', color: 'warning' },
  hard: { label: 'سخت', color: 'error' },
};