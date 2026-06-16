export const REALTIME_EVENTS = {
  participantStatusChanged: '.participant.status.changed',
  participantTimingChanged: '.participant.timing.changed',
  examStatusChanged: '.exam.status.changed',
  examTimeExpired: '.exam.time.expired',
  teacherExamMessage: '.teacher.exam.message',
  examResultsReleased: '.exam.results.released',
  participantGradingUpdated: '.participant.grading.updated',
  participantListChanged: '.participant.list.changed',
  participantProgressChanged: '.participant.progress.changed',
  groupMembershipChanged: '.group.membership.changed',
  userPermissionsChanged: '.user.permissions.changed',
} as const;

export type RealtimeToastPayload = {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
};

export type RealtimeToastListener = (payload: RealtimeToastPayload) => void;

const toastListeners = new Set<RealtimeToastListener>();

export function subscribeRealtimeToast(listener: RealtimeToastListener): () => void {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
}

export function emitRealtimeToast(payload: RealtimeToastPayload): void {
  toastListeners.forEach((listener) => listener(payload));
}
