"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type Ref,
} from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';

import { renderMathIn } from './extensions/Math';
import './editor.css';

export interface RichTextRendererProps {
  html: string;
  className?: string;
  sx?: SxProps<Theme>;
  /** Smaller content typography (e.g. inside option rows). */
  compact?: boolean;
  /** Root text direction; default RTL for Persian-first content. Inner `dir` from stored HTML still applies. */
  dir?: 'rtl' | 'ltr' | 'auto';
}

let dompurifyConfigured = false;
function ensureDOMPurifyConfig() {
  if (dompurifyConfigured) return;
  if (typeof window === 'undefined') return;
  // Allow KaTeX output (lots of class/style) and our math containers.
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName.startsWith('data-')) {
      data.keepAttr = true;
    }
  });
  dompurifyConfigured = true;
}

const ALLOWED_TAGS = [
  // text & headings
  'p', 'br', 'span', 'strong', 'em', 'u', 's', 'sub', 'sup', 'mark', 'small',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // lists
  'ul', 'ol', 'li',
  // block
  'blockquote', 'hr', 'pre', 'code',
  // links, images
  'a', 'img', 'figure', 'figcaption',
  // tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
  // KaTeX rendered output uses these
  'div', 'svg', 'path', 'g', 'use', 'defs', 'rect', 'line', 'polyline', 'polygon',
  'annotation', 'semantics', 'mrow', 'mi', 'mn', 'mo', 'msup', 'msub', 'mfrac', 'msqrt',
];

const ALLOWED_ATTRS = [
  'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
  'colspan', 'rowspan', 'align', 'valign', 'width', 'height',
  'aria-hidden', 'role', 'lang', 'dir',
  'd', 'fill', 'stroke', 'stroke-width', 'viewBox', 'xmlns', 'transform',
  'aria-label',
];

function sanitize(html: string): string {
  if (typeof window === 'undefined') {
    // SSR — return as-is; client effect will re-sanitize on mount.
    return html;
  }
  ensureDOMPurifyConfig();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: true,
    KEEP_CONTENT: true,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ADD_TAGS: ['svg', 'path'],
  });
}

function assignRef<T>(r: Ref<T> | undefined, v: T | null) {
  if (!r) return;
  if (typeof r === 'function') (r as (x: T | null) => void)(v);
  else (r as MutableRefObject<T | null>).current = v;
}

export const RichTextRenderer = forwardRef<HTMLDivElement, RichTextRendererProps>(
  function RichTextRenderer(
    { html, className, sx, compact = false, dir = 'rtl' }: RichTextRendererProps,
    forwardedRef,
  ) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      localRef.current = el;
      assignRef(forwardedRef, el);
    },
    [forwardedRef],
  );

  const safe = useMemo(() => sanitize(html ?? ''), [html]);
  const innerHtml = useMemo(() => ({ __html: safe }), [safe]);

  /*
   * Run after every render (no deps) — not just when `safe` changes.
   *
   * Why? If a parent re-renders for any reason (e.g. a controlled value
   * changes — clicking an option in a question preview, focus shifts, theme
   * toggles, etc.), React may re-apply `dangerouslySetInnerHTML` and replace
   * the post-processed inner DOM (image wrappers, math output, highlighted
   * code) with the raw sanitized HTML. Re-running our post-processors on every
   * commit guarantees the displayed DOM stays consistent. All three calls are
   * idempotent — `renderMathIn`, `wrapImagesIn`, and the hljs flag check —
   * so the cost is just the querySelectorAll lookups.
   */
  useEffect(() => {
    const root = localRef.current;
    if (!root) return;
    renderMathIn(root);
    wrapImagesIn(root);
    root.querySelectorAll<HTMLElement>('pre code').forEach((block) => {
      if (block.dataset.hljsApplied === '1') return;
      try {
        hljs.highlightElement(block);
        block.dataset.hljsApplied = '1';
      } catch {
        // Highlight.js may fail on languages without a registered grammar — silent.
      }
    });
  });

  if (!html) {
    return null;
  }

  return (
    <Box
      ref={setRef}
      className={`rich-text-content tiptap${compact ? ' compact' : ''}${className ? ' ' + className : ''}`}
      sx={{
        overflow: 'visible',
        maxHeight: 'none',
        ...sx,
      }}
      dir={dir}
      dangerouslySetInnerHTML={innerHtml}
    />
  );
});

RichTextRenderer.displayName = 'RichTextRenderer';

/**
 * Wrap every <img> with a `<span data-image-node>` so the same CSS that styles
 * the editor's NodeView wrapper (alignment, inline-block flow, sizing caps)
 * also applies in preview. The `data-align` attribute mirrors onto the
 * wrapper for the float/center rules. Idempotent — already-wrapped images are
 * skipped so we can safely run it on every effect.
 */
function wrapImagesIn(root: HTMLElement) {
  const imgs = root.querySelectorAll<HTMLImageElement>('img');
  imgs.forEach((img) => {
    const parent = img.parentElement;
    if (!parent) return;
    if (parent.dataset?.imageNode === '') return;

    const span = document.createElement('span');
    span.dataset.imageNode = '';
    const align = img.getAttribute('data-align');
    if (align) span.dataset.align = align;

    parent.insertBefore(span, img);
    span.appendChild(img);
  });
}

export default RichTextRenderer;
