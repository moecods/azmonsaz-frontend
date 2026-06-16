"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useAvailableExams } from "@/hooks/useExams";
import { useNotifications } from "@/hooks/useNotifications";
import ShellContentLoader from "@/components/layout/ShellContentLoader";
import {
  buildStudentDashboardData,
  normalizeAvailableExams,
} from "@/lib/student-dashboard";
import DashboardSectionEmpty from "./DashboardSectionEmpty";
import DashboardFocusExam from "./DashboardFocusExam";
import DashboardCompactExamRow from "./DashboardCompactExamRow";
import DashboardNotifications from "./DashboardNotifications";
import DashboardWeekCalendar from "./DashboardWeekCalendar";
import DashboardResultsPanel from "./DashboardResultsPanel";

interface StudentDashboardProps {
  userName?: string | null;
}

export default function StudentDashboard({ userName }: StudentDashboardProps) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useAvailableExams();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({
    per_page: 3,
    page: 1,
  });

  const dashboard = useMemo(
    () => buildStudentDashboardData(normalizeAvailableExams(data)),
    [data]
  );

  const notifications = notificationsData?.data ?? [];
  const pageLoading = isLoading;
  const pageFetching = !isLoading && isFetching;
  const hasAnyExam = dashboard.exams.length > 0;

  return (
    <ShellContentLoader loading={pageLoading} fetching={pageFetching}>
      <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ maxWidth: 900, mx: "auto" }}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              سلام، {userName || "دانش‌آموز عزیز"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              خلاصه وضعیت آزمون‌های شما
            </Typography>
          </Box>
          <Button size="small" variant="text" onClick={() => router.push("/exams/available")}>
            همه آزمون‌ها
          </Button>
        </Stack>

        {!hasAnyExam && !pageLoading ? (
          <DashboardSectionEmpty message="هنوز در آزمونی ثبت‌نام نکرده‌اید." />
        ) : (
          <>
            {dashboard.focus ? (
              <DashboardFocusExam focus={dashboard.focus} />
            ) : (
              <CardPlaceholder message="آزمون فعال یا پیشِ رو ندارید." />
            )}

            {dashboard.focus && dashboard.focus.others.length > 0 && (
              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  سایر آزمون‌ها
                </Typography>
                {dashboard.focus.others.slice(0, 3).map((exam) => (
                  <DashboardCompactExamRow key={exam.id} exam={exam} />
                ))}
              </Stack>
            )}

            <DashboardWeekCalendar days={dashboard.weekCalendar} />

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                اعلان‌ها
              </Typography>
              {notificationsLoading ? (
                <Typography variant="body2" color="text.secondary">
                  در حال بارگذاری…
                </Typography>
              ) : notifications.length > 0 ? (
                <DashboardNotifications notifications={notifications.slice(0, 3)} />
              ) : (
                <Typography variant="body2" color="text.disabled">
                  اعلان جدیدی نیست.
                </Typography>
              )}
            </Box>

            <DashboardResultsPanel
              recentResults={dashboard.recentResults}
              awaitingResults={dashboard.awaitingResults}
              onViewAll={() => router.push("/exams/available")}
            />
          </>
        )}
      </Stack>
    </ShellContentLoader>
  );
}

function CardPlaceholder({ message }: { message: string }) {
  return (
    <Box
      sx={{
        py: 2,
        px: 2,
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "action.hover",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
