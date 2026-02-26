// Validation schemas using Zod for form validation

import { z } from 'zod';
import { QUESTION_TYPE_IDS } from '@/lib/question-types/constants';
import { getQuestionTypeKind } from '@/lib/question-types/registry';

// Question validation schemas
export const questionOptionSchema = z.object({
  id: z.number().optional(),
  text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean(),
});

const blankSchema = z.object({
  position: z.number(),
  correct_answer: z.string().min(1, 'پاسخ جای خالی الزامی است'),
});

const leftRightItemSchema = z.object({
  text: z.string().min(1, 'متن الزامی است'),
});

const matchSchema = z.object({
  left_index: z.number(),
  right_index: z.number(),
});

const orderingItemSchema = z.object({
  text: z.string().min(1, 'متن مورد الزامی است'),
  order: z.number(),
});

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(QUESTION_TYPE_IDS as unknown as [string, ...string[]]),
  options: z.array(questionOptionSchema).optional(),
  correct_answer: z.union([z.number(), z.array(z.number()), z.string(), z.null()]),
  category_id: z.number().positive('Category is required'),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  blanks: z.array(blankSchema).optional(),
  left_items: z.array(leftRightItemSchema).optional(),
  right_items: z.array(leftRightItemSchema).optional(),
  matches: z.array(matchSchema).optional(),
  items: z.array(orderingItemSchema).optional(),
  correct_order: z.array(z.number()).optional(),
}).superRefine((data, ctx) => {
  const kind = getQuestionTypeKind(data.type);
  const t = data.type;

  // text: essay (correct_answer null) vs short_answer (correct_answer string)
  if (kind === 'text') {
    if (t === 'essay') {
      if (data.correct_answer !== null && data.correct_answer !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['correct_answer'], message: 'برای سوال تشریحی نیازی به پاسخ صحیح نیست' });
      }
      return;
    }
    if (t === 'short_answer') {
      if (typeof data.correct_answer !== 'string' || (data.correct_answer as string).trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['correct_answer'], message: 'پاسخ صحیح را وارد کنید' });
      }
      return;
    }
    return;
  }

  if (kind === 'ordering') {
    const items = data.items ?? [];
    if (items.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['items'], message: 'حداقل ۲ مورد برای ترتیب‌دهی لازم است' });
    }
    const order = data.correct_order ?? [];
    if (order.length !== items.length) {
      ctx.addIssue({ code: 'custom', path: ['correct_order'], message: 'ترتیب صحیح را مشخص کنید' });
    }
    return;
  }

  if (kind === 'matching') {
    const left = data.left_items ?? [];
    const right = data.right_items ?? [];
    if (left.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['left_items'], message: 'حداقل ۲ مورد در ستون چپ لازم است' });
    }
    if (right.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['right_items'], message: 'حداقل ۲ مورد در ستون راست لازم است' });
    }
    const matches = data.matches ?? [];
    if (left.length >= 2 && right.length >= 2 && matches.length !== left.length) {
      ctx.addIssue({ code: 'custom', path: ['matches'], message: 'هر مورد چپ باید با یک مورد راست تطبیق داده شود' });
    }
    return;
  }

  if (kind === 'blanks') {
    const blanks = data.blanks ?? [];
    if (blanks.length < 1) {
      ctx.addIssue({ code: 'custom', path: ['blanks'], message: 'حداقل یک جای خالی لازم است' });
    }
    return;
  }

  // options_single, options_multiple, options_fixed: options 2+ and at least one correct
  if (kind === 'options_single' || kind === 'options_multiple' || kind === 'options_fixed') {
    const options = data.options ?? [];
    if (options.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'حداقل ۲ گزینه لازم است' });
      return;
    }
    const hasCorrect = options.some(opt => opt.is_correct);
    if (!hasCorrect) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'حداقل یک گزینه را به عنوان صحیح انتخاب کنید' });
    }
    const optionsLength = options.length;
    if (typeof data.correct_answer === 'number') {
      if (data.correct_answer < 0 || data.correct_answer >= optionsLength) {
        ctx.addIssue({ code: 'custom', path: ['correct_answer'], message: 'شاخص پاسخ صحیح نامعتبر است' });
      }
    } else if (Array.isArray(data.correct_answer)) {
      if (!data.correct_answer.every(i => i >= 0 && i < optionsLength)) {
        ctx.addIssue({ code: 'custom', path: ['correct_answer'], message: 'شاخص پاسخ صحیح نامعتبر است' });
      }
    }
  }
});

// Exam validation schemas
export const examQuestionSchema = z.object({
  id: z.number().optional(),
  exam_id: z.number().optional(),
  question_id: z.number().optional(),
  custom_text: z.string().optional(),
  custom_options: z.array(questionOptionSchema).optional(),
  custom_correct_answer: z.union([z.number(), z.array(z.number())]).optional(),
  order: z.number().min(0),
});

export const examSchema = z.object({
  title: z.string().min(1, 'Exam title is required'),
  description: z.string().optional(),
  subject: z.string().optional(),
  type: z.enum(['online', 'offline'], {
    errorMap: () => ({ message: 'نوع آزمون باید آنلاین یا آفلاین باشد' })
  }).default('online'),
  questions: z.array(examQuestionSchema).optional(),
  // Meta fields
  duration_minutes: z.number().int().positive('مدت زمان باید عدد مثبت باشد').optional().nullable(),
  passing_score: z.number().int().min(0, 'نمره قبولی باید بین 0 تا 100 باشد').max(100, 'نمره قبولی باید بین 0 تا 100 باشد').optional().nullable(),
  instructions: z.string().max(5000, 'دستورالعمل نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد').optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  // Scheduling fields
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ معتبر نیست (YYYY-MM-DD)').optional().nullable(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'فرمت زمان معتبر نیست (HH:mm)').optional().nullable(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'فرمت زمان معتبر نیست (HH:mm)').optional().nullable(),
}).refine((data) => {
  // If exam_date, start_time, and end_time are provided, validate time order
  if (data.exam_date && data.start_time && data.end_time) {
    const startDateTime = `${data.exam_date}T${data.start_time}:00`;
    const endDateTime = `${data.exam_date}T${data.end_time}:00`;
    return new Date(endDateTime) > new Date(startDateTime);
  }
  return true;
}, {
  message: 'ساعت پایان باید بعد از ساعت شروع باشد',
  path: ['end_time'],
}).refine((data) => {
  // If exam_date, start_time, end_time, and duration_minutes are provided, validate duration
  if (data.exam_date && data.start_time && data.end_time && data.duration_minutes) {
    const startDateTime = `${data.exam_date}T${data.start_time}:00`;
    const endDateTime = `${data.exam_date}T${data.end_time}:00`;
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    
    if (endDate > startDate) {
      const maxDurationMs = endDate.getTime() - startDate.getTime();
      const maxDurationMinutes = Math.floor(maxDurationMs / (1000 * 60));
      return data.duration_minutes != null && data.duration_minutes <= maxDurationMinutes;
    }
  }
  return true;
}, {
  message: 'مدت زمان آزمون نمی‌تواند بیشتر از اختلاف زمان شروع و پایان باشد',
  path: ['duration_minutes'],
});

// Partner validation schemas
export const partnerSchema = z.object({
  name: z.string().min(1, 'Partner name is required').max(255, 'Name must be less than 255 characters'),
  website_url: z.string().url('Valid website URL is required').max(500, 'Website URL must be less than 500 characters').optional().nullable(),
  callback_url: z.string().url('Valid callback URL is required').max(500, 'Callback URL must be less than 500 characters'),
  is_active: z.boolean().optional(),
});

// Phone number regex pattern (reusable)
const phoneNumberRegex = /^(\+98|0)?9\d{9}$/;
const phoneNumberError = 'شماره تلفن معتبر نیست. فرمت صحیح: 09123456789 یا +989123456789';

// Login validation schema
export const loginSchema = z.object({
  phone_number: z.string().min(1, 'شماره تلفن الزامی است').regex(phoneNumberRegex, phoneNumberError),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

// Register validation schema
export const registerSchema = z.object({
  first_name: z.string().min(1, 'نام الزامی است').max(100, 'نام نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  last_name: z.string().min(1, 'نام خانوادگی الزامی است').max(100, 'نام خانوادگی نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  phone_number: z.string().min(1, 'شماره موبایل الزامی است').regex(phoneNumberRegex, phoneNumberError),
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد'),
  password_confirmation: z.string().min(1, 'تایید رمز عبور الزامی است'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'تایید رمز عبور با رمز عبور یکسان نیست',
  path: ['password_confirmation'],
});

// OTP Login Request schema
export const otpLoginRequestSchema = z.object({
  phone_number: z.string().min(1, 'شماره موبایل الزامی است').regex(phoneNumberRegex, phoneNumberError),
});

// OTP Login Verify schema
export const otpLoginVerifySchema = z.object({
  phone_number: z.string().min(1, 'شماره موبایل الزامی است').regex(phoneNumberRegex, phoneNumberError),
  code: z.string().min(1, 'کد یکبار مصرف الزامی است').max(10, 'کد یکبار مصرف معتبر نیست'),
});

// Forgot Password Request schema
export const forgotPasswordSchema = z.object({
  phone_number: z.string().min(1, 'شماره موبایل الزامی است').regex(phoneNumberRegex, phoneNumberError),
});

// Reset Password schema
export const resetPasswordSchema = z.object({
  phone_number: z.string().min(1, 'شماره موبایل الزامی است').regex(phoneNumberRegex, phoneNumberError),
  code: z.string().min(1, 'کد یکبار مصرف الزامی است').max(10, 'کد یکبار مصرف معتبر نیست'),
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد'),
  password_confirmation: z.string().min(1, 'تایید رمز عبور الزامی است'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'تایید رمز عبور با رمز عبور یکسان نیست',
  path: ['password_confirmation'],
});

// User validation schemas
export const userSchema = z.object({
  name: z.string().min(1, 'نام الزامی است').max(255, 'نام نمی‌تواند بیشتر از 255 کاراکتر باشد'),
  phone_number: z.string().min(1, 'شماره تلفن الزامی است').regex(/^(\+98|0)?9\d{9}$/, 'شماره تلفن معتبر نیست. فرمت صحیح: 09123456789 یا +989123456789'),
  email: z.string().email('ایمیل معتبر نیست').max(255, 'ایمیل نمی‌تواند بیشتر از 255 کاراکتر باشد').optional().nullable(),
  password: z
    .string()
    .optional()
    .refine((val) => val === undefined || val === '' || (val && val.length >= 8), 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  role: z.enum(['admin', 'content_manager', 'creator']).optional(),
  roles: z.array(z.enum(['admin', 'content_manager', 'creator'])).optional(),
});

// Question category validation schemas
export const questionCategorySchema = z.object({
  name: z.string().min(1, 'نام دسته‌بندی الزامی است'),
  description: z.string().optional(),
});

// Deep link parameter validation
export const deepLinkParamsSchema = z.object({
  partner_id: z.string().min(1, 'Partner ID is required'),
  callback_url: z.string().url('Valid callback URL is required'),
  exam_id: z.string().optional(),
});

// Type exports for TypeScript
export type QuestionFormData = z.infer<typeof questionSchema>;
export type ExamFormData = z.infer<typeof examSchema>;
export type PartnerFormData = z.infer<typeof partnerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpLoginRequestFormData = z.infer<typeof otpLoginRequestSchema>;
export type OtpLoginVerifyFormData = z.infer<typeof otpLoginVerifySchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type QuestionCategoryFormData = z.infer<typeof questionCategorySchema>;
export type DeepLinkParams = z.infer<typeof deepLinkParamsSchema>;
