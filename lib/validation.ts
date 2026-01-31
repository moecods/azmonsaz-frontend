// Validation schemas using Zod for form validation

import { z } from 'zod';

// Question validation schemas
export const questionOptionSchema = z.object({
  id: z.number().optional(),
  text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'true_false', 'multiple_select', 'essay']),
  options: z.array(questionOptionSchema).optional(),
  correct_answer: z.union([z.number(), z.array(z.number()), z.null()]),
  category_id: z.number().positive('Category is required'),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
}).refine((data) => {
  // For essay type, options and correct_answer are not required
  if (data.type === 'essay') {
    return true;
  }
  // For other types, at least 2 options are required
  if (!data.options || data.options.length < 2) {
    return false;
  }
  return true;
}, {
  message: 'At least 2 options are required for this question type',
  path: ['options'],
}).refine((data) => {
  // For essay type, skip option validation
  if (data.type === 'essay') {
    return true;
  }
  // Validate that at least one option is marked as correct
  if (!data.options || data.options.length === 0) {
    return false;
  }
  const hasCorrectOption = data.options.some(option => option.is_correct);
  return hasCorrectOption;
}, {
  message: 'At least one option must be marked as correct',
  path: ['options'],
}).refine((data) => {
  // For essay type, correct_answer should be null
  if (data.type === 'essay') {
    return data.correct_answer === null;
  }
  // Validate correct_answer matches the options
  if (!data.options || data.options.length === 0) {
    return false;
  }
  const optionsLength = data.options.length;
  if (typeof data.correct_answer === 'number') {
    return data.correct_answer >= 0 && data.correct_answer < optionsLength;
  } else if (Array.isArray(data.correct_answer)) {
    return data.correct_answer.every(index => 
      index >= 0 && index < optionsLength
    );
  }
  return false;
}, {
  message: 'Correct answer index is invalid',
  path: ['correct_answer'],
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
  questions: z.array(examQuestionSchema).min(1, 'At least one question is required'),
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
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد').optional(),
  role: z.enum(['admin', 'content_manager', 'creator']),
});

// Question category validation schemas
export const questionCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
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
