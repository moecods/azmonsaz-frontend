"use client";

import { Box, Typography } from "@mui/material";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { simulatePrintPagination } from "@/lib/exam-print/simulate-print-pagination";
import { toPersianDigits } from "@/lib/exam-print/to-persian-digits";

const FOOTER_RESERVE_MM = 14;

const screenOnlySx = {
  "@media print": {
    display: "none !important",
  },
} as const;

function parseLengthMm(css: string): number {
  const trimmed = css.trim();
  if (trimmed.endsWith("mm")) return parseFloat(trimmed);
  if (trimmed.endsWith("in")) return parseFloat(trimmed) * 25.4;
  if (trimmed.endsWith("cm")) return parseFloat(trimmed) * 10;
  return parseFloat(trimmed) || 297;
}

function measureMmAsPx(mm: number, root: HTMLElement): number {
  const probe = document.createElement("div");
  probe.style.cssText = `height:${mm}mm;width:1px;position:absolute;left:-9999px;visibility:hidden;pointer-events:none;`;
  root.appendChild(probe);
  const px = probe.offsetHeight;
  root.removeChild(probe);
  return px;
}

export interface PrintPreviewPageGuidesProps {
  pageHeightCss: string;
  marginMm: number;
  /** Preview zoom (CSS transform scale) — triggers guide recalculation. */
  previewZoom?: number;
  children: ReactNode;
}

interface GuideState {
  pageCount: number;
  pageStartYs: number[];
  contentEndY: number;
  contentBreakYs: number[];
}

/** Screen-only overlay: page frames and break lines. Hidden when printing. */
export default function PrintPreviewPageGuides({
  pageHeightCss,
  marginMm,
  previewZoom = 1,
  children,
}: PrintPreviewPageGuidesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [guide, setGuide] = useState<GuideState>({
    pageCount: 1,
    pageStartYs: [0],
    contentEndY: 0,
    contentBreakYs: [],
  });

  const recalculate = useCallback(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    const pageMm = parseLengthMm(pageHeightCss);
    const topMarginMm = Math.max(marginMm, 10);
    const bottomMarginMm = marginMm + FOOTER_RESERVE_MM;
    const usableMm = Math.max(pageMm - topMarginMm - bottomMarginMm, pageMm * 0.55);
    const usablePagePx = measureMmAsPx(usableMm, root);

    const simulation = simulatePrintPagination({ contentRoot: content, usablePagePx });

    setGuide({
      pageCount: simulation.pageCount,
      pageStartYs: simulation.pageStartYs,
      contentEndY: simulation.contentEndY,
      contentBreakYs: simulation.contentBreakYs,
    });
  }, [pageHeightCss, marginMm, previewZoom]);

  useLayoutEffect(() => {
    recalculate();
    const content = contentRef.current;
    if (!content) return;

    const observer = new ResizeObserver(() => recalculate());
    observer.observe(content);

    const mutationObserver = new MutationObserver(() => recalculate());
    mutationObserver.observe(content, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "data-page-break-before", "data-question-number"],
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [recalculate, children, previewZoom]);

  useLayoutEffect(() => {
    recalculate();
    const id = window.setTimeout(recalculate, 180);
    return () => window.clearTimeout(id);
  }, [previewZoom, recalculate]);

  const { pageCount, pageStartYs, contentEndY, contentBreakYs } = guide;
  const overlayHeight = contentEndY > 0 ? contentEndY : undefined;

  return (
    <Box
      ref={rootRef}
      className="print-preview-page-guides"
      sx={{ position: "relative", minHeight: overlayHeight }}
    >
      <Box ref={contentRef} sx={{ position: "relative", zIndex: 1 }}>
        {pageStartYs.slice(0, pageCount).map((startY, index) => {
          const nextStart = pageStartYs[index + 1];
          const frameHeight =
            nextStart != null ? nextStart - startY : Math.max(contentEndY - startY, 48);

          return (
            <Box
              key={`page-frame-${index}`}
              aria-hidden="true"
              className="print-preview-page-frame"
              sx={{
                ...screenOnlySx,
                position: "absolute",
                top: startY,
                left: 0,
                right: 0,
                height: frameHeight,
                boxSizing: "border-box",
                border: "1px solid",
                borderColor: index === 0 ? "primary.light" : "grey.400",
                bgcolor: index % 2 === 0 ? "rgba(25, 118, 210, 0.025)" : "rgba(0, 0, 0, 0.02)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              <Typography
                component="span"
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 8,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: index === 0 ? "primary.main" : "text.secondary",
                  bgcolor: "background.paper",
                  px: 0.75,
                  py: 0.125,
                  borderRadius: 0.5,
                  border: "1px solid",
                  borderColor: index === 0 ? "primary.light" : "divider",
                  lineHeight: 1.2,
                }}
              >
                برگه {toPersianDigits(index + 1)}
              </Typography>
            </Box>
          );
        })}

        {contentBreakYs.map((breakY, index) => (
          <Box
            key={`page-break-${index + 2}-${breakY}`}
            aria-hidden="true"
            className="print-preview-page-break-line"
            sx={{
              ...screenOnlySx,
              position: "absolute",
              top: breakY,
              left: 0,
              right: 0,
              height: 0,
              m: 0,
              p: 0,
              zIndex: 3,
              pointerEvents: "none",
              borderTop: "2px dashed",
              borderColor: "warning.main",
            }}
          >
            <Typography
              component="span"
              className="print-preview-page-break-label"
              sx={{
                ...screenOnlySx,
                position: "absolute",
                top: 4,
                left: "50%",
                transform: "translateX(-50%)",
                m: 0,
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "warning.dark",
                bgcolor: "warning.light",
                px: 0.75,
                py: 0.125,
                borderRadius: 0.5,
                border: "1px solid",
                borderColor: "warning.main",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              شروع صفحه {toPersianDigits(index + 2)}
            </Typography>
          </Box>
        ))}

        {children}
      </Box>
    </Box>
  );
}
