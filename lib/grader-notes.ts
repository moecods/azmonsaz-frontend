import type { GraderNotePayload } from '@/services/exams/ExamService';

export function hasGraderNoteContent(note: GraderNotePayload | null | undefined): boolean {
  if (!note) return false;
  return Boolean(note.text?.trim() || note.audio_url || note.audio_media_id);
}

export function isGraderNoteUnseen(note: GraderNotePayload | null | undefined): boolean {
  if (!hasGraderNoteContent(note)) return false;
  return !note?.engagement?.is_seen;
}

export function graderNoteNeedsAcknowledgment(note: GraderNotePayload | null | undefined): boolean {
  if (!hasGraderNoteContent(note)) return false;
  return Boolean(note?.engagement?.requires_acknowledgment && !note?.engagement?.is_acknowledged);
}

export type GraderNoteTargetStatus = 'unseen' | 'needs_ack' | 'complete';

export interface GraderNoteScrollTarget {
  id: string;
  label: string;
  status: GraderNoteTargetStatus;
}

export interface GraderNoteEngagementStats {
  total: number;
  completed: number;
  unseenCount: number;
  pendingAckCount: number;
  outstandingCount: number;
  allComplete: boolean;
}

export function getGraderNoteTargetStatus(
  note: GraderNotePayload | null | undefined
): GraderNoteTargetStatus {
  if (!hasGraderNoteContent(note)) {
    return 'complete';
  }
  if (!note?.engagement?.is_seen) {
    return 'unseen';
  }
  if (graderNoteNeedsAcknowledgment(note)) {
    return 'needs_ack';
  }
  return 'complete';
}

export function isGraderNoteFullyEngaged(note: GraderNotePayload | null | undefined): boolean {
  return getGraderNoteTargetStatus(note) === 'complete';
}

export function getGraderNoteForTargetId(
  targetId: string,
  examNote: GraderNotePayload | null | undefined,
  questions: Array<{ id: number; grader_note?: GraderNotePayload | null }>
): GraderNotePayload | null | undefined {
  if (targetId === 'exam') {
    return examNote;
  }
  const match = /^question-(\d+)$/.exec(targetId);
  if (!match) {
    return null;
  }
  const questionId = Number(match[1]);
  return questions.find((q) => q.id === questionId)?.grader_note;
}

export function buildGraderNoteScrollTargets(
  examNote: GraderNotePayload | null | undefined,
  questions: Array<{ id: number; grader_note?: GraderNotePayload | null }>
): GraderNoteScrollTarget[] {
  const targets: GraderNoteScrollTarget[] = [];

  if (hasGraderNoteContent(examNote)) {
    targets.push({
      id: 'exam',
      label: 'پیام معلم',
      status: getGraderNoteTargetStatus(examNote),
    });
  }

  questions.forEach((question, index) => {
    if (hasGraderNoteContent(question.grader_note)) {
      targets.push({
        id: `question-${question.id}`,
        label: `یادداشت سوال ${index + 1}`,
        status: getGraderNoteTargetStatus(question.grader_note),
      });
    }
  });

  return targets;
}

export function buildOutstandingGraderNoteTargets(
  examNote: GraderNotePayload | null | undefined,
  questions: Array<{ id: number; grader_note?: GraderNotePayload | null }>
): GraderNoteScrollTarget[] {
  return buildGraderNoteScrollTargets(examNote, questions).filter((t) => t.status !== 'complete');
}

export function getGraderNoteEngagementStats(
  examNote: GraderNotePayload | null | undefined,
  questions: Array<{ id: number; grader_note?: GraderNotePayload | null }>
): GraderNoteEngagementStats {
  const targets = buildGraderNoteScrollTargets(examNote, questions);
  const outstanding = targets.filter((t) => t.status !== 'complete');
  const unseenCount = targets.filter((t) => t.status === 'unseen').length;
  const pendingAckCount = targets.filter((t) => t.status === 'needs_ack').length;

  return {
    total: targets.length,
    completed: targets.length - outstanding.length,
    unseenCount,
    pendingAckCount,
    outstandingCount: outstanding.length,
    allComplete: targets.length > 0 && outstanding.length === 0,
  };
}

export function scrollToGraderNoteTarget(
  element: HTMLElement | null | undefined,
  options?: { highlightMs?: number; reserveBottomSpace?: boolean }
): void {
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element.style.scrollMarginTop = '96px';
  element.style.scrollMarginBottom = options?.reserveBottomSpace ? '200px' : '24px';

  const highlightMs = options?.highlightMs ?? 1400;
  element.classList.add('grader-note-scroll-highlight');
  window.setTimeout(() => {
    element.classList.remove('grader-note-scroll-highlight');
  }, highlightMs);
}
