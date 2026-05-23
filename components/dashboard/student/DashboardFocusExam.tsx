"use client";

import { Box, Button, Card, Chip, Stack, Typography, alpha } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { FocusExamContext } from "@/lib/student-dashboard";
import { formatExamDeadline, formatExamSchedule } from "@/lib/student-dashboard";
import { getExamDurationMinutes } from "@/lib/exam-utils";
import { useRouter } from "next/navigation";

const modeConfig = {
  continue: {
    label: "در حال انجام",
    cta: "ادامه آزمون",
    color: "warning" as const,
    href: (id: number) => `/exams/take/${id}`,
  },
  start: {
    label: "آماده شروع",
    cta: "شروع آزمون",
    color: "success" as const,
    href: (id: number) => `/exams/take/${id}`,
  },
  scheduled: {
    label: "پیشِ رو",
    cta: "مشاهده",
    color: "info" as const,
    href: () => `/exams/available`,
  },
};

interface DashboardFocusExamProps {
  focus: FocusExamContext;
}

export default function DashboardFocusExam({ focus }: DashboardFocusExamProps) {
  const router = useRouter();
  const { exam, mode } = focus;
  const cfg = modeConfig[mode];
  const schedule = formatExamSchedule(exam);
  const deadline = formatExamDeadline(exam);
  const duration = getExamDurationMinutes(exam);

  return (
    <Card
      elevation={0}
      sx={{
        border: "2px solid",
        borderColor: `${cfg.color}.light`,
        bgcolor: (theme) => alpha(theme.palette[cfg.color].main, 0.06),
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip label={cfg.label} size="small" color={cfg.color} sx={{ fontWeight: 700 }} />
          {duration != null && (
            <Typography variant="caption" color="text.secondary">
              {duration} دقیقه
            </Typography>
          )}
        </Stack>

        <Typography variant="h6" fontWeight={800} lineHeight={1.35}>
          {exam.title}
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {schedule && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {schedule}
              </Typography>
            </Stack>
          )}
          {deadline && (
            <Typography variant="body2" color={mode === "continue" ? "warning.dark" : "text.secondary"} fontWeight={600}>
              {deadline}
            </Typography>
          )}
        </Stack>

        <Button
          variant="contained"
          color={cfg.color}
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={() => router.push(cfg.href(exam.id))}
          sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, mt: 0.5 }}
        >
          {cfg.cta}
        </Button>
      </Stack>
    </Card>
  );
}
