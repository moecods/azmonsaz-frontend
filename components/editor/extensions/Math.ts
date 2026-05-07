/**
 * Lightweight KaTeX-based math nodes for Tiptap.
 *
 * Two nodes:
 *  - mathInline  → atomic inline node, e.g. $a^2 + b^2 = c^2$
 *  - mathBlock   → atomic block node, e.g. $$\frac{1}{2}$$
 *
 * Storage format (kept compact, framework-agnostic):
 *  - <span data-math-inline data-latex="..."></span>
 *  - <div  data-math-block  data-latex="..."></div>
 *
 * The HTML serialized by the editor only carries `data-latex`; KaTeX is rendered
 * either inside the editor (via NodeView) or by the matching renderer at view
 * time. This keeps stored content tiny and allows re-rendering on theme changes.
 */

import { mergeAttributes, Node } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import type { EditorState } from '@tiptap/pm/state';
import katex from 'katex';

/**
 * DOM event name dispatched when a user clicks on a math node inside the
 * editor. The toolbar / wrapper component listens for this on the editor's
 * root and opens the math edit dialog.
 */
export const MATH_EDIT_EVENT = 'azm:math-edit-request';

export const MATH_INLINE_NAME = 'mathInline';
export const MATH_BLOCK_NAME = 'mathBlock';

export interface MathAttributes {
  latex: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      insertMathInline: (latex: string) => ReturnType;
      insertMathBlock: (latex: string) => ReturnType;
      updateMath: (latex: string) => ReturnType;
      deleteMath: () => ReturnType;
    };
  }
}

/** Resolve selected or adjacent math node (inline or block). */
export function findMathAtSelection(state: EditorState): {
  pos: number;
  nodeType: typeof MATH_INLINE_NAME | typeof MATH_BLOCK_NAME;
} | null {
  const sel = state.selection;
  if (sel instanceof NodeSelection) {
    const n = sel.node;
    if (n.type.name === MATH_INLINE_NAME || n.type.name === MATH_BLOCK_NAME) {
      return {
        pos: sel.from,
        nodeType: n.type.name as typeof MATH_INLINE_NAME | typeof MATH_BLOCK_NAME,
      };
    }
  }
  const $from = sel.$from;
  const before = $from.nodeBefore;
  if (before?.type.name === MATH_INLINE_NAME || before?.type.name === MATH_BLOCK_NAME) {
    return {
      pos: $from.pos - before.nodeSize,
      nodeType: before.type.name as typeof MATH_INLINE_NAME | typeof MATH_BLOCK_NAME,
    };
  }
  const after = $from.nodeAfter;
  if (after?.type.name === MATH_INLINE_NAME || after?.type.name === MATH_BLOCK_NAME) {
    return {
      pos: $from.pos,
      nodeType: after.type.name as typeof MATH_INLINE_NAME | typeof MATH_BLOCK_NAME,
    };
  }
  return null;
}

/**
 * Render LaTeX to a KaTeX HTML string. Used by the editor NodeView, the
 * read-only renderer, AND the math edit dialog so all three views stay
 * pixel-identical.
 */
export function renderKatex(latex: string, displayMode: boolean): string {
  if (!latex) {
    return '<span class="math-empty">∑</span>';
  }
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      // htmlAndMathml gives assistive-tech parity without changing visuals.
      output: 'htmlAndMathml',
      strict: 'ignore',
    });
  } catch {
    return `<span class="math-error">${escapeHtml(latex)}</span>`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const baseAttrs = {
  latex: {
    default: '',
    parseHTML: (el: HTMLElement) => el.getAttribute('data-latex') ?? '',
    renderHTML: (attrs: Record<string, unknown>) => ({
      'data-latex': String(attrs.latex ?? ''),
    }),
  },
};

const sharedNodeView = (displayMode: boolean) => () => {
  const dom = document.createElement(displayMode ? 'div' : 'span');
  dom.setAttribute(displayMode ? 'data-math-block' : 'data-math-inline', '');
  /** Force LTR so KaTeX (which depends on directional CSS) renders correctly inside RTL content. */
  dom.setAttribute('dir', 'ltr');
  dom.classList.add(displayMode ? 'math-block' : 'math-inline');
  dom.contentEditable = 'false';
  dom.setAttribute('role', 'button');
  dom.setAttribute('tabindex', '0');
  dom.title = 'برای ویرایش کلیک کنید';

  const requestEdit = () => {
    dom.dispatchEvent(
      new CustomEvent(MATH_EDIT_EVENT, { bubbles: true, composed: true }),
    );
  };

  // Click selects the atom node automatically; we use mousedown so the
  // dialog opens in the same gesture (after PM finishes the selection).
  dom.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(requestEdit, 0);
  });
  dom.addEventListener('keydown', ((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      requestEdit();
    }
  }) as EventListener);

  return {
    dom,
    update: (node: { attrs: { latex?: string } }) => {
      const latex = node.attrs.latex ?? '';
      dom.setAttribute('data-latex', latex);
      dom.innerHTML = renderKatex(latex, displayMode);
      return true;
    },
  };
};

export const MathInline = Node.create({
  name: MATH_INLINE_NAME,
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  marks: '',

  addAttributes: () => baseAttrs,

  parseHTML() {
    return [
      {
        tag: 'span[data-math-inline]',
        getAttrs: (el: HTMLElement | string) => {
          if (typeof el === 'string') return null;
          return { latex: el.getAttribute('data-latex') ?? '' };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-math-inline': '',
        dir: 'ltr',
        class: 'math-inline',
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const { dom, update } = sharedNodeView(false)();
      update(node as never);
      return {
        dom,
        update: (n) => {
          if (n.type.name !== MATH_INLINE_NAME) return false;
          return update(n as never);
        },
      };
    };
  },

  addCommands() {
    return {
      insertMathInline:
        (latex: string) =>
        ({ chain }) => {
          const trimmed = latex.trim();
          if (!trimmed) return false;
          return chain()
            .focus()
            .insertContent({
              type: MATH_INLINE_NAME,
              attrs: { latex: trimmed },
            })
            .run();
        },
    };
  },
});

export const MathBlock = Node.create({
  name: MATH_BLOCK_NAME,
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes: () => baseAttrs,

  parseHTML() {
    return [
      {
        tag: 'div[data-math-block]',
        getAttrs: (el: HTMLElement | string) => {
          if (typeof el === 'string') return null;
          return { latex: el.getAttribute('data-latex') ?? '' };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-math-block': '',
        dir: 'ltr',
        class: 'math-block',
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const { dom, update } = sharedNodeView(true)();
      update(node as never);
      return {
        dom,
        update: (n) => {
          if (n.type.name !== MATH_BLOCK_NAME) return false;
          return update(n as never);
        },
      };
    };
  },

  addCommands() {
    return {
      insertMathBlock:
        (latex: string) =>
        ({ chain }) => {
          const trimmed = latex.trim();
          if (!trimmed) return false;
          return chain()
            .focus()
            .insertContent({
              type: MATH_BLOCK_NAME,
              attrs: { latex: trimmed },
            })
            .run();
        },
      updateMath:
        (latex: string) =>
        ({ chain, state }) => {
          const found = findMathAtSelection(state);
          if (!found) return false;
          const trimmed = latex.trim();
          if (!trimmed) return false;
          return chain()
            .focus()
            .setNodeSelection(found.pos)
            .updateAttributes(found.nodeType, { latex: trimmed })
            .run();
        },
      deleteMath:
        () =>
        ({ chain, state }) => {
          const found = findMathAtSelection(state);
          if (!found) return false;
          const node = state.doc.nodeAt(found.pos);
          if (!node) return false;
          return chain()
            .focus()
            .deleteRange({ from: found.pos, to: found.pos + node.nodeSize })
            .run();
        },
    };
  },
});

/**
 * Renders math nodes inside any DOM subtree.
 * Used by the read-only renderer, which receives raw HTML strings stored in DB.
 * Idempotent: re-running it on already-rendered content is a no-op.
 */
export function renderMathIn(root: HTMLElement | null): void {
  if (!root) return;

  const inlineNodes = root.querySelectorAll<HTMLElement>('[data-math-inline]');
  inlineNodes.forEach((el) => {
    el.setAttribute('dir', 'ltr');
    const latex = el.getAttribute('data-latex') ?? '';
    el.innerHTML = renderKatex(latex, false);
  });

  const blockNodes = root.querySelectorAll<HTMLElement>('[data-math-block]');
  blockNodes.forEach((el) => {
    el.setAttribute('dir', 'ltr');
    const latex = el.getAttribute('data-latex') ?? '';
    el.innerHTML = renderKatex(latex, true);
  });
}
