import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";

export type ParticipantStatusFilter =
  | "all"
  | "registered"
  | "in_progress"
  | "completed"
  | "absent";

export interface ParticipantListStats {
  total: number;
  registered: number;
  inProgress: number;
  completed: number;
  absent: number;
  passed: number;
}

export function computeParticipantListStats(
  participants: UserParticipant[]
): ParticipantListStats {
  let registered = 0;
  let inProgress = 0;
  let completed = 0;
  let absent = 0;
  let passed = 0;

  for (const p of participants) {
    if (p.passed) passed += 1;
    if (p.status === "absent") {
      absent += 1;
      continue;
    }
    if (p.completed_at) {
      completed += 1;
      continue;
    }
    if (p.started_at) {
      inProgress += 1;
      continue;
    }
    registered += 1;
  }

  return {
    total: participants.length,
    registered,
    inProgress,
    completed,
    absent,
    passed,
  };
}

export function countParticipantsByStatus(
  participants: UserParticipant[],
  status: ParticipantStatusFilter
): number {
  return filterParticipantsByStatus(participants, status).length;
}

export function filterParticipantsByStatus(
  participants: UserParticipant[],
  status: ParticipantStatusFilter
): UserParticipant[] {
  if (status === "all") return participants;
  return participants.filter((p) => {
    if (status === "absent") return p.status === "absent";
    if (status === "completed") return Boolean(p.completed_at);
    if (status === "in_progress") return Boolean(p.started_at) && !p.completed_at;
    if (status === "registered") {
      return !p.started_at && p.status !== "absent";
    }
    return true;
  });
}
