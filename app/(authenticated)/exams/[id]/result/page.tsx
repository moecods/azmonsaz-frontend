"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useMyExamResult, useExamAiReview, useGraderNoteEngagement, useMarkResultViewed } from '@/hooks/exams';
import { useAuth } from '@/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GraderNoteDisplay from '@/components/exams/GraderNoteDisplay';
import ExamResultSummaryCard from '@/components/exams/ExamResultSummaryCard';
import GraderNoteEngagementBanner from '@/components/exams/GraderNoteEngagementBanner';
import GraderNoteFixedNavigator from '@/components/exams/GraderNoteFixedNavigator';
import {
  buildOutstandingGraderNoteTargets,
  getGraderNoteEngagementStats,
  graderNoteNeedsAcknowledgment,
  hasGraderNoteContent,
  isGraderNoteUnseen,
  scrollToGraderNoteTarget,
} from '@/lib/grader-notes';
import type { GraderNotePayload } from '@/services/exams/ExamService';
import {
  getQuestionCardBorderColor,
  getQuestionStatusLabel,
} from '@/lib/exam-result-copy';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import QuestionView from '@/components/questions/QuestionView';
import { RichLabel } from '@/components/editor';
import { handleError } from '@/lib/error-handler';
import { shellPageContainerSx } from '@/components/layout/layout-constants';

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const [aiReviewData, setAiReviewData] = useState<{ explanation: string; feedback: string } | null>(null);

  const questionsReviewRef = useRef<HTMLDivElement>(null);
  const noteAnchorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { data: resultData, isLoading, error } = useMyExamResult(examId);
  const aiReviewMutation = useExamAiReview(examId);
  const { markSeen, acknowledge } = useGraderNoteEngagement(examId);
  const markResultViewed = useMarkResultViewed(examId);
  const resultViewedReportedRef = useRef(false);
  const { user } = useAuth();
  const hasPro = !!user?.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  const detailResult =
    resultData &&
    resultData.visible !== false &&
    'result' in resultData &&
    resultData.result &&
    resultData.questions
      ? resultData
      : null;

  const examGraderNoteForNav = detailResult?.grader_notes?.exam;
  const questionsForNav = detailResult?.questions;

  useEffect(() => {
    resultViewedReportedRef.current = false;
  }, [examId]);

  useEffect(() => {
    if (!detailResult || !examId || resultViewedReportedRef.current) return;
    resultViewedReportedRef.current = true;
    markResultViewed.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per visible result load
  }, [detailResult, examId]);

  const noteEngagementStats = useMemo(
    () => getGraderNoteEngagementStats(examGraderNoteForNav, questionsForNav ?? []),
    [examGraderNoteForNav, questionsForNav]
  );

  const outstandingNoteTargets = useMemo(
    () => buildOutstandingGraderNoteTargets(examGraderNoteForNav, questionsForNav ?? []),
    [examGraderNoteForNav, questionsForNav]
  );

  const nextOutstandingNote = outstandingNoteTargets[0] ?? null;
  const showFixedNoteNavigator =
    noteEngagementStats.total > 0 && !noteEngagementStats.allComplete;

  const handleJumpToGraderNote = useCallback(() => {
    if (!nextOutstandingNote) return;
    scrollToGraderNoteTarget(noteAnchorRefs.current[nextOutstandingNote.id], {
      reserveBottomSpace: showFixedNoteNavigator,
    });
  }, [nextOutstandingNote, showFixedNoteNavigator]);

  const setNoteAnchorRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      noteAnchorRefs.current[id] = el;
    },
    []
  );

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  if (error || !resultData) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load exam result.'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/exams/available')}
            sx={{ mt: 2 }}
          >
            بازگشت به لیست آزمون‌ها
          </Button>
        </Container>
      </ProtectedRoute>
    );
  }

  if (resultData.visible === false) {
    const availableAtLabel = resultData.available_at
      ? new Date(resultData.available_at).toLocaleString('fa-IR')
      : null;

    return (
      <ProtectedRoute>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/exams/available')}
              sx={{ alignSelf: 'flex-start' }}
            >
              بازگشت
            </Button>
            <Typography variant="h5">
              {resultData.exam.title}
            </Typography>
            <Alert severity="info">
              {resultData.message}
            </Alert>
            {availableAtLabel && (
              <Typography variant="body2" color="text.secondary">
                زمان تقریبی انتشار: {availableAtLabel}
              </Typography>
            )}
            {(resultData.pending_grading_count ?? 0) > 0 && (
              <Typography variant="body2" color="text.secondary">
                تعداد سوالات در انتظار تصحیح: {resultData.pending_grading_count}
              </Typography>
            )}
          </Stack>
        </Container>
      </ProtectedRoute>
    );
  }

  if (!('result' in resultData) || !resultData.result || !resultData.questions) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">نتیجه آزمون در دسترس نیست.</Alert>
        </Container>
      </ProtectedRoute>
    );
  }

  const { exam, result, questions } = resultData;
  const correctCount = questions.filter((q) => q.is_correct).length;
  const pendingGradingCount = questions.filter((q) => q.is_pending_grading).length;
  const reviewCount = questions.length - correctCount - pendingGradingCount;
  const graderNotesBlock = resultData.grader_notes;
  const examGraderNote = graderNotesBlock?.exam;
  const graderNotesSummary = graderNotesBlock?.summary;

  const handleAiReview = async (examQuestionId: number) => {
    if (!examId) return;
    setAiReviewData(null);
    try {
      const data = await aiReviewMutation.mutateAsync(examQuestionId);
      setAiReviewData({
        explanation: data.explanation || "",
        feedback: data.feedback || "",
      });
    } catch (e) {
      handleError(e, { context: "AI Review" });
    }
  };

  return (
    <ProtectedRoute>
      <Container
        maxWidth="lg"
        sx={{
          ...shellPageContainerSx,
          pb: showFixedNoteNavigator ? { xs: 18, sm: 12, md: 10 } : shellPageContainerSx.py,
        }}
      >
        <Stack spacing={{ xs: 2, md: 4 }}>
          {/* Header */}
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/exams/available')}
              sx={{ mb: 2 }}
            >
              بازگشت
            </Button>
            <Typography variant="h5" sx={{ mb: 0, fontSize: { xs: '1.35rem', md: '2rem' } }}>
              نتیجه آزمون: {exam.title}
            </Typography>
          </Box>

          <ExamResultSummaryCard
            gradingMode={exam.grading_mode}
            gradingConfig={exam.grading_config}
            passingScore={exam.passing_score}
            result={result}
            questionStats={{
              total: questions.length,
              correctCount,
              reviewCount,
              pendingGradingCount,
            }}
          />

          <GraderNoteEngagementBanner summary={graderNotesSummary} />

          {hasGraderNoteContent(examGraderNote) ? (
          <Box ref={setNoteAnchorRef('exam')}>
          <GraderNoteDisplay
            title="پیام معلم"
            note={examGraderNote}
            markingSeen={markSeen.isPending}
            acknowledging={acknowledge.isPending}
            onMarkSeen={
              examGraderNote && !examGraderNote.engagement?.is_seen
                ? () => markSeen.mutate({ scope: 'exam' })
                : undefined
            }
            onAcknowledge={
              examGraderNote && graderNoteNeedsAcknowledgment(examGraderNote)
                ? () => acknowledge.mutate({ scope: 'exam' })
                : undefined
            }
          />
          </Box>
          ) : null}

          {/* Questions Review */}
          <Card ref={questionsReviewRef}>
            <CardContent sx={{ p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
              <Typography variant="h6" gutterBottom sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                بررسی پاسخ‌ها
              </Typography>
              <Stack spacing={{ xs: 2, md: 3 }}>
                {questions.map((question, index) => {
                  const isPendingGrading = question.is_pending_grading ?? false;
                  const status = getQuestionStatusLabel(isPendingGrading, question.is_correct);
                  const borderColor = getQuestionCardBorderColor(
                    isPendingGrading,
                    question.is_correct
                  );
                  const questionNote = question.grader_note as GraderNotePayload | null | undefined;
                  const hasNote = hasGraderNoteContent(questionNote);
                  return (
                  <Card
                    key={question.id}
                    variant="outlined"
                    sx={{
                      borderColor,
                      borderWidth: 1,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, '&:last-child': { pb: { xs: 1.5, md: 2.5 } } }}>
                      <Stack spacing={{ xs: 1.5, md: 2 }}>
                        <Stack spacing={1.25}>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{
                              justifyContent: 'flex-end',
                              alignSelf: 'stretch',
                            }}
                          >
                            <Chip
                              label={`سوال ${index + 1}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={status.label}
                              color={status.chipColor}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`${question.points_earned}/${question.points_total} نمره`}
                              variant="outlined"
                              size="small"
                            />
                            {hasNote && (
                              <Chip
                                label={
                                  isGraderNoteUnseen(questionNote)
                                    ? 'یادداشت جدید'
                                    : 'یادداشت معلم'
                                }
                                size="small"
                                color={isGraderNoteUnseen(questionNote) ? 'info' : 'default'}
                                variant={isGraderNoteUnseen(questionNote) ? 'filled' : 'outlined'}
                              />
                            )}
                            {graderNoteNeedsAcknowledgment(questionNote) && (
                              <Chip
                                label="نیاز به تأیید"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                            {hasPro && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={aiReviewMutation.isPending ? <CircularProgress size={14} /> : <SmartToyIcon />}
                                onClick={() => handleAiReview(question.id)}
                                disabled={aiReviewMutation.isPending}
                              >
                                بررسی با AI
                              </Button>
                            )}
                          </Stack>
                          <RichLabel
                            html={question.question_text}
                            fontSize="1.15rem"
                            compact={false}
                            fullContent
                            sx={{ fontWeight: 600, lineHeight: 1.75, width: '100%' }}
                          />
                        </Stack>

                        <QuestionView
                          mode="result"
                          source={question as unknown as Record<string, unknown>}
                          resultQuestion={{ ...question, is_pending_grading: isPendingGrading }}
                          resultAudience="student"
                        />
                        {hasNote ? (
                          <Box ref={setNoteAnchorRef(`question-${question.id}`)}>
                            <GraderNoteDisplay
                              title="یادداشت معلم برای این سوال"
                              note={questionNote}
                              markingSeen={markSeen.isPending}
                              acknowledging={acknowledge.isPending}
                              onMarkSeen={
                                questionNote && !questionNote.engagement?.is_seen
                                  ? () =>
                                      markSeen.mutate({
                                        scope: 'question',
                                        exam_question_id: question.id,
                                      })
                                  : undefined
                              }
                              onAcknowledge={
                                questionNote && graderNoteNeedsAcknowledgment(questionNote)
                                  ? () =>
                                      acknowledge.mutate({
                                        scope: 'question',
                                        exam_question_id: question.id,
                                      })
                                  : undefined
                              }
                            />
                          </Box>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                );
                })}
              </Stack>
            </CardContent>
          </Card>

          <Dialog open={!!aiReviewData} onClose={() => setAiReviewData(null)} maxWidth="sm" fullWidth>
            <DialogTitle>بررسی با هوش مصنوعی</DialogTitle>
            <DialogContent>
              {aiReviewData && (
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {aiReviewData.explanation}
                  </Typography>
                  {aiReviewData.feedback && (
                    <Alert severity="info">{aiReviewData.feedback}</Alert>
                  )}
                </Stack>
              )}
            </DialogContent>
          </Dialog>
        </Stack>
      </Container>

      <GraderNoteFixedNavigator
        visible={showFixedNoteNavigator}
        stats={noteEngagementStats}
        nextTarget={nextOutstandingNote}
        onJump={handleJumpToGraderNote}
      />
    </ProtectedRoute>
  );
}

