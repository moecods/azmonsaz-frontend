"use client";

import { useRef } from 'react';
import { Stack, Button, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import type { Control, FieldErrors } from 'react-hook-form';
import type { QuestionFormData } from '@/lib/validation';

export const BLANK_PLACEHOLDER = '_____';

export interface QuestionTextInputProps {
  control: Control<QuestionFormData>;
  errors: FieldErrors<QuestionFormData>;
  questionType: string;
}

export function QuestionTextInput({ control, errors, questionType }: QuestionTextInputProps) {
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  return (
    <Controller
      name="text"
      control={control}
      render={({ field }) => (
        <Stack spacing={1}>
          {questionType === 'fill_in_the_blank' && (
            <Stack direction="row" justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                type="button"
                startIcon={<AddIcon />}
                onClick={() => {
                  const input = textInputRef.current;
                  const val = String(field.value ?? '');
                  if (input && 'selectionStart' in input) {
                    const start = input.selectionStart ?? val.length;
                    const end = input.selectionEnd ?? start;
                    const newVal = val.slice(0, start) + BLANK_PLACEHOLDER + val.slice(end);
                    field.onChange(newVal);
                    requestAnimationFrame(() => {
                      input.focus();
                      const pos = start + BLANK_PLACEHOLDER.length;
                      input.setSelectionRange(pos, pos);
                    });
                  } else {
                    field.onChange(val + BLANK_PLACEHOLDER);
                  }
                }}
              >
                درج جای خالی ({BLANK_PLACEHOLDER})
              </Button>
            </Stack>
          )}
          <TextField
            {...field}
            inputRef={(el) => {
              (field as { ref?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void }).ref?.(el);
              (textInputRef as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = el;
            }}
            label="متن سوال"
            fullWidth
            required
            multiline
            rows={3}
            error={!!errors.text}
            helperText={
              errors.text?.message ||
              (questionType === 'fill_in_the_blank'
                ? `برای جای خالی از ${BLANK_PLACEHOLDER} (۵ خط زیر) استفاده کنید یا دکمه بالا را بزنید. فاصله‌ها در پیش‌نمایش حفظ می‌شوند.`
                : undefined)
            }
            placeholder={
              questionType === 'fill_in_the_blank'
                ? `مثال: پایتخت ایران ${BLANK_PLACEHOLDER} است.`
                : 'متن سوال را اینجا وارد کنید...'
            }
          />
        </Stack>
      )}
    />
  );
}
