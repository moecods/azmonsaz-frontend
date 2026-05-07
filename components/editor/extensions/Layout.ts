/**
 * Multi-column layout system for the editor.
 *
 * Two nodes:
 *   • `layout`        — a horizontal row of columns. group="block".
 *   • `layoutColumn`  — a single cell inside a row. Holds arbitrary block content.
 *
 * Editor-only chrome (cell borders + drag-to-resize handles) is added through a
 * single ProseMirror plugin that decorates the live document with widgets and
 * a class. None of that chrome is part of the serialised HTML, so the preview
 * sees a clean `<div class="layout-row"><div class="layout-cell">…</div>…`
 * structure with no borders.
 *
 * Why custom instead of an off-the-shelf package? `@tiptap/pro` is paid, the
 * community options weren't current with v3, and we wanted a clean RTL-aware
 * implementation that integrates with our placeholder / direction extensions.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { EditorView } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    layout: {
      /** Insert a new layout row with the given number of equal columns. */
      insertLayout: (cols: 2 | 3 | 4) => ReturnType;
      /** Set every column in the current layout row to equal width. */
      distributeLayoutColumns: () => ReturnType;
    };
  }
}

export const Layout = Node.create({
  name: 'layout',
  group: 'block',
  content: 'layoutColumn{1,4}',
  isolating: true,
  defining: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'div[data-type="layout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'layout',
        class: 'layout-row',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertLayout:
        (cols) =>
        ({ chain }) => {
          const columns = Array.from({ length: cols }, () => ({
            type: 'layoutColumn',
            attrs: { width: 1 },
            content: [{ type: 'paragraph' }],
          }));
          return chain()
            .insertContent({ type: 'layout', content: columns })
            .focus()
            .run();
        },

      distributeLayoutColumns:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === 'layout') {
              const layoutPos = $from.before(d);
              const layoutNode = $from.node(d);
              if (!dispatch) return true;
              const tr = state.tr;
              let pos = layoutPos + 1;
              layoutNode.forEach((child) => {
                tr.setNodeMarkup(pos, undefined, { ...child.attrs, width: 1 });
                pos += child.nodeSize;
              });
              dispatch(tr);
              return true;
            }
          }
          return false;
        },
    };
  },

  addProseMirrorPlugins() {
    return [layoutChromePlugin()];
  },
});

export const LayoutColumn = Node.create({
  name: 'layoutColumn',
  content: 'block+',
  isolating: true,
  defining: true,
  selectable: false,

  addAttributes() {
    return {
      width: {
        default: 1,
        parseHTML: (el) => {
          const v = Number(el.getAttribute('data-width'));
          return Number.isFinite(v) && v > 0 ? v : 1;
        },
        renderHTML: (attrs) => {
          const v = Number(attrs.width);
          const w = Number.isFinite(v) && v > 0 ? v : 1;
          return {
            'data-width': String(w),
            // Keep visual layout self-contained in the rendered HTML.
            style: `flex: ${w} 1 0; min-width: 0;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="layout-column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'layout-column',
        class: 'layout-cell',
      }),
      0,
    ];
  },
});

/* ------------------------------------------------------------------ */
/* Editor chrome: drag-to-resize handles between adjacent columns.    */
/* ------------------------------------------------------------------ */

const layoutChromePluginKey = new PluginKey('layoutChrome');

interface ResizeState {
  view: EditorView;
  layoutPos: number;
  leftIndex: number;
  startX: number;
  startWidths: number[];
  rowEl: HTMLElement;
  rowWidth: number;
}

function layoutChromePlugin() {
  let dragState: ResizeState | null = null;

  function onMouseMove(event: MouseEvent) {
    if (!dragState) return;
    const { startX, startWidths, leftIndex, rowEl, rowWidth } = dragState;
    const dx = event.clientX - startX;
    const total = startWidths.reduce((a, b) => a + b, 0);
    const pxPerUnit = rowWidth / total;
    const deltaUnits = dx / pxPerUnit;

    const minUnits = 0.15 * total; // ~15% minimum width
    let leftWidth = startWidths[leftIndex] + deltaUnits;
    let rightWidth = startWidths[leftIndex + 1] - deltaUnits;
    if (leftWidth < minUnits) {
      rightWidth -= minUnits - leftWidth;
      leftWidth = minUnits;
    }
    if (rightWidth < minUnits) {
      leftWidth -= minUnits - rightWidth;
      rightWidth = minUnits;
    }

    // Update DOM live for smooth dragging without dispatching transactions.
    const cells = rowEl.querySelectorAll<HTMLElement>(':scope > .layout-cell');
    if (cells[leftIndex]) cells[leftIndex].style.flexGrow = String(leftWidth);
    if (cells[leftIndex + 1]) cells[leftIndex + 1].style.flexGrow = String(rightWidth);
  }

  function onMouseUp(event: MouseEvent) {
    if (!dragState) return;
    const { view, layoutPos, leftIndex, startWidths, startX, rowWidth } = dragState;
    const dx = event.clientX - startX;
    const total = startWidths.reduce((a, b) => a + b, 0);
    const pxPerUnit = rowWidth / total;
    const deltaUnits = dx / pxPerUnit;

    const minUnits = 0.15 * total;
    let leftWidth = startWidths[leftIndex] + deltaUnits;
    let rightWidth = startWidths[leftIndex + 1] - deltaUnits;
    if (leftWidth < minUnits) {
      rightWidth -= minUnits - leftWidth;
      leftWidth = minUnits;
    }
    if (rightWidth < minUnits) {
      leftWidth -= minUnits - rightWidth;
      rightWidth = minUnits;
    }

    const layoutNode = view.state.doc.nodeAt(layoutPos);
    if (layoutNode && layoutNode.type.name === 'layout') {
      const tr = view.state.tr;
      let pos = layoutPos + 1;
      layoutNode.forEach((child, _offset, i) => {
        let nextWidth = child.attrs.width;
        if (i === leftIndex) nextWidth = round(leftWidth);
        else if (i === leftIndex + 1) nextWidth = round(rightWidth);
        tr.setNodeMarkup(pos, undefined, { ...child.attrs, width: nextWidth });
        pos += child.nodeSize;
      });
      view.dispatch(tr);
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    dragState = null;
  }

  return new Plugin({
    key: layoutChromePluginKey,

    props: {
      decorations(state) {
        const decorations: Decoration[] = [];
        state.doc.descendants((node, pos) => {
          if (node.type.name !== 'layout') return;

          // Add an "in-editor only" class so the chrome only shows while editing.
          decorations.push(
            Decoration.node(pos, pos + node.nodeSize, {
              class: 'layout-row--editing',
            }),
          );

          // Insert a drag handle widget between every pair of adjacent columns.
          let childPos = pos + 1;
          node.forEach((column: ProseMirrorNode, _offset: number, index: number) => {
            const isLast = index === node.childCount - 1;
            childPos += column.nodeSize;
            if (isLast) return;
            const dragPos = childPos;
            const layoutPos = pos;
            const colIndex = index;
            decorations.push(
              Decoration.widget(
                dragPos,
                () => {
                  const handle = document.createElement('div');
                  handle.className = 'layout-resizer';
                  handle.setAttribute('contenteditable', 'false');
                  handle.dataset.colIndex = String(colIndex);
                  handle.dataset.layoutPos = String(layoutPos);
                  handle.title = 'برای تغییر اندازه ستون‌ها بکشید';
                  return handle;
                },
                { side: -1, ignoreSelection: true },
              ),
            );
          });
        });
        return DecorationSet.create(state.doc, decorations);
      },

      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target as HTMLElement | null;
          if (!target || !target.classList.contains('layout-resizer')) return false;

          const colIndex = Number(target.dataset.colIndex);
          const layoutPos = Number(target.dataset.layoutPos);
          if (!Number.isFinite(colIndex) || !Number.isFinite(layoutPos)) return false;

          const layoutNode = view.state.doc.nodeAt(layoutPos);
          if (!layoutNode || layoutNode.type.name !== 'layout') return false;

          const widths: number[] = [];
          layoutNode.forEach((child) => {
            const w = Number(child.attrs.width);
            widths.push(Number.isFinite(w) && w > 0 ? w : 1);
          });

          const rowEl = target.parentElement as HTMLElement | null;
          if (!rowEl) return false;

          dragState = {
            view,
            layoutPos,
            leftIndex: colIndex,
            startX: event.clientX,
            startWidths: widths,
            rowEl,
            rowWidth: rowEl.getBoundingClientRect().width,
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          event.preventDefault();
          return true;
        },
      },
    },
  });
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
