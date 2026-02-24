"use client";

import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
} from '@mui/material';
import { useExamWithParticipants } from '@/hooks/useExams';
import { useAuth } from '@/hooks';
import UserLayout from '@/components/layout/UserLayout';
import Breadcrumb from '@/components/Breadcrumb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { handleError } from '@/lib/error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8030/api';
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

interface GradingData {
  exam_question_id: number;
  question_id: number;
  question_text: string;
  question_type: string;
  answer: any;
  manual_score: number | null;
  max_points: number;
  order: number;
}

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
}

export default function ExamGradingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const { data: examData, isLoading } = useExamWithParticipants(examId);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  const [gradingData, setGradingData] = useState<ParticipantGradingData | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [loadingGrading, setLoadingGrading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [aiGradingQuestion, setAiGradingQuestion] = useState<number | null>(null);
  const [aiGradingAll, setAiGradingAll] = useState(false);
  const { user } = useAuth();
  const hasPro = !!user?.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  // Load grading data when participant is selected
  useEffect(() => {
    if (selectedParticipant && examId) {
      loadGradingData(selectedParticipant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadGradingData is stable
  }, [selectedParticipant, examId]);

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
        // Initialize scores from existing manual scores
        const initialScores: Record<number, number> = {};
        result.data.questions.forEach((q: GradingData) => {
          if (q.manual_score !== null) {
            initialScores[q.exam_question_id] = q.manual_score;
          }
        });
        setScores(initialScores);
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
      const grades = Object.entries(scores).map(([examQuestionId, score]) => ({
        exam_question_id: parseInt(examQuestionId),
        score: score,
      }));

      const response = await fetch(
        `${API_URL}/exams/${examId}/participants/${selectedParticipant}/grade`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ grades }),
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

  // Get participants with essay questions
  const participantsWithEssays = examData?.participants?.filter((p: { id: number; status: string }) => {
    // For now, show all completed participants
    // In future, we can filter to only show those with essay questions
    return p.status === 'completed';
  }) || [];

  // Filter questions to only show essay type
  const essayQuestions = gradingData?.questions.filter((q) => q.question_type === 'essay') || [];

  if (isLoading) {
    return (
      <UserLayout>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (!examData) {
    return (
      <UserLayout>
        <Alert severity="error">آزمون یافت نشد.</Alert>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Stack spacing={4}>
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
                  {participantsWithEssays.length === 0 ? (
                    <Alert severity="info">هیچ شرکت‌کننده‌ای یافت نشد.</Alert>
                  ) : (
                    participantsWithEssays.map((participant: { id: number; user?: { name?: string }; user_id: number }) => (
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
            ) : gradingData && essayQuestions.length > 0 ? (
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            تصحیح سوالات تشریحی
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            شرکت‌کننده: {gradingData.participant.user_name}
                          </Typography>
                        </Box>
                        {hasPro && (
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

                    <Divider />

                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>شماره</TableCell>
                            <TableCell>سوال</TableCell>
                            <TableCell>پاسخ</TableCell>
                            <TableCell>نمره</TableCell>
                            <TableCell>حداکثر</TableCell>
                            {hasPro && <TableCell>AI</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {essayQuestions.map((question, index) => (
                            <TableRow key={question.exam_question_id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {question.question_text}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{
                                    p: 2,
                                    bgcolor: 'grey.50',
                                    borderRadius: 1,
                                    maxHeight: 150,
                                    overflow: 'auto',
                                  }}
                                >
                                  <Typography variant="body2" whiteSpace="pre-wrap">
                                    {question.answer || 'پاسخی ثبت نشده است'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={scores[question.exam_question_id] || ''}
                                  onChange={(e) =>
                                    handleScoreChange(question.exam_question_id, e.target.value)
                                  }
                                  inputProps={{
                                    min: 0,
                                    max: question.max_points,
                                  }}
                                  sx={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {question.max_points}
                                </Typography>
                              </TableCell>
                              {hasPro && (
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={aiGradingQuestion === question.exam_question_id ? <CircularProgress size={16} /> : <SmartToyIcon />}
                                    onClick={() => handleAiGradeQuestion(question.exam_question_id)}
                                    disabled={aiGradingQuestion !== null}
                                  >
                                    AI
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleSaveGrades}
                          disabled={saving}
                        >
                          {saving ? 'در حال ذخیره...' : 'ذخیره نمرات'}
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ) : gradingData && essayQuestions.length === 0 ? (
              <Card>
                <CardContent>
                  <Alert severity="info">
                    این آزمون سوال تشریحی ندارد.
                  </Alert>
                </CardContent>
              </Card>
            ) : null}
          </Grid>
        </Grid>
      </Stack>
    </UserLayout>
  );
}
