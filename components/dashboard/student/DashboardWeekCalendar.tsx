"use client";

import {
  Box,
  Card,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import type { WeekCalendarDay } from "@/lib/dashboard-calendar";
import { useRouter } from "next/navigation";

interface DashboardWeekCalendarProps {
  days: WeekCalendarDay[];
}

export default function DashboardWeekCalendar({ days }: DashboardWeekCalendarProps) {
  const theme = useTheme();
  const router = useRouter();
  const totalExams = days.reduce((sum, d) => sum + d.exams.length, 0);

  return (
    <Card variant="outlined" elevation={0} sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              هفت روز پیشِ رو
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {totalExams > 0
              ? `${totalExams.toLocaleString("fa-IR")} برنامه در این هفته`
              : "بدون آزمون برنامه‌ریزی‌شده"}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(7, minmax(72px, 1fr))",
            md: "repeat(7, 1fr)",
          },
          gap: 0,
          overflowX: { xs: "auto", md: "visible" },
          WebkitOverflowScrolling: "touch",
        }}
      >
        {days.map((day) => (
          <Box
            key={day.key}
            sx={{
              minHeight: { xs: 88, md: 100 },
              p: { xs: 0.75, md: 1 },
              borderInlineStart: "1px solid",
              borderColor: "divider",
              bgcolor: day.isToday ? (t) => alpha(t.palette.primary.main, 0.06) : "transparent",
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
                <Chip label="امروز" size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />
              )}
            </Stack>

            <Stack spacing={0.75}>
              {day.exams.length === 0 ? (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  textAlign="center"
                  sx={{ display: "block", py: 1, fontSize: "0.7rem" }}
                >
                  —
                </Typography>
              ) : (
                day.exams.map(({ exam, timeLabel }) => (
                  <Box
                    key={exam.id}
                    onClick={() => router.push(exam.href ?? `/exams/${exam.id}`)}
                    sx={{
                      p: 0.75,
                      borderRadius: 1,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: day.isToday ? "primary.light" : "divider",
                      bgcolor: "background.paper",
                      transition: "background-color 0.15s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.25,
                        fontSize: "0.68rem",
                      }}
                    >
                      {exam.title}
                    </Typography>
                    {timeLabel && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                        {timeLabel}
                      </Typography>
                    )}
                  </Box>
                ))
              )}
            </Stack>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
