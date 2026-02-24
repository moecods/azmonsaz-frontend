"use client";

import { Box, Button, Stack, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TypeFormProps } from './types';

export function FillInTheBlankForm({
  control,
  blanksFields,
  blanks,
}: TypeFormProps) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500 }}>جای خالی‌ها (پاسخ صحیح هر جای خالی)</Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => blanksFields.append({ position: (blanks ?? []).length, correct_answer: '' })}
        >
          افزودن جای خالی
        </Button>
      </Stack>
      <Stack spacing={2}>
        {(blanks ?? []).map((_, index) => (
          <Stack key={blanksFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
            <Chip size="small" label={index + 1} />
            <Controller
              name={`blanks.${index}.correct_answer`}
              control={control}
              render={({ field }) => <TextField {...field} size="small" fullWidth label={`پاسخ جای خالی ${index + 1}`} />}
            />
            {(blanks ?? []).length > 1 && (
              <IconButton size="small" color="error" onClick={() => blanksFields.remove(index)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
