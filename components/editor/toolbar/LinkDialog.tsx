"use client";

import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

export interface LinkDialogProps {
  open: boolean;
  initialUrl?: string;
  initialText?: string;
  selectionEmpty?: boolean;
  onClose: () => void;
  onSubmit: (params: { url: string; text?: string }) => void;
  onRemove?: () => void;
}

export function LinkDialog({
  open,
  initialUrl = '',
  initialText = '',
  selectionEmpty = false,
  onClose,
  onSubmit,
  onRemove,
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setText(initialText);
    }
  }, [open, initialUrl, initialText]);

  const handleSubmit = () => {
    if (!url.trim()) return;
    onSubmit({ url: url.trim(), text: selectionEmpty ? text.trim() || url.trim() : undefined });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initialUrl ? 'ویرایش لینک' : 'افزودن لینک'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="آدرس (URL)"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            inputProps={{ dir: 'ltr' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {selectionEmpty && (
            <TextField
              label="متن لینک"
              placeholder="متنی که نمایش داده می‌شود"
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {initialUrl && onRemove && (
          <Button color="error" onClick={onRemove} sx={{ mr: 'auto' }}>
            حذف لینک
          </Button>
        )}
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!url.trim()}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
