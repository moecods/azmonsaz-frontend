"use client";

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Stack,
  TextField,
} from '@mui/material';
import { getQuestionTypeKind } from '@/lib/question-types';

function itemText(item: string | { text: string }): string {
  return typeof item === 'string' ? item : item?.text ?? '';
}

export interface QuestionPayload {
  question_text: string;
  type: string;
  options?: string[];
  correct_answer?: number | number[] | null;
  order?: number;
  points?: number;
  items?: (string | { text: string; order?: number })[];
  correct_order?: number[];
  left_items?: (string | { text: string })[];
  right_items?: (string | { text: string })[];
  matches?: { left_index: number; right_index: number }[];
  blanks?: { position: number; correct_answer: string }[];
}

interface QuestionAnswerInputProps {
  payload: QuestionPayload;
  value: number | number[] | string | null | undefined;
  onChange: (value: number | number[] | string | null) => void;
  disabled?: boolean;
}

export function QuestionAnswerInput({
  payload,
  value,
  onChange,
  disabled = false,
}: QuestionAnswerInputProps) {
  const kind = getQuestionTypeKind(payload.type);
  const type = payload.type;

  if (kind === 'options_single' || type === 'true_false') {
    const options = payload.options ?? (type === 'true_false' ? ['درست', 'نادرست'] : []);
    return (
      <FormControl>
        <RadioGroup
          value={value != null ? String(value) : ''}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
        >
          {options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={index.toString()}
              control={<Radio disabled={disabled} />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  if (kind === 'options_multiple') {
    const options = payload.options ?? [];
    const current = Array.isArray(value) ? value : value != null ? [value] : [];
    return (
      <FormControl>
        <FormLabel>انتخاب چند گزینه</FormLabel>
        <Stack>
          {options.map((option, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  disabled={disabled}
                  checked={current.includes(index)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...current, index]
                      : current.filter((i) => i !== index);
                    onChange(next);
                  }}
                />
              }
              label={option}
            />
          ))}
        </Stack>
      </FormControl>
    );
  }

  if (kind === 'text') {
    return (
      <TextField
        multiline={type === 'essay'}
        rows={type === 'essay' ? 6 : 1}
        fullWidth
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={type === 'essay' ? 'پاسخ خود را اینجا بنویسید...' : 'پاسخ کوتاه...'}
      />
    );
  }

  if (kind === 'ordering') {
    const items = payload.items ?? [];
    const order = (value as number[] | undefined) ?? [];
    return (
      <Stack spacing={1}>
        <FormLabel>ترتیب را انتخاب کنید (هر مورد با شماره ترتیب)</FormLabel>
        {items.map((item, idx) => (
          <Stack key={idx} direction="row" alignItems="center" spacing={2}>
            <FormLabel sx={{ minWidth: 80 }}>مورد {idx + 1}:</FormLabel>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <RadioGroup
                row
                value={order[idx] != null ? String(order[idx]) : ''}
                onChange={(e) => {
                  const newOrder = [...order];
                  newOrder[idx] = parseInt(e.target.value, 10);
                  onChange(newOrder);
                }}
              >
                {items.map((_, i) => (
                  <FormControlLabel
                    key={i}
                    value={String(i)}
                    control={<Radio size="small" disabled={disabled} />}
                    label={i + 1}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <span>{itemText(item)}</span>
          </Stack>
        ))}
      </Stack>
    );
  }

  if (kind === 'matching') {
    const left = payload.left_items ?? [];
    const right = payload.right_items ?? [];
    const matches = (value as { left_index: number; right_index: number }[] | undefined) ?? left.map((_, i) => ({ left_index: i, right_index: 0 }));
    return (
      <Stack spacing={2}>
        <FormLabel>هر مورد چپ را به مورد راست تطبیق دهید</FormLabel>
        {left.map((leftItem, leftIdx) => (
          <Stack key={leftIdx} direction="row" alignItems="center" spacing={2}>
            <FormLabel sx={{ minWidth: 120 }}>{itemText(leftItem)}</FormLabel>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <RadioGroup
                value={String(matches[leftIdx]?.right_index ?? 0)}
                onChange={(e) => {
                  const newMatches = matches.map((m, i) =>
                    i === leftIdx ? { ...m, right_index: parseInt(e.target.value, 10) } : m
                  );
                  onChange(newMatches);
                }}
              >
                {right.map((r, rightIdx) => (
                  <FormControlLabel
                    key={rightIdx}
                    value={String(rightIdx)}
                    control={<Radio size="small" disabled={disabled} />}
                    label={itemText(r)}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Stack>
        ))}
      </Stack>
    );
  }

  if (kind === 'blanks') {
    const blanks = payload.blanks ?? [];
    const answers = (Array.isArray(value) ? value : value != null ? [value] : []) as string[];
    return (
      <Stack spacing={2}>
        <FormLabel>پاسخ هر جای خالی را وارد کنید</FormLabel>
        {blanks.map((_, idx) => (
          <TextField
            key={idx}
            size="small"
            fullWidth
            disabled={disabled}
            label={`جای خالی ${idx + 1}`}
            value={answers[idx] ?? ''}
            onChange={(e) => {
              const next = [...answers];
              next[idx] = e.target.value;
              onChange(next);
            }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TextField
      multiline
      rows={3}
      fullWidth
      disabled={disabled}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="پاسخ..."
    />
  );
}
