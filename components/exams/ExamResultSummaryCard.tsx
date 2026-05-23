"use client";

import type { ReactNode } from "react";
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import type { ExamResultDetail } from "@/services/exams/ExamService";
import {
  getExamOutcomeHeadline,
  getExamOutcomeSubline,
  getSummaryCircleColors,
} from "@/lib/exam-result-copy";
import { isDescriptiveGradingMode } from "@/lib/grading";

export interface ExamResultQuestionStats {
  total: number;
  correctCount: number;
  reviewCount: number;
  pendingGradingCount: number;
}

export interface ExamResultSummaryCardProps {
  gradingMode?: string | null;
  gradingConfig?: Record<string, unknown> | null;
  passingScore?: number | null;
  result: ExamResultDetail["result"];
  questionStats: ExamResultQuestionStats;
}

function formatScoreOfMax(value: number, max: number): string {
  return `${value.toLocaleString("fa-IR")} از ${max.toLocaleString("fa-IR")}`;
}

interface StatItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  compact?: boolean;
}

function StatItem({ icon, label, value, valueColor = "text.primary", compact }: StatItemProps) {
  return (
    <Box
      sx={{
        p: compact ? { xs: 0.75, md: 1.25 } : { xs: 1, md: 1.5 },
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        minWidth: 0,
      }}
    >
      <Stack
        direction={compact ? "row" : { xs: "row", md: "column" }}
        spacing={compact ? 1.25 : { xs: 1, md: 0.75 }}
        alignItems={compact ? "center" : { xs: "flex-start", md: "flex-start" }}
      >
        <Box sx={{ color: "primary.main", flexShrink: 0, "& svg": { fontSize: compact ? 22 : 20 } }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.3}>
            {label}
          </Typography>
          <Typography
            variant={compact ? "subtitle1" : "subtitle1"}
            fontWeight={700}
            color={valueColor}
            sx={{ mt: 0.25, lineHeight: 1.3 }}
            noWrap={compact}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function ScoreRing({
  value,
  max,
  centerLabel,
  subLabel,
  color,
  size,
}: {
  value: number;
  max: number;
  centerLabel: string;
  subLabel?: string;
  color: "primary" | "success" | "warning";
  size: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0, lineHeight: 0 }}>
      <CircularProgress
        variant="determinate"
        value={pct}
        size={size}
        thickness={4}
        color={color}
        sx={{ opacity: 0.92, display: "block" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 0.75,
          textAlign: "center",
        }}
      >
        <Typography fontWeight={800} lineHeight={1.1} sx={{ fontSize: "1.05rem" }}>
          {centerLabel}
        </Typography>
        {subLabel && (
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: "0.7rem", lineHeight: 1.1 }}>
            {subLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ExamResultSummaryCard({
  gradingMode,
  gradingConfig,
  passingScore,
  result,
  questionStats,
}: ExamResultSummaryCardProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const descriptiveGrading = isDescriptiveGradingMode(gradingMode);
  const scaleMax =
    descriptiveGrading && gradingConfig && typeof gradingConfig === "object"
      ? Number((gradingConfig as { scale_max?: number }).scale_max ?? 20)
      : 20;

  const { total, correctCount, reviewCount, pendingGradingCount } = questionStats;
  const summaryCircle = getSummaryCircleColors(result.passed);
  const descriptiveLabel = result.outcome_label?.trim() ?? "";
  const hasDescriptiveOutcome = descriptiveGrading && descriptiveLabel.length > 0;
  const hasNumericScore = result.scaled_score != null;

  const heroGradient = result.passed
    ? `linear-gradient(145deg, ${alpha(theme.palette.success.main, 0.14)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`
    : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.grey[500], 0.06)} 100%)`;

  const completedLabel = result.completed_at
    ? new Date(result.completed_at).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
    : null;

  const ringColor = result.passed ? "success" : "primary";
  const ringSize = 112;
  const hideRingOnMobile = !isDesktop;

  const stats = [
    {
      key: "rank",
      icon: <EmojiEventsIcon />,
      label: "رتبه",
      value: `${result.rank.toLocaleString("fa-IR")} از ${result.total_participants.toLocaleString("fa-IR")}`,
    },
    {
      key: "correct",
      icon: <CheckCircleIcon />,
      label: "پاسخ درست",
      value: `${correctCount.toLocaleString("fa-IR")} از ${total.toLocaleString("fa-IR")}`,
      valueColor: "success.main",
    },
    ...(reviewCount > 0
      ? [
          {
            key: "review",
            icon: <AutoStoriesIcon />,
            label: "نیاز به مرور",
            value: `${reviewCount.toLocaleString("fa-IR")} سوال`,
          },
        ]
      : []),
    ...(pendingGradingCount > 0
      ? [
          {
            key: "pending",
            icon: <PendingActionsIcon />,
            label: "در انتظار تصحیح",
            value: `${pendingGradingCount.toLocaleString("fa-IR")} سوال`,
            valueColor: "info.main",
          },
        ]
      : []),
    ...(completedLabel
      ? [
          {
            key: "completed",
            icon: <ScheduleIcon />,
            label: "تاریخ تکمیل",
            value: completedLabel,
          },
        ]
      : []),
  ];

  const scoreRing =
    descriptiveGrading && hasNumericScore ? (
      <ScoreRing
        value={result.scaled_score!}
        max={scaleMax}
        centerLabel={result.scaled_score!.toLocaleString("fa-IR")}
        subLabel={`از ${scaleMax.toLocaleString("fa-IR")}`}
        color={ringColor}
        size={ringSize}
      />
    ) : !descriptiveGrading ? (
      <ScoreRing
        value={result.score}
        max={result.total_points}
        centerLabel={`${result.percentage.toLocaleString("fa-IR")}٪`}
        subLabel={`${result.score}/${result.total_points} نمره`}
        color={ringColor}
        size={ringSize}
      />
    ) : null;

  return (
    <Card
      elevation={0}
      sx={{
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}`,
      }}
    >
      <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: { xs: 2, md: 2.5 }, background: heroGradient }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, md: 3 }}
          alignItems={{ xs: "center", md: "center" }}
        >
          <Box
            sx={{
              width: { xs: 72, md: 80 },
              height: { xs: 72, md: 80 },
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: summaryCircle.bgcolor,
              flexShrink: 0,
              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
            }}
          >
            {result.passed ? (
              <CheckCircleIcon sx={{ fontSize: { xs: 40, md: 44 }, color: summaryCircle.iconColor }} />
            ) : (
              <MenuBookIcon sx={{ fontSize: { xs: 36, md: 40 }, color: summaryCircle.iconColor }} />
            )}
          </Box>

          <Stack
            spacing={1}
            sx={{
              flex: 1,
              minWidth: 0,
              width: { xs: "100%", md: "auto" },
              textAlign: { xs: "center", md: "start" },
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            {hasDescriptiveOutcome ? (
              <>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={result.passed ? "قبول" : "نیاز به تلاش بیشتر"}
                    size="small"
                    color={result.passed ? "success" : "default"}
                    sx={{ height: 24 }}
                  />
                  {hasNumericScore && (
                    <Chip
                      label={`نمره ${formatScoreOfMax(result.scaled_score!, scaleMax)}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 24 }}
                    />
                  )}
                </Stack>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ fontSize: { xs: "1.1rem", md: "1.65rem" }, lineHeight: 1.3, maxWidth: 640 }}
                >
                  {descriptiveLabel}
                </Typography>
              </>
            ) : descriptiveGrading ? (
              <>
                <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.2rem", md: "1.45rem" }, lineHeight: 1.35 }}>
                  {pendingGradingCount > 0
                    ? "نتیجه پس از تصحیح اعلام می‌شود"
                    : "نتیجه هنوز ثبت نشده"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 520, display: { xs: "none", sm: "block" } }}
                >
                  {pendingGradingCount > 0
                    ? "بخشی از پاسخ‌ها در حال بررسی است؛ پس از اتمام تصحیح، توصیف و نمره اینجا نمایش داده می‌شود."
                    : "پس از ثبت نمره توسط معلم، نتیجه اینجا نمایش داده می‌شود."}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.1rem", md: "1.5rem" }, lineHeight: 1.3 }}>
                  {getExamOutcomeHeadline(result.passed, result.percentage)}
                </Typography>
                {!isDesktop && (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={`${result.percentage.toLocaleString("fa-IR")}٪`}
                      size="small"
                      color="primary"
                      sx={{ height: 24, fontWeight: 700 }}
                    />
                    <Chip
                      label={`${result.score.toLocaleString("fa-IR")} از ${result.total_points.toLocaleString("fa-IR")} نمره`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 24 }}
                    />
                  </Stack>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 520, display: { xs: "none", md: "block" } }}
                >
                  {getExamOutcomeSubline(result.passed, passingScore)}
                </Typography>
              </>
            )}
          </Stack>

          {scoreRing && (
            <Box
              sx={{
                flexShrink: 0,
                display: hideRingOnMobile ? { xs: "none", md: "block" } : "block",
              }}
            >
              {scoreRing}
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: { xs: 1.25, md: 2.25 }, borderColor: alpha(theme.palette.divider, 0.8) }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: `repeat(${Math.min(stats.length, 5)}, minmax(0, 1fr))`,
            },
            gap: { xs: 1, md: 1.25 },
          }}
        >
          {stats.map((stat) => (
            <StatItem
              key={stat.key}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              valueColor={stat.valueColor}
              compact={isDesktop}
            />
          ))}
        </Box>
      </Box>
    </Card>
  );
}
