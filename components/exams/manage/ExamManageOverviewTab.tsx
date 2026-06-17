"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import KeyIcon from "@mui/icons-material/Key";
import type { ExamWithParticipants } from "@/services/exams/ExamService";
import { computeParticipantStats } from "@/lib/exam-manage-utils";
import { ExamManageStatCard } from "@/components/exams/manage/ExamManageStatCard";
import { ExamManageLifecycleCard } from "@/components/exams/manage/ExamManageLifecycleCard";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";

interface ExamManageOverviewTabProps {
  exam: ExamWithParticipants;
  stats: ReturnType<typeof computeParticipantStats>;
  onPrint: () => void;
  onPrintAnswerKey: () => void;
  isOffline: boolean;
}

export function ExamManageOverviewTab({
  exam,
  stats,
  onPrint,
  onPrintAnswerKey,
  isOffline,
}: ExamManageOverviewTabProps) {
  return (
    <Stack spacing={2.5}>
      <ExamManageLifecycleCard exam={exam} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 1.5,
        }}
      >
        <ExamManageStatCard icon={<QuizIcon />} label="سوالات" value={exam.questions_count} />
        <ExamManageStatCard icon={<PeopleIcon />} label="شرکت‌کننده" value={stats.total} />
        <ExamManageStatCard
          icon={<PlayCircleOutlineIcon />}
          label="در حال انجام"
          value={exam.participants.filter(
            (p) => p.started_at && !p.completed_at && p.status !== "absent"
          ).length}
          tone="warning"
        />
        <ExamManageStatCard icon={<CheckCircleIcon />} label="قبول‌شده" value={stats.passedCount} tone="success" />
      </Box>

      {isOffline && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={onPrint}>
            چاپ برگه
          </Button>
          <Button variant="outlined" startIcon={<KeyIcon />} onClick={onPrintAnswerKey}>
            چاپ پاسخنامه
          </Button>
        </Stack>
      )}

      <Typography variant="caption" color="text.secondary">
        از دکمه‌های بالای صفحه برای مدیریت سوالات و تصحیح، و از منوی بخش‌ها برای شرکت‌کنندگان، گزارش و تنظیمات استفاده کنید.
      </Typography>
    </Stack>
  );
}
