// Core types for the Azmoon-Saz application

export interface User {
  id: number;
  name: string;
  phone_number: string;
  email?: string | null;
  roles: string[];
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'content_manager' | 'creator';

export interface AuthUser {
  id: number;
  name: string;
  phone_number: string;
  email?: string | null;
  roles: string[];
  permissions: string[];
  is_active: boolean;
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
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
  correct_answer: number | number[] | null; // single or multiple correct answers, null for essay
  category_id: number;
  category?: QuestionCategory;
  tags: string[];
  difficulty: Difficulty;
  created_at: string;
  updated_at: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'multiple_select' | 'essay';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id?: number;
  text: string;
  is_correct: boolean;
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
  partner_id?: number | null;
  partner?: Partner;
  questions: ExamQuestion[];
  status: ExamStatus;
  pdf_url?: string;
  meta?: {
    duration_minutes?: number;
    passing_score?: number;
    max_attempts?: number;
    instructions?: string;
    tags?: string[];
    start_at?: string;
    end_at?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export type ExamStatus = 'draft' | 'completed' | 'published';

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question_id?: number; // null for custom questions
  question?: Question; // null for custom questions
  custom_text?: string; // for custom questions
  custom_options?: QuestionOption[]; // for custom questions
  custom_correct_answer?: number | number[]; // for custom questions
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  subject?: string;
  type?: 'offline' | 'online';
  callback_url?: string; // Optional for creator users
  partner_id?: number; // Optional for creator users
  meta?: {
    duration_minutes?: number;
    passing_score?: number;
    max_attempts?: number;
    instructions?: string;
    tags?: string[];
    start_at?: string;
    end_at?: string;
  };
}

export interface UpdateExamRequest {
  title?: string;
  description?: string;
  subject?: string;
  questions?: ExamQuestion[];
  meta?: {
    duration_minutes?: number;
    passing_score?: number;
    max_attempts?: number;
    instructions?: string;
    tags?: string[];
    start_at?: string;
    end_at?: string;
  };
}

export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  options: Omit<QuestionOption, 'id'>[];
  correct_answer: number | number[] | null;
  category_id: number;
  tags: string[];
  difficulty: Difficulty;
}

export interface UpdateQuestionRequest {
  text?: string;
  type?: QuestionType;
  options?: Omit<QuestionOption, 'id'>[];
  correct_answer?: number | number[] | null;
  category_id?: number;
  tags?: string[];
  difficulty?: Difficulty;
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
  correct_answer: number | number[];
  category_id: number;
  tags: string[];
  difficulty: Difficulty;
}
