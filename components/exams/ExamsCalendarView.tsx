"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import TodayIcon from "@mui/icons-material/Today";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import type { ExamListItem } from "@/services/exams/ExamService";
import {
  addDays,
  buildExamAgendaGroups,
  buildExamWeekDays,
  formatWeekRangeLabel,
  listUnscheduledExams,
  startOfWeekSaturday,
} from "@/lib/exam-calendar-events";

type CalendarView = "week" | "agenda";

interface ExamsCalendarViewProps {
  exams: ExamListItem[];
  onSelectExam: (examId: number) => void;
}

function ExamEventChip({
  title,
  timeLabel,
  status,
  onClick,
}: {
  title: string;
  timeLabel: string | null;
  status: ExamListItem["status"];
  onClick: () => void;
}) {
  const theme = useTheme();
  const isDraft = status === "draft";

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        p: 1,
        borderRadius: 1.5,
        cursor: "pointer",
        border: "1px solid",
        borderColor: isDraft ? "warning.light" : "primary.light",
        bgcolor: isDraft
          ? alpha(theme.palette.warning.main, 0.08)
          : alpha(theme.palette.primary.main, 0.08),
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: 1,
          bgcolor: isDraft
            ? alpha(theme.palette.warning.main, 0.14)
            : alpha(theme.palette.primary.main, 0.14),
        },
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.3,
          mb: timeLabel ? 0.25 : 0,
        }}
      >
        {title}
      </Typography>
      {timeLabel && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
          {timeLabel}
        </Typography>
      )}
    </Box>
  );
}

export default function ExamsCalendarView({ exams, onSelectExam }: ExamsCalendarViewProps) {
  const theme = useTheme();
  const [view, setView] = useState<CalendarView>("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeekSaturday(new Date()));

  const weekDays = useMemo(() => buildExamWeekDays(exams, weekStart), [exams, weekStart]);
  const agendaGroups = useMemo(
    () => buildExamAgendaGroups(exams, weekStart, addDays(weekStart, 6)),
    [exams, weekStart]
  );
  const unscheduled = useMemo(() => listUnscheduledExams(exams), [exams]);

  const weekExamCount = weekDays.reduce((sum, d) => sum + d.placements.length, 0);
  const rangeLabel = formatWeekRangeLabel(weekStart);

  const goToday = () => setWeekStart(startOfWeekSaturday(new Date()));
  const goPrev = () => setWeekStart((d) => addDays(d, -7));
  const goNext = () => setWeekStart((d) => addDays(d, 7));

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
          <Button size="small" variant="outlined" onClick={goPrev} aria-label="هفته قبل">
            <ChevronRightIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<TodayIcon fontSize="small" />}
            onClick={goToday}
            sx={{ minWidth: { xs: "auto", sm: 88 } }}
          >
            امروز
          </Button>
          <Button size="small" variant="outlined" onClick={goNext} aria-label="هفته بعد">
            <ChevronLeftIcon fontSize="small" />
          </Button>
        </Stack>

        <Typography
          variant="subtitle1"
          fontWeight={700}
          textAlign="center"
          sx={{ flex: 1, px: 1 }}
        >
          {rangeLabel}
        </Typography>

        <ButtonGroup size="small" sx={{ alignSelf: { xs: "center", sm: "flex-end" } }}>
          <Button
            variant={view === "week" ? "contained" : "outlined"}
            startIcon={<ViewWeekIcon />}
            onClick={() => setView("week")}
          >
            هفتگی
          </Button>
          <Button
            variant={view === "agenda" ? "contained" : "outlined"}
            startIcon={<ViewAgendaIcon />}
            onClick={() => setView("agenda")}
          >
            برنامه
          </Button>
        </ButtonGroup>
      </Stack>

      <Typography variant="caption" color="text.secondary" textAlign="center">
        {weekExamCount > 0
          ? `${weekExamCount.toLocaleString("fa-IR")} رویداد در این هفته`
          : "در این هفته آزمون زمان‌بندی‌شده‌ای نیست"}
      </Typography>

      {view === "week" ? (
        <Card
          variant="outlined"
          sx={{
            overflow: "hidden",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(7, minmax(88px, 1fr))",
                md: "repeat(7, 1fr)",
              },
              overflowX: { xs: "auto", md: "visible" },
              WebkitOverflowScrolling: "touch",
            }}
          >
            {weekDays.map((day) => (
              <Box
                key={day.key}
                sx={{
                  minHeight: { xs: 120, md: 140 },
                  p: { xs: 1, md: 1.25 },
                  borderInlineStart: "1px solid",
                  borderColor: "divider",
                  bgcolor: day.isToday
                    ? alpha(theme.palette.primary.main, 0.06)
                    : "transparent",
                  "&:first-of-type": { borderInlineStart: "none" },
                }}
              >
                <Stack spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    fontWeight={day.isToday ? 700 : 500}
                    color={day.isToday ? "primary.main" : "text.secondary"}
                  >
                    {day.weekdayLabel}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={day.isToday ? 800 : 600}>
                    {day.dayLabel}
                  </Typography>
                  {day.isToday && (
                    <Chip
                      label="امروز"
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                  )}
                </Stack>

                <Stack spacing={0.75}>
                  {day.placements.length === 0 ? (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      textAlign="center"
                      sx={{ py: 2, display: "block" }}
                    >
                      —
                    </Typography>
                  ) : (
                    day.placements.map(({ exam, timeLabel }) => (
                      <ExamEventChip
                        key={`${day.key}-${exam.id}`}
                        title={exam.title}
                        timeLabel={timeLabel}
                        status={exam.status}
                        onClick={() => onSelectExam(exam.id)}
                      />
                    ))
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {agendaGroups.length === 0 ? (
            <Card variant="outlined">
              <Stack alignItems="center" spacing={1} sx={{ py: 4, px: 2 }}>
                <EventBusyIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                <Typography color="text.secondary" textAlign="center">
                  در این هفته آزمونی با بازه زمانی مشخص ثبت نشده است.
                </Typography>
              </Stack>
            </Card>
          ) : (
            agendaGroups.map((group) => (
              <Card key={group.key} variant="outlined" sx={{ overflow: "hidden" }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: group.isToday
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.action.hover, 0.5),
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {group.weekdayLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.dayLabel}
                    </Typography>
                    {group.isToday && <Chip label="امروز" size="small" color="primary" />}
                  </Stack>
                </Box>
                <Stack divider={<Divider flexItem />} sx={{ p: 1.5 }} spacing={0}>
                  {group.placements.map(({ exam, timeLabel, scheduleLabel }) => (
                    <Box
                      key={exam.id}
                      sx={{
                        py: 1,
                        px: 0.5,
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight={700}
                        sx={{ minWidth: 88, flexShrink: 0 }}
                      >
                        {timeLabel ?? "—"}
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
                          onClick={() => onSelectExam(exam.id)}
                        >
                          {exam.title}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                          <Chip
                            label={exam.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                            size="small"
                            color={exam.status === "published" ? "success" : "default"}
                            variant="outlined"
                            sx={{ height: 22 }}
                          />
                          <Chip
                            label={scheduleLabel}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, maxWidth: "100%" }}
                          />
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            ))
          )}
        </Stack>
      )}

      {unscheduled.length > 0 && (
        <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
          <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" fontWeight={700}>
              بدون بازه تقویمی ({unscheduled.length.toLocaleString("fa-IR")})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              آزمون‌های بدون زمان‌بندی یا با مدت آزاد — در نمای هفتگی/برنامه نمایش داده نمی‌شوند.
            </Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ p: 1.5 }}>
            {unscheduled.map((exam) => (
              <Chip
                key={exam.id}
                label={exam.title}
                size="small"
                onClick={() => onSelectExam(exam.id)}
                sx={{ maxWidth: "100%" }}
              />
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
