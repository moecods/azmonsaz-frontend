"use client";

/**
 * Shared label primitive for question/option/exam-content surfaces.
 *
 * Most of the rich text we display in lists, drawers, and previews comes from
 * the editor and may contain HTML (`<p>`, formatting, inline images, KaTeX
 * output, …) — but legacy / seed data is sometimes plain text. Rendering
 * either case through this component avoids the two main bugs we keep
 * hitting:
 *
 *   1. Plain `<Typography>{html}</Typography>` shows the markup as escaped
 *      text (`<p>foo</p>` literally on screen).
 *   2. Wrapping every plain string in `RichTextRenderer` works, but the
 *      block-level paragraph margins look wrong inside compact rows.
 *
 * `RichLabel` sniffs for HTML markers and either renders the editor's
 * `RichTextRenderer` (sanitised, math-rendered, image-styled) or falls back
 * to a plain inline `<span>` for raw strings.
 */

import { type CSSProperties } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

import { RichTextRenderer } from './RichTextRenderer';

/**
 * Heuristic: anything that contains a tag-like sequence is treated as HTML.
 * This intentionally errs on the side of "render through the sanitiser" —
 * a plain string with stray angle brackets ends up sanitised to itself.
 */
export function looksLikeHtml(value: string): boolean {
  return /<[a-z][^>]*>/i.test(value);
}

/**
 * Strip HTML tags and decode common entities so plain-text contexts (snippets,
 * confirmation dialogs, list filtering) can show user-readable copy without
 * markup leaking through.
 */
export function htmlToPlainText(value: string): string {
  if (!value) return '';
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = value;
    return (tmp.textContent ?? '').replace(/\s+/g, ' ').trim();
  }
  // SSR fallback — strip tags, collapse whitespace, decode the few entities
  // we frequently encounter in stored content.
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export interface RichLabelProps {
  html: string;
  /** Pass through to the underlying renderer's typography size. */
  fontSize?: CSSProperties['fontSize'];
  /** Use compact spacing (default) — better for dense rows. */
  compact?: boolean;
  /** Render as a block (default) instead of an inline `<span>` for the plain-text fallback. */
  block?: boolean;
  /** Extra sx merged into the renderer / span. */
  sx?: SxProps<Theme>;
  className?: string;
}

const DEFAULT_FONT_SIZE = '0.95rem';

/**
 * Render a string that *might* be HTML.
 *
 * For HTML inputs we delegate to `RichTextRenderer` (sanitised, math &
 * image post-processing, code highlighting). For plain strings we render a
 * lightweight box so we don't pay the renderer's effect cost on every row
 * of a list.
 */
export function RichLabel({
  html,
  fontSize = DEFAULT_FONT_SIZE,
  compact = true,
  block = true,
  sx,
  className,
}: RichLabelProps) {
  if (!html) return null;

  if (!looksLikeHtml(html)) {
    return (
      <Box
        component={block ? 'div' : 'span'}
        className={className}
        sx={{
          fontSize,
          minWidth: 0,
          flex: 1,
          whiteSpace: 'pre-wrap',
          ...sx,
        }}
      >
        {html}
      </Box>
    );
  }

  return (
    <RichTextRenderer
      html={html}
      compact={compact}
      className={className}
      sx={{
        display: block ? 'block' : 'inline',
        minWidth: 0,
        flex: block ? 1 : undefined,
        maxWidth: '100%',
        height: 'auto',
        maxHeight: 'none',
        fontSize,
        verticalAlign: block ? undefined : 'baseline',
        '& > :first-child': { marginTop: 0 },
        '& > :last-child': { marginBottom: 0 },
        ...(compact
          ? {
              '& p': { margin: 0, display: block ? 'block' : 'inline' },
              '& p + p': { marginTop: block ? '0.35em' : 0 },
              '& ul, & ol': { marginBlock: block ? '0.25em' : 0, display: block ? 'block' : 'inline' },
            }
          : {}),
        ...sx,
      }}
    />
  );
}

export default RichLabel;
