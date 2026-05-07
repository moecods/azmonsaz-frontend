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
  group: GroupInfo | null;
  score: number | null;
  total_points: number | null;
  passed: boolean;
  status?: string;
  started_at: string | null;
  completed_at: string | null;
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
  users_count?: number;
  users?: GroupParticipant[];
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
  participants: UserParticipant[];
  groups?: GroupInfo[];
  registrationLink?: string | null;
  examLink?: string | null;
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