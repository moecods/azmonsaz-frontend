"use client";

/**
 * In-place image cropper.
 *
 * When the user clicks "Crop" on the image bubble menu, this component is
 * rendered as a portal to <body>. It anchors itself to the bounding rect of
 * the currently selected image inside the editor and overlays:
 *
 *   • A dimming mask that highlights the active crop rectangle.
 *   • Eight drag handles (4 corners + 4 edge midpoints) that resize the crop
 *     rectangle directly on top of the image.
 *   • Drag-the-rect-itself to translate the crop window.
 *   • A small Apply / Cancel toolbar floating below the image.
 *
 * On apply, the crop is re-encoded through `cropImageToBlob` (canvas), uploaded
 * via `mediaService.upload`, and the image node's `src` / dimensions are
 * updated to point at the freshly-stored URL.
 *
 * No external library — we build this directly so the handles align pixel-
 * perfectly with the actual image position in the editor and the gesture is
 * pure "drag-the-image-corners" as requested.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Box, Button, CircularProgress, Stack, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { Editor } from '@tiptap/core';

import { cropImageToBlob, type CropRect } from '../lib/image-utils';
import { mediaService } from '@/services';

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MIN_FRAC = 0.05;

export interface ImageCropOverlayProps {
  editor: Editor;
  onClose: () => void;
}

export function ImageCropOverlay({ editor, onClose }: ImageCropOverlayProps) {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, w: 1, h: 1 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    start: Rect;
  } | null>(null);

  /*
   * Locate the selected image's DOM element + its bounding rect.
   *
   * We try (in order):
   *   1. Our own NodeView wrapper that has `is-selected` (the most reliable —
   *      ProseMirror only calls `selectNode` on the NodeView whose node is
   *      part of the active NodeSelection).
   *   2. ProseMirror's own `.ProseMirror-selectednode` class (fallback when
   *      the NodeView didn't get a chance to mark itself selected, e.g.
   *      stale renders).
   *   3. `view.nodeDOM(from)` as a last resort.
   */
  useEffect(() => {
    const view = editor.view;
    const root = view.dom;

    let el: HTMLImageElement | null = null;
    const selectedWrapper = root.querySelector(
      '[data-image-node].is-selected, [data-image-node].ProseMirror-selectednode',
    ) as HTMLElement | null;
    if (selectedWrapper) {
      el = selectedWrapper.querySelector('img');
    }
    if (!el) {
      const direct = root.querySelector('img.ProseMirror-selectednode');
      if (direct instanceof HTMLImageElement) el = direct;
    }
    if (!el) {
      try {
        const dom = view.nodeDOM(view.state.selection.from);
        if (dom instanceof HTMLImageElement) el = dom;
        else if (dom instanceof HTMLElement) el = dom.querySelector('img');
      } catch {
        /* ignore */
      }
    }

    if (!el) {
      onClose();
      return;
    }
    setImgEl(el);
    setRect(el.getBoundingClientRect());
  }, [editor, onClose]);

  /* Keep the rect in sync if the page scrolls / window resizes. */
  useEffect(() => {
    if (!imgEl) return;
    const update = () => setRect(imgEl.getBoundingClientRect());
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [imgEl]);

  /* Pointer-based drag for the crop rectangle and its handles. */
  useEffect(() => {
    if (!rect) return;

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current || !rect) return;
      const { handle, startX, startY, start } = dragRef.current;
      const dxFrac = (e.clientX - startX) / rect.width;
      const dyFrac = (e.clientY - startY) / rect.height;

      let { x, y, w, h } = start;

      switch (handle) {
        case 'move': {
          x = clamp(start.x + dxFrac, 0, 1 - w);
          y = clamp(start.y + dyFrac, 0, 1 - h);
          break;
        }
        case 'nw': {
          const nx = clamp(start.x + dxFrac, 0, start.x + start.w - MIN_FRAC);
          const ny = clamp(start.y + dyFrac, 0, start.y + start.h - MIN_FRAC);
          w = start.w - (nx - start.x);
          h = start.h - (ny - start.y);
          x = nx;
          y = ny;
          break;
        }
        case 'n': {
          const ny = clamp(start.y + dyFrac, 0, start.y + start.h - MIN_FRAC);
          h = start.h - (ny - start.y);
          y = ny;
          break;
        }
        case 'ne': {
          const ny = clamp(start.y + dyFrac, 0, start.y + start.h - MIN_FRAC);
          h = start.h - (ny - start.y);
          y = ny;
          w = clamp(start.w + dxFrac, MIN_FRAC, 1 - start.x);
          break;
        }
        case 'e': {
          w = clamp(start.w + dxFrac, MIN_FRAC, 1 - start.x);
          break;
        }
        case 'se': {
          w = clamp(start.w + dxFrac, MIN_FRAC, 1 - start.x);
          h = clamp(start.h + dyFrac, MIN_FRAC, 1 - start.y);
          break;
        }
        case 's': {
          h = clamp(start.h + dyFrac, MIN_FRAC, 1 - start.y);
          break;
        }
        case 'sw': {
          const nx = clamp(start.x + dxFrac, 0, start.x + start.w - MIN_FRAC);
          w = start.w - (nx - start.x);
          x = nx;
          h = clamp(start.h + dyFrac, MIN_FRAC, 1 - start.y);
          break;
        }
        case 'w': {
          const nx = clamp(start.x + dxFrac, 0, start.x + start.w - MIN_FRAC);
          w = start.w - (nx - start.x);
          x = nx;
          break;
        }
      }

      setCrop({ x, y, w, h });
    };

    const onUp = () => {
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [rect]);

  const startDrag = useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        start: { ...crop },
      };
      document.body.style.userSelect = 'none';
      document.body.style.cursor = handleCursor(handle);
    },
    [crop],
  );

  const reset = () => setCrop({ x: 0, y: 0, w: 1, h: 1 });

  const apply = async () => {
    if (!editor.isActive('image') || !imgEl || !rect) {
      onClose();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const attrs = editor.getAttributes('image') as {
        src?: string;
        width?: number | string | null;
        height?: number | string | null;
      };
      if (!attrs.src) throw new Error('no-src');
      const cropRect: CropRect = { x: crop.x, y: crop.y, width: crop.w, height: crop.h };

      /*
       * Preserve the user's *displayed* scale across the crop.
       *
       * Without this, cropping a manually-resized image would snap it back to
       * the natural pixel size of the cropped region (e.g. an image scaled
       * down to 200px wide would jump to ~800px after a half-width crop).
       * We instead compute the new on-page size as `displayed × cropFraction`
       * so the in-canvas size of the cropped region equals what the user
       * sees through the crop frame at the moment of cutting.
       */
      const displayedWidth = parseFloatOr(attrs.width, rect.width);
      const displayedHeight = parseFloatOr(attrs.height, rect.height);
      const targetWidth = Math.max(1, Math.round(displayedWidth * crop.w));
      const targetHeight = Math.max(1, Math.round(displayedHeight * crop.h));

      // Re-encode the cropped region in-canvas, then upload — the editor never
      // stores base64 even for transient cropped output.
      const { blob, mime } = await cropImageToBlob(attrs.src, cropRect);
      const uploaded = await mediaService.upload(blob, {
        filename: `crop.${mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1]}`,
        collection: 'editor',
      });

      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          src: uploaded.url,
          width: targetWidth,
          height: targetHeight,
        })
        .run();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'crop-failed');
      setBusy(false);
    }
  };

  /* Render */
  if (!rect) return null;

  const cropPx = {
    left: rect.left + crop.x * rect.width,
    top: rect.top + crop.y * rect.height,
    width: crop.w * rect.width,
    height: crop.h * rect.height,
  };

  /*
   * IMPORTANT: This project ships an Emotion cache configured with
   * `stylis-plugin-rtl`, which auto-flips physical CSS properties (`left` ↔
   * `right`, etc.) on anything authored through MUI's `sx` prop. That makes
   * `sx={{ left: pixelValue }}` render as `right: pixelValue`, which would
   * mirror the crop overlay across the viewport.
   *
   * For every viewport-pixel coordinate below we therefore use a plain inline
   * `style` prop on `<div>` (Emotion is bypassed entirely). MUI components are
   * still used for the bottom toolbar styling, but they're nested inside a
   * raw <div> that handles the positioning.
   */
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        pointerEvents: 'none',
      }}
    >
      {/* Page-level dim mask (built from 4 strips around the crop). */}
      <Mask rect={rect} crop={crop} onCancel={onClose} />

      {/* Crop rectangle */}
      <div
        onPointerDown={startDrag('move')}
        style={{
          position: 'fixed',
          left: cropPx.left,
          top: cropPx.top,
          width: cropPx.width,
          height: cropPx.height,
          border: '1.5px dashed #fff',
          boxSizing: 'border-box',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.45)',
          cursor: 'move',
          pointerEvents: 'auto',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: 'calc(33.333% + 0.5px) calc(33.333% + 0.5px)',
        }}
      >
        {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((h) => (
          <div
            key={h}
            onPointerDown={startDrag(h)}
            data-handle={h}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              backgroundColor: '#fff',
              border: '1px solid #2563eb',
              borderRadius: 4,
              boxSizing: 'border-box',
              cursor: handleCursor(h),
              pointerEvents: 'auto',
              ...handlePosition(h),
            }}
          />
        ))}
      </div>

      {/* Floating toolbar below the image */}
      <div
        style={{
          position: 'fixed',
          left: rect.left + rect.width / 2,
          top: rect.bottom + 12,
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Tooltip title="بازنشانی">
            <span>
              <Button
                size="small"
                variant="text"
                color="inherit"
                startIcon={<RestartAltIcon fontSize="small" />}
                onClick={reset}
                disabled={busy}
              >
                بازنشانی
              </Button>
            </span>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<CloseIcon fontSize="small" />}
            onClick={onClose}
            disabled={busy}
          >
            انصراف
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={busy ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
            onClick={apply}
            disabled={busy}
          >
            اعمال برش
          </Button>
        </Stack>
        {error && (
          <Box sx={{ mt: 0.5, color: 'error.main', fontSize: 12, textAlign: 'center' }}>
            {error}
          </Box>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ---------- helpers ---------- */

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Tiptap's image attrs may carry the width as a number, a CSS string ("200px",
 * "50%"), or be missing. We need a positive pixel value for the crop math.
 * Strings such as "50%" can't be resolved without the parent box, so we fall
 * back to the live measurement in that case.
 */
function parseFloatOr(value: number | string | null | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    if (Number.isFinite(n) && n > 0 && !value.trim().endsWith('%')) return n;
  }
  return fallback;
}

function handleCursor(h: Handle): string {
  switch (h) {
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    default:
      return 'move';
  }
}

function handlePosition(h: Exclude<Handle, 'move'>): CSSProperties {
  const center = 'calc(50% - 6px)';
  const start = -6;
  switch (h) {
    case 'nw':
      return { top: start, left: start };
    case 'n':
      return { top: start, left: center };
    case 'ne':
      return { top: start, right: start };
    case 'e':
      return { top: center, right: start };
    case 'se':
      return { bottom: start, right: start };
    case 's':
      return { bottom: start, left: center };
    case 'sw':
      return { bottom: start, left: start };
    case 'w':
      return { top: center, left: start };
    default:
      return {};
  }
}

interface MaskProps {
  rect: DOMRect;
  crop: Rect;
  onCancel: () => void;
}

function Mask({ rect, crop, onCancel }: MaskProps) {
  const cropL = rect.left + crop.x * rect.width;
  const cropT = rect.top + crop.y * rect.height;
  const cropW = crop.w * rect.width;
  const cropH = crop.h * rect.height;
  const cropB = cropT + cropH;

  // Plain inline styles so the project's RTL stylis plugin doesn't auto-flip
  // these viewport-pixel values.
  const common: CSSProperties = {
    position: 'fixed',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    pointerEvents: 'auto',
  };

  return (
    <>
      {/* top */}
      <div
        onClick={onCancel}
        style={{ ...common, left: 0, top: 0, right: 0, height: cropT }}
      />
      {/* bottom */}
      <div
        onClick={onCancel}
        style={{ ...common, left: 0, top: cropB, right: 0, bottom: 0 }}
      />
      {/* left */}
      <div
        onClick={onCancel}
        style={{ ...common, left: 0, top: cropT, width: cropL, height: cropH }}
      />
      {/* right */}
      <div
        onClick={onCancel}
        style={{ ...common, left: cropL + cropW, top: cropT, right: 0, height: cropH }}
      />
    </>
  );
}
