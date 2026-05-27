import { ApiClient } from "../api/ApiClient";
import type { ApiResponse } from "@/types";

export interface ExamReportSummary {
  exam_id: number;
  total_participants: number;
  registered_count: number;
  started_count: number;
  completed_count: number;
  absent_count: number;
  in_progress_count: number;
  passed_count: number;
  average_score: number | null;
  total_questions: number;
  is_live: boolean;
  window_end_at: string | null;
}

export interface ExamLiveParticipantRow {
  participant_id: number;
  user_id: number;
  user_name: string | null;
  phone_number: string | null;
  status: string;
  answered_count: number;
  total_questions: number;
  progress_percent: number;
  current_question: {
    exam_question_id: number;
    order: number | null;
    title: string;
  } | null;
  last_activity_at: string | null;
  started_at: string | null;
  remaining_seconds: number | null;
}

export interface ExamLiveReport {
  exam_id: number;
  total_questions: number;
  participants: ExamLiveParticipantRow[];
}

export interface ExamQuestionReportRow {
  exam_question_id: number;
  order: number;
  title: string;
  type: string | null;
  points: number | null;
  answered_count: number;
  total_participants: number;
}

export interface ExamQuestionsReport {
  exam_id: number;
  questions: ExamQuestionReportRow[];
  completed_participants: number;
}

export class ExamReportService {
  constructor(private apiClient: ApiClient) {}

  getSummary(examId: number): Promise<ApiResponse<ExamReportSummary>> {
    return this.apiClient.get<ExamReportSummary>(`/exams/${examId}/reports/summary`);
  }

  getLive(examId: number): Promise<ApiResponse<ExamLiveReport>> {
    return this.apiClient.get<ExamLiveReport>(`/exams/${examId}/reports/live`);
  }

  getQuestions(examId: number): Promise<ApiResponse<ExamQuestionsReport>> {
    return this.apiClient.get<ExamQuestionsReport>(`/exams/${examId}/reports/questions`);
  }
}
