"use client";

import { Box } from "@mui/material";
import TeacherAnswerKeySheet from "./TeacherAnswerKeySheet";
import PrintPreviewPageGuides from "./PrintPreviewPageGuides";
import { renderExamTemplate } from "./render-template";
import { mergeExamPrintSettings } from "@/lib/question-types/print-settings";
import type { ExamForPrint, ExamTemplateId, PrintHeaderOverrides, PrintInteractionOptions } from "@/lib/exam-print/types";

interface PrintPreviewContentProps {
  exam: ExamForPrint;
  template: ExamTemplateId;
  sheetsToPrint: PrintHeaderOverrides[];
  isAnswerKey: boolean;
  previewWidth: string;
  previewHeight: string;
  insertBlankBetweenBooklets: boolean;
  pageSizeCss: string;
  marginNum: number;
  previewZoom?: number;
  printInteraction?: PrintInteractionOptions;
}

export default function PrintPreviewContent({
  exam,
  template,
  sheetsToPrint,
  isAnswerKey,
  previewWidth,
  previewHeight,
  insertBlankBetweenBooklets,
  pageSizeCss,
  marginNum,
  previewZoom = 1,
  printInteraction,
}: PrintPreviewContentProps) {
  const examPrintSettings = mergeExamPrintSettings(exam.print_settings);
  const footerNote = examPrintSettings.footerNote;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { @page { size: ${pageSizeCss}; margin-top: ${Math.max(marginNum, 10)}mm; margin-right: ${marginNum}mm; margin-bottom: ${marginNum}mm; margin-left: ${marginNum}mm; } }`,
        }}
      />
      <Box
        className="exam-print-content"
        sx={{
          width: previewWidth,
          maxWidth: previewWidth,
          boxSizing: "border-box",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {isAnswerKey ? (
          <PrintPreviewPageGuides
            pageHeightCss={previewHeight}
            marginMm={marginNum}
            previewZoom={previewZoom}
          >
            <TeacherAnswerKeySheet exam={exam} />
          </PrintPreviewPageGuides>
        ) : (
          sheetsToPrint.map((sheetHeader, index) => (
            <Box key={`sheet-${index}`}>
              <PrintPreviewPageGuides
                pageHeightCss={previewHeight}
                marginMm={marginNum}
                previewZoom={previewZoom}
              >
                <Box
                  sx={{
                    width: "100%",
                    minHeight: previewHeight,
                    boxSizing: "border-box",
                    ...(index > 0 &&
                      !insertBlankBetweenBooklets && { pageBreakBefore: "always" }),
                  }}
                >
                  {renderExamTemplate(template, exam, sheetHeader, printInteraction)}
                </Box>
              </PrintPreviewPageGuides>
              {sheetsToPrint.length > 1 &&
                index < sheetsToPrint.length - 1 &&
                insertBlankBetweenBooklets && (
                  <PrintPreviewPageGuides
                    pageHeightCss={previewHeight}
                    marginMm={marginNum}
                    previewZoom={previewZoom}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        minHeight: previewHeight,
                        boxSizing: "border-box",
                        pageBreakBefore: "always",
                      }}
                      aria-hidden="true"
                    />
                  </PrintPreviewPageGuides>
                )}
            </Box>
          ))
        )}
      </Box>
      <div className="exam-print-footer" aria-hidden="true">
        <span>{footerNote || exam.title}</span>
        <span>
          صفحه <span className="page-num" /> از <span className="page-total" />
        </span>
      </div>
    </>
  );
}
