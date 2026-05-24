"use client";

import { Button, Card, Chip, Stack, Typography, alpha } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useRouter } from "next/navigation";
import type { FocusExamContext } from "@/lib/student-dashboard";
import { formatExamDeadline, formatExamSchedule } from "@/lib/student-dashboard";
import { getMyExamAction } from "@/lib/my-exams-utils";
import { getExamDurationMinutes } from "@/lib/exam-utils";

const MODE_LABELS = {
  continue: { chip: "در حال انجام", color: "warning" as const },
  start: { chip: "آماده شروع", color: "success" as const },
  scheduled: { chip: "پیشِ رو", color: "info" as const },
};

interface MyExamsFocusCardProps {
  focus: FocusExamContext;
}

export function MyExamsFocusCard({ focus }: MyExamsFocusCardProps) {
  const router = useRouter();
  const { exam, mode } = focus;
  const cfg = MODE_LABELS[mode];
  const action = getMyExamAction(exam);
  const schedule = formatExamSchedule(exam);
  const deadline = formatExamDeadline(exam);
  const duration = getExamDurationMinutes(exam);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        borderWidth: 2,
        borderColor: `${cfg.color}.light`,
        bgcolor: (t) => alpha(t.palette[cfg.color].main, 0.06),
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip label="اولویت شما" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
          <Chip label={cfg.chip} size="small" color={cfg.color} />
          {duration != null && (
            <Typography variant="caption" color="text.secondary">
              {duration.toLocaleString("fa-IR")} دقیقه
            </Typography>
          )}
        </Stack>

        <Typography variant="h6" fontWeight={800}>
          {exam.title}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
          {schedule && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {schedule}
              </Typography>
            </Stack>
          )}
          {deadline && (
            <Typography
              variant="body2"
              fontWeight={600}
              color={mode === "continue" ? "warning.dark" : "text.secondary"}
            >
              {deadline}
            </Typography>
          )}
        </Stack>

        <Button
          variant="contained"
          color={action.color}
          size="large"
          disabled={action.disabled}
          startIcon={<PlayArrowIcon />}
          onClick={() => router.push(action.href)}
          sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
        >
          {mode === "scheduled" && action.disabled ? "هنوز قابل شروع نیست" : action.label}
        </Button>
      </Stack>
    </Card>
  );
}
