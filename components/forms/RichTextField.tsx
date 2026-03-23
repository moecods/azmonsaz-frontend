"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  minHeight?: number;
}

export function RichTextField({
  value,
  onChange,
  label,
  placeholder = 'متن را وارد کنید...',
  error,
  helperText,
  minHeight = 120,
}: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (el) onChange(el.innerHTML || '');
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  return (
    <Box>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Stack spacing={0.5}>
        <ToggleButtonGroup size="small" sx={{ flexWrap: 'wrap' }}>
          <ToggleButton value="bold" onClick={() => execCommand('bold')} aria-label="Bold">
            <FormatBoldIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="italic" onClick={() => execCommand('italic')} aria-label="Italic">
            <FormatItalicIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="ul" onClick={() => execCommand('insertUnorderedList')} aria-label="List">
            <FormatListBulletedIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="ol" onClick={() => execCommand('insertOrderedList')} aria-label="Numbered list">
            <FormatListNumberedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <Box
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          sx={{
            minHeight,
            p: 1.5,
            border: 1,
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            outline: 'none',
            '&:focus': {
              borderColor: error ? 'error.main' : 'primary.main',
              borderWidth: 2,
            },
            '&:empty::before': {
              content: 'attr(data-placeholder)',
              color: 'text.disabled',
            },
            '& ul, & ol': { pl: 3, my: 0.5, listStyle: 'initial' },
          }}
        />
      </Stack>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
