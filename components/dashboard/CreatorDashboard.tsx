"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useCreatorDashboard } from "@/hooks/useExams";
import { useNotifications } from "@/hooks/useNotifications";
import ShellContentLoader from "@/components/layout/ShellContentLoader";
import { buildTeacherDashboardData } from "@/lib/teacher-dashboard";
import DashboardSectionEmpty from "@/components/dashboard/student/DashboardSectionEmpty";
import DashboardNotifications from "@/components/dashboard/student/DashboardNotifications";
import DashboardWeekCalendar from "@/components/dashboard/student/DashboardWeekCalendar";
import TeacherFocusExam from "@/components/dashboard/teacher/TeacherFocusExam";
import TeacherCompactExamRow from "@/components/dashboard/teacher/TeacherCompactExamRow";
import DashboardGradingPanel from "@/components/dashboard/teacher/DashboardGradingPanel";

interface CreatorDashboardProps {
  userName?: string | null;
}

export default function CreatorDashboard({ userName }: CreatorDashboardProps) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useCreatorDashboard();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({
    per_page: 3,
    page: 1,
  });

  const dashboard = useMemo(
    () =>
      buildTeacherDashboardData({
        exams: data?.exams ?? [],
        stats: data?.stats ?? {
          live_count: 0,
          pending_grading_exams_count: 0,
          total_published: 0,
        },
      }),
    [data]
  );

  const notifications = notificationsData?.data ?? [];
  const pageLoading = isLoading;
  const pageFetching = !isLoading && isFetching;
  const hasExams = dashboard.exams.length > 0;

  const shownIds = useMemo(() => {
    const ids = new Set<number>();
    if (dashboard.focus) {
      ids.add(dashboard.focus.exam.id);
      dashboard.focus.others.forEach((e) => ids.add(e.id));
    }
    return ids;
  }, [dashboard.focus]);

  return (
    <ShellContentLoader loading={pageLoading} fetching={pageFetching}>
      <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ maxWidth: 900, mx: "auto" }}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              سلام، {userName || "معلم عزیز"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              خلاصه وضعیت آزمون‌های شما
            </Typography>
            {hasExams && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {dashboard.stats.live_count > 0 && (
                  <Chip
                    size="small"
                    color="success"
                    label={`${dashboard.stats.live_count.toLocaleString("fa-IR")} در حال اجرا`}
                  />
                )}
                {dashboard.stats.pending_grading_exams_count > 0 && (
                  <Chip
                    size="small"
                    color="warning"
                    label={`${dashboard.stats.pending_grading_exams_count.toLocaleString("fa-IR")} نیاز به تصحیح`}
                  />
                )}
              </Stack>
            )}
          </Box>
          <Button size="small" variant="text" onClick={() => router.push("/exams")}>
            همه آزمون‌ها
          </Button>
        </Stack>

        {!hasExams && !pageLoading ? (
          <DashboardSectionEmpty message="هنوز آزمون منتشرشده‌ای ندارید." />
        ) : (
          <>
            {dashboard.focus ? (
              <TeacherFocusExam focus={dashboard.focus} />
            ) : (
              <CardPlaceholder message="آزمون در حال اجرا یا پیشِ رو ندارید." />
            )}

            {dashboard.focus && dashboard.focus.others.length > 0 && (
              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  سایر موارد
                </Typography>
                {dashboard.focus.others.slice(0, 3).map((exam) => (
                  <TeacherCompactExamRow key={exam.id} exam={exam} />
                ))}
              </Stack>
            )}

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

            <DashboardWeekCalendar days={dashboard.weekCalendar} />

            <DashboardGradingPanel
              exams={dashboard.needsGrading}
              excludeIds={[...shownIds]}
              onViewAll={() => router.push("/exams")}
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
