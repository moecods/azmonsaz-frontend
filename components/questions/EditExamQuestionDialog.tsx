"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  Box,
  Radio,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ExamQuestion } from '@/types';
import { getQuestionText, getQuestionOptions, getQuestionType } from '@/lib/question-utils';
import { getQuestionTypeLabel } from '@/lib/question-types';

interface EditExamQuestionDialogProps {
  open: boolean;
  question: ExamQuestion | null;
  defaultPoints: number;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => void;
  isSaving?: boolean;
}

function getOptionsAsStrings(question: ExamQuestion): string[] {
  const opts = getQuestionOptions(question);
  if (!Array.isArray(opts)) return [];
  return opts.map((o: unknown) => (typeof o === 'string' ? o : (o as { text?: string })?.text ?? ''));
}

export default function EditExamQuestionDialog({
  open,
  question,
  defaultPoints,
  onClose,
  onSave,
  isSaving = false,
}: EditExamQuestionDialogProps) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number | number[] | null>(null);
  const [points, setPoints] = useState(defaultPoints);
  const questionType = question ? getQuestionType(question) : 'multiple_choice';
  const isMultipleSelect = questionType === 'multiple_select';
  const hasOptions = questionType !== 'essay';

  useEffect(() => {
    if (!question || !open) return;
    setQuestionText(getQuestionText(question));
    setOptions(getOptionsAsStrings(question));
    const payload = question.payload ?? {};
    const ca = payload.correct_answer;
    if (ca !== undefined && ca !== null) {
      setCorrectAnswer(Array.isArray(ca) ? ca : (ca as number));
    } else {
      setCorrectAnswer(isMultipleSelect ? [] : 0);
    }
    setPoints((payload.points as number) ?? defaultPoints);
  }, [question, open, defaultPoints, isMultipleSelect]);

  const handleSave = () => {
    if (!question) return;
    const payload: Record<string, unknown> = {
      ...question.payload,
      question_text: questionText,
      points,
      order: question.payload?.order ?? question.order,
    };
    if (hasOptions) {
      payload.options = options.filter((t) => t.trim() !== '');
      payload.correct_answer = correctAnswer;
    }
    onSave(payload);
    // Parent closes dialog on success
  };

  const addOption = () => setOptions((prev) => [...prev, '']);
  const removeOption = (index: number) => setOptions((prev) => prev.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) =>
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const handleCorrectSingle = (index: number) => setCorrectAnswer(index);
  const handleCorrectMultiple = (index: number, checked: boolean) => {
    setCorrectAnswer((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      if (checked) return [...arr.filter((i) => i !== index), index].sort((a, b) => a - b);
      return arr.filter((i) => i !== index);
    });
  };

  if (!question) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ویرایش سوال</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="متن سوال"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              نوع سوال: {getQuestionTypeLabel(questionType)}
            </Typography>
          </Box>
          {hasOptions && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">گزینه‌ها</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addOption}>
                  افزودن گزینه
                </Button>
              </Stack>
              <Stack spacing={1}>
                {options.map((opt, idx) => (
                  <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                    {isMultipleSelect ? (
                      <Checkbox
                        checked={Array.isArray(correctAnswer) && correctAnswer.includes(idx)}
                        onChange={(_, c) => handleCorrectMultiple(idx, c)}
                        size="small"
                      />
                    ) : (
                      <Radio
                        checked={correctAnswer === idx}
                        onChange={() => handleCorrectSingle(idx)}
                        size="small"
                      />
                    )}
                    <TextField
                      size="small"
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      fullWidth
                      placeholder={`گزینه ${idx + 1}`}
                    />
                    <IconButton size="small" onClick={() => removeOption(idx)} color="error">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
          <TextField
            label="بارم"
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value, 10) || defaultPoints)}
            inputProps={{ min: 1, max: 100 }}
            size="small"
            sx={{ maxWidth: 120 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving || !questionText.trim()}>
          {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
