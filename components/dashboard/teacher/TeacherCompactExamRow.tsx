"use client";

import { Box, Chip, IconButton, Stack, Typography, alpha } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { CreatorDashboardExam } from "@/services/exams/ExamService";
import {
  formatTeacherExamDeadline,
  formatTeacherExamSchedule,
} from "@/lib/teacher-dashboard";
import { useRouter } from "next/navigation";

interface TeacherCompactExamRowProps {
  exam: CreatorDashboardExam;
}

function rowHref(exam: CreatorDashboardExam): string {
  if (exam.pending_grading_participants_count > 0) {
    return `/exams/${exam.id}/grading`;
  }
  return `/exams/${exam.id}`;
}

export default function TeacherCompactExamRow({ exam }: TeacherCompactExamRowProps) {
  const router = useRouter();
  const schedule = formatTeacherExamSchedule(exam);
  const deadline = formatTeacherExamDeadline(exam);
  const meta = [schedule, exam.is_live ? deadline : null].filter(Boolean).join(" · ");

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
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "100%" }}>
            {exam.title}
          </Typography>
          {exam.is_live && (
            <Chip label="در حال اجرا" size="small" color="success" sx={{ height: 20, fontSize: "0.65rem" }} />
          )}
          {exam.pending_grading_participants_count > 0 && (
            <Chip
              label={`${exam.pending_grading_participants_count.toLocaleString("fa-IR")} تصحیح`}
              size="small"
              color="warning"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          )}
        </Stack>
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
