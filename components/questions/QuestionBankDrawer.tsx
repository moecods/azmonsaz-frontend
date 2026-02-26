"use client";

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { getQuestionTypeLabel, getQuestionTypeKind } from '@/lib/question-types';
import { useQuestions, useQuestionCategories } from '@/hooks';
import { Question, ExamQuestion, Difficulty, PaginatedResponse } from '@/types';

function optionText(opt: string | { text?: string }): string {
  return typeof opt === 'string' ? opt : (opt?.text ?? '');
}

interface QuestionBankDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddQuestion: (question: ExamQuestion) => void;
  defaultPoints?: number;
  /** Optional: search term and filters controlled by parent */
  initialSearch?: string;
  initialCategory?: number | '';
  initialDifficulty?: Difficulty | '';
}

export default function QuestionBankDrawer({
  open,
  onClose,
  onAddQuestion,
  defaultPoints = 10,
  initialSearch = '',
  initialCategory = '',
  initialDifficulty = '',
}: QuestionBankDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>(initialDifficulty);

  const { data: questionsData, isLoading: questionsLoading } = useQuestions({
    search: searchTerm || undefined,
    category_id: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    per_page: 50,
  });

  const { data: categoriesData } = useQuestionCategories();

  const questions: Question[] = (questionsData as PaginatedResponse<Question>)?.data ?? [];
  const categories = categoriesData ?? [];

  const stats = useMemo(() => {
    const total = questions.length;
    const totalPoints = total * defaultPoints;
    return { total, totalPoints };
  }, [questions, defaultPoints]);

  const handleAddFromBank = (question: Question) => {
    const examQuestion: ExamQuestion = {
      id: Date.now(),
      exam_id: 0,
      question_id: question.id,
      question,
      order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onAddQuestion(examQuestion);
    onClose();
  };

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 420,
          maxWidth: '100%',
          maxHeight: isMobile ? '92vh' : '100%',
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography variant="h6">بانک سوالات</Typography>
          <IconButton onClick={onClose} size="small" aria-label="بستن">
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Stats (bank list) */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`تعداد: ${stats.total}`} size="small" color="primary" variant="outlined" />
            <Chip
              label={`مجموع بارم (اگر همه اضافه شوند): ${stats.totalPoints}`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Search & Filters */}
        <Stack spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            label="جستجوی سوالات"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
            }}
          />
          <Stack direction="row" spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>دسته‌بندی</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as number | '')}
                label="دسته‌بندی"
              >
                <MenuItem value="">همه</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>سطح سختی</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | '')}
                label="سطح سختی"
              >
                <MenuItem value="">همه</MenuItem>
                <MenuItem value="easy">آسان</MenuItem>
                <MenuItem value="medium">متوسط</MenuItem>
                <MenuItem value="hard">سخت</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* List */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {questionsLoading ? (
            <Stack alignItems="center" justifyContent="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : questions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
              سوالی یافت نشد
            </Typography>
          ) : (
            <Stack spacing={2}>
              {questions.map((question) => {
                const q = question as unknown as Record<string, unknown>;
                const questionText = question.text || (q.question_text as string) || (q.title as string) || 'بدون متن';
                const questionType = question.type || 'multiple_choice';
                const kind = getQuestionTypeKind(questionType);
                const questionDifficulty = (question.difficulty || 'medium') as Difficulty;
                const questionCategory = question.category ?? (q.category as { name?: string } | undefined);
                const optionsArr = question.options ?? [];
                const options = Array.isArray(optionsArr) ? optionsArr : [];
                const correctAnswer = question.correct_answer ?? null;

                const isCorrectOption = (index: number): boolean => {
                  if (questionType === 'multiple_select' && Array.isArray(correctAnswer)) return correctAnswer.includes(index);
                  if (questionType === 'true_false' || questionType === 'multiple_choice') return correctAnswer === index || (Array.isArray(correctAnswer) && correctAnswer.includes(index));
                  return false;
                };

                return (
                  <Card key={question.id} variant="outlined" sx={{ overflow: 'visible' }}>
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'pre-wrap', mb: 1.5 }}>
                        {questionText}
                      </Typography>

                      {(kind === 'options_single' || kind === 'options_multiple' || questionType === 'true_false') && options.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>گزینه‌ها:</Typography>
                          <Stack spacing={0.75}>
                            {options.map((opt: string | { text?: string }, idx: number) => (
                              <Box
                                key={idx}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: isCorrectOption(idx) ? 'success.light' : 'action.hover',
                                  border: isCorrectOption(idx) ? '1px solid' : '1px solid transparent',
                                  borderColor: 'success.main',
                                }}
                              >
                                <Typography component="span" sx={{ fontWeight: 600, minWidth: 20 }}>{String.fromCharCode(65 + idx)}.</Typography>
                                <Typography variant="body2" sx={{ flex: 1, fontWeight: isCorrectOption(idx) ? 600 : 400 }}>
                                  {optionText(opt)}
                                </Typography>
                                {isCorrectOption(idx) && <Chip label="پاسخ صحیح" color="success" size="small" />}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {kind === 'text' && questionType === 'short_answer' && correctAnswer != null && String(correctAnswer).trim() !== '' && (
                        <Box sx={{ mb: 1.5, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">پاسخ صحیح:</Typography>
                          <Typography variant="body2" fontWeight={500}>{String(correctAnswer)}</Typography>
                        </Box>
                      )}

                      {kind === 'text' && questionType === 'essay' && (
                        <Typography variant="caption" color="text.secondary">سوال تشریحی — تصحیح دستی</Typography>
                      )}

                      {kind === 'ordering' && Array.isArray((q.items as unknown[])) && (q.items as unknown[]).length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>ترتیب صحیح:</Typography>
                          <Stack spacing={0.5}>
                            {((q.correct_order as number[]) ?? []).map((orderIdx: number, i: number) => {
                              const items = (q.items as Array<string | { text?: string }>) ?? [];
                              const item = items[orderIdx];
                              return (
                                <Typography key={i} variant="body2" sx={{ display: 'flex', gap: 1 }}>
                                  <span>{i + 1}.</span>
                                  <span>{item != null ? optionText(item as string | { text?: string }) : `مورد ${orderIdx + 1}`}</span>
                                </Typography>
                              );
                            })}
                          </Stack>
                        </Box>
                      )}

                      {kind === 'matching' && Array.isArray(q.left_items) && Array.isArray(q.right_items) && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>تطبیق صحیح:</Typography>
                          <Stack spacing={0.5}>
                            {((q.matches as { left_index: number; right_index: number }[]) ?? (q.left_items as unknown[]).map((_: unknown, i: number) => ({ left_index: i, right_index: 0 }))).map((m, i) => {
                              const leftItems = (q.left_items as Array<string | { text?: string }>) ?? [];
                              const rightItems = (q.right_items as Array<string | { text?: string }>) ?? [];
                              return (
                                <Typography key={i} variant="body2">
                                  {optionText(leftItems[m.left_index] ?? '')} ← {optionText(rightItems[m.right_index] ?? '')}
                                </Typography>
                              );
                            })}
                          </Stack>
                        </Box>
                      )}

                      {kind === 'blanks' && Array.isArray(q.blanks) && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>پاسخ جای خالی‌ها:</Typography>
                          <Stack spacing={0.5}>
                            {((q.blanks as { position: number; correct_answer: string }[]) ?? []).map((b, i) => (
                              <Typography key={i} variant="body2">{i + 1}. {b.correct_answer || '—'}</Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
                        <Chip
                          label={questionDifficulty === 'easy' ? 'آسان' : questionDifficulty === 'medium' ? 'متوسط' : 'سخت'}
                          size="small"
                          color={questionDifficulty === 'easy' ? 'success' : questionDifficulty === 'medium' ? 'warning' : 'error'}
                        />
                        {questionCategory?.name && (
                          <Chip label={questionCategory.name} size="small" variant="outlined" />
                        )}
                        <Chip label={getQuestionTypeLabel(questionType)} size="small" variant="outlined" />
                        <Chip label={`بارم: ${defaultPoints}`} size="small" variant="outlined" />
                      </Stack>
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => handleAddFromBank(question)}
                        sx={{ mt: 1.5 }}
                      >
                        افزودن به آزمون
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
