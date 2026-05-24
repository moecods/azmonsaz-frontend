/**
 * Exam Service
 * Handles all exam-related API calls
 */

import { ApiClient } from '../api/ApiClient';
import {
  Exam,
  CreateExamRequest,
  UpdateExamRequest,
  ApiResponse,
} from '@/types';

export class ExamService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Create new exam
   */
  async createExam(data: CreateExamRequest): Promise<ApiResponse<Exam>> {
    return this.apiClient.post<Exam>('/exams', data);
  }

  /**
   * Get exam by ID
   */
  async getExam(id: number): Promise<ApiResponse<Exam>> {
    return this.apiClient.get<Exam>(`/exams/${id}`);
  }

  /**
   * Get exam for editing (for creator/admin)
   */
  async getExamForEdit(id: number): Promise<ApiResponse<Exam>> {
    return this.apiClient.get<Exam>(`/exams/${id}/edit-data`);
  }

  /**
   * Get redirect URL for exam print page (offline exams only).
   * Backend returns 302 with Location header to frontend print page.
   */
  async getExamPrintRedirectUrl(examId: number, template: string = 'default'): Promise<string | null> {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = this.apiClient.getToken();
    const url = `${baseURL}/exams/${examId}/download?template=${encodeURIComponent(template)}`;
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    if (response.status === 302) {
      const location = response.headers.get('Location');
      return location;
    }
    if (response.status === 0) {
      throw new Error(
        'اتصال به سرور برقرار نشد. آدرس API (NEXT_PUBLIC_API_URL) و تنظیمات CORS سرور را بررسی کنید.'
      );
    }
    if (!response.ok) {
      let msg = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        msg = (data as { message?: string }).message || msg;
      } catch (_) {
        // ignore
      }
      throw new Error(msg);
    }
    return null;
  }

  /**
   * Update exam
   */
  async updateExam(
    id: number,
    data: UpdateExamRequest
  ): Promise<ApiResponse<Exam>> {
    return this.apiClient.patch<Exam>(`/exams/${id}`, data);
  }

  /**
   * Complete exam (mark as completed)
   */
  async completeExam(
    id: number
  ): Promise<ApiResponse<{ callback_url: string; pdf_url: string }>> {
    return this.apiClient.post<{ callback_url: string; pdf_url: string }>(
      `/exams/${id}/complete`
    );
  }

  /**
   * Publish exam (change status to published)
   */
  async publishExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/publish`
    );
  }

  /**
   * Generate exam link (لینک شرکت در آزمون) - on demand
   */
  async generateExamLink(id: number): Promise<ApiResponse<{ exam_link: string }>> {
    return this.apiClient.post<{ exam_link: string }>(
      `/exams/${id}/generate-exam-link`
    );
  }

  async releaseExamResults(id: number): Promise<ApiResponse<{ results_released_at: string }>> {
    return this.apiClient.post<{ results_released_at: string }>(
      `/exams/${id}/release-results`
    );
  }

  /**
   * Unpublish exam (change status to draft)
   */
  async unpublishExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/unpublish`
    );
  }

  /**
   * Activate exam (set is_active to true)
   */
  async activateExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/activate`
    );
  }

  /**
   * Deactivate exam (set is_active to false)
   */
  async deactivateExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/deactivate`
    );
  }

  /**
   * Add question to exam
   */
  async addQuestionToExam(
    examId: number,
    data: {
      question_id?: number;
      payload?: Record<string, unknown>;
    }
  ): Promise<ApiResponse<unknown>> {
    return this.apiClient.post(`/exams/${examId}/questions`, data);
  }

  /**
   * Update exam question
   */
  async updateExamQuestion(
    examId: number,
    questionId: number,
    data: { payload: Record<string, unknown> }
  ): Promise<ApiResponse<unknown>> {
    return this.apiClient.patch(
      `/exams/${examId}/questions/${questionId}`,
      data
    );
  }

  /**
   * Delete exam question
   */
  async deleteExamQuestion(
    examId: number,
    questionId: number
  ): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/exams/${examId}/questions/${questionId}`);
  }

  /**
   * Get list of exams (filtered by user role)
   */
  async getCreatorDashboard(): Promise<ApiResponse<CreatorDashboardPayload>> {
    return this.apiClient.get('/exams/dashboard');
  }

  async getExams(params?: {
    per_page?: number;
    status?: 'published' | 'draft';
    type?: 'online' | 'offline';
    search?: string;
    page?: number;
  }): Promise<ApiResponse<{
    data: ExamListItem[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());

    const url = `/exams${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(url);
  }

  /**
   * Get exam details with participants (for creator/admin)
   */
  async getExamWithParticipants(id: number): Promise<ApiResponse<ExamWithParticipants>> {
    return this.apiClient.get<ExamWithParticipants>(`/exams/${id}/manage`);
  }

  /**
   * Get available exams for logged-in user (exams they are registered for)
   */
  async getAvailableExams(): Promise<ApiResponse<{ data: AvailableExam[] }>> {
    return this.apiClient.get<{ data: AvailableExam[] }>('/exams/available');
  }

  /**
   * Get exam info by participation link (public access)
   */
  async getExamInfo(publicUuid: string): Promise<ApiResponse<ExamInfo>> {
    return this.apiClient.get<ExamInfo>(`/exams/public/${publicUuid}/info`);
  }

  /**
   * Exam context for take page when opened via numeric id (authenticated).
   */
  async getExamTakeContext(examId: number): Promise<ApiResponse<ExamInfo>> {
    return this.apiClient.get<ExamInfo>(`/exams/${examId}/take-context`);
  }

  /**
   * Register user for exam (numeric id or public uuid).
   */
  async registerForExam(examIdOrPublicUuid: number | string): Promise<ApiResponse<ExamRegistration>> {
    if (typeof examIdOrPublicUuid === 'number') {
      return this.apiClient.post<ExamRegistration>(`/exams/${examIdOrPublicUuid}/register`);
    }
    return this.apiClient.post<ExamRegistration>(`/exams/public/${examIdOrPublicUuid}/register`);
  }

  /**
   * Public registration for exam via link (with auto-registration if user doesn't exist)
   */
  async registerForExamPublic(publicUuid: string, data: PublicExamRegistrationRequest): Promise<ApiResponse<PublicExamRegistrationResponse>> {
    // Use direct fetch for public registration (no auth token)
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const url = `${baseURL}/exams/public/${publicUuid}/register-public`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Start exam (begin taking the exam)
   */
  async startExam(id: number): Promise<ApiResponse<ExamStartResponse>> {
    return this.apiClient.post<ExamStartResponse>(`/exams/${id}/start`);
  }

  /**
   * Get exam questions for participant (without correct answers)
   */
  async getExamQuestions(id: number): Promise<ApiResponse<ExamQuestionsResponse>> {
    return this.apiClient.get<ExamQuestionsResponse>(`/exams/${id}/questions`);
  }

  /**
   * Save answer during exam
   */
  async saveAnswer(id: number, data: { exam_question_id: number; answer: any }): Promise<ApiResponse<{ saved: boolean }>> {
    return this.apiClient.post<{ saved: boolean }>(`/exams/${id}/save-answer`, data);
  }

  /**
   * Submit exam (complete the exam)
   */
  async submitExam(id: number): Promise<ApiResponse<ExamSubmissionResult>> {
    return this.apiClient.post<ExamSubmissionResult>(`/exams/${id}/submit`);
  }

  /**
   * Get user's exam result with detailed answers and ranking
   */
  async getMyExamResult(id: number): Promise<ApiResponse<ExamResultResponse>> {
    return this.apiClient.get<ExamResultResponse>(`/exams/${id}/my-result`);
  }

  async requestAiReview(
    examId: number,
    examQuestionId: number
  ): Promise<ApiResponse<{ explanation: string; feedback?: string }>> {
    return this.apiClient.post<{ explanation: string; feedback?: string }>(
      `/exams/${examId}/my-result/ai-review/${examQuestionId}`
    );
  }

  async markResultViewed(examId: number): Promise<ApiResponse<ExamResultResponse>> {
    return this.apiClient.post<ExamResultResponse>(`/exams/${examId}/my-result/mark-viewed`);
  }

  async markGraderNoteSeen(
    examId: number,
    payload: { scope: 'exam' | 'question'; exam_question_id?: number }
  ): Promise<ApiResponse<ExamResultResponse>> {
    return this.apiClient.post<ExamResultResponse>(
      `/exams/${examId}/my-result/grader-notes/mark-seen`,
      payload
    );
  }

  async acknowledgeGraderNote(
    examId: number,
    payload: { scope: 'exam' | 'question'; exam_question_id?: number }
  ): Promise<ApiResponse<ExamResultResponse>> {
    return this.apiClient.post<ExamResultResponse>(
      `/exams/${examId}/my-result/grader-notes/acknowledge`,
      payload
    );
  }

  /**
   * Search users by phone number or national ID (for adding exam participants).
   * Backend route: GET /users/search
   */
  async searchUsers(_examId: number, params: SearchUsersParams): Promise<ApiResponse<SearchUsersResponse[]>> {
    return this.apiClient.get<SearchUsersResponse[]>('/users/search', { params });
  }

  /**
   * Add participants to exam by phone numbers
   */
  async addParticipantsByPhone(examId: number, data: AddParticipantsByPhoneRequest): Promise<ApiResponse<AddParticipantsResponse>> {
    return this.apiClient.post<AddParticipantsResponse>(`/exams/${examId}/participants/by-phone`, data);
  }

  /**
   * Add participants to exam by national IDs
   */
  async addParticipantsByNationalId(examId: number, data: AddParticipantsByNationalIdRequest): Promise<ApiResponse<AddParticipantsResponse>> {
    return this.apiClient.post<AddParticipantsResponse>(`/exams/${examId}/participants/by-national-id`, data);
  }

  /**
   * Add selected participants to exam
   */
  async addSelectedParticipants(examId: number, data: AddSelectedParticipantsRequest): Promise<ApiResponse<AddParticipantsResponse>> {
    return this.apiClient.post<AddParticipantsResponse>(`/exams/${examId}/participants/selected`, data);
  }

  /**
   * Add groups to exam
   */
  async addGroupsToExam(examId: number, data: AddGroupsToExamRequest): Promise<ApiResponse<AddGroupsToExamResponse>> {
    return this.apiClient.post<AddGroupsToExamResponse>(`/exams/${examId}/groups`, data);
  }

  /**
   * Remove group from exam
   */
  async removeGroupFromExam(
    examId: number,
    groupId: number,
  ): Promise<ApiResponse<{ participants_removed?: number }>> {
    return this.apiClient.delete<{ participants_removed?: number }>(
      `/exams/${examId}/groups/${groupId}`,
    );
  }
}

export interface CreatorDashboardStats {
  live_count: number;
  pending_grading_exams_count: number;
  total_published: number;
  participants_today?: number;
  participants_next_7_days?: number;
}

export interface CreatorDashboardExam {
  id: number;
  title: string;
  type: 'online' | 'offline';
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_at: string | null;
  end_at: string | null;
  status: string;
  is_active: boolean;
  questions_count: number;
  participants_count: number;
  completed_participants_count: number;
  is_live: boolean;
  pending_grading_participants_count: number;
  creator?: { id: number; name: string } | null;
}

export interface CreatorDashboardPayload {
  is_admin_view?: boolean;
  exams: CreatorDashboardExam[];
  focus_exams?: CreatorDashboardExam[];
  stats: CreatorDashboardStats;
}

export interface ExamCapabilities {
  can_manage_schedule: boolean;
  can_manage_content: boolean;
  can_grade: boolean;
  can_manage_participants: boolean;
  can_publish: boolean;
  can_delete: boolean;
}

export interface ExamListItem {
  id: number;
  title: string;
  type: 'online' | 'offline';
  meta?: Record<string, unknown>;
  exam_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  partner_id: number | null;
  partner?: {
    id: number;
    name: string;
  } | null;
  created_by: number | null;
  creator?: {
    id: number;
    name: string;
  } | null;
  status: 'published' | 'draft';
  is_active: boolean;
  published_at: string | null;
  registration_link: string | null;
  exam_link: string | null;
  created_at: string;
  updated_at: string;
  questions_count: number;
  participants_count: number;
  completed_participants_count: number;
}

export interface ExamParticipant {
  id: number;
  user_id: number | null;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    national_id?: string | null;
  } | null;
  group?: {
    id: number;
    name: string;
  } | null;
  score: number | null;
  total_points: number | null;
  passed: boolean;
  status?: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ExamWithParticipants {
  id: number;
  title: string;
  type: 'online' | 'offline';
  meta: Record<string, unknown>;
  partner_id: number | null;
  partner?: {
    id: number;
    name: string;
  } | null;
  created_by: number | null;
  creator?: {
    id: number;
    name: string;
  } | null;
  status: 'published' | 'draft';
  is_active: boolean;
  published_at: string | null;
  registration_link: string | null;
  exam_link: string | null;
  questions_count: number;
  participants_count: number;
  result_release_after_exam_end?: boolean;
  result_release_after_grading_complete?: boolean;
  result_release_requires_manual?: boolean;
  results_released_at?: string | null;
  capabilities?: ExamCapabilities;
  participants: ExamParticipant[];
  groups?: Array<{
    id: number;
    name: string;
    description?: string;
    users_count?: number;
    users?: Array<{
      id: number;
      name: string;
      phone_number: string | null;
      email?: string | null;
      participant?: {
        id: number;
        score: number | null;
        total_points: number | null;
        passed: boolean;
        status: string;
        started_at: string | null;
        completed_at: string | null;
      } | null;
    }>;
  }>;
  created_at: string;
  updated_at: string;
}

export interface AvailableExamResultSummary {
  score: number;
  total_points: number;
  passed: boolean;
  percentage: number;
  outcome_label?: string | null;
  scaled_score?: number | null;
}

export interface AvailableExam {
  id: number;
  title: string;
  type: 'online' | 'offline';
  meta: Record<string, unknown>;
  status: 'registered' | 'started' | 'completed' | 'absent';
  registered_at: string;
  started_at: string | null;
  completed_at: string | null;
  exam_start_at?: string | null;
  exam_end_at?: string | null;
  grading_mode?: string;
  can_view_result?: boolean;
  /** True when result is visible and the student has unseen or unacknowledged grader notes. */
  has_grader_notes?: boolean;
  /** True when result is visible but the student has not opened the result page yet. */
  is_result_unseen?: boolean;
  result_viewed_at?: string | null;
  result_unavailable_reason?: string | null;
  result_message?: string | null;
  result_available_at?: string | null;
  pending_grading_count?: number;
  result?: AvailableExamResultSummary | null;
  creator?: {
    id: number;
    name: string;
  } | null;
}

export interface ExamTakeTimingDescriptor {
  visible: boolean;
  remaining_seconds: number | null;
  kind: string;
  label: string;
  hint?: string | null;
}

export interface ExamTakeTimingPreview {
  visible: boolean;
  label: string;
  hint?: string | null;
  duration_minutes?: number | null;
}

export interface ExamInfo {
  id: number;
  public_uuid?: string;
  title: string;
  type: 'online' | 'offline';
  meta: Record<string, unknown>;
  schedule_type?: string | null;
  duration_minutes?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  available_from?: string | null;
  due_by?: string | null;
  questions_count: number;
  instructions: string | null,
  creator?: {
    id: number;
    name: string;
  } | null;
  is_registered: boolean;
  registration_status: 'registered' | 'started' | 'completed' | 'absent' | null;
  can_start: boolean;
  time_message?: string | null;
  timing_preview?: ExamTakeTimingPreview | null;
}

export interface ExamRegistration {
  id: number;
  exam_id: number;
  status: 'registered';
  registered_at: string;
  user_id?: number;
  token?: string;
  user_created?: boolean;
}

export interface PublicExamRegistrationRequest {
  phone_number: string;
  national_id?: string;
  name?: string;
}

export interface PublicExamRegistrationResponse {
  id: number;
  exam_id: number;
  status: 'registered';
  registered_at: string;
  user_id: number;
  token: string;
  user_created: boolean;
}

export interface ExamStartResponse {
  exam: {
    id: number;
    title: string;
    type: 'online' | 'offline';
    meta: Record<string, unknown>;
  };
  questions: Array<{
    id: number;
    payload: Record<string, unknown>;
  }>;
  started_at: string;
  remaining_seconds?: number | null;
  timing?: ExamTakeTimingDescriptor | null;
  answers?: Record<string, any>;
}

export interface ExamQuestionsResponse {
  questions: Array<{
    id: number;
    payload: Record<string, unknown>;
  }>;
}

export interface ResultVisibility {
  visible: boolean;
  reason?: string | null;
  message?: string | null;
  available_at?: string | null;
  pending_grading_count?: number;
}

export interface ExamSubmissionResult {
  score: number;
  total_points: number;
  passed: boolean;
  completed_at: string;
  outcome_label?: string | null;
  scaled_score?: number | null;
  grading_mode?: string | null;
  result_visibility?: ResultVisibility;
}

export interface ExamResultHidden {
  visible: false;
  reason: string;
  message: string;
  available_at?: string | null;
  pending_grading_count?: number;
  exam: {
    id: number;
    title: string;
    grading_mode?: string;
  };
}

export type ExamResultResponse = ExamResultDetail | ExamResultHidden;

export interface GraderNoteEngagementState {
  is_seen: boolean;
  is_acknowledged: boolean;
  requires_acknowledgment: boolean;
  seen_at?: string | null;
  acknowledged_at?: string | null;
}

export interface GraderNotesSummary {
  total_with_content: number;
  unseen_count: number;
  pending_acknowledgment_count: number;
}

export interface GraderNotePayload {
  text?: string | null;
  audio_media_id?: number | null;
  audio_url?: string | null;
  requires_acknowledgment?: boolean;
  saved_at?: string | null;
  engagement?: GraderNoteEngagementState;
}

export interface ExamResultDetail {
  visible?: true;
  grader_notes?: {
    exam?: GraderNotePayload | null;
    summary?: GraderNotesSummary;
  };
  exam: {
    id: number;
    title: string;
    type: 'online' | 'offline';
    meta?: Record<string, unknown>;
    grading_mode?: string;
    grading_config?: Record<string, unknown> | null;
    passing_score?: number | null;
  };
  result: {
    score: number;
    total_points: number;
    passed: boolean;
    percentage: number;
    outcome_label?: string | null;
    scaled_score?: number | null;
    rank: number;
    total_participants: number;
    started_at: string | null;
    completed_at: string | null;
  };
  questions: Array<{
    id: number;
    question_text: string;
    type: string;
    options?: Array<{ text: string; is_correct?: boolean }>;
    correct_answer: string | string[];
    your_answer: string | string[] | number[] | null;
    is_correct: boolean;
    points_earned: number;
    points_total: number;
    is_pending_grading?: boolean;
    grader_note?: GraderNotePayload | null;
  }>;
}

export interface SearchUsersParams {
  query: string;
  type?: 'phone' | 'national_id' | 'both';
}

export interface SearchUsersResponse {
  id: number;
  name: string;
  phone_number: string;
  national_id?: string;
  email?: string;
}

export interface AddParticipantsByPhoneRequest {
  phone_numbers: string[];
}

export interface AddParticipantsByNationalIdRequest {
  national_ids: string[];
}

export interface AddSelectedParticipantsRequest {
  user_ids: number[];
}

export interface AddParticipantsResponse {
  added: number;
  skipped: number;
  not_found?: string[];
  total_requested: number;
}

export interface AddGroupsToExamRequest {
  group_ids: number[];
}

export interface AddGroupsToExamResponse {
  added: number;
  skipped: number;
  total_users: number;
  groups_added: number;
}

