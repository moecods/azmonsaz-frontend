"use client";

import { Button, Stack, Typography } from "@mui/material";
import type { CreatorDashboardExam } from "@/services/exams/ExamService";
import TeacherCompactExamRow from "./TeacherCompactExamRow";

interface DashboardGradingPanelProps {
  exams: CreatorDashboardExam[];
  /** Exam ids already shown in focus / others — skip duplicates */
  excludeIds?: number[];
  onViewAll?: () => void;
}

export default function DashboardGradingPanel({
  exams,
  excludeIds = [],
  onViewAll,
}: DashboardGradingPanelProps) {
  const exclude = new Set(excludeIds);
  const items = exams.filter((e) => !exclude.has(e.id)).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight={700}>
          تصحیح ناتمام
        </Typography>
        {onViewAll && (
          <Button size="small" variant="text" onClick={onViewAll}>
            همه آزمون‌ها
          </Button>
        )}
      </Stack>
      {items.map((exam) => (
        <TeacherCompactExamRow key={exam.id} exam={exam} />
      ))}
    </Stack>
  );
}
