"use client";

import { Box, Button, Stack, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { TypeFormProps } from './types';

export function OptionsForm({
  control,
  errors,
  optionsFields,
  questionOptions,
  onAddOption,
  onRemoveOption,
}: TypeFormProps & {
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500 }}>گزینه‌ها</Box>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAddOption}>
          افزودن گزینه
        </Button>
      </Stack>
      <Stack spacing={2}>
        {(optionsFields.fields ?? []).map((field, index) => (
          <Stack key={field.id} direction="row" spacing={2} alignItems="center">
            <Controller
              name={`options.${index}.text`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  {...f}
                  label={`گزینه ${String.fromCharCode(65 + index)}`}
                  fullWidth
                  size="small"
                  error={!!errors.options?.[index]?.text}
                  helperText={errors.options?.[index]?.text?.message}
                />
              )}
            />
            <Controller
              name={`options.${index}.is_correct`}
              control={control}
              render={({ field: f }) => (
                <Button
                  variant={f.value ? 'contained' : 'outlined'}
                  color={f.value ? 'success' : 'inherit'}
                  onClick={() => f.onChange(!f.value)}
                  sx={{ minWidth: 100 }}
                  startIcon={f.value ? <CheckCircleIcon /> : null}
                >
                  {f.value ? 'صحیح' : 'غلط'}
                </Button>
              )}
            />
            {optionsFields.fields.length > 2 && (
              <IconButton size="small" color="error" onClick={() => onRemoveOption(index)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
