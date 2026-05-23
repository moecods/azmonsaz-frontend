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
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { useExamWithParticipants } from '@/hooks/useExams';
import { useAuth } from '@/hooks';
import Breadcrumb from '@/components/Breadcrumb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
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
  const questionAnchorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { user } = useAuth();
  const hasPro = !!user?.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  // Load grading data when participant is selected
  useEffect(() => {
    if (selectedParticipant && examId) {
      loadGradingData(selectedParticipant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadGradingData is stable
  }, [selectedParticipant, examId]);

  useEffect(() => {
    setGradingNavDismissed(false);
  }, [selectedParticipant]);

  const gradingQuestions = gradingData?.questions ?? [];

  const pendingGradingStats = useMemo(
    () => getPendingGradingStats(gradingQuestions),
    [gradingQuestions]
  );

  const pendingGradingTargets = useMemo(
    () => buildPendingGradingTargets(gradingQuestions),
    [gradingQuestions]
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
        setGradingData(result.data);
        const initialScores: Record<number, number> = {};
        result.data.questions.forEach((q: GradingData) => {
          initialScores[q.exam_question_id] = q.effective_score ?? q.auto_score ?? 0;
        });
        setScores(initialScores);

        const notes = result.data.grader_notes;
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
      }
    } catch (error) {
      handleError(error, { context: 'Load Grading Data' });
    } finally {
      setLoadingGrading(false);
    }
  };

  const handleScoreChange = (examQuestionId: number, value: string) => {
    const score = parseInt(value) || 0;
    setScores((prev) => ({
      ...prev,
      [examQuestionId]: score,
    }));
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
        // Reload grading data to get updated scores
        loadGradingData(selectedParticipant);
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
      setScores((prev) => ({ ...prev, [examQuestionId]: data.score }));
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
      const newScores = { ...scores };
      Object.entries(data.grades || {}).forEach(([eqId, g]: [string, { score?: number }]) => {
        newScores[parseInt(eqId)] = g.score ?? 0;
      });
      setScores(newScores);
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
      spacing={{ xs: 2, md: 4 }}
      sx={{ pb: showGradingPendingNavigator ? { xs: 18, md: 10 } : 0 }}
    >
        <Breadcrumb
          items={[
            { label: 'مدیریت آزمون‌ها', href: '/exams' },
            { label: examData.title, href: `/exams/${examId}` },
            { label: 'تصحیح دستی' },
          ]}
        />

        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/exams/${examId}`)}
            >
              بازگشت
            </Button>
            <Typography variant="h4" fontWeight="bold">
              تصحیح دستی آزمون
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {examData.title}
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Participants List */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  شرکت‌کنندگان
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {completedParticipants.length === 0 ? (
                    <Alert severity="info">هیچ شرکت‌کننده‌ای یافت نشد.</Alert>
                  ) : (
                    completedParticipants.map((participant: { id: number; user?: { name?: string }; user_id: number; score?: number; total_points?: number }) => (
                      <Button
                        key={participant.id}
                        variant={selectedParticipant === participant.id ? 'contained' : 'outlined'}
                        fullWidth
                        onClick={() => setSelectedParticipant(participant.id)}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Typography variant="body1" fontWeight="medium">
                            {participant.user?.name || `کاربر ${participant.user_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            نمره: {participant.score || 0} / {participant.total_points || 0}
                          </Typography>
                        </Stack>
                      </Button>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Grading Area */}
          <Grid item xs={12} md={8}>
            {!selectedParticipant ? (
              <Card>
                <CardContent>
                  <Alert severity="info">
                    لطفاً یک شرکت‌کننده را انتخاب کنید.
                  </Alert>
                </CardContent>
              </Card>
            ) : loadingGrading ? (
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                </CardContent>
              </Card>
            ) : gradingData && gradingQuestions.length > 0 ? (
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            تصحیح دستی
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            شرکت‌کننده: {gradingData.participant.user_name}
                          </Typography>
                        </Box>
                        {hasPro && hasEssayQuestions && (
                          <Button
                            variant="outlined"
                            startIcon={aiGradingAll ? <CircularProgress size={18} /> : <SmartToyIcon />}
                            onClick={handleAiGradeAll}
                            disabled={aiGradingAll}
                          >
                            تصحیح کل با AI
                          </Button>
                        )}
                      </Stack>
                    </Box>

                    <GraderNoteInput
                      label="یادداشت کلی آزمون"
                      value={examNote}
                      onChange={setExamNote}
                    />

                    <Divider />

                    <Stack spacing={2}>
                      {gradingQuestions.map((question, index) => (
                        <GradingQuestionCard
                          key={question.exam_question_id}
                          index={index}
                          question={question}
                          score={scores[question.exam_question_id] ?? question.effective_score ?? 0}
                          onScoreChange={(value) =>
                            handleScoreChange(question.exam_question_id, value)
                          }
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
                    </Stack>

                    <Box>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleSaveGrades}
                          disabled={saving}
                        >
                          {saving ? 'در حال ذخیره...' : 'ذخیره نمرات و یادداشت‌ها'}
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ) : gradingData && gradingQuestions.length === 0 ? (
              <Card>
                <CardContent>
                  <Alert severity="info">این آزمون سوالی ندارد.</Alert>
                </CardContent>
              </Card>
            ) : null}
          </Grid>
        </Grid>
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
