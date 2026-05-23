"use client";

import { Box, Button, Card, Chip, Stack, Typography, alpha } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { AvailableExam } from "@/services/exams/ExamService";
import { formatResultScoreLabel } from "@/lib/student-dashboard";
import { useRouter } from "next/navigation";

interface DashboardResultsPanelProps {
  recentResults: AvailableExam[];
  awaitingResults: AvailableExam[];
  onViewAll?: () => void;
}

function ResultRow({
  exam,
  tone,
}: {
  exam: AvailableExam;
  tone: "new" | "seen" | "pending";
}) {
  const router = useRouter();
  const scoreLabel = formatResultScoreLabel(exam);
  const isNew = tone === "new";

  const borderColor = tone === "new" ? "primary.main" : tone === "pending" ? "info.light" : "divider";
  const bgcolor =
    tone === "new"
      ? (theme: { palette: { primary: { main: string } } }) => alpha(theme.palette.primary.main, 0.05)
      : "background.paper";

  return (
    <Box
      className={isNew ? "dashboard-result-unseen" : undefined}
      onClick={() => router.push(`/exams/${exam.id}/result`)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        p: 1.25,
        borderRadius: 1.5,
        cursor: "pointer",
        border: "1px solid",
        borderWidth: isNew ? 2 : 1,
        borderColor,
        bgcolor,
        "&:hover": { borderColor: "primary.light" },
      }}
    >
      <Box sx={{ color: tone === "pending" ? "info.main" : "primary.main", display: "flex" }}>
        {tone === "pending" ? (
          <HourglassEmptyIcon fontSize="small" />
        ) : (
          <DescriptionOutlinedIcon fontSize="small" />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "100%" }}>
            {exam.title}
          </Typography>
          {isNew && <Chip label="جدید" size="small" color="primary" sx={{ height: 20 }} />}
          {exam.has_grader_notes && (
            <Chip label="یادداشت معلم" size="small" color="warning" variant="outlined" sx={{ height: 20 }} />
          )}
        </Stack>
        <Typography variant="caption" color={tone === "pending" ? "info.main" : "text.secondary"}>
          {tone === "pending"
            ? exam.result_message ?? "منتشر نشده"
            : scoreLabel ?? "مشاهده کارنامه"}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color={isNew ? "primary.main" : "text.secondary"}
        fontWeight={600}
        sx={{ flexShrink: 0 }}
      >
        {tone === "pending" ? "وضعیت ←" : "کارنامه ←"}
      </Typography>
    </Box>
  );
}

export default function DashboardResultsPanel({
  recentResults,
  awaitingResults,
  onViewAll,
}: DashboardResultsPanelProps) {
  const unseen = recentResults.filter((e) => e.is_result_unseen);
  const seen = recentResults.filter((e) => !e.is_result_unseen);
  const isEmpty = unseen.length === 0 && seen.length === 0 && awaitingResults.length === 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          کارنامه‌ها
        </Typography>
        {onViewAll && (
          <Button size="small" onClick={onViewAll}>
            همه
          </Button>
        )}
      </Stack>

      {isEmpty ? (
        <Card variant="outlined" sx={{ py: 2, px: 2, textAlign: "center", bgcolor: "action.hover" }}>
          <Typography variant="body2" color="text.secondary">
            هنوز کارنامه‌ای ندارید.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={1}>
          {unseen.map((exam) => (
            <ResultRow key={exam.id} exam={exam} tone="new" />
          ))}
          {seen.map((exam) => (
            <ResultRow key={exam.id} exam={exam} tone="seen" />
          ))}
          {awaitingResults.map((exam) => (
            <ResultRow key={exam.id} exam={exam} tone="pending" />
          ))}
        </Stack>
      )}
    </Box>
  );
}
