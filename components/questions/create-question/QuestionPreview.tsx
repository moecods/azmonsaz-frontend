"use client";

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { QuestionAnswerInput } from '@/components/questions/QuestionAnswerInput';
import type { QuestionPayload } from '@/components/questions/QuestionAnswerInput';
import { RichTextRenderer } from '@/components/editor/RichTextRenderer';
import { QUESTION_TYPE_LABELS, DIFFICULTY_CONFIG } from '@/constants/question';

const BLANK_PLACEHOLDER = '_____';

export type PreviewAnswer =
  | number
  | number[]
  | string
  | string[]
  | { left_index: number; right_index: number }[]
  | null;

export interface QuestionPreviewProps {
  questionText: string;
  questionType: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  previewPayload: QuestionPayload | null;
  previewAnswer: PreviewAnswer;
  onPreviewAnswerChange: (value: PreviewAnswer) => void;
  /** Optional category label shown next to type. */
  categoryName?: string | null;
}

export function QuestionPreview({
  questionText,
  questionType,
  difficulty,
  previewPayload,
  previewAnswer,
  onPreviewAnswerChange,
  categoryName,
}: QuestionPreviewProps) {
  const [visible, setVisible] = useState(true);

  const typeLabel = QUESTION_TYPE_LABELS[questionType] ?? questionType;
  const diff = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;
  const hasContent = Boolean(questionText) && Boolean(previewPayload);

  return (
    <Card variant="outlined" sx={{ position: 'relative', overflow: 'visible', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <PersonOutlineIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          پیش‌نمایش زنده — نمای دانش‌آموز
        </Typography>
        <Tooltip title={visible ? 'مخفی کردن پیش‌نمایش' : 'نمایش پیش‌نمایش'} arrow>
          <IconButton size="small" onClick={() => setVisible((v) => !v)}>
            {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {visible && (
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          {!hasContent ? (
            <Alert severity="info" variant="outlined">
              متن سوال را وارد کنید تا پیش‌نمایش زنده نمایش داده شود.
            </Alert>
          ) : (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  size="small"
                  label={typeLabel}
                  sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 500 }}
                />
                {diff && <Chip size="small" label={diff.label} color={diff.color} variant="outlined" />}
                {categoryName && (
                  <Chip size="small" label={categoryName} variant="outlined" />
                )}
                {previewAnswer != null && (
                  <Tooltip title="پاک کردن پاسخ پیش‌نمایش">
                    <IconButton
                      size="small"
                      onClick={() => onPreviewAnswerChange(null)}
                      sx={{ ml: 'auto' }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Box>
                {questionType === 'fill_in_the_blank' &&
                questionText.includes(BLANK_PLACEHOLDER) ? (
                  <FillInTheBlankPreview
                    questionText={questionText}
                    answers={Array.isArray(previewAnswer) ? (previewAnswer as string[]) : []}
                    onChange={(arr) => onPreviewAnswerChange(arr)}
                  />
                ) : (
                  <RichTextRenderer
                    html={questionText}
                    sx={{
                      fontSize: { xs: '1.05rem', sm: '1.1rem', md: '1.15rem' },
                      lineHeight: 1.85,
                      color: 'text.primary',
                      maxWidth: '100%',
                    }}
                  />
                )}
              </Box>

              {questionType !== 'fill_in_the_blank' && previewPayload && (
                <>
                  <Divider light />
                  <QuestionAnswerInput
                    payload={previewPayload}
                    value={previewAnswer as number | number[] | string | null | undefined}
                    onChange={(v) => onPreviewAnswerChange(v)}
                  />
                </>
              )}
            </Stack>
          )}
        </CardContent>
      )}

      {!visible && (
        <CardContent>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => setVisible(true)}
            startIcon={<VisibilityIcon />}
          >
            نمایش پیش‌نمایش زنده
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

function FillInTheBlankPreview({
  questionText,
  answers,
  onChange,
}: {
  questionText: string;
  answers: string[];
  onChange: (next: string[]) => void;
}) {
  const parts = questionText.split(BLANK_PLACEHOLDER);
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.5,
        fontSize: { xs: '1rem', md: '1.05rem' },
        lineHeight: 2,
      }}
    >
      {parts.map((part, i) => (
        <Box key={i} component="span" sx={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <RichTextRenderer
            html={part}
            compact
            sx={{ display: 'inline', '& p': { display: 'inline' } }}
          />
          {i < parts.length - 1 && (
            <TextField
              size="small"
              variant="outlined"
              sx={{
                mx: 0.5,
                minWidth: 110,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.default',
                  '& fieldset': { borderStyle: 'dashed' },
                },
              }}
              placeholder={`جای خالی ${i + 1}`}
              value={answers[i] ?? ''}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}
