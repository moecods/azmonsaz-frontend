/**
 * Custom image extension built on top of @tiptap/extension-image.
 *
 * Why custom?
 *   • The official resize NodeView wraps the <img> in a `<div data-resize-container
 *     style="display:inline-flex">` with a `<div data-resize-wrapper style=
 *     "display:block">` inside. The block-display wrapper inside an
 *     inline-flex container fights inline behaviour inside RTL paragraphs and
 *     made it impossible for users to type text on either side of the image.
 *   • The official handles position via `style.left/right` only. In RTL
 *     contexts the perceived "right" of the image is on the user's physical
 *     left, which is where the bug "drag right but image grows left" came
 *     from — the math is fine, but the user's mental model gets inverted.
 *
 * This NodeView:
 *   • Uses a real inline-block <span> wrapper, so images flow inline with
 *     surrounding text exactly like in the rendered HTML.
 *   • Adds 4 corner resize handles whose math is anchored to the handle's
 *     physical horizontal/vertical bias, so dragging always moves the visible
 *     image edge that the handle sits on (no inversion).
 *   • Honours the `align` attribute (left | center | right | null) — left and
 *     right become floats so text wraps, center becomes block-centered, null
 *     stays inline.
 *   • Tags itself with `data-image-node` so the bubble menu / crop overlay can
 *     target the selected <img> reliably.
 *
 * Drop & paste pipeline (validation + compression) is unchanged.
 */

import type { NodeViewRenderer } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/core';
import { Image as BaseImage, type ImageOptions } from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import {
  ImageProcessingError,
  imageFileFromClipboard,
  imageFileFromDataTransfer,
  needsCorsForImageSrc,
  processImageFile,
  type ProgressCallback,
} from '../lib/image-utils';
import { mediaService } from '@/services';

export interface ConfigurableImageOptions extends ImageOptions {
  onProgress?: ProgressCallback;
  onError?: (error: Error) => void;
}

const imagePluginKey = new PluginKey('image-drop-paste');

function safeInsertImage(
  view: import('@tiptap/pm/view').EditorView,
  pos: number,
  file: File,
  opts: ConfigurableImageOptions,
) {
  void (async () => {
    try {
      // Local pipeline first (validate + sanitise + downscale + re-encode).
      const result = await processImageFile(file, {}, opts.onProgress);

      // Then upload the processed blob — never embed base64 in the document.
      opts.onProgress?.({ stage: 'encoding' });
      const uploaded = await mediaService.upload(result.blob, {
        filename: result.filename,
        collection: 'editor',
        onProgress: (fraction) =>
          opts.onProgress?.({ stage: 'encoding', progress: fraction }),
      });
      opts.onProgress?.({ stage: 'done', progress: 1 });

      const { schema } = view.state;
      const node = schema.nodes.image?.create({
        src: uploaded.url,
        alt: file.name.replace(/\.[^.]+$/, ''),
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
      });
      if (!node) return;
      const tr = view.state.tr.insert(pos, node);
      view.dispatch(tr);
    } catch (err) {
      const message =
        err instanceof ImageProcessingError ? err.message :
        err instanceof Error ? err.message :
        'بارگذاری تصویر ناموفق بود';
      opts.onError?.(new Error(message));
    }
  })();
}

type CornerDir = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const CORNERS: { dir: CornerDir; cursor: string }[] = [
  { dir: 'top-left', cursor: 'nwse-resize' },
  { dir: 'top-right', cursor: 'nesw-resize' },
  { dir: 'bottom-left', cursor: 'nesw-resize' },
  { dir: 'bottom-right', cursor: 'nwse-resize' },
];

export const ConfigurableImage = BaseImage.extend<ConfigurableImageOptions>({
  addOptions() {
    const parent = this.parent?.() as ImageOptions;
    return {
      ...parent,
      onProgress: undefined,
      onError: undefined,
    } satisfies ConfigurableImageOptions;
  },

  /** Add `align` ('left' | 'center' | 'right' | null) on top of base attrs. */
  addAttributes() {
    const parent = (this.parent?.() ?? {}) as Record<string, unknown>;
    return {
      ...parent,
      align: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-align'),
        renderHTML: (attrs: { align?: string | null }) => {
          if (!attrs.align) return {};
          return { 'data-align': attrs.align };
        },
      },
    };
  },

  /** Default render: lazy-loaded, async-decoded, polite referrer. */
  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(
        {
          loading: 'lazy',
          decoding: 'async',
          referrerpolicy: 'no-referrer',
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
    ];
  },

  /**
   * Custom NodeView. Returns null on the server so SSR keeps working — the
   * editor only mounts client-side via `immediatelyRender: false`.
   */
  addNodeView(): NodeViewRenderer | null {
    if (typeof document === 'undefined') return null;

    return ({ node, getPos, editor }) => {
      let currentNode = node;

      const wrapper = document.createElement('span');
      wrapper.dataset.imageNode = '';
      wrapper.style.position = 'relative';
      // Must be set in JS (not only CSS) so inline flow works before stylesheet
      // paint and in every context (e.g. narrow option editor).
      wrapper.style.display = 'inline-block';
      wrapper.style.verticalAlign = 'middle';
      // `direction: ltr` defends against the resize math feeling inverted when
      // the parent paragraph is RTL.
      wrapper.style.direction = 'ltr';

      const img = document.createElement('img');
      img.className = 'tiptap-image';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.draggable = false;
      img.style.display = 'block';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';

      const applyAttrs = () => {
        const a = currentNode.attrs as {
          src?: string | null;
          alt?: string | null;
          title?: string | null;
          width?: number | string | null;
          height?: number | string | null;
          align?: 'left' | 'center' | 'right' | null;
        };
        const src = a.src?.trim() || '';
        if (src) {
          if (needsCorsForImageSrc(src)) {
            img.crossOrigin = 'anonymous';
          } else {
            img.removeAttribute('crossorigin');
          }
          if (img.src !== src) img.src = src;
        } else {
          img.removeAttribute('src');
          img.removeAttribute('crossorigin');
        }
        if (a.alt) img.alt = a.alt;
        else img.removeAttribute('alt');
        if (a.title) img.title = a.title;
        else img.removeAttribute('title');
        if (a.width != null && a.width !== '') {
          img.style.width = typeof a.width === 'number' ? `${a.width}px` : String(a.width);
        } else {
          img.style.width = '';
        }
        if (a.height != null && a.height !== '') {
          img.style.height = typeof a.height === 'number' ? `${a.height}px` : String(a.height);
        } else {
          img.style.height = '';
        }
        if (a.align) wrapper.dataset.align = a.align;
        else delete wrapper.dataset.align;
      };

      applyAttrs();
      wrapper.appendChild(img);

      /* ----- resize handles ----- */
      CORNERS.forEach(({ dir, cursor }) => {
        const h = document.createElement('span');
        h.dataset.resizeHandle = dir;
        h.contentEditable = 'false';
        Object.assign(h.style, {
          position: 'absolute',
          width: '12px',
          height: '12px',
          background: '#fff',
          border: '1.5px solid #2563eb',
          borderRadius: '3px',
          cursor,
          opacity: '0',
          transition: 'opacity 0.12s ease',
          zIndex: '2',
          pointerEvents: 'none',
        } as Partial<CSSStyleDeclaration>);

        // Anchor each handle to the corresponding physical corner of the wrapper.
        if (dir.includes('top')) h.style.top = '-6px';
        else h.style.bottom = '-6px';
        if (dir.includes('right')) h.style.right = '-6px';
        else h.style.left = '-6px';

        h.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          event.stopPropagation();

          const rect = img.getBoundingClientRect();
          const startWidth = rect.width;
          const startHeight = rect.height;
          if (!startWidth || !startHeight) return;
          const aspect = startWidth / startHeight;
          const startX = event.clientX;
          const startY = event.clientY;
          const isRight = dir.includes('right');
          const isBottom = dir.includes('bottom');

          (h as HTMLElement).setPointerCapture(event.pointerId);
          document.body.style.userSelect = 'none';

          const onMove = (e: PointerEvent) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            // Each handle pushes / pulls the edge it sits on. Right handles
            // grow with positive dx, left handles grow with negative dx.
            const widthDelta = isRight ? dx : -dx;
            const heightDelta = isBottom ? dy : -dy;

            // Combine width & height deltas into the larger one so corner drags
            // feel natural, then derive the other axis from the source aspect.
            const fromW = startWidth + widthDelta;
            const fromH = (startHeight + heightDelta) * aspect;
            let newWidth = Math.max(fromW, fromH);
            if (newWidth < 40) newWidth = 40;
            const newHeight = newWidth / aspect;

            img.style.width = `${Math.round(newWidth)}px`;
            img.style.height = `${Math.round(newHeight)}px`;
          };

          const onUp = () => {
            document.body.style.userSelect = '';
            h.removeEventListener('pointermove', onMove);
            h.removeEventListener('pointerup', onUp);
            h.removeEventListener('pointercancel', onUp);
            try {
              (h as HTMLElement).releasePointerCapture(event.pointerId);
            } catch {
              /* ignore */
            }
            const finalWidth = parseFloat(img.style.width || '0') || undefined;
            const finalHeight = parseFloat(img.style.height || '0') || undefined;
            const pos = typeof getPos === 'function' ? getPos() : undefined;
            if (pos === undefined || finalWidth === undefined) return;
            editor
              .chain()
              .setNodeSelection(pos)
              .updateAttributes('image', {
                width: Math.round(finalWidth),
                height: finalHeight ? Math.round(finalHeight) : null,
              })
              .run();
          };

          h.addEventListener('pointermove', onMove);
          h.addEventListener('pointerup', onUp);
          h.addEventListener('pointercancel', onUp);
        });

        wrapper.appendChild(h);
      });

      /* ----- NodeView API ----- */
      return {
        dom: wrapper,
        update(updatedNode) {
          if (updatedNode.type !== node.type) return false;
          currentNode = updatedNode;
          applyAttrs();
          return true;
        },
        selectNode() {
          wrapper.classList.add('is-selected');
        },
        deselectNode() {
          wrapper.classList.remove('is-selected');
        },
        ignoreMutation(mutation) {
          // Style updates we make during resize are intentional — keep them
          // out of ProseMirror's mutation tracking.
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            return true;
          }
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            return true;
          }
          return false;
        },
      };
    };
  },

  addProseMirrorPlugins() {
    const parents = this.parent?.() ?? [];
    const options = this.options;

    const plugin = new Plugin({
      key: imagePluginKey,
      props: {
        handleDOMEvents: {
          drop: (view, e) => {
            const file = imageFileFromDataTransfer(e.dataTransfer);
            if (!file) return false;
            const coords = { left: e.clientX, top: e.clientY };
            const pos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;
            e.preventDefault();
            safeInsertImage(view, pos, file, options);
            return true;
          },
          paste: (view, e) => {
            const file = imageFileFromClipboard(e.clipboardData?.items);
            if (!file) return false;
            e.preventDefault();
            safeInsertImage(view, view.state.selection.from, file, options);
            return true;
          },
        },
      },
    });

    return [...parents, plugin];
  },
});

export default ConfigurableImage;
