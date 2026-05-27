"use client";

import type { ReactNode } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import type { ExamWithParticipants } from "@/services/exams/ExamService";
import { formatExamManageDate } from "@/lib/exam-manage-utils";

interface ExamManageInfoTabProps {
  exam: ExamWithParticipants;
  onGenerateExamLink: () => void;
  isGeneratingLink: boolean;
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        height: "100%",
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} component="div">
        {value}
      </Typography>
    </Box>
  );
}

function LinkCard({
  label,
  href,
  actionLabel = "باز کردن لینک",
}: {
  label: string;
  href: string;
  actionLabel?: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <LinkIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={700}>
          {label}
        </Typography>
      </Stack>
      <Button
        variant="contained"
        size="small"
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        fullWidth
      >
        {actionLabel}
      </Button>
    </Box>
  );
}

export function ExamManageInfoTab({
  exam,
  onGenerateExamLink,
  isGeneratingLink,
}: ExamManageInfoTabProps) {
  return (
    <Stack spacing={2.5}>
      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            جزئیات آزمون
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            <InfoTile label="تعداد سوالات" value={`${exam.questions_count.toLocaleString("fa-IR")} سوال`} />
            {exam.partner && (
              <InfoTile
                label="شریک"
                value={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <BusinessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <span>{exam.partner.name}</span>
                  </Stack>
                }
              />
            )}
            {exam.creator && (
              <InfoTile
                label="ایجادکننده"
                value={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <span>{exam.creator.name}</span>
                  </Stack>
                }
              />
            )}
            <InfoTile label="تاریخ ایجاد" value={formatExamManageDate(exam.created_at)} />
            <InfoTile label="تاریخ انتشار" value={formatExamManageDate(exam.published_at)} />
            {exam.results_released_at && (
              <InfoTile
                label="انتشار نتایج"
                value={formatExamManageDate(exam.results_released_at)}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {exam.type === "online" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {exam.registration_link && (
            <LinkCard label="لینک ثبت‌نام آزمون" href={exam.registration_link} />
          )}

          {exam.status === "published" && (
            <>
              {exam.exam_link ? (
                <LinkCard label="لینک شرکت در آزمون" href={exam.exam_link} />
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: 1,
                    borderColor: "divider",
                    borderStyle: "dashed",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    لینک شرکت در آزمون
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    هنوز لینک تولید نشده است.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={isGeneratingLink}
                    onClick={onGenerateExamLink}
                  >
                    {isGeneratingLink ? "در حال تولید..." : "تولید لینک آزمون"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {exam.type === "online" && exam.status === "draft" && !exam.registration_link && (
        <Typography variant="body2" color="text.secondary">
          پس از انتشار آزمون، لینک‌های ثبت‌نام و شرکت در اینجا نمایش داده می‌شوند.
        </Typography>
      )}
    </Stack>
  );
}
