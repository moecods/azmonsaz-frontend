"use client";

import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { TypeFormProps } from './types';

export function TrueFalseForm({ control, setValue, questionOptions }: TypeFormProps) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>گزینه صحیح را انتخاب کنید</Typography>
      <Stack spacing={2}>
        {[0, 1].map((index) => (
          <Stack key={index} direction="row" spacing={2} alignItems="center">
            <TextField
              value={questionOptions?.[index]?.text ?? (index === 0 ? 'صحیح' : 'غلط')}
              label={`گزینه ${index + 1}`}
              fullWidth
              disabled
              size="small"
            />
            <Controller
              name={`options.${index}.is_correct`}
              control={control}
              render={({ field: f }) => (
                <Button
                  variant={f.value ? 'contained' : 'outlined'}
                  color={f.value ? 'success' : 'inherit'}
                  onClick={() => {
                    setValue('options.0.is_correct', index === 0);
                    setValue('options.1.is_correct', index === 1);
                  }}
                  sx={{ minWidth: 100 }}
                  startIcon={f.value ? <CheckCircleIcon /> : null}
                >
                  {f.value ? 'صحیح' : 'غلط'}
                </Button>
              )}
            />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
