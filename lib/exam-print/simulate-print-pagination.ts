/** Result of client-side print pagination simulation (preview only). */
export interface PrintPaginationResult {
  pageCount: number;
  /** Y (px) at the centre of the gap between two questions where a new page starts. */
  contentBreakYs: number[];
  pageStartYs: number[];
  contentEndY: number;
}

export interface SimulatePrintPaginationInput {
  contentRoot: HTMLElement;
  usablePagePx: number;
}

interface BlockBounds {
  el: HTMLElement;
  top: number;
  height: number;
  visualBottom: number;
  layoutBottom: number;
}

/** Undo CSS transform scale so overlay `top` matches layout coordinates. */
export function getLayoutScale(el: HTMLElement): number {
  const layoutWidth = el.offsetWidth;
  if (layoutWidth <= 0) return 1;
  return el.getBoundingClientRect().width / layoutWidth;
}

function layoutTop(el: HTMLElement, root: HTMLElement): number {
  const scale = getLayoutScale(root);
  const elRect = el.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  return (elRect.top - rootRect.top) / scale + root.scrollTop;
}

function measureBlock(el: HTMLElement, root: HTMLElement): BlockBounds {
  const top = layoutTop(el, root);
  const height = el.offsetHeight;
  const marginBottom = parseFloat(window.getComputedStyle(el).marginBottom) || 0;
  const visualBottom = top + height;
  return { el, top, height, visualBottom, layoutBottom: visualBottom + marginBottom };
}

function forceBreakBefore(el: HTMLElement): boolean {
  if (el.dataset.pageBreakBefore === "true") return true;
  return el.querySelector("[data-page-break-before='true']") != null;
}

/** Y at the exact centre of the gap between question i-1 and question i. */
function breakYBetweenQuestions(blocks: BlockBounds[], index: number): number | null {
  if (index <= 0) return null;
  const prev = blocks[index - 1];
  const curr = blocks[index];
  const gapStart = prev.visualBottom;
  const gapEnd = curr.top;
  if (gapEnd <= gapStart + 0.5) return gapStart;
  return gapStart + (gapEnd - gapStart) / 2;
}

export function collectPrintAtomicBlocks(root: HTMLElement): HTMLElement[] {
  const tableRows = Array.from(
    root.querySelectorAll<HTMLElement>(".exam-print-questions-table tbody tr")
  ).filter((row) => row.querySelector("[data-question-number]") != null);

  if (tableRows.length > 0) return tableRows;

  return Array.from(root.querySelectorAll<HTMLElement>(".exam-print-question"));
}

export function simulatePrintPagination({
  contentRoot,
  usablePagePx,
}: SimulatePrintPaginationInput): PrintPaginationResult {
  const empty: PrintPaginationResult = {
    pageCount: 1,
    contentBreakYs: [],
    pageStartYs: [0],
    contentEndY: contentRoot.offsetHeight,
  };

  if (usablePagePx <= 0) return empty;

  const blockEls = collectPrintAtomicBlocks(contentRoot);
  if (blockEls.length === 0) {
    return { ...empty, contentEndY: contentRoot.offsetHeight };
  }

  const blocks = blockEls.map((el) => measureBlock(el, contentRoot));
  const contentBreakYs: number[] = [];
  let pageStartY = 0;

  for (let i = 0; i < blocks.length; i++) {
    const { top, visualBottom, layoutBottom } = blocks[i];
    const forceBreak = forceBreakBefore(blocks[i].el);
    const pageBottom = pageStartY + usablePagePx;
    const hasContentOnPage = top > pageStartY + 1;

    let startsNewPage = false;

    if (forceBreak && hasContentOnPage) {
      startsNewPage = true;
    } else if (hasContentOnPage && layoutBottom > pageBottom + 0.5) {
      startsNewPage = true;
    }

    if (startsNewPage && i > 0) {
      const breakY = breakYBetweenQuestions(blocks, i);
      if (breakY != null) {
        const last = contentBreakYs[contentBreakYs.length - 1];
        if (last == null || Math.abs(last - breakY) >= 1) {
          contentBreakYs.push(breakY);
        }
      }
      pageStartY = top;
    }

    while (layoutBottom > pageStartY + usablePagePx + 0.5) {
      pageStartY += usablePagePx;
    }
  }

  const last = blocks[blocks.length - 1];
  const contentEndY = last.layoutBottom;
  const pageStartYs = [0, ...contentBreakYs];

  return {
    pageCount: Math.max(1, pageStartYs.length),
    contentBreakYs,
    pageStartYs,
    contentEndY,
  };
}
