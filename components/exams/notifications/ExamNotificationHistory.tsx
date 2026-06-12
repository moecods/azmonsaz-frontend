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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import type { ExamNotificationLog } from "@/services/notifications/NotificationService";
import {
  ContentPanel,
  ManageSectionHeader,
} from "@/components/exams/participants/participant-ui-shared";

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
  const getTypeInfo = (type: string) =>
    NOTIFICATION_TYPE_LABELS[type] || {
      label: type,
      icon: <NotificationsIcon fontSize="small" />,
    };

  const count = notifications?.length ?? 0;

  return (
    <Stack spacing={1.5}>
      <ManageSectionHeader
        title="تاریخچه"
        description={
          count > 0
            ? `${count.toLocaleString("fa-IR")} اعلان ارسال‌شده`
            : "هنوز اعلانی ارسال نشده"
        }
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ py: 0.5 }}>
          {error instanceof Error ? error.message : "خطا در بارگذاری"}
        </Alert>
      ) : !notifications || notifications.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          پس از اولین ارسال، تاریخچه اینجا نمایش داده می‌شود.
        </Typography>
      ) : (
        <ContentPanel noPadding>
          {notifications.map((log, index) => {
            const typeInfo = getTypeInfo(log.notification_type);
            const readCount = log.recipients.filter((r) => r.read_at).length;
            return (
              <Accordion
                key={log.id}
                disableGutters
                elevation={0}
                sx={{
                  bgcolor: "transparent",
                  borderTop: index > 0 ? 1 : 0,
                  borderColor: "divider",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon fontSize="small" />}
                  sx={{
                    minHeight: 48,
                    px: { xs: 1.25, sm: 1.5 },
                    py: 0,
                    "& .MuiAccordionSummary-content": { my: 1 },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={0.75}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ width: "100%", pr: 0.5 }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ color: "primary.main", display: "flex" }}>{typeInfo.icon}</Box>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {typeInfo.label}
                      </Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
                      <Chip
                        label={`${log.recipient_count.toLocaleString("fa-IR")} نفر`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                      <Chip
                        label={`${readCount.toLocaleString("fa-IR")} خوانده`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(log.sent_at)}
                      </Typography>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 1.25, sm: 1.5 }, pt: 0, pb: 1.5 }}>
                  {log.message && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.25, lineHeight: 1.7, whiteSpace: "pre-wrap" }}
                    >
                      {log.message}
                    </Typography>
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
                          <TableCell sx={{ py: 0.75, fontWeight: 600 }}>کاربر</TableCell>
                          <TableCell align="center" sx={{ py: 0.75, fontWeight: 600 }}>
                            وضعیت
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {log.recipients.map((r) => {
                          const participant = participants.find((p) => p.user?.id === r.user_id);
                          const name = participant?.user?.name ?? `کاربر ${r.user_id}`;
                          return (
                            <TableRow key={r.user_id}>
                              <TableCell sx={{ py: 0.75 }}>{name}</TableCell>
                              <TableCell align="center" sx={{ py: 0.75 }}>
                                {r.read_at ? (
                                  <Chip
                                    icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                                    label="خوانده"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: "0.7rem" }}
                                  />
                                ) : (
                                  <Chip
                                    label="خوانده نشده"
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: "0.7rem" }}
                                  />
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
        </ContentPanel>
      )}
    </Stack>
  );
}
