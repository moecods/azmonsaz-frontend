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
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { ExamQuestion, QuestionOption } from '@/types';
import { generateOptionId, isCorrectOptionId, correctAnswerIdsFromOptions } from '@/lib/option-ids';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { RichLabel } from '@/components/editor';

interface ExamQuestionListProps {
  questions: ExamQuestion[];
  onRemoveQuestion: (index: number) => void;
  onUpdateQuestion: (index: number, question: ExamQuestion) => void;
}

interface QuestionEditForm {
  text: string;
  options: QuestionOption[];
  correct_answer: string | string[];
}

export default function ExamQuestionList({ 
  questions, 
  onRemoveQuestion, 
  onUpdateQuestion 
}: ExamQuestionListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<QuestionEditForm | null>(null);

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    const formData: QuestionEditForm = {
      text: question.question?.text || question.custom_text || '',
      options: question.question?.options || question.custom_options || [],
      correct_answer:
        question.question?.correct_answer ?? question.custom_correct_answer ?? '',
    };
    setEditForm(formData);
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editForm) {
      const updatedQuestion = { ...questions[editingIndex] };
      const qType = updatedQuestion.question?.type ?? 'multiple_choice';
      const correctAnswer = correctAnswerIdsFromOptions(
        editForm.options,
        qType === 'multiple_select'
      );

      if (updatedQuestion.question) {
        // Update existing question from bank
        updatedQuestion.question = {
          ...updatedQuestion.question,
          text: editForm.text,
          options: editForm.options,
          correct_answer: correctAnswer,
        };
      } else {
        // Update custom question
        updatedQuestion.custom_text = editForm.text;
        updatedQuestion.custom_options = editForm.options;
        updatedQuestion.custom_correct_answer = correctAnswer;
      }
      
      onUpdateQuestion(editingIndex, updatedQuestion);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleOptionChange = (optionIndex: number, field: keyof QuestionOption, value: string | boolean) => {
    if (!editForm) return;

    const updatedOptions = [...editForm.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: value,
    };

    if (field === 'is_correct' && value === true) {
      const optionId = updatedOptions[optionIndex].id;
      const nextOptions = updatedOptions.map((o, i) => ({
        ...o,
        is_correct: i === optionIndex,
      }));
      setEditForm({
        ...editForm,
        options: nextOptions,
        correct_answer: optionId,
      });
      return;
    }

    setEditForm({ ...editForm, options: updatedOptions });
  };

  const handleAddOption = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      options: [
        ...editForm.options,
        { id: generateOptionId(), text: '', is_correct: false },
      ],
    });
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (!editForm || editForm.options.length <= 2) return;
    const updatedOptions = editForm.options.filter((_, index) => index !== optionIndex);
    setEditForm({ ...editForm, options: updatedOptions });
  };

  const getQuestionText = (question: ExamQuestion) => {
    return question.question?.text || question.custom_text || 'No question text';
  };

  const getQuestionOptions = (question: ExamQuestion) => {
    return question.question?.options || question.custom_options || [];
  };

  const getCorrectAnswer = (question: ExamQuestion) => {
    return question.question?.correct_answer ?? question.custom_correct_answer ?? '';
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No questions added yet
            </Typography>
            <Typography color="text.secondary">
              Use the &quot;Add Questions&quot; section above to add questions to your exam.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">
            Exam Questions ({questions.length})
          </Typography>

          <Stack spacing={2}>
            {questions.map((question, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DragIndicatorIcon color="action" />
                          <Typography variant="subtitle2" color="text.secondary">
                            Question {index + 1}
                          </Typography>
                          {question.question && (
                            <Chip label="From Bank" size="small" color="primary" />
                          )}
                          {!question.question && (
                            <Chip label="Custom" size="small" color="secondary" />
                          )}
                        </Stack>
                        <RichLabel html={getQuestionText(question)} fontSize="1rem" sx={{ mt: 1 }} />
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuestion(index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onRemoveQuestion(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Display options */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Options:
                      </Typography>
                      <Stack spacing={1}>
                        {getQuestionOptions(question).map((option, optionIndex) => {
                          const optionId = option.id ?? `opt-${optionIndex}`;
                          const correct = getCorrectAnswer(question);
                          const qType = question.question?.type ?? 'multiple_choice';
                          const isCorrect =
                            option.is_correct ??
                            isCorrectOptionId(qType, correct, optionId);
                          return (
                          <Stack
                            key={optionId}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography variant="body2" sx={{ minWidth: 24 }}>
                              {String.fromCharCode(65 + optionIndex)}.
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                fontWeight: isCorrect ? 'bold' : 'normal',
                                color: isCorrect ? 'success.main' : 'text.primary',
                              }}
                            >
                              {option.text}
                            </Typography>
                            {isCorrect && (
                              <Chip label="Correct" size="small" color="success" />
                            )}
                          </Stack>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Edit Dialog */}
          <Dialog open={editingIndex !== null} onClose={handleCancelEdit} maxWidth="md" fullWidth>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogContent>
              {editForm && (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Question Text"
                    multiline
                    rows={3}
                    value={editForm.text}
                    onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                  />

                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Options
                    </Typography>
                    <Stack spacing={2}>
                      {editForm.options.map((option, optionIndex) => (
                        <Stack key={option.id} direction="row" spacing={2} alignItems="center">
                          <TextField
                            fullWidth
                            label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            value={option.text}
                            onChange={(e) => handleOptionChange(optionIndex, 'text', e.target.value)}
                          />
                          <FormControlLabel
                            control={
                              <Radio
                                checked={option.is_correct}
                                onChange={(e) => handleOptionChange(optionIndex, 'is_correct', e.target.checked)}
                              />
                            }
                            label="Correct"
                          />
                          {editForm.options.length > 2 && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveOption(optionIndex)}
                            >
                              Remove
                            </Button>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      variant="outlined"
                      onClick={handleAddOption}
                      sx={{ mt: 2 }}
                    >
                      Add Option
                    </Button>
                  </Box>

                  <Alert severity="info">
                    Mark the correct answer(s) by checking the &quot;Correct&quot; radio button for each option.
                  </Alert>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleSaveEdit} variant="contained">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </CardContent>
    </Card>
  );
}
