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
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, QuestionFormData } from '@/lib/validation';
import { useQuestions, useQuestionCategories } from '@/hooks';
import { Question, ExamQuestion, QuestionType, Difficulty } from '@/types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface QuestionSelectorProps {
  onAddQuestion: (question: ExamQuestion) => void;
}

export default function QuestionSelector({ onAddQuestion }: QuestionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      type: 'multiple_choice',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
      correct_answer: 0,
      category_id: 0,
      tags: [],
      difficulty: 'medium',
    },
  });

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
  };

  const handleCreateCustom = (data: QuestionFormData) => {
    const examQuestion: ExamQuestion = {
      id: Date.now(), // Temporary ID
      exam_id: 0, // Will be set when exam is created
      custom_text: data.text,
      custom_options: data.options,
      custom_correct_answer: data.correct_answer,
      order: 0, // Will be set by parent component
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onAddQuestion(examQuestion);
    setOpen(false);
    reset();
  };

  const questions = questionsData?.data || [];
  const categories = categoriesData || [];

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Add Questions</Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Add from Question Bank
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Create Custom Question
            </Button>
          </Stack>

          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add Question</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {/* Search and Filter */}
                <Box>
                  <TextField
                    fullWidth
                    label="Search questions"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as number | '')}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | '')}
                      label="Difficulty"
                    >
                      <MenuItem value="">All Difficulties</MenuItem>
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
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
                      Question Bank ({questions.length} questions)
                    </Typography>
                    <Stack spacing={2}>
                      {questions.map((question) => (
                        <Card key={question.id} variant="outlined">
                          <CardContent>
                            <Typography variant="body1" gutterBottom>
                              {question.text}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Chip label={question.difficulty} size="small" />
                              <Chip label={question.category?.name} size="small" />
                              <Chip label={question.type} size="small" />
                            </Stack>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAddFromBank(question)}
                            >
                              Add to Exam
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Custom Question Form */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Create Custom Question
                  </Typography>
                  <form onSubmit={handleSubmit(handleCreateCustom)}>
                    <Stack spacing={3}>
                      <Controller
                        name="text"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Question Text"
                            fullWidth
                            multiline
                            rows={3}
                            error={!!errors.text}
                            helperText={errors.text?.message}
                          />
                        )}
                      />

                      <Stack direction="row" spacing={2}>
                        <Controller
                          name="type"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Question Type</InputLabel>
                              <Select {...field} label="Question Type">
                                <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                                <MenuItem value="true_false">True/False</MenuItem>
                                <MenuItem value="multiple_select">Multiple Select</MenuItem>
                                <MenuItem value="essay">تشریحی</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />

                        <Controller
                          name="difficulty"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Difficulty</InputLabel>
                              <Select {...field} label="Difficulty">
                                <MenuItem value="easy">Easy</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="hard">Hard</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Stack>

                      <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select {...field} label="Category">
                              {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />

                      {/* Options will be handled in a separate component for better UX */}
                      <Alert severity="info">
                        Question options and correct answers will be configured in the exam editor.
                      </Alert>
                    </Stack>
                  </form>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit(handleCreateCustom)} variant="contained">
                Create Custom Question
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </CardContent>
    </Card>
  );
}
