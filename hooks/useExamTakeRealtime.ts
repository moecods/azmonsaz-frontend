'use client';

import { useEffect, useRef } from 'react';
import { getEcho } from '@/lib/echo';
import { REALTIME_EVENTS } from '@/lib/realtime-events';

type ExamTakeRealtimeHandlers = {
  onTimeExpired?: () => void;
  onForceCompleted?: () => void;
  onTeacherMessage?: (payload: { message?: string; exam_title?: string }) => void;
};

export function useExamTakeRealtime(
  examId: number | null,
  userId: number | null | undefined,
  handlers: ExamTakeRealtimeHandlers
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!examId || !userId) return;

    const echo = getEcho();
    if (!echo) return;

    const examChannel = echo.private(`exam.${examId}`);
    const userChannel = echo.private(`user.${userId}`);

    const handleTimeExpired = () => {
      handlersRef.current.onTimeExpired?.();
    };

    const handleStatusChanged = (payload: { status?: string; user_id?: number }) => {
      if (payload.user_id === userId && payload.status === 'completed') {
        handlersRef.current.onForceCompleted?.();
      }
    };

    const handleTeacherMessage = (payload: { message?: string; exam_title?: string; recipient_user_id?: number }) => {
      if (payload.recipient_user_id && payload.recipient_user_id !== userId) return;
      handlersRef.current.onTeacherMessage?.(payload);
    };

    examChannel.listen(REALTIME_EVENTS.examTimeExpired, handleTimeExpired);
    userChannel.listen(REALTIME_EVENTS.examTimeExpired, handleTimeExpired);
    examChannel.listen(REALTIME_EVENTS.participantStatusChanged, handleStatusChanged);
    userChannel.listen(REALTIME_EVENTS.participantStatusChanged, handleStatusChanged);
    examChannel.listen(REALTIME_EVENTS.teacherExamMessage, handleTeacherMessage);
    userChannel.listen(REALTIME_EVENTS.teacherExamMessage, handleTeacherMessage);

    return () => {
      examChannel.stopListening(REALTIME_EVENTS.examTimeExpired);
      userChannel.stopListening(REALTIME_EVENTS.examTimeExpired);
      examChannel.stopListening(REALTIME_EVENTS.participantStatusChanged);
      userChannel.stopListening(REALTIME_EVENTS.participantStatusChanged);
      examChannel.stopListening(REALTIME_EVENTS.teacherExamMessage);
      userChannel.stopListening(REALTIME_EVENTS.teacherExamMessage);
    };
  }, [examId, userId]);
}
