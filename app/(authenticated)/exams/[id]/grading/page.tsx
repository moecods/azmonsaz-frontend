"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { useExamWithParticipants } from '@/hooks/useExams';
import { useAuth } from '@/hooks';
import Breadcrumb from '@/components/Breadcrumb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { handleError } from '@/lib/error-handler';
import GraderNoteInput, { GraderNoteValue } from '@/components/exams/GraderNoteInput';
import GradingQuestionCard, { GradingQuestionData } from '@/components/exams/GradingQuestionCard';
import GradingPendingNavigator from '@/components/exams/GradingPendingNavigator';
import {
  buildPendingGradingTargets,
  getPendingGradingStats,
  gradingQuestionAnchorId,
} from '@/lib/grading-navigation';
import { scrollToGraderNoteTarget } from '@/lib/grader-notes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8030/api';

const emptyNote = (): GraderNoteValue => ({
  text: '',
  audio_media_id: null,
  audio_url: null,
  requires_acknowledgment: false,
});
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

type GradingData = GradingQuestionData & {
  question_id: number;
  manual_score: number | null;
  order: number;
};

interface ParticipantGradingData {
  participant: {
    id: number;
    user_id: number;
    user_name: string;
    status: string;
    score: number;
    total_points: number;
  };
  questions: GradingData[];
  grader_notes?: {
    exam?: GraderNoteValue | null;
    questions?: Record<string, GraderNoteValue>;
  };
}

export default function ExamGradingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const { data: examData, isLoading } = useExamWithParticipants(examId);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  const [gradingData, setGradingData] = useState<ParticipantGradingData | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [examNote, setExamNote] = useState<GraderNoteValue>(emptyNote());
  const [questionNotes, setQuestionNotes] = useState<Record<number, GraderNoteValue>>({});
  const [loadingGrading, setLoadingGrading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [aiGradingQuestion, setAiGradingQuestion] = useState<number | null>(null);
  const [aiGradingAll, setAiGradingAll] = useState(false);
  const [gradingNavDismissed, setGradingNavDismissed] = useState(false);
  const [locallyGradedIds, setLocallyGradedIds] = useState<Set<number>>(new Set());
  const questionAnchorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { user } = useAuth();
  const hasPro = !!user?.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  useEffect(() => {
    if (selectedParticipant && examId) {
      loadGradingData(selectedParticipant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadGradingData is stable
  }, [selectedParticipant, examId]);

  useEffect(() => {
    setGradingNavDismissed(false);
    setLocallyGradedIds(new Set());
  }, [selectedParticipant]);

  const gradingQuestions = gradingData?.questions ?? [];

  const gradingProgressOptions = useMemo(
    () => ({ locallyGradedIds }),
    [locallyGradedIds]
  );

  const pendingGradingStats = useMemo(
    () => getPendingGradingStats(gradingQuestions, gradingProgressOptions),
    [gradingQuestions, gradingProgressOptions]
  );

  const pendingGradingTargets = useMemo(
    () => buildPendingGradingTargets(gradingQuestions, gradingProgressOptions),
    [gradingQuestions, gradingProgressOptions]
  );

  const nextPendingTarget = pendingGradingTargets[0] ?? null;

  const showGradingPendingNavigator =
    Boolean(selectedParticipant && gradingData) &&
    !gradingNavDismissed &&
    !pendingGradingStats.allDone;

  const setQuestionAnchorRef = useCallback(
    (examQuestionId: number) => (el: HTMLDivElement | null) => {
      questionAnchorRefs.current[gradingQuestionAnchorId(examQuestionId)] = el;
    },
    []
  );

  const handleJumpToPendingQuestion = useCallback(() => {
    if (!nextPendingTarget) return;
    scrollToGraderNoteTarget(questionAnchorRefs.current[nextPendingTarget.id], {
      reserveBottomSpace: showGradingPendingNavigator,
    });
  }, [nextPendingTarget, showGradingPendingNavigator]);

  const applyGradingPayload = (data: ParticipantGradingData) => {
    setGradingData(data);
    const initialScores: Record<number, number> = {};
    data.questions.forEach((q: GradingData) => {
      initialScores[q.exam_question_id] = q.effective_score ?? q.auto_score ?? 0;
    });
    setScores(initialScores);
    setLocallyGradedIds(new Set());

    const notes = data.grader_notes;
    setExamNote({
      text: notes?.exam?.text ?? '',
      audio_media_id: notes?.exam?.audio_media_id ?? null,
      audio_url: notes?.exam?.audio_url ?? null,
      requires_acknowledgment: notes?.exam?.requires_acknowledgment ?? false,
    });
    const qNotes: Record<number, GraderNoteValue> = {};
    Object.entries(notes?.questions ?? {}).forEach(([eqId, note]) => {
      const n = note as GraderNoteValue;
      qNotes[parseInt(eqId, 10)] = {
        text: n.text ?? '',
        audio_media_id: n.audio_media_id ?? null,
        audio_url: n.audio_url ?? null,
        requires_acknowledgment: n.requires_acknowledgment ?? false,
      };
    });
    setQuestionNotes(qNotes);
  };

  const loadGradingData = async (participantId: number) => {
    if (!examId) return;

    setLoadingGrading(true);
    try {
      const response = await fetch(
        `${API_URL}/exams/${examId}/participants/${participantId}/answers`,
        { headers: getAuthHeader() }
      );

      if (!response.ok) {
        throw new Error('Failed to load grading data');
      }

      const result = await response.json();
      if (result.success) {
        applyGradingPayload(result.data);
      }
    } catch (error) {
      handleError(error, { context: 'Load Grading Data' });
    } finally {
      setLoadingGrading(false);
    }
  };

  const handleScoreChange = (examQuestionId: number, value: string) => {
    const score = parseInt(value, 10) || 0;
    setScores((prev) => ({
      ...prev,
      [examQuestionId]: score,
    }));

    const question = gradingQuestions.find((q) => q.exam_question_id === examQuestionId);
    if (question?.is_pending_grading && question.manual_score == null) {
      setLocallyGradedIds((prev) => {
        const next = new Set(prev);
        next.add(examQuestionId);
        return next;
      });
      setGradingData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.exam_question_id === examQuestionId
              ? { ...q, manual_score: score, effective_score: score }
              : q
          ),
        };
      });
    }
  };

  const handleSaveGrades = async () => {
    if (!examId || !selectedParticipant || !gradingData) return;

    setSaving(true);
    setSuccessMessage(null);

    try {
      const grades = gradingData.questions.map((q) => ({
        exam_question_id: q.exam_question_id,
        score: scores[q.exam_question_id] ?? q.effective_score ?? 0,
      }));

      const questionNotesPayload: Record<
        string,
        { text?: string; audio_media_id?: number | null; requires_acknowledgment?: boolean }
      > = {};
      Object.entries(questionNotes).forEach(([eqId, note]) => {
        questionNotesPayload[eqId] = {
          text: note.text || undefined,
          audio_media_id: note.audio_media_id,
          requires_acknowledgment: note.requires_acknowledgment ?? false,
        };
      });

      const response = await fetch(
        `${API_URL}/exams/${examId}/participants/${selectedParticipant}/grade`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({
            grades,
            exam_note: {
              text: examNote.text || undefined,
              audio_media_id: examNote.audio_media_id,
              requires_acknowledgment: examNote.requires_acknowledgment ?? false,
            },
            question_notes: questionNotesPayload,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save grades');
      }

      const result = await response.json();
      if (result.success) {
        setSuccessMessage('نمرات با موفقیت ذخیره شد');
        await loadGradingData(selectedParticipant);
      }
    } catch (error) {
      handleError(error, { context: 'Save Grades' });
    } finally {
      setSaving(false);
    }
  };

  const handleAiGradeQuestion = async (examQuestionId: number) => {
    if (!examId || !selectedParticipant) return;
    setAiGradingQuestion(examQuestionId);
    try {
      const res = await fetch(
        `${API_URL}/exams/${examId}/participants/${selectedParticipant}/ai-grade-essay`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ exam_question_id: examQuestionId }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message || 'AI grading failed');
      const { data } = await res.json();
      handleScoreChange(examQuestionId, String(data.score));
      setSuccessMessage(`نمره پیشنهادی AI: ${data.score} - ${data.feedback || ''}`);
    } catch (e) {
      handleError(e, { context: 'AI Grade' });
    } finally {
      setAiGradingQuestion(null);
    }
  };

  const handleAiGradeAll = async () => {
    if (!examId || !selectedParticipant) return;
    setAiGradingAll(true);
    try {
      const res = await fetch(
        `${API_URL}/exams/${examId}/participants/${selectedParticipant}/ai-grade-all`,
        { method: 'POST', headers: getAuthHeader() }
      );
      if (!res.ok) throw new Error((await res.json()).message || 'AI grading failed');
      const { data } = await res.json();
      Object.entries(data.grades || {}).forEach(([eqId, g]: [string, { score?: number }]) => {
        handleScoreChange(parseInt(eqId, 10), String(g.score ?? 0));
      });
      setSuccessMessage('نمرات پیشنهادی AI اعمال شد. در صورت تایید ذخیره کنید.');
    } catch (e) {
      handleError(e, { context: 'AI Grade All' });
    } finally {
      setAiGradingAll(false);
    }
  };

  const completedParticipants =
    examData?.participants?.filter((p: { status: string }) => p.status === 'completed') || [];

  const hasEssayQuestions = gradingQuestions.some((q) => q.question_type === 'essay');
  const pendingCount = pendingGradingStats.outstandingCount;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!examData) {
    return <Alert severity="error">آزمون یافت نشد.</Alert>;
  }

  return (
    <>
      <Stack
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: 1280,
          mx: 'auto',
          pb: showGradingPendingNavigator ? { xs: 18, md: 10 } : 3,
        }}
      >
        <Breadcrumb
          items={[
            { label: 'مدیریت آزمون‌ها', href: '/exams' },
            { label: examData.title, href: `/exams/${examId}` },
            { label: 'تصحیح آزمون' },
          ]}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push(`/exams/${examId}`)}
              >
                بازگشت
              </Button>
              <Typography variant="h5" fontWeight={700}>
                تصحیح آزمون
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {examData.title}
            </Typography>
          </Box>

          {selectedParticipant && gradingData && hasPro && hasEssayQuestions && (
            <Button
              variant="outlined"
              startIcon={aiGradingAll ? <CircularProgress size={18} /> : <SmartToyIcon />}
              onClick={handleAiGradeAll}
              disabled={aiGradingAll}
            >
              تصحیح تشریحی با AI
            </Button>
          )}
        </Stack>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonOutlineIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight={700}>
                شرکت‌کنندگان
              </Typography>
              {pendingCount > 0 && selectedParticipant && (
                <Chip size="small" color="warning" label={`${pendingCount} سوال در انتظار نمره`} />
              )}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {completedParticipants.length === 0 ? (
                <Alert severity="info" sx={{ width: '100%' }}>
                  هیچ شرکت‌کننده‌ای یافت نشد.
                </Alert>
              ) : (
                completedParticipants.map(
                  (participant: {
                    id: number;
                    user?: { name?: string };
                    user_id: number;
                    score?: number;
                    total_points?: number;
                  }) => (
                    <Chip
                      key={participant.id}
                      clickable
                      color={selectedParticipant === participant.id ? 'primary' : 'default'}
                      variant={selectedParticipant === participant.id ? 'filled' : 'outlined'}
                      onClick={() => setSelectedParticipant(participant.id)}
                      label={
                        <Stack component="span" spacing={0} alignItems="flex-start">
                          <Typography component="span" variant="body2" fontWeight={600}>
                            {participant.user?.name || `کاربر ${participant.user_id}`}
                          </Typography>
                          <Typography component="span" variant="caption">
                            {participant.score || 0} / {participant.total_points || 0}
                          </Typography>
                        </Stack>
                      }
                      sx={{ height: 'auto', py: 1, '& .MuiChip-label': { display: 'block' } }}
                    />
                  )
                )
              )}
            </Stack>
          </Stack>
        </Paper>

        {!selectedParticipant ? (
          <Alert severity="info">یک شرکت‌کننده را انتخاب کنید تا پاسخ‌ها نمایش داده شوند.</Alert>
        ) : loadingGrading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : gradingData && gradingQuestions.length > 0 ? (
          <Stack spacing={2.5}>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
              پاسخ‌های {gradingData.participant.user_name}
            </Typography>

            {gradingQuestions.map((question, index) => (
              <GradingQuestionCard
                key={question.exam_question_id}
                index={index}
                question={question}
                score={scores[question.exam_question_id] ?? question.effective_score ?? 0}
                onScoreChange={(value) => handleScoreChange(question.exam_question_id, value)}
                note={questionNotes[question.exam_question_id] ?? emptyNote()}
                onNoteChange={(note) =>
                  setQuestionNotes((prev) => ({
                    ...prev,
                    [question.exam_question_id]: note,
                  }))
                }
                showAiButton={hasPro && hasEssayQuestions}
                aiLoading={aiGradingQuestion === question.exam_question_id}
                onAiGrade={
                  question.question_type === 'essay'
                    ? () => handleAiGradeQuestion(question.exam_question_id)
                    : undefined
                }
                scrollAnchorRef={setQuestionAnchorRef(question.exam_question_id)}
              />
            ))}

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                  یادداشت کلی آزمون
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  این یادداشت برای شرکت‌کننده در کارنامه نمایش داده می‌شود.
                </Typography>
                <GraderNoteInput label="یادداشت کلی" value={examNote} onChange={setExamNote} />
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveGrades}
                    disabled={saving}
                  >
                    {saving ? 'در حال ذخیره...' : 'ذخیره نمرات و یادداشت‌ها'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        ) : gradingData && gradingQuestions.length === 0 ? (
          <Alert severity="info">این آزمون سوالی ندارد.</Alert>
        ) : null}
      </Stack>

      <GradingPendingNavigator
        visible={showGradingPendingNavigator}
        stats={pendingGradingStats}
        nextTarget={nextPendingTarget}
        onJump={handleJumpToPendingQuestion}
        onDismiss={() => setGradingNavDismissed(true)}
      />
    </>
  );
}
