"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import type { ExamNotificationLog } from "@/services/notifications/NotificationService";
import { SectionCard } from "@/components/exams/participants/participant-ui-shared";

const NOTIFICATION_TYPE_LABELS: Record<string, { label: string; icon: ReactNode }> = {
  exam_reminder_1d: { label: "یادآوری یک روز قبل", icon: <ScheduleIcon fontSize="small" /> },
  exam_reminder_30m: { label: "یادآوری ۳۰ دقیقه قبل", icon: <ScheduleIcon fontSize="small" /> },
  participant_added: { label: "افزودن شرکت‌کننده", icon: <PersonAddIcon fontSize="small" /> },
  teacher_custom: { label: "پیام دستی", icon: <ChatIcon fontSize="small" /> },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ExamNotificationHistoryProps {
  notifications: ExamNotificationLog[] | undefined;
  isLoading: boolean;
  error: Error | null;
  participants: Array<{
    id: number;
    user?: { id: number; name: string } | null;
  }>;
}

export function ExamNotificationHistory({
  notifications,
  isLoading,
  error,
  participants,
}: ExamNotificationHistoryProps) {
  const theme = useTheme();

  const getTypeInfo = (type: string) =>
    NOTIFICATION_TYPE_LABELS[type] || {
      label: type,
      icon: <NotificationsIcon fontSize="small" />,
    };

  return (
    <SectionCard
      title="تاریخچه اعلان‌ها"
      icon={<NotificationsIcon color="primary" fontSize="small" />}
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">
          {error instanceof Error ? error.message : "خطا در بارگذاری"}
        </Alert>
      ) : !notifications || notifications.length === 0 ? (
        <Box textAlign="center" py={5}>
          <NotificationsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            هنوز اعلانی ارسال نشده است.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {notifications.map((log) => {
            const typeInfo = getTypeInfo(log.notification_type);
            const readCount = log.recipients.filter((r) => r.read_at).length;
            return (
              <Accordion
                key={log.id}
                disableGutters
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: "12px !important",
                  "&:before": { display: "none" },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ width: "100%", pr: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                      <Box sx={{ color: "primary.main" }}>{typeInfo.icon}</Box>
                      <Typography variant="body2" fontWeight={700}>
                        {typeInfo.label}
                      </Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      <Chip
                        label={`${log.recipient_count.toLocaleString("fa-IR")} گیرنده`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${readCount.toLocaleString("fa-IR")} خوانده`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(log.sent_at)}
                      </Typography>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 2,
                    pb: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  {log.message && (
                    <Box
                      sx={{
                        p: 1.5,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                        border: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                        {log.message}
                      </Typography>
                    </Box>
                  )}
                  {log.sent_by && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      ارسال‌کننده: {log.sent_by.name}
                    </Typography>
                  )}
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>کاربر</TableCell>
                          <TableCell align="center">وضعیت</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {log.recipients.map((r) => {
                          const participant = participants.find((p) => p.user?.id === r.user_id);
                          const name = participant?.user?.name ?? `کاربر ${r.user_id}`;
                          return (
                            <TableRow key={r.user_id}>
                              <TableCell>{name}</TableCell>
                              <TableCell align="center">
                                {r.read_at ? (
                                  <Chip
                                    icon={<CheckCircleIcon />}
                                    label="خوانده شده"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Chip label="خوانده نشده" size="small" variant="outlined" />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}
    </SectionCard>
  );
}
