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
import { getQuestionTypeLabel } from '@/lib/question-types';
import { useQuestions, useQuestionCategories } from '@/hooks';
import { Question, ExamQuestion, Difficulty, PaginatedResponse } from '@/types';
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
                      
                      // Convert options to display format
                      // Backend stores options as string[] in database
                      // correct_answer can be:
                      // - number (index) for multiple_choice and true_false
                      // - number[] (array of indices) for multiple_select
                      // - null for essay
                      const displayOptions = Array.isArray(questionOptions) && questionOptions.length > 0
                        ? questionOptions.map((opt: string, index: number) => {
                            const optionText = typeof opt === 'string' ? opt : String(opt);
                            const correctAnswer = question.correct_answer;
                            let isCorrect = false;

                            // Determine if this option is correct based on question type
                            if (questionType === 'multiple_select') {
                              isCorrect = Array.isArray(correctAnswer) && correctAnswer.includes(index);
                            } else if (questionType === 'true_false' || questionType === 'multiple_choice') {
                              // For true_false: 0 = صحیح (first option), 1 = غلط (second option)
                              // For multiple_choice: index of correct option
                              isCorrect = correctAnswer === index || (Array.isArray(correctAnswer) && correctAnswer.includes(index));
                            }

                            return { text: optionText, is_correct: isCorrect };
                          })
                        : [];


                      return (
                        <Card key={question.id} variant="outlined">
                          <CardContent>
                            <Typography variant="body1" gutterBottom>
                              {questionText}
                            </Typography>
                            
                            {/* Display options if available */}
                            {displayOptions.length > 0 && questionType !== 'essay' && (
                              <Box sx={{ mb: 2, pl: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  گزینه‌ها:
                                </Typography>
                                <Stack spacing={0.5}>
                                  {displayOptions.map((opt: any, idx: number) => (
                                    <Typography
                                      key={idx}
                                      variant="body2"
                                      sx={{
                                        color: opt.is_correct ? 'success.main' : 'text.secondary',
                                        fontWeight: opt.is_correct ? 'bold' : 'normal',
                                      }}
                                    >
                                      {String.fromCharCode(65 + idx)}. {typeof opt === 'string' ? opt : opt.text}
                                      {opt.is_correct && ' ✓'}
                                    </Typography>
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
                              <Chip 
                                label={getQuestionTypeLabel(questionType)} 
                                size="small" 
                                variant="outlined"
                              />
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

