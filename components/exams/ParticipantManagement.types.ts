import React from 'react';

// ═══════════════════════════════════════════════════════════════
// TabPanel Component Types
// ═══════════════════════════════════════════════════════════════

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ═══════════════════════════════════════════════════════════════
// User Related Types
// ═══════════════════════════════════════════════════════════════

export interface ExamUser {
  id: number;
  name: string;
  phone_number: string | null;
  email?: string;
  national_id?: string | null;
}

export interface UserParticipant {
  id: number;
  user: ExamUser | null;
  group: ParticipantGroupRef | null;
  score: number | null;
  total_points: number | null;
  scaled_score?: number | null;
  outcome_label?: string | null;
  passed: boolean;
  status?: string;
  started_at: string | null;
  completed_at: string | null;
  is_pending_finalize?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Group Related Types
// ═══════════════════════════════════════════════════════════════

export interface GroupParticipant {
  id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
  participant: ParticipantResult | null;
}

export interface GroupInfo {
  id: number;
  name: string;
  description?: string;
  avatar_url?: string | null;
  users_count?: number;
  users?: GroupParticipant[];
}

/** Minimal group reference on a participant row */
export interface ParticipantGroupRef {
  id: number;
  name: string;
  avatar_url?: string | null;
}

export interface ParticipantResult {
  id: number;
  score: number | null;
  total_points: number | null;
  passed: boolean;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

// ═══════════════════════════════════════════════════════════════
// Main Component Props
// ═══════════════════════════════════════════════════════════════

export interface ParticipantManagementProps {
  examId: number;
  examTitle?: string;
  participants: UserParticipant[];
  gradingMode?: string;
  groups?: GroupInfo[];
  registrationLink?: string | null;
  examLink?: string | null;
  canManageParticipants?: boolean;
  onSuccess?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// Search Result Types
// ═══════════════════════════════════════════════════════════════

export interface SearchUserResult {
  id: number;
  name: string;
  phone_number: string;
  national_id?: string;
}