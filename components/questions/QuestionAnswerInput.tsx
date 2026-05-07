"use client";

import { type ReactNode } from 'react';
import {
  Box,
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
import { RichTextRenderer } from '@/components/editor/RichTextRenderer';

function itemText(item: string | { text: string }): string {
  return typeof item === 'string' ? item : item?.text ?? '';
}

const looksLikeHtml = (s: string) => /<[a-z][^>]*>/i.test(s);

/** Body font size used for the option label and for the control's
 * single-line vertical alignment box. Line-height is intentionally NOT
 * fixed on the renderer so images and tall content can grow the row
 * without being clipped or visually capped. */
const LABEL_FONT_SIZE = '0.95rem';
const LABEL_FIRST_LINE = 1.5; // line-height for the FIRST line only (control alignment)

function RichLabel({ html }: { html: string }) {
  if (!html) return null;
  if (!looksLikeHtml(html)) {
    return (
      <Box
        component="span"
        sx={{
          fontSize: LABEL_FONT_SIZE,
          minWidth: 0,
          flex: 1,
        }}
      >
        {html}
      </Box>
    );
  }
  return (
    <RichTextRenderer
      html={html}
      compact
      sx={{
        display: 'block',
        minWidth: 0,
        flex: 1,
        maxWidth: '100%',
        height: 'auto',
        maxHeight: 'none',
        fontSize: LABEL_FONT_SIZE,
        '& > :first-child': { marginTop: 0 },
        '& > :last-child': { marginBottom: 0 },
        '& p': { my: 0 },
        '& p + p': { mt: 0.35 },
        '& ul, & ol': { my: 0.25 },
      }}
    />
  );
}

interface OptionRowProps {
  /** The Radio / Checkbox control. */
  control: ReactNode;
  /** The rich label content. */
  children: ReactNode;
  /** Selected state — paints a subtle highlight band. */
  selected?: boolean;
  onClick?: () => void;
  htmlFor?: string;
}

/**
 * Vertically aligns the control with the FIRST line of the label content.
 *
 * The control sits inside a wrapper whose height equals one full line of the
 * label (`LABEL_LINE_HEIGHT * LABEL_FONT_SIZE`). With `align-items: center`
 * inside that wrapper, the control center always lines up with the first
 * line's vertical center — even if the label wraps onto multiple lines, has
 * inline images, or contains formulas.
 */
function OptionRow({
  control,
  children,
  selected = false,
  onClick,
  htmlFor,
}: OptionRowProps) {
  return (
    <Box
      component={htmlFor ? 'label' : 'div'}
      htmlFor={htmlFor}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        mx: 0,
        my: 0.25,
        p: 1,
        borderRadius: 1.5,
        border: '1px solid transparent',
        cursor: 'pointer',
        transition: 'background-color 0.12s ease, border-color 0.12s ease',
        bgcolor: selected ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          /* Control vertically centers with the FIRST line of the label. The
           * label itself is unconstrained — multi-line text or tall images
           * grow the row freely below this band. */
          minHeight: `calc(${LABEL_FONT_SIZE} * ${LABEL_FIRST_LINE})`,
          '& .MuiRadio-root, & .MuiCheckbox-root': { p: 0 },
        }}
      >
        {control}
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export interface QuestionPayload {
  question_text: string;
  type: string;
  options?: string[] | Record<string, unknown>;
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

/**
 * Normalize payload for display. Bank questions store blanks, items, left_items, right_items
 * inside options object. Custom questions have them at top level. This ensures both work.
 */
function normalizePayloadForDisplay(payload: QuestionPayload): QuestionPayload {
  const opts = payload.options as Record<string, unknown> | undefined;
  if (!opts || typeof opts !== 'object' || Array.isArray(opts)) {
    return payload;
  }
  const normalized = { ...payload };
  if ((!normalized.blanks || normalized.blanks.length === 0) && Array.isArray(opts.blanks)) {
    normalized.blanks = opts.blanks as { position: number; correct_answer: string }[];
  }
  if ((!normalized.items || normalized.items.length === 0) && Array.isArray(opts.items)) {
    normalized.items = opts.items as (string | { text: string; order?: number })[];
  }
  if ((!normalized.left_items || normalized.left_items.length === 0) && Array.isArray(opts.left_items)) {
    normalized.left_items = opts.left_items as (string | { text: string })[];
  }
  if ((!normalized.right_items || normalized.right_items.length === 0) && Array.isArray(opts.right_items)) {
    normalized.right_items = opts.right_items as (string | { text: string })[];
  }
  return normalized;
}

export type PreviewAnswerValue =
  | number
  | number[]
  | string
  | string[]
  | { left_index: number; right_index: number }[]
  | null;

interface QuestionAnswerInputProps {
  payload: QuestionPayload;
  value: number | number[] | string | null | undefined;
  onChange: (value: PreviewAnswerValue) => void;
  disabled?: boolean;
}

export function QuestionAnswerInput({
  payload,
  value,
  onChange,
  disabled = false,
}: QuestionAnswerInputProps) {
  const p = normalizePayloadForDisplay(payload);
  const kind = getQuestionTypeKind(p.type);
  const type = p.type;

  if (kind === 'options_single' || type === 'true_false') {
    const options = (Array.isArray(p.options) ? p.options : (type === 'true_false' ? ['درست', 'نادرست'] : [])) as string[];
    const selectedIndex = value != null ? Number(value) : null;
    return (
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup value={selectedIndex != null ? String(selectedIndex) : ''}>
          {options.map((option, index) => (
            <OptionRow
              key={index}
              selected={selectedIndex === index}
              onClick={() => !disabled && onChange(index)}
              control={
                <Radio
                  size="small"
                  disabled={disabled}
                  checked={selectedIndex === index}
                  value={index.toString()}
                  onChange={() => onChange(index)}
                  inputProps={{ 'aria-label': `گزینه ${index + 1}` }}
                />
              }
            >
              <RichLabel html={option} />
            </OptionRow>
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  if (kind === 'options_multiple') {
    const options = (Array.isArray(p.options) ? p.options : []) as string[];
    const current: number[] = Array.isArray(value)
      ? (value as number[])
      : value != null
        ? [Number(value)]
        : [];
    const toggle = (index: number) => {
      if (disabled) return;
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      onChange(next);
    };
    return (
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>انتخاب چند گزینه</FormLabel>
        <Stack>
          {options.map((option, index) => (
            <OptionRow
              key={index}
              selected={current.includes(index)}
              onClick={() => toggle(index)}
              control={
                <Checkbox
                  size="small"
                  disabled={disabled}
                  checked={current.includes(index)}
                  onChange={() => toggle(index)}
                  inputProps={{ 'aria-label': `گزینه ${index + 1}` }}
                />
              }
            >
              <RichLabel html={option} />
            </OptionRow>
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
    const items = p.items ?? [];
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
            <RichLabel html={itemText(item)} />
          </Stack>
        ))}
      </Stack>
    );
  }

  if (kind === 'matching') {
    const left = p.left_items ?? [];
    const right = p.right_items ?? [];
    const matches = (value as { left_index: number; right_index: number }[] | undefined) ?? left.map((_, i) => ({ left_index: i, right_index: 0 }));
    return (
      <Stack spacing={2}>
        <FormLabel>هر مورد چپ را به مورد راست تطبیق دهید</FormLabel>
        {left.map((leftItem, leftIdx) => (
          <Stack key={leftIdx} direction="row" alignItems="center" spacing={2}>
            <FormLabel sx={{ minWidth: 120 }}><RichLabel html={itemText(leftItem)} /></FormLabel>
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
                    label={<RichLabel html={itemText(r)} />}
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
    const blanks = p.blanks ?? [];
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
