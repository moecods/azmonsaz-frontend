"use client";

import type { ReactNode } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useRouter } from "next/navigation";
import type { ExamListItem } from "@/services/exams/ExamService";
import {
  formatExamScheduleSummary,
  getExamStatusChips,
} from "@/lib/exams-list-utils";

interface ExamCardProps {
  exam: ExamListItem;
}

export function ExamCard({ exam }: ExamCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const chips = getExamStatusChips(exam);
  const schedule = formatExamScheduleSummary(exam);

  const participants = exam.participants_count ?? 0;
  const completed = exam.completed_participants_count ?? 0;
  const questions = exam.questions_count ?? 0;
  const completionPct =
    exam.status === "published" && participants > 0
      ? Math.round((completed / participants) * 100)
      : null;

  const duration =
    (exam as { duration_minutes?: number }).duration_minutes ??
    (exam.meta as { duration_minutes?: number } | undefined)?.duration_minutes;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2.5,
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/exams/${exam.id}`)}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
            {chips.map((chip) => (
              <Chip
                key={`${chip.label}-${chip.color}`}
                label={chip.label}
                size="small"
                color={chip.color}
                variant={chip.variant ?? "outlined"}
              />
            ))}
          </Stack>

          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }} title={exam.title}>
            {exam.title}
          </Typography>

          <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 1.5, minHeight: 40 }}>
            <ScheduleIcon sx={{ fontSize: 18, color: "text.secondary", mt: 0.15 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {schedule}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              p: 1.25,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.12),
            }}
          >
            <StatMini icon={<QuizIcon fontSize="inherit" />} label="سوال" value={questions} />
            <StatMini
              icon={<PeopleIcon fontSize="inherit" />}
              label="شرکت‌کننده"
              value={exam.status === "published" ? participants : "—"}
            />
            <StatMini
              icon={<CheckCircleIcon fontSize="inherit" />}
              label="تکمیل"
              value={exam.status === "published" ? completed : "—"}
            />
          </Box>

          {completionPct != null && (
            <Box sx={{ mt: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  پیشرفت تکمیل
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {completionPct.toLocaleString("fa-IR")}٪
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={completionPct} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          )}

          {(duration != null || exam.partner?.name) && (
            <Typography variant="caption" color="text.disabled" sx={{ mt: "auto", pt: 1.5 }}>
              {duration != null ? `${duration.toLocaleString("fa-IR")} دقیقه` : ""}
              {duration != null && exam.partner?.name ? " · " : ""}
              {exam.partner?.name ? exam.partner.name : ""}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function StatMini({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <Stack alignItems="center" spacing={0.25}>
      <Box sx={{ color: "primary.main", display: "flex", fontSize: 18 }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={800}>
        {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
