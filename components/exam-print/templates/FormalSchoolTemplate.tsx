"use client";

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import SchoolHeader from "./_shared/SchoolHeader";
import QuestionPrintBlock from "@/components/questions/QuestionPrintBlock";
import { getExamPointsPerQuestion } from "@/lib/exam-utils";
import { normalizeQuestion, resolveQuestionPrintSettings } from "@/lib/question-types";
import type { ExamTemplateProps } from "@/lib/exam-print/types";
import { toPersianDigits } from "@/lib/exam-print/to-persian-digits";

export default function FormalSchoolTemplate({
  exam,
  headerOverrides,
  printInteraction,
}: ExamTemplateProps) {
  const defaultPoints = getExamPointsPerQuestion(exam as Parameters<typeof getExamPointsPerQuestion>[0]);

  return (
    <ExamTemplateShell printStyles=".exam-print-questions-table tr { page-break-inside: avoid; }">
      <SchoolHeader exam={exam} header={headerOverrides} />

      <Table
        className="exam-print-questions-table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          "& th, & td": {
            border: "1px solid #000",
            p: 1.25,
            textAlign: "center",
            verticalAlign: "top",
          },
          "& th": { bgcolor: "#f0f0f0", fontWeight: 700, fontSize: "11pt" },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 56 }}>ردیف</TableCell>
            <TableCell>سوالات</TableCell>
            <TableCell sx={{ width: 72 }}>بارم</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(exam.exam_questions ?? []).map((eq, index) => {
            const payload = { ...(eq.payload ?? {}), id: eq.question_id ?? eq.id } as Record<
              string,
              unknown
            >;
            const points = (payload.points as number | undefined) ?? defaultPoints;
            const printSettings = resolveQuestionPrintSettings({
              source: payload,
              variant: "formal",
              normalized: normalizeQuestion(payload),
            });
            return (
              <TableRow
                key={eq.id}
                data-page-break-before={printSettings.pageBreakBefore ? "true" : undefined}
                sx={{
                  pageBreakInside: "avoid",
                  ...(printSettings.pageBreakBefore && { pageBreakBefore: "always" }),
                }}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: "12pt", verticalAlign: "middle" }}>
                  {toPersianDigits(index + 1)}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <QuestionPrintBlock
                    questionNumber={index + 1}
                    source={payload}
                    points={points}
                    variant="formal"
                    showNumber={false}
                    showPoints={false}
                    interactive={printInteraction?.interactive}
                    onQuestionClick={printInteraction?.onQuestionClick}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, verticalAlign: "middle" }}>
                  {toPersianDigits(points)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ExamTemplateShell>
  );
}
