"use client";

import { useState, Suspense, useEffect, useCallback, useRef } from 'react';
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
  Drawer,
  useMediaQuery,
  useTheme,
  Divider,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
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
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import Breadcrumb from '@/components/Breadcrumb';
import AddQuestionFromBank from '@/components/questions/AddQuestionFromBank';
import CreateCustomQuestion from '@/components/questions/CreateCustomQuestion';
import { ExamQuestion } from '@/types';
import {
  getQuestionText,
  getQuestionOptions,
  getQuestionType,
  buildBankQuestionPayload,
  buildCustomQuestionPayload,
  QUESTION_TYPE_LABELS,
  sortQuestionsByOrder,
} from '@/lib/question-utils';

interface SortableQuestionItemProps {
  question: ExamQuestion;
  index: number;
  onDelete: (questionId: number) => void;
  isDeleting: boolean;
}

function SortableQuestionItem({ question, index, onDelete, isDeleting }: SortableQuestionItemProps) {
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
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label={`سوال ${index + 1}`}
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
                    label={QUESTION_TYPE_LABELS[questionType] || questionType}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body1" fontWeight="medium">
                  {questionText}
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="حذف سوال">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(question.id)}
                disabled={isDeleting}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {options.length > 0 && (
            <Box sx={{ pl: 4 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                گزینه‌ها:
              </Typography>
              <Stack spacing={0.5}>
                {options.map((option: any, optionIndex: number) => (
                  <Stack
                    key={optionIndex}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Typography variant="body2" sx={{ minWidth: 24, fontWeight: 'medium' }}>
                      {String.fromCharCode(65 + optionIndex)}.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        fontWeight: option.is_correct ? 'bold' : 'normal',
                        color: option.is_correct ? 'success.main' : 'text.primary',
                      }}
                    >
                      {typeof option === 'string' ? option : option.text}
                    </Typography>
                    {option.is_correct && (
                      <Chip label="صحیح" size="small" color="success" />
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ExamQuestionsContent() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const examId = params?.id ? parseInt(params.id as string) : null;

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
      const examQuestionsData = (examWithQuestions as any).exam_questions || (examWithQuestions as any).questions || [];
      
      if (Array.isArray(examQuestionsData) && examQuestionsData.length > 0) {
        // Map exam_questions to ExamQuestion format
        const mappedQuestions: ExamQuestion[] = examQuestionsData.map((eq: any) => ({
          id: eq.id,
          exam_id: examId || 0,
          question_id: eq.question_id || null,
          payload: eq.payload || {},
          order: eq.payload?.order || eq.id,
          created_at: eq.created_at || new Date().toISOString(),
          updated_at: eq.updated_at || new Date().toISOString(),
          // If question_id exists, we might need to load the question object
          // For now, we'll use payload for display
          question: eq.question || null,
        }));
        
        const sorted = sortQuestionsByOrder(mappedQuestions);
        setQuestions(sorted);
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
                    console.error('Failed to update question order:', error);
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

  const handleAddQuestion = useCallback((question: ExamQuestion) => {
    if (!examId) return;
    
    const nextOrder = questions.length + 1;
    
    if (question.question_id) {
      const payload = buildBankQuestionPayload(nextOrder);
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
            console.error('Failed to add question from bank:', error);
            setSnackbar({
              open: true,
              message: error instanceof Error ? error.message : 'خطا در افزودن سوال',
              severity: 'error',
            });
          },
        }
      );
    } else {
      const payload = buildCustomQuestionPayload(question, nextOrder);
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
            console.error('Failed to add custom question:', error);
            setSnackbar({
              open: true,
              message: error instanceof Error ? error.message : 'خطا در افزودن سوال سفارشی',
              severity: 'error',
            });
          },
        }
      );
    }
    setMobileDrawerOpen(false);
  }, [examId, questions.length, addQuestionMutation]);

  const handleDeleteQuestion = useCallback((questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      setQuestionToDelete(question);
      setDeleteDialogOpen(true);
    }
  }, [questions]);

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
          console.error('Failed to delete question:', error);
          setSnackbar({
            open: true,
            message: error instanceof Error ? error.message : 'خطا در حذف سوال',
            severity: 'error',
          });
        },
      }
    );
  }, [examId, questionToDelete, deleteQuestionMutation]);

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

  const questionBankSidebar = (
    <Paper
      sx={{
        p: 3,
        height: 'fit-content',
        position: isMobile ? 'relative' : 'sticky',
        top: isMobile ? 0 : 24,
        maxHeight: isMobile ? 'none' : 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            افزودن سوال
          </Typography>
          <Typography variant="body2" color="text.secondary">
            سوالات را از بانک سوالات انتخاب کنید یا سوال جدید ایجاد کنید
          </Typography>
        </Box>
        <Divider />
        <Stack spacing={2}>
          <AddQuestionFromBank onAddQuestion={handleAddQuestion} />
          <CreateCustomQuestion onAddQuestion={handleAddQuestion} />
        </Stack>
      </Stack>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Breadcrumb items={[
          { label: 'مدیریت آزمون‌ها', href: '/exams' },
          { label: examWithQuestions.title, href: `/exams/${examId}` },
          { label: 'مدیریت سوالات' }
        ]} />

        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/exams/${examId}`)}
              variant="outlined"
            >
              بازگشت
            </Button>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                مدیریت سوالات آزمون
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {examWithQuestions.title}
              </Typography>
            </Box>
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<MenuIcon />}
                onClick={() => setMobileDrawerOpen(true)}
              >
                افزودن سوال
              </Button>
            )}
          </Stack>
        </Box>

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            anchor="bottom"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            PaperProps={{
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '80vh',
              },
            }}
          >
            <Box sx={{ p: 3 }}>
              {questionBankSidebar}
            </Box>
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
            gap: 3,
          }}
        >
          {/* Sidebar - Desktop */}
          {!isMobile && questionBankSidebar}

          {/* Questions List */}
          <Box>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      سوالات آزمون
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {questions.length} سوال • برای تغییر ترتیب، سوالات را بکشید و رها کنید
                    </Typography>
                  </Box>

                  {questions.length === 0 ? (
                    <Box textAlign="center" py={6}>
                      <QuestionAnswerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        هنوز سوالی اضافه نشده است
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        از بخش افزودن سوال، سوالات را به آزمون اضافه کنید
                      </Typography>
                      {isMobile && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setMobileDrawerOpen(true)}
                        >
                          افزودن اولین سوال
                        </Button>
                      )}
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
                            onDelete={handleDeleteQuestion}
                            isDeleting={deleteQuestionMutation.isPending}
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
          </Box>
        </Box>
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
          {questionToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                متن سوال:
              </Typography>
              <Typography variant="body1">
                {getQuestionText(questionToDelete).substring(0, 200)}
                {getQuestionText(questionToDelete).length > 200 ? '...' : ''}
              </Typography>
            </Box>
          )}
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

