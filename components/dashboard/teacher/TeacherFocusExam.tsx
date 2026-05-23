"use client";

import { Button, Card, Chip, Stack, Typography, alpha } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import GradingIcon from "@mui/icons-material/Grading";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import type { TeacherFocusContext } from "@/lib/teacher-dashboard";
import {
  formatTeacherExamDeadline,
  formatTeacherExamSchedule,
} from "@/lib/teacher-dashboard";
import { useRouter } from "next/navigation";

const modeConfig = {
  live: {
    label: "در حال اجرا",
    cta: "مدیریت آزمون",
    color: "success" as const,
    href: (id: number) => `/exams/${id}`,
    icon: PlayArrowIcon,
  },
  grading: {
    label: "نیاز به تصحیح",
    cta: "رفتن به تصحیح",
    color: "warning" as const,
    href: (id: number) => `/exams/${id}/grading`,
    icon: GradingIcon,
  },
  upcoming: {
    label: "پیشِ رو",
    cta: "مشاهده آزمون",
    color: "info" as const,
    href: (id: number) => `/exams/${id}`,
    icon: ScheduleIcon,
  },
};

interface TeacherFocusExamProps {
  focus: TeacherFocusContext;
}

export default function TeacherFocusExam({ focus }: TeacherFocusExamProps) {
  const router = useRouter();
  const { exam, mode } = focus;
  const cfg = modeConfig[mode];
  const Icon = cfg.icon;
  const schedule = formatTeacherExamSchedule(exam);
  const deadline = formatTeacherExamDeadline(exam);
  const pending = exam.pending_grading_participants_count;

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
          {mode === "live" && exam.participants_count > 0 && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PeopleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {exam.participants_count.toLocaleString("fa-IR")} شرکت‌کننده
              </Typography>
            </Stack>
          )}
          {pending > 0 && (
            <Chip
              label={`${pending.toLocaleString("fa-IR")} نفر در انتظار تصحیح`}
              size="small"
              color="warning"
              variant="outlined"
            />
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
          {deadline && mode === "live" && (
            <Typography variant="body2" color="success.dark" fontWeight={600}>
              {deadline}
            </Typography>
          )}
        </Stack>

        <Button
          variant="contained"
          color={cfg.color}
          size="large"
          startIcon={<Icon />}
          onClick={() => router.push(cfg.href(exam.id))}
          sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, mt: 0.5 }}
        >
          {cfg.cta}
        </Button>
      </Stack>
    </Card>
  );
}
