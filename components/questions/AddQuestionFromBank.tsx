"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { questionTypeBorderSx } from '@/lib/question-types/type-appearance';
import { QuestionTypeChip } from '@/components/questions/QuestionTypeChip';
import { useQuestions, useQuestionCategories } from '@/hooks';
import { Question, ExamQuestion, Difficulty, PaginatedResponse } from '@/types';
import { RichLabel } from '@/components/editor';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface AddQuestionFromBankProps {
  onAddQuestion: (question: ExamQuestion) => void;
}

export default function AddQuestionFromBank({ onAddQuestion }: AddQuestionFromBankProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');

  // Fetch questions from the question bank
  const { data: questionsData, isLoading: questionsLoading } = useQuestions({
    search: searchTerm || undefined,
    category_id: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    per_page: 20,
  });

  // Fetch categories
  const { data: categoriesData } = useQuestionCategories();

  const handleAddFromBank = (question: Question) => {
    const examQuestion: ExamQuestion = {
      id: Date.now(), // Temporary ID
      exam_id: 0, // Will be set when exam is created
      question_id: question.id,
      question: question,
      order: 0, // Will be set by parent component
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onAddQuestion(examQuestion);
    setOpen(false);
    // Reset filters
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
  };

  // Handle paginated response structure
  // useQuestions returns PaginatedResponse<Question> which is { data: Question[], meta: {...} }
  const questions: Question[] = (questionsData as PaginatedResponse<Question>)?.data || [];
  const categories = categoriesData || [];


  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        fullWidth
      >
        افزودن از بانک سوالات
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          elevation: 8,
        }}
      >
        <DialogTitle>افزودن سوال از بانک</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Search and Filter */}
            <Box>
              <TextField
                fullWidth
                label="جستجوی سوالات"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>دسته‌بندی</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as number | '')}
                  label="دسته‌بندی"
                >
                  <MenuItem value="">همه دسته‌بندی‌ها</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>سطح دشواری</InputLabel>
                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | '')}
                  label="سطح دشواری"
                >
                  <MenuItem value="">همه سطوح</MenuItem>
                  <MenuItem value="easy">آسان</MenuItem>
                  <MenuItem value="medium">متوسط</MenuItem>
                  <MenuItem value="hard">سخت</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Question Bank Results */}
            {questionsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  بانک سوالات ({questions.length} سوال)
                </Typography>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                  {questions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      سوالی یافت نشد
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {questions.map((question: any) => {
                      // Handle different response structures from backend
                      // Backend may return question with different field names
                      const questionText = question.text || question.question_text || question.title || 'بدون متن';
                      const questionOptions = question.options || [];
                      const questionType = question.type || 'multiple_choice';
                      const questionDifficulty = question.difficulty || 'medium';
                      const questionCategory = question.category || null;
                      
                      const displayOptions =
                        Array.isArray(questionOptions) && questionOptions.length > 0
                          ? questionOptions.map(
                              (opt: { id: string; text: string } | string, index: number) => {
                                const id =
                                  typeof opt === 'object' &&
                                  opt !== null &&
                                  'id' in opt
                                    ? String(opt.id)
                                    : `opt-${index}`;
                                const text =
                                  typeof opt === 'string'
                                    ? opt
                                    : String(opt.text ?? '');
                                const correctAnswer = question.correct_answer;
                                const isCorrect =
                                  questionType === 'multiple_select' &&
                                  Array.isArray(correctAnswer)
                                    ? correctAnswer.includes(id)
                                    : correctAnswer === id;
                                return { id, text, is_correct: isCorrect };
                              }
                            )
                          : [];


                      return (
                        <Card
                          key={question.id}
                          variant="outlined"
                          sx={(t) => questionTypeBorderSx(t, questionType)}
                        >
                          <CardContent>
                            <RichLabel html={String(questionText)} fontSize="1rem" sx={{ mb: 1 }} />
                            
                            {/* Display options if available */}
                            {displayOptions.length > 0 && questionType !== 'essay' && (
                              <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  گزینه‌ها:
                                </Typography>
                                <Stack spacing={0.5}>
                                  {displayOptions.map((opt: { text: string; is_correct: boolean }, idx: number) => (
                                    <Stack direction="row" spacing={0.5} alignItems="flex-start" key={idx}>
                                      <Typography
                                        variant="body2"
                                        component="span"
                                        sx={{
                                          flexShrink: 0,
                                          color: opt.is_correct ? 'success.main' : 'text.secondary',
                                          fontWeight: opt.is_correct ? 'bold' : 'normal',
                                        }}
                                      >
                                        {String.fromCharCode(65 + idx)}.
                                      </Typography>
                                      <RichLabel
                                        html={opt.text}
                                        fontSize="0.875rem"
                                        block={false}
                                        sx={{
                                          color: opt.is_correct ? 'success.main' : 'text.secondary',
                                          fontWeight: opt.is_correct ? 'bold' : 'normal',
                                          flex: 1,
                                          minWidth: 0,
                                        }}
                                      />
                                      {opt.is_correct && (
                                        <Typography component="span" variant="body2" color="success.main">
                                          ✓
                                        </Typography>
                                      )}
                                    </Stack>
                                  ))}
                                </Stack>
                              </Box>
                            )}

                            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                              <Chip 
                                label={questionDifficulty === 'easy' ? 'آسان' : questionDifficulty === 'medium' ? 'متوسط' : 'سخت'} 
                                size="small" 
                                color={questionDifficulty === 'easy' ? 'success' : questionDifficulty === 'medium' ? 'warning' : 'error'}
                              />
                              {questionCategory?.name && (
                                <Chip label={questionCategory.name} size="small" variant="outlined" />
                              )}
                              <QuestionTypeChip type={questionType} />
                            </Stack>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAddFromBank(question)}
                              fullWidth
                            >
                              افزودن به آزمون
                            </Button>
                          </CardContent>
                        </Card>
                      );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

