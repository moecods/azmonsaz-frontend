"use client";

/**
 * Floating action toolbar that appears above a selected image inside the
 * editor. Built on Tiptap's `BubbleMenu` (which uses floating-ui under the
 * hood) so positioning stays glued to the node through resize / scroll /
 * viewport changes.
 *
 * All image editing actions live here:
 *   • Replace / re-upload
 *   • Crop (re-opens the dialog with the cropper active)
 *   • Edit alt text (inline popover)
 *   • Align left / center / right / clear
 *   • Set width preset (small / medium / large / full)
 *   • Delete
 */

import { useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CropIcon from '@mui/icons-material/Crop';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';

const SIZE_PRESETS: { label: string; width: number | null }[] = [
  { label: 'کوچک (۲۴۰)', width: 240 },
  { label: 'متوسط (۴۸۰)', width: 480 },
  { label: 'بزرگ (۷۲۰)', width: 720 },
  { label: 'کامل', width: null },
];

const ALIGNMENTS: {
  key: 'left' | 'center' | 'right' | null;
  label: string;
  icon: React.ReactElement;
}[] = [
  { key: 'left', label: 'چپ‌چین', icon: <FormatAlignLeftIcon fontSize="small" /> },
  { key: 'center', label: 'وسط‌چین', icon: <FormatAlignCenterIcon fontSize="small" /> },
  { key: 'right', label: 'راست‌چین', icon: <FormatAlignRightIcon fontSize="small" /> },
  { key: null, label: 'پاک کردن چینش', icon: <FormatClearIcon fontSize="small" /> },
];

export interface ImageBubbleMenuProps {
  editor: Editor;
  /** Open the upload dialog in default mode. */
  onReplace: () => void;
  /** Open the upload dialog with the cropper visible. */
  onCrop: () => void;
}

export function ImageBubbleMenu({ editor, onReplace, onCrop }: ImageBubbleMenuProps) {
  const [altAnchor, setAltAnchor] = useState<HTMLElement | null>(null);
  const [sizeAnchor, setSizeAnchor] = useState<HTMLElement | null>(null);

  const attrs = editor.getAttributes('image') as {
    src?: string;
    alt?: string | null;
    width?: number | string | null;
    align?: 'left' | 'center' | 'right' | null;
  };
  const [draftAlt, setDraftAlt] = useState(attrs.alt ?? '');

  const isActive = (k: 'left' | 'center' | 'right' | null) =>
    (attrs.align ?? null) === k;

  const setAlign = (k: 'left' | 'center' | 'right' | null) => {
    editor.chain().focus().updateAttributes('image', { align: k }).run();
  };

  const setWidth = (w: number | null) => {
    editor.chain().focus().updateAttributes('image', { width: w }).run();
    setSizeAnchor(null);
  };

  const saveAlt = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', { alt: draftAlt.trim() || null })
      .run();
    setAltAnchor(null);
  };

  const remove = () => editor.chain().focus().deleteSelection().run();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubbleMenu"
      shouldShow={({ editor: ed }) => ed.isActive('image')}
      // Render in the body so ancestor `overflow:hidden` / transforms can't clip
      // or hide the menu when the image is at the very top of the editor.
      appendTo={() => document.body}
      options={{
        strategy: 'fixed',
        placement: 'top',
        offset: 8,
        flip: { fallbackPlacements: ['bottom', 'top-start', 'bottom-start'] },
        shift: { padding: 8 },
      }}
      style={{ zIndex: 1300 }}
    >
      <Paper
        elevation={4}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          px: 0.5,
          py: 0.25,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <Tooltip title="جایگزینی تصویر" arrow>
          <IconButton size="small" onClick={onReplace}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="برش" arrow>
          <IconButton size="small" onClick={onCrop}>
            <CropIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="ویرایش متن جایگزین (alt)" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              setDraftAlt(attrs.alt ?? '');
              setAltAnchor(e.currentTarget);
            }}
          >
            <TextFieldsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />

        {ALIGNMENTS.map(({ key, label, icon }) => (
          <Tooltip key={String(key)} title={label} arrow>
            <IconButton
              size="small"
              color={isActive(key) ? 'primary' : 'default'}
              onClick={() => setAlign(key)}
            >
              {icon}
            </IconButton>
          </Tooltip>
        ))}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />

        <Tooltip title="اندازه" arrow>
          <IconButton size="small" onClick={(e) => setSizeAnchor(e.currentTarget)}>
            <PhotoSizeSelectSmallIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />

        <Tooltip title="حذف تصویر" arrow>
          <IconButton size="small" color="error" onClick={remove}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Alt text popover */}
      <Popover
        open={Boolean(altAnchor)}
        anchorEl={altAnchor}
        onClose={() => setAltAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 1.5, width: 320 } } }}
      >
        <Stack spacing={1}>
          <TextField
            autoFocus
            size="small"
            label="متن جایگزین (alt)"
            value={draftAlt}
            onChange={(e) => setDraftAlt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveAlt();
              }
            }}
            helperText="برای دسترس‌پذیری و SEO"
            fullWidth
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton size="small" onClick={() => setAltAnchor(null)} aria-label="انصراف">
              <FormatClearIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="primary" onClick={saveAlt} aria-label="ذخیره">
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Popover>

      {/* Size popover */}
      <Popover
        open={Boolean(sizeAnchor)}
        anchorEl={sizeAnchor}
        onClose={() => setSizeAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 0.5, minWidth: 180 } } }}
      >
        <Stack>
          {SIZE_PRESETS.map((p) => (
            <Box
              key={String(p.width)}
              role="button"
              tabIndex={0}
              onClick={() => setWidth(p.width)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setWidth(p.width);
              }}
              sx={{
                px: 1.25,
                py: 0.75,
                cursor: 'pointer',
                borderRadius: 0.75,
                fontSize: 14,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {p.label}
            </Box>
          ))}
        </Stack>
      </Popover>
    </BubbleMenu>
  );
}
