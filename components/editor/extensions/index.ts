/**
 * Curated Tiptap extension set for the question editor.
 * Two presets:
 *  - "full"    → question text (tables, images, code, math…)
 *  - "minimal" → option text (marks, lists, math, images, links, alignment)
 */

import type { Extension, Mark, Node } from '@tiptap/core';
import { extensions } from '@tiptap/core';

import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Code } from '@tiptap/extension-code';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-text-style/color';
import { BackgroundColor } from '@tiptap/extension-text-style/background-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { ConfigurableImage } from './Image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table/row';
import { TableHeader } from '@tiptap/extension-table/header';
import { TableCell } from '@tiptap/extension-table/cell';
import { Placeholder, Dropcursor, Gapcursor, TrailingNode, UndoRedo } from '@tiptap/extensions';

import { createLowlight, common } from 'lowlight';

import { MathBlock, MathInline } from './Math';
import { Layout, LayoutColumn } from './Layout';
import type { ProgressCallback } from '../lib/image-utils';

export type EditorPreset = 'full' | 'minimal';

export interface BuildExtensionsOptions {
  preset?: EditorPreset;
  placeholder?: string;
  /** Fired during drop/paste image processing (compression progress). */
  onImageProgress?: ProgressCallback;
  /** Fired when drop/paste image processing fails. */
  onImageError?: (error: Error) => void;
}

const lowlight = createLowlight(common);

type AnyExt = Extension | Node | Mark;

/**
 * Inline images. The resize NodeView is implemented by ConfigurableImage
 * itself, so we explicitly disable the upstream resize wrapper here.
 */
function makeImageExtension(opts: BuildExtensionsOptions) {
  return ConfigurableImage.configure({
    inline: true,
    allowBase64: true,
    resize: false,
    HTMLAttributes: {
      class: 'tiptap-image',
    },
    onProgress: opts.onImageProgress,
    onError: opts.onImageError,
  });
}

const linkExtension = Link.configure({
  openOnClick: false,
  autolink: true,
  protocols: ['http', 'https', 'mailto', 'tel'],
  HTMLAttributes: {
    rel: 'noopener noreferrer nofollow',
    target: '_blank',
  },
});

/** Code blocks are always LTR for readability. */
const codeBlockExtension = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: 'plaintext',
  HTMLAttributes: {
    dir: 'ltr',
    class: 'code-block-ltr',
    spellcheck: 'false',
  },
});

/**
 * Default document direction RTL (Persian). Per-block `dir` can be changed via
 * `setTextDirection` / `unsetTextDirection` (from @tiptap/core commands).
 */
const textDirectionExtension = extensions.TextDirection.configure({
  direction: 'rtl',
});

export function buildExtensions(options: BuildExtensionsOptions = {}): AnyExt[] {
  const { preset = 'full', placeholder = '' } = options;
  const imageExtension = makeImageExtension(options);

  const shared: AnyExt[] = [
    Document,
    Paragraph,
    Text,
    HardBreak,

    Bold,
    Italic,
    Underline,
    Strike,
    Code,
    Subscript,
    Superscript,

    TextStyle,
    Color,
    BackgroundColor,

    ListItem,
    BulletList,
    OrderedList,

    MathInline,
    MathBlock,

    UndoRedo,

    Dropcursor.configure({ width: 2, color: 'currentColor' }),
    Gapcursor,
    TrailingNode,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      includeChildren: false,
    }),

    // Must load after node types exist so `dir` is registered on paragraphs, etc.
    textDirectionExtension,
  ];

  if (preset === 'minimal') {
    return [
      ...shared,
      TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      linkExtension,
      imageExtension,
    ];
  }

  return [
    ...shared,
    Heading.configure({ levels: [1, 2, 3] }),
    Blockquote,
    HorizontalRule,

    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    }),

    linkExtension,
    imageExtension,

    codeBlockExtension,

    Table.configure({
      resizable: true,
      cellMinWidth: 60,
      handleWidth: 4,
      lastColumnResizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,

    Layout,
    LayoutColumn,
  ];
}
