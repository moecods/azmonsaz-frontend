"use client";

import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, Divider } from '@mui/material';
import { QuestionAnswerInput } from '@/components/questions/QuestionAnswerInput';
import type { QuestionPayload } from '@/components/questions/QuestionAnswerInput';

const BLANK_PLACEHOLDER = '_____';

export interface QuestionPreviewProps {
  questionText: string;
  questionType: string;
  previewPayload: QuestionPayload | null;
  previewAnswer: number | number[] | string | string[] | { left_index: number; right_index: number }[] | null;
  onPreviewAnswerChange: (value: number | number[] | string | string[] | { left_index: number; right_index: number }[] | null) => void;
}

export function QuestionPreview({
  questionText,
  questionType,
  previewPayload,
  previewAnswer,
  onPreviewAnswerChange,
}: QuestionPreviewProps) {
  const [showPreview, setShowPreview] = useState(true);

  if (!showPreview) {
    return (
      <Button size="small" variant="outlined" onClick={() => setShowPreview(true)}>
        نمایش پیش‌نمایش زنده
      </Button>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">پیش‌نمایش زنده (نمای دانش‌آموز)</Typography>
            <Button size="small" onClick={() => setShowPreview(false)}>
              مخفی
            </Button>
          </Stack>
          <Divider />
          {previewPayload && questionText ? (
            <Stack spacing={2}>
              {questionType === 'fill_in_the_blank' && questionText.includes(BLANK_PLACEHOLDER) ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', whiteSpace: 'pre-wrap' }}>
                  {questionText.split(BLANK_PLACEHOLDER).map((part, i) => (
                    <Box key={i} component="span" sx={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography component="span" variant="body1" sx={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                        {part}
                      </Typography>
                      {i < questionText.split(BLANK_PLACEHOLDER).length - 1 && (
                        <TextField
                          size="small"
                          sx={{ mx: '4px', minWidth: 120, verticalAlign: 'middle' }}
                          placeholder={`جای خالی ${i + 1}`}
                          value={(Array.isArray(previewAnswer) ? (previewAnswer as string[])[i] : '') ?? ''}
                          onChange={(e) => {
                            const prev = Array.isArray(previewAnswer) ? (previewAnswer as string[]) : [];
                            const arr = [...prev];
                            arr[i] = e.target.value;
                            onPreviewAnswerChange(arr);
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                    {questionText}
                  </Typography>
                  <QuestionAnswerInput
                    payload={previewPayload}
                    value={previewAnswer as number | number[] | string | null | undefined}
                    onChange={(v) => onPreviewAnswerChange(v)}
                  />
                </>
              )}
            </Stack>
          ) : (
            <Alert severity="info">متن سوال را وارد کنید تا پیش‌نمایش نمایش داده شود.</Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
