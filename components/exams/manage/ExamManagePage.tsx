"use client";

import { Suspense, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  useExamWithParticipants,
  usePublishExam,
  useUnpublishExam,
  useActivateExam,
  useDeactivateExam,
  useGenerateExamLink,
  useReleaseExamResults,
} from "@/hooks/useExams";
import { useExamRealtime } from "@/hooks/useExamRealtime";
import Breadcrumb from "@/components/Breadcrumb";
import { Toast } from "@/components/feedback/Alert/Alert";
import ParticipantManagement from "@/components/exams/ParticipantManagement";
import ExamNotificationsTab from "@/components/exams/ExamNotificationsTab";
import { ExamManageHero } from "@/components/exams/manage/ExamManageHero";
import { ExamManageActionsMenu } from "@/components/exams/manage/ExamManageActionsMenu";
import { ExamManageOverviewTab } from "@/components/exams/manage/ExamManageOverviewTab";
import { ExamManageSettingsTab } from "@/components/exams/manage/ExamManageSettingsTab";
import {
  ExamManageConfirmDialogs,
  type ExamManageConfirmAction,
} from "@/components/exams/manage/ExamManageConfirmDialogs";
import { ExamReportsTab } from "@/components/exams/reports/ExamReportsTab";
import { computeParticipantStats } from "@/lib/exam-manage-utils";
import { getExamCapabilities } from "@/lib/exam-capabilities";
import {
  examManageIndexFromTab,
  examManageTabFromIndex,
  parseExamManageTab,
} from "@/lib/exam-manage-tabs";

function ExamManageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const examId = params?.id ? parseInt(params.id as string, 10) : null;

  const [tabIndex, setTabIndex] = useState(() =>
    examManageIndexFromTab(parseExamManageTab(searchParams.get("tab")))
  );
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmAction, setConfirmAction] = useState<ExamManageConfirmAction>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data: exam, isLoading, error } = useExamWithParticipants(examId);
  const caps = exam ? getExamCapabilities(exam) : null;
  const reportsTab = caps?.can_view_reports && tabIndex === 2;

  useEffect(() => {
    if (!exam) return;
    let tab = parseExamManageTab(searchParams.get("tab"));
    if (tab === "reports" && !getExamCapabilities(exam).can_view_reports) {
      tab = "overview";
    }
    setTabIndex(examManageIndexFromTab(tab));
  }, [searchParams, exam]);

  useExamRealtime(examId, { grading: true, reports: reportsTab });

  const publishExamMutation = usePublishExam();
  const unpublishExamMutation = useUnpublishExam();
  const activateExamMutation = useActivateExam();
  const deactivateExamMutation = useDeactivateExam();
  const generateExamLinkMutation = useGenerateExamLink();
  const releaseExamResultsMutation = useReleaseExamResults();

  const showToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
    if (examId) {
      router.replace(`/exams/${examId}?tab=${examManageTabFromIndex(newIndex)}`, {
        scroll: false,
      });
    }
  };

  const runConfirmAction = () => {
    if (!examId || !confirmAction) return;
    const onDone = () => {
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["exam", "manage", examId] });
    };
    const onErr = (err: Error) => {
      showToast(err.message || "عملیات ناموفق بود", "error");
    };

    if (confirmAction === "publish") {
      publishExamMutation.mutate(examId, {
        onSuccess: () => {
          showToast("آزمون با موفقیت منتشر شد", "success");
          onDone();
        },
        onError: onErr,
      });
      return;
    }
    if (confirmAction === "unpublish") {
      unpublishExamMutation.mutate(examId, {
        onSuccess: () => {
          showToast("آزمون از حالت انتشار خارج شد", "success");
          onDone();
        },
        onError: onErr,
      });
      return;
    }
    if (confirmAction === "activate") {
      activateExamMutation.mutate(examId, {
        onSuccess: () => {
          showToast("آزمون فعال شد", "success");
          onDone();
        },
        onError: onErr,
      });
      return;
    }
    if (confirmAction === "deactivate") {
      deactivateExamMutation.mutate(examId, {
        onSuccess: () => {
          showToast("آزمون غیرفعال شد", "success");
          onDone();
        },
        onError: onErr,
      });
      return;
    }
    if (confirmAction === "releaseResults") {
      releaseExamResultsMutation.mutate(examId, {
        onSuccess: () => {
          showToast("نتایج آزمون برای شرکت‌کنندگان منتشر شد", "success");
          onDone();
        },
        onError: onErr,
      });
    }
  };

  const confirmPending =
    publishExamMutation.isPending ||
    unpublishExamMutation.isPending ||
    activateExamMutation.isPending ||
    deactivateExamMutation.isPending ||
    releaseExamResultsMutation.isPending;

  const handlePrint = () => {
    if (!examId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    window.open(`${origin}/exams/print?exam_id=${examId}&template=default`, "_blank");
  };

  const handleGenerateLink = () => {
    if (!examId) return;
    generateExamLinkMutation.mutate(examId, {
      onSuccess: () => {
        showToast("لینک آزمون تولید شد", "success");
        queryClient.invalidateQueries({ queryKey: ["exam", "manage", examId] });
      },
      onError: (err: Error) => showToast(err.message || "خطا در تولید لینک", "error"),
    });
  };

  if (isLoading) {
    return (
      <Stack alignItems="center" py={10}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !exam || !examId || !caps) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {error instanceof Error ? error.message : "بارگذاری اطلاعات آزمون ناموفق بود."}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/exams")}>
          بازگشت به لیست آزمون‌ها
        </Button>
      </Stack>
    );
  }

  const stats = computeParticipantStats(exam.participants);
  const gradingMode = (exam as { grading_mode?: string }).grading_mode;
  const isOffline = exam.type === "offline";

  return (
    <Stack spacing={2.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Breadcrumb
          items={[
            { label: "مدیریت آزمون‌ها", href: "/exams" },
            { label: exam.title },
          ]}
        />
        <Button
          size="small"
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/exams")}
        >
          لیست آزمون‌ها
        </Button>
      </Stack>

      <ExamManageHero
        exam={exam}
        capabilities={caps}
        onEdit={() => router.push(`/exams/create?exam_id=${exam.id}`)}
        onQuestions={() => router.push(`/exams/${exam.id}/questions`)}
        onGrading={() => router.push(`/exams/${exam.id}/grading`)}
        onOpenActionsMenu={setActionsMenuAnchor}
      />

      <ExamManageActionsMenu
        exam={exam}
        capabilities={caps}
        anchorEl={actionsMenuAnchor}
        onClose={() => setActionsMenuAnchor(null)}
        onPublish={() => setConfirmAction("publish")}
        onUnpublish={() => setConfirmAction("unpublish")}
        onActivate={() => setConfirmAction("activate")}
        onDeactivate={() => setConfirmAction("deactivate")}
        onPrint={handlePrint}
        onReleaseResults={() => setConfirmAction("releaseResults")}
      />

      <ExamManageConfirmDialogs
        action={confirmAction}
        isPending={confirmPending}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmAction}
      />

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="خلاصه" icon={<DashboardIcon />} iconPosition="start" />
        <Tab
          label="شرکت‌کنندگان"
          icon={<PeopleIcon />}
          iconPosition="start"
          data-cy="exam-tab-participants"
        />
        {caps.can_view_reports && (
          <Tab label="گزارش" icon={<AssessmentIcon />} iconPosition="start" data-cy="exam-tab-reports" />
        )}
        <Tab label="اعلان‌ها" icon={<NotificationsIcon />} iconPosition="start" />
        <Tab label="تنظیمات" icon={<SettingsIcon />} iconPosition="start" />
      </Tabs>

      {tabIndex === 0 && (
        <ExamManageOverviewTab
          exam={exam}
          stats={stats}
          onQuestions={() => router.push(`/exams/${exam.id}/questions`)}
          onGrading={() => router.push(`/exams/${exam.id}/grading`)}
          onPrint={handlePrint}
          canGrade={caps.can_grade}
          isOffline={isOffline}
        />
      )}

      {tabIndex === 1 && (
        <Box>
          <ParticipantManagement
            examId={examId}
            examTitle={exam.title}
            participants={exam.participants}
            gradingMode={gradingMode}
            groups={exam.groups || []}
            registrationLink={exam.registration_link}
            examLink={exam.exam_link}
            canManageParticipants={caps.can_manage_participants}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["exam", "manage", examId] });
            }}
          />
        </Box>
      )}

      {caps.can_view_reports && tabIndex === 2 && (
        <ExamReportsTab examId={examId} canGrade={caps.can_grade} />
      )}

      {tabIndex === (caps.can_view_reports ? 3 : 2) && (
        <Box>
          <ExamNotificationsTab
            examId={examId}
            participants={exam.participants}
            isPublished={exam.status === "published"}
          />
        </Box>
      )}

      {tabIndex === (caps.can_view_reports ? 4 : 3) && (
        <ExamManageSettingsTab
          exam={exam}
          onGenerateExamLink={handleGenerateLink}
          isGeneratingLink={generateExamLinkMutation.isPending}
        />
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </Stack>
  );
}

export function ExamManagePage() {
  return (
    <Suspense
      fallback={
        <Stack alignItems="center" py={10}>
          <CircularProgress />
        </Stack>
      }
    >
      <ExamManageContent />
    </Suspense>
  );
}
