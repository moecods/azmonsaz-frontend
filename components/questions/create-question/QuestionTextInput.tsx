"use client";

import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import type { Control, FieldErrors } from 'react-hook-form';
import type { QuestionFormData } from '@/lib/validation';
import RichTextEditor from '@/components/editor/RichTextEditor';

export const BLANK_PLACEHOLDER = '_____';

export interface QuestionTextInputProps {
  control: Control<QuestionFormData>;
  errors: FieldErrors<QuestionFormData>;
  questionType: string;
}

export function QuestionTextInput({ control, errors, questionType }: QuestionTextInputProps) {
  const isBlankType = questionType === 'fill_in_the_blank';
  const errorMessage = errors.text?.message;

  return (
    <Controller
      name="text"
      control={control}
      render={({ field }) => {
        const blanks = countBlanks(String(field.value ?? ''));
        return (
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  متن سوال
                </Typography>
                <Typography variant="caption" color="error.main">*</Typography>
              </Stack>
              {isBlankType && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    color={blanks > 0 ? 'primary' : 'default'}
                    variant={blanks > 0 ? 'filled' : 'outlined'}
                    label={`${blanks} جای خالی`}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    type="button"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const html = String(field.value ?? '');
                      const next = appendBlankToHtml(html);
                      field.onChange(next);
                    }}
                  >
                    درج جای خالی
                  </Button>
                </Stack>
              )}
            </Stack>

            <Box>
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                preset="full"
                placeholder={
                  isBlankType
                    ? `مثال: پایتخت ایران ${BLANK_PLACEHOLDER} است.`
                    : 'متن سوال را اینجا بنویسید… برای فرمول از دکمه ∑ استفاده کنید'
                }
                ariaLabel="متن سوال"
              />
            </Box>

            {errorMessage && (
              <Typography variant="caption" color="error">
                {errorMessage}
              </Typography>
            )}

            {isBlankType && !errorMessage && (
              <Typography variant="caption" color="text.secondary">
                هر <code>{BLANK_PLACEHOLDER}</code> در متن یک جای خالی است. می‌توانید از دکمه «درج جای خالی» نیز استفاده کنید.
              </Typography>
            )}
          </Stack>
        );
      }}
    />
  );
}

function countBlanks(html: string): number {
  if (!html) return 0;
  // Count occurrences of the placeholder in plain text content of HTML.
  const text = html.replace(/<[^>]+>/g, '');
  const m = text.match(new RegExp(BLANK_PLACEHOLDER, 'g'));
  return m?.length ?? 0;
}

function appendBlankToHtml(html: string): string {
  if (!html) return `<p>${BLANK_PLACEHOLDER}</p>`;
  // Insert before the closing </p> of the last paragraph if present, otherwise append.
  const lastClose = html.lastIndexOf('</p>');
  if (lastClose === -1) return `${html} ${BLANK_PLACEHOLDER}`;
  const before = html.slice(0, lastClose);
  const after = html.slice(lastClose);
  return `${before} ${BLANK_PLACEHOLDER}${after}`;
}
