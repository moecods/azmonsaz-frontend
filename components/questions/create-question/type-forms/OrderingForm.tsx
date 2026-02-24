"use client";

import { Box, Button, Stack, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TypeFormProps } from './types';

export function OrderingForm({
  control,
  errors,
  itemsFields,
  items,
  correct_order,
  setValue,
}: TypeFormProps) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500 }}>موارد (ترتیب صحیح = همان ترتیب لیست)</Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            const len = (items ?? []).length;
            itemsFields.append({ text: '', order: len });
            setValue('correct_order', [...((correct_order ?? []) as number[]), len]);
          }}
        >
          افزودن مورد
        </Button>
      </Stack>
      <Stack spacing={2}>
        {(items ?? []).map((_, index) => (
          <Stack key={itemsFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
            <Chip size="small" label={index + 1} />
            <Controller
              name={`items.${index}.text`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`مورد ${index + 1}`}
                  fullWidth
                  size="small"
                  error={!!(errors as Record<string, unknown>).items?.[index]}
                />
              )}
            />
            {(items ?? []).length > 2 && (
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  itemsFields.remove(index);
                  const currentOrder = (correct_order ?? []) as number[];
                  const newOrder = currentOrder
                    .filter((_, i) => i !== index)
                    .map((v) => (v > index ? v - 1 : v));
                  setValue('correct_order', newOrder);
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
