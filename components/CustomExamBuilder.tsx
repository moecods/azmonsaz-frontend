'use client';

import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QuestionBankBuilder, { Question } from './QuestionBankBuilder';

// Exam schema
const examSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Exam title is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalPoints: z.number().min(1, 'Total points must be at least 1'),
  instructions: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['multiple_choice', 'multiple_select', 'true_false', 'text', 'number']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string()), z.boolean(), z.number()]).optional(),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    category: z.string(),
    tags: z.array(z.string()),
    points: z.number(),
  })),
  settings: z.object({
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    showCorrectAnswers: z.boolean().default(false),
    allowReview: z.boolean().default(true),
    timeLimit: z.boolean().default(true),
  }),
});

type Exam = z.infer<typeof examSchema>;

interface CustomExamBuilderProps {
  onSave?: (exam: Exam) => void;
  initialExam?: Partial<Exam>;
  title?: string;
  showPreview?: boolean;
}

export default function CustomExamBuilder({
  onSave,
  initialExam,
  title = "Custom Exam Builder",
  showPreview = true,
}: CustomExamBuilderProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form for exam
  const { control, handleSubmit, watch, setValue } = useForm<Exam>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      duration: 60,
      totalPoints: 0,
      instructions: '',
      questions: [],
      settings: {
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswers: false,
        allowReview: true,
        timeLimit: true,
      },
      ...initialExam,
    },
  });

  const { append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedQuestions = watch('questions');

  // Calculate total points
  useEffect(() => {
    const total = watchedQuestions.reduce((sum, q) => sum + q.points, 0);
    setValue('totalPoints', total);
  }, [watchedQuestions, setValue]);

  // Handle add questions from bank
  const handleAddQuestionsFromBank = (questions: Question[]) => {
    const newQuestions = questions.map(q => ({
      ...q,
      id: q.id || Date.now().toString() + Math.random(),
    }));
    
    const currentQuestions = watchedQuestions;
    const updatedQuestions = [...currentQuestions, ...newQuestions];
    setValue('questions', updatedQuestions);
    setSelectedQuestions([]);
  };

  // Handle add manual question
  const handleAddManualQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  // Handle save manual question
  const handleSaveManualQuestion = (question: Question) => {
    const newQuestion = {
      ...question,
      id: question.id || Date.now().toString() + Math.random(),
    };
    append(newQuestion);
    setIsQuestionDialogOpen(false);
  };

  // Handle edit question
  const handleEditQuestion = (question: Question, index: number) => {
    setEditingQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  // Handle delete question
  const handleDeleteQuestion = (index: number) => {
    remove(index);
  };

  // Handle save exam
  const handleSaveExam = (data: Exam) => {
    if (onSave) {
      onSave(data);
    }
  };

  // Render question based on type
  const renderQuestion = (question: Question, index: number) => {
    return (
      <Card key={question.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6">
              {index + 1}. {question.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => handleEditQuestion(question, index)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteQuestion(index)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={question.type} size="small" color="primary" />
            <Chip label={question.difficulty} size="small" color="secondary" />
            <Chip label={`${question.points} pts`} size="small" />
            <Chip label={question.category} size="small" variant="outlined" />
          </Box>

          {question.options && question.options.length > 0 && (
            <Box sx={{ ml: 2 }}>
              {question.options.map((option, optIndex) => (
                <Typography key={optIndex} variant="body2" sx={{ mb: 0.5 }}>
                  {String.fromCharCode(65 + optIndex)}. {option}
                </Typography>
              ))}
            </Box>
          )}

          {question.explanation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Explanation:</strong> {question.explanation}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const steps = [
    {
      label: 'Exam Details',
      description: 'Basic information about the exam',
    },
    {
      label: 'Add Questions',
      description: 'Select questions from bank or add manually',
    },
    {
      label: 'Settings',
      description: 'Configure exam settings',
    },
    {
      label: 'Preview',
      description: 'Review and finalize exam',
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Exam Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Exam Title"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Box>
                  <Box>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name="subject"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Subject"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Controller
                        name="duration"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Duration (minutes)"
                            type="number"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Controller
                      name="instructions"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Instructions for Students"
                          multiline
                          rows={4}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Add Questions
                </Typography>
                
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddManualQuestion}
                  >
                    Add Manual Question
                  </Button>
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Question Bank ({watchedQuestions.length} questions selected)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <QuestionBankBuilder
                      onSave={handleAddQuestionsFromBank}
                      initialQuestions={watchedQuestions}
                      title=""
                      showPreview={false}
                    />
                  </AccordionDetails>
                </Accordion>

                {watchedQuestions.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Selected Questions ({watchedQuestions.length})
                    </Typography>
                    {watchedQuestions.map((question, index) => renderQuestion(question, index))}
                  </Box>
                )}
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Exam Settings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Controller
                          name="settings.shuffleQuestions"
                          control={control}
                          render={({ field }) => (
                            <Switch {...field} checked={field.value} />
                          )}
                        />
                      }
                      label="Shuffle Questions"
                    />
                    <FormControlLabel
                      control={
                        <Controller
                          name="settings.shuffleOptions"
                          control={control}
                          render={({ field }) => (
                            <Switch {...field} checked={field.value} />
                          )}
                        />
                      }
                      label="Shuffle Answer Options"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Controller
                          name="settings.showCorrectAnswers"
                          control={control}
                          render={({ field }) => (
                            <Switch {...field} checked={field.value} />
                          )}
                        />
                      }
                      label="Show Correct Answers After Submission"
                    />
                    <FormControlLabel
                      control={
                        <Controller
                          name="settings.allowReview"
                          control={control}
                          render={({ field }) => (
                            <Switch {...field} checked={field.value} />
                          )}
                        />
                      }
                      label="Allow Review Before Submission"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Controller
                          name="settings.timeLimit"
                          control={control}
                          render={({ field }) => (
                            <Switch {...field} checked={field.value} />
                          )}
                        />
                      }
                      label="Enforce Time Limit"
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {activeStep === 3 && showPreview && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Exam Preview
                </Typography>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {watch('title')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {watch('description')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Chip icon={<SchoolIcon />} label={`Subject: ${watch('subject')}`} />
                      <Chip icon={<TimerIcon />} label={`Duration: ${watch('duration')} min`} />
                      <Chip icon={<QuizIcon />} label={`Questions: ${watchedQuestions.length}`} />
                      <Chip label={`Total Points: ${watch('totalPoints')}`} color="primary" />
                    </Box>
                    {watch('instructions') && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>Instructions:</strong> {watch('instructions')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Questions Preview
                </Typography>
                {watchedQuestions.map((question, index) => renderQuestion(question, index))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Back
            </Button>
            <Box>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={activeStep === 1 && watchedQuestions.length === 0}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit(handleSaveExam)}
                  startIcon={<SaveIcon />}
                >
                  Save Exam
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Manual Question Dialog */}
      <Dialog
        open={isQuestionDialogOpen}
        onClose={() => setIsQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? 'Edit Question' : 'Add Manual Question'}
        </DialogTitle>
        <DialogContent>
          <QuestionBankBuilder
            onSave={(questions) => {
              if (questions.length > 0) {
                handleSaveManualQuestion(questions[0]);
              }
            }}
            initialQuestions={editingQuestion ? [editingQuestion] : []}
            title=""
            showPreview={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsQuestionDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
