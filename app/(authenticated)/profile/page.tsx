"use client";

import { useMemo, useState } from "react";
import { Box, Card, Stack, Tab, Tabs, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import QuizIcon from "@mui/icons-material/Quiz";
import { useAuth, useAvailableExams, useExams } from "@/hooks";
import { useGroups } from "@/hooks/useGroups";
import Breadcrumb from "@/components/Breadcrumb";
import { Toast } from "@/components/feedback/Alert/Alert";
import ShellContentLoader from "@/components/layout/ShellContentLoader";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileActivityPanel } from "@/components/profile/ProfileActivityPanel";
import { ProfileExamsPanel } from "@/components/profile/ProfileExamsPanel";
import { ProfileAccountPanel } from "@/components/profile/ProfileAccountPanel";
import { buildProfileStats, isCreatorRole } from "@/lib/profile-utils";
import { normalizeAvailableExams as normalizeFromDashboard } from "@/lib/student-dashboard";

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const isCreator = isCreatorRole(user?.roles);

  const {
    data: availableExamsData,
    isLoading: availableLoading,
    isFetching: availableFetching,
  } = useAvailableExams();
  const {
    data: examsListData,
    isLoading: examsLoading,
    isFetching: examsFetching,
  } = useExams({ per_page: 100 }, { enabled: isCreator });
  const {
    data: groups = [],
    isLoading: groupsLoading,
    isFetching: groupsFetching,
  } = useGroups({ enabled: isCreator });

  const statsLoading = availableLoading || (isCreator && (examsLoading || groupsLoading));
  const statsFetching =
    availableFetching || (isCreator && (examsFetching || groupsFetching));

  const availableExams = useMemo(
    () => normalizeFromDashboard(availableExamsData),
    [availableExamsData]
  );

  const profileStats = useMemo(
    () =>
      buildProfileStats(
        availableExamsData,
        isCreator ? examsListData?.data : null,
        isCreator ? examsListData?.meta?.total : undefined,
        isCreator ? groups.length : undefined
      ),
    [availableExamsData, examsListData, groups.length, isCreator]
  );

  const quickStats = useMemo(() => {
    const p = profileStats.participation;
    const items: { label: string; value: string }[] = [
      { label: "ثبت‌نام", value: p.total.toLocaleString("fa-IR") },
      { label: "تکمیل", value: p.completed.toLocaleString("fa-IR") },
    ];
    if (p.averagePercent != null) {
      items.push({ label: "میانگین", value: `${p.averagePercent.toLocaleString("fa-IR")}٪` });
    }
    return items;
  }, [profileStats]);

  if (!user) {
    return null;
  }

  return (
    <ShellContentLoader loading={statsLoading} fetching={!statsLoading && statsFetching}>
      <Stack spacing={3}>
        <Breadcrumb items={[{ label: "پروفایل" }]} />

        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            پروفایل من
          </Typography>
          <Typography variant="body2" color="text.secondary">
            اطلاعات حساب، آمار فعالیت و سوابق شرکت در آزمون‌ها
          </Typography>
        </Box>

        <ProfileHero user={user} quickStats={quickStats} />

        <Card variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 0, sm: 1 } }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="حساب و امنیت" />
            <Tab icon={<BarChartIcon />} iconPosition="start" label="آمار فعالیت" />
            <Tab icon={<QuizIcon />} iconPosition="start" label="آزمون‌های من" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {tab === 0 && (
              <ProfileAccountPanel
                user={user}
                onSuccess={(message) =>
                  setToast({ open: true, message, severity: "success" })
                }
              />
            )}
            {tab === 1 && (
              <ProfileActivityPanel stats={profileStats} showCreator={isCreator} />
            )}
            {tab === 2 && <ProfileExamsPanel exams={availableExams} />}
          </Box>
        </Card>

        {toast.open && (
          <Toast
            open={toast.open}
            onClose={() => setToast((t) => ({ ...t, open: false }))}
            message={toast.message}
            severity={toast.severity}
          />
        )}
      </Stack>
    </ShellContentLoader>
  );
}
