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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import { useExam, useUpdateExamQuestion, useDeleteExamQuestion } from '@/hooks/useExams';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import Breadcrumb from '@/components/Breadcrumb';
import { ExamQuestionsToolbar } from '@/components/exams/exam-questions/ExamQuestionsToolbar';
import CreateCustomQuestion from '@/components/questions/CreateCustomQuestion';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { QuestionBankItemDisplay } from '@/components/questions/QuestionBankItemDisplay';
import { QuestionBankViewToggle } from '@/components/questions/QuestionBankViewToggle';
import { useExamQuestionsViewMode } from '@/hooks/useQuestionBankViewMode';
import type { QuestionBankViewMode } from '@/lib/question-bank-view';
import { htmlToPlainText } from '@/components/editor';
import { ExamQuestion, Question } from '@/types';
import { getQuestionTypeLabel } from '@/lib/question-types/registry';
import {
  hasCustomPrintSettings,
  type QuestionPrintSettings,
} from '@/lib/question-types/print-settings';
import QuestionPrintSettingsDrawer from '@/components/questions/QuestionPrintSettingsDrawer';
import { supportsQuestionPrintSettings } from '@/components/questions/QuestionPrintSettingsPanel';
import {
  getQuestionText,
  getQuestionType,
  sortQuestionsByOrder,
} from '@/lib/question-utils';
import { handleError, getErrorMessage } from '@/lib/error-handler';
import { useToast } from '@/hooks/useToast';
import {
  getDefaultQuestionPoints,
  getExamMaxScore,
  maxPointsAllowedForQuestion,
  wouldExceedExamMaxScore,
  type ExamWithGrading,
} from '@/lib/exam-points';

interface SortableQuestionItemProps {
  question: ExamQuestion;
  index: number;
  viewMode: QuestionBankViewMode;
  defaultPoints: number;
  maxPointsAllowed: number;
  examMaxScore: number | null;
  onDelete: (questionId: number) => void;
  onUpdatePoints: (question: ExamQuestion, points: number) => void;
  onPointsRejected: (message: string) => void;
  onEdit: (question: ExamQuestion) => void;
  onPrintSettings?: (question: ExamQuestion) => void;
  showPrintSettings?: boolean;
  hasCustomPrint?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  showMobileReorder?: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
}

const SortableQuestionItem = memo(function SortableQuestionItem({
  question,
  index,
  viewMode,
  defaultPoints,
  maxPointsAllowed,
  examMaxScore,
  onDelete,
  onUpdatePoints,
  onPointsRejected,
  onEdit,
  onPrintSettings,
  showPrintSettings = false,
  hasCustomPrint = false,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  showMobileReorder,
  isDeleting,
  isUpdating,
}: SortableQuestionItemProps) {
  const points = (question.payload?.points as number) ?? defaultPoints;
  const [pointsValue, setPointsValue] = useState<string>(String(points));

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

  const questionType = getQuestionType(question);
  const displaySource = (question.payload ?? question.question ?? {}) as Record<string, unknown>;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        mb: { xs: 1, sm: 2 },
        border: isDragging ? '2px dashed' : '1px solid',
        borderColor: isDragging ? 'primary.main' : 'divider',
        backgroundColor: isDragging ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent sx={{ p: { xs: 1.25, sm: 2 }, '&:last-child': { pb: { xs: 1.25, sm: 2 } } }}>
        <Stack spacing={{ xs: 1, sm: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={0.5}>
            <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
              <Stack spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
                {showMobileReorder && (
                  <Stack spacing={0}>
                    <Tooltip title="انتقال به بالا">
                      <span>
                        <IconButton
                          size="small"
                          onClick={onMoveUp}
                          disabled={!canMoveUp || isUpdating}
                          aria-label="انتقال به بالا"
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="انتقال به پایین">
                      <span>
                        <IconButton
                          size="small"
                          onClick={onMoveDown}
                          disabled={!canMoveDown || isUpdating}
                          aria-label="انتقال به پایین"
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                )}
                <Box
                  {...attributes}
                  {...listeners}
                  sx={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    p: 0.25,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  <DragHandleIcon fontSize="small" />
                </Box>
              </Stack>
              <Box sx={{ flex: 1 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      mb: 0.5,
                      gap: 0.5,
                      flexWrap: 'wrap',
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
                  {hasCustomPrint && (
                    <Chip label="چاپ سفارشی" size="small" color="warning" variant="outlined" />
                  )}
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
                <Box sx={{ mt: 0.5 }}>
                  {viewMode === "student" && (
                    <Chip
                      label="نمای دانش‌آموز"
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ mb: 1, height: 22, fontSize: "0.7rem" }}
                    />
                  )}
                  <QuestionBankItemDisplay
                    source={displaySource}
                    viewMode={viewMode}
                    compact
                    suppressStemMeta
                  />
                </Box>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              {showPrintSettings && onPrintSettings && supportsQuestionPrintSettings(questionType) && (
                <Tooltip title="تنظیمات چاپ">
                  <span>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onPrintSettings(question)}
                      disabled={isUpdating}
                      aria-label="تنظیمات چاپ"
                    >
                      <PrintIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
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

        </Stack>
      </CardContent>
    </Card>
  );
});

function ExamQuestionsContent() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const examId = params?.id ? parseInt(params.id as string) : null;
  const { viewMode, setViewMode, hydrated } = useExamQuestionsViewMode();

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<ExamQuestion | null>(null);
  const [printSettingsQuestion, setPrintSettingsQuestion] = useState<ExamQuestion | null>(null);
  const [printDrawerOpen, setPrintDrawerOpen] = useState(false);
  const toast = useToast();
  const dragUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: examWithQuestions, isLoading, error } = useExam(examId);
  const updateQuestionMutation = useUpdateExamQuestion();
  const deleteQuestionMutation = useDeleteExamQuestion();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const persistReorder = useCallback(
    (oldIndex: number, newIndex: number, newQuestions: ExamQuestion[]) => {
      if (!examId || oldIndex === newIndex) return;

      if (dragUpdateTimeoutRef.current) {
        clearTimeout(dragUpdateTimeoutRef.current);
      }

      dragUpdateTimeoutRef.current = setTimeout(() => {
        const startIndex = Math.min(oldIndex, newIndex);
        const endIndex = Math.max(oldIndex, newIndex);

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
                    toast.success('ترتیب سوالات با موفقیت به‌روزرسانی شد');
                  }
                },
                onError: (error) => {
                  if (!hasError) {
                    hasError = true;
                    handleError(error, { context: 'Update Question Order' });
                    toast.error('خطا در به‌روزرسانی ترتیب سوالات');
                  }
                },
              }
            );
          });
        }
      }, 500);
    },
    [examId, updateQuestionMutation]
  );

  const applyReorder = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(newQuestions);
      persistReorder(oldIndex, newIndex, newQuestions);
    },
    [questions, persistReorder]
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

    if (oldIndex !== -1 && newIndex !== -1) {
      applyReorder(oldIndex, newIndex);
    }
  }, [questions, examId, applyReorder]);

  const handleMoveQuestion = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= questions.length) return;
      applyReorder(index, newIndex);
    },
    [questions.length, applyReorder]
  );

  const examForPoints = examWithQuestions as ExamWithGrading | undefined;
  const isOfflineExam = examWithQuestions?.type === 'offline';
  const defaultPoints = getDefaultQuestionPoints(examForPoints);
  const examMaxScore = getExamMaxScore(examForPoints);

  const rejectPointsOverflow = useCallback(
    (message: string) => {
      toast.error(message);
    },
    [toast]
  );

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

  const handleOpenPrintSettings = useCallback((question: ExamQuestion) => {
    setPrintSettingsQuestion(question);
    setPrintDrawerOpen(true);
  }, []);

  const handleSavePrintSettings = useCallback(
    async (settings: QuestionPrintSettings) => {
      if (!examId || !printSettingsQuestion) return;
      const payload = {
        ...(printSettingsQuestion.payload ?? {}),
        print_settings: settings,
      };
      await updateQuestionMutation.mutateAsync({
        examId,
        questionId: printSettingsQuestion.id,
        data: { payload },
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === printSettingsQuestion.id ? { ...q, payload } : q
        )
      );
      toast.success('تنظیمات چاپ ذخیره شد');
    },
    [examId, printSettingsQuestion, updateQuestionMutation, toast]
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
            toast.success('بارم سوال با موفقیت به‌روزرسانی شد');
          },
          onError: (error) => {
            handleError(error, { context: 'Update Question Points' });
            toast.error(getErrorMessage(error, 'خطا در به‌روزرسانی بارم'));
          },
        }
      );
    },
    [examId, updateQuestionMutation, examForPoints, questions, defaultPoints, rejectPointsOverflow, toast]
  );

  const confirmDeleteQuestion = useCallback(() => {
    if (!examId || !questionToDelete) return;
    
    deleteQuestionMutation.mutate(
      { examId, questionId: questionToDelete.id },
      {
        onSuccess: () => {
          toast.success('سوال با موفقیت حذف شد');
          setDeleteDialogOpen(false);
          setQuestionToDelete(null);
        },
        onError: (error) => {
          handleError(error, { context: 'Delete Question' });
          toast.error(getErrorMessage(error, 'خطا در حذف سوال'));
        },
      }
    );
  }, [examId, questionToDelete, deleteQuestionMutation, toast]);

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
    <Container maxWidth="xl" sx={{ py: { xs: 1.5, md: 4 }, px: { xs: 1.5, sm: 3 } }}>
      <Stack spacing={{ xs: 2, md: 4 }}>
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
          viewModeToggle={
            hydrated ? (
              <QuestionBankViewToggle value={viewMode} onChange={setViewMode} />
            ) : undefined
          }
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LibraryBooksIcon />}
            onClick={() => router.push(`/exams/${examId}/questions/from-bank`)}
            sx={{ fontWeight: 700 }}
          >
            انتخاب از بانک سوالات
          </Button>
          <CreateCustomQuestion examId={examId ?? undefined} />
        </Stack>

        {examMaxScore != null && totalPoints > examMaxScore && (
          <Alert severity="warning">
            مجموع بارم سوالات ({totalPoints}) از حداکثر نمره آزمون ({examMaxScore}) بیشتر است. بارم
            سوالات را کاهش دهید.
          </Alert>
        )}

        {/* Exam questions list (top) */}
        <Card variant="outlined" sx={{ overflow: 'visible' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 3 } } }}>
                <Stack spacing={{ xs: 1.5, sm: 3 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      سوالات آزمون
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {questions.length} سوال • مجموع بارم: {totalPoints}
                      {examMaxScore != null ? ` / ${examMaxScore}` : ''}
                      {' • '}
                      آسان: {difficultyStats.easy}، متوسط: {difficultyStats.medium}، سخت: {difficultyStats.hard}
                      {!isMobile && ' • برای تغییر ترتیب، سوالات را بکشید و رها کنید'}
                    </Typography>
                  </Box>

                  {questions.length === 0 ? (
                    <Box textAlign="center" py={6}>
                      <QuestionAnswerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        هنوز سوالی اضافه نشده است
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        با دکمه «انتخاب از بانک سوالات» سوالات را به آزمون اضافه کنید
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<LibraryBooksIcon />}
                        onClick={() => router.push(`/exams/${examId}/questions/from-bank`)}
                      >
                        انتخاب از بانک سوالات
                      </Button>
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
                            viewMode={viewMode}
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
                            onPrintSettings={handleOpenPrintSettings}
                            showPrintSettings={isOfflineExam}
                            hasCustomPrint={hasCustomPrintSettings(question.payload ?? {})}
                            onMoveUp={() => handleMoveQuestion(index, 'up')}
                            onMoveDown={() => handleMoveQuestion(index, 'down')}
                            canMoveUp={index > 0}
                            canMoveDown={index < questions.length - 1}
                            showMobileReorder={isMobile}
                            isDeleting={deleteQuestionMutation.isPending}
                            isUpdating={updateQuestionMutation.isPending}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}

                  {questions.length > 0 && (
                    <>
                      {(updateQuestionMutation.isError || deleteQuestionMutation.isError) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {updateQuestionMutation.error instanceof Error && updateQuestionMutation.error.message}
                          {deleteQuestionMutation.error instanceof Error && deleteQuestionMutation.error.message}
                          {!updateQuestionMutation.error && !deleteQuestionMutation.error && 'خطایی رخ داد. لطفا دوباره تلاش کنید.'}
                        </Alert>
                      )}

                      <Alert severity="info" icon={<DragHandleIcon />} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        برای تغییر ترتیب سوالات، روی آیکون دستگیره کلیک کرده و سوال را به موقعیت مورد نظر بکشید
                      </Alert>
                      {isMobile && (
                        <Alert severity="info" sx={{ py: 0.75 }}>
                          برای تغییر ترتیب از دکمه‌های بالا/پایین یا دستگیره استفاده کنید
                        </Alert>
                      )}
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

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

      {printSettingsQuestion && (
        <QuestionPrintSettingsDrawer
          open={printDrawerOpen}
          onClose={() => {
            setPrintDrawerOpen(false);
            setPrintSettingsQuestion(null);
          }}
          title={`تنظیمات چاپ — سوال ${printSettingsQuestion.payload?.order ?? ""}`}
          questionType={getQuestionType(printSettingsQuestion)}
          initialSettings={printSettingsQuestion.payload?.print_settings as QuestionPrintSettings | undefined}
          blankCount={
            Array.isArray(printSettingsQuestion.payload?.blanks)
              ? (printSettingsQuestion.payload?.blanks as unknown[]).length
              : undefined
          }
          saving={updateQuestionMutation.isPending}
          onSave={handleSavePrintSettings}
        />
      )}
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

