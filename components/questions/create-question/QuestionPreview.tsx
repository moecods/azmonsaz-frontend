"use client";

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { QuestionAnswerInput } from '@/components/questions/QuestionAnswerInput';
import type { QuestionPayload } from '@/components/questions/QuestionAnswerInput';
import QuestionDisplay from '@/components/questions/QuestionDisplay';
import { RichTextRenderer } from '@/components/editor/RichTextRenderer';
import { formValuesToBankSource } from '@/lib/question-types/preview-answer';
import type { DisplaySettings } from '@/lib/question-types/display-settings';
import type { QuestionFormData } from '@/lib/validation';

const BLANK_PLACEHOLDER = '_____';

export type PreviewAnswer =
  | number
  | number[]
  | string
  | string[]
  | { left_index: number; right_index: number }[]
  | null;

export interface QuestionPreviewProps {
  questionText: string;
  questionType: string;
  formValues: QuestionFormData;
  previewPayload: QuestionPayload | null;
  previewAnswer: PreviewAnswer;
  onPreviewAnswerChange: (value: PreviewAnswer) => void;
  categoryName?: string | null;
  displaySettings?: DisplaySettings | Record<string, unknown>;
}

export function QuestionPreview({
  questionText,
  questionType,
  formValues,
  previewPayload,
  previewAnswer,
  onPreviewAnswerChange,
  categoryName,
  displaySettings,
}: QuestionPreviewProps) {
  const [visible, setVisible] = useState(true);

  const hasContent = Boolean(questionText) && Boolean(previewPayload);
  const bankSource = formValuesToBankSource(formValues, categoryName);

  const payloadWithSettings: QuestionPayload | null = previewPayload
    ? {
        ...previewPayload,
        display_settings: {
          ...(previewPayload.display_settings ?? {}),
          ...(displaySettings ?? {}),
        },
      }
    : null;

  return (
    <Card variant="outlined" sx={{ position: 'relative', overflow: 'visible', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <PersonOutlineIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          پیش‌نمایش زنده — نمای دانش‌آموز
        </Typography>
        <Tooltip title={visible ? 'مخفی کردن پیش‌نمایش' : 'نمایش پیش‌نمایش'} arrow>
          <IconButton size="small" onClick={() => setVisible((v) => !v)}>
            {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {visible && (
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          {!hasContent ? (
            <Alert severity="info" variant="outlined">
              متن سوال را وارد کنید تا پیش‌نمایش زنده نمایش داده شود.
            </Alert>
          ) : (
            <Stack spacing={2.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                نمایش در بانک (با پاسخ کلیدی)
              </Typography>
              <QuestionDisplay source={bankSource} mode="bank" compact showAnswerKey />

              <Divider light />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  نمایش دانش‌آموز در آزمون
                </Typography>
                {previewAnswer != null && (
                  <Tooltip title="پاک کردن پاسخ پیش‌نمایش">
                    <IconButton size="small" onClick={() => onPreviewAnswerChange(null)}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Box>
                {questionType === 'fill_in_the_blank' &&
                questionText.includes(BLANK_PLACEHOLDER) ? (
                  <FillInTheBlankPreview
                    questionText={questionText}
                    answers={Array.isArray(previewAnswer) ? (previewAnswer as string[]) : []}
                    onChange={(arr) => onPreviewAnswerChange(arr)}
                  />
                ) : (
                  <RichTextRenderer
                    html={questionText}
                    sx={{
                      fontSize: { xs: '1.05rem', sm: '1.1rem', md: '1.15rem' },
                      lineHeight: 1.85,
                      color: 'text.primary',
                      maxWidth: '100%',
                    }}
                  />
                )}
              </Box>

              {questionType !== 'fill_in_the_blank' && payloadWithSettings && (
                <QuestionAnswerInput
                  payload={payloadWithSettings}
                  value={previewAnswer as number | number[] | string | null | undefined}
                  onChange={(v) => onPreviewAnswerChange(v)}
                />
              )}
            </Stack>
          )}
        </CardContent>
      )}

      {!visible && (
        <CardContent>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => setVisible(true)}
            startIcon={<VisibilityIcon />}
          >
            نمایش پیش‌نمایش زنده
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

function FillInTheBlankPreview({
  questionText,
  answers,
  onChange,
}: {
  questionText: string;
  answers: string[];
  onChange: (next: string[]) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef(answers);
  const onChangeRef = useRef(onChange);
  answersRef.current = answers;
  onChangeRef.current = onChange;

  const textSx = {
    fontSize: { xs: '1.05rem', sm: '1.1rem', md: '1.15rem' },
    lineHeight: 1.85,
    color: 'text.primary',
    maxWidth: '100%',
  } as const;

  /*
   * Splitting HTML on "_____" breaks <p> tags. Replace the placeholder only
   * inside text nodes so paragraphs and line breaks match the editor.
   */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        if (el.closest('pre, code, .katex, .math-inline, .math-block')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const hits: Text[] = [];
    let n: Node | null;
    while ((n = treeWalker.nextNode())) {
      const tn = n as Text;
      if (tn.textContent?.includes(BLANK_PLACEHOLDER)) hits.push(tn);
    }

    let blankIdx = 0;
    for (const textNode of hits) {
      const t = textNode.textContent!;
      if (!t.includes(BLANK_PLACEHOLDER)) continue;
      const parent = textNode.parentNode!;
      const pieces = t.split(BLANK_PLACEHOLDER);
      const frag = document.createDocumentFragment();
      for (let i = 0; i < pieces.length; i++) {
        if (pieces[i]) frag.appendChild(document.createTextNode(pieces[i]));
        if (i < pieces.length - 1) {
          const wrap = document.createElement('span');
          wrap.className = 'fill-blank-preview-slot';

          const inp = document.createElement('input');
          inp.type = 'text';
          inp.dataset.blankIndex = String(blankIdx);
          inp.setAttribute('aria-label', `جای خالی ${blankIdx + 1}`);
          inp.autocomplete = 'off';

          const idx = blankIdx;
          inp.value = answersRef.current[idx] ?? '';
          inp.addEventListener('input', () => {
            const next = [...answersRef.current];
            next[idx] = inp.value;
            onChangeRef.current(next);
          });
          blankIdx++;

          wrap.appendChild(inp);
          frag.appendChild(wrap);
        }
      }
      parent.replaceChild(frag, textNode);
    }
  }, [questionText]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLInputElement>('input[data-blank-index]').forEach((inp) => {
      const i = parseInt(inp.dataset.blankIndex!, 10);
      if (Number.isNaN(i)) return;
      const v = answers[i] ?? '';
      if (inp.value !== v) inp.value = v;
    });
  }, [answers]);

  if (!questionText) return null;

  return <RichTextRenderer ref={rootRef} html={questionText} compact={false} sx={textSx} />;
}
