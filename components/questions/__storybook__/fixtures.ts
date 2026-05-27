import type { Question } from '@/types';

const baseCategory = {
  id: 1,
  name: 'ریاضیات',
  description: 'مفاهیم ریاضی',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const ts = '2024-06-01T00:00:00Z';

/** چندگزینه‌ای — پایه */
export const mockMultipleChoice: Question = {
  id: 101,
  text: 'حاصل <strong>۲ + ۲</strong> چیست؟',
  type: 'multiple_choice',
  options: [
    { id: 'opt-a', text: '۳', is_correct: false },
    { id: 'opt-b', text: '۴', is_correct: true },
    { id: 'opt-c', text: '۵', is_correct: false },
  ],
  correct_answer: 'opt-b',
  category_id: 1,
  category: baseCategory,
  tags: ['پایه', 'حساب'],
  difficulty: 'easy',
  created_at: ts,
  updated_at: ts,
};

/** چندگزینه‌ای — متن HTML */
export const mockMultipleChoiceHtml: Question = {
  ...mockMultipleChoice,
  id: 102,
  text: '<p>مساحت مربعی با ضلع <span data-type="math" data-latex="a">a</span> برابر است با:</p>',
};

/** چند انتخابی */
export const mockMultipleSelect: Question = {
  id: 103,
  text: 'کدام موارد زبان برنامه‌نویسی هستند؟',
  type: 'multiple_select',
  options: [
    { id: 'ms-1', text: 'JavaScript', is_correct: true },
    { id: 'ms-2', text: 'HTML', is_correct: false },
    { id: 'ms-3', text: 'Python', is_correct: true },
    { id: 'ms-4', text: 'CSS', is_correct: false },
  ],
  correct_answer: ['ms-1', 'ms-3'],
  category_id: 1,
  category: baseCategory,
  tags: ['فناوری'],
  difficulty: 'medium',
  created_at: ts,
  updated_at: ts,
};

/** درست/غلط */
export const mockTrueFalse: Question = {
  id: 104,
  text: 'نور با سرعت ثابت در خلأ حرکت می‌کند.',
  type: 'true_false',
  options: [
    { id: 'tf-true', text: 'درست', is_correct: true },
    { id: 'tf-false', text: 'غلط', is_correct: false },
  ],
  correct_answer: 'tf-true',
  category_id: 1,
  category: baseCategory,
  difficulty: 'easy',
  tags: ['فیزیک'],
  created_at: ts,
  updated_at: ts,
};

/** تشریحی */
export const mockEssay: Question = {
  id: 105,
  text: 'نقش آموزش در توسعه پایدار را توضیح دهید.',
  type: 'essay',
  options: [],
  correct_answer: '',
  category_id: 1,
  category: baseCategory,
  difficulty: 'hard',
  tags: ['تشریحی'],
  created_at: ts,
  updated_at: ts,
};

/** پاسخ کوتاه */
export const mockShortAnswer: Question = {
  id: 106,
  text: 'پایتخت ایران چیست؟',
  type: 'short_answer',
  options: [],
  correct_answer: 'تهران',
  category_id: 1,
  category: baseCategory,
  difficulty: 'easy',
  tags: ['جغرافیا'],
  created_at: ts,
  updated_at: ts,
};

/** جای خالی */
export const mockFillBlank: Question = {
  id: 107,
  text: 'خورشید یک {{blank1}} است که در مرکز منظومه شمسی قرار دارد.',
  type: 'fill_in_the_blank',
  options: [],
  correct_answer: { blank1: 'ستاره' },
  blanks: [{ id: 'blank1', label: 'جای خالی ۱' }],
  category_id: 1,
  category: baseCategory,
  difficulty: 'medium',
  tags: [],
  created_at: ts,
  updated_at: ts,
};

/** تطبیق */
export const mockMatching: Question = {
  id: 108,
  text: 'هر کشور را با پایتختش تطبیق دهید.',
  type: 'matching',
  options: [],
  left_items: [
    { id: 'l1', text: 'ایران' },
    { id: 'l2', text: 'فرانسه' },
  ],
  right_items: [
    { id: 'r1', text: 'تهران' },
    { id: 'r2', text: 'پاریس' },
  ],
  matches: [
    { left_id: 'l1', right_id: 'r1' },
    { left_id: 'l2', right_id: 'r2' },
  ],
  correct_answer: [
    { left_id: 'l1', right_id: 'r1' },
    { left_id: 'l2', right_id: 'r2' },
  ],
  category_id: 1,
  category: baseCategory,
  difficulty: 'medium',
  tags: ['تطبیق'],
  created_at: ts,
  updated_at: ts,
};

/** مرتب‌سازی */
export const mockOrdering: Question = {
  id: 109,
  text: 'مراحل آب شدن یخ را به ترتیب مرتب کنید.',
  type: 'ordering',
  options: [],
  items: [
    { id: 'o1', text: 'گرما به یخ داده می‌شود' },
    { id: 'o2', text: 'دمای یخ به صفر درجه می‌رسد' },
    { id: 'o3', text: 'یخ به آب تبدیل می‌شود' },
  ],
  correct_answer: ['o1', 'o2', 'o3'],
  category_id: 1,
  category: baseCategory,
  difficulty: 'medium',
  tags: ['علوم'],
  created_at: ts,
  updated_at: ts,
};

export const mockQuestionsByType: Question[] = [
  mockMultipleChoice,
  mockMultipleSelect,
  mockTrueFalse,
  mockEssay,
  mockShortAnswer,
  mockFillBlank,
  mockMatching,
  mockOrdering,
];

/** HTML نمونه برای RichTextRenderer / RichLabel */
export const mockRichHtml = {
  plain: 'این یک متن ساده فارسی است.',
  formatted:
    '<p><strong>قوانین آزمون:</strong></p><ul><li>زمان: ۹۰ دقیقه</li><li>بدون ماشین‌حساب</li></ul>',
  code: '<pre><code class="language-javascript">const x = 2 + 2;</code></pre>',
  math: '<p>فرمول مساحت: <span class="katex">A = \\pi r^2</span></p>',
};
