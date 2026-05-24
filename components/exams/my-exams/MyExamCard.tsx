"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { useRouter } from "next/navigation";
import type { AvailableExam } from "@/services/exams/ExamService";
import { getExamDurationMinutes } from "@/lib/exam-utils";
import {
  formatExamDeadline,
  formatExamSchedule,
  formatResultScoreLabel,
  getExamDisplayStatus,
  getExamStatusChipColor,
  getExamStatusLabel,
  getMyExamAction,
} from "@/lib/my-exams-utils";

interface MyExamCardProps {
  exam: AvailableExam;
}

export function MyExamCard({ exam }: MyExamCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const displayStatus = getExamDisplayStatus(exam);
  const action = getMyExamAction(exam);
  const schedule = formatExamSchedule(exam);
  const deadline = formatExamDeadline(exam);
  const scoreLabel = formatResultScoreLabel(exam);
  const duration = getExamDurationMinutes(exam);
  const isUrgent = displayStatus === "started" || (displayStatus === "registered" && !action.disabled);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2.5,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        borderColor: isUrgent ? `${action.color}.light` : "divider",
        bgcolor: isUrgent ? alpha(theme.palette[action.color].main, 0.04) : undefined,
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
      }}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
          <Chip
            size="small"
            label={getExamStatusLabel(displayStatus)}
            color={getExamStatusChipColor(displayStatus)}
            variant="filled"
          />
          <Chip
            size="small"
            label={exam.type === "online" ? "آنلاین" : "آفلاین"}
            variant="outlined"
          />
          {exam.has_grader_notes && (
            <Chip
              size="small"
              icon={<RecordVoiceOverIcon sx={{ fontSize: "14px !important" }} />}
              label="یادداشت معلم"
              color="warning"
              variant="outlined"
            />
          )}
          {exam.is_result_unseen && exam.can_view_result && (
            <Chip size="small" label="نتیجه جدید" color="success" variant="filled" />
          )}
        </Stack>

        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }} title={exam.title}>
          {exam.title}
        </Typography>

        {exam.creator?.name && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            {exam.creator.name}
          </Typography>
        )}

        <Stack spacing={0.5} sx={{ mb: 1.5, flex: 1 }}>
          {schedule && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {schedule}
              </Typography>
            </Stack>
          )}
          {deadline && (
            <Typography
              variant="body2"
              fontWeight={displayStatus === "started" ? 700 : 500}
              color={displayStatus === "started" ? "warning.dark" : "text.secondary"}
            >
              {deadline}
            </Typography>
          )}
          {duration != null && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              <Typography variant="caption" color="text.disabled">
                مدت: {duration.toLocaleString("fa-IR")} دقیقه
              </Typography>
            </Stack>
          )}
          {scoreLabel && (
            <Box
              sx={{
                mt: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.success.main, 0.08),
              }}
            >
              <Typography variant="body2" fontWeight={700} color="success.dark">
                {scoreLabel}
              </Typography>
            </Box>
          )}
          {!exam.can_view_result &&
            (displayStatus === "completed" || displayStatus === "time_ended") &&
            exam.result_message && (
              <Typography variant="caption" color="text.secondary">
                {exam.result_message}
              </Typography>
            )}
        </Stack>

        <Button
          fullWidth
          variant={action.variant}
          color={action.color}
          disabled={action.disabled}
          onClick={() => router.push(action.href)}
          sx={{ mt: "auto" }}
        >
          {action.label}
        </Button>
      </CardContent>
    </Card>
  );
}
