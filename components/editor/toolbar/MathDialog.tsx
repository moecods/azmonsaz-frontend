"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  ButtonBase,
} from '@mui/material';

import { renderKatex } from '../extensions/Math';
import '../editor.css';

const PRESETS: { label: string; latex: string }[] = [
  { label: '√', latex: '\\sqrt{x}' },
  { label: 'a/b', latex: '\\frac{a}{b}' },
  { label: 'xⁿ', latex: 'x^{n}' },
  { label: 'x₁', latex: 'x_{1}' },
  { label: '∑', latex: '\\sum_{i=1}^{n} i' },
  { label: '∫', latex: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'lim', latex: '\\lim_{x \\to \\infty} f(x)' },
  { label: '±', latex: '\\pm' },
  { label: '≥', latex: '\\geq' },
  { label: '≤', latex: '\\leq' },
  { label: '≠', latex: '\\neq' },
  { label: '≈', latex: '\\approx' },
  { label: 'π', latex: '\\pi' },
  { label: 'θ', latex: '\\theta' },
  { label: '∞', latex: '\\infty' },
  { label: '°', latex: '^{\\circ}' },
  { label: 'a²+b²', latex: 'a^{2} + b^{2} = c^{2}' },
  { label: 'ax²+bx+c', latex: 'x = \\frac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}' },
];

export interface MathDialogProps {
  open: boolean;
  initialLatex?: string;
  initialDisplayMode?: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: (params: { latex: string; displayMode: boolean }) => void;
  onRemove?: () => void;
}

export function MathDialog({
  open,
  initialLatex = '',
  initialDisplayMode = false,
  isEditing = false,
  onClose,
  onSubmit,
  onRemove,
}: MathDialogProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [displayMode, setDisplayMode] = useState(initialDisplayMode);

  useEffect(() => {
    if (open) {
      setLatex(initialLatex);
      setDisplayMode(initialDisplayMode);
    }
  }, [open, initialLatex, initialDisplayMode]);

  const previewHtml = useMemo(() => {
    const trimmed = latex.trim();
    if (!trimmed) return '';
    return renderKatex(trimmed, displayMode);
  }, [latex, displayMode]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'ویرایش فرمول' : 'افزودن فرمول ریاضی'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="LaTeX"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            placeholder="\\frac{a}{b}"
            inputProps={{
              dir: 'ltr',
              style: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={displayMode}
                onChange={(e) => setDisplayMode(e.target.checked)}
              />
            }
            label="نمایش به‌صورت بلوک (فرمول مرکزی، خط جدید)"
          />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              نمادهای متداول
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {PRESETS.map((p) => (
                <ButtonBase
                  key={p.latex}
                  onClick={() => setLatex((cur) => (cur ? cur + ' ' + p.latex : p.latex))}
                  sx={{
                    minWidth: 44,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 13,
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  {p.label}
                </ButtonBase>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              پیش‌نمایش
            </Typography>
            <Box
              /* HTML `dir` attr + bidi isolation so KaTeX renders correctly
                 even though the surrounding MUI dialog is RTL. */
              dir="ltr"
              className={displayMode ? 'math-block' : 'math-inline'}
              sx={{
                p: 2,
                minHeight: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                fontSize: '1.05rem',
                /* Reset cursor — preview is not clickable to edit. */
                cursor: 'default',
                '&:hover': { backgroundColor: 'background.paper' },
                /* KaTeX glyphs don't need to overflow horizontally in display mode. */
                overflowX: 'auto',
              }}
              dangerouslySetInnerHTML={{
                __html:
                  previewHtml ||
                  '<span style="color:#9ca3af; font-family: var(--font-sans, sans-serif);">فرمول را وارد کنید…</span>',
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        {isEditing && onRemove && (
          <Button color="error" onClick={onRemove} sx={{ mr: 'auto' }}>
            حذف فرمول
          </Button>
        )}
        <Button onClick={onClose}>انصراف</Button>
        <Button
          variant="contained"
          disabled={!latex.trim()}
          onClick={() => onSubmit({ latex: latex.trim(), displayMode })}
        >
          {isEditing ? 'به‌روزرسانی' : 'درج'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
