"use client";

import { Box, IconButton, Stack, Typography, alpha } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { AvailableExam } from "@/services/exams/ExamService";
import { formatExamDeadline, formatExamSchedule, getExamDisplayStatus, isExamStartable } from "@/lib/student-dashboard";
import { useRouter } from "next/navigation";

interface DashboardCompactExamRowProps {
  exam: AvailableExam;
}

function rowHref(exam: AvailableExam): string {
  const status = getExamDisplayStatus(exam);
  if (status === "started") return `/exams/take/${exam.id}`;
  if (isExamStartable(exam, status)) return `/exams/take/${exam.id}`;
  return `/exams/available`;
}

export default function DashboardCompactExamRow({ exam }: DashboardCompactExamRowProps) {
  const router = useRouter();
  const schedule = formatExamSchedule(exam);
  const deadline = formatExamDeadline(exam);
  const meta = [schedule, deadline].filter(Boolean).join(" · ");

  return (
    <Box
      onClick={() => router.push(rowHref(exam))}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 1,
        px: 1.25,
        borderRadius: 1.5,
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {exam.title}
        </Typography>
        {meta && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {meta}
          </Typography>
        )}
      </Box>
      <IconButton size="small" aria-label="رفتن">
        <ChevronLeftIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
