"use client";

import { Box, Stack, Typography, Chip, Alert } from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { getQuestionTypeKind } from '@/lib/question-types';

export interface ResultQuestion {
  id?: number;
  type: string;
  question_text: string;
  options?: (string | { text: string })[];
  correct_answer?: number | number[] | string | null;
  your_answer?: number | number[] | string | null;
  is_correct?: boolean;
  is_pending_grading?: boolean;
  points_earned?: number;
  points_total?: number;
}

function optionText(opt: string | { text: string }): string {
  return typeof opt === 'string' ? opt : opt.text;
}

interface QuestionResultDisplayProps {
  question: ResultQuestion;
}

export function QuestionResultDisplay({ question }: QuestionResultDisplayProps) {
  const kind = getQuestionTypeKind(question.type);
  const options = question.options ?? [];

  if (kind === 'options_single' || question.type === 'true_false') {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          گزینه‌ها:
        </Typography>
        {options.map((option, optIndex) => {
          const isCorrect = Array.isArray(question.correct_answer)
            ? question.correct_answer.includes(optIndex)
            : question.correct_answer === optIndex;
          const isYourAnswer = question.your_answer === optIndex;
          return (
            <Box
              key={optIndex}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                bgcolor: isCorrect
                  ? 'success.light'
                  : isYourAnswer && !isCorrect
                  ? 'error.light'
                  : 'grey.100',
                border: isYourAnswer ? '2px solid' : 'none',
                borderColor: isYourAnswer
                  ? isCorrect
                    ? 'success.main'
                    : 'error.main'
                  : 'transparent',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {isYourAnswer ? (
                  <RadioButtonCheckedIcon
                    color={isCorrect ? 'success' : 'error'}
                  />
                ) : (
                  <RadioButtonUncheckedIcon />
                )}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isCorrect ? 'bold' : 'normal',
                    color: isCorrect ? 'success.dark' : 'text.primary',
                  }}
                >
                  {optionText(option)}
                </Typography>
                {isCorrect && (
                  <Chip label="پاسخ صحیح" color="success" size="small" />
                )}
                {isYourAnswer && !isCorrect && (
                  <Chip label="پاسخ شما" color="error" size="small" />
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    );
  }

  if (kind === 'options_multiple') {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          گزینه‌ها:
        </Typography>
        {options.map((option, optIndex) => {
          const correctAnswers = Array.isArray(question.correct_answer)
            ? question.correct_answer
            : [question.correct_answer];
          const yourAnswers = Array.isArray(question.your_answer)
            ? question.your_answer
            : question.your_answer != null
            ? [question.your_answer]
            : [];
          const isCorrect = correctAnswers.includes(optIndex);
          const isYourAnswer = yourAnswers.includes(optIndex);
          return (
            <Box
              key={optIndex}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                bgcolor: isCorrect
                  ? 'success.light'
                  : isYourAnswer && !isCorrect
                  ? 'error.light'
                  : 'grey.100',
                border: isYourAnswer ? '2px solid' : 'none',
                borderColor: isYourAnswer
                  ? isCorrect
                    ? 'success.main'
                    : 'error.main'
                  : 'transparent',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isCorrect ? 'bold' : 'normal',
                    color: isCorrect ? 'success.dark' : 'text.primary',
                  }}
                >
                  {optionText(option)}
                </Typography>
                {isCorrect && (
                  <Chip label="پاسخ صحیح" color="success" size="small" />
                )}
                {isYourAnswer && !isCorrect && (
                  <Chip label="پاسخ شما" color="error" size="small" />
                )}
                {isYourAnswer && isCorrect && (
                  <Chip label="پاسخ شما (صحیح)" color="success" size="small" />
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Essay and similar: show answer; for pending grading use neutral style
  const isPendingGrading = question.is_pending_grading;
  const bgColor = isPendingGrading
    ? 'grey.100'
    : question.is_correct
      ? 'success.light'
      : 'error.light';

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        پاسخ شما:
      </Typography>
      <Typography
        variant="body1"
        sx={{
          p: 2,
          bgcolor: bgColor,
          borderRadius: 1,
        }}
      >
        {question.your_answer != null && question.your_answer !== ''
          ? String(question.your_answer)
          : 'پاسخی داده نشده'}
      </Typography>
      {isPendingGrading && (
        <Alert severity="info" sx={{ mt: 1 }}>
          این سوال تشریحی است و در انتظار تصحیح معلم می‌باشد.
        </Alert>
      )}
      {!isPendingGrading && question.is_correct && (
        <Alert severity="success" sx={{ mt: 1 }}>
          پاسخ شما صحیح است
        </Alert>
      )}
    </Box>
  );
}
