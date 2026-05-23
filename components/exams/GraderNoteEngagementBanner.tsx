"use client";

import { Alert, Stack, Typography } from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

export interface GraderNotesSummary {
  total_with_content: number;
  unseen_count: number;
  pending_acknowledgment_count: number;
}

interface GraderNoteEngagementBannerProps {
  summary: GraderNotesSummary | null | undefined;
}

export default function GraderNoteEngagementBanner({ summary }: GraderNoteEngagementBannerProps) {
  if (!summary || summary.total_with_content === 0) {
    return null;
  }

  const { unseen_count, pending_acknowledgment_count } = summary;
  const showEngagementMessage = unseen_count > 0 || pending_acknowledgment_count > 0;

  if (!showEngagementMessage) {
    return null;
  }

  return (
    <Alert severity="info" icon={<RecordVoiceOverIcon />}>
      <Stack spacing={0.5}>
        {unseen_count > 0 && (
          <Typography variant="body2">
            شما{' '}
            <Typography component="span" fontWeight={700}>
              {unseen_count.toLocaleString('fa-IR')}
            </Typography>{' '}
            یادداشت معلم دارید که هنوز ندیده‌اید.
          </Typography>
        )}
        {pending_acknowledgment_count > 0 && (
          <Typography variant="body2">
            <Typography component="span" fontWeight={700}>
              {pending_acknowledgment_count.toLocaleString('fa-IR')}
            </Typography>{' '}
            یادداشت نیاز به تأیید مشاهده دارند — پس از خواندن، دکمه «تأیید کردم» را بزنید.
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          از نوار ثابت پایین صفحه برای رفتن به یادداشت بعدی استفاده کنید.
        </Typography>
      </Stack>
    </Alert>
  );
}
