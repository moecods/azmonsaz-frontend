"use client";

import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import PublishIcon from "@mui/icons-material/Publish";
import DraftsIcon from "@mui/icons-material/Drafts";
import type { ProfileStats } from "@/lib/profile-utils";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";

interface ProfileActivityPanelProps {
  stats: ProfileStats;
  showCreator: boolean;
}

export function ProfileActivityPanel({ stats, showCreator }: ProfileActivityPanelProps) {
  const p = stats.participation;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          شرکت در آزمون‌ها
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          خلاصه وضعیت ثبت‌نام و تکمیل آزمون‌هایی که در آن‌ها شرکت کرده‌اید.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <ProfileStatCard
            label="کل ثبت‌نام‌ها"
            value={p.total}
            icon={<QuizIcon fontSize="small" />}
            color="primary"
          />
          <ProfileStatCard
            label="تکمیل‌شده"
            value={p.completed}
            icon={<CheckCircleIcon fontSize="small" />}
            color="success"
            hint={p.passedCount > 0 ? `${p.passedCount.toLocaleString("fa-IR")} قبولی` : undefined}
          />
          <ProfileStatCard
            label="در حال انجام"
            value={p.inProgress}
            icon={<PlayCircleOutlineIcon fontSize="small" />}
            color="warning"
          />
          <ProfileStatCard
            label="پیشِ رو"
            value={p.upcoming}
            icon={<EventIcon fontSize="small" />}
            color="info"
          />
          {(p.absent > 0 || p.timeEnded > 0) && (
            <ProfileStatCard
              label="غیبت / مهلت تمام"
              value={p.absent + p.timeEnded}
              icon={<CancelIcon fontSize="small" />}
              color="error"
            />
          )}
          {p.averagePercent != null && (
            <ProfileStatCard
              label="میانگین نمره"
              value={`${p.averagePercent.toLocaleString("fa-IR")}٪`}
              icon={<TrendingUpIcon fontSize="small" />}
              color="secondary"
              hint="میانگین آزمون‌های با نتیجه قابل مشاهده"
            />
          )}
        </Box>
      </Box>

      {p.total > 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                نرخ تکمیل
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.completed.toLocaleString("fa-IR")} از {p.total.toLocaleString("fa-IR")} آزمون
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={p.completionRate}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {p.completionRate.toLocaleString("fa-IR")}٪
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {showCreator && stats.creator && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            فعالیت سازنده
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            آزمون‌ها و گروه‌هایی که ایجاد کرده‌اید.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <ProfileStatCard
              label="آزمون‌های من"
              value={stats.creator.examsTotal}
              icon={<QuizIcon fontSize="small" />}
              color="primary"
            />
            <ProfileStatCard
              label="منتشرشده"
              value={stats.creator.examsPublished}
              icon={<PublishIcon fontSize="small" />}
              color="success"
            />
            <ProfileStatCard
              label="پیش‌نویس"
              value={stats.creator.examsDraft}
              icon={<DraftsIcon fontSize="small" />}
              color="warning"
            />
            <ProfileStatCard
              label="گروه‌ها"
              value={stats.creator.groupsCount}
              icon={<GroupsIcon fontSize="small" />}
              color="secondary"
            />
          </Box>
        </Box>
      )}

      {p.total === 0 && !showCreator && (
        <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5, textAlign: "center" }}>
          <Typography color="text.secondary">
            هنوز در آزمونی ثبت‌نام نکرده‌اید. پس از ثبت‌نام، آمار اینجا نمایش داده می‌شود.
          </Typography>
        </Card>
      )}
    </Stack>
  );
}
