"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Alert, Button, Box, Stack } from '@mui/material';
import { useToast } from '@/hooks/useToast';
import { useStartExam, useSaveAnswer, useSubmitExam, useAutoCompleteExam, useExamInfo } from '@/hooks/useExams';
import { useExamTakeRealtime } from '@/hooks/useExamTakeRealtime';
import { useMe } from '@/hooks/useAuth';
import { TakeExamProvider, useTakeExamContext } from '@/hooks/exams/useTakeExam';
import {
  TakeExamShell,
  TakeExamGate,
  TakeExamLobby,
  TakeExamHeader,
  TakeExamNavigator,
  TakeExamQuestionCard,
  TakeExamFooter,
  TakeExamSubmitDialog,
  TakeExamSuccess,
  TakeExamLoading,
  TakeExamTimeExpiredDialog,
  isQuestionAnswered,
} from '@/components/exams/take';
import type { ExamTakeTimingDescriptor } from '@/lib/exam-take-timing';
import { resolveTakeExamTiming } from '@/lib/exam-take-timing';
import { useTakeExamTimer } from '@/hooks/exams/useTakeExamTimer';
import type { ExamTakeTimingDescriptor as ApiExamTakeTiming } from '@/services/exams/ExamService';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { parseExamRouteRef } from '@/lib/exam-route';

interface Question {
  id: number;
  payload: {
    question_text: string;
    type: string;
    options?: string[]; // Options are now string array, not object array
    correct_answer?: string | string[];
    order: number;
    points?: number;
  };
}

export default function TakeExamPage() {
  const params = useParams();
  const { numericId, publicUuid } = parseExamRouteRef(params?.uuid as string);
  const examRef = numericId ?? publicUuid;
  const needsIdFromApi = !numericId && !!publicUuid;
  const { data: examInfo, isLoading, error } = useExamInfo(needsIdFromApi ? publicUuid : null);
  const examId = numericId ?? examInfo?.id ?? null;
  const resolvedPublicUuid = publicUuid ?? examInfo?.public_uuid ?? null;

  if (needsIdFromApi && isLoading) {
    return (
      <TakeExamShell maxWidth="md">
        <TakeExamLoading message="در حال بارگذاری اطلاعات آزمون..." />
      </TakeExamShell>
    );
  }

  if (error || !examId) {
    return (
      <TakeExamShell maxWidth="md">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error instanceof Error ? error.message : 'آزمون یافت نشد.'}
        </Alert>
      </TakeExamShell>
    );
  }

  return (
    <TakeExamProvider examId={examId}>
      <TakeExamPageContent
        examId={examId}
        publicUuid={resolvedPublicUuid}
        examRef={examRef}
      />
    </TakeExamProvider>
  );
}

function TakeExamPageContent({
  examId,
  publicUuid,
  examRef,
}: {
  examId: number | null;
  publicUuid: string | null;
  examRef: string | number | null;
}) {
  const router = useRouter();
  const {
    questions,
    setQuestions,
    answers,
    setAnswer,
    setAnswersMap,
    currentIndex,
    currentQuestion,
    goToIndex,
    goNext,
    goPrevious,
  } = useTakeExamContext();
  const [examStarted, setExamStarted] = useState(false);
  const [examTiming, setExamTiming] = useState<ExamTakeTimingDescriptor>({
    visible: false,
    remaining_seconds: null,
    kind: 'none',
    label: 'زمان باقی‌مانده',
    hint: null,
  });
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeExpiredDialog, setShowTimeExpiredDialog] = useState(false);
  const [examLocked, setExamLocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const toast = useToast();
  const hasStartedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<{ questionId: number; answer: any } | null>(null);

  const SAVE_DEBOUNCE_MS = 500;

  const startExamMutation = useStartExam();
  const saveAnswerMutation = useSaveAnswer();
  const submitExamMutation = useSubmitExam();
  const autoCompleteMutation = useAutoCompleteExam();
  const { data: examInfo, isLoading: isLoadingExamInfo, error: examInfoError } = useExamInfo(examRef);
  const { data: currentUser } = useMe();
  
  // Get participant status
  const participantStatus = examInfo?.registration_status;

  useExamTakeRealtime(examId, currentUser?.id, {
    onTimeExpired: () => {
      setExamTiming((prev) => ({
        ...prev,
        visible: true,
        remaining_seconds: 0,
      }));
    },
    onForceCompleted: () => {
      if (!submitted && examId) {
        router.push(`/exams/${examId}/result`);
      }
    },
    onTimingChanged: (payload) => {
      if (payload.remaining_seconds != null) {
        setExamTiming((prev) => ({
          ...prev,
          visible: true,
          remaining_seconds: payload.remaining_seconds,
        }));
      }
    },
    onTeacherMessage: (payload) => {
      toast.warning(payload.message ?? 'اعلان جدید از معلم');
    },
  });

  const canStartFromApi = examInfo?.can_start ?? false;

  // Helper to map API questions to our format
  const mapApiQuestionsToState = useCallback((apiQuestions: Array<{ id: number; payload: Record<string, unknown> }>): Question[] => {
    const mapped = apiQuestions.map((q, index) => {
      const payload = (q.payload || {}) as Question['payload'];
      if (!payload.order) payload.order = index + 1;
      return { id: q.id, payload };
    });
    mapped.sort((a, b) => (a.payload?.order ?? a.id ?? 0) - (b.payload?.order ?? b.id ?? 0));
    mapped.forEach((q, i) => { if (q.payload) q.payload.order = i + 1; });
    return mapped;
  }, []);

  const applyStartExamResponse = useCallback((data: {
    questions?: Array<{ id: number; payload: Record<string, unknown> }>;
    remaining_seconds?: number | null;
    timing?: ApiExamTakeTiming | null;
    answers?: Record<number, unknown>;
  }) => {
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      setQuestions(mapApiQuestionsToState(data.questions));
    }
    if (data.answers && typeof data.answers === 'object') {
      setAnswersMap(data.answers as Record<number, unknown>);
    }

    const resolved = resolveTakeExamTiming(
      {
        timing: data.timing ?? undefined,
        remaining_seconds: data.remaining_seconds,
        schedule_type: examInfo?.schedule_type,
        duration_minutes: examInfo?.duration_minutes,
        start_at: examInfo?.start_at,
        end_at: examInfo?.end_at,
        due_by: examInfo?.due_by,
      },
      true
    );
    setExamTiming(resolved);
    setExamStarted(true);
  }, [mapApiQuestionsToState, examInfo, setQuestions, setAnswersMap]);

  const handleStartExam = useCallback(async () => {
    if (!examId) {
      return;
    }
    
    if (examStarted) {
      return;
    }
    
    if (startExamMutation.isPending) {
      return;
    }
    
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    try {
      // Call startExam API - returns questions, answers, remaining_seconds in one response
      const data = await startExamMutation.mutateAsync(examId);
      applyStartExamResponse(data as Parameters<typeof applyStartExamResponse>[0]);
    } catch (error) {
      hasStartedRef.current = false; // Reset on error so user can retry
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'خطا در شروع آزمون';
      toast.error(errorMessage);
    }
  }, [examId, examStarted, startExamMutation.isPending, startExamMutation.mutateAsync, applyStartExamResponse, toast]);

  // When resuming (status 'started'), call startExam to load questions + answers + remaining_seconds
  const hasLoadedResumeRef = useRef(false);
  useEffect(() => {
    hasStartedRef.current = false;
    hasLoadedResumeRef.current = false;
  }, [examId]);

  useEffect(() => {
    if (
      participantStatus === 'started' &&
      examId &&
      !examStarted &&
      canAccessQuestions &&
      !hasLoadedResumeRef.current &&
      !startExamMutation.isPending
    ) {
      hasLoadedResumeRef.current = true;
      startExamMutation
        .mutateAsync(examId)
        .then((data) => {
          applyStartExamResponse(data as Parameters<typeof applyStartExamResponse>[0]);
        })
        .catch(() => {
          hasLoadedResumeRef.current = false;
        });
    }
  }, [participantStatus, examId, examStarted, canAccessQuestions, startExamMutation.mutateAsync, applyStartExamResponse]);

  // Show error toast when mutation fails
  useEffect(() => {
    if (startExamMutation.isError && startExamMutation.error) {
      const errorMessage = startExamMutation.error instanceof Error 
        ? startExamMutation.error.message 
        : 'خطا در شروع آزمون';
      toast.error(errorMessage);
    }
  }, [startExamMutation.isError, startExamMutation.error, toast]);

  const flushPendingSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const p = pendingSaveRef.current;
    if (p && examId) {
      pendingSaveRef.current = null;
      saveAnswerMutation.mutate({
        examId,
        data: { exam_question_id: p.questionId, answer: p.answer },
      });
    }
  }, [examId, saveAnswerMutation]);

  const handleSubmitClick = useCallback(() => {
    if (!examId || submitted) return;
    setShowSubmitDialog(true);
  }, [examId, submitted]);

  const handleSubmitConfirm = useCallback(async () => {
    if (!examId || submitted) return;

    setShowSubmitDialog(false);
    flushPendingSave();
    try {
      const result = await submitExamMutation.mutateAsync(examId);
      setResult(result);
      setSubmitted(true);
    } catch (error) {
      // Error handled by mutation
    }
  }, [examId, submitted, submitExamMutation, flushPendingSave]);

  const handleAutoComplete = useCallback(async () => {
    if (!examId || submitted || autoCompleteMutation.isPending) return;

    setShowTimeExpiredDialog(true);
    setExamLocked(true);
    flushPendingSave();

    try {
      const autoResult = await autoCompleteMutation.mutateAsync(examId);
      setResult(autoResult);
      setSubmitted(true);
      setShowTimeExpiredDialog(false);
    } catch (error) {
      setShowTimeExpiredDialog(false);
      toast.warning(
        error instanceof Error
          ? error.message
          : 'ثبت خودکار ناموفق بود. نتیجه به‌زودی ثبت می‌شود.'
      );
    }
  }, [examId, submitted, autoCompleteMutation, flushPendingSave, toast]);

  const handleTimerWarning = useCallback((secondsLeft: number) => {
    const minutes = Math.ceil(secondsLeft / 60);
    toast.warning(
      `${minutes.toLocaleString('fa-IR')} دقیقه تا پایان زمان آزمون باقی مانده است.`
    );
  }, [toast]);

  const takeTimer = useTakeExamTimer({
    timing: examTiming,
    onExpire: handleAutoComplete,
    onWarning: handleTimerWarning,
    enabled: examStarted && !submitted && !examLocked,
  });

  useEffect(() => () => flushPendingSave(), [flushPendingSave]);

  const handleAnswerChange = useCallback((questionId: number, answer: any) => {
    if (examLocked) return;

    setAnswer(questionId, answer);

    if (!examId) return;
    pendingSaveRef.current = { questionId, answer };
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      const p = pendingSaveRef.current;
      if (p) {
        pendingSaveRef.current = null;
        saveAnswerMutation.mutate({
          examId,
          data: { exam_question_id: p.questionId, answer: p.answer },
        });
      }
    }, SAVE_DEBOUNCE_MS);
  }, [examId, saveAnswerMutation, setAnswer, examLocked]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      flushPendingSave();
      goNext();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      flushPendingSave();
      goPrevious();
    }
  };


  const answeredCount = useMemo(
    () => questions.filter((q) => isQuestionAnswered(answers[q.id])).length,
    [questions, answers]
  );
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  const handleGoToQuestion = useCallback(
    (index: number) => {
      flushPendingSave();
      goToIndex(index);
    },
    [flushPendingSave, goToIndex]
  );

  // Show start button if user is registered but hasn't started yet
  const isRegistered = examInfo?.is_registered;
  const shouldShowStartButton = isRegistered && (participantStatus === 'registered' || participantStatus === null);

  const durationMinutes =
    (examInfo as { duration_minutes?: number } | undefined)?.duration_minutes ??
    (examInfo?.meta as { duration_minutes?: number } | undefined)?.duration_minutes ??
    null;

  if (isLoadingExamInfo) {
    return (
      <TakeExamShell>
        <TakeExamLoading message="در حال آماده‌سازی محیط آزمون..." />
      </TakeExamShell>
    );
  }

  if (examInfoError || (examId && !examInfo)) {
    return (
      <TakeExamShell maxWidth="md">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {examInfoError instanceof Error
            ? examInfoError.message
            : 'بارگذاری اطلاعات آزمون ناموفق بود.'}
          {examInfoError && ' ممکن است آزمون منتشر نشده باشد.'}
        </Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => router.push('/exams/available')}>
          بازگشت به لیست آزمون‌ها
        </Button>
      </TakeExamShell>
    );
  }

  if (!examInfo?.is_registered && !examStarted) {
    return (
      <TakeExamShell maxWidth="sm">
        <TakeExamGate
          title={examInfo?.title || 'آزمون'}
          icon={<HowToRegOutlinedIcon sx={{ fontSize: 36 }} />}
          actions={
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                if (publicUuid) router.push(`/exams/participate/${publicUuid}`);
                else if (examId) router.push(`/exams/take/${examId}`);
              }}
            >
              {publicUuid ? 'ثبت‌نام در آزمون' : 'تلاش مجدد'}
            </Button>
          }
        >
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            برای شرکت در آزمون ابتدا باید ثبت‌نام کنید.
          </Alert>
        </TakeExamGate>
      </TakeExamShell>
    );
  }

  if (participantStatus === 'absent') {
    return (
      <TakeExamShell maxWidth="sm">
        <TakeExamGate
          title={examInfo?.title || 'آزمون'}
          icon={<EventBusyOutlinedIcon sx={{ fontSize: 36 }} />}
          actions={
            <Button variant="outlined" fullWidth onClick={() => router.push('/exams/available')}>
              بازگشت به آزمون‌های من
            </Button>
          }
        >
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            شما ثبت‌نام کرده بودید اما تا پایان زمان آزمون، آن را شروع نکردید.
          </Alert>
        </TakeExamGate>
      </TakeExamShell>
    );
  }

  if (participantStatus === 'completed' && examId) {
    router.replace(`/exams/${examId}/result`);
    return (
      <TakeExamShell>
        <TakeExamLoading message="در حال انتقال به کارنامه..." />
      </TakeExamShell>
    );
  }

  if (shouldShowStartButton && !examStarted && !canStartFromApi && examInfo?.time_message) {
    return (
      <TakeExamShell maxWidth="sm">
        <TakeExamGate
          title={examInfo?.title || 'آزمون'}
          icon={<ScheduleOutlinedIcon sx={{ fontSize: 36 }} />}
          actions={
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                if (publicUuid) router.push(`/exams/participate/${publicUuid}`);
                else router.push('/exams/available');
              }}
            >
              {publicUuid ? 'بازگشت' : 'آزمون‌های من'}
            </Button>
          }
        >
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            {examInfo.time_message}
          </Alert>
        </TakeExamGate>
      </TakeExamShell>
    );
  }

  if (shouldShowStartButton && !examStarted) {
    return (
      <TakeExamShell maxWidth="md">
        <TakeExamLobby
          title={examInfo?.title || 'آزمون'}
          questionsCount={examInfo?.questions_count}
          durationMinutes={durationMinutes}
          instructions={examInfo?.instructions}
          timeMessage={examInfo?.time_message}
          timingPreview={examInfo?.timing_preview}
          isStarting={startExamMutation.isPending}
          canStart={canStartFromApi}
          errorMessage={
            startExamMutation.isError && startExamMutation.error instanceof Error
              ? startExamMutation.error.message
              : null
          }
          onStart={handleStartExam}
        />
      </TakeExamShell>
    );
  }

  if (startExamMutation.isPending) {
    return (
      <TakeExamShell>
        <TakeExamLoading message="در حال بارگذاری سوالات آزمون..." />
      </TakeExamShell>
    );
  }

  if (!examStarted && participantStatus === 'started' && questions.length === 0) {
    return (
      <TakeExamShell>
        <TakeExamLoading message="در حال بارگذاری سوالات..." />
        {startExamMutation.isError && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {startExamMutation.error instanceof Error
              ? startExamMutation.error.message
              : 'خطا در بارگذاری آزمون'}
          </Alert>
        )}
      </TakeExamShell>
    );
  }

  if (startExamMutation.isError && !examStarted) {
    return (
      <TakeExamShell maxWidth="md">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {startExamMutation.error instanceof Error
            ? startExamMutation.error.message
            : 'شروع آزمون ناموفق بود.'}
        </Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={handleStartExam}>
          تلاش مجدد
        </Button>
      </TakeExamShell>
    );
  }

  if (submitted && result) {
    return (
      <TakeExamShell maxWidth="md">
        <TakeExamSuccess
          result={result}
          onBack={() => router.push('/exams/available')}
          onViewResult={() => router.push(`/exams/${examId}/result`)}
        />
      </TakeExamShell>
    );
  }

  if (examStarted && questions.length === 0) {
    return (
      <TakeExamShell>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          سوالات آزمون دریافت نشد. لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.
        </Alert>
      </TakeExamShell>
    );
  }

  return (
    <TakeExamShell>
      <TakeExamHeader
        examTitle={examInfo?.title || 'آزمون'}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        timerVisible={takeTimer.visible}
        timerSeconds={takeTimer.seconds}
        timerLabel={takeTimer.label}
        timerHint={takeTimer.hint}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 280px' },
          gap: { xs: 1, sm: 2 },
          alignItems: 'start',
        }}
      >
        <Stack spacing={0} sx={{ pointerEvents: examLocked ? 'none' : 'auto', opacity: examLocked ? 0.65 : 1 }}>
          {currentQuestion && (
            <TakeExamQuestionCard
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              points={
                typeof currentQuestion.payload?.points === 'number'
                  ? currentQuestion.payload.points
                  : undefined
              }
              payload={currentQuestion.payload as unknown as Record<string, unknown>}
              answerValue={answers[currentQuestion.id]}
              onAnswerChange={(v) => handleAnswerChange(currentQuestion.id, v)}
              isSaving={saveAnswerMutation.isPending}
            />
          )}

          <TakeExamFooter
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmitClick}
            isSubmitting={submitExamMutation.isPending || autoCompleteMutation.isPending}
          />
        </Stack>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'sticky', top: 88 }}>
            <TakeExamNavigator
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              onSelect={handleGoToQuestion}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' }, mt: { xs: 1, sm: 2 } }}>
        <TakeExamNavigator
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          onSelect={handleGoToQuestion}
        />
      </Box>

      <TakeExamTimeExpiredDialog
        open={showTimeExpiredDialog}
        isCompleting={autoCompleteMutation.isPending}
      />

      <TakeExamSubmitDialog
        open={showSubmitDialog}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        unansweredCount={unansweredCount}
        isSubmitting={submitExamMutation.isPending}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={handleSubmitConfirm}
      />
    </TakeExamShell>
  );
}

