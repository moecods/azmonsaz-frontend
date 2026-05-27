"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ExamQuestionReportRow } from "@/services/exams/ExamReportService";

interface ExamQuestionAnalyticsProps {
  questions: ExamQuestionReportRow[];
}

export function ExamQuestionAnalytics({ questions }: ExamQuestionAnalyticsProps) {
  if (questions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        سوالی برای تحلیل وجود ندارد.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>سوال</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              پاسخ‌داده
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              نرخ پاسخ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((q) => {
            const rate =
              q.total_participants > 0
                ? Math.round((q.answered_count / q.total_participants) * 100)
                : 0;
            return (
              <TableRow key={q.exam_question_id} hover>
                <TableCell>{q.order.toLocaleString("fa-IR")}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 360 }} noWrap title={q.title}>
                    {q.title || "—"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {q.answered_count.toLocaleString("fa-IR")} /{" "}
                  {q.total_participants.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell align="center">{rate.toLocaleString("fa-IR")}٪</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
