"use client";

import { Box, Button, Stack, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Chip, FormControl, Select, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TypeFormProps } from './types';

export function MatchingForm({
  control,
  leftItemsFields,
  rightItemsFields,
  left_items,
  right_items,
}: TypeFormProps) {
  return (
    <Box>
      <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500, display: 'block', mb: 2 }}>ستون چپ</Box>
      <Stack direction="row" justifyContent="flex-end">
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => leftItemsFields.append({ text: '' })}>
          افزودن
        </Button>
      </Stack>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {(left_items ?? []).map((_, index) => (
          <Stack key={leftItemsFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
            <Chip size="small" label={index + 1} />
            <Controller
              name={`left_items.${index}.text`}
              control={control}
              render={({ field }) => <TextField {...field} size="small" fullWidth placeholder={`مورد چپ ${index + 1}`} />}
            />
            {(left_items ?? []).length > 2 && (
              <IconButton size="small" color="error" onClick={() => leftItemsFields.remove(index)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>
      <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500, display: 'block', mb: 2 }}>ستون راست</Box>
      <Stack direction="row" justifyContent="flex-end">
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => rightItemsFields.append({ text: '' })}>
          افزودن
        </Button>
      </Stack>
      <Stack spacing={1} sx={{ mb: 2 }}>
        {(right_items ?? []).map((_, index) => (
          <Stack key={rightItemsFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
            <Chip size="small" label={String.fromCharCode(65 + index)} />
            <Controller
              name={`right_items.${index}.text`}
              control={control}
              render={({ field }) => <TextField {...field} size="small" fullWidth placeholder={`مورد راست ${String.fromCharCode(65 + index)}`} />}
            />
            {(right_items ?? []).length > 2 && (
              <IconButton size="small" color="error" onClick={() => rightItemsFields.remove(index)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>
      <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary', display: 'block', mb: 1 }}>
        تطبیق هر مورد چپ با مورد راست
      </Box>
      <Stack spacing={1}>
        {(left_items ?? []).map((_, leftIdx) => (
          <Stack key={leftIdx} direction="row" spacing={2} alignItems="center">
            <Box sx={{ minWidth: 120, fontSize: '0.875rem' }}>{left_items?.[leftIdx]?.text || `چپ ${leftIdx + 1}`}</Box>
            <Controller
              name={`matches.${leftIdx}.right_index`}
              control={control}
              render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select {...field} value={field.value ?? 0}>
                    {(right_items ?? []).map((__, rightIdx) => (
                      <MenuItem key={rightIdx} value={rightIdx}>
                        {right_items?.[rightIdx]?.text || `راست ${String.fromCharCode(65 + rightIdx)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
