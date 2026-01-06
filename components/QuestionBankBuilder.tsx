'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Question types
export type QuestionType = 'multiple_choice' | 'multiple_select' | 'true_false' | 'text' | 'number';

// Question schema
const questionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['multiple_choice', 'multiple_select', 'true_false', 'text', 'number']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string()), z.boolean(), z.number()]).optional(),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  points: z.number().min(1).default(1),
});

export type Question = z.infer<typeof questionSchema>;

// Question bank schema
const questionBankSchema = z.object({
  questions: z.array(questionSchema),
});

type QuestionBank = z.infer<typeof questionBankSchema>;

interface QuestionBankBuilderProps {
  onSave?: (questions: Question[]) => void;
  initialQuestions?: Question[];
  title?: string;
  showPreview?: boolean;
}

export default function QuestionBankBuilder({
  onSave,
  initialQuestions = [],
  title = "Question Bank Builder",
  showPreview = true,
}: QuestionBankBuilderProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);

  // Form for question bank
  const { control, handleSubmit, watch } = useForm<QuestionBank>({
    resolver: zodResolver(questionBankSchema),
    defaultValues: {
      questions: initialQuestions,
    },
  });

  const { append, update, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  // Form for individual question
  const questionForm = useForm<Question>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: 'multiple_choice',
      difficulty: 'medium',
      points: 1,
      tags: [],
      options: [''],
    },
  });

  const watchedQuestions = watch('questions');
  const watchedQuestionType = questionForm.watch('type');

  // Categories (you can make this dynamic)
  const categories = [
    'Mathematics',
    'Science',
    'History',
    'Literature',
    'Geography',
    'Computer Science',
    'General Knowledge',
  ];

  // Filter questions based on search and filters
  const filteredQuestions = watchedQuestions.filter((question) => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || question.category === filterCategory;
    const matchesDifficulty = !filterDifficulty || question.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Handle question form submission
  const onSubmitQuestion = (data: Question) => {
    setLoading(true);
    
    try {
      if (editingQuestion) {
        // Update existing question
        const index = watchedQuestions.findIndex(q => q.id === editingQuestion.id);
        if (index !== -1) {
          update(index, { ...data, id: editingQuestion.id });
        }
      } else {
        // Add new question
        const newQuestion = {
          ...data,
          id: Date.now().toString(),
        };
        append(newQuestion);
      }
      
      setIsQuestionDialogOpen(false);
      setEditingQuestion(null);
      questionForm.reset();
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit question
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    questionForm.reset(question);
    setIsQuestionDialogOpen(true);
  };

  // Handle delete question
  const handleDeleteQuestion = (index: number) => {
    remove(index);
  };

  // Handle save question bank
  const handleSaveBank = (data: QuestionBank) => {
    if (onSave) {
      onSave(data.questions);
    }
  };

  // Toggle question selection for exam
  const toggleQuestionSelection = (question: Question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id);
      if (isSelected) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  // Render question form based on type
  const renderQuestionForm = () => {
    const questionType = watchedQuestionType;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Controller
          name="title"
          control={questionForm.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              label="Question Title"
              multiline
              rows={3}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{ mb: 2 }}
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="type"
              control={questionForm.control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select {...field}>
                    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    <MenuItem value="multiple_select">Multiple Select</MenuItem>
                    <MenuItem value="true_false">True/False</MenuItem>
                    <MenuItem value="text">Text Answer</MenuItem>
                    <MenuItem value="number">Number Answer</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="difficulty"
              control={questionForm.control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select {...field}>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="category"
              control={questionForm.control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select {...field}>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="points"
              control={questionForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Points"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Box>
        </Box>

        {/* Options for multiple choice/select */}
        {(questionType === 'multiple_choice' || questionType === 'multiple_select') && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Answer Options</Typography>
            <Controller
              name="options"
              control={questionForm.control}
              render={({ field }) => (
                <Box>
                  {field.value?.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(field.value || [])];
                          newOptions[index] = e.target.value;
                          field.onChange(newOptions);
                        }}
                        label={`Option ${index + 1}`}
                        size="small"
                      />
                      <IconButton
                        onClick={() => {
                          const newOptions = field.value?.filter((_, i) => i !== index) || [];
                          field.onChange(newOptions);
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newOptions = [...(field.value || []), ''];
                      field.onChange(newOptions);
                    }}
                    size="small"
                  >
                    Add Option
                  </Button>
                </Box>
              )}
            />
          </Box>
        )}

        {/* Correct answer */}
        <Controller
          name="correctAnswer"
          control={questionForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Correct Answer"
              multiline
              rows={2}
              helperText="For multiple choice, enter the correct option. For multiple select, enter comma-separated options."
              sx={{ mb: 2 }}
            />
          )}
        />

        <Controller
          name="explanation"
          control={questionForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Explanation (Optional)"
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
          )}
        />

        <Controller
          name="tags"
          control={questionForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Tags (comma-separated)"
              placeholder="e.g., algebra, geometry, calculus"
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                field.onChange(tags);
              }}
              value={field.value?.join(', ') || ''}
            />
          )}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Question Bank" />
            <Tab label="Create Question" />
            {showPreview && <Tab label="Preview" />}
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              {/* Search and Filters */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ minWidth: 200 }}
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Questions List */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                {filteredQuestions.map((question, index) => (
                  <Box key={question.id || index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedQuestions.some(q => q.id === question.id) ? 2 : 1,
                        borderColor: selectedQuestions.some(q => q.id === question.id) ? 'primary.main' : 'divider',
                      }}
                      onClick={() => toggleQuestionSelection(question)}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {question.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip label={question.type} size="small" color="primary" />
                          <Chip label={question.difficulty} size="small" color="secondary" />
                          <Chip label={`${question.points} pts`} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {question.category}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {question.tags.map((tag, tagIndex) => (
                            <Chip key={tagIndex} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditQuestion(question);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(index);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {filteredQuestions.length === 0 && (
                <Alert severity="info">
                  No questions found. Create your first question or adjust your search filters.
                </Alert>
              )}

              {/* Selected Questions Summary */}
              {selectedQuestions.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Selected Questions ({selectedQuestions.length})
                  </Typography>
                  <Typography variant="body2">
                    Total Points: {selectedQuestions.reduce((sum, q) => sum + q.points, 0)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </Typography>
              <form onSubmit={questionForm.handleSubmit(onSubmitQuestion)}>
                {renderQuestionForm()}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {editingQuestion ? 'Update Question' : 'Save Question'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsQuestionDialogOpen(false);
                      setEditingQuestion(null);
                      questionForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </form>
            </Box>
          )}

          {activeTab === 2 && showPreview && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Preview Questions
              </Typography>
              {selectedQuestions.length > 0 ? (
                <Box>
                  {selectedQuestions.map((question, index) => (
                    <Card key={question.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {index + 1}. {question.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {question.type} • {question.difficulty} • {question.points} points
                        </Typography>
                        {question.options && question.options.length > 0 && (
                          <Box>
                            {question.options.map((option, optIndex) => (
                              <Typography key={optIndex} variant="body2" sx={{ ml: 2 }}>
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Select questions from the Question Bank to preview them here.
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit(handleSaveBank)}
          startIcon={<SaveIcon />}
        >
          Save Question Bank
        </Button>
      </Box>
    </Box>
  );
}
