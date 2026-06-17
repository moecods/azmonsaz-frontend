// Core types for the Azmoon-Saz application

import type { QuestionTypeId } from '@/lib/question-types/constants';

export type QuestionType = QuestionTypeId;

export interface UserSubscription {
  id: number;
  plan: string;
  ends_at: string;
}

export interface User {
  id: number;
  name: string;
  phone_number: string;
  email?: string | null;
  avatar_url?: string | null;
  roles: string[];
  permissions: string[];
  is_active: boolean;
  subscription?: UserSubscription | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: number;
  name: string;
  phone_number: string;
  email?: string | null;
  avatar_url?: string | null;
  roles: string[];
  permissions: string[];
  is_active: boolean;
  subscription?: UserSubscription | null;
  created_at?: string;
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
}

export interface OtpLoginRequest {
  phone_number: string;
}

export interface OtpLoginVerify {
  phone_number: string;
  code: string;
}

export interface ForgotPasswordRequest {
  phone_number: string;
}

export interface ResetPasswordRequest {
  phone_number: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface OtpRequestResponse {
  message: string;
  debug_code?: string; // Only in development
}

export interface Partner {
  id: number;
  name: string;
  website_url?: string | null;
  callback_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  api_key?: string; // Only returned on creation
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correct_answer: string | string[] | null;
  category_id: number;
  category?: QuestionCategory;
  tags: string[];
  difficulty: Difficulty;
  display_settings?: Record<string, unknown>;
  print_settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface QuestionCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  type?: 'online' | 'offline';
  partner_id?: number | null;
  partner?: Partner;
  questions: ExamQuestion[];
  status: ExamStatus;
  is_active: boolean;
  pdf_url?: string;
  /** @deprecated Use flat fields (duration_minutes, passing_score, etc.). Kept for backward compat. */
  meta?: ExamMeta;
  duration_minutes?: number | null;
  passing_score?: number | null;
  instructions?: string | null;
  print_settings?: Record<string, unknown> | null;
  tags?: string[] | null;
  points_per_question?: number;
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  grading_mode?: 'numeric_percent' | 'numeric_scale' | 'descriptive' | 'banded';
  grading_config?: Record<string, unknown> | null;
  result_release_after_exam_end?: boolean;
  result_release_after_grading_complete?: boolean;
  result_release_requires_manual?: boolean;
  results_released_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type ExamStatus = 'draft' | 'published';

export interface ExamMeta {
  duration_minutes?: number;
  passing_score?: number;
  instructions?: string;
  tags?: string[];
  // New format
  date?: string;
  start_time?: string;
  end_time?: string;
  // Old format (for backward compatibility)
  start_at?: string;
  end_at?: string;
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question_id?: number; // null for custom questions
  question?: Question; // null for custom questions
  payload?: Record<string, unknown>; // payload from backend
  custom_text?: string; // for custom questions (frontend only)
  custom_options?: QuestionOption[]; // for custom questions (frontend only)
  custom_correct_answer?: string | string[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  subject?: string;
  type?: 'offline' | 'online';
  callback_url?: string;
  partner_id?: number;
  /** Admin only: assign exam ownership to a creator user */
  created_by?: number;
  meta?: ExamMeta;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
}

export interface UpdateExamRequest {
  title?: string;
  description?: string;
  subject?: string;
  type?: 'online' | 'offline';
  questions?: ExamQuestion[];
  meta?: ExamMeta;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  result_release_after_exam_end?: boolean;
  result_release_after_grading_complete?: boolean;
  result_release_requires_manual?: boolean;
  print_settings?: Record<string, unknown> | null;
}

export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correct_answer: string | string[] | null;
  category_id: number;
  tags: string[];
  difficulty: Difficulty;
  display_settings?: QuestionDisplaySettings | Record<string, unknown>;
  print_settings?: Record<string, unknown>;
}

export interface UpdateQuestionRequest {
  text?: string;
  type?: QuestionType;
  options?: QuestionOption[];
  correct_answer?: string | string[] | null;
  category_id?: number;
  tags?: string[];
  difficulty?: Difficulty;
  display_settings?: QuestionDisplaySettings | Record<string, unknown>;
  print_settings?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Deep link parameters
export interface DeepLinkParams {
  partner_id: string;
  callback_url: string;
  exam_id?: string; // for editing existing exam
}

// Form validation schemas will be defined separately
export interface ExamFormData {
  title: string;
  description: string;
  subject: string;
  questions: ExamQuestion[];
}

export interface QuestionFormData {
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correct_answer: string | string[];
  category_id: number;
  tags: string[];
  difficulty: Difficulty;
}
