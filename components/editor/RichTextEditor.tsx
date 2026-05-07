"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, LinearProgress, Snackbar, Stack, Typography } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';

import { buildExtensions, type EditorPreset } from './extensions';
import { EditorToolbar } from './toolbar/EditorToolbar';
import { ImageBubbleMenu } from './toolbar/ImageBubbleMenu';
import { ImageCropOverlay } from './toolbar/ImageCropOverlay';
import { ImageDialog } from './toolbar/ImageDialog';
import type { ProgressEvent } from './lib/image-utils';
import './editor.css';

const PROGRESS_LABEL: Record<ProgressEvent['stage'], string> = {
  reading: 'در حال خواندن تصویر…',
  decoding: 'در حال رمزگشایی…',
  cropping: 'برش…',
  compressing: 'فشرده‌سازی تصویر…',
  encoding: 'آماده‌سازی نهایی…',
  done: '',
};

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  preset?: EditorPreset;
  /** Min vertical size for the writing area. Defaults vary by preset. */
  minHeight?: number;
  /** Max vertical size before scrolling kicks in. */
  maxHeight?: number;
  /** Visually flatten — no border/background, used inside compact contexts. */
  flat?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onReady?: (editor: Editor) => void;
}

const isEmptyHtml = (html: string) =>
  !html ||
  html === '<p></p>' ||
  html.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/g, '').trim() === '';

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  preset = 'full',
  minHeight,
  maxHeight,
  flat = false,
  disabled = false,
  ariaLabel,
  onReady,
}: RichTextEditorProps) {
  const lastEmittedRef = useRef<string>(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [imageProgress, setImageProgress] = useState<ProgressEvent | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageDialog, setImageDialog] = useState<{ open: boolean }>({ open: false });
  const [cropOpen, setCropOpen] = useState(false);

  const onImageProgress = useCallback((p: ProgressEvent) => {
    setImageProgress(p.stage === 'done' ? null : p);
  }, []);
  const onImageError = useCallback((err: Error) => {
    setImageError(err.message);
    setImageProgress(null);
  }, []);

  const extensions = useMemo(
    () => buildExtensions({ preset, placeholder, onImageProgress, onImageError }),
    [preset, placeholder, onImageProgress, onImageError],
  );

  const editor = useEditor({
    extensions,
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'tiptap rich-text-content',
        /** RTL-first; per-block `dir` from TextDirection overrides for LTR/auto. */
        dir: 'rtl',
        spellcheck: 'true',
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
      },
      transformPastedHTML(html) {
        // Light cleanup for Word/Google Docs paste noise (keeps structure, drops conditional blocks).
        return html
          .replace(/<!--\[if[^\]]*]>[\s\S]*?<!\[endif]-->/gi, '')
          .replace(/<o:p>\s*<\/o:p>/gi, '')
          .replace(/\s+xmlns="http:\/\/www\.w3\.org\/[^"]*"/gi, '');
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const next = isEmptyHtml(html) ? '' : html;
      if (next === lastEmittedRef.current) return;
      lastEmittedRef.current = next;
      onChangeRef.current(next);
    },
  });

  // Keep external value in sync (e.g. when react-hook-form resets the form)
  // without breaking the user's current selection during normal typing.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedRef.current) return;
    const current = editor.getHTML();
    const incoming = value || '<p></p>';
    if (current === incoming) return;
    editor.commands.setContent(incoming, { emitUpdate: false });
    lastEmittedRef.current = value;
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    if (editor.isEditable === !disabled) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (editor && onReady) onReady(editor);
  }, [editor, onReady]);

  if (!editor) {
    return (
      <Box
        sx={{
          minHeight: minHeight ?? (preset === 'minimal' ? 60 : 200),
          borderRadius: 1.5,
          border: flat ? 'none' : '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      />
    );
  }

  const resolvedMinHeight = minHeight ?? (preset === 'minimal' ? 60 : 220);

  return (
    <Box
      className={`rich-text-editor preset-${preset}${flat ? ' flat' : ''}`}
      sx={{
        position: 'relative',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        ...(flat
          ? {}
          : {
              border: '1px solid',
              borderColor: 'divider',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}1f`,
              },
            }),
        '& .ProseMirror': {
          padding: preset === 'minimal' ? '8px 12px' : '14px 16px',
          minHeight: resolvedMinHeight,
          ...(maxHeight ? { maxHeight, overflowY: 'auto' } : {}),
          outline: 'none !important',
          fontSize: preset === 'minimal' ? '0.95rem' : '1rem',
          lineHeight: 1.7,
        },
      }}
    >
      <EditorToolbar editor={editor} preset={preset} />
      <EditorContent editor={editor} />

      <ImageBubbleMenu
        editor={editor}
        onReplace={() => setImageDialog({ open: true })}
        onCrop={() => setCropOpen(true)}
      />

      {cropOpen && <ImageCropOverlay editor={editor} onClose={() => setCropOpen(false)} />}

      <ImageDialog
        open={imageDialog.open}
        initial={
          editor.isActive('image')
            ? (editor.getAttributes('image') as { src?: string; alt?: string })
            : null
        }
        onClose={() => setImageDialog({ open: false })}
        onSubmit={({ src, alt, width, height }) => {
          if (editor.isActive('image')) {
            editor
              .chain()
              .focus()
              .updateAttributes('image', {
                src,
                alt: alt ?? null,
                width: width ?? null,
                height: height ?? null,
              })
              .run();
          } else {
            editor
              .chain()
              .focus()
              .setImage({ src, alt })
              .updateAttributes('image', {
                width: width ?? null,
                height: height ?? null,
              })
              .run();
          }
          setImageDialog({ open: false });
        }}
      />

      {imageProgress && (
        <Stack
          sx={{
            position: 'absolute',
            insetInlineStart: 12,
            insetInlineEnd: 12,
            bottom: 8,
            zIndex: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: 1.5,
            py: 1,
            boxShadow: 1,
          }}
          spacing={0.5}
        >
          <Typography variant="caption" color="text.secondary">
            {PROGRESS_LABEL[imageProgress.stage] || 'در حال پردازش…'}
          </Typography>
          <LinearProgress
            variant={imageProgress.progress != null ? 'determinate' : 'indeterminate'}
            value={imageProgress.progress != null ? imageProgress.progress * 100 : undefined}
          />
        </Stack>
      )}

      <Snackbar
        open={Boolean(imageError)}
        autoHideDuration={5000}
        onClose={() => setImageError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setImageError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {imageError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
