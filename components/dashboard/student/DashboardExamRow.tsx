"use client";

import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import type { AvailableExam } from "@/services/exams/ExamService";
import {
  formatExamDeadline,
  formatExamSchedule,
  formatResultScoreLabel,
  getExamDisplayStatus,
  isExamStartable,
} from "@/lib/student-dashboard";
import { getExamDurationMinutes } from "@/lib/exam-utils";
import { useRouter } from "next/navigation";

interface DashboardExamRowProps {
  exam: AvailableExam;
  variant?: "upcoming" | "result" | "awaiting";
}

function getRowCta(exam: AvailableExam): { label: string; href: string } {
  const displayStatus = getExamDisplayStatus(exam);
  if (displayStatus === "started") {
    return { label: "ادامه", href: `/exams/take/${exam.id}` };
  }
  if (displayStatus === "completed" || displayStatus === "time_ended") {
    return { label: exam.can_view_result ? "کارنامه" : "وضعیت", href: `/exams/${exam.id}/result` };
  }
  if (isExamStartable(exam, displayStatus)) {
    return { label: "شروع", href: `/exams/take/${exam.id}` };
  }
  return { label: "جزئیات", href: `/exams/available` };
}

export default function DashboardExamRow({ exam, variant = "upcoming" }: DashboardExamRowProps) {
  const router = useRouter();
  const cta = getRowCta(exam);
  const schedule = formatExamSchedule(exam);
  const deadline = formatExamDeadline(exam);
  const scoreLabel = formatResultScoreLabel(exam);
  const duration = getExamDurationMinutes(exam);
  const isUnseenResult = variant === "result" && exam.is_result_unseen;

  return (
    <Card
      variant="outlined"
      elevation={0}
      className={isUnseenResult ? "dashboard-result-unseen" : undefined}
      sx={{
        borderWidth: isUnseenResult ? 2 : 1,
        borderColor: isUnseenResult ? "primary.main" : "divider",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={{ xs: 1.25, sm: 2 }}
        sx={{ p: { xs: 1.25, md: 1.5 } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: "100%" }}>
              {exam.title}
            </Typography>
            {isUnseenResult && (
              <Chip label="کارنامه جدید" size="small" color="primary" sx={{ height: 22, fontWeight: 700 }} />
            )}
            {exam.has_grader_notes && (
              <Chip
                icon={<RecordVoiceOverIcon />}
                label="یادداشت معلم"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 22 }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {variant === "upcoming" && schedule && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {schedule}
                </Typography>
              </Stack>
            )}
            {variant === "upcoming" && deadline && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {deadline}
                </Typography>
              </Stack>
            )}
            {duration != null && variant === "upcoming" && (
              <Typography variant="caption" color="text.secondary">
                {duration} دقیقه
              </Typography>
            )}
            {variant === "result" && scoreLabel && (
              <Chip
                label={scoreLabel}
                size="small"
                color={exam.result?.passed ? "success" : "default"}
                sx={{ height: 24, fontWeight: 600 }}
              />
            )}
            {variant === "awaiting" && (
              <Typography variant="caption" color="info.main">
                {exam.result_message ?? "نتیجه به‌زودی منتشر می‌شود"}
              </Typography>
            )}
            {exam.creator?.name && (
              <Typography variant="caption" color="text.secondary">
                {exam.creator.name}
              </Typography>
            )}
          </Stack>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push(cta.href)}
          sx={{ alignSelf: { xs: "stretch", sm: "center" }, flexShrink: 0 }}
        >
          {cta.label}
        </Button>
      </Stack>
    </Card>
  );
}
