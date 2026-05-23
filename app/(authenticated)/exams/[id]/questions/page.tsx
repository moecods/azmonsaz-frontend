"use client";

import { useState, Suspense, useEffect, useCallback, useRef, useMemo, memo } from 'react';
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
  IconButton,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  TextField,
  Collapse,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useExam, useAddQuestionToExam, useUpdateExamQuestion, useDeleteExamQuestion } from '@/hooks/useExams';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import Breadcrumb from '@/components/Breadcrumb';
import { ExamQuestionsToolbar } from '@/components/exams/exam-questions/ExamQuestionsToolbar';
import { ExamQuestionBankPane } from '@/components/exams/exam-questions/ExamQuestionBankPane';
import QuestionDisplay from '@/components/questions/QuestionDisplay';
import { RichLabel, htmlToPlainText } from '@/components/editor';
import { ExamQuestion, Question } from '@/types';
import { getQuestionTypeLabel } from '@/lib/question-types/registry';
import {
  getQuestionText,
  getQuestionOptions,
  getQuestionType,
  buildBankQuestionPayload,
  buildCustomQuestionPayload,
  sortQuestionsByOrder,
} from '@/lib/question-utils';
import { handleError, getErrorMessage } from '@/lib/error-handler';
import {
  getDefaultQuestionPoints,
  getExamMaxScore,
  maxPointsAllowedForQuestion,
  wouldExceedExamMaxScore,
  type ExamWithGrading,
} from '@/lib/exam-points';
import {ArrowRightIcon} from "@mui/x-date-pickers";

interface SortableQuestionItemProps {
  question: ExamQuestion;
  index: number;
  defaultPoints: number;
  maxPointsAllowed: number;
  examMaxScore: number | null;
  onDelete: (questionId: number) => void;
  onUpdatePoints: (question: ExamQuestion, points: number) => void;
  onPointsRejected: (message: string) => void;
  onEdit: (question: ExamQuestion) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

const SortableQuestionItem = memo(function SortableQuestionItem({
  question,
  index,
  defaultPoints,
  maxPointsAllowed,
  examMaxScore,
  onDelete,
  onUpdatePoints,
  onPointsRejected,
  onEdit,
  isDeleting,
  isUpdating,
}: SortableQuestionItemProps) {
  const points = (question.payload?.points as number) ?? defaultPoints;
  const [pointsValue, setPointsValue] = useState<string>(String(points));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setPointsValue(String(points));
  }, [points]);

  const handlePointsBlur = () => {
    const val = parseInt(pointsValue, 10);
    if (Number.isNaN(val) || val < 1) {
      setPointsValue(String(points));
      return;
    }
    if (examMaxScore != null && val > maxPointsAllowed) {
      onPointsRejected(
        `بارم این سوال نمی‌تواند بیشتر از ${maxPointsAllowed} باشد (حداکثر نمره آزمون: ${examMaxScore}).`
      );
      setPointsValue(String(points));
      return;
    }
    if (val !== points) {
      onUpdatePoints(question, val);
    }
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const questionText = getQuestionText(question);
  const options = getQuestionOptions(question);
  const questionType = getQuestionType(question);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        mb: 2,
        border: isDragging ? '2px dashed' : '1px solid',
        borderColor: isDragging ? 'primary.main' : 'divider',
        backgroundColor: isDragging ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <Box
                {...attributes}
                {...listeners}
                sx={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <DragHandleIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      mb: 1,
                      gap: 1, // Adds spacing in both directions (row and column)
                      flexWrap: 'wrap' // Ensures items wrap to next line on mobile
                    }}
                >
                  <Chip
                      label={`سوال ${question.payload?.order ?? index + 1}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                  />
                  {question.question_id ? (
                      <Chip label="از بانک" size="small" color="primary" />
                  ) : (
                      <Chip label="سفارشی" size="small" color="secondary" />
                  )}
                  <Chip
                      label={getQuestionTypeLabel(questionType)}
                      size="small"
                      variant="outlined"
                  />
                  <Tooltip title="بارم سوال">
                    <TextField
                        size="small"
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(e.target.value)}
                        onBlur={handlePointsBlur}
                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        disabled={isUpdating}
                        inputProps={{
                          min: 1,
                          max: examMaxScore != null ? Math.max(1, maxPointsAllowed) : 100,
                        }}
                        sx={{
                          width: 48,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            height: 40,
                            backgroundColor: 'action.hover',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderWidth: 2 },
                          },
                          '& .MuiInputBase-input': {
                            textAlign: 'center',
                            py: 0.5,
                            px: 0.5,
                            fontSize: '0.875rem',
                          },
                        }}
                    />
                  </Tooltip>
                </Stack>
                <Box
                  onClick={() => setExpanded((e) => !e)}
                  sx={{ cursor: 'pointer' }}
                >
                  <RichLabel
                    html={questionText}
                    fontSize="1rem"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                <Collapse in={expanded}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <QuestionDisplay
                      source={(question.payload ?? question.question ?? {}) as Record<string, unknown>}
                      mode="manage"
                    />
                  </Box>
                </Collapse>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="ویرایش سوال (سوال از بانک به‌صورت کپی در آزمون ذخیره شده و قابل ویرایش است)">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(question)}
                    disabled={isUpdating}
                  >
                    <EditIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="حذف سوال">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(question.id)}
                  disabled={isDeleting}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {options.length > 0 && (
            <Box sx={{ pl: 4 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                گزینه‌ها:
              </Typography>
              <Stack spacing={0.5}>
                {options.map((option: { text?: string; is_correct?: boolean } | string, optionIndex: number) => {
                  const isCorrect =
                    typeof option === 'object' && option && 'is_correct' in option && option.is_correct;
                  const optionText = typeof option === 'string' ? option : (option.text ?? '');
                  return (
                    <Stack
                      key={optionIndex}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Typography
                        variant="body2"
                        sx={{ minWidth: 24, fontWeight: 'medium', mt: 0.25 }}
                      >
                        {String.fromCharCode(65 + optionIndex)}.
                      </Typography>
                      <RichLabel
                        html={optionText}
                        fontSize="0.875rem"
                        sx={{
                          fontWeight: isCorrect ? 600 : 400,
                          color: isCorrect ? 'success.main' : 'text.primary',
                        }}
                      />
                      {isCorrect && (
                        <Chip label="صحیح" size="small" color="success" />
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});

function ExamQuestionsContent() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<ExamQuestion | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const dragUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: examWithQuestions, isLoading, error } = useExam(examId);
  const addQuestionMutation = useAddQuestionToExam();
  const updateQuestionMutation = useUpdateExamQuestion();
  const deleteQuestionMutation = useDeleteExamQuestion();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local state when exam data loads
  useEffect(() => {
    if (examWithQuestions) {
      // Backend returns exam_questions (not questions) in ExamDTO
      const examData = examWithQuestions as { exam_questions?: Array<{ id: number; question_id?: number; payload?: Record<string, unknown>; created_at?: string; updated_at?: string; question?: unknown }>; questions?: unknown[] };
      const examQuestionsData = (examData.exam_questions || examData.questions || []) as Array<{ id: number; question_id?: number; payload?: Record<string, unknown>; created_at?: string; updated_at?: string; question?: unknown }>;
      
      if (examQuestionsData.length > 0) {
        // Map exam_questions to ExamQuestion format
        const mappedQuestions: ExamQuestion[] = examQuestionsData.map((eq) => ({
          id: eq.id,
          exam_id: examId || 0,
          question_id: eq.question_id ?? undefined,
          payload: eq.payload || {},
          order: (typeof eq.payload?.order === 'number' ? eq.payload.order : eq.id) as number,
          created_at: eq.created_at || new Date().toISOString(),
          updated_at: eq.updated_at || new Date().toISOString(),
          question: eq.question ? (eq.question as Question) : undefined,
        }));
        
        const sorted = sortQuestionsByOrder(mappedQuestions);
        // Ensure all questions have proper order starting from 1
        const normalized = sorted.map((q, idx) => {
          const normalizedOrder = idx + 1;
          if (q.payload) {
            q.payload.order = normalizedOrder;
          } else {
            q.payload = { order: normalizedOrder };
          }
          q.order = normalizedOrder;
          return q;
        });
        setQuestions(normalized);
      } else {
        // If no questions, reset to empty array
        setQuestions([]);
      }
    }
  }, [examWithQuestions, examId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragUpdateTimeoutRef.current) {
        clearTimeout(dragUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !examId) {
      return;
    }

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(newQuestions);

      // Clear any pending timeout
      if (dragUpdateTimeoutRef.current) {
        clearTimeout(dragUpdateTimeoutRef.current);
      }

      // Debounce backend updates to avoid too many requests
      dragUpdateTimeoutRef.current = setTimeout(() => {
        // Only update questions that actually changed position
        // Calculate the range of affected questions
        const startIndex = Math.min(oldIndex, newIndex);
        const endIndex = Math.max(oldIndex, newIndex);
        
        // Collect all updates that need to be made
        const updates: Array<{ questionId: number; payload: Record<string, unknown> }> = [];
        for (let i = startIndex; i <= endIndex; i++) {
          const question = newQuestions[i];
          const newOrder = i + 1;
          const currentOrder = question.payload?.order;
          
          if (currentOrder !== newOrder) {
            updates.push({
              questionId: question.id,
              payload: {
                ...question.payload,
                order: newOrder,
              },
            });
          }
        }

        // Apply all updates
        if (updates.length > 0) {
          let completedCount = 0;
          let hasError = false;

          updates.forEach((update) => {
            updateQuestionMutation.mutate(
              {
                examId: examId!,
                questionId: update.questionId,
                data: { payload: update.payload },
              },
              {
                onSuccess: () => {
                  completedCount++;
                  if (completedCount === updates.length && !hasError) {
                    setSnackbar({
                      open: true,
                      message: 'ترتیب سوالات با موفقیت به‌روزرسانی شد',
                      severity: 'success',
                    });
                  }
                },
                onError: (error) => {
                  if (!hasError) {
                    hasError = true;
                    handleError(error, { context: 'Update Question Order' });
                    setSnackbar({
                      open: true,
                      message: 'خطا در به‌روزرسانی ترتیب سوالات',
                      severity: 'error',
                    });
                  }
                },
              }
            );
          });
        }
      }, 500); // 500ms debounce
    }
  }, [questions, examId, updateQuestionMutation]);

  const examForPoints = examWithQuestions as ExamWithGrading | undefined;
  const defaultPoints = getDefaultQuestionPoints(examForPoints);
  const examMaxScore = getExamMaxScore(examForPoints);

  const rejectPointsOverflow = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const handleAddQuestion = useCallback((question: ExamQuestion) => {
    if (!examId) return;

    const nextOrder = questions.length + 1;
    const points = defaultPoints;
    const cap = wouldExceedExamMaxScore(examForPoints, questions, defaultPoints, points);
    if (cap.exceeds) {
      rejectPointsOverflow(
        `افزودن سوال با بارم ${points} مجاز نیست. مجموع بارم (${cap.projectedTotal}) از حداکثر نمره (${cap.maxScore}) بیشتر می‌شود.`
      );
      return;
    }
    
    if (question.question_id) {
      const payload = buildBankQuestionPayload(nextOrder, points);
      addQuestionMutation.mutate(
        { 
          examId, 
          data: { question_id: question.question_id, payload } 
        },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: 'سوال با موفقیت به آزمون اضافه شد',
              severity: 'success',
            });
          },
          onError: (error) => {
            handleError(error, { context: 'Add Question From Bank' });
            setSnackbar({
              open: true,
              message: getErrorMessage(error, 'خطا در افزودن سوال'),
              severity: 'error',
            });
          },
        }
      );
    } else {
      const payload = buildCustomQuestionPayload(question, nextOrder, points);
      addQuestionMutation.mutate(
        { 
          examId, 
          data: { payload } 
        },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: 'سوال سفارشی با موفقیت به آزمون اضافه شد',
              severity: 'success',
            });
          },
          onError: (error) => {
            handleError(error, { context: 'Add Custom Question' });
            setSnackbar({
              open: true,
              message: getErrorMessage(error, 'خطا در افزودن سوال سفارشی'),
              severity: 'error',
            });
          },
        }
      );
    }
  }, [examId, questions.length, addQuestionMutation, defaultPoints, examForPoints, questions, rejectPointsOverflow]);

  const handleDeleteQuestion = useCallback((questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      setQuestionToDelete(question);
      setDeleteDialogOpen(true);
    }
  }, [questions]);

  const handleEditQuestion = useCallback(
    (question: ExamQuestion) => {
      if (examId) router.push(`/exams/${examId}/questions/${question.id}/edit`);
    },
    [examId, router]
  );

  const handleUpdatePoints = useCallback(
    (question: ExamQuestion, points: number) => {
      if (!examId) return;
      const cap = wouldExceedExamMaxScore(
        examForPoints,
        questions,
        defaultPoints,
        points,
        question.id
      );
      if (cap.exceeds) {
        rejectPointsOverflow(
          `مجموع بارم (${cap.projectedTotal}) نمی‌تواند از حداکثر نمره آزمون (${cap.maxScore}) بیشتر باشد.`
        );
        return;
      }
      updateQuestionMutation.mutate(
        {
          examId,
          questionId: question.id,
          data: {
            payload: {
              ...question.payload,
              order: question.payload?.order ?? question.order,
              points,
            },
          },
        },
        {
          onSuccess: () => {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === question.id
                  ? { ...q, payload: { ...q.payload, points } }
                  : q
              )
            );
            setSnackbar({
              open: true,
              message: 'بارم سوال با موفقیت به‌روزرسانی شد',
              severity: 'success',
            });
          },
          onError: (error) => {
            handleError(error, { context: 'Update Question Points' });
            setSnackbar({
              open: true,
              message: getErrorMessage(error, 'خطا در به‌روزرسانی بارم'),
              severity: 'error',
            });
          },
        }
      );
    },
    [examId, updateQuestionMutation, examForPoints, questions, defaultPoints, rejectPointsOverflow]
  );

  const confirmDeleteQuestion = useCallback(() => {
    if (!examId || !questionToDelete) return;
    
    deleteQuestionMutation.mutate(
      { examId, questionId: questionToDelete.id },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: 'سوال با موفقیت حذف شد',
            severity: 'success',
          });
          setDeleteDialogOpen(false);
          setQuestionToDelete(null);
        },
        onError: (error) => {
          handleError(error, { context: 'Delete Question' });
          setSnackbar({
            open: true,
            message: getErrorMessage(error, 'خطا در حذف سوال'),
            severity: 'error',
          });
        },
      }
    );
  }, [examId, questionToDelete, deleteQuestionMutation]);

  const totalPoints = useMemo(
    () =>
      questions.reduce(
        (sum, q) => sum + ((q.payload?.points as number) ?? defaultPoints),
        0
      ),
    [questions, defaultPoints]
  );

  const difficultyStats = useMemo(() => {
    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    questions.forEach((q) => {
      const d = (q.payload?.difficulty as string) || (q.question as { difficulty?: string })?.difficulty || 'medium';
      if (d === 'easy') byDifficulty.easy += 1;
      else if (d === 'hard') byDifficulty.hard += 1;
      else byDifficulty.medium += 1;
    });
    return byDifficulty;
  }, [questions]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !examWithQuestions) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load exam questions.'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/exams/${examId}`)}
          sx={{ mt: 2 }}
        >
          بازگشت به جزئیات آزمون
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Breadcrumb items={[
          { label: 'مدیریت آزمون‌ها', href: '/exams' },
          { label: examWithQuestions.title, href: `/exams/${examId}` },
          { label: 'مدیریت سوالات' }
        ]} />

        <ExamQuestionsToolbar
          title={examWithQuestions.title}
          questionCount={questions.length}
          totalPoints={totalPoints}
          maxScore={examMaxScore}
          onBack={() => router.push(`/exams/${examId}`)}
        />

        {examMaxScore != null && totalPoints > examMaxScore && (
          <Alert severity="warning">
            مجموع بارم سوالات ({totalPoints}) از حداکثر نمره آزمون ({examMaxScore}) بیشتر است. بارم
            سوالات را کاهش دهید.
          </Alert>
        )}

        {/* Exam questions list (top) */}
        <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      سوالات آزمون
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {questions.length} سوال • مجموع بارم: {totalPoints}
                      {examMaxScore != null ? ` / ${examMaxScore}` : ''}
                      {' • '}
                      آسان: {difficultyStats.easy}، متوسط: {difficultyStats.medium}، سخت: {difficultyStats.hard}
                      {' • '}
                      برای تغییر ترتیب، سوالات را بکشید و رها کنید
                    </Typography>
                  </Box>

                  {questions.length === 0 ? (
                    <Box textAlign="center" py={6}>
                      <QuestionAnswerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        هنوز سوالی اضافه نشده است
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        از بخش «افزودن سوال از بانک» در پایین صفحه، سوالات را به آزمون اضافه کنید
                      </Typography>
                    </Box>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={questions.map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {questions.map((question, index) => (
                          <SortableQuestionItem
                            key={question.id}
                            question={question}
                            index={index}
                            defaultPoints={defaultPoints}
                            examMaxScore={examMaxScore}
                            maxPointsAllowed={maxPointsAllowedForQuestion(
                              examForPoints,
                              questions,
                              defaultPoints,
                              question.id
                            )}
                            onDelete={handleDeleteQuestion}
                            onUpdatePoints={handleUpdatePoints}
                            onPointsRejected={rejectPointsOverflow}
                            onEdit={handleEditQuestion}
                            isDeleting={deleteQuestionMutation.isPending}
                            isUpdating={updateQuestionMutation.isPending}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}

                  {questions.length > 0 && (
                    <>
                      {(addQuestionMutation.isError || updateQuestionMutation.isError || deleteQuestionMutation.isError) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {addQuestionMutation.error instanceof Error && addQuestionMutation.error.message}
                          {updateQuestionMutation.error instanceof Error && updateQuestionMutation.error.message}
                          {deleteQuestionMutation.error instanceof Error && deleteQuestionMutation.error.message}
                          {!addQuestionMutation.error && !updateQuestionMutation.error && !deleteQuestionMutation.error && 'خطایی رخ داد. لطفا دوباره تلاش کنید.'}
                        </Alert>
                      )}

                      <Alert severity="info" icon={<DragHandleIcon />}>
                        برای تغییر ترتیب سوالات، روی آیکون دستگیره کلیک کرده و سوال را به موقعیت مورد نظر بکشید
                      </Alert>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

        {/* Question bank (below exam list) */}
        <ExamQuestionBankPane
          examId={examId ?? undefined}
          defaultPoints={defaultPoints}
          onAddQuestion={handleAddQuestion}
        />
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setQuestionToDelete(null);
        }}
        PaperProps={{
          elevation: 8,
        }}
      >
        <DialogTitle>حذف سوال</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف این سوال اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </DialogContentText>
          {questionToDelete && (() => {
            const plain = htmlToPlainText(getQuestionText(questionToDelete));
            return (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  متن سوال:
                </Typography>
                <Typography variant="body1">
                  {plain.substring(0, 200)}
                  {plain.length > 200 ? '...' : ''}
                </Typography>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setQuestionToDelete(null);
            }}
            disabled={deleteQuestionMutation.isPending}
          >
            انصراف
          </Button>
          <Button
            onClick={confirmDeleteQuestion}
            color="error"
            variant="contained"
            disabled={deleteQuestionMutation.isPending}
            startIcon={deleteQuestionMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {deleteQuestionMutation.isPending ? 'در حال حذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default function ExamQuestionsPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      }
    >
      <ExamQuestionsContent />
    </Suspense>
  );
}

