"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChatIcon from '@mui/icons-material/Chat';
import { useExamNotifications, useSendExamNotification } from '@/hooks/useNotifications';
import ParticipantSelector from './ParticipantSelector';
import type { ExamNotificationLog } from '@/services/notifications/NotificationService';

interface ExamNotificationsTabProps {
  examId: number;
  participants: Array<{
    id: number;
    user?: { id: number; name: string; phone_number?: string | null; email?: string | null } | null;
  }>;
  isPublished?: boolean;
}

const NOTIFICATION_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  exam_reminder_1d: { label: 'یادآوری یک روز قبل', icon: <ScheduleIcon fontSize="small" /> },
  exam_reminder_30m: { label: 'یادآوری ۳۰ دقیقه قبل', icon: <ScheduleIcon fontSize="small" /> },
  participant_added: { label: 'افزودن شرکت‌کننده', icon: <PersonAddIcon fontSize="small" /> },
  teacher_custom: { label: 'پیام دستی', icon: <ChatIcon fontSize="small" /> },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ExamNotificationsTab({ examId, participants, isPublished = false }: ExamNotificationsTabProps) {
  const [message, setMessage] = useState('');
  const [recipientSelection, setRecipientSelection] = useState<number[] | 'all'>('all');

  const { data: notifications, isLoading, error } = useExamNotifications(examId);
  const sendMutation = useSendExamNotification(examId);

  const participantOptions = participants
    .filter((p) => p.user)
    .map((p) => ({
      id: p.user!.id,
      name: p.user!.name,
      phone_number: p.user!.phone_number,
      email: p.user!.email,
    }));

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(
      {
        message: message.trim(),
        send_to_all: recipientSelection === 'all',
        recipient_ids: recipientSelection === 'all' ? undefined : recipientSelection,
      },
      {
        onSuccess: () => {
          setMessage('');
          setRecipientSelection('all');
        },
      }
    );
  };

  const getTypeInfo = (type: string) =>
    NOTIFICATION_TYPE_LABELS[type] || { label: type, icon: <NotificationsIcon fontSize="small" /> };

  return (
    <Stack spacing={4}>
      {/* Create notification */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <SendIcon color="primary" />
            <Typography variant="h6">ارسال اعلان</Typography>
          </Stack>
          {!isPublished && (
            <Alert severity="info" sx={{ mb: 2 }}>
              ارسال اعلان فقط برای آزمون‌های منتشر شده امکان‌پذیر است. ابتدا آزمون را منتشر کنید.
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="متن پیام"
              multiline
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="متن اعلان را وارد کنید..."
              fullWidth
              maxRows={6}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                گیرندگان
              </Typography>
              <ParticipantSelector
                participants={participantOptions}
                selectedIds={recipientSelection}
                onSelectionChange={setRecipientSelection}
                disabled={sendMutation.isPending}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={sendMutation.isPending ? <CircularProgress size={16} /> : <SendIcon />}
              onClick={handleSend}
              disabled={!isPublished || !message.trim() || sendMutation.isPending || participantOptions.length === 0}
            >
              {sendMutation.isPending ? 'در حال ارسال...' : 'ارسال اعلان'}
            </Button>
            {sendMutation.isError && (
              <Alert severity="error" onClose={() => sendMutation.reset()}>
                {sendMutation.error instanceof Error ? sendMutation.error.message : 'خطا در ارسال'}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Sent notifications list */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">اعلان‌های ارسال شده</Typography>
          </Stack>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">
              {error instanceof Error ? error.message : 'خطا در بارگذاری'}
            </Alert>
          ) : !notifications || notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              هنوز اعلانی ارسال نشده است
            </Typography>
          ) : (
            <Stack spacing={1}>
              {notifications.map((log: ExamNotificationLog) => {
                const typeInfo = getTypeInfo(log.notification_type);
                return (
                  <Accordion key={log.id} variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <Box sx={{ color: 'text.secondary' }}>{typeInfo.icon}</Box>
                        <Typography variant="body2" fontWeight="medium">
                          {typeInfo.label}
                        </Typography>
                        <Chip
                          label={`${log.recipient_count} نفر`}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(log.sent_at)}
                        </Typography>
                        {log.sent_by && (
                          <Typography variant="caption" color="text.secondary">
                            توسط {log.sent_by.name}
                          </Typography>
                        )}
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      {log.message && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {log.message}
                        </Typography>
                      )}
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        وضعیت خواندن
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>کاربر</TableCell>
                              <TableCell>وضعیت</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {log.recipients.map((r) => {
                              const participant = participants.find((p) => p.user?.id === r.user_id);
                              const name = participant?.user?.name ?? `کاربر ${r.user_id}`;
                              return (
                                <TableRow key={r.user_id}>
                                  <TableCell>{name}</TableCell>
                                  <TableCell>
                                    {r.read_at ? (
                                      <Chip
                                        icon={<CheckCircleIcon />}
                                        label="خوانده شده"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    ) : (
                                      <Chip
                                        label="خوانده نشده"
                                        size="small"
                                        variant="outlined"
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
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
